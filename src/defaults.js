// Shared by the background service worker, the content-script bridge and the popup.
(function (g) {
  'use strict';

  // ------------------------------------------------------------------ fonts
  const FONT_PRESETS = {
    win: [
      'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara',
      'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium',
      'Gabriola', 'Gadugi', 'Georgia', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console',
      'Lucida Sans Unicode', 'Malgun Gothic', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft YaHei',
      'MS Gothic', 'MV Boli', 'Nirmala UI', 'Palatino Linotype', 'Segoe Print', 'Segoe Script', 'Segoe UI',
      'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka Text', 'Sylfaen', 'Symbol', 'Tahoma',
      'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic'
    ],
    mac: [
      'American Typewriter', 'Andale Mono', 'Apple Color Emoji', 'Apple SD Gothic Neo', 'Arial', 'Arial Black',
      'Arial Narrow', 'Avenir', 'Avenir Next', 'Baskerville', 'Big Caslon', 'Chalkboard', 'Cochin', 'Copperplate',
      'Courier', 'Courier New', 'Didot', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica',
      'Helvetica Neue', 'Hiragino Sans', 'Impact', 'Lucida Grande', 'Menlo', 'Monaco', 'Optima', 'Palatino',
      'PingFang SC', 'PingFang TC', 'Rockwell', 'SF Pro', 'Tahoma', 'Times', 'Times New Roman',
      'Trebuchet MS', 'Verdana', 'Zapfino'
    ],
    linux: [
      'Cantarell', 'DejaVu Sans', 'DejaVu Sans Mono', 'DejaVu Serif', 'Droid Sans Fallback', 'FreeMono',
      'FreeSans', 'FreeSerif', 'Liberation Mono', 'Liberation Sans', 'Liberation Serif', 'Noto Color Emoji',
      'Noto Mono', 'Noto Sans', 'Noto Sans CJK SC', 'Noto Serif', 'Noto Serif CJK SC', 'Ubuntu',
      'Ubuntu Mono', 'WenQuanYi Micro Hei'
    ],
    android: [
      'Roboto', 'Roboto Condensed', 'Roboto Mono', 'Noto Sans', 'Noto Serif', 'Droid Sans Mono', 'Cutive Mono',
      'Coming Soon', 'Dancing Script', 'Carrois Gothic SC', 'Noto Color Emoji', 'Noto Sans CJK SC',
      'Droid Sans Fallback'
    ]
  };

  // ---- Font catalog with script/language labels (used by the popup) ----
  const LANG_ORDER = ['latin', 'zh', 'ja', 'ko', 'sym', 'other', 'custom'];
  const FONT_LANGS = {
    zh: [
      'Microsoft YaHei', 'Microsoft YaHei UI', 'Microsoft JhengHei', 'Microsoft JhengHei UI', 'SimSun', 'NSimSun',
      'SimHei', 'KaiTi', 'FangSong', 'LiSu', 'YouYuan', 'DengXian', 'MingLiU', 'PMingLiU',
      'PingFang SC', 'PingFang TC', 'PingFang HK', 'Heiti SC', 'Heiti TC', 'STHeiti', 'STSong', 'STKaiti',
      'STFangsong', 'Songti SC', 'Songti TC', 'Kaiti SC', 'Hiragino Sans GB', 'WenQuanYi Micro Hei',
      'WenQuanYi Zen Hei', 'Noto Sans CJK SC', 'Noto Serif CJK SC', 'Noto Sans SC', 'Noto Serif SC',
      'Source Han Sans SC', 'Source Han Serif SC', 'Droid Sans Fallback'
    ],
    ja: [
      'Yu Gothic', 'Yu Gothic UI', 'Yu Mincho', 'Meiryo', 'Meiryo UI', 'MS Gothic', 'MS PGothic', 'MS Mincho',
      'MS PMincho', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Mincho ProN',
      'Hiragino Maru Gothic ProN', 'Noto Sans CJK JP', 'Noto Sans JP'
    ],
    ko: [
      'Malgun Gothic', 'Malgun Gothic Semilight', 'Gulim', 'Batang', 'Dotum', 'Gungsuh', 'Apple SD Gothic Neo',
      'AppleGothic', 'NanumGothic', 'Noto Sans CJK KR', 'Noto Sans KR'
    ],
    sym: [
      'Segoe UI Emoji', 'Segoe UI Symbol', 'Apple Color Emoji', 'Noto Color Emoji', 'Symbol', 'Webdings',
      'Wingdings', 'Wingdings 2', 'Wingdings 3', 'Segoe MDL2 Assets', 'Segoe Fluent Icons', 'Marlett'
    ],
    other: [
      'Nirmala UI', 'Leelawadee UI', 'Microsoft Himalaya', 'Javanese Text', 'Ebrima', 'Gadugi', 'Sylfaen',
      'MV Boli', 'Mongolian Baiti', 'Myanmar Text', 'Microsoft New Tai Lue', 'Microsoft PhagsPa',
      'Microsoft Tai Le', 'Segoe UI Historic', 'Plantagenet Cherokee', 'Aharoni', 'David', 'Gisha', 'Miriam',
      'Narkisim', 'Rod', 'Arabic Typesetting', 'Traditional Arabic', 'Simplified Arabic', 'Andalus', 'Kokila',
      'Mangal', 'Latha', 'Raavi', 'Shruti', 'Tunga', 'Vrinda', 'Kartika', 'Gautami', 'Iskoola Pota',
      'DaunPenh', 'DokChampa', 'Estrangelo Edessa', 'Euphemia', 'Lao UI', 'Nyala'
    ],
    latin: [
      'Arial Rounded MT Bold', 'Arial Unicode MS', 'Book Antiqua', 'Bookman Old Style', 'Brush Script MT',
      'Calibri Light', 'Cascadia Code', 'Cascadia Mono', 'Century', 'Century Gothic', 'Century Schoolbook',
      'Charter', 'Fira Code', 'Garamond', 'Hoefler Text', 'Iowan Old Style', 'Lucida Bright', 'Lucida Sans',
      'Lucida Handwriting', 'Marker Felt', 'Monotype Corsiva', 'MS Reference Sans Serif', 'Noteworthy',
      'Papyrus', 'Segoe UI Light', 'Segoe UI Semibold', 'Segoe UI Variable', 'Skia', 'Source Code Pro',
      'Tw Cen MT'
    ]
  };

  const FONT_CATALOG = [];
  const fontLangByName = new Map();
  (function buildCatalog() {
    const addAll = (lang, names) => {
      for (const name of names) {
        const key = name.toLowerCase();
        if (fontLangByName.has(key)) continue;
        fontLangByName.set(key, lang);
        FONT_CATALOG.push({ name, lang });
      }
    };
    for (const lang of ['zh', 'ja', 'ko', 'sym', 'other']) addAll(lang, FONT_LANGS[lang]);
    // Everything else in the OS presets is a Latin-script font.
    addAll('latin', [].concat(FONT_PRESETS.win, FONT_PRESETS.mac, FONT_PRESETS.linux, FONT_PRESETS.android, FONT_LANGS.latin));
    FONT_CATALOG.sort((a, b) =>
      LANG_ORDER.indexOf(a.lang) - LANG_ORDER.indexOf(b.lang) || a.name.localeCompare(b.name));
  })();

  // Language/script label of a font name; unknown names are guessed from their characters.
  function fontLang(name) {
    const known = fontLangByName.get(String(name).trim().toLowerCase());
    if (known) return known;
    if (/[\uAC00-\uD7AF]/.test(name)) return 'ko';
    if (/[\u3040-\u30FF]/.test(name)) return 'ja';
    if (/[\u4E00-\u9FFF]/.test(name)) return 'zh';
    return 'custom';
  }

  // ------------------------------------------------------------------ devices
  // Use the real browser's Chrome major version so the spoofed UA is never stale or contradictory.
  const CHROME_MAJOR = (function () {
    try {
      const m = /Chrome\/(\d+)/.exec(g.navigator.userAgent);
      if (m) return m[1];
    } catch (e) { /* ignore */ }
    return '130';
  })();
  const CHROME = CHROME_MAJOR + '.0.0.0';
  const WEBKIT = 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/' + CHROME;

  const DEVICES = {
    win: {
      device: 'win', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' + WEBKIT + ' Safari/537.36',
      platform: 'Win32', uaPlatform: 'Windows', platformVersion: '15.0.0', architecture: 'x86', bitness: '64',
      model: '', mobile: false
    },
    mac: {
      device: 'mac', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ' + WEBKIT + ' Safari/537.36',
      platform: 'MacIntel', uaPlatform: 'macOS', platformVersion: '14.5.0', architecture: 'arm', bitness: '64',
      model: '', mobile: false
    },
    linux: {
      device: 'linux', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) ' + WEBKIT + ' Safari/537.36',
      platform: 'Linux x86_64', uaPlatform: 'Linux', platformVersion: '6.5.0', architecture: 'x86', bitness: '64',
      model: '', mobile: false
    },
    android: {
      device: 'android', userAgent: 'Mozilla/5.0 (Linux; Android 10; K) ' + WEBKIT + ' Mobile Safari/537.36',
      platform: 'Linux armv81', uaPlatform: 'Android', platformVersion: '14.0.0', architecture: '', bitness: '',
      model: 'Pixel 7', mobile: true
    }
  };
  const DEVICE_UA_KEYS = ['device', 'uaPlatform', 'platformVersion', 'architecture', 'bitness', 'model', 'mobile'];

  function inferDevice(platform, userAgent) {
    const ua = String(userAgent || '');
    const s = /android|mac|linux|x11|windows/i.test(ua) ? ua : String(platform || '');
    if (/android/i.test(s)) return 'android';
    if (/mac/i.test(s)) return 'mac';
    if (/linux|x11/i.test(s)) return 'linux';
    return 'win';
  }

  // Brand list used by navigator.userAgentData and the Sec-CH-UA header. The real list keeps its
  // own "grease" entry and ordering; Chromium-family names are normalized to Google Chrome.
  function uaBrands(userAgent, realBrands) {
    const m = /Chrome\/(\d+)/.exec(userAgent || '');
    const major = m ? m[1] : CHROME_MAJOR;
    const out = [];
    const seen = new Set();
    const push = (brand, version) => {
      if (seen.has(brand)) return;
      seen.add(brand);
      out.push({ brand, version });
    };
    try {
      for (const b of Array.from(realBrands || [])) {
        if (/^(Chromium)$/i.test(b.brand)) push('Chromium', major);
        else if (/^(Google Chrome|Microsoft Edge|Opera|Brave|Vivaldi)$/i.test(b.brand)) push('Google Chrome', major);
        else push(b.brand, b.version);
      }
    } catch (e) { /* ignore */ }
    if (!out.length) {
      push('Chromium', major);
      push('Google Chrome', major);
      push('Not.A/Brand', '99');
    }
    if (!seen.has('Chromium')) out.unshift({ brand: 'Chromium', version: major });
    if (!seen.has('Google Chrome')) out.splice(1, 0, { brand: 'Google Chrome', version: major });
    return out;
  }

  // ------------------------------------------------------------------ GPUs
  const hex8 = (h) => '0x' + String(h).toUpperCase().padStart(8, '0');
  const withId = (h) => (h ? ' (' + hex8(h) + ')' : '');

  // WebGL "unmasked" strings as Chrome reports them on each platform.
  const GPU_TEMPLATES = {
    win: {
      nvidia: (n, h) => ({ vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA ' + n + withId(h) + ' Direct3D11 vs_5_0 ps_5_0, D3D11)' }),
      amd: (n, h) => ({ vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD ' + n + withId(h) + ' Direct3D11 vs_5_0 ps_5_0, D3D11)' }),
      intel: (n, h) => ({ vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) ' + n + withId(h) + ' Direct3D11 vs_5_0 ps_5_0, D3D11)' })
    },
    mac: {
      apple: (n) => ({ vendor: 'Google Inc. (Apple)', renderer: 'ANGLE (Apple, ANGLE Metal Renderer: ' + n + ', Unspecified Version)' })
    },
    linux: {
      nvidia: (n) => ({ vendor: 'Google Inc. (NVIDIA Corporation)', renderer: 'ANGLE (NVIDIA Corporation, NVIDIA ' + n + '/PCIe/SSE2, OpenGL 4.5.0)' }),
      amd: (n, code) => ({ vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD ' + n + ' (radeonsi, ' + (code ? code + ', ' : '') + 'LLVM 15.0.7, DRM 3.49, 6.1.0-18-amd64), OpenGL 4.6 (Core Profile) Mesa 22.3.6)' }),
      intel: (n) => ({ vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Mesa Intel(R) ' + n + ', OpenGL 4.6)' })
    },
    android: {
      qualcomm: (n) => ({ vendor: 'Google Inc. (Qualcomm)', renderer: 'ANGLE (Qualcomm, Adreno (TM) ' + n + ', OpenGL ES 3.2)' }),
      arm: (n) => ({ vendor: 'Google Inc. (ARM)', renderer: 'ANGLE (ARM, Mali-' + n + ', OpenGL ES 3.2)' })
    }
  };

  const GROUP_NAME = { nvidia: 'NVIDIA', amd: 'AMD', intel: 'Intel', apple: 'Apple', qualcomm: 'Qualcomm', arm: 'ARM' };

  // [vendorKey, model name as used in the renderer string, PCI device id / codename, note]
  const GPU_DATA = {
    win: [
      ['nvidia', 'GeForce RTX 5090', '2B85'], ['nvidia', 'GeForce RTX 5080', '2C02'],
      ['nvidia', 'GeForce RTX 5070 Ti', '2C05'], ['nvidia', 'GeForce RTX 5070', '2F04'],
      ['nvidia', 'GeForce RTX 4090', '2684'], ['nvidia', 'GeForce RTX 4080', '2704'],
      ['nvidia', 'GeForce RTX 4070 Ti', '2782'], ['nvidia', 'GeForce RTX 4070', '2786'],
      ['nvidia', 'GeForce RTX 4060 Ti', '2803'], ['nvidia', 'GeForce RTX 4060', '2882'],
      ['nvidia', 'GeForce RTX 3090', '2204'], ['nvidia', 'GeForce RTX 3080', '2206'],
      ['nvidia', 'GeForce RTX 3070', '2484'], ['nvidia', 'GeForce RTX 3060 Ti', '2486'],
      ['nvidia', 'GeForce RTX 3060', '2503'], ['nvidia', 'GeForce RTX 2080 Ti', '1E04'],
      ['nvidia', 'GeForce RTX 2070 SUPER', '1E84'], ['nvidia', 'GeForce RTX 2060', '1F08'],
      ['nvidia', 'GeForce GTX 1660 SUPER', '21C4'], ['nvidia', 'GeForce GTX 1650', '1F82'],
      ['nvidia', 'GeForce GTX 1080 Ti', '1B06'], ['nvidia', 'GeForce GTX 1070', '1B81'],
      ['nvidia', 'GeForce GTX 1060 6GB', '1C03'], ['nvidia', 'GeForce GTX 1050 Ti', '1C82'],
      ['amd', 'Radeon RX 7900 XTX', '744C'], ['amd', 'Radeon RX 7800 XT', '747E'],
      ['amd', 'Radeon RX 7600', '7480'], ['amd', 'Radeon RX 6800 XT', '73BF'],
      ['amd', 'Radeon RX 6700 XT', '73DF'], ['amd', 'Radeon RX 6600', '73FF'],
      ['amd', 'Radeon RX 5700 XT', '731F'], ['amd', 'Radeon RX 580 Series', '67DF'],
      ['intel', 'UHD Graphics 770', '4688'], ['intel', 'UHD Graphics 630', '3E92'],
      ['intel', 'UHD Graphics 620', '5917'], ['intel', 'Iris(R) Xe Graphics', '9A49'],
      ['intel', 'Arc(TM) A770 Graphics', '56A0'], ['intel', 'HD Graphics 530', '1912']
    ],
    mac: [
      ['apple', 'Apple M1'], ['apple', 'Apple M1 Pro'], ['apple', 'Apple M1 Max'],
      ['apple', 'Apple M2'], ['apple', 'Apple M2 Pro'], ['apple', 'Apple M2 Max'],
      ['apple', 'Apple M3'], ['apple', 'Apple M3 Pro'], ['apple', 'Apple M3 Max'], ['apple', 'Apple M4']
    ],
    linux: [
      ['nvidia', 'GeForce RTX 4090'], ['nvidia', 'GeForce RTX 4070'], ['nvidia', 'GeForce RTX 3080'],
      ['nvidia', 'GeForce RTX 3060'], ['nvidia', 'GeForce GTX 1660 SUPER'], ['nvidia', 'GeForce GTX 1060 6GB'],
      ['amd', 'Radeon RX 7900 XTX', 'navi31'], ['amd', 'Radeon RX 7800 XT', 'navi32'],
      ['amd', 'Radeon RX 6700 XT', 'navi22'], ['amd', 'Radeon RX 6600', 'navi23'],
      ['amd', 'Radeon RX 580 Series', 'polaris10'],
      ['intel', 'UHD Graphics 630 (CFL GT2)'], ['intel', 'UHD Graphics 620 (KBL GT2)'],
      ['intel', 'Xe Graphics (TGL GT2)'], ['intel', 'Graphics (ADL GT2)']
    ],
    android: [
      ['qualcomm', '750', '', 'Snapdragon 8 Gen 3'], ['qualcomm', '740', '', 'Snapdragon 8 Gen 2'],
      ['qualcomm', '730', '', 'Snapdragon 8 Gen 1'], ['qualcomm', '660', '', 'Snapdragon 888'],
      ['qualcomm', '650', '', 'Snapdragon 865'], ['qualcomm', '619', '', 'Snapdragon 695'],
      ['arm', 'G715', '', 'Tensor G3'], ['arm', 'G710', '', 'Dimensity 9000'],
      ['arm', 'G78', '', 'Exynos 2100'], ['arm', 'G77', '', 'Dimensity 1000'],
      ['arm', 'G610', '', 'Dimensity 8100'], ['arm', 'G57', '', 'Dimensity 700']
    ]
  };

  // Architecture names as reported by WebGPU's adapter.info.architecture (best-effort).
  const GPU_ARCH = [
    ['nvidia', /RTX\s*50\d\d/i, 'blackwell'], ['nvidia', /RTX\s*40\d\d/i, 'ada-lovelace'],
    ['nvidia', /RTX\s*30\d\d/i, 'ampere'], ['nvidia', /RTX\s*20\d\d|GTX\s*16\d\d|Titan RTX/i, 'turing'],
    ['nvidia', /GTX\s*10\d\d|Titan X/i, 'pascal'], ['nvidia', /GTX\s*9\d\d/i, 'maxwell'],
    ['amd', /RX\s*9\d\d\d/i, 'rdna-4'], ['amd', /RX\s*7\d\d\d/i, 'rdna-3'], ['amd', /RX\s*6\d\d\d/i, 'rdna-2'],
    ['amd', /RX\s*5[0-9]{3}/i, 'rdna-1'], ['amd', /RX\s*[45]\d\d\b|Vega/i, 'gcn-5'],
    ['intel', /Arc/i, 'xe-hpg'], ['intel', /Xe|UHD Graphics 7|Graphics \(ADL|TGL/i, 'xe-lp'],
    ['intel', /UHD|HD Graphics|KBL|CFL/i, 'gen-9'],
    ['apple', /M\d/i, 'metal-3'],
    ['qualcomm', /Adreno/i, 'adreno'], ['arm', /Mali/i, 'valhall']
  ];

  function gpuVendorKey(text) {
    const s = String(text || '');
    if (/nvidia|geforce|\brtx\b|\bgtx\b|quadro|titan/i.test(s)) return 'nvidia';
    if (/adreno|qualcomm/i.test(s)) return 'qualcomm';
    if (/mali|\barm\b/i.test(s)) return 'arm';
    if (/\bamd\b|radeon|\brx\s*\d/i.test(s)) return 'amd';
    if (/intel|\buhd\b|iris|\barc\b|hd graphics|mesa intel/i.test(s)) return 'intel';
    if (/apple|\bm[1-9]\b/i.test(s)) return 'apple';
    return '';
  }

  function guessGpu(text) {
    const vendor = gpuVendorKey(text);
    let arch = '';
    for (const [v, re, name] of GPU_ARCH) {
      if (v === vendor && re.test(text)) {
        arch = name;
        break;
      }
    }
    return { vendor, arch };
  }

  const GPUS = {};
  for (const os of Object.keys(GPU_DATA)) {
    GPUS[os] = GPU_DATA[os].map(([key, name, id, note]) => {
      const s = GPU_TEMPLATES[os][key](name, id);
      let label;
      if (key === 'qualcomm') label = 'Qualcomm Adreno ' + name;
      else if (key === 'arm') label = 'ARM Mali-' + name;
      else if (key === 'apple') label = name;
      else if (key === 'intel') label = 'Intel ' + name.replace(/\(R\)|\(TM\)/g, '').replace(/\s+/g, ' ');
      else label = GROUP_NAME[key] + ' ' + name;
      return {
        group: GROUP_NAME[key], label, name, meta: note || '',
        vendor: s.vendor, renderer: s.renderer
      };
    });
  }
  const DEFAULT_GPU = { win: 'GeForce RTX 3060', mac: 'Apple M1', linux: 'UHD Graphics 620 (KBL GT2)', android: '740' };
  const defaultGpu = (device) => GPUS[device].find((x) => x.name === DEFAULT_GPU[device]) || GPUS[device][0];

  function alignPlatform(settings) {
    if (!settings.platformSync || !settings.ua.enabled) return;
    const device = inferDevice(settings.ua.platform, settings.ua.userAgent);
    const profile = DEVICES[device];
    if (settings.ua.device !== device || settings.ua.uaPlatform !== profile.uaPlatform) {
      for (const key of DEVICE_UA_KEYS) settings.ua[key] = profile[key];
    }
    settings.ua.platform = profile.platform;
    const renderer = settings.webgl.renderer;
    const known = Object.values(GPUS).flat().find((gpu) => gpu.renderer === renderer);
    let gpu = GPUS[device].find((entry) => entry.renderer === renderer);
    if (!gpu && known) {
      gpu = GPUS[device].find((entry) => entry.name === known.name);
      const vendor = gpuVendorKey(known.renderer);
      if (!gpu && GPU_TEMPLATES[device][vendor]) {
        gpu = gpuFromText(device, known.name);
      }
      if (!gpu) gpu = defaultGpu(device);
    }
    // Repair explicit backend contradictions in manually entered renderer strings too.
    const incompatible = (device !== 'win' && /Direct3D|D3D\d/i.test(renderer)) ||
      (device !== 'mac' && /Metal Renderer/i.test(renderer)) ||
      (device === 'win' && /radeonsi|Mesa|\/PCIe\/SSE2/i.test(renderer));
    if (!gpu && incompatible) {
      const model = Object.values(GPUS).flat()
        .filter((entry) => renderer.toLowerCase().includes(entry.name.toLowerCase()))
        .sort((a, b) => b.name.length - a.name.length)[0];
      gpu = model && GPUS[device].find((entry) => entry.name === model.name);
      if (!gpu) gpu = defaultGpu(device);
    }
    if (gpu) {
      settings.webgl.vendor = gpu.vendor;
      settings.webgl.renderer = gpu.renderer;
    }
    const guess = guessGpu(settings.webgl.renderer);
    if (guess.vendor) {
      settings.webgl.gpuVendor = guess.vendor;
      settings.webgl.gpuArch = guess.arch;
    }
    settings.webgl.enabled = true;
  }

  // Tidy a free-typed GPU name so it matches how Chrome words it (e.g. "rtx 4060" -> "GeForce RTX 4060").
  function normalizeGpuName(key, text) {
    let n = text.trim().replace(/\s+/g, ' ');
    if (key === 'nvidia') {
      n = n.replace(/^nvidia\s+/i, '');
      if (/^(rtx|gtx|gt)\b/i.test(n)) n = 'GeForce ' + n.toUpperCase().replace(/\bSUPER\b/, 'SUPER').replace(/\bTI\b/, 'Ti');
    } else if (key === 'amd') {
      n = n.replace(/^amd\s+/i, '');
      if (/^rx\b/i.test(n)) n = 'Radeon ' + n.toUpperCase().replace(/\bXT\b/, 'XT');
    } else if (key === 'intel') {
      n = n.replace(/^intel(\(r\))?\s+/i, '');
    } else if (key === 'apple') {
      if (/^m\d/i.test(n)) n = 'Apple ' + n;
    } else if (key === 'qualcomm') {
      n = n.replace(/^(qualcomm\s+)?adreno\s*(\(tm\)\s*)?/i, '');
    } else if (key === 'arm') {
      n = n.replace(/^(arm\s+)?mali[-\s]*/i, '');
    }
    return n;
  }

  // Build WebGL {vendor, renderer} for a GPU name typed by the user, for the given device type.
  function gpuFromText(device, text) {
    text = String(text || '').trim();
    const lc = text.toLowerCase();
    const hit = (GPUS[device] || []).find((x) => x.label.toLowerCase() === lc || x.name.toLowerCase() === lc);
    if (hit) return { vendor: hit.vendor, renderer: hit.renderer };
    if (/^ANGLE\s*\(/i.test(text)) {
      const m = /^ANGLE\s*\(\s*([^,)]+)/i.exec(text);
      return { vendor: 'Google Inc.' + (m ? ' (' + m[1].trim() + ')' : ''), renderer: text };
    }
    const key = gpuVendorKey(text);
    const tpl = GPU_TEMPLATES[device] && GPU_TEMPLATES[device][key];
    if (!tpl) return { vendor: 'Google Inc.', renderer: text };
    return tpl(normalizeGpuName(key, text));
  }

  // ------------------------------------------------------------------ profiles
  const PROFILE_BASE = {
    win: { screen: { width: 1920, height: 1080, colorDepth: 24 }, hardware: { cores: 8, memory: 8, touch: 0 } },
    mac: { screen: { width: 1512, height: 982, colorDepth: 30 }, hardware: { cores: 8, memory: 8, touch: 0 } },
    linux: { screen: { width: 1920, height: 1080, colorDepth: 24 }, hardware: { cores: 8, memory: 8, touch: 0 } },
    android: { screen: { width: 412, height: 915, colorDepth: 24 }, hardware: { cores: 8, memory: 8, touch: 5 } }
  };

  const PROFILES = {};
  for (const key of Object.keys(DEVICES)) {
    const gpu = defaultGpu(key);
    const guess = guessGpu(gpu.renderer);
    PROFILES[key] = {
      fonts: FONT_PRESETS[key],
      screen: PROFILE_BASE[key].screen,
      hardware: PROFILE_BASE[key].hardware,
      ua: Object.assign({}, DEVICES[key]),
      webgl: { vendor: gpu.vendor, renderer: gpu.renderer, gpuVendor: guess.vendor, gpuArch: guess.arch }
    };
  }

  const GMAIL_HOST = 'mail.google.com';
  const DEFAULTS = {
    enabled: true,
    uiLang: 'auto', // 'auto' | 'zh' | 'en'
    excludedHosts: [],
    gmailCompatibility: true,
    platformSync: true,
    seed: 20240501,
    perSiteSeed: false, // derive a different noise seed for every top-level site
    language: { enabled: true, languages: ['en-US', 'en'] },
    timezone: { enabled: true, value: 'America/New_York' },
    geolocation: { enabled: false, latitude: '', longitude: '', accuracy: 1000 },
    fonts: { enabled: true, allowed: FONT_PRESETS.win.slice() },
    screen: Object.assign({ enabled: false }, PROFILES.win.screen),
    hardware: Object.assign({ enabled: false }, PROFILES.win.hardware),
    ua: Object.assign({ enabled: false }, PROFILES.win.ua),
    workers: { enabled: true }, // run the same spoofing inside Web Workers
    canvas: { enabled: true },
    audio: { enabled: true },
    speech: { enabled: true, mode: 'filter' }, // 'filter' | 'fake' | 'hide'
    webgl: Object.assign({ enabled: false }, PROFILES.win.webgl),
    webrtc: { enabled: false }
  };

  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  const clone = (v) => JSON.parse(JSON.stringify(v));

  function normalizeExcludedHost(value) {
    if (typeof value !== 'string') return '';
    const input = value.trim();
    if (!input || /^[/?#]/.test(input) || /[\s\\]/.test(input)) return '';
    try {
      const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(input) ? input : 'https://' + input);
      if ((url.protocol !== 'https:' && url.protocol !== 'http:') || url.username || url.password) return '';
      const host = url.hostname.replace(/\.$/, '');
      if (host.startsWith('[')) return host; // URL has already validated and normalized the IPv6 address.
      if (host.length > 253) return '';
      const validLabel = /^[a-z0-9_](?:[a-z0-9_-]{0,61}[a-z0-9_])?$/;
      return host.split('.').every((label) => validLabel.test(label)) ? host : '';
    } catch (e) {
      return '';
    }
  }

  function isExcludedHost(host, excludedHosts) {
    if (!host) return false;
    host = host.replace(/\.$/, '');
    return excludedHosts.some((domain) => host === domain || host.endsWith('.' + domain));
  }

  function effectiveExcludedHosts(settings) {
    const hosts = settings.excludedHosts;
    if (settings.gmailCompatibility && !hosts.includes(GMAIL_HOST)) return [...hosts, GMAIL_HOST];
    return hosts;
  }

  function fixedPosition(value) {
    if (!value || typeof value.latitude !== 'string' || typeof value.longitude !== 'string' ||
        !value.latitude.trim() || !value.longitude.trim()) return null;
    const latitude = Number(value.latitude);
    const longitude = Number(value.longitude);
    const accuracy = value.accuracy;
    return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180 &&
      Number.isFinite(accuracy) && accuracy >= 1 ? { latitude, longitude, accuracy } : null;
  }

  // Merge saved settings over defaults, keeping only known keys with matching types.
  function merge(saved) {
    const out = clone(DEFAULTS);
    if (!isObj(saved)) return out;
    for (const key of Object.keys(DEFAULTS)) {
      const def = DEFAULTS[key];
      const val = saved[key];
      if (isObj(def)) {
        if (!isObj(val)) continue;
        for (const sub of Object.keys(def)) {
          if (sub in val && typeof val[sub] === typeof def[sub] && Array.isArray(val[sub]) === Array.isArray(def[sub])) {
            out[key][sub] = val[sub];
          }
        }
      } else if (typeof val === typeof def && Array.isArray(val) === Array.isArray(def)) {
        out[key] = val;
      }
    }
    out.excludedHosts = [...new Set(out.excludedHosts.map(normalizeExcludedHost).filter(Boolean))];
    if (!fixedPosition(out.geolocation)) out.geolocation.enabled = false;
    // Keep the spoofed Chrome version equal to the real engine version: a mismatch is detectable.
    out.ua.userAgent = String(out.ua.userAgent).replace(/Chrome\/\d+\.0\.0\.0/, 'Chrome/' + CHROME_MAJOR + '.0.0.0');
    // Settings saved by older versions have no device / GPU metadata: derive it.
    if (!(isObj(saved.ua) && typeof saved.ua.device === 'string')) {
      const d = DEVICES[inferDevice(out.ua.platform, out.ua.userAgent)];
      for (const k of DEVICE_UA_KEYS) out.ua[k] = d[k];
    }
    if (!(isObj(saved.webgl) && typeof saved.webgl.gpuVendor === 'string')) {
      const gg = guessGpu(out.webgl.renderer);
      out.webgl.gpuVendor = gg.vendor;
      out.webgl.gpuArch = gg.arch;
    }
    alignPlatform(out);
    return out;
  }

  const PRESET_FIELDS = [
    'platformSync', 'seed', 'perSiteSeed', 'language', 'timezone', 'geolocation', 'fonts', 'screen',
    'hardware', 'ua', 'workers', 'canvas', 'audio', 'speech', 'webgl', 'webrtc'
  ];

  function capturePreset(settings) {
    const featureSettings = Object.fromEntries(PRESET_FIELDS.map((key) => [key, settings[key]]));
    const normalized = merge(featureSettings);
    return clone(Object.fromEntries(PRESET_FIELDS.map((key) => [key, normalized[key]])));
  }

  function readPresets(value) {
    if (!Array.isArray(value)) return [];
    return value.filter((preset) => typeof preset?.id === 'string' &&
      typeof preset.name === 'string' && isObj(preset.settings));
  }

  g.PH = {
    DEFAULTS, FONT_PRESETS, FONT_CATALOG, LANG_ORDER, DEVICES, PROFILES, GPUS, GMAIL_HOST,
    fontLang, guessGpu, gpuFromText, uaBrands, inferDevice, normalizeExcludedHost, isExcludedHost,
    effectiveExcludedHosts, alignPlatform, merge, clone, capturePreset, readPresets, fixedPosition
  };
})(typeof self !== 'undefined' ? self : this);
