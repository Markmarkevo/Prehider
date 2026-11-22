// MAIN-world script. Waits for settings from bridge.js before changing any page APIs.
// The whole file is one function so that the exact same code can also be injected into Web Workers
// (they have their own navigator / Intl / Date that would otherwise reveal the real values).
(function () {
  function prehiderMain(WORKER_CFG) {
  'use strict';

  const IS_WORKER = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;
  const window = self;
  const NavProto = IS_WORKER ? WorkerNavigator.prototype : Navigator.prototype;

  // Real values, captured before anything is patched.
  const REAL_PLATFORM = String(navigator.platform || '');
  const REAL_LANG = String(navigator.language || 'en-US');

  // ---------------------------------------------------------------- config
  let cfg = WORKER_CFG.cfg;
  const active = (key) => !!(cfg.enabled && cfg[key] && cfg[key].enabled);

  // ---------------------------------------------------------------- helpers
  const nativeToString = Function.prototype.toString;
  const fakeSource = new WeakMap();

  const mask = (fake, orig) => {
    try {
      fakeSource.set(fake, nativeToString.call(orig));
    } catch (e) { /* ignore */ }
    return fake;
  };

  const named = (fn, name, length) => {
    try {
      Object.defineProperty(fn, 'name', { value: name, configurable: true });
      if (typeof length === 'number') Object.defineProperty(fn, 'length', { value: length, configurable: true });
    } catch (e) { /* ignore */ }
    return fn;
  };

  const patchedToString = named(function () {
    const s = fakeSource.get(this);
    return s !== undefined ? s : nativeToString.call(this);
  }, 'toString', 0);
  mask(patchedToString, nativeToString);
  Object.defineProperty(Function.prototype, 'toString', {
    value: patchedToString, writable: true, configurable: true, enumerable: false
  });

  const safe = (fn) => {
    try {
      fn();
    } catch (e) { /* a missing API must never break the page */ }
  };

  // Replace an accessor: getter(origGetter, thisValue) -> value
  const defGetter = (obj, prop, getter) => {
    if (!obj) return;
    const d = Object.getOwnPropertyDescriptor(obj, prop);
    if (!d || !d.get) return;
    const orig = d.get;
    const fake = named(function () { return getter(orig, this); }, 'get ' + prop, 0);
    mask(fake, orig);
    Object.defineProperty(obj, prop, { get: fake, set: d.set, enumerable: d.enumerable, configurable: true });
  };

  // Replace a method: wrapper.call(thisValue, origFn, argsArray)
  const defMethod = (obj, prop, wrapper) => {
    if (!obj) return;
    const d = Object.getOwnPropertyDescriptor(obj, prop);
    if (!d || typeof d.value !== 'function') return;
    const orig = d.value;
    const fake = named(function (...args) { return wrapper.call(this, orig, args); }, prop, orig.length);
    mask(fake, orig);
    Object.defineProperty(obj, prop, {
      value: fake, writable: d.writable, enumerable: d.enumerable, configurable: true
    });
  };

  // Replace a global constructor with a Proxy while keeping `X.prototype.constructor === X`.
  const replaceGlobal = (holder, name, proxy, orig) => {
    mask(proxy, orig);
    Object.defineProperty(holder, name, { value: proxy, writable: true, configurable: true, enumerable: false });
    if (orig.prototype) {
      Object.defineProperty(orig.prototype, 'constructor', {
        value: proxy, writable: true, configurable: true, enumerable: false
      });
    }
  };

  const mulberry32 = (a) => () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  // Registrable-domain approximation of the top-level site (no public suffix list available).
  let siteSaltValue = IS_WORKER && WORKER_CFG && Number.isFinite(WORKER_CFG.salt) ? WORKER_CFG.salt : null;
  const topHostname = () => {
    try {
      const ao = location.ancestorOrigins;
      if (ao && ao.length) return new URL(ao[ao.length - 1]).hostname;
    } catch (e) { /* ignore */ }
    try {
      if (window.top !== window) return window.top.location.hostname;
    } catch (e) {
      try {
        if (document.referrer) return new URL(document.referrer).hostname;
      } catch (e2) { /* ignore */ }
    }
    return location.hostname;
  };
  const siteKey = (host) => {
    host = String(host || '').toLowerCase();
    if (!host || /^[\d.]+$/.test(host) || host.includes(':')) return host;
    const labels = host.split('.');
    if (labels.length <= 2) return host;
    const second = labels[labels.length - 2];
    const keep = labels[labels.length - 1].length === 2 && /^(?:co|com|org|net|gov|edu|ac|or|ne|go)$/.test(second) ? 3 : 2;
    return labels.slice(-keep).join('.');
  };
  const siteSalt = () => {
    if (siteSaltValue === null) {
      const key = siteKey(topHostname());
      let h = 0x811C9DC5;
      for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 0x01000193);
      siteSaltValue = h | 0;
    }
    return siteSaltValue;
  };
  const seed = () => {
    const base = cfg && Number.isFinite(cfg.seed) ? cfg.seed : 1;
    return (cfg && cfg.perSiteSeed ? base ^ siteSalt() : base) | 0;
  };

  // ================================================================ LANGUAGE
  const validLocale = (l) => {
    try {
      Intl.getCanonicalLocales(l);
      return typeof l === 'string' && l.length > 0;
    } catch (e) {
      return false;
    }
  };
  const langActive = () => active('language') && cfg.language.languages.length > 0;
  const intlLocale = () => {
    if (!langActive()) return undefined;
    return cfg.language.languages.find(validLocale);
  };

  let langKey = '';
  let langArr = null;
  const languagesArray = () => {
    const key = cfg.language.languages.join('\u0000');
    if (key !== langKey) {
      langKey = key;
      langArr = Object.freeze(cfg.language.languages.slice());
    }
    return langArr;
  };

  safe(() => {
    defGetter(NavProto, 'language', (o, self) => (langActive() ? cfg.language.languages[0] : o.call(self)));
    defGetter(NavProto, 'languages', (o, self) => (langActive() ? languagesArray() : o.call(self)));
  });

  // Fill in a missing locale argument (index `i`) with the spoofed primary locale.
  const withLocale = (args, i) => {
    const loc = intlLocale();
    if (!loc || args[i] !== undefined) return args;
    const a = args.slice();
    a[i] = loc;
    return a;
  };

  // ================================================================ TIMEZONE
  const RealDate = Date;
  const DateProto = RealDate.prototype;
  const RealDTF = Intl.DateTimeFormat;
  const origGetTime = DateProto.getTime;
  const origSetTime = DateProto.setTime;
  const origTZO = DateProto.getTimezoneOffset;
  const origParse = RealDate.parse;

  let fmtTz = null;
  let fmt = null;
  let nameFmt = null;
  const offsetCache = new Map();
  const nameCache = new Map();

  const getFmt = () => {
    const tz = cfg.timezone.value;
    if (tz !== fmtTz) {
      fmtTz = tz;
      offsetCache.clear();
      nameCache.clear();
      try {
        fmt = new RealDTF('en-US', {
          timeZone: tz, hourCycle: 'h23', era: 'short',
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: 'numeric', minute: 'numeric', second: 'numeric'
        });
        nameFmt = new RealDTF('en-US', { timeZone: tz, timeZoneName: 'long' });
      } catch (e) {
        fmt = null;
        nameFmt = null;
      }
    }
    return fmt;
  };
  const tzActive = () => active('timezone') && !!getFmt();

  // Offset (minutes east of UTC) of the spoofed zone at UTC time `t`, or null.
  const tzOffset = (t) => {
    if (!Number.isFinite(t)) return null;
    const key = Math.floor(t / 60000);
    const hit = offsetCache.get(key);
    if (hit !== undefined) return hit;
    let parts;
    try {
      parts = fmt.formatToParts(t);
    } catch (e) {
      return null;
    }
    const o = {};
    for (const p of parts) o[p.type] = p.value;
    let y = +o.year;
    if (o.era === 'BC') y = 1 - y;
    const wall = new RealDate(0);
    wall.setUTCFullYear(y, +o.month - 1, +o.day);
    wall.setUTCHours(+o.hour, +o.minute, +o.second, 0);
    const off = Math.round((origGetTime.call(wall) - Math.floor(t / 1000) * 1000) / 60000);
    if (offsetCache.size > 5000) offsetCache.clear();
    offsetCache.set(key, off);
    return off;
  };

  // Convert a wall-clock time (expressed as if it were UTC) in the spoofed zone to a real UTC timestamp.
  const localToUtc = (wall) => {
    if (!Number.isFinite(wall)) return NaN;
    const off1 = tzOffset(wall);
    if (off1 === null) return wall - origTZO.call(new RealDate(wall)) * 60000;
    const g1 = wall - off1 * 60000;
    const off2 = tzOffset(g1);
    if (off2 === null || off2 === off1) return g1;
    return wall - off2 * 60000;
  };

  const shiftedMs = (d) => {
    const t = origGetTime.call(d);
    const off = tzOffset(t);
    return off === null ? null : t + off * 60000;
  };

  const DATE_ONLY = /^\s*[+-]?\d{4,6}(?:-\d{2}(?:-\d{2})?)?\s*$/;
  const HAS_ZONE = /(?:Z|(?<=:\d{2}(?:\.\d+)?\s*)[+-]\d{2}(?::?\d{2})?|\b(?:GMT|UTC|UT|[ECMP][SD]T)\b)(?:\s*\([^)]*\))?\s*$/i;
  // Parse a date string; zone-less strings are interpreted in the spoofed zone.
  const parseLocal = (str) => {
    const real = origParse.call(RealDate, str);
    if (Number.isNaN(real) || DATE_ONLY.test(str) || HAS_ZONE.test(str)) return real;
    const wall = real - origTZO.call(new RealDate(real)) * 60000;
    return localToUtc(wall);
  };

  safe(() => {
    const GET = {
      getFullYear: 'getUTCFullYear', getMonth: 'getUTCMonth', getDate: 'getUTCDate', getDay: 'getUTCDay',
      getHours: 'getUTCHours', getMinutes: 'getUTCMinutes', getSeconds: 'getUTCSeconds',
      getMilliseconds: 'getUTCMilliseconds'
    };
    for (const name of Object.keys(GET)) {
      const utcFn = DateProto[GET[name]];
      defMethod(DateProto, name, function (o, args) {
        if (tzActive()) {
          const s = shiftedMs(this);
          if (s !== null) return utcFn.call(new RealDate(s));
        }
        return o.apply(this, args);
      });
    }
    defMethod(DateProto, 'getYear', function (o, args) {
      if (tzActive()) {
        const s = shiftedMs(this);
        if (s !== null) return new RealDate(s).getUTCFullYear() - 1900;
      }
      return o.apply(this, args);
    });

    defMethod(DateProto, 'getTimezoneOffset', function (o, args) {
      if (tzActive()) {
        const off = tzOffset(origGetTime.call(this));
        if (off !== null) return off === 0 ? 0 : -off;
      }
      return o.apply(this, args);
    });

    const SET = {
      setFullYear: 'setUTCFullYear', setMonth: 'setUTCMonth', setDate: 'setUTCDate', setHours: 'setUTCHours',
      setMinutes: 'setUTCMinutes', setSeconds: 'setUTCSeconds', setMilliseconds: 'setUTCMilliseconds'
    };
    for (const name of Object.keys(SET)) {
      const utcSet = DateProto[SET[name]];
      defMethod(DateProto, name, function (o, args) {
        if (!tzActive()) return o.apply(this, args);
        const t = origGetTime.call(this);
        let wall;
        if (Number.isNaN(t)) {
          if (name !== 'setFullYear') return NaN;
          wall = 0;
        } else {
          wall = shiftedMs(this);
          if (wall === null) return o.apply(this, args);
        }
        const tmp = new RealDate(wall);
        const r = utcSet.apply(tmp, args);
        return origSetTime.call(this, Number.isNaN(r) ? NaN : localToUtc(r));
      });
    }

    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const pad = (n, l = 2) => String(n).padStart(l, '0');

    const zoneName = (t, off) => {
      const key = off + '|' + cfg.timezone.value;
      let n = nameCache.get(key);
      if (n === undefined) {
        n = '';
        try {
          const p = nameFmt.formatToParts(t).find((x) => x.type === 'timeZoneName');
          if (p) n = p.value;
        } catch (e) { /* ignore */ }
        nameCache.set(key, n);
      }
      return n;
    };

    // mode: 'full' | 'date' | 'time'
    const dateString = (d, mode) => {
      const t = origGetTime.call(d);
      const off = tzOffset(t);
      if (off === null) return null;
      const x = new RealDate(t + off * 60000);
      const Y = x.getUTCFullYear();
      const date = `${DAYS[x.getUTCDay()]} ${MONTHS[x.getUTCMonth()]} ${pad(x.getUTCDate())} ${Y >= 0 ? pad(Y, 4) : '-' + pad(-Y, 6)}`;
      const abs = Math.abs(off);
      const gmt = `GMT${off < 0 ? '-' : '+'}${pad(Math.floor(abs / 60))}${pad(abs % 60)}`;
      const time = `${pad(x.getUTCHours())}:${pad(x.getUTCMinutes())}:${pad(x.getUTCSeconds())} ${gmt} (${zoneName(t, off)})`;
      return mode === 'date' ? date : mode === 'time' ? time : `${date} ${time}`;
    };
    const STR = { toString: 'full', toDateString: 'date', toTimeString: 'time' };
    for (const name of Object.keys(STR)) {
      defMethod(DateProto, name, function (o, args) {
        if (tzActive()) {
          const s = dateString(this, STR[name]);
          if (s !== null) return s;
        }
        return o.apply(this, args);
      });
    }

    for (const name of ['toLocaleString', 'toLocaleDateString', 'toLocaleTimeString']) {
      defMethod(DateProto, name, function (o, args) {
        let a = withLocale(args, 0);
        if (tzActive()) {
          a = a.slice();
          const opt = a[1];
          if (opt === undefined) a[1] = { timeZone: cfg.timezone.value };
          else if (opt && typeof opt === 'object' && opt.timeZone === undefined) {
            a[1] = Object.assign({}, opt, { timeZone: cfg.timezone.value });
          }
        }
        return o.apply(this, a);
      });
    }

    defMethod(RealDate, 'parse', function (o, args) {
      if (tzActive() && typeof args[0] === 'string') return parseLocal(args[0]);
      return o.apply(this, args);
    });

    const DateProxy = new Proxy(RealDate, {
      construct(target, args, newTarget) {
        if (tzActive()) {
          if (args.length >= 2) {
            return Reflect.construct(target, [localToUtc(RealDate.UTC(...args))], newTarget);
          }
          if (args.length === 1 && typeof args[0] === 'string') {
            return Reflect.construct(target, [parseLocal(args[0])], newTarget);
          }
        }
        return Reflect.construct(target, args, newTarget);
      },
      apply(target, thisArg, args) {
        if (tzActive()) return DateProto.toString.call(new RealDate());
        return Reflect.apply(target, thisArg, args);
      }
    });
    replaceGlobal(window, 'Date', DateProxy, RealDate);
  });

  // ================================================================ INTL (locale + default time zone)
  safe(() => {
    const wrapIntl = (name, isDateTimeFormat) => {
      const Orig = Intl[name];
      if (typeof Orig !== 'function') return;
      const fix = (args) => {
        let a = withLocale(args.length ? args : [undefined], 0);
        if (isDateTimeFormat && tzActive()) {
          a = a.slice();
          const opt = a[1];
          if (opt === undefined) a[1] = { timeZone: cfg.timezone.value };
          else if (opt && typeof opt === 'object' && opt.timeZone === undefined) {
            a[1] = Object.assign({}, opt, { timeZone: cfg.timezone.value });
          }
        }
        return a;
      };
      const P = new Proxy(Orig, {
        construct: (t, args, nt) => Reflect.construct(t, fix(args), nt),
        apply: (t, thisArg, args) => Reflect.apply(t, thisArg, fix(args))
      });
      replaceGlobal(Intl, name, P, Orig);
    };
    wrapIntl('DateTimeFormat', true);
    for (const n of ['NumberFormat', 'Collator', 'PluralRules', 'RelativeTimeFormat', 'ListFormat', 'Segmenter']) {
      wrapIntl(n, false);
    }

    defMethod(Number.prototype, 'toLocaleString', function (o, args) { return o.apply(this, withLocale(args, 0)); });
    if (typeof BigInt !== 'undefined') {
      defMethod(BigInt.prototype, 'toLocaleString', function (o, args) { return o.apply(this, withLocale(args, 0)); });
    }
    defMethod(String.prototype, 'localeCompare', function (o, args) { return o.apply(this, withLocale(args, 1)); });
    defMethod(String.prototype, 'toLocaleUpperCase', function (o, args) { return o.apply(this, withLocale(args, 0)); });
    defMethod(String.prototype, 'toLocaleLowerCase', function (o, args) { return o.apply(this, withLocale(args, 0)); });
  });

  // ================================================================ FONTS
  const GENERIC = new Set([
    'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-serif', 'ui-sans-serif',
    'ui-monospace', 'ui-rounded', 'math', 'emoji', 'inherit', 'initial', 'unset', 'revert',
    'revert-layer', '-apple-system', 'blinkmacsystemfont'
  ]);
  // `fangsong` is deliberately NOT generic here: it is also a real Windows font name and the CSS
  // keyword renders with the system's FangSong font, so it must be hidden like any other font.
  const cleanName = (s) => s.trim().replace(/^["']|["']$/g, '').trim().toLowerCase();

  let allowedKey = null;
  let allowedSet = null;
  const allowedFonts = () => {
    const key = cfg.fonts.allowed.join('\u0000');
    if (key !== allowedKey) {
      allowedKey = key;
      allowedSet = new Set(cfg.fonts.allowed.map(cleanName));
    }
    return allowedSet;
  };

  // Families declared by the page via @font-face / FontFace are web fonts and always visible.
  let pageFontSize = -1;
  let pageFontSet = new Set();
  const pageFonts = () => {
    try {
      const fonts = document.fonts;
      if (fonts.size !== pageFontSize) {
        pageFontSize = fonts.size;
        pageFontSet = new Set();
        for (const f of fonts) pageFontSet.add(cleanName(f.family));
      }
    } catch (e) { /* ignore */ }
    return pageFontSet;
  };

  // A quoted name always refers to a real font family, never to a generic keyword.
  const familyAllowed = (token) => {
    const name = cleanName(token);
    const quoted = /^["']/.test(token);
    return (!quoted && GENERIC.has(name)) || allowedFonts().has(name) || pageFonts().has(name);
  };
  const splitFamilies = (str) => String(str).match(/"[^"]*"|'[^']*'|[^,]+/g) || [];

  // Returns a font-family list without hidden fonts, or null when nothing needs to change.
  let filterCache = new Map();
  let filterVersion = '';
  const filterFamilies = (str) => {
    allowedFonts();
    pageFonts();
    const version = allowedKey + '|' + pageFontSize;
    if (version !== filterVersion) {
      filterVersion = version;
      filterCache = new Map();
    }
    if (filterCache.has(str)) return filterCache.get(str);
    const tokens = splitFamilies(str).map((t) => t.trim()).filter(Boolean);
    const kept = tokens.filter((t) => familyAllowed(t));
    let result = null;
    if (kept.length !== tokens.length) {
      if (!kept.length) kept.push('serif');
      result = kept.join(', ');
    }
    if (filterCache.size > 500) filterCache = new Map();
    filterCache.set(str, result);
    return result;
  };

  const FONT_RE = /^(.*?\b\d*\.?\d+(?:px|pt|pc|em|rem|ex|ch|vw|vh|vmin|vmax|cm|mm|in|q|%)(?:\s*\/\s*\S+)?)\s+(.+)$/i;

  safe(() => {
    // Canvas text metrics / rendering
    const withFilteredCtxFont = (ctx, fn) => {
      if (!active('fonts')) return fn();
      let font;
      try {
        font = ctx.font;
      } catch (e) {
        return fn();
      }
      const m = FONT_RE.exec(font);
      const filtered = m ? filterFamilies(m[2]) : null;
      if (filtered === null) return fn();
      ctx.font = m[1] + ' ' + filtered;
      try {
        return fn();
      } finally {
        ctx.font = font;
      }
    };
    for (const C of [window.CanvasRenderingContext2D, window.OffscreenCanvasRenderingContext2D]) {
      if (!C) continue;
      for (const name of ['measureText', 'fillText', 'strokeText']) {
        defMethod(C.prototype, name, function (o, args) {
          return withFilteredCtxFont(this, () => o.apply(this, args));
        });
      }
    }

    // document.fonts.check()
    if (window.FontFaceSet) {
      defMethod(FontFaceSet.prototype, 'check', function (o, args) {
        const r = o.apply(this, args);
        if (!r || !active('fonts')) return r;
        const m = FONT_RE.exec(String(args[0]));
        if (!m) return r;
        return filterFamilies(m[2]) === null;
      });
    }

    // Local Font Access API
    if (typeof window.queryLocalFonts === 'function') {
      defMethod(window, 'queryLocalFonts', function (o, args) {
        const p = o.apply(this, args);
        return p.then((list) => {
          if (!active('fonts')) return list;
          const set = allowedFonts();
          return list.filter((f) => set.has(cleanName(f.family)) || set.has(cleanName(f.fullName)));
        });
      });
    }
  });

  // ================================================================ SCREEN / HARDWARE / UA
  safe(() => {
    const scr = (prop, pick) => defGetter(Screen.prototype, prop, (o, self) => (active('screen') ? pick(cfg.screen) : o.call(self)));
    scr('width', (s) => s.width);
    scr('height', (s) => s.height);
    scr('availWidth', (s) => s.width);
    scr('availHeight', (s) => s.height);
    scr('colorDepth', (s) => s.colorDepth);
    scr('pixelDepth', (s) => s.colorDepth);
  });

  safe(() => {
    defGetter(NavProto, 'hardwareConcurrency', (o, self) => (active('hardware') && cfg.hardware.cores > 0 ? cfg.hardware.cores : o.call(self)));
    defGetter(NavProto, 'deviceMemory', (o, self) => (active('hardware') && cfg.hardware.memory > 0 ? cfg.hardware.memory : o.call(self)));
    defGetter(NavProto, 'maxTouchPoints', (o, self) => (active('hardware') ? Math.max(0, cfg.hardware.touch | 0) : o.call(self)));
  });

  safe(() => {
    const uaOn = () => active('ua') && !!cfg.ua.userAgent;
    defGetter(NavProto, 'userAgent', (o, self) => (uaOn() ? cfg.ua.userAgent : o.call(self)));
    defGetter(NavProto, 'appVersion', (o, self) => (uaOn() ? cfg.ua.userAgent.replace(/^Mozilla\//, '') : o.call(self)));
    defGetter(NavProto, 'platform', (o, self) => (uaOn() && cfg.ua.platform ? cfg.ua.platform : o.call(self)));

    // navigator.userAgentData must agree with the spoofed UA string (brands, mobile, platform).
    if (!window.NavigatorUAData) return;
    const UP = NavigatorUAData.prototype;
    const fakeUAD = Object.create(UP);
    const major = () => {
      const m = /Chrome\/(\d+)/.exec(cfg.ua.userAgent);
      return m ? m[1] : '130';
    };
    const brandList = () => (Array.isArray(cfg.ua.brands) && cfg.ua.brands.length
      ? cfg.ua.brands
      : [{ brand: 'Chromium', version: major() }, { brand: 'Google Chrome', version: major() }, { brand: 'Not.A/Brand', version: '99' }]);
    let brandsKey = '';
    let brandsArr = null;
    const brandsFrozen = () => {
      const key = JSON.stringify(brandList());
      if (key !== brandsKey) {
        brandsKey = key;
        brandsArr = Object.freeze(brandList().map((b) => Object.freeze({ brand: b.brand, version: b.version })));
      }
      return brandsArr;
    };
    const low = () => ({ brands: brandsFrozen().map((b) => ({ brand: b.brand, version: b.version })), mobile: !!cfg.ua.mobile, platform: cfg.ua.uaPlatform || 'Windows' });

    defGetter(UP, 'brands', (o, self) => (self === fakeUAD ? brandsFrozen() : o.call(self)));
    defGetter(UP, 'mobile', (o, self) => (self === fakeUAD ? !!cfg.ua.mobile : o.call(self)));
    defGetter(UP, 'platform', (o, self) => (self === fakeUAD ? (cfg.ua.uaPlatform || 'Windows') : o.call(self)));
    defMethod(UP, 'toJSON', function (o, args) {
      return this === fakeUAD ? low() : o.apply(this, args);
    });
    defMethod(UP, 'getHighEntropyValues', function (o, args) {
      if (this !== fakeUAD) return o.apply(this, args);
      if (!args.length || args[0] == null || typeof args[0][Symbol.iterator] !== 'function') {
        return Promise.reject(new TypeError("Failed to execute 'getHighEntropyValues' on 'NavigatorUAData': The provided value cannot be converted to a sequence."));
      }
      const hints = Array.from(args[0]);
      const res = low();
      const full = () => brandList().map((b) => ({ brand: b.brand, version: b.version + '.0.0.0' }));
      for (const h of hints) {
        if (h === 'architecture') res.architecture = cfg.ua.architecture;
        else if (h === 'bitness') res.bitness = cfg.ua.bitness;
        else if (h === 'model') res.model = cfg.ua.model;
        else if (h === 'platformVersion') res.platformVersion = cfg.ua.platformVersion;
        else if (h === 'uaFullVersion') res.uaFullVersion = major() + '.0.0.0';
        else if (h === 'fullVersionList') res.fullVersionList = full();
        else if (h === 'wow64') res.wow64 = false;
        else if (h === 'formFactors') res.formFactors = cfg.ua.mobile ? ['Mobile'] : ['Desktop'];
      }
      return Promise.resolve(res);
    });
    defGetter(NavProto, 'userAgentData', (o, self) => (uaOn() ? fakeUAD : o.call(self)));
  });

  // Touch-capable devices expose ontouchstart; define it once the config says there is touch.
  const applyTouch = () => {
    if (!active('hardware') || !(cfg.hardware.touch > 0) || 'ontouchstart' in window) return;
    try {
      Object.defineProperty(window, 'ontouchstart', { value: null, writable: true, configurable: true, enumerable: true });
    } catch (e) { /* ignore */ }
  };
  if (!IS_WORKER) applyTouch();

  // ================================================================ GEOLOCATION
  if (!IS_WORKER) safe(() => {
    if (!window.Geolocation) return;
    const geo = Geolocation.prototype;
    const enabled = () => active('geolocation');
    const managedWatches = new Map();
    let requestId = 0;

    function requestFixedPosition() {
      const id = ++requestId;
      return new Promise((resolve) => {
        const timer = setTimeout(() => finish(null), 2500);
        function finish(position) {
          clearTimeout(timer);
          document.removeEventListener('__ph_geo_value__', receive);
          resolve(position);
        }
        function receive(event) {
          try {
            const reply = JSON.parse(event.detail);
            if (reply.id === id) finish(reply.position);
          } catch (e) { /* Ignore unrelated or malformed events. */ }
        }
        document.addEventListener('__ph_geo_value__', receive);
        document.dispatchEvent(new CustomEvent('__ph_geo_req__', { detail: id }));
      });
    }

    function fixedResult({ latitude, longitude, accuracy }, timestamp) {
      const values = { latitude, longitude, accuracy, altitude: null, altitudeAccuracy: null, heading: null, speed: null };
      const coords = { ...values, toJSON: () => ({ ...values }) };
      return { coords, timestamp, toJSON: () => ({ coords: coords.toJSON(), timestamp }) };
    }

    for (const name of ['getCurrentPosition', 'watchPosition']) {
      defMethod(geo, name, function (native, args) {
        if (!enabled() || typeof args[0] !== 'function') return native.apply(this, args);
        const [success, error] = args;
        const isWatch = name === 'watchPosition';
        const token = {};
        let watchId;
        args[0] = (position) => {
          if (isWatch && managedWatches.get(watchId) !== token) return;
          if (!enabled()) {
            success(position);
            return;
          }
          requestFixedPosition().then((fixed) => {
            if (isWatch && managedWatches.get(watchId) !== token) return;
            if (!enabled()) success(position);
            else if (fixed) success(fixedResult(fixed, position.timestamp));
            else if (typeof error === 'function') {
              error({ code: 2, message: 'Fixed location is unavailable.', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
            }
          }).catch((callbackError) => { setTimeout(() => { throw callbackError; }, 0); });
        };
        if (isWatch && (error == null || typeof error === 'function')) {
          args[1] = (reason) => {
            if (reason.code === 1) managedWatches.delete(watchId);
            if (error) error(reason);
          };
        }
        watchId = native.apply(this, args);
        if (isWatch && watchId > 0) managedWatches.set(watchId, token);
        return watchId;
      });
    }

    defMethod(geo, 'clearWatch', function (native, args) {
      if (!managedWatches.size || !args.length) return native.apply(this, args);
      // Use the same signed integer conversion for both the browser and the pending result.
      const id = args[0] | 0;
      const result = native.call(this, id);
      managedWatches.delete(id);
      return result;
    });
  });

  // ================================================================ CANVAS NOISE
  const MAX_CANVAS_BYTES = 1 << 21;
  const noisify = (imageData) => {
    const d = imageData.data;
    if (d.byteLength > MAX_CANVAS_BYTES || !(d instanceof Uint8ClampedArray)) return;
    const rnd = mulberry32(seed() ^ (imageData.width * 73856093) ^ (imageData.height * 19349663));
    for (let i = 0; i < d.length; i += 4) {
      const r = rnd();
      if (d[i + 3] !== 0 && r < 0.08) d[i + ((r * 100) % 3 | 0)] ^= 1;
    }
  };

  safe(() => {
    const ctxProto = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
    const origGetImageData = ctxProto && ctxProto.getImageData;

    if (ctxProto) {
      defMethod(ctxProto, 'getImageData', function (o, args) {
        const img = o.apply(this, args);
        if (active('canvas')) noisify(img);
        return img;
      });
    }

    const origOffscreenGetImageData = window.OffscreenCanvasRenderingContext2D && OffscreenCanvasRenderingContext2D.prototype.getImageData;
    if (origOffscreenGetImageData) {
      defMethod(OffscreenCanvasRenderingContext2D.prototype, 'getImageData', function (o, args) {
        const img = o.apply(this, args);
        if (active('canvas')) noisify(img);
        return img;
      });
    }

    const noisyCopy = (canvas, offscreen) => {
      try {
        const w = canvas.width;
        const h = canvas.height;
        if (!w || !h || w * h * 4 > MAX_CANVAS_BYTES) return null;
        const c = offscreen ? new OffscreenCanvas(w, h) : document.createElement('canvas');
        c.width = w;
        c.height = h;
        const ctx = c.getContext('2d');
        ctx.drawImage(canvas, 0, 0);
        const img = (offscreen ? origOffscreenGetImageData : origGetImageData).call(ctx, 0, 0, w, h);
        noisify(img);
        ctx.putImageData(img, 0, 0);
        return c;
      } catch (e) {
        return null; // e.g. tainted canvas: fall back to the original
      }
    };

    if (window.HTMLCanvasElement) {
      for (const name of ['toDataURL', 'toBlob']) {
        defMethod(HTMLCanvasElement.prototype, name, function (o, args) {
          const copy = active('canvas') ? noisyCopy(this) : null;
          return o.apply(copy || this, args);
        });
      }
    }

    if (window.OffscreenCanvas) {
      defMethod(OffscreenCanvas.prototype, 'convertToBlob', function (o, args) {
        const copy = active('canvas') ? noisyCopy(this, true) : null;
        return o.apply(copy || this, args);
      });
    }
  });

  // WebGL pixel readback is the other classic canvas-fingerprint path (it bypasses toDataURL).
  safe(() => {
    for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!C) continue;
      const getParameter = C.prototype.getParameter;
      defMethod(C.prototype, 'readPixels', function (o, args) {
        const buf = args[6];
        const [x, y, width, height, format, type] = args;
        const offset = args.length > 7 ? args[7] : 0;
        // Limit noise to byte RGBA reads with explicit integer arguments. Let the browser
        // handle other formats, PBO reads and argument conversion without extra side effects.
        if (!active('canvas') || !(buf instanceof Uint8Array) || buf.byteLength > MAX_CANVAS_BYTES ||
            format !== 0x1908 || type !== 0x1401 ||
            ![x, y, width, height, offset].every(Number.isSafeInteger) || width <= 0 || height <= 0 || offset < 0) {
          return o.apply(this, args);
        }
        const webgl2 = C === window.WebGL2RenderingContext;
        const alignment = getParameter.call(this, 0x0D05); // PACK_ALIGNMENT
        const rowLength = webgl2 ? getParameter.call(this, 0x0D02) : 0;
        const skipRows = webgl2 ? getParameter.call(this, 0x0D03) : 0;
        const skipPixels = webgl2 ? getParameter.call(this, 0x0D04) : 0;
        const stride = Math.ceil((rowLength || width) * 4 / alignment) * alignment;
        const start = offset + skipRows * stride + skipPixels * 4;
        const end = start + (height - 1) * stride + width * 4;
        if (!Number.isSafeInteger(end) || end > buf.length || stride < width * 4 || this.isContextLost()) {
          return o.apply(this, args);
        }
        const before = buf.slice(start, end);
        const r = o.apply(this, args);
        // An invalid read leaves the destination intact. Preserve that behavior without
        // consuming the application's WebGL error state via getError().
        const changed = before.some((value, i) => value !== buf[start + i]);
        if (!changed) return r;
        const rnd = mulberry32(seed() ^ Math.imul(width, 73856093) ^ Math.imul(height, 19349663));
        for (let row = 0; row < height; row++) {
          const rowStart = start + row * stride;
          for (let col = 0; col < width; col++) {
            const i = rowStart + col * 4;
            const noise = rnd();
            if (buf[i + 3] !== 0 && noise < 0.08) buf[i + ((noise * 100) % 3 | 0)] ^= 1;
          }
        }
        return r;
      });
    }
  });

  // ================================================================ AUDIO NOISE
  safe(() => {
    const addNoise = (arr, amp) => {
      const rnd = mulberry32(seed() ^ arr.length);
      for (let i = 0; i < arr.length; i++) arr[i] += (rnd() - 0.5) * amp;
    };

    if (window.AudioBuffer) {
      const done = new WeakMap();
      defMethod(AudioBuffer.prototype, 'getChannelData', function (o, args) {
        const data = o.apply(this, args);
        if (active('audio')) {
          let set = done.get(this);
          if (!set) done.set(this, (set = new Set()));
          if (!set.has(args[0])) {
            set.add(args[0]);
            addNoise(data, 2e-7);
          }
        }
        return data;
      });
      defMethod(AudioBuffer.prototype, 'copyFromChannel', function (o, args) {
        const r = o.apply(this, args);
        if (active('audio') && args[0] && args[0].length) addNoise(args[0], 2e-7);
        return r;
      });
    }
    // Audio latency depends on the sound hardware/driver; report one common value instead.
    if (window.AudioContext) {
      defGetter(AudioContext.prototype, 'baseLatency', (o, self) => (active('audio') ? 0.01 : o.call(self)));
      defGetter(AudioContext.prototype, 'outputLatency', (o, self) => (active('audio') ? 0 : o.call(self)));
    }
    if (window.AnalyserNode) {
      for (const name of ['getFloatFrequencyData', 'getFloatTimeDomainData']) {
        defMethod(AnalyserNode.prototype, name, function (o, args) {
          const r = o.apply(this, args);
          if (active('audio') && args[0] && args[0].length) addNoise(args[0], name === 'getFloatFrequencyData' ? 1e-3 : 2e-7);
          return r;
        });
      }
    }
  });

  // ================================================================ SPEECH SYNTHESIS
  // The installed TTS voices reveal the OS language (e.g. Microsoft Huihui = Chinese Windows).
  safe(() => {
    if (!window.SpeechSynthesis || !window.SpeechSynthesisVoice) return;

    const G = 'Google ';
    const VOICE_DB = {
      win: [
        ['en-US', 'Microsoft David - English (United States)'], ['en-US', 'Microsoft Zira - English (United States)'],
        ['en-US', 'Microsoft Mark - English (United States)'],
        ['en-GB', 'Microsoft Hazel - English (Great Britain)'], ['en-GB', 'Microsoft George - English (Great Britain)'],
        ['zh-CN', 'Microsoft Huihui - Chinese (Simplified, PRC)'], ['zh-CN', 'Microsoft Kangkang - Chinese (Simplified, PRC)'],
        ['zh-CN', 'Microsoft Yaoyao - Chinese (Simplified, PRC)'],
        ['zh-TW', 'Microsoft Hanhan - Chinese (Traditional, Taiwan)'], ['zh-TW', 'Microsoft Zhiwei - Chinese (Traditional, Taiwan)'],
        ['ja-JP', 'Microsoft Haruka - Japanese (Japan)'], ['ja-JP', 'Microsoft Ayumi - Japanese (Japan)'],
        ['ko-KR', 'Microsoft Heami - Korean (Korean)'],
        ['de-DE', 'Microsoft Hedda - German (Germany)'], ['de-DE', 'Microsoft Stefan - German (Germany)'],
        ['fr-FR', 'Microsoft Hortense - French (France)'], ['fr-FR', 'Microsoft Paul - French (France)'],
        ['es-ES', 'Microsoft Helena - Spanish (Spain)'], ['es-ES', 'Microsoft Pablo - Spanish (Spain)'],
        ['ru-RU', 'Microsoft Irina - Russian (Russia)'], ['ru-RU', 'Microsoft Pavel - Russian (Russia)'],
        ['pt-BR', 'Microsoft Maria - Portuguese (Brazil)']
      ],
      mac: [
        ['en-US', 'Alex'], ['en-US', 'Fred'], ['en-US', 'Samantha'], ['en-US', 'Victoria'], ['en-GB', 'Daniel'],
        ['zh-CN', 'Tingting'], ['zh-TW', 'Meijia'], ['ja-JP', 'Kyoko'], ['ko-KR', 'Yuna'], ['de-DE', 'Anna'],
        ['fr-FR', 'Thomas'], ['es-ES', 'Monica'], ['ru-RU', 'Milena'], ['pt-BR', 'Luciana']
      ],
      linux: [
        ['en-US', G + 'US English'], ['en-GB', G + 'UK English Female'], ['en-GB', G + 'UK English Male'],
        ['zh-CN', G + '\u666e\u901a\u8bdd\uff08\u4e2d\u56fd\u5927\u9646\uff09'], ['zh-TW', G + '\u570b\u8a9e\uff08\u81fa\u7063\uff09'],
        ['ja-JP', G + '\u65e5\u672c\u8a9e'], ['ko-KR', G + '\ud55c\uad6d\uc758'], ['de-DE', G + 'Deutsch'],
        ['fr-FR', G + 'fran\u00e7ais'], ['es-ES', G + 'espa\u00f1ol'], ['ru-RU', G + '\u0440\u0443\u0441\u0441\u043a\u0438\u0439'],
        ['pt-BR', G + 'portugu\u00eas do Brasil']
      ]
    };
    // Locales every install of that OS ships, regardless of language.
    const BASELINE = { win: ['en-US'], mac: ['en-US'], linux: ['en-US', 'en-GB'] };

    const norm = (l) => String(l).replace(/_/g, '-');
    const baseOf = (l) => norm(l).toLowerCase().split('-')[0];
    const speechLangs = () => (langActive() ? cfg.language.languages : [REAL_LANG]);

    const speechOS = () => {
      const p = active('ua') && cfg.ua.platform ? cfg.ua.platform : REAL_PLATFORM;
      if (/mac|iphone|ipad/i.test(p)) return 'mac';
      if (/linux|x11|android|cros/i.test(p)) return 'linux';
      return 'win';
    };

    const VP = SpeechSynthesisVoice.prototype;
    const fakeData = new WeakMap();
    for (const prop of ['name', 'lang', 'voiceURI', 'localService', 'default']) {
      defGetter(VP, prop, (o, self) => {
        const d = fakeData.get(self);
        return d ? d[prop] : o.call(self);
      });
    }

    const fakeCache = new Map();
    const fakeVoices = () => {
      const os = speechOS();
      const primary = norm(speechLangs()[0] || 'en-US');
      const key = os + '|' + primary;
      let list = fakeCache.get(key);
      if (list) return list;

      const db = VOICE_DB[os];
      let matched = db.filter((e) => e[0].toLowerCase() === primary.toLowerCase());
      if (!matched.length) matched = db.filter((e) => baseOf(e[0]) === baseOf(primary));
      const picked = matched.concat(db.filter((e) => BASELINE[os].includes(e[0])));
      const seen = new Set();
      list = [];
      for (const [lang, name] of picked) {
        if (seen.has(name)) continue;
        seen.add(name);
        const v = Object.create(VP);
        fakeData.set(v, {
          name, lang, voiceURI: name, localService: os !== 'linux', default: list.length === 0
        });
        list.push(v);
      }
      if (fakeCache.size > 20) fakeCache.clear();
      fakeCache.set(key, list);
      return list;
    };

    defMethod(SpeechSynthesis.prototype, 'getVoices', function (o, args) {
      const real = o.apply(this, args);
      if (!active('speech')) return real;
      const mode = cfg.speech.mode;
      if (mode === 'hide') return [];
      if (mode === 'fake') return fakeVoices().slice();
      if (!langActive()) return real;
      const bases = new Set(speechLangs().map(baseOf));
      const kept = real.filter((v) => bases.has(baseOf(v.lang)));
      return kept.length ? kept : fakeVoices().slice();
    });

    // Let pages assign a simulated voice to an utterance without throwing.
    if (window.SpeechSynthesisUtterance) {
      const UP = SpeechSynthesisUtterance.prototype;
      const d = Object.getOwnPropertyDescriptor(UP, 'voice');
      if (d && d.get && d.set) {
        const chosen = new WeakMap();
        const getV = named(function () {
          const f = chosen.get(this);
          return f !== undefined ? f : d.get.call(this);
        }, 'get voice', 0);
        const setV = named(function (v) {
          if (v && fakeData.has(v)) {
            chosen.set(this, v);
            return d.set.call(this, null);
          }
          chosen.delete(this);
          return d.set.call(this, v);
        }, 'set voice', 1);
        mask(getV, d.get);
        mask(setV, d.set);
        Object.defineProperty(UP, 'voice', { get: getV, set: setV, enumerable: d.enumerable, configurable: true });
      }
    }
  });

  // ================================================================ WEBGPU (must agree with WebGL)
  safe(() => {
    if (!window.GPUAdapter) return;
    const AP = GPUAdapter.prototype;
    const cache = new WeakMap();
    const fakeInfo = (real) => {
      if (!real || typeof real !== 'object') return real;
      let p = cache.get(real);
      if (!p) {
        p = new Proxy(real, {
          get(t, prop) {
            if (prop === 'vendor') return cfg.webgl.gpuVendor || '';
            if (prop === 'architecture') return cfg.webgl.gpuArch || '';
            if (prop === 'device' || prop === 'description') return '';
            const v = Reflect.get(t, prop, t);
            return typeof v === 'function' ? v.bind(t) : v;
          }
        });
        cache.set(real, p);
      }
      return p;
    };
    defGetter(AP, 'info', (o, self) => (active('webgl') ? fakeInfo(o.call(self)) : o.call(self)));
    defMethod(AP, 'requestAdapterInfo', function (o, args) {
      const r = o.apply(this, args);
      return active('webgl') ? r.then(fakeInfo) : r;
    });
  });

  // ================================================================ WEBGL
  safe(() => {
    const UNMASKED_VENDOR = 0x9245;
    const UNMASKED_RENDERER = 0x9246;
    for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
      if (!C) continue;
      defMethod(C.prototype, 'getParameter', function (o, args) {
        if (active('webgl')) {
          if (args[0] === UNMASKED_VENDOR && cfg.webgl.vendor) return cfg.webgl.vendor;
          if (args[0] === UNMASKED_RENDERER && cfg.webgl.renderer) return cfg.webgl.renderer;
        }
        return o.apply(this, args);
      });
    }
  });

  // ================================================================ WEB WORKERS
  safe(() => {
    if (IS_WORKER) {
      // Inside a worker the script's own URL is a blob:, so resolve relative URLs against the real one.
      const base = WORKER_CFG && WORKER_CFG.base;
      if (!base) return;
      const toAbs = (u) => {
        try {
          return new URL(String(u), base).href;
        } catch (e) {
          return u;
        }
      };
      const holderOf = (name) => {
        let o = self;
        while (o && !Object.prototype.hasOwnProperty.call(o, name)) o = Object.getPrototypeOf(o);
        return o;
      };
      const hImport = holderOf('importScripts');
      if (hImport) defMethod(hImport, 'importScripts', function (o, args) { return o.apply(this, args.map(toAbs)); });
      const hFetch = holderOf('fetch');
      if (hFetch) {
        defMethod(hFetch, 'fetch', function (o, args) {
          if (typeof args[0] === 'string' || args[0] instanceof URL) {
            args = args.slice();
            args[0] = toAbs(args[0]);
          }
          return o.apply(this, args);
        });
      }
      if (self.XMLHttpRequest) {
        defMethod(XMLHttpRequest.prototype, 'open', function (o, args) {
          if (args.length > 1) {
            args = args.slice();
            args[1] = toAbs(args[1]);
          }
          return o.apply(this, args);
        });
      }
      return;
    }

    if (!window.Worker) return;
    // Source of this whole script (taken before Function.prototype.toString is patched).
    const mainSrc = nativeToString.call(prehiderMain);
    // Returns the arguments for a patched worker, or null to create the worker untouched.
    const wrapArgs = (args) => {
      if (!active('workers')) return null;
      const abs = new URL(String(args[0]), document.baseURI);
      // A page may revoke its own blob URL as soon as the native constructor returns.
      // Loading that URL later from a wrapper would fail.
      if (abs.origin !== location.origin || !/^https?:$/.test(abs.protocol)) return null;
      // Keep native module graph loading and startup message ordering.
      if (args[1]?.type === 'module') return null;

      const payload = JSON.stringify({ cfg, salt: siteSalt(), base: abs.href });
      const patch = '(' + mainSrc + ')(' + payload + ');\n';
      const run = 'importScripts(' + JSON.stringify(abs.href) + ');';
      const out = args.slice();
      out[0] = URL.createObjectURL(new Blob([patch, run], { type: 'text/javascript' }));
      return out;
    };

    const Orig = window.Worker;
    const WorkerProxy = new Proxy(Orig, {
      construct(target, args, newTarget) {
        let wrapped = null;
        try {
          wrapped = wrapArgs(args);
        } catch (e) {
          wrapped = null;
        }
        if (wrapped) {
          try {
            return Reflect.construct(target, wrapped, newTarget);
          } catch (e) {
            // Retry the original URL if the browser rejects the wrapper during construction.
          } finally {
            // Chromium resolves the top-level blob URL during Worker construction.
            URL.revokeObjectURL(wrapped[0]);
          }
        }
        return Reflect.construct(target, args, newTarget);
      },
      apply: (target, thisArg, args) => Reflect.apply(target, thisArg, args)
    });
    replaceGlobal(window, 'Worker', WorkerProxy, Orig);
  });

  return (nextCfg) => {
    cfg = nextCfg;
    applyTouch();
  };
  }

  let updateConfig;
  document.addEventListener('__ph_cfg__', (event) => {
    let cfg;
    try {
      cfg = JSON.parse(event.detail);
    } catch (e) {
      return;
    }
    if (!cfg || typeof cfg.enabled !== 'boolean') return;
    if (updateConfig) updateConfig(cfg);
    else if (cfg.enabled) updateConfig = prehiderMain({ cfg });
  }, true);
  document.dispatchEvent(new Event('__ph_req__'));
})();
