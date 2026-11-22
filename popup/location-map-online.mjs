import { Map, Marker, setWorkerUrl } from './vendor/maplibre/maplibre-gl.mjs';

const TILE_ORIGIN = 'https://tiles.openfreemap.org';
const MAX_MAP_LATITUDE = 85.051129;

setWorkerUrl(new URL('./vendor/maplibre/maplibre-gl-worker.mjs', import.meta.url).href);

function mapCenter(longitude, latitude) {
  return [longitude, Math.max(-MAX_MAP_LATITUDE, Math.min(MAX_MAP_LATITUDE, latitude))];
}

export function makeOnlineMap(layer, view, initialPoint, onPick, onReady, onError) {
  const container = layer.querySelector('.location-map-surface');
  const center = mapCenter(view.longitude, view.latitude);
  const centeredOnPoint = initialPoint?.longitude === view.longitude && initialPoint?.latitude === view.latitude;
  const zoom = Math.log2(view.width * view.zoom / 512);
  const map = new Map({
    container,
    style: TILE_ORIGIN + '/styles/liberty',
    center,
    zoom: Math.max(zoom, centeredOnPoint ? 10 : 0),
    maxZoom: 20,
    maxPitch: 0,
    dragRotate: false,
    scrollZoom: false,
    attributionControl: false,
    transformRequest(url) {
      if (new URL(url).origin !== TILE_ORIGIN) throw Error('Unexpected online map resource');
      return { url, credentials: 'omit', referrerPolicy: 'no-referrer' };
    }
  });
  map.once('idle', onReady);
  map.on('error', () => queueMicrotask(onError));
  map.on('webglcontextlost', onError);

  const zoomIn = layer.querySelector('[data-map-zoom="in"]');
  const zoomOut = layer.querySelector('[data-map-zoom="out"]');
  const reset = layer.querySelector('[data-map-reset]');
  function updateZoomButtons() {
    zoomIn.disabled = map.getZoom() >= map.getMaxZoom();
    zoomOut.disabled = map.getZoom() <= map.getMinZoom();
  }
  function zoomMap(step) {
    map.zoomTo(map.getZoom() + step, { duration: 0 });
  }
  function resetMap() {
    map.jumpTo({ center: [0, 0], zoom: 0 });
  }
  // Abort these listeners when unloading the online map. The buttons are shared by later instances.
  const controls = new AbortController();
  zoomIn.addEventListener('click', () => zoomMap(1), { signal: controls.signal });
  zoomOut.addEventListener('click', () => zoomMap(-1), { signal: controls.signal });
  reset.addEventListener('click', resetMap, { signal: controls.signal });
  map.on('zoom', updateZoomButtons);
  updateZoomButtons();

  function pick(location) {
    const { lng, lat } = location.wrap();
    onPick(lat.toFixed(6), lng.toFixed(6));
  }
  map.on('click', (event) => pick(event.lngLat));
  const canvas = map.getCanvas();
  canvas.dataset.i18nAria = 'location_map_title';
  canvas.setAttribute('aria-label', layer.closest('.location-map').querySelector('[data-map-offline] canvas').getAttribute('aria-label'));
  canvas.setAttribute('aria-describedby', 'location-map-help');
  canvas.addEventListener('focus', () => map.scrollZoom.enable());
  canvas.addEventListener('blur', () => map.scrollZoom.disable());
  canvas.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') pick(map.getCenter());
    else if (event.key === 'Home') resetMap();
    else return;
    event.preventDefault();
  });

  const pin = document.createElement('span');
  pin.className = 'location-map-pin';
  pin.setAttribute('aria-hidden', 'true');
  const marker = new Marker({ element: pin });
  let point = null;
  function setPoint(next, recenter) {
    if (point?.latitude === next?.latitude && point?.longitude === next?.longitude) return;
    point = next;
    if (!point) {
      marker.remove();
      return;
    }
    const coordinates = mapCenter(point.longitude, point.latitude);
    marker.setLngLat(coordinates).addTo(map);
    if (recenter) map.jumpTo({ center: coordinates, zoom: Math.max(12, map.getZoom()) });
  }
  setPoint(initialPoint, false);

  return {
    setPoint,
    getView() {
      const { lng: longitude, lat: latitude } = map.getCenter().wrap();
      return { longitude, latitude, zoom: 512 * 2 ** map.getZoom() / container.clientWidth };
    },
    remove() {
      controls.abort();
      marker.remove();
      map.remove();
    }
  };
}
