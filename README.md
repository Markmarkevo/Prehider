# Prehider

![Version 2.5.0](https://img.shields.io/badge/Version-2.5.0-6554e8)
![Chrome and Edge](https://img.shields.io/badge/Browser-Chrome%20%26%20Edge-2563eb)
![Manifest V3](https://img.shields.io/badge/Extension-Manifest%20V3-16836a)

**Prehider is a browser privacy extension that lets you control the device, regional, and location values websites can read.**

Save different settings as named presets, switch between them from the toolbar, and exclude websites that work better with your browser's defaults. Pick a fixed location on the built-in offline map or switch to a street map when you need more detail.

[Download ZIP](https://github.com/Markmarkevo/Prehider/archive/refs/heads/main.zip) · [Install](#install) · [Features](#features) · [Choose a fixed location](#choose-a-fixed-location) · [Privacy and compatibility](#privacy-and-compatibility) · [Report an issue](https://github.com/Markmarkevo/Prehider/issues)

## At a glance

| Item | Details |
| --- | --- |
| Current version | 2.5.0 |
| Browsers | Chrome 111+ and Chromium-based Microsoft Edge |
| Installation | Load the unpacked extension. The download contains all required files. |
| Where to start | Open Prehider from the toolbar for the current preset and site controls. Choose **Open settings** for detailed controls. |
| Location picker | Offline world map by default. Optional online street map. |
| Interface | English and Simplified Chinese, with System, Light, Dark, and Ocean themes |

## Install

1. Download the project ZIP and extract it.
2. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
3. Turn on **Developer mode**, choose **Load unpacked**, and select the extracted folder containing `manifest.json`.
4. Open Prehider from the browser toolbar. Pin it to the toolbar for quick access to presets and site exclusions.

To update, replace the files in the loaded folder and click **Reload** on Prehider's extension card. Refresh any tabs where you want the new settings to take effect.

## Features

| Feature | What you can control |
| --- | --- |
| Device profiles | Start with Windows, macOS, Linux, or Android. Adjust browser identity, screen dimensions, reported hardware, GPU values, and fonts individually. |
| Saved presets | Save, apply, overwrite, and delete named configurations. The dashboard and toolbar show the active preset or **Custom**. |
| Language and time zone | Set browser and request languages, default locale formatting, and the time zone exposed to websites. |
| Fixed location | Pick a point on a map, select a city, or enter coordinates and an accuracy radius. |
| Fingerprint settings | Adjust exposed fonts and speech voices, and enable stable noise for supported canvas, WebGL, and audio readouts. |
| Site exclusions | Use the toolbar toggle for the current site, or add domains and subdomains in **Sites**. Refresh affected tabs after saving. |
| WebRTC | Restrict non-proxied UDP and see which browser setting or extension controls the current policy. |

To save a configuration for later, open **Device → Custom presets**, enter a name, and click **Save current settings**. Applying a preset retains your master switch, site exclusions, and appearance preferences.

## Choose a fixed location

1. Open **Language & time → Fixed location**.
2. Click the offline map, pick a city, or enter latitude and longitude. Choose **Online street map** to zoom in on roads and intersections.
3. Set the accuracy in meters and click **Save location**. The fixed location can also be included in a saved preset.

The offline map is bundled with the extension. The street map loads when you select it. If the online map fails to load, Prehider switches back to the offline map with the selected coordinates still in the form.

## Privacy and compatibility

- **Local settings.** Settings, presets, and saved coordinates are stored in your browser profile.
- **Online map requests.** OpenFreeMap receives your connection IP and map requests that reveal the area and zoom level you view. Prehider calculates the selected point in the extension. [OpenFreeMap privacy policy](https://openfreemap.org/privacy/)
- **Location permissions.** A fixed position applies to the browser Geolocation API when the page has permission and the browser's location service succeeds. Websites can still estimate location from your network IP.
- **Site compatibility.** If a site loads slowly or a verification page repeats, exclude the domain and refresh the tab. Gmail is excluded by default. WebRTC settings apply browser-wide.
- **Browser limits.** Early page scripts and some workers can read native values. Device profiles change reported values while graphics rendering and network behavior still reflect the host environment.

## Development

- Run `python tools/e2e_test.py` to smoke-test the settings UI and page scripts in headless Chrome.
- Run `python tools/make_icons.py` to regenerate the extension icons.

The offline map uses public-domain Natural Earth data. The optional street map is served by OpenFreeMap using OpenMapTiles and OpenStreetMap data. The MapLibre GL JS 6.19.0 bundle includes its license in the repository. [Natural Earth data](https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/geojson) · [OpenFreeMap](https://openfreemap.org/) · [OpenMapTiles](https://openmaptiles.org/) · [OpenStreetMap license](https://www.openstreetmap.org/copyright) · [MapLibre license](popup/vendor/maplibre/LICENSE.txt)
