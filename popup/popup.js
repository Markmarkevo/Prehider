(function () {
  'use strict';

  // ------------------------------------------------------------------ i18n
  const I18N = {
    en: {
      master_switch: 'Master switch',
      settings_navigation: 'Settings sections',
      nav_overview: 'Overview',
      nav_device: 'Device',
      nav_region: 'Language & time',
      nav_sites: 'Sites',
      nav_privacy: 'Privacy',
      nav_appearance: 'Appearance',
      overview_desc: 'Your device profile, language, time zone and site rules at a glance.',
      device_desc: 'Choose a preset or adjust the browser, display, graphics and fonts individually.',
      presets_title: 'Custom presets',
      presets_hint: 'Save your current device, language, time zone and privacy settings as a preset. A preset applies across sites, subject to the master switch and site exclusions.',
      preset_switch: 'Custom preset',
      preset_choose: 'Choose a preset',
      preset_name: 'Preset name',
      preset_placeholder: 'e.g. Work or Travel',
      preset_save: 'Save current settings',
      preset_apply: 'Apply',
      preset_update: 'Overwrite',
      preset_delete: 'Delete',
      preset_apply_named: 'Apply {name}',
      preset_update_named: 'Overwrite {name} with current settings',
      preset_delete_named: 'Delete {name}',
      preset_matches: 'Matches current settings',
      preset_empty: 'Your saved presets will appear here.',
      preset_invalid_name: 'Enter a name of up to 60 characters.',
      preset_duplicate: 'That name is already in use.',
      preset_missing: 'This preset has been removed.',
      preset_save_error: 'The browser could not save your preset changes. Please try again.',
      preset_storage_full: 'Extension storage is full. Delete a preset you no longer use and try again.',
      preset_page_expired: 'This settings page has lost its connection to Prehider. Reopen settings from the toolbar and try again.',
      preset_saved: 'Preset saved.',
      preset_updated: 'Preset updated.',
      preset_deleted: 'Preset deleted.',
      preset_update_confirm: 'Overwrite “{name}” with the current settings?',
      preset_delete_confirm: 'Delete “{name}” from your saved presets?',
      region_desc: 'Set the language, time zone and location reported to websites.',
      location_title: 'Fixed location',
      location_hint: 'Sites with location permission receive this position when the browser provides a location. This setting uses the browser’s location service and applies to the Geolocation API. IP-based location depends on your network.',
      location_enable: 'Use fixed location',
      location_city: 'Pick a city',
      location_map_title: 'Choose a fixed location on the map',
      location_map_mode: 'Map type',
      location_map_offline: 'Offline map',
      location_map_online: 'Online street map',
      location_map_privacy: 'OpenFreeMap receives your IP address and map requests that reveal the area and zoom level you view. Selected coordinates are saved locally.',
      location_map_privacy_link: 'OpenFreeMap privacy policy',
      location_map_loading: 'Loading online map…',
      location_map_fallback: 'The online map could not load. Switched back to the offline map.',
      location_map_help: 'Click to pick a point. Drag to move and use + or − to zoom. With the map focused, use the arrow keys and press Enter to pick the center.',
      location_map_zoom_in: 'Zoom in',
      location_map_zoom_out: 'Zoom out',
      location_map_reset: 'Show the whole world',
      location_map_error: 'The map could not load. You can still pick a city or enter coordinates.',
      location_latitude: 'Latitude',
      location_longitude: 'Longitude',
      location_accuracy: 'Accuracy (m)',
      location_los_angeles: 'Los Angeles',
      location_new_york: 'New York',
      location_london: 'London',
      location_singapore: 'Singapore',
      location_shanghai: 'Shanghai',
      location_tokyo: 'Tokyo',
      location_invalid: 'Enter latitude from −90 to 90, longitude from −180 to 180, and an accuracy of at least 1 meter.',
      location_save: 'Save location',
      location_set: 'Fixed location saved in the current configuration',
      location_default: 'Uses the browser’s location by default',
      sites_desc: 'Choose which sites use the original browser values.',
      privacy_desc: 'Manage Canvas and audio noise, Worker settings and WebRTC routing.',
      appearance_desc: 'Choose the theme and language for the toolbar and settings page.',
      label_profile: 'Device profile',
      label_active_preset: 'Current preset',
      label_locale: 'Language',
      label_zone: 'Time zone',
      native_value: 'Browser default',
      protection_on: 'Prehider is on',
      protection_off: 'Prehider is off',
      site_active: 'Prehider is on here',
      site_excluded: 'Excluded from Prehider',
      edit_device: 'Edit device settings',
      site_count: '{count} excluded',
      theme_title: 'Theme',
      theme_system: 'Follow system',
      theme_light: 'Light',
      theme_dark: 'Dark',
      theme_ocean: 'Ocean',
      theme_save_error: 'Could not save the theme.',
      interface_language: 'Interface language',
      restore_defaults: 'Defaults',
      current_site: 'Current site',
      site_exclusions_title: 'Site exclusions',
      site_exclusions_hint: 'Prehider leaves page fingerprints and request headers alone on these domains and their subdomains. Reload affected pages after saving. WebRTC protection is browser-wide.',
      site_exclusion_label: 'Domain or website URL',
      site_exclusion_add: 'Add site',
      site_exclusion_remove: 'Remove',
      site_exclusion_remove_label: 'Remove {host} from site exclusions',
      site_exclusion_invalid: 'Enter a valid domain or HTTP(S) URL.',
      site_exclusion_exists: '{host} is already on the list.',
      site_exclusions_empty: 'No sites excluded.',
      exclude_site: 'Disable on this site',
      include_site: 'Enable on this site',
      enable_gmail_compatibility: 'Use Gmail compatibility mode',
      disable_gmail_compatibility: 'Enable fingerprint changes in Gmail',
      excluded_by_parent: 'Disabled by a parent domain rule',
      save_error: 'Could not apply the settings. Try again.',
      reload_tab: 'Reload tab',
      device_title: 'Device type',
      dev_desktop: 'Desktop',
      dev_phone: 'Phone',
      profile_hint: 'Pick a device to fill fonts, screen, hardware, User-Agent and GPU with one consistent set of values and enable those features. You can fine-tune every item below.',
      exposed_warn: 'Still REAL (not spoofed): {list}. Websites can use them to recognize you even when everything else is changed. Pick a device above to fill and enable them.',
      language_title: 'Language',
      language_hint: 'Changes navigator.language(s), the Accept-Language header, and the default locale used by Intl and toLocaleString.',
      language_quick: 'Quick pick',
      language_list: 'Languages (comma separated, first is primary)',
      custom: 'Custom',
      timezone_title: 'Time zone',
      timezone_hint: 'Changes Date (offset, getters, toString) and the default time zone of Intl.DateTimeFormat. Type it directly, or open the list and pick one.',
      timezone_value: 'IANA time zone',
      timezone_invalid: 'Unknown time zone, not saved. Pick one from the list or fix the name.',
      tz_placeholder: 'Type or pick, e.g. Asia/Shanghai',
      tz_toggle: 'Show list',
      tz_no_match: 'No matching time zone',
      fonts_title: 'Installed fonts',
      fonts_hint: 'Filters local fonts in Canvas, document.fonts.check and queryLocalFonts. Page layout uses the browser’s original fonts. Checked fonts must be installed on this computer.',
      fonts_none: 'Hide all',
      font_search_ph: 'Search fonts, or type a name and press Enter to add',
      font_select_shown: 'Check shown',
      font_clear_shown: 'Uncheck shown',
      font_count: '{n} visible to websites',
      font_add_one: '+ Add "{name}" as a custom font',
      font_add_many: '+ Add {n} custom fonts',
      font_remove: 'Remove',
      font_empty: 'No fonts to show',
      tab_all: 'All',
      tab_selected: 'Checked',
      lang_latin: 'Latin',
      lang_zh: 'Chinese',
      lang_ja: 'Japanese',
      lang_ko: 'Korean',
      lang_sym: 'Symbols',
      lang_other: 'Other scripts',
      lang_custom: 'Uncategorized',
      screen_title: 'Screen',
      screen_hint: 'Changes screen.width / height / availWidth / availHeight / colorDepth / pixelDepth.',
      screen_preset: 'Resolution preset',
      preset_custom: 'Custom (use the fields below)',
      grp_desktop: 'Desktop',
      grp_laptop: 'Laptop',
      grp_phone: 'Phone',
      width: 'Width',
      height: 'Height',
      color_depth: 'Color depth',
      hardware_title: 'Hardware',
      hardware_hint: 'Changes navigator.hardwareConcurrency, navigator.deviceMemory and navigator.maxTouchPoints. Type a value or pick one from the dropdown.',
      cores: 'CPU cores',
      memory: 'Memory (GB)',
      touch: 'Touch points',
      ua_title: 'User-Agent & platform',
      ua_hint: 'Changes the User-Agent and Sec-CH-UA headers, navigator.userAgent / appVersion / platform and a matching navigator.userAgentData.',
      ua_device: 'Operating system',
      platform_sync: 'Match platform and GPU to the User-Agent',
      platform_sync_hint: 'Enables GPU overrides and updates platform and GPU information when the operating system changes. Keeps a recognized GPU model when supported, otherwise uses the target system’s preset. Actual graphics capabilities and rendering still depend on this computer.',
      workers_title: 'Web Workers',
      workers_hint: 'Covers classic dedicated Workers loaded from same-origin HTTP or HTTPS files. Blob, module, Shared and Service Workers expose browser values, which may differ from the page. Existing Workers keep their startup settings until the page reloads. Turn this off if Workers fail to start.',
      canvas_title: 'Canvas noise',
      canvas_hint: 'Adds small, stable noise to canvas readbacks. Identical content and settings produce identical results across repeated reads. Noise can be detected by inspecting known pixel values. Large readbacks use browser values.',
      noise_title: 'Noise seed (canvas & audio)',
      noise_hint: 'Canvas and audio noise are generated from one seed. The same seed always gives the same fingerprint.',
      per_site_seed: 'Use a different seed for every website',
      per_site_seed_hint: 'Off: every site sees the same fingerprint (stable, but sites can link you across them). On: each site (and the third-party frames inside it) gets its own, still stable, fingerprint, so you cannot be linked across sites.',
      seed: 'Noise seed',
      randomize: 'Randomize',
      audio_title: 'Audio noise',
      audio_hint: 'Adds an inaudible noise to AudioContext readbacks and reports a common audio latency. Uses the same seed as canvas.',
      speech_title: 'Speech voices (TTS)',
      speech_hint: 'Installed text-to-speech voices reveal the OS language (e.g. Chinese voices on a Chinese Windows). Controls speechSynthesis.getVoices().',
      speech_mode: 'Mode',
      speech_mode_filter: 'Keep only voices matching the spoofed language (recommended)',
      speech_mode_fake: 'Fully simulated voice list (most aggressive)',
      speech_mode_hide: 'Hide all voices (empty list)',
      webgl_title: 'GPU (WebGL / WebGPU)',
      webgl_hint: 'Changes the unmasked WebGL vendor and renderer, and the matching WebGPU adapter info, so every GPU signal tells the same story.',
      gpu_label: 'GPU (type or pick)',
      gpu_placeholder: 'e.g. NVIDIA GeForce RTX 4060',
      gpu_no_match: 'No matching GPU',
      gpu_custom: 'Use "{name}" as a custom GPU',
      gpu_details: 'Raw WebGL strings (advanced)',
      webgl_vendor: 'Vendor',
      webgl_renderer: 'Renderer',
      webrtc_title: 'WebRTC IP leak protection',
      webrtc_hint: 'Restricts non-proxied UDP across the browser. WebRTC remains available and may use TCP or a configured proxy. Calls can be affected. The status below shows the browser’s current routing policy.',
      webrtc_unknown: 'WebRTC policy could not be read.',
      webrtc_default: 'All available network interfaces',
      webrtc_default_public_and_private_interfaces: 'Default public and private interfaces',
      webrtc_default_public_interface_only: 'Default public interface only',
      webrtc_disable_non_proxied_udp: 'Non-proxied UDP restricted',
      webrtc_status: 'Current policy — {policy}. {control}',
      webrtc_controlled_by_this_extension: 'Controlled by Prehider.',
      webrtc_controlled_by_other_extensions: 'Controlled by another extension.',
      webrtc_not_controllable: 'Browser policy prevents Prehider from changing this setting.',
      webrtc_controllable_by_this_extension: 'Prehider can change this setting.',
      note_reload: 'Changes save automatically. Refresh open sites to apply them.',
      open_tab: 'Open settings',
      reset: 'Reset feature settings',
      reset_desc: 'Restore device and privacy defaults. Site exclusions, theme and display language are kept.',
      reset_confirm: 'Restore default device and privacy settings?',
      saved: 'Saved',
      saving: 'Saving...'
    },
    zh: {
      master_switch: '总开关',
      settings_navigation: '设置分类',
      nav_overview: '概览',
      nav_device: '设备',
      nav_region: '语言与时区',
      nav_sites: '网站',
      nav_privacy: '隐私',
      nav_appearance: '外观',
      overview_desc: '查看当前的设备配置、语言、时区和网站规则。',
      device_desc: '选择设备预设，或单独调整浏览器、屏幕、显卡和字体。',
      presets_title: '自定义预设',
      presets_hint: '将当前设备、语言、时区和隐私设置保存为预设。应用后，预设会按总开关和网站排除规则生效。',
      preset_switch: '自定义预设',
      preset_choose: '选择预设',
      preset_name: '预设名称',
      preset_placeholder: '例如：工作、旅行',
      preset_save: '保存当前配置',
      preset_apply: '应用',
      preset_update: '覆盖',
      preset_delete: '删除',
      preset_apply_named: '应用 {name}',
      preset_update_named: '用当前配置覆盖 {name}',
      preset_delete_named: '删除 {name}',
      preset_matches: '与当前配置一致',
      preset_empty: '保存后，预设会显示在这里。',
      preset_invalid_name: '请输入预设名称，最多 60 个字符。',
      preset_duplicate: '已有同名预设。',
      preset_missing: '此预设已被删除。',
      preset_save_error: '浏览器无法保存预设修改，请再试一次。',
      preset_storage_full: '扩展存储空间已满。请删除不再使用的预设后重试。',
      preset_page_expired: '此设置页已与 Prehider 断开。请从工具栏重新打开详情设置后再试。',
      preset_saved: '已保存预设。',
      preset_updated: '已覆盖预设。',
      preset_deleted: '已删除预设。',
      preset_update_confirm: '用当前配置覆盖「{name}」？',
      preset_delete_confirm: '删除预设「{name}」？',
      region_desc: '设置网站读取的浏览器语言、时区和位置。',
      location_title: '固定位置',
      location_hint: '浏览器定位成功后，已获定位权限的网站会收到此位置。此设置适用于网页定位 API，并使用浏览器的定位服务。按 IP 推断的位置由网络决定。',
      location_enable: '使用固定位置',
      location_city: '选择城市',
      location_map_title: '在地图上选择固定位置',
      location_map_mode: '地图类型',
      location_map_offline: '离线地图',
      location_map_online: '在线街道地图',
      location_map_privacy: '开启在线地图后，OpenFreeMap 会收到你的出口 IP，以及反映浏览区域和缩放级别的地图请求。选中的坐标保存在本地。',
      location_map_privacy_link: 'OpenFreeMap 隐私政策',
      location_map_loading: '正在加载在线地图…',
      location_map_fallback: '在线地图加载失败，已切回离线地图。',
      location_map_help: '点击地图选点，拖动平移，用 + 或 − 缩放。也可用方向键移动，按 Enter 选中地图中心。',
      location_map_zoom_in: '放大地图',
      location_map_zoom_out: '缩小地图',
      location_map_reset: '显示全球地图',
      location_map_error: '地图加载失败，仍可选择城市或输入坐标。',
      location_latitude: '纬度',
      location_longitude: '经度',
      location_accuracy: '精度（米）',
      location_los_angeles: '洛杉矶',
      location_new_york: '纽约',
      location_london: '伦敦',
      location_singapore: '新加坡',
      location_shanghai: '上海',
      location_tokyo: '东京',
      location_invalid: '纬度须在 −90 至 90 之间，经度须在 −180 至 180 之间，精度至少为 1 米。',
      location_save: '保存位置',
      location_set: '当前配置已设为固定位置',
      location_default: '当前配置使用浏览器定位',
      sites_desc: '指定哪些网站使用浏览器原值。',
      privacy_desc: '管理 Canvas 与音频噪声、Worker 设置和 WebRTC 网络策略。',
      appearance_desc: '自定义工具栏弹窗和详情设置页的主题与语言。',
      label_profile: '设备配置',
      label_active_preset: '当前预设',
      label_locale: '语言',
      label_zone: '时区',
      native_value: '浏览器默认',
      protection_on: 'Prehider 已开启',
      protection_off: 'Prehider 已关闭',
      site_active: '已在此网站启用',
      site_excluded: '已排除此网站',
      edit_device: '编辑设备设置',
      site_count: '已排除 {count} 个网站',
      theme_title: '主题',
      theme_system: '跟随系统',
      theme_light: '浅色',
      theme_dark: '深色',
      theme_ocean: '海洋',
      theme_save_error: '无法保存主题。',
      interface_language: '界面语言',
      restore_defaults: '恢复默认值',
      current_site: '当前网站',
      site_exclusions_title: '网站排除列表',
      site_exclusions_hint: '列表中的域名及其子域名使用浏览器原始指纹和请求头。保存后刷新相关网页。WebRTC 防泄漏是浏览器全局设置。',
      site_exclusion_label: '域名或网站网址',
      site_exclusion_add: '添加网站',
      site_exclusion_remove: '移除',
      site_exclusion_remove_label: '从网站排除列表移除 {host}',
      site_exclusion_invalid: '请输入有效的域名或 HTTP(S) 网址。',
      site_exclusion_exists: '{host} 已在列表中。',
      site_exclusions_empty: '暂无排除的网站。',
      exclude_site: '在此网站禁用',
      include_site: '在此网站启用',
      enable_gmail_compatibility: '启用 Gmail 兼容模式',
      disable_gmail_compatibility: '在 Gmail 启用指纹修改',
      excluded_by_parent: '已由上级域名规则禁用',
      save_error: '设置未能生效，请重试。',
      reload_tab: '刷新标签页',
      device_title: '设备类型',
      dev_desktop: '桌面端',
      dev_phone: '手机',
      profile_hint: '选择一种设备，一键填入一套相互一致的字体、屏幕、硬件、User-Agent 和显卡，并启用这些功能。下方每一项都可以再单独调整。',
      exposed_warn: '以下项目仍是真实值（未伪装）：{list}。即使其他项都改了，网站仍可以靠它们认出你。点击上方的设备类型即可一键填入并启用。',
      language_title: '语言',
      language_hint: '修改 navigator.language(s)、Accept-Language 请求头，以及 Intl 和 toLocaleString 使用的默认语言。',
      language_quick: '快速选择',
      language_list: '语言列表（逗号分隔，第一项为主语言）',
      custom: '自定义',
      timezone_title: '时区',
      timezone_hint: '修改 Date（时差、各个 get 方法、toString）以及 Intl.DateTimeFormat 的默认时区。可以直接输入，也可以展开列表选择。',
      timezone_value: 'IANA 时区',
      timezone_invalid: '未知的时区，未保存。请从列表中选择或修正名称。',
      tz_placeholder: '输入或选择，例如 Asia/Shanghai',
      tz_toggle: '展开列表',
      tz_no_match: '没有匹配的时区',
      fonts_title: '已安装字体',
      fonts_hint: '在 Canvas、document.fonts.check 和 queryLocalFonts 中筛选本机字体。网页布局使用浏览器原有字体。勾选的字体需要已安装在本机。',
      fonts_none: '全部隐藏',
      font_search_ph: '搜索字体，或输入名称后按回车添加',
      font_select_shown: '勾选当前列表',
      font_clear_shown: '取消勾选当前列表',
      font_count: '网站可见 {n} 个字体',
      font_add_one: '+ 添加“{name}”为自定义字体',
      font_add_many: '+ 添加 {n} 个自定义字体',
      font_remove: '移除',
      font_empty: '没有可显示的字体',
      tab_all: '全部',
      tab_selected: '已勾选',
      lang_latin: '西文',
      lang_zh: '中文',
      lang_ja: '日文',
      lang_ko: '韩文',
      lang_sym: '符号',
      lang_other: '其他文字',
      lang_custom: '未分类',
      screen_title: '屏幕',
      screen_hint: '修改 screen.width / height / availWidth / availHeight / colorDepth / pixelDepth。',
      screen_preset: '分辨率预设',
      preset_custom: '自定义（使用下方输入框）',
      grp_desktop: '桌面显示器',
      grp_laptop: '笔记本',
      grp_phone: '手机',
      width: '宽度',
      height: '高度',
      color_depth: '色深',
      hardware_title: '硬件',
      hardware_hint: '修改 navigator.hardwareConcurrency、navigator.deviceMemory 和 navigator.maxTouchPoints。可以直接输入，也可以从下拉建议中选择。',
      cores: 'CPU 核心数',
      memory: '内存 (GB)',
      touch: '触摸点数',
      ua_title: 'User-Agent 与平台',
      ua_hint: '修改 User-Agent 与 Sec-CH-UA 请求头、navigator.userAgent / appVersion / platform，以及与之匹配的 navigator.userAgentData。',
      ua_device: '操作系统',
      platform_sync: '根据 User-Agent 同步平台和显卡',
      platform_sync_hint: '切换系统时同步平台与显卡信息，并启用显卡修改。支持时保留已识别的显卡型号，否则采用目标系统的预设。实际图形能力和渲染仍取决于本机。',
      workers_title: 'Web Worker',
      workers_hint: '覆盖同源 HTTP 或 HTTPS 脚本创建的经典专用 Worker。Blob、模块、Shared 和 Service Worker 会暴露浏览器原值，可能与页面不同。已有 Worker 保留启动时的设置，刷新网页后更新。若 Worker 启动异常，可关闭此选项。',
      canvas_title: 'Canvas 噪声',
      canvas_hint: '为 Canvas 读取结果加入微小、稳定的噪声。内容和设置相同时，多次读取会得到相同结果。检查已知像素值可以检测到噪声。大尺寸读回使用浏览器原值。',
      noise_title: '噪声种子（Canvas 与音频）',
      noise_hint: 'Canvas 和音频的噪声由同一个种子生成，相同种子始终得到相同的指纹。',
      per_site_seed: '每个网站使用不同的种子',
      per_site_seed_hint: '关闭：所有网站看到相同的指纹（稳定，但网站之间可以把你关联起来）。开启：每个网站（以及其中嵌入的第三方框架）各自得到一个独立但仍然稳定的指纹，无法跨网站关联。',
      seed: '噪声种子',
      randomize: '随机生成',
      audio_title: '音频噪声',
      audio_hint: '为 AudioContext 读取结果加入听不出来的噪声，并报告一个常见的音频延迟值，与 Canvas 共用同一个种子。',
      speech_title: '语音朗读 (TTS)',
      speech_hint: '系统已安装的语音朗读声音会暴露系统语言（例如中文 Windows 自带中文语音）。作用于 speechSynthesis.getVoices()。',
      speech_mode: '模式',
      speech_mode_filter: '只保留与伪装语言一致的语音（推荐）',
      speech_mode_fake: '完全使用模拟语音列表（最激进）',
      speech_mode_hide: '隐藏所有语音（空列表）',
      webgl_title: '显卡 (WebGL / WebGPU)',
      webgl_hint: '修改 WebGL 的 unmasked 厂商和渲染器，以及与之匹配的 WebGPU 适配器信息，让所有显卡相关信号说法一致。',
      gpu_label: '显卡（可输入，也可选择）',
      gpu_placeholder: '例如 NVIDIA GeForce RTX 4060',
      gpu_no_match: '没有匹配的显卡',
      gpu_custom: '使用“{name}”作为自定义显卡',
      gpu_details: 'WebGL 原始字符串（高级）',
      webgl_vendor: '厂商',
      webgl_renderer: '渲染器',
      webrtc_title: 'WebRTC 防 IP 泄漏',
      webrtc_hint: '在整个浏览器中限制非代理 UDP。WebRTC 仍可使用 TCP 或已配置的代理，通话可能受影响。下方显示浏览器实际使用的网络策略。',
      webrtc_unknown: '暂时无法读取 WebRTC 策略。',
      webrtc_default: '使用所有可用网络接口',
      webrtc_default_public_and_private_interfaces: '使用默认公网和内网接口',
      webrtc_default_public_interface_only: '仅使用默认公网接口',
      webrtc_disable_non_proxied_udp: '已限制非代理 UDP',
      webrtc_status: '当前策略为“{policy}”。{control}',
      webrtc_controlled_by_this_extension: '由 Prehider 控制。',
      webrtc_controlled_by_other_extensions: '由其他扩展控制。',
      webrtc_not_controllable: '浏览器策略禁止 Prehider 更改此设置。',
      webrtc_controllable_by_this_extension: 'Prehider 可以更改此设置。',
      note_reload: '修改会自动保存。刷新已打开的网站以应用设置。',
      open_tab: '打开详情设置',
      reset: '重置功能设置',
      reset_desc: '恢复设备与隐私设置的默认值，保留网站排除、主题和显示语言。',
      reset_confirm: '恢复默认的设备和隐私设置？',
      saved: '已保存',
      saving: '保存中...'
    }
  };

  // Searchable aliases for popular time zones (shown next to the IANA name).
  const TZ_ALIASES = {
    'UTC': { zh: '协调世界时', en: 'Coordinated Universal Time' },
    'Asia/Shanghai': { zh: '北京 上海 中国', en: 'Beijing China' },
    'Asia/Hong_Kong': { zh: '香港', en: 'Hong Kong' },
    'Asia/Macau': { zh: '澳门', en: 'Macau' },
    'Asia/Taipei': { zh: '台北 台湾', en: 'Taiwan' },
    'Asia/Tokyo': { zh: '东京 日本', en: 'Japan' },
    'Asia/Seoul': { zh: '首尔 韩国', en: 'Korea' },
    'Asia/Singapore': { zh: '新加坡', en: 'Singapore' },
    'Asia/Bangkok': { zh: '曼谷 泰国', en: 'Thailand' },
    'Asia/Kolkata': { zh: '印度 加尔各答', en: 'India' },
    'Asia/Calcutta': { zh: '印度 加尔各答', en: 'India Kolkata' },
    'Asia/Dubai': { zh: '迪拜 阿联酋', en: 'UAE' },
    'Asia/Urumqi': { zh: '乌鲁木齐 新疆', en: 'Xinjiang' },
    'Europe/London': { zh: '伦敦 英国', en: 'UK' },
    'Europe/Paris': { zh: '巴黎 法国', en: 'France' },
    'Europe/Berlin': { zh: '柏林 德国', en: 'Germany' },
    'Europe/Madrid': { zh: '马德里 西班牙', en: 'Spain' },
    'Europe/Rome': { zh: '罗马 意大利', en: 'Italy' },
    'Europe/Moscow': { zh: '莫斯科 俄罗斯', en: 'Russia' },
    'America/New_York': { zh: '纽约 美国东部', en: 'US Eastern' },
    'America/Chicago': { zh: '芝加哥 美国中部', en: 'US Central' },
    'America/Denver': { zh: '丹佛 美国山地', en: 'US Mountain' },
    'America/Los_Angeles': { zh: '洛杉矶 美国西部', en: 'US Pacific' },
    'America/Toronto': { zh: '多伦多 加拿大', en: 'Canada' },
    'America/Sao_Paulo': { zh: '圣保罗 巴西', en: 'Brazil' },
    'America/Mexico_City': { zh: '墨西哥城 墨西哥', en: 'Mexico' },
    'Australia/Sydney': { zh: '悉尼 澳大利亚', en: 'Australia' },
    'Pacific/Auckland': { zh: '奥克兰 新西兰', en: 'New Zealand' }
  };

  const FONT_TABS = ['all', 'selected'].concat(PH.LANG_ORDER);
  const THEMES = ['system', 'light', 'dark', 'ocean'];
  const DEVICE_NAMES = { win: 'Windows', mac: 'macOS', linux: 'Linux', android: 'Android' };
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');

  // ------------------------------------------------------------------ state
  let settings = PH.merge(null);
  let currentTab = null;
  let currentHost = '';
  let saveTimer = null;
  let applyTimer = null;
  let saveVersion = 0;
  let pendingSave = false;
  let siteExclusionError = null;
  let webrtcState = null;
  let webrtcReadVersion = 0;
  let fontTab = 'all';
  let fontQuery = '';
  let tzCombo = null;
  let gpuCombo = null;
  let locationMap = null;
  let theme = 'system';
  let themeSaveVersion = 0;
  let presets = [];
  let activePresetId = null;
  let editingPresets = false;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const lang = () => {
    if (settings.uiLang === 'zh' || settings.uiLang === 'en') return settings.uiLang;
    return (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  };
  const t = (key, vars) => {
    let s = I18N[lang()][key] || I18N.en[key] || key;
    if (vars) for (const k of Object.keys(vars)) s = s.replace('{' + k + '}', () => vars[k]);
    return s;
  };

  function applyI18n() {
    document.documentElement.lang = lang() === 'zh' ? 'zh-CN' : 'en';
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-label]').forEach((el) => { el.label = t(el.dataset.i18nLabel); });
    $$('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
    updateSummary();
    updateExposed();
    updateSiteBar();
    renderWebRTCStatus();
    renderSiteExclusions();
    renderSiteExclusionError();
    renderPresets();
    if (!$('#settings-main').hidden) renderFonts();
    if (tzCombo) tzCombo.refresh();
    if (gpuCombo) gpuCombo.refresh();
  }

  // ------------------------------------------------------------------ data binding
  const getPath = (obj, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), obj);
  const setPath = (obj, path, value) => {
    const keys = path.split('.');
    const last = keys.pop();
    keys.reduce((a, k) => a[k], obj)[last] = value;
  };

  function readValue(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.dataset.type === 'list') {
      return el.value.split(el.dataset.sep === 'nl' ? /\r?\n/ : /[,\n]+/).map((s) => s.trim()).filter(Boolean);
    }
    if (el.dataset.type === 'number') {
      const n = Number(el.value);
      return Number.isFinite(n) ? n : 0;
    }
    return el.value.trim();
  }

  function writeValue(el, value) {
    if (el.type === 'checkbox') {
      el.checked = !!value;
    } else if (el.dataset.type === 'list') {
      el.value = (value || []).join(el.dataset.sep === 'nl' ? '\n' : ', ');
    } else {
      el.value = value == null ? '' : value;
    }
  }

  function updateCards() {
    $$('.card[data-feature]').forEach((card) => {
      const on = getPath(settings, card.dataset.feature + '.enabled');
      card.classList.toggle('off', !on);
    });
    updateExposed();
    updateSummary();
  }

  function updateSummary() {
    const values = {
      preset: currentPreset()?.name ?? t('custom'),
      profile: (settings.ua.enabled && DEVICE_NAMES[settings.ua.device]) || t('native_value'),
      language: settings.language.enabled && settings.language.languages.length ? settings.language.languages.join(', ') : t('native_value'),
      timezone: settings.timezone.enabled ? settings.timezone.value : t('native_value'),
      sites: t('site_count', { count: PH.effectiveExcludedHosts(settings).length })
    };
    $$('[data-summary]').forEach((el) => { el.textContent = values[el.dataset.summary]; });
    $('#location-state').textContent = t(settings.geolocation.enabled ? 'location_set' : 'location_default');
    $$('[data-protection-state]').forEach((el) => {
      el.textContent = t(settings.enabled ? 'protection_on' : 'protection_off');
      el.classList.toggle('is-on', settings.enabled);
    });
  }

  // Warn about identifying signals that are still real because their feature is off.
  function updateExposed() {
    const el = $('#exposed-warn');
    const names = ['screen', 'hardware', 'ua', 'webgl']
      .filter((k) => !settings[k].enabled)
      .map((k) => t(k + '_title'));
    el.hidden = names.length === 0;
    if (names.length) el.textContent = t('exposed_warn', { list: names.join(lang() === 'zh' ? '、' : ', ') });
  }

  function updateLangQuick() {
    const sel = $('#lang-quick');
    const cur = settings.language.languages.join(', ');
    const match = Array.from(sel.options).find((o) => o.value === cur);
    sel.value = match ? match.value : '';
  }

  function syncScreenPreset() {
    const sel = $('#screen-preset');
    const v = settings.screen.width + 'x' + settings.screen.height;
    sel.value = Array.from(sel.options).some((o) => o.value === v) ? v : '';
  }

  function syncDevice() {
    $$('.device').forEach((b) => {
      const on = settings.ua.enabled && b.dataset.device === settings.ua.device;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    $('#ua-device').value = settings.ua.device;
  }

  function render() {
    $$('[data-key]').forEach((el) => writeValue(el, getPath(settings, el.dataset.key)));
    updateCards();
    updateLangQuick();
    syncScreenPreset();
    syncDevice();
    $('#tz-input').value = settings.timezone.value;
    updateTzValidation();
    syncLocationForm();
    if (gpuCombo) syncGpu();
    applyI18n();
  }

  function syncLocationForm() {
    const { enabled, latitude, longitude, accuracy } = settings.geolocation;
    const { elements } = $('#location-form');
    elements.enabled.checked = enabled;
    elements.latitude.value = latitude;
    elements.longitude.value = longitude;
    elements.accuracy.value = accuracy;
    const select = $('#location-city');
    const coordinates = latitude + ',' + longitude;
    select.value = Array.from(select.options).some((option) => option.value === coordinates) ? coordinates : '';
    $('#location-error').hidden = true;
    syncLocationMarker(true);
  }

  function syncLocationMarker(recenter = false) {
    if (!locationMap) return;
    const { latitude, longitude } = $('#location-form').elements;
    const point = PH.fixedPosition({ latitude: latitude.value, longitude: longitude.value, accuracy: 1 });
    locationMap.setPoint(point, recenter);
  }

  // ------------------------------------------------------------------ persistence
  function renderWebRTCStatus() {
    const el = $('#webrtc-status');
    if (!webrtcState) {
      el.textContent = t('webrtc_unknown');
      return;
    }
    el.textContent = t('webrtc_status', {
      policy: t('webrtc_' + webrtcState.value),
      control: t('webrtc_' + webrtcState.levelOfControl)
    });
  }

  async function refreshWebRTCStatus() {
    const version = ++webrtcReadVersion;
    let state = null;
    try {
      state = await chrome.privacy.network.webRTCIPHandlingPolicy.get({});
    } catch (e) { /* show an unavailable status */ }
    if (version !== webrtcReadVersion) return;
    webrtcState = state;
    renderWebRTCStatus();
  }

  function setStatus(text, ok) {
    const el = $('#status');
    el.textContent = text;
    el.classList.toggle('ok', !!ok);
  }

  function save(delay = 150) {
    PH.alignPlatform(settings);
    activePresetId = currentPreset()?.id ?? null;
    updateSummary();
    updatePresetMatches();
    const version = ++saveVersion;
    pendingSave = true;
    setStatus(t('saving'));
    clearTimeout(saveTimer);
    clearTimeout(applyTimer);
    $('#btn-reload').disabled = true;
    const persist = async () => {
      let applied = false;
      try {
        await chrome.storage.local.set({ settings, activePresetId });
        applied = await chrome.runtime.sendMessage({ type: 'applySettings' });
      } catch (e) { /* show the error in the popup */ }
      await refreshWebRTCStatus();
      if (version !== saveVersion) return;
      pendingSave = false;
      $('#btn-reload').disabled = !applied;
      setStatus(t(applied ? 'saved' : 'save_error'), applied);
      if (applied) applyTimer = setTimeout(() => setStatus(''), 1500);
    };
    if (delay === 0) persist();
    else saveTimer = setTimeout(persist, delay);
  }

  // ------------------------------------------------------------------ custom presets
  const presetSnapshot = (value) => JSON.stringify(PH.capturePreset(value));

  function currentPreset() {
    const preset = presets.find((entry) => entry.id === activePresetId);
    return preset && presetSnapshot(preset.settings) === presetSnapshot(settings) ? preset : null;
  }

  async function loadSettingsState() {
    const keys = ['settings', 'theme', 'presets', 'activePresetId'];
    const stored = await chrome.storage.local.get(keys);
    if (stored.activePresetId !== undefined) return stored;

    const migrateSelection = (state) => {
      // Older versions only marked matching values. A unique match identifies the preset.
      const current = presetSnapshot(PH.merge(state.settings));
      const matches = PH.readPresets(state.presets).filter((preset) => presetSnapshot(preset.settings) === current);
      state.activePresetId = matches.length === 1 ? matches[0].id : null;
      return state;
    };
    try {
      return await navigator.locks.request('prehider-presets', async () => {
        const latest = await chrome.storage.local.get(keys);
        if (latest.activePresetId !== undefined) return latest;
        migrateSelection(latest);
        await chrome.storage.local.set({ activePresetId: latest.activePresetId });
        return latest;
      });
    } catch (error) {
      console.warn('[Prehider] Could not save the migrated preset selection:', error);
      return migrateSelection(stored);
    }
  }

  function updatePresetMatches() {
    const badges = $$('.preset-match');
    if (!badges.length) return;
    const current = presetSnapshot(settings);
    for (const badge of badges) badge.hidden = badge.dataset.snapshot !== current;
  }

  function updatePresetControls() {
    $('#quick-preset-apply').disabled = !$('#quick-preset').value;
    for (const button of $$('#preset-form button, #preset-list button')) button.disabled = editingPresets;
  }

  function renderPresets() {
    const select = $('#quick-preset');
    const chosen = select.value;
    select.replaceChildren(new Option(t('preset_choose'), ''));
    for (const preset of presets) select.add(new Option(preset.name, preset.id));
    select.value = presets.some((preset) => preset.id === chosen) ? chosen : '';
    $('#quick-preset-form').hidden = presets.length === 0;

    const list = $('#preset-list');
    if (!$('#settings-main').hidden) {
      const focused = list.contains(document.activeElement) ? document.activeElement : null;
      list.replaceChildren();
      if (!presets.length) {
        const empty = document.createElement('li');
        empty.className = 'hint';
        empty.textContent = t('preset_empty');
        list.append(empty);
      }
      for (const preset of presets) {
        const row = document.createElement('li');
        row.dataset.preset = preset.id;
        const heading = document.createElement('div');
        heading.className = 'preset-label';
        const name = document.createElement('strong');
        name.textContent = preset.name;
        const match = document.createElement('small');
        match.className = 'preset-match';
        match.textContent = t('preset_matches');
        match.dataset.snapshot = presetSnapshot(preset.settings);
        heading.append(name, match);

        const actions = document.createElement('div');
        actions.className = 'preset-actions';
        for (const action of ['apply', 'update', 'delete']) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'btn' + (action === 'delete' ? ' danger' : '');
          button.dataset.action = action;
          button.textContent = t('preset_' + action);
          button.setAttribute('aria-label', t('preset_' + action + '_named', { name: preset.name }));
          actions.append(button);
        }
        row.append(heading, actions);
        list.append(row);
      }
      if (focused) {
        const id = focused.closest('li').dataset.preset;
        const replacement = $$('#preset-list button').find((button) =>
          button.dataset.action === focused.dataset.action && button.closest('li').dataset.preset === id);
        (replacement || $('#preset-name')).focus({ preventScroll: true });
      }
      updatePresetMatches();
    }
    updatePresetControls();
  }

  async function editPreset(action, fields) {
    if (editingPresets) return false;
    const status = $('#preset-status');
    status.textContent = '';
    editingPresets = true;
    updatePresetControls();
    let errorKey;
    try {
      // Keep reads and writes together when several settings tabs edit the same list.
      errorKey = await navigator.locks.request('prehider-presets', async () => {
        const { presets: stored } = await chrome.storage.local.get('presets');
        const list = PH.readPresets(stored);
        if (action === 'create') {
          const name = fields.name.trim().normalize();
          if (!name || name.length > 60) return 'preset_invalid_name';
          if (list.some((preset) => preset.name.toLowerCase() === name.toLowerCase())) return 'preset_duplicate';
          list.push({ id: crypto.randomUUID(), name, settings: fields.settings });
        } else {
          const index = list.findIndex((preset) => preset.id === fields.id);
          if (index < 0) return 'preset_missing';
          if (action === 'update') list[index].settings = fields.settings;
          else list.splice(index, 1);
        }
        await chrome.storage.local.set({ presets: list });
      });
    } catch (error) {
      console.warn('[Prehider] Failed to edit presets:', error);
      const message = error?.message || '';
      if (!chrome.runtime?.id || /context invalidated/i.test(message)) errorKey = 'preset_page_expired';
      else if (error?.name === 'QuotaExceededError' || /quota/i.test(message)) errorKey = 'preset_storage_full';
      else errorKey = 'preset_save_error';
    }
    editingPresets = false;
    updatePresetControls();
    status.classList.toggle('is-error', Boolean(errorKey));
    const success = { create: 'preset_saved', update: 'preset_updated', delete: 'preset_deleted' };
    status.textContent = t(errorKey || success[action]);
    return !errorKey;
  }

  function applyPreset(id) {
    const preset = presets.find((entry) => entry.id === id);
    if (!preset) return;
    settings = PH.merge({ ...settings, ...PH.capturePreset(preset.settings) });
    activePresetId = preset.id;
    $('#preset-status').textContent = '';
    render();
    save(0);
  }

  // ------------------------------------------------------------------ site exclusions
  function renderSiteExclusionError() {
    const error = $('#site-exclusion-error');
    const input = $('#site-exclusion-input');
    error.hidden = !siteExclusionError;
    error.textContent = siteExclusionError ? t(siteExclusionError.key, { host: siteExclusionError.host }) : '';
    input.setAttribute('aria-invalid', String(!!siteExclusionError));
    input.classList.toggle('invalid', !!siteExclusionError);
  }

  function renderSiteExclusions() {
    const list = $('#site-exclusion-list');
    if ($('#site-exclusions').hidden) return;
    const hosts = PH.effectiveExcludedHosts(settings).slice().sort();
    list.replaceChildren();
    $('#site-exclusions-empty').hidden = hosts.length > 0;
    for (const host of hosts) {
      const row = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = host;
      const remove = document.createElement('button');
      remove.className = 'btn';
      remove.type = 'button';
      remove.dataset.host = host;
      remove.textContent = t('site_exclusion_remove');
      remove.setAttribute('aria-label', t('site_exclusion_remove_label', { host }));
      row.append(label, remove);
      list.appendChild(row);
    }
  }

  function setSiteExcluded(host, excluded) {
    if (host === PH.GMAIL_HOST) settings.gmailCompatibility = excluded;
    if (!excluded) settings.excludedHosts = settings.excludedHosts.filter((entry) => entry !== host);
    else if (host !== PH.GMAIL_HOST) settings.excludedHosts.push(host);
    renderSiteExclusions();
    updateSummary();
    updateSiteBar();
    save(0);
  }

  // ------------------------------------------------------------------ site bar
  function updateSiteBar() {
    const bar = $('#site-bar');
    if (!currentHost) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    $('#site-host').textContent = currentHost;
    const excludedHosts = PH.effectiveExcludedHosts(settings);
    const inherited = PH.isExcludedHost(currentHost, excludedHosts.filter((host) => host !== currentHost));
    const excluded = excludedHosts.includes(currentHost);
    const siteState = $('#site-state');
    siteState.textContent = t(excluded || inherited ? 'site_excluded' : settings.enabled ? 'site_active' : 'protection_off');
    const button = $('#btn-exclude');
    button.disabled = inherited;
    if (inherited) button.textContent = t('excluded_by_parent');
    else if (currentHost === PH.GMAIL_HOST) {
      button.textContent = t(excluded ? 'disable_gmail_compatibility' : 'enable_gmail_compatibility');
    } else button.textContent = t(excluded ? 'include_site' : 'exclude_site');
  }

  function applyTheme(value) {
    theme = THEMES.includes(value) ? value : 'system';
    document.documentElement.dataset.theme = theme === 'system' ? (systemTheme.matches ? 'dark' : 'light') : theme;
    $$('input[name="theme"]').forEach((input) => { input.checked = input.value === theme; });
  }

  async function saveTheme(value) {
    const version = ++themeSaveVersion;
    const status = $('#theme-status');
    status.hidden = true;
    applyTheme(value);
    try {
      await chrome.storage.local.set({ theme });
    } catch (e) {
      if (version !== themeSaveVersion) return;
      const stored = await chrome.storage.local.get('theme').catch(() => ({}));
      if (version !== themeSaveVersion) return;
      applyTheme(stored.theme);
      status.textContent = t('theme_save_error');
      status.hidden = false;
    }
  }

  function showSettingsPage(focusHeading = false) {
    const requested = location.hash.slice(1);
    const page = $$('.settings-page').find((section) => section.id === requested) || $('#overview');
    if (page.id !== 'region') locationMap?.useOffline();
    $$('.settings-page').forEach((section) => { section.hidden = section !== page; });
    $$('#settings-nav a').forEach((link) => {
      if (link.hash === '#' + page.id) {
        link.setAttribute('aria-current', 'page');
        link.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } else link.removeAttribute('aria-current');
    });
    $('#settings-main').scrollTop = 0;
    if (focusHeading) page.querySelector('h2').focus({ preventScroll: true });
  }

  async function initTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      currentTab = tab;
      if (tab && tab.url) {
        if (/^https?:\/\//i.test(tab.url)) currentHost = PH.normalizeExcludedHost(tab.url);
      }
    } catch (e) { /* no tab access */ }
  }

  // ------------------------------------------------------------------ time zone combobox
  // Returns the canonical IANA name for a typed value, or null if it is not a valid zone.
  function canonicalTz(value) {
    if (!value) return null;
    try {
      return new Intl.DateTimeFormat('en-US', { timeZone: value }).resolvedOptions().timeZone;
    } catch (e) {
      return null;
    }
  }

  function tzOffsetLabel(name) {
    try {
      const part = new Intl.DateTimeFormat('en-US', { timeZone: name, timeZoneName: 'longOffset' })
        .formatToParts(new Date()).find((p) => p.type === 'timeZoneName');
      if (!part) return '';
      return part.value === 'GMT' ? 'UTC+00:00' : part.value.replace('GMT', 'UTC');
    } catch (e) {
      return '';
    }
  }

  function tzSearchText(name, offset) {
    const parts = [name, name.replace(/_/g, ' '), offset];
    const m = /UTC([+-])(\d{2}):(\d{2})/.exec(offset);
    if (m) {
      const h = String(Number(m[2]));
      parts.push('utc' + m[1] + h, m[1] + h, m[1] + m[2] + ':' + m[3]);
    }
    const alias = TZ_ALIASES[name];
    if (alias) parts.push(alias.zh, alias.en);
    return parts.join(' ').toLowerCase();
  }

  function tzItems() {
    let zones = [];
    try {
      zones = Intl.supportedValuesOf('timeZone');
    } catch (e) {
      zones = Object.keys(TZ_ALIASES).filter((z) => z !== 'UTC');
    }
    zones = ['UTC'].concat(zones.filter((z) => z !== 'UTC'));
    return zones.map((name) => {
      const offset = tzOffsetLabel(name);
      return {
        value: name,
        label: name,
        group: name.includes('/') ? name.split('/')[0] : 'UTC',
        meta: offset,
        search: tzSearchText(name, offset)
      };
    });
  }

  function updateTzValidation() {
    const input = $('#tz-input');
    const ok = canonicalTz(input.value.trim()) !== null;
    input.classList.toggle('invalid', !ok);
    $('#tz-error').hidden = ok;
  }

  function chooseTz(name) {
    const canonical = canonicalTz(name);
    if (canonical === null) return;
    settings.timezone.value = canonical;
    $('#tz-input').value = canonical;
    updateTzValidation();
    save();
  }

  // Apply the typed text if it is a valid zone (live, while typing).
  function applyTypedTz() {
    const canonical = canonicalTz($('#tz-input').value.trim());
    updateTzValidation();
    if (canonical !== null && canonical !== settings.timezone.value) {
      settings.timezone.value = canonical;
      save();
    }
  }

  function buildTzCombo() {
    tzCombo = makeCombo({
      root: $('#tz-combo'),
      input: $('#tz-input'),
      toggle: $('#tz-toggle'),
      list: $('#tz-list'),
      getSelected: () => settings.timezone.value,
      alias: (it) => {
        const a = TZ_ALIASES[it.value];
        return a ? a[lang()] || a.en : '';
      },
      emptyText: () => t('tz_no_match'),
      onType: applyTypedTz,
      onChoose: (it) => chooseTz(it.value),
      onCommit: (text) => {
        if (canonicalTz(text)) chooseTz(text);
      },
      onBlur: () => {
        // Normalize a valid typed value (e.g. "asia/tokyo" -> "Asia/Tokyo") when leaving the field.
        const input = $('#tz-input');
        const canonical = canonicalTz(input.value.trim());
        if (canonical !== null) input.value = canonical;
        updateTzValidation();
      }
    });
    tzCombo.setItems(tzItems());
  }

  // ------------------------------------------------------------------ GPU combobox
  const curDevice = () => (PH.GPUS[settings.ua.device] ? settings.ua.device : 'win');
  const gpuList = () => PH.GPUS[curDevice()];

  function gpuLabel() {
    const hit = gpuList().find((x) => x.renderer === settings.webgl.renderer);
    return hit ? hit.label : settings.webgl.renderer;
  }

  // Rebuild the list for the current device type and show the current GPU in the input.
  function syncGpu() {
    gpuCombo.setItems(gpuList().map((x) => ({
      value: x.renderer, label: x.label, group: x.group, meta: x.meta,
      search: x.label + ' ' + x.renderer + ' ' + x.meta
    })));
    const input = $('#gpu-input');
    if (document.activeElement !== input) input.value = gpuLabel();
  }

  function setGpu(vendor, renderer) {
    const guess = PH.guessGpu(renderer);
    settings.webgl.vendor = vendor;
    settings.webgl.renderer = renderer;
    settings.webgl.gpuVendor = guess.vendor;
    settings.webgl.gpuArch = guess.arch;
    settings.webgl.enabled = true;
    PH.alignPlatform(settings);
    $$('[data-key^="webgl."]').forEach((el) => writeValue(el, getPath(settings, el.dataset.key)));
    $('#gpu-input').value = gpuLabel();
    updateCards();
    save();
  }

  function setGpuFromText(text) {
    if (!text) return;
    const r = PH.gpuFromText(curDevice(), text);
    setGpu(r.vendor, r.renderer);
  }

  function buildGpuCombo() {
    gpuCombo = makeCombo({
      root: $('#gpu-combo'),
      input: $('#gpu-input'),
      toggle: $('#gpu-toggle'),
      list: $('#gpu-list'),
      getSelected: () => settings.webgl.renderer,
      bestMatch: true,
      emptyText: () => t('gpu_no_match'),
      customLabel: (text) => t('gpu_custom', { name: text }),
      onChoose: (it) => {
        if (it.custom) {
          setGpuFromText(it.value);
          return;
        }
        const x = gpuList().find((g) => g.renderer === it.value);
        if (x) setGpu(x.vendor, x.renderer);
      },
      onCommit: setGpuFromText,
      onBlur: () => { $('#gpu-input').value = gpuLabel(); }
    });
  }

  // ------------------------------------------------------------------ font picker
  const lower = (s) => s.toLowerCase();

  function fontRows() {
    const checked = new Set(settings.fonts.allowed.map(lower));
    const rows = PH.FONT_CATALOG.map((f) => ({
      name: f.name, lang: f.lang, checked: checked.has(lower(f.name)), custom: false
    }));
    const known = new Set(rows.map((r) => lower(r.name)));
    const custom = [];
    for (const name of settings.fonts.allowed) {
      if (known.has(lower(name))) continue;
      known.add(lower(name));
      custom.push({ name, lang: PH.fontLang(name), checked: true, custom: true });
    }
    // Fonts added by hand are listed first so they are easy to find.
    return custom.concat(rows);
  }

  function parseFontNames(text) {
    return text.split(/[,\n，、;；]+/).map((s) => s.trim()).filter(Boolean);
  }

  function setFonts(names, on) {
    const set = new Set(names.map(lower));
    const rest = settings.fonts.allowed.filter((n) => !set.has(lower(n)));
    settings.fonts.allowed = on ? rest.concat(names.filter((n, i) => names.findIndex((m) => lower(m) === lower(n)) === i)) : rest;
    save();
    renderFonts();
  }

  function shownFontRows(rows) {
    const names = parseFontNames(fontQuery);
    const q = names.length === 1 ? lower(names[0]) : '';
    return rows.filter((r) => {
      if (fontTab === 'selected' && !r.checked) return false;
      if (fontTab !== 'all' && fontTab !== 'selected' && r.lang !== fontTab) return false;
      if (q && !lower(r.name).includes(q) && !lower(t('lang_' + r.lang)).includes(q)) return false;
      return true;
    });
  }

  // Names in the search box that are not in the list yet (candidates for "add custom font").
  function pendingFontNames(rows) {
    const known = new Set(rows.map((r) => lower(r.name)));
    const seen = new Set();
    return parseFontNames(fontQuery).filter((n) => {
      const key = lower(n);
      if (known.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function renderFonts() {
    const rows = fontRows();
    const tabsEl = $('#font-tabs');
    const listEl = $('#font-list');

    // Tabs with checked/total counts
    tabsEl.textContent = '';
    for (const key of FONT_TABS) {
      const inTab = key === 'all' ? rows
        : key === 'selected' ? rows.filter((r) => r.checked)
          : rows.filter((r) => r.lang === key);
      if (key === 'custom' && !inTab.length) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab' + (key === fontTab ? ' active' : '');
      btn.dataset.tab = key;
      const label = key === 'all' ? t('tab_all') : key === 'selected' ? t('tab_selected') : t('lang_' + key);
      const checked = inTab.filter((r) => r.checked).length;
      btn.append(label + ' ');
      const count = document.createElement('small');
      count.textContent = key === 'selected' ? String(inTab.length) : checked + '/' + inTab.length;
      btn.appendChild(count);
      tabsEl.appendChild(btn);
    }
    if (fontTab === 'custom' && !rows.some((r) => r.lang === 'custom')) fontTab = 'all';

    $('#font-count').textContent = t('font_count', { n: settings.fonts.allowed.length });

    // List
    const scroll = listEl.scrollTop;
    listEl.textContent = '';

    const pending = pendingFontNames(rows);
    if (pending.length) {
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'font-add-row';
      add.dataset.action = 'add';
      add.textContent = pending.length === 1
        ? t('font_add_one', { name: pending[0] })
        : t('font_add_many', { n: pending.length });
      listEl.appendChild(add);
    }

    const shown = shownFontRows(rows);
    for (const r of shown) {
      const row = document.createElement('label');
      row.className = 'font-row' + (r.checked ? ' checked' : '');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = r.checked;
      cb.dataset.font = r.name;
      const name = document.createElement('span');
      name.className = 'font-name';
      name.textContent = r.name;
      name.title = r.name;
      const badge = document.createElement('span');
      badge.className = 'badge badge-' + r.lang;
      badge.textContent = t('lang_' + r.lang);
      row.append(cb, name, badge);
      if (r.custom) {
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'font-del';
        del.dataset.font = r.name;
        del.title = t('font_remove');
        del.textContent = '\u00d7';
        row.appendChild(del);
      }
      listEl.appendChild(row);
    }
    if (!shown.length && !pending.length) {
      const empty = document.createElement('div');
      empty.className = 'font-empty';
      empty.textContent = t('font_empty');
      listEl.appendChild(empty);
    }
    listEl.scrollTop = scroll;
  }

  function bindFonts() {
    const search = $('#font-search');
    const listEl = $('#font-list');

    search.addEventListener('input', () => {
      fontQuery = search.value;
      renderFonts();
    });
    search.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const rows = fontRows();
      const pending = pendingFontNames(rows);
      if (pending.length) {
        setFonts(pending, true);
      } else {
        // Exact match of an existing font: check it.
        const names = parseFontNames(fontQuery);
        const hit = names.length === 1 && rows.find((r) => lower(r.name) === lower(names[0]));
        if (hit) setFonts([hit.name], true);
      }
      fontQuery = '';
      search.value = '';
      renderFonts();
    });

    $('#font-tabs').addEventListener('click', (e) => {
      const btn = e.target.closest('.tab');
      if (!btn) return;
      fontTab = btn.dataset.tab;
      listEl.scrollTop = 0;
      renderFonts();
    });

    listEl.addEventListener('change', (e) => {
      const cb = e.target;
      if (cb.dataset && cb.dataset.font) setFonts([cb.dataset.font], cb.checked);
    });
    listEl.addEventListener('click', (e) => {
      const del = e.target.closest('.font-del');
      if (del) {
        e.preventDefault();
        setFonts([del.dataset.font], false);
        return;
      }
      const add = e.target.closest('.font-add-row');
      if (add) {
        setFonts(pendingFontNames(fontRows()), true);
        fontQuery = '';
        search.value = '';
        renderFonts();
      }
    });

    $('#btn-font-select').addEventListener('click', () => {
      setFonts(shownFontRows(fontRows()).map((r) => r.name), true);
    });
    $('#btn-font-clear').addEventListener('click', () => {
      setFonts(shownFontRows(fontRows()).map((r) => r.name), false);
    });
  }

  // ------------------------------------------------------------------ devices
  // The UA-only selector also aligns the GPU when platform synchronization is enabled.
  function applyDevice(name, only) {
    const p = PH.PROFILES[name];
    if (!p) return;
    if (only === 'ua') {
      Object.assign(settings.ua, p.ua, { enabled: true });
    } else {
      settings.fonts = { enabled: true, allowed: p.fonts.slice() };
      settings.screen = Object.assign({ enabled: true }, p.screen);
      settings.hardware = Object.assign({ enabled: true }, p.hardware);
      settings.ua = Object.assign({ enabled: true }, p.ua);
      if (!settings.platformSync) settings.webgl = Object.assign({ enabled: true }, p.webgl);
    }
    PH.alignPlatform(settings);
    render();
    save();
  }

  // ------------------------------------------------------------------ events
  function onInput(e) {
    const el = e.target;
    if (!el.dataset || !el.dataset.key) return;
    if ((el.type === 'checkbox' || el.tagName === 'SELECT') && e.type !== 'change') return;
    setPath(settings, el.dataset.key, readValue(el));
    if (el.dataset.key === 'uiLang') {
      applyI18n();
      save(0);
      return;
    }
    if (el.dataset.key === 'webgl.renderer') {
      const guess = PH.guessGpu(settings.webgl.renderer);
      settings.webgl.gpuVendor = guess.vendor;
      settings.webgl.gpuArch = guess.arch;
      const gi = $('#gpu-input');
      if (document.activeElement !== gi) gi.value = gpuLabel();
    }
    updateCards();
    if (el.dataset.key === 'language.languages') updateLangQuick();
    if (el.dataset.key === 'screen.width' || el.dataset.key === 'screen.height') syncScreenPreset();
    if (el.dataset.key === 'ua.enabled') syncDevice();
    if (el.dataset.key === 'ua.enabled' || el.dataset.key === 'ua.userAgent' ||
        el.dataset.key === 'ua.platform' || el.dataset.key === 'platformSync' ||
        el.dataset.key.startsWith('webgl.')) {
      PH.alignPlatform(settings);
      syncDevice();
      syncGpu();
      updateCards();
      $$('[data-key="ua.platform"], [data-key^="webgl."]').forEach((input) => {
        if (document.activeElement !== input || input.type === 'checkbox' || e.type === 'change') {
          writeValue(input, getPath(settings, input.dataset.key));
        }
      });
    }
    if (el.dataset.key === 'enabled') updateSiteBar();
    save(el.dataset.key === 'enabled' ? 0 : 150);
  }

  function bindEvents() {
    document.addEventListener('input', onInput);
    document.addEventListener('change', onInput);

    const locationForm = $('#location-form');
    const citySelect = $('#location-city');
    function pickLocation(latitude, longitude, recenter) {
      locationForm.elements.latitude.value = latitude;
      locationForm.elements.longitude.value = longitude;
      locationForm.elements.enabled.checked = true;
      $('#location-error').hidden = true;
      syncLocationMarker(recenter);
    }
    if (!$('#settings-main').hidden) {
      locationMap = makeLocationMap($('#location-map'), (latitude, longitude) => {
        citySelect.value = '';
        pickLocation(latitude, longitude, false);
      });
    }
    citySelect.addEventListener('change', () => {
      if (citySelect.value) pickLocation(...citySelect.value.split(','), true);
    });
    locationForm.addEventListener('input', (event) => {
      if (event.target.name === 'latitude' || event.target.name === 'longitude') {
        citySelect.value = '';
        syncLocationMarker(true);
      }
      $('#location-error').hidden = true;
    });
    locationForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const { enabled, latitude, longitude, accuracy } = locationForm.elements;
      const position = PH.fixedPosition({ latitude: latitude.value, longitude: longitude.value, accuracy: accuracy.valueAsNumber });
      if (enabled.checked && !position) {
        $('#location-error').hidden = false;
        return;
      }
      settings.geolocation = position ? {
        enabled: enabled.checked,
        latitude: String(position.latitude),
        longitude: String(position.longitude),
        accuracy: position.accuracy
      } : { ...settings.geolocation, enabled: false };
      syncLocationForm();
      save(0);
    });

    const presetName = $('#preset-name');
    $('#preset-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const snapshotName = presetName.value;
      const saved = await editPreset('create', { name: snapshotName, settings: PH.capturePreset(settings) });
      if (saved && presetName.value === snapshotName) presetName.value = '';
      presetName.focus();
    });
    $('#preset-list').addEventListener('click', (event) => {
      const button = event.target.closest('button[data-action]');
      if (!button) return;
      const preset = presets.find((entry) => entry.id === button.closest('li').dataset.preset);
      if (!preset) return;
      const action = button.dataset.action;
      if (action === 'apply') {
        applyPreset(preset.id);
      } else if (confirm(t('preset_' + action + '_confirm', { name: preset.name }))) {
        const fields = { id: preset.id };
        if (action === 'update') fields.settings = PH.capturePreset(settings);
        editPreset(action, fields);
      }
    });
    $('#quick-preset').addEventListener('change', updatePresetControls);
    $('#quick-preset-form').addEventListener('submit', (event) => {
      event.preventDefault();
      applyPreset($('#quick-preset').value);
    });

    $('#btn-lang').addEventListener('click', () => {
      settings.uiLang = lang() === 'zh' ? 'en' : 'zh';
      $('#ui-language').value = settings.uiLang;
      applyI18n();
      save(0);
    });

    $('#lang-quick').addEventListener('change', (e) => {
      if (!e.target.value) return;
      settings.language.languages = e.target.value.split(',').map((s) => s.trim());
      render();
      save();
    });

    $$('[data-device]').forEach((b) => b.addEventListener('click', () => applyDevice(b.dataset.device)));
    $('#ua-device').addEventListener('change', (e) => applyDevice(e.target.value, 'ua'));

    $('#screen-preset').addEventListener('change', (e) => {
      const m = /^(\d+)x(\d+)$/.exec(e.target.value);
      if (!m) return;
      settings.screen.width = Number(m[1]);
      settings.screen.height = Number(m[2]);
      settings.screen.enabled = true;
      $$('[data-key^="screen."]').forEach((el) => writeValue(el, getPath(settings, el.dataset.key)));
      updateCards();
      save();
    });

    $$('[data-fonts]').forEach((b) => b.addEventListener('click', () => {
      const key = b.dataset.fonts;
      settings.fonts.allowed = key === 'none' ? [] : PH.FONT_PRESETS[key].slice();
      settings.fonts.enabled = true;
      render();
      save();
    }));

    $('#btn-seed').addEventListener('click', () => {
      settings.seed = Math.floor(Math.random() * 2147483647);
      render();
      save();
    });

    $('#btn-exclude').addEventListener('click', () => {
      const excluded = PH.effectiveExcludedHosts(settings).includes(currentHost);
      setSiteExcluded(currentHost, !excluded);
    });

    const siteInput = $('#site-exclusion-input');
    siteInput.addEventListener('input', () => {
      siteExclusionError = null;
      renderSiteExclusionError();
    });
    $('#site-exclusion-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const host = PH.normalizeExcludedHost(siteInput.value);
      if (!host) siteExclusionError = { key: 'site_exclusion_invalid' };
      else if (PH.effectiveExcludedHosts(settings).includes(host)) {
        siteExclusionError = { key: 'site_exclusion_exists', host };
      } else {
        siteExclusionError = null;
        setSiteExcluded(host, true);
        siteInput.value = '';
      }
      renderSiteExclusionError();
      siteInput.focus();
    });
    $('#site-exclusion-list').addEventListener('click', (event) => {
      const button = event.target.closest('button[data-host]');
      if (!button) return;
      const row = button.closest('li');
      const neighbor = row.nextElementSibling || row.previousElementSibling;
      const nextHost = neighbor?.querySelector('button').dataset.host;
      siteExclusionError = null;
      renderSiteExclusionError();
      setSiteExcluded(button.dataset.host, false);
      const next = $$('button[data-host]', $('#site-exclusion-list')).find((item) => item.dataset.host === nextHost);
      (next || siteInput).focus();
    });

    $('#btn-reload').addEventListener('click', () => {
      if (currentTab && currentTab.id != null) chrome.tabs.reload(currentTab.id);
    });

    $$('[data-open-settings]').forEach((button) => button.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('popup/popup.html') + '#' + button.dataset.openSettings });
    }));
    $('.theme-grid').addEventListener('change', (event) => {
      if (event.target.name === 'theme') saveTheme(event.target.value);
    });

    $('#btn-reset').addEventListener('click', () => {
      if (!confirm(t('reset_confirm'))) return;
      const keep = {
        uiLang: settings.uiLang,
        excludedHosts: settings.excludedHosts,
        gmailCompatibility: settings.gmailCompatibility
      };
      settings = Object.assign(PH.merge(null), keep);
      activePresetId = null;
      fontTab = 'all';
      fontQuery = '';
      $('#font-search').value = '';
      render();
      save();
    });

    bindFonts();
  }

  async function init() {
    const tab = await chrome.tabs.getCurrent().catch(() => null);
    if (tab) {
      $('#settings-nav').hidden = false;
      $('#settings-main').hidden = false;
      $('#site-exclusions').hidden = false;
      showSettingsPage();
      window.addEventListener('hashchange', () => showSettingsPage(true));
    } else $('#popup-home').hidden = false;
    try {
      $('#ver').textContent = 'v' + chrome.runtime.getManifest().version;
    } catch (e) { /* no manifest access */ }

    const { settings: saved, theme: savedTheme, presets: savedPresets, activePresetId: selectedId } =
      await loadSettingsState();
    settings = PH.merge(saved);
    presets = PH.readPresets(savedPresets);
    activePresetId = selectedId;
    applyTheme(savedTheme);
    systemTheme.addEventListener('change', () => applyTheme(theme));
    if (tab) {
      buildTzCombo();
      buildGpuCombo();
    } else await initTab();
    bindEvents();
    render();
    document.body.dataset.view = tab ? 'settings' : 'popup';
    refreshWebRTCStatus();
    chrome.privacy?.network?.webRTCIPHandlingPolicy?.onChange.addListener(refreshWebRTCStatus);
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local') return;
      if (changes.theme) applyTheme(changes.theme.newValue);
      if (changes.presets) {
        presets = PH.readPresets(changes.presets.newValue);
        renderPresets();
        updateSummary();
      }
      if (pendingSave) return;
      if (changes.activePresetId) activePresetId = changes.activePresetId.newValue;
      if (changes.settings) {
        settings = PH.merge(changes.settings.newValue);
        render();
      } else if (changes.activePresetId) updateSummary();
    });
  }

  init();
})();
