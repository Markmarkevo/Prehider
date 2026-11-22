// Service worker: applies network-level spoofing (headers, WebRTC policy) from the saved settings.
importScripts('defaults.js');

const RULE_LANG = 1;
const RULE_UA = 2;
const RULE_SITE_EXCLUSION = 3;
const ALL_RULES = [RULE_LANG, RULE_UA, RULE_SITE_EXCLUSION];
const RESOURCE_TYPES = [
  'main_frame', 'sub_frame', 'stylesheet', 'script', 'image', 'font', 'object',
  'xmlhttprequest', 'ping', 'csp_report', 'media', 'websocket', 'webtransport', 'webbundle', 'other'
];

// High-entropy client hints are only sent when a site asks for them and cannot be spoofed
// conditionally, so they are dropped (the site then simply gets no answer).
const HIGH_ENTROPY_HINTS = [
  'Sec-CH-UA-Full-Version', 'Sec-CH-UA-Full-Version-List', 'Sec-CH-UA-Platform-Version', 'Sec-CH-UA-Arch',
  'Sec-CH-UA-Bitness', 'Sec-CH-UA-Model', 'Sec-CH-UA-WoW64', 'Sec-CH-UA-Form-Factors'
];

async function loadSettings() {
  const { settings } = await chrome.storage.local.get('settings');
  return PH.merge(settings);
}

// ["zh-CN","zh","en"] -> "zh-CN,zh;q=0.9,en;q=0.8"
function buildAcceptLanguage(langs) {
  return langs
    .filter(Boolean)
    .map((l, i) => (i === 0 ? l : `${l};q=${Math.max(0.1, 1 - i * 0.1).toFixed(1)}`))
    .join(',');
}

function buildRules(s) {
  if (!s.enabled) return [];

  const base = { resourceTypes: RESOURCE_TYPES };
  const excluded = PH.effectiveExcludedHosts(s);
  const rules = [];
  if (excluded.length) {
    base.excludedRequestDomains = excluded;
    base.excludedInitiatorDomains = excluded;
    rules.push({
      id: RULE_SITE_EXCLUSION,
      priority: 2,
      action: { type: 'allowAllRequests' },
      condition: { requestDomains: excluded, resourceTypes: ['main_frame', 'sub_frame'] }
    });
  }

  if (s.language.enabled && s.language.languages.length) {
    rules.push({
      id: RULE_LANG,
      priority: 1,
      action: {
        type: 'modifyHeaders',
        requestHeaders: [{ header: 'Accept-Language', operation: 'set', value: buildAcceptLanguage(s.language.languages) }]
      },
      condition: base
    });
  }
  if (s.ua.enabled && s.ua.userAgent) {
    const real = typeof navigator !== 'undefined' && navigator.userAgentData ? navigator.userAgentData.brands : null;
    const brands = PH.uaBrands(s.ua.userAgent, real).map((b) => `"${b.brand}";v="${b.version}"`).join(', ');
    const headers = [
      { header: 'User-Agent', operation: 'set', value: s.ua.userAgent },
      { header: 'Sec-CH-UA', operation: 'set', value: brands },
      { header: 'Sec-CH-UA-Mobile', operation: 'set', value: s.ua.mobile ? '?1' : '?0' },
      { header: 'Sec-CH-UA-Platform', operation: 'set', value: `"${s.ua.uaPlatform || 'Windows'}"` }
    ];
    for (const h of HIGH_ENTROPY_HINTS) headers.push({ header: h, operation: 'remove' });
    rules.push({
      id: RULE_UA,
      priority: 1,
      action: { type: 'modifyHeaders', requestHeaders: headers },
      condition: base
    });
  }
  return rules;
}

async function applyHeaderRules(s) {
  const dnr = chrome.declarativeNetRequest;
  const rules = buildRules(s);
  try {
    await dnr.updateDynamicRules({ removeRuleIds: ALL_RULES, addRules: rules });
  } catch (e) {
    // A custom header value can be rejected. Apply the site exclusion before retrying headers.
    const exclusions = rules.filter((rule) => rule.id === RULE_SITE_EXCLUSION);
    await dnr.updateDynamicRules({ removeRuleIds: ALL_RULES, addRules: exclusions });
    for (const rule of rules) {
      if (rule.id === RULE_SITE_EXCLUSION) continue;
      try {
        await dnr.updateDynamicRules({ addRules: [rule] });
      } catch (error) {
        console.error('[Prehider] Failed to install header rule', rule.id, error);
      }
    }
  }
}

async function applyWebRTC(s) {
  try {
    const setting = chrome.privacy.network.webRTCIPHandlingPolicy;
    if (s.enabled && s.webrtc.enabled) {
      await setting.set({ value: 'disable_non_proxied_udp' });
    } else {
      await setting.clear({});
    }
  } catch (e) {
    console.warn('[Prehider] WebRTC policy not applied:', e);
  }
}

async function applyBadge(s) {
  await chrome.action.setBadgeText({ text: s.enabled ? '' : 'OFF' });
  await chrome.action.setBadgeBackgroundColor({ color: '#888888' });
}

let applyQueue = Promise.resolve();
function applyAll() {
  const pending = applyQueue.then(async () => {
    const s = await loadSettings();
    await applyHeaderRules(s);
    await applyWebRTC(s);
    await applyBadge(s);
  });
  applyQueue = pending.catch((e) => console.error('[Prehider] Failed to apply settings:', e));
  return pending;
}

chrome.runtime.onInstalled.addListener(async () => {
  const { settings } = await chrome.storage.local.get('settings');
  if (!settings) await chrome.storage.local.set({ settings: PH.clone(PH.DEFAULTS) });
  applyAll();
});

chrome.runtime.onStartup.addListener(applyAll);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.settings) applyAll();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'applySettings') return;
  applyAll().then(() => sendResponse(true), () => sendResponse(false));
  return true;
});
