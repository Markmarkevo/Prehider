// Isolated-world content script: reads settings from chrome.storage and hands them to
// the MAIN-world script (inject.js) through DOM events. Settings are kept live, so changes
// made in the popup take effect on already-open pages without a reload (for future API calls).
(function () {
  'use strict';
  const EVT_CFG = '__ph_cfg__';
  const EVT_REQ = '__ph_req__';
  let last = null;
  let fixedLocation = null;

  // Keep coordinates out of the general settings event. Only a document with a
  // browser grant may receive them, including when scripts request them directly.
  document.addEventListener('__ph_geo_req__', async (event) => {
    const id = event.detail;
    if (!Number.isSafeInteger(id) || !fixedLocation || !isSecureContext) return;
    const policy = document.permissionsPolicy || document.featurePolicy;
    if (!policy?.allowsFeature('geolocation')) return;
    let position = null;
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'granted' && policy.allowsFeature('geolocation')) position = fixedLocation;
    } catch (e) { /* No valid browser grant to share a position. */ }
    document.dispatchEvent(new CustomEvent('__ph_geo_value__', { detail: JSON.stringify({ id, position }) }));
  });

  function isExcluded(hosts) {
    if (!hosts.length) return false;
    if (PH.isExcludedHost(location.hostname, hosts)) return true;
    // Chrome exposes each ancestor's origin, including cross-origin parents.
    const origins = location.ancestorOrigins;
    for (let i = 0; origins && i < origins.length; i++) {
      if (origins[i] !== 'null' && PH.isExcludedHost(new URL(origins[i]).hostname, hosts)) return true;
    }
    return false;
  }

  function send() {
    if (last) document.dispatchEvent(new CustomEvent(EVT_CFG, { detail: last }));
  }

  function push(saved) {
    const s = PH.merge(saved);
    fixedLocation = null;
    if (!s.enabled || isExcluded(PH.effectiveExcludedHosts(s))) {
      last = JSON.stringify({ enabled: false });
      send();
      return;
    }
    const out = Object.assign({}, s);
    if (s.geolocation.enabled) fixedLocation = PH.fixedPosition(s.geolocation);
    out.geolocation = { enabled: !!fixedLocation };
    delete out.excludedHosts;
    delete out.gmailCompatibility;
    // The page world cannot load defaults.js, so hand it the brand list for navigator.userAgentData.
    let realBrands = null;
    try {
      realBrands = navigator.userAgentData ? navigator.userAgentData.brands : null;
    } catch (e) { /* ignore */ }
    out.ua = Object.assign({}, s.ua, { brands: PH.uaBrands(s.ua.userAgent, realBrands) });
    last = JSON.stringify(out);
    send();
  }

  document.addEventListener(EVT_REQ, send);

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.settings) push(changes.settings.newValue);
    });
    chrome.storage.local.get('settings').then((r) => {
      if (last === null) push(r.settings);
    }, () => {
      if (last === null) push({ enabled: false });
    });
  } catch (e) {
    // Extension context invalidated (e.g. extension reloaded); nothing to do.
  }
})();
