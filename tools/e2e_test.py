"""Headless-Chrome smoke test for the page-level spoofing script and the popup UI.

`--load-extension` is no longer available in recent Chrome builds, so instead of loading the
extension this test serves the sources over HTTP and:
  * loads src/inject.js in a plain page and feeds it a config through the same DOM event that
    bridge.js uses, comparing the result with a control run without the script;
  * renders popup/popup.html against a stub `chrome` API and reports script errors.

Usage: python tools/e2e_test.py [path/to/chrome]
"""
import http.server
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import tempfile
import threading

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
CHROME_CANDIDATES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium',
]

CONFIG_JS = """
const cfg = PH.merge({
  language: { enabled: true, languages: ['zh-CN', 'zh'] },
  timezone: { enabled: true, value: 'Asia/Tokyo' },
  fonts: { enabled: true, allowed: ['Arial'] },
  screen: { enabled: true, width: 1366, height: 768, colorDepth: 24 },
  hardware: { enabled: true, cores: 4, memory: 4, touch: 5 },
  ua: { enabled: true, userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    platform: 'Linux armv81', device: 'android', uaPlatform: 'Android', platformVersion: '14.0.0',
    architecture: '', bitness: '', model: 'Pixel 7', mobile: true },
  webgl: { enabled: true, vendor: 'V', renderer: 'R', gpuVendor: 'nvidia', gpuArch: 'ada-lovelace' },
  speech: { enabled: true, mode: 'fake' }
});
"""

PAGE = """<!doctype html><html><head><meta charset="utf-8"><title>t</title>
<!-- page scripts -->
</head><body><pre id="out">pending</pre>
<script>
const early = { lang: navigator.language, tz: Intl.DateTimeFormat().resolvedOptions().timeZone };
const text = 'mmmmmmmmmmlli WWWW 0123456789';
function width(family) {
  const s = document.createElement('span');
  s.textContent = text;
  s.style.cssText = 'position:absolute;left:-9999px;font-size:72px;font-family:' + family;
  document.body.appendChild(s);
  const w = s.offsetWidth + 'x' + s.getBoundingClientRect().height + '/' + s.clientWidth;
  s.remove();
  return w;
}
function layoutMutations() {
  const s = document.createElement('span');
  s.style.fontFamily = "'Verdana', serif";
  document.body.appendChild(s);
  const obs = new MutationObserver(() => {});
  obs.observe(s, { attributes: true, attributeFilter: ['style'] });
  for (let i = 0; i < 20; i++) {
    s.offsetWidth;
    s.getBoundingClientRect();
  }
  const count = obs.takeRecords().length;
  obs.disconnect();
  s.remove();
  return count;
}
function canvasWidth(font) {
  const c = document.createElement('canvas').getContext('2d');
  c.font = '72px ' + font;
  return Math.round(c.measureText(text).width);
}
function run() {
  const r = { early };
  r.language = navigator.language;
  r.languages = Array.from(navigator.languages);
  r.languagesStable = navigator.languages === navigator.languages;
  r.localCtorIso = new Date(2024, 0, 15, 12, 0, 0).toISOString();
  r.parseIso = new Date('2024-07-01T12:00:00').toISOString();
  r.parseZ = new Date('2024-07-01T12:00:00Z').toISOString();
  r.parseDateOnly = new Date('2024-07-01').toISOString();
  r.parseRfc = new Date('Mon, 01 Jul 2024 12:00:00 GMT').toISOString();
  r.parseUs = new Date('7/1/2024 12:00:00').toISOString();
  const u = new Date(Date.UTC(2024, 6, 1, 12, 0, 0));
  r.hours = u.getHours();
  r.day = u.getDay();
  r.tzo = u.getTimezoneOffset();
  r.toString = u.toString();
  r.toDateString = u.toDateString();
  r.toTimeString = u.toTimeString();
  r.toLocale = u.toLocaleString();
  r.toLocaleDate = u.toLocaleDateString();
  r.dtfTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  r.dtfLocale = Intl.DateTimeFormat().resolvedOptions().locale;
  r.dtfFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(u);
  r.dtfExplicit = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', hour: 'numeric' }).format(u);
  r.numFormat = (1234567.891).toLocaleString();
  r.collator = new Intl.Collator().resolvedOptions().locale;
  const m = new Date(u); m.setHours(5); r.setHours = m.toISOString();
  const m2 = new Date(u); m2.setDate(31); r.setDate = m2.toISOString();
  r.dateInstance = (u instanceof Date) && (u.constructor === Date) && (Date.prototype.constructor === Date);
  r.dateToString = String(Date).slice(0, 30);
  r.dtfToString = String(Intl.DateTimeFormat).slice(0, 30);
  r.getterToString = Function.prototype.toString.call(Object.getOwnPropertyDescriptor(Navigator.prototype, 'language').get);
  r.toStringToString = String(Function.prototype.toString);
  r.dateCall = typeof Date() === 'string';
  r.invalidDate = String(new Date(NaN));
  r.fontBase = width('serif');
  r.fontVerdana = width("'Verdana', serif");
  r.fontArial = width("'Arial', serif");
  r.fontBogus = width("'NoSuchFont123', serif");
  r.layoutMutations = layoutMutations();
  r.canvasBase = canvasWidth('serif');
  r.canvasVerdana = canvasWidth("'Verdana', serif");
  r.canvasArial = canvasWidth("'Arial', serif");
  r.checkVerdana = document.fonts.check("12px 'Verdana'");
  r.checkArial = document.fonts.check("12px 'Arial'");
  const c = document.createElement('canvas'); c.width = 50; c.height = 50;
  const x = c.getContext('2d'); x.fillStyle = '#336699'; x.fillRect(0, 0, 50, 50); x.fillText('hello', 5, 25);
  r.canvasLen = c.toDataURL().length;
  r.canvasHash = c.toDataURL().slice(-40);
  r.canvasStable = c.toDataURL() === c.toDataURL();
  r.canvasSum = (function (s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; })(c.toDataURL());
  const large = document.createElement('canvas');
  large.width = large.height = 1024;
  const largeCtx = large.getContext('2d');
  largeCtx.fillStyle = '#336699';
  largeCtx.fillRect(0, 0, 1024, 1024);
  const expectedPixel = [51, 102, 153, 255];
  r.largeCanvasUnchanged = largeCtx.getImageData(0, 0, 1024, 1024).data.every((v, i) => v === expectedPixel[i % 4]);
  r.screen = [screen.width, screen.height, screen.colorDepth];
  r.hw = [navigator.hardwareConcurrency, navigator.deviceMemory];
  r.ua = [navigator.userAgent, navigator.platform, typeof navigator.userAgentData];
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    r.webgl = [gl.getParameter(ext.UNMASKED_VENDOR_WEBGL), gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)];
  } catch (e) { r.webgl = 'n/a: ' + e.message; }
  try {
    const vs = speechSynthesis.getVoices();
    r.voiceCount = vs.length;
    r.voices = vs.slice(0, 6).map((v) => v.name + '|' + v.lang + '|' + v.default).join('; ');
    if (vs.length) {
      r.voiceIsInstance = vs[0] instanceof SpeechSynthesisVoice;
      r.voiceJson = JSON.stringify(vs[0]);
      const u = new SpeechSynthesisUtterance('x');
      u.voice = vs[0];
      r.uttVoiceKept = u.voice === vs[0];
    }
  } catch (e) { r.voices = 'err ' + e.message; }
  const sum = (a) => { let h = 5381; for (let i = 0; i < a.length; i++) h = ((h << 5) + h + a[i]) | 0; return h; };
  r.touch = navigator.maxTouchPoints;
  try { r.baseLatency = new AudioContext().baseLatency; } catch (e) { r.baseLatency = 'err ' + e.message; }
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    gl.clearColor(0.2, 0.4, 0.6, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const px = new Uint8Array(32 * 32 * 4);
    gl.readPixels(0, 0, 32, 32, gl.RGBA, gl.UNSIGNED_BYTE, px);
    r.glSum = sum(px);
    r.glStable = r.glSum === (function () { const p2 = new Uint8Array(32 * 32 * 4); gl.readPixels(0, 0, 32, 32, gl.RGBA, gl.UNSIGNED_BYTE, p2); return sum(p2); })();
  } catch (e) { r.glSum = 'err ' + e.message; }
  r.glBounds = [];
  for (const kind of ['webgl', 'webgl2']) {
    const surface = document.createElement('canvas');
    surface.width = surface.height = 32;
    const gl = surface.getContext(kind);
    if (!gl) throw Error('Missing test context ' + kind);
    gl.clearColor(0.2, 0.4, 0.6, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const backing = new Uint8Array(256).fill(231);
    const target = backing.subarray(12, 220);
    gl.pixelStorei(gl.PACK_ALIGNMENT, 8);
    const offset = kind === 'webgl2' ? 7 : 0;
    const skipRows = kind === 'webgl2' ? 1 : 0;
    const skipPixels = kind === 'webgl2' ? 1 : 0;
    if (kind === 'webgl2') {
      gl.pixelStorei(gl.PACK_ROW_LENGTH, 6);
      gl.pixelStorei(gl.PACK_SKIP_ROWS, skipRows);
      gl.pixelStorei(gl.PACK_SKIP_PIXELS, skipPixels);
    }
    const stride = kind === 'webgl2' ? 24 : 16;
    const start = 12 + offset + skipRows * stride + skipPixels * 4;
    const args = [0, 0, 3, 2, gl.RGBA, gl.UNSIGNED_BYTE, target];
    if (kind === 'webgl2') args.push(offset);
    gl.readPixels(...args);
    const pixels = new Set();
    for (let row = 0; row < 2; row++) {
      for (let byte = 0; byte < 12; byte++) pixels.add(start + row * stride + byte);
    }
    const outside = backing.every((value, i) => pixels.has(i) || value === 231);
    const success = gl.getError() === gl.NO_ERROR;
    const previous = backing.slice();
    gl.readPixels(...args);
    const stable = backing.every((value, i) => value === previous[i]);
    // An incomplete framebuffer must preserve both destination and the native error.
    gl.bindFramebuffer(gl.FRAMEBUFFER, gl.createFramebuffer());
    gl.readPixels(...args);
    const failedRead = backing.every((value, i) => value === previous[i]);
    const errorPreserved = gl.getError() === gl.INVALID_FRAMEBUFFER_OPERATION;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    const shortBuffer = new Uint8Array(1).fill(127);
    gl.readPixels(0, 0, 3, 2, gl.RGBA, gl.UNSIGNED_BYTE, shortBuffer);
    const shortRead = shortBuffer[0] === 127 && gl.getError() === gl.INVALID_OPERATION;
    gl.readPixels(0, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, target);
    const zeroRead = backing.every((value, i) => value === previous[i]);
    r.glBounds.push({ kind, outside, success, stable, failedRead, errorPreserved, shortRead, zeroRead });
  }
  const done = () => { document.getElementById('out').textContent = JSON.stringify(r); };
  const uad = navigator.userAgentData;
  r.uadJson = uad ? JSON.stringify(uad) : 'none';
  r.uadSame = uad === navigator.userAgentData;
  r.ontouch = 'ontouchstart' in window;
  const stepUad = uad ? uad.getHighEntropyValues(['platformVersion', 'model', 'architecture', 'fullVersionList'])
    .then((v) => { r.uadHigh = JSON.stringify(v); }, (e) => { r.uadHigh = 'err ' + e; }) : Promise.resolve();
  const stepGpu = navigator.gpu ? navigator.gpu.requestAdapter()
    .then((a) => { r.gpuInfo = a ? [a.info.vendor, a.info.architecture, a.info.device, a.info.description].join('|') : 'noadapter'; })
    .catch((e) => { r.gpuInfo = 'err ' + e; }) : Promise.resolve().then(() => { r.gpuInfo = 'nogpu'; });
  const stepOc = new Promise((resolve) => {
    try {
      const oc = new OffscreenCanvas(40, 40);
      const ox = oc.getContext('2d');
      ox.fillStyle = '#336699'; ox.fillRect(0, 0, 40, 40);
      ox.fillStyle = '#ffffff'; ox.fillRect(5, 5, 10, 10);
      r.ocImg = sum(ox.getImageData(0, 0, 40, 40).data);
      oc.convertToBlob().then((b) => b.arrayBuffer()).then((ab) => { r.ocSum = sum(new Uint8Array(ab)); resolve(); }, (e) => { r.ocSum = 'err ' + e; resolve(); });
    } catch (e) { r.ocSum = 'err ' + e.message; resolve(); }
  });
  const ask = (w) => new Promise((res) => {
    const timeout = setTimeout(() => finish('timeout'), 6000);
    const finish = (result) => {
      clearTimeout(timeout);
      w.terminate();
      res(result);
    };
    w.onmessage = (e) => finish(JSON.stringify(e.data));
    w.onerror = (e) => finish('err ' + e.message);
    w.postMessage(null);
  });
  const blobSrc = 'const r = { lang: navigator.language, langs: navigator.languages.join(), ua: navigator.userAgent.slice(0, 30), platform: navigator.platform, hc: navigator.hardwareConcurrency, mem: navigator.deviceMemory, tz: Intl.DateTimeFormat().resolvedOptions().timeZone, tzo: new Date(Date.UTC(2024, 6, 1, 12)).getTimezoneOffset(), mobile: navigator.userAgentData ? navigator.userAgentData.mobile : "none", toStr: String(Function.prototype.toString).slice(0, 30) };' +
    'try { const gl = new OffscreenCanvas(1, 1).getContext("webgl"); const e = gl.getExtension("WEBGL_debug_renderer_info"); r.gl = gl.getParameter(e.UNMASKED_RENDERER_WEBGL); } catch (e) { r.gl = "err " + e.message; }' +
    'postMessage(r);';
  const stepWorkers = (async () => {
    const originalCreate = URL.createObjectURL;
    const originalRevoke = URL.revokeObjectURL;
    const retained = new Set();
    URL.createObjectURL = (blob) => {
      const url = originalCreate.call(URL, blob);
      retained.add(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      retained.delete(url);
      originalRevoke.call(URL, url);
    };
    const url = URL.createObjectURL(new Blob([blobSrc]));
    try {
      const worker = new Worker(url);
      r.wInstance = worker instanceof Worker;
      URL.revokeObjectURL(url);
      r.wBlob = await ask(worker);
    } catch (e) { r.wBlob = 'throw ' + e.message; }
    try { r.wFile = await ask(new Worker('/w.js')); } catch (e) { r.wFile = 'throw ' + e.message; }
    try { r.wModule = await ask(new Worker('/wm.js', { type: 'module' })); } catch (e) { r.wModule = 'throw ' + e.message; }
    r.workerUrlsRetained = retained.size;
    URL.createObjectURL = originalCreate;
    URL.revokeObjectURL = originalRevoke;
  })();
  Promise.all([stepUad, stepGpu, stepOc, stepWorkers]).then(done, done);
}
setTimeout(run, 300);
window.addEventListener('error', (e) => { document.title = 'ERR ' + e.message; });
</script></body></html>"""

STUB = """
window.__errors = [];
window.addEventListener('error', (e) => window.__errors.push(String(e.message)));
window.addEventListener('unhandledrejection', (e) => window.__errors.push('rejection: ' + e.reason));
// With one mocked settings page, keep the preset transaction inside virtual time.
Object.defineProperty(navigator, 'locks', { value: { request: async (name, callback) => callback() } });
const store = {};
const testParams = new URLSearchParams(location.search);
const gmailTest = testParams.has('gmail');
const exclusionsTest = testParams.has('exclusions');
let openedSettings;
const activeUrl = gmailTest ? 'https://mail.google.com/mail/u/0/' :
    exclusionsTest ? location.href : 'https://example.com/page';
if (gmailTest) store.settings = { excludedHosts: ['example.com'] };
if (exclusionsTest) store.settings = { excludedHosts: ['existing.example'] };
let notifyStorage;
window.chrome = {
  privacy: { network: { webRTCIPHandlingPolicy: {
    get: async () => ({ value: 'disable_non_proxied_udp', levelOfControl: 'controlled_by_other_extensions' }),
    onChange: { addListener: () => {} }
  } } },
  storage: { local: {
    get: async () => store,
    set: async (o) => {
      Object.assign(store, o);
      if (o.presets) notifyStorage({ presets: { newValue: o.presets } }, 'local');
    }
  }, onChanged: { addListener: (listener) => { notifyStorage = listener; } } },
  tabs: {
    query: async () => [{ id: 1, url: activeUrl }],
    getCurrent: async () => gmailTest ? undefined : { id: 1 },
    reload: () => {},
    create: ({ url }) => { openedSettings = url; }
  },
  runtime: {
    getURL: (p) => p,
    getManifest: () => ({ version: '2.4.0' }),
    sendMessage: async (message) => {
      if (message.type === 'editPresets') throw Error('No background listener for presets');
      return true;
    }
  }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function popupTest() {
  await sleep(600);
  const q = (s) => document.querySelector(s);
  const qa = (s) => Array.from(document.querySelectorAll(s));
  const goTo = async (id) => {
    q('#settings-nav a[href="#' + id + '"]').click();
    await sleep(30);
    if (q('#' + id).hidden) throw Error('Navigation did not open ' + id);
  };
  if (exclusionsTest) {
    await goTo('sites');
    const input = q('#site-exclusion-input');
    const list = () => qa('#site-exclusion-list button').map((button) => button.dataset.host);
    const add = (value) => {
      input.value = value;
      q('#site-exclusion-form').requestSubmit();
    };
    const open = !q('#site-exclusions').hidden && q('#settings-nav a[aria-current="page"]').hash === '#sites';
    const initial = list();
    add('https://WWW.Example.com:443/messages?q=1');
    await sleep(200);
    const added = store.settings.excludedHosts.slice();
    add('WWW.EXAMPLE.COM.');
    const duplicate = q('#site-exclusion-error').textContent;
    add('*.example.com');
    const invalid = input.getAttribute('aria-invalid') === 'true';
    q('button[data-host="mail.google.com"]').click();
    await sleep(200);
    const gmailReenabled = store.settings.gmailCompatibility === false && !list().includes('mail.google.com');
    q('button[data-host="www.example.com"]').click();
    await sleep(200);
    const saved = store.settings.excludedHosts.slice();
    notifyStorage({ settings: { newValue: { ...store.settings, excludedHosts: [...saved, 'popup.example'] } } }, 'local');
    const report = document.createElement('pre');
    report.id = 'report';
    report.textContent = JSON.stringify({ open, initial, added, duplicate, invalid, gmailReenabled, saved,
      updatedFromPopup: list().includes('popup.example'), errors: window.__errors });
    document.body.appendChild(report);
    return;
  }
  if (gmailTest) {
    const button = q('#btn-exclude');
    const initial = button.textContent;
    button.click();
    await sleep(300);
    const afterEnable = { label: button.textContent, compatibility: store.settings.gmailCompatibility };
    button.click();
    await sleep(300);
    const report = document.createElement('pre');
    report.id = 'report';
    q('[data-open-settings="appearance"]').click();
    const compact = !q('#popup-home').hidden && q('#settings-main').hidden && q('#settings-nav').hidden;
    report.textContent = JSON.stringify({ initial, afterEnable, restored: store.settings.gmailCompatibility, compact, openedSettings,
      savedExclusions: store.settings.excludedHosts, errors: window.__errors });
    document.body.appendChild(report);
    return;
  }
  await goTo('appearance');
  q('input[name="theme"][value="ocean"]').click();
  await sleep(100);
  const themeSaved = store.theme === 'ocean' && document.documentElement.dataset.theme === 'ocean';
  notifyStorage({ theme: { newValue: 'light' } }, 'local');
  const themeSynced = document.documentElement.dataset.theme === 'light' && q('input[name="theme"][value="light"]').checked;
  await goTo('region');
  const out = [];
  out.push({
    errors: window.__errors,
    themeSaved, themeSynced,
    webrtcStatus: q('#webrtc-status').textContent,
    title: q('[data-i18n="language_title"]').textContent,
    langValue: q('[data-key="language.languages"]').value,
    tzValue: q('#tz-input').value,
    tzItems: qa('#tz-list .combo-item').length,
    ver: q('#ver').textContent,
    tiles: qa('.device').map((x) => x.dataset.device + (x.classList.contains('active') ? '*' : '')).join(','),
    gpuInput: q('#gpu-input').value,
    gpuItemsWin: qa('#gpu-list .combo-item').length,
    tzListHidden: q('#tz-list').hidden,
    fontRows: qa('.font-row').length,
    fontChecked: qa('.font-row input:checked').length,
    fontTabs: qa('#font-tabs .tab').map((x) => x.textContent).join('|'),
    badges: qa('.font-row .badge').slice(0, 3).map((x) => x.textContent).join(','),
    siteHost: q('#site-host').textContent,
    hasOffCard: qa('.card.off').length,
    exposedHidden: q('#exposed-warn').hidden,
    exposedText: q('#exposed-warn').textContent,
    speechMode: q('[data-key="speech.mode"]').value,
    speechOptions: qa('[data-key="speech.mode"] option').map((x) => x.textContent).join('|')
  });

  // --- time zone: type, then pick from the list
  const tzIn = q('#tz-input');
  tzIn.focus();
  const opened = !q('#tz-list').hidden;
  tzIn.value = 'asia/tokyo';
  tzIn.dispatchEvent(new Event('input', { bubbles: true }));
  const filtered = qa('#tz-list .combo-item').filter((x) => !x.hidden).map((x) => x.dataset.name);
  await sleep(400);
  const typedSaved = store.settings && store.settings.timezone.value;
  tzIn.value = '+8';
  tzIn.dispatchEvent(new Event('input', { bubbles: true }));
  const offsetSearch = qa('#tz-list .combo-item').filter((x) => !x.hidden).length;
  tzIn.value = '上海';
  tzIn.dispatchEvent(new Event('input', { bubbles: true }));
  const aliasSearch = qa('#tz-list .combo-item').filter((x) => !x.hidden).map((x) => x.dataset.name);
  tzIn.value = 'Not/AZone';
  tzIn.dispatchEvent(new Event('input', { bubbles: true }));
  const invalidShown = !q('#tz-error').hidden;
  q('.combo-item[data-name="Europe/London"]').click();
  await sleep(400);
  out.push({
    opened, filtered: filtered.join(','), typedSaved, offsetSearch, aliasSearch: aliasSearch.join(','),
    invalidShown, pickedInput: tzIn.value, pickedSaved: store.settings.timezone.value,
    listClosed: q('#tz-list').hidden, errorHiddenAfterPick: q('#tz-error').hidden
  });

  const locationForm = q('#location-form');
  locationForm.elements.enabled.checked = true;
  locationForm.requestSubmit();
  const rejectsEmptyLocation = !q('#location-error').hidden && !store.settings.geolocation.enabled;
  const city = q('#location-city');
  city.value = '51.5072,-0.1276';
  city.dispatchEvent(new Event('change', { bubbles: true }));
  // Keyboard selection at the map center should use the city that was just chosen.
  const map = q('#location-map canvas');
  map.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  const mapPointApplied = city.value === '' && locationForm.elements.latitude.value === '51.5072';
  locationForm.requestSubmit();
  await sleep(200);
  out[0].locationSaved = { rejectsEmptyLocation, mapPointApplied, value: store.settings.geolocation };

  // --- fonts: tabs, add custom, uncheck, hide all
  await goTo('device');
  const search = q('#font-search');
  search.value = 'FooFont';
  search.dispatchEvent(new Event('input', { bubbles: true }));
  const addRow = q('.font-add-row') && q('.font-add-row').textContent;
  search.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await sleep(400);
  const customSaved = store.settings.fonts.allowed.includes('FooFont');
  const firstRow = q('.font-row .font-name').textContent;
  const firstBadge = q('.font-row .badge').textContent;
  q('.font-del').click();
  await sleep(400);
  const customRemoved = !store.settings.fonts.allowed.includes('FooFont');
  q('#font-tabs .tab[data-tab="zh"]').click();
  const zhRows = qa('.font-row .badge').map((x) => x.textContent);
  q('[data-fonts="none"]').click();
  await sleep(400);
  const afterNone = store.settings.fonts.allowed.length;
  q('#font-search').value = 'arial';
  q('#font-search').dispatchEvent(new Event('input', { bubbles: true }));
  q('#font-tabs .tab[data-tab="all"]').click();
  const arialRow = q('.font-row input');
  arialRow.checked = true;
  arialRow.dispatchEvent(new Event('change', { bubbles: true }));
  await sleep(400);
  const checkedArial = store.settings.fonts.allowed.join(',');
  q('#btn-font-clear').click();
  await sleep(400);
  out.push({
    addRow, customSaved, firstRow, firstBadge, customRemoved,
    zhRowsAllZh: zhRows.length > 0 && zhRows.every((x) => x === 'Chinese'),
    afterNone, checkedArial, afterClearShown: store.settings.fonts.allowed.join(',')
  });

  // --- UI language and profile
  q('#btn-lang').click();
  q('[data-device="mac"]').click();
  await sleep(500);
  out.push({
    zhTitle: q('[data-i18n="language_title"]').textContent,
    zhTab: q('#font-tabs .tab').textContent,
    zhBadge: q('.font-row .badge').textContent,
    zhExclude: q('#btn-exclude').textContent,
    macFontsChecked: qa('.font-row input:checked').length,
    exposedAfterProfile: q('#exposed-warn').hidden,
    saved: store.settings.excludedHosts,
    savedUiLang: store.settings.uiLang,
    savedPlatform: store.settings.ua.platform,
    errors: window.__errors
  });

  // --- device tiles, GPU combobox, screen preset, UA device select
  q('[data-device="android"]').click();
  await sleep(400);
  const s1 = store.settings;
  const androidState = {
    active: (q('.device.active') || {}).dataset && q('.device.active').dataset.device,
    uaHead: s1.ua.userAgent.slice(0, 40), mobile: s1.ua.mobile, uaPlatform: s1.ua.uaPlatform, platform: s1.ua.platform,
    touch: s1.hardware.touch, screen: s1.screen.width + 'x' + s1.screen.height, preset: q('#screen-preset').value,
    gpuInput: q('#gpu-input').value, gpuVendorKey: s1.webgl.gpuVendor, gpuArch: s1.webgl.gpuArch,
    roboto: s1.fonts.allowed.includes('Roboto'),
    gpuItems: qa('#gpu-list .combo-item').length,
    gpuGroups: qa('#gpu-list .combo-group').map((x) => x.textContent).join(',')
  };
  const gi = q('#gpu-input');
  gi.focus();
  gi.value = 'mali';
  gi.dispatchEvent(new Event('input', { bubbles: true }));
  const maliShown = qa('#gpu-list .combo-item:not(.combo-custom)').filter((x) => !x.hidden).map((x) => x.dataset.label);
  const maliGroupsShown = qa('#gpu-list .combo-group').filter((x) => !x.hidden).map((x) => x.textContent).join(',');
  qa('#gpu-list .combo-item:not(.combo-custom)').filter((x) => !x.hidden)[0].click();
  await sleep(400);
  const afterPick = { renderer: store.settings.webgl.renderer, input: gi.value, gpuVendorKey: store.settings.webgl.gpuVendor, arch: store.settings.webgl.gpuArch };
  q('[data-device="win"]').click();
  await sleep(300);
  gi.focus();
  gi.value = 'rtx 4060';
  gi.dispatchEvent(new Event('input', { bubbles: true }));
  gi.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await sleep(400);
  const typedKnown = { renderer: store.settings.webgl.renderer, input: gi.value };
  gi.focus();
  gi.value = 'NVIDIA GeForce GTX 9999';
  gi.dispatchEvent(new Event('input', { bubbles: true }));
  const customRow = (q('#gpu-list .combo-custom') || {}).textContent;
  gi.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await sleep(400);
  const typedCustom = { renderer: store.settings.webgl.renderer, vendor: store.settings.webgl.vendor, arch: store.settings.webgl.gpuArch };
  const sp = q('#screen-preset');
  sp.value = '1366x768';
  sp.dispatchEvent(new Event('change', { bubbles: true }));
  await sleep(300);
  const presetSaved = store.settings.screen.width + 'x' + store.settings.screen.height;
  gi.value = 'AMD Radeon RX 7900 XTX';
  gi.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  await sleep(300);
  const ud = q('#ua-device');
  ud.value = 'linux';
  ud.dispatchEvent(new Event('change', { bubbles: true }));
  await sleep(300);
  out.push({
    androidState, maliShown: maliShown.join('|'), maliGroupsShown, afterPick, typedKnown, customRow, typedCustom, presetSaved,
    uaLinux: store.settings.ua.userAgent.slice(0, 40), uaLinuxPlatform: store.settings.ua.platform,
    uaLinuxMobile: store.settings.ua.mobile, tilesNow: qa('.device').map((x) => x.dataset.device + (x.classList.contains('active') ? '*' : '')).join(','),
    linuxGpu: { ...store.settings.webgl },
    errors: window.__errors
  });
  const sync = q('[data-key="platformSync"]');
  sync.checked = false;
  sync.dispatchEvent(new Event('change', { bubbles: true }));
  ud.value = 'win';
  ud.dispatchEvent(new Event('change', { bubbles: true }));
  await sleep(300);
  out.push({ independentRenderer: store.settings.webgl.renderer });
  sync.checked = true;
  sync.dispatchEvent(new Event('change', { bubbles: true }));
  await sleep(300);
  out.push({ syncedRenderer: store.settings.webgl.renderer, syncedArch: store.settings.webgl.gpuArch });
  const presetInput = q('#preset-name');
  presetInput.value = 'LA';
  const presetStatus = q('#preset-status');
  await new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!presetStatus.textContent) return;
      observer.disconnect();
      resolve();
    });
    observer.observe(presetStatus, { childList: true });
    q('#preset-form').requestSubmit();
  });
  out[0].presetStored = store.presets?.[0]?.name === 'LA' &&
    q('#preset-list li strong')?.textContent === 'LA' && !presetStatus.classList.contains('is-error');
  out[0].presetStatus = presetStatus.textContent;
  const presetTitles = () => qa('[data-summary="preset"]').map((el) => el.textContent);
  const beforeApplying = presetTitles();
  q('#preset-list [data-action="apply"]').click();
  await sleep(100);
  const afterApplying = presetTitles();
  q('[data-key="hardware.enabled"]').click();
  await sleep(200);
  out[0].presetTitles = { beforeApplying, afterApplying, afterEditing: presetTitles() };

  const el = document.createElement('pre');
  el.id = 'report';
  el.textContent = out.map((o) => JSON.stringify(o)).join('\\n');
  document.body.appendChild(el);
}
popupTest().catch((e) => {
  const el = document.createElement('pre');
  el.id = 'report';
  el.textContent = 'TEST ERROR ' + e + ' ' + e.stack;
  document.body.appendChild(el);
});
"""


class Handler(http.server.BaseHTTPRequestHandler):
    def _send(self, body, ctype):
        if isinstance(body, str):
            body = body.encode()
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path, _, query = self.path.partition('?')
        if path == '/test.html':
            if 'control=1' in query:
                scripts = ''
            else:
                extra = 'cfg.perSiteSeed = true;' if 'persite=1' in query else ''
                if 'disabled=1' in query:
                    extra += ' cfg.enabled = false;'
                scripts = ('<script src="/src/defaults.js"></script>'
                           '<script src="/src/inject.js"></script>'
                           '<script>%s %s document.dispatchEvent(new CustomEvent("__ph_cfg__", '
                           '{ detail: JSON.stringify(cfg) }));</script>' % (CONFIG_JS, extra))
            return self._send(PAGE.replace('<!-- page scripts -->', scripts), 'text/html; charset=utf-8')
        worker_files = {
            '/w.js': "importScripts('w2.js'); var x = new XMLHttpRequest(); x.open('GET', 'w2.js', false); x.send(); postMessage({ rel: self.__w2 === 1, xhr: x.status, lang: navigator.language, hc: navigator.hardwareConcurrency });",
            '/w2.js': 'self.__w2 = 1;',
            '/wm.js': 'onmessage = () => postMessage({ lang: navigator.language, hc: navigator.hardwareConcurrency, tz: Intl.DateTimeFormat().resolvedOptions().timeZone });',
        }
        if path in worker_files:
            return self._send(worker_files[path], 'application/javascript')
        if path == '/stub.js':
            return self._send(STUB, 'application/javascript')
        full = os.path.normpath(os.path.join(ROOT, path.lstrip('/')))
        if not full.startswith(ROOT) or not os.path.isfile(full):
            self.send_response(404)
            self.end_headers()
            return
        with open(full, 'rb') as f:
            data = f.read()
        if path == '/popup/popup.html':
            data = data.replace(b'<script src="../src/defaults.js">', b'<script src="/stub.js"></script><script src="../src/defaults.js">')
        self._send(data, mimetypes.guess_type(full)[0] or 'application/octet-stream')

    def log_message(self, *a):
        pass


def dump(chrome, url):
    profile = tempfile.mkdtemp(prefix='ph-profile-')
    args = [chrome, '--headless=new', '--no-first-run', '--disable-gpu', '--use-gl=angle', '--use-angle=swiftshader',
            '--enable-unsafe-swiftshader', '--user-data-dir=' + profile,
            '--virtual-time-budget=20000', '--dump-dom', url]
    try:
        result = subprocess.run(args, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=30)
        if not result.stdout:
            raise RuntimeError(f'Chrome returned no DOM for {url} (exit {result.returncode}):\n{result.stderr}')
        return result.stdout
    finally:
        shutil.rmtree(profile, ignore_errors=True)


def unescape(s):
    return s.replace('&quot;', '"').replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')


def extract(html, ident):
    m = re.search(r'<pre id="%s">(.*?)</pre>' % ident, html, re.S)
    return unescape(m.group(1)) if m else None


def main():
    chrome = sys.argv[1] if len(sys.argv) > 1 else next((c for c in CHROME_CANDIDATES if os.path.exists(c)), None)
    if not chrome:
        sys.exit('Chrome not found; pass its path as an argument')

    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    port = server.server_address[1]
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d' % port

    try:
        control = extract(dump(chrome, base + '/test.html?control=1'), 'out')
        spoofed_html = dump(chrome, base + '/test.html')
        spoofed = extract(spoofed_html, 'out')
        disabled = extract(dump(chrome, base + '/test.html?disabled=1'), 'out')
        popup = extract(dump(chrome, base + '/popup/popup.html'), 'report')
        gmail_popup = extract(dump(chrome, base + '/popup/popup.html?gmail'), 'report')
        exclusions_page = extract(dump(chrome, base + '/popup/popup.html?exclusions'), 'report')
        alt = base.replace('127.0.0.1', 'localhost')
        seeds = {}
        for label, url in (('off @127.0.0.1', base + '/test.html'),
                           ('off @localhost', alt + '/test.html'),
                           ('per-site @127.0.0.1', base + '/test.html?persite=1'),
                           ('per-site @localhost', alt + '/test.html?persite=1')):
            raw = extract(dump(chrome, url), 'out')
            seeds[label] = json.loads(raw).get('canvasSum') if raw else None
    finally:
        server.shutdown()

    def show(title, raw):
        print('---', title, '---')
        if not raw:
            print('NO OUTPUT')
            return
        for k, v in json.loads(raw).items():
            print('%-16s %s' % (k, v))

    show('control (no script)', control)
    show('with inject.js (zh-CN, Asia/Tokyo, fonts=[Arial])', spoofed)
    if popup is None:
        print('--- popup --- NO OUTPUT')
    else:
        print('--- popup ---')
        print(popup)
    print('--- canvas checksum by mode / host ---')
    for k, v in seeds.items():
        print('%-22s %s' % (k, v))

    native, enabled, off = (json.loads(raw) for raw in (control, spoofed, disabled))
    assert enabled['layoutMutations'] == 0, 'Layout measurements wrote to the page'
    assert enabled['fontVerdana'] == native['fontVerdana'], 'Font filtering changed page layout'
    assert enabled['largeCanvasUnchanged'], 'A large canvas readback was modified'
    for result in native['glBounds'] + enabled['glBounds']:
        assert all(value is True for key, value in result.items() if key != 'kind'), result
    assert enabled['glStable'] and enabled['glSum'] != native['glSum'], 'WebGL noise must be stable and effective'
    assert enabled['canvasSum'] != native['canvasSum'] and enabled['canvasStable']
    assert enabled['wInstance'] and enabled['workerUrlsRetained'] == 0, 'Worker URL leak'
    assert json.loads(enabled['wBlob'])['lang'] == json.loads(native['wBlob'])['lang']
    assert json.loads(enabled['wFile']) == {'rel': True, 'xhr': 200, 'lang': 'zh-CN', 'hc': 4}
    assert json.loads(enabled['wModule']) == json.loads(native['wModule'])
    for key in ('language', 'dtfTz', 'canvasSum', 'toStringToString'):
        assert off[key] == native[key], f'Disabled page returned a modified {key}'
    assert popup and all(not json.loads(line).get('errors') for line in popup.splitlines()), 'Popup errors'
    assert 'Controlled by another extension.' in json.loads(popup.splitlines()[0])['webrtcStatus']
    reports = [json.loads(line) for line in popup.splitlines()]
    assert reports[0]['themeSaved'] and reports[0]['themeSynced'], 'Theme selection did not persist or sync'
    assert reports[0]['locationSaved'] == {
        'rejectsEmptyLocation': True,
        'mapPointApplied': True,
        'value': {'enabled': True, 'latitude': '51.5072', 'longitude': '-0.1276', 'accuracy': 1000},
    }, 'Fixed location setup did not validate or save'
    assert reports[0]['presetStored'], 'Preset could not be saved without a background message listener'
    assert reports[0]['presetTitles'] == {
        'beforeApplying': ['自定义', '自定义'],
        'afterApplying': ['LA', 'LA'],
        'afterEditing': ['自定义', '自定义']
    }, 'Overview and toolbar preset labels diverged from the selected preset'
    linux = next(item for item in reports if 'linuxGpu' in item)
    assert linux['uaLinuxPlatform'] == 'Linux x86_64'
    assert linux['linuxGpu']['enabled'] and linux['linuxGpu']['gpuVendor'] == 'amd'
    assert linux['linuxGpu']['gpuArch'] == 'rdna-3'
    assert 'Radeon RX 7900 XTX' in linux['linuxGpu']['renderer'] and 'radeonsi' in linux['linuxGpu']['renderer']
    assert 'Direct3D' not in linux['linuxGpu']['renderer']
    assert reports[-2]['independentRenderer'] == linux['linuxGpu']['renderer']
    assert 'Direct3D11' in reports[-1]['syncedRenderer'] and 'RX 7900 XTX' in reports[-1]['syncedRenderer']
    assert reports[-1]['syncedArch'] == 'rdna-3'
    assert json.loads(gmail_popup) == {
        'initial': 'Enable fingerprint changes in Gmail',
        'afterEnable': {'label': 'Use Gmail compatibility mode', 'compatibility': False},
        'restored': True, 'savedExclusions': ['example.com'], 'errors': [],
        'compact': True, 'openedSettings': 'popup/popup.html#appearance'
    }, 'Gmail compatibility mode was not applied or saved correctly'
    assert json.loads(exclusions_page) == {
        'open': True, 'initial': ['existing.example', 'mail.google.com'],
        'added': ['existing.example', 'www.example.com'], 'duplicate': 'www.example.com is already on the list.',
        'invalid': True, 'gmailReenabled': True, 'saved': ['existing.example'], 'updatedFromPopup': True, 'errors': []
    }, 'Site exclusion management did not behave as expected'


if __name__ == '__main__':
    main()
