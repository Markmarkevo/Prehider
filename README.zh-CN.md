# Prehider · 浏览器隐私扩展

[English](README.md) · **简体中文**

![版本 2.5.0](https://img.shields.io/badge/Version-2.5.0-6554e8)
![支持 Chrome 和 Edge](https://img.shields.io/badge/Browser-Chrome%20%26%20Edge-2563eb)
![Manifest V3](https://img.shields.io/badge/Extension-Manifest%20V3-16836a)

**Prehider 让你自定义网站能读取的设备、语言、时区和定位信息。**

可以把不同场景的配置保存成预设，从浏览器工具栏快速切换。遇到兼容问题时，可以单独排除相关网站。需要设置固定位置时，可在内置离线地图上选点，也可切换到在线街道地图查看道路和路口。

[下载发布版](https://github.com/Markmarkevo/Prehider/releases/latest) · [安装](#安装) · [功能](#功能) · [设置固定位置](#设置固定位置) · [隐私与兼容性](#隐私与兼容性) · [反馈问题](https://github.com/Markmarkevo/Prehider/issues)

## 一眼了解

| 项目 | 说明 |
| --- | --- |
| 当前版本 | 2.5.0 |
| 支持浏览器 | Chrome 111 及以上、基于 Chromium 的 Microsoft Edge |
| 安装方式 | 下载 ZIP 并解压，在扩展管理页加载 |
| 操作入口 | 工具栏面板显示当前预设和网站状态，点击「打开详情设置」可调整各项配置 |
| 地图选点 | 默认使用离线世界地图，可切换到在线街道地图 |
| 界面 | 简体中文和英文，支持跟随系统、浅色、深色和海洋主题 |

## 安装

1. 打开发布页，在 **Assets** 中下载 **Prehider-2.5.0.zip** 并解压。
2. 在 Chrome 打开 `chrome://extensions`，或在 Edge 打开 `edge://extensions`。
3. 开启「开发者模式」，点击「加载已解压的扩展程序」，选择包含 `manifest.json` 的文件夹。
4. 从浏览器工具栏打开 Prehider。将它固定在工具栏后，可以更快地切换预设和排除网站。

更新时，将新版文件解压到原来的扩展目录，在扩展管理页点击 Prehider 卡片上的「重新加载」，然后刷新需要应用设置的网页。

## 功能

| 功能 | 用法 |
| --- | --- |
| 设备配置 | 从 Windows、macOS、Linux 或 Android 配置开始，可分别调整浏览器标识、屏幕、硬件、显卡和字体。 |
| 自定义预设 | 保存、应用、覆盖或删除已命名的配置。概览和工具栏面板会显示当前预设名，手动配置显示为「自定义」。 |
| 语言和时区 | 调整浏览器语言、请求语言、默认地区格式以及网站读取到的时区。 |
| 固定位置 | 在地图上选点、选择预置城市，或手动输入经纬度和精度。 |
| 指纹设置 | 调整网站可读取的字体和朗读语音，为支持的 Canvas、WebGL 和音频读数加入稳定噪声。 |
| 网站排除 | 在工具栏面板排除当前网站，或在详情设置的「网站」页管理域名。保存后刷新相关网页。 |
| WebRTC | 限制非代理 UDP，并查看当前策略由浏览器还是其他扩展控制。 |

要保存一套配置，打开「设备 → 自定义预设」，填写名称并点击「保存当前配置」。应用预设时会保留总开关、网站排除和外观设置。

## 设置固定位置

1. 打开详情设置中的「语言与时区 → 固定位置」。
2. 在离线地图上点击选点，也可选择城市或输入经纬度。需要定位到街道或路口时，切换到「在线街道地图」。
3. 设置精度（米），然后点击「保存位置」。也可把这个位置一并保存到自定义预设。

离线地图随扩展提供。在线街道地图在主动切换后开始加载。加载失败时，Prehider 会切回离线地图，并保留表单里选中的坐标。

## 隐私与兼容性

- **本地设置。** 设置、预设和已保存的坐标都储存在当前浏览器配置中。
- **在线地图请求。** OpenFreeMap 会收到你的出口 IP，以及反映浏览区域和缩放级别的地图请求。选点计算和经纬度保存都在扩展本地完成。 [OpenFreeMap 隐私政策](https://openfreemap.org/privacy/)
- **定位权限。** 网站已获定位权限且浏览器定位成功时，固定位置才会通过网页定位 API 生效。网站仍可根据网络 IP 推断位置。
- **网站兼容性。** 如果网站加载缓慢或反复出现验证，可以排除该域名并刷新。Gmail 默认已排除。WebRTC 策略是浏览器全局设置。
- **浏览器限制。** 较早执行的页面脚本和部分 Worker 可能读到浏览器的原始值。设备配置会调整报告给网站的数值，实际图形渲染和网络行为仍取决于运行环境。

## 开发

- 运行 `python tools/e2e_test.py`，用无界面的 Chrome 检查设置面板和页面脚本。
- 运行 `python tools/make_icons.py`，重新生成扩展图标。

离线地图使用 Natural Earth 的公共领域数据。在线街道地图由 OpenFreeMap 提供，基于 OpenMapTiles 和 OpenStreetMap 数据。仓库保留了内置 MapLibre GL JS 6.19.0 的许可证。 [Natural Earth 数据](https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson) · [OpenFreeMap](https://openfreemap.org/) · [OpenMapTiles](https://openmaptiles.org/) · [OpenStreetMap 许可](https://www.openstreetmap.org/copyright) · [MapLibre 许可证](popup/vendor/maplibre/LICENSE.txt)

Ciallo～(∠・ω< )⌒☆
