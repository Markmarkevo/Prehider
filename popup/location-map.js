(function () {
  'use strict';

  const MAX_ZOOM = 256;
  const ZOOM_STEP = 1.7;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function mapPath(lines, close = false) {
    const path = new Path2D();
    for (const line of lines) {
      const [first, ...rest] = line;
      path.moveTo(first[0], -first[1]);
      for (const [longitude, latitude] of rest) path.lineTo(longitude, -latitude);
      if (close) path.closePath();
    }
    return path;
  }

  function makeOfflineMap(root, onPick) {
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const error = root.closest('.location-map').querySelector('.location-map-error');
    const zoomIn = root.querySelector('[data-map-zoom="in"]');
    const zoomOut = root.querySelector('[data-map-zoom="out"]');
    const reset = root.querySelector('[data-map-reset]');
    const view = { longitude: 0, latitude: 0, zoom: 1 };
    let point = null;
    let map = null;
    let loading = false;
    let frame = 0;
    let drag = null;

    const size = () => ({ width: canvas.clientWidth, height: canvas.clientHeight });
    const scale = ({ width, height }) => ({ x: width * view.zoom / 360, y: height * view.zoom / 180 });

    function limitView() {
      const marginX = 180 / view.zoom;
      const marginY = 90 / view.zoom;
      view.longitude = clamp(view.longitude, -180 + marginX, 180 - marginX);
      view.latitude = clamp(view.latitude, -90 + marginY, 90 - marginY);
    }

    function coordinates(x, y) {
      const bounds = size();
      const factor = scale(bounds);
      return {
        longitude: view.longitude + (x - bounds.width / 2) / factor.x,
        latitude: view.latitude - (y - bounds.height / 2) / factor.y
      };
    }

    function scheduleDraw() {
      if (!frame) frame = requestAnimationFrame(draw);
    }

    async function load() {
      loading = true;
      try {
        const response = await fetch('location-map-data.json');
        if (!response.ok) throw Error('Map data unavailable');
        const data = await response.json();
        map = {
          land: mapPath(data.land, true),
          lakes: mapPath(data.lakes, true),
          borders: mapPath(data.borders),
          disputed: mapPath(data.disputed),
          places: data.places
        };
        scheduleDraw();
      } catch (e) {
        error.hidden = false;
      }
    }

    function draw() {
      frame = 0;
      const bounds = size();
      const { width, height } = bounds;
      if (!ctx || !width || !height) return;
      if (!loading) load();
      const density = Math.min(devicePixelRatio || 1, 2);
      const pixelWidth = Math.round(width * density);
      const pixelHeight = Math.round(height * density);
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      const { x: scaleX, y: scaleY } = scale(bounds);
      const originX = width / 2 - view.longitude * scaleX;
      const originY = height / 2 + view.latitude * scaleY;
      const style = getComputedStyle(canvas);
      const color = (name) => style.getPropertyValue('--map-' + name).trim();

      ctx.setTransform(density, 0, 0, density, 0, 0);
      ctx.fillStyle = color('water');
      ctx.fillRect(0, 0, width, height);
      ctx.setTransform(density * scaleX, 0, 0, density * scaleY, density * originX, density * originY);
      if (map) {
        ctx.fillStyle = color('land');
        ctx.fill(map.land, 'evenodd');
        ctx.fillStyle = color('water');
        ctx.fill(map.lakes, 'evenodd');
        ctx.lineWidth = 0.8 / Math.max(scaleX, scaleY);
        ctx.strokeStyle = color('coast');
        ctx.stroke(map.land);
        ctx.stroke(map.lakes);
        ctx.strokeStyle = color('border');
        ctx.stroke(map.borders);
        ctx.setLineDash([2 / scaleX, 3 / scaleX]);
        ctx.stroke(map.disputed);
        ctx.setLineDash([]);
      }
      const step = view.zoom < 4 ? 30 : view.zoom < 20 ? 10 : view.zoom < 70 ? 2 : 0.5;
      ctx.beginPath();
      const west = view.longitude - 180 / view.zoom;
      const east = view.longitude + 180 / view.zoom;
      const south = view.latitude - 90 / view.zoom;
      const north = view.latitude + 90 / view.zoom;
      for (let x = Math.ceil(west / step) * step; x <= east; x += step) {
        ctx.moveTo(x, -north);
        ctx.lineTo(x, -south);
      }
      for (let y = Math.ceil(south / step) * step; y <= north; y += step) {
        ctx.moveTo(west, -y);
        ctx.lineTo(east, -y);
      }
      ctx.lineWidth = 0.7 / Math.max(scaleX, scaleY);
      ctx.strokeStyle = color('grid');
      ctx.stroke();

      ctx.setTransform(density, 0, 0, density, 0, 0);
      const pointX = (longitude) => originX + longitude * scaleX;
      const pointY = (latitude) => originY - latitude * scaleY;
      if (map) {
        const maxRank = view.zoom < 2 ? 1 : view.zoom < 5 ? 2 : view.zoom < 14 ? 4 : 10;
        const inChinese = document.documentElement.lang.startsWith('zh');
        const labels = [];
        ctx.font = '600 11px system-ui, "Microsoft YaHei", sans-serif';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        for (const [longitude, latitude, rank, english, chinese] of map.places) {
          if (rank > maxRank) continue;
          const x = pointX(longitude);
          const y = pointY(latitude);
          const label = inChinese ? chinese : english;
          if (x < 4 || x > width - 4 || y < 10 || y > height - 10) continue;
          const labelWidth = ctx.measureText(label).width;
          if (x + labelWidth + 8 > width || labels.some(([left, right, top]) => Math.abs(y - top) < 15 && x < right && x + labelWidth + 10 > left)) continue;
          labels.push([x, x + labelWidth + 10, y]);
          ctx.fillStyle = color('label');
          ctx.beginPath();
          ctx.arc(x, y, 2.3, 0, Math.PI * 2);
          ctx.fill();
          ctx.lineWidth = 3;
          ctx.strokeStyle = color('halo');
          ctx.strokeText(label, x + 6, y);
          ctx.fillText(label, x + 6, y);
        }
      }
      if (point) {
        const x = pointX(point.longitude);
        const y = pointY(point.latitude);
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fillStyle = color('pin-halo');
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = style.getPropertyValue('--accent').trim();
        ctx.fill();
        ctx.strokeStyle = color('halo');
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      zoomOut.disabled = view.zoom === 1;
      zoomIn.disabled = view.zoom === MAX_ZOOM;
    }

    function zoom(multiplier, x, y) {
      const { width, height } = size();
      const anchorX = x ?? width / 2;
      const anchorY = y ?? height / 2;
      const anchor = coordinates(anchorX, anchorY);
      view.zoom = clamp(view.zoom * multiplier, 1, MAX_ZOOM);
      const shifted = coordinates(anchorX, anchorY);
      view.longitude += anchor.longitude - shifted.longitude;
      view.latitude += anchor.latitude - shifted.latitude;
      limitView();
      scheduleDraw();
    }

    function pan(x, y) {
      Object.assign(view, coordinates(canvas.clientWidth / 2 + x, canvas.clientHeight / 2 + y));
      limitView();
      scheduleDraw();
    }

    function pick(x, y) {
      const { longitude, latitude } = coordinates(x, y);
      onPick(clamp(latitude, -90, 90).toFixed(4), clamp(longitude, -180, 180).toFixed(4));
    }

    zoomIn.addEventListener('click', () => zoom(ZOOM_STEP));
    zoomOut.addEventListener('click', () => zoom(1 / ZOOM_STEP));
    reset.addEventListener('click', () => {
      view.longitude = 0;
      view.latitude = 0;
      view.zoom = 1;
      scheduleDraw();
    });
    canvas.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(event.pointerId);
      drag = { x: event.clientX, y: event.clientY, moved: false };
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!event.isPrimary || !drag) return;
      const dx = drag.x - event.clientX;
      const dy = drag.y - event.clientY;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      canvas.classList.add('dragging');
      drag = { x: event.clientX, y: event.clientY, moved: true };
      pan(dx, dy);
    });
    canvas.addEventListener('pointerup', (event) => {
      if (!event.isPrimary || !drag || drag.moved) return;
      const box = canvas.getBoundingClientRect();
      pick(event.clientX - box.left, event.clientY - box.top);
    });
    canvas.addEventListener('lostpointercapture', () => {
      drag = null;
      canvas.classList.remove('dragging');
    });
    canvas.addEventListener('wheel', (event) => {
      if (document.activeElement !== canvas || !event.deltaY || drag) return;
      event.preventDefault();
      zoom(event.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, event.offsetX, event.offsetY);
    }, { passive: false });
    canvas.addEventListener('keydown', (event) => {
      const directions = { ArrowLeft: [-45, 0], ArrowRight: [45, 0], ArrowUp: [0, -45], ArrowDown: [0, 45] };
      if (Object.hasOwn(directions, event.key)) pan(...directions[event.key]);
      else if (event.key === '+' || event.key === '=') zoom(ZOOM_STEP);
      else if (event.key === '-') zoom(1 / ZOOM_STEP);
      else if (event.key === 'Enter' || event.key === ' ') pick(canvas.clientWidth / 2, canvas.clientHeight / 2);
      else if (event.key === 'Home') reset.click();
      else return;
      event.preventDefault();
    });
    new ResizeObserver(scheduleDraw).observe(canvas);
    new MutationObserver(scheduleDraw).observe(document.documentElement, { attributeFilter: ['data-theme', 'lang'] });

    return {
      getView() {
        return { ...view, width: canvas.clientWidth };
      },
      setView({ longitude, latitude, zoom }) {
        Object.assign(view, { longitude, latitude, zoom: clamp(zoom, 1, MAX_ZOOM) });
        limitView();
        scheduleDraw();
      },
      setPoint(next, recenter) {
        if (point?.latitude === next?.latitude && point?.longitude === next?.longitude) return;
        point = next;
        if (point && recenter) {
          view.latitude = point.latitude;
          view.longitude = point.longitude;
          view.zoom = Math.max(14, view.zoom);
          limitView();
        }
        scheduleDraw();
      }
    };
  }

  window.makeLocationMap = function (root, onPick) {
    const offlineLayer = root.querySelector('[data-map-offline]');
    const onlineLayer = root.querySelector('[data-map-online]');
    const offlineButton = root.querySelector('[data-map-mode="offline"]');
    const onlineButton = root.querySelector('[data-map-mode="online"]');
    const loading = root.querySelector('[data-map-loading]');
    const fallback = root.querySelector('[data-map-fallback]');
    const offline = makeOfflineMap(offlineLayer, onPick);
    let online = null;
    let point = null;
    let request = 0;
    let timer;

    function showLayer(isOnline) {
      offlineLayer.hidden = isOnline;
      onlineLayer.hidden = !isOnline;
      offlineButton.setAttribute('aria-pressed', String(!isOnline));
      onlineButton.setAttribute('aria-pressed', String(isOnline));
    }

    function useOffline(failed = false) {
      if (onlineLayer.hidden) return;
      request++;
      clearTimeout(timer);
      if (online && loading.hidden) offline.setView(online.getView());
      online?.remove();
      online = null;
      loading.hidden = true;
      fallback.hidden = !failed;
      showLayer(false);
    }

    async function useOnline() {
      if (!onlineLayer.hidden) return;
      const view = offline.getView();
      const attempt = ++request;
      const fail = () => {
        if (attempt === request) useOffline(true);
      };
      fallback.hidden = true;
      loading.hidden = false;
      showLayer(true);
      timer = setTimeout(fail, 12000);
      try {
        const { makeOnlineMap } = await import('./location-map-online.mjs');
        if (attempt !== request) return;
        online = makeOnlineMap(onlineLayer, view, point, onPick, () => {
          if (attempt !== request) return;
          clearTimeout(timer);
          loading.hidden = true;
        }, fail);
      } catch (e) {
        fail();
      }
    }

    offlineButton.addEventListener('click', () => useOffline());
    onlineButton.addEventListener('click', useOnline);

    return {
      useOffline,
      setPoint(next, recenter) {
        point = next;
        offline.setPoint(next, recenter);
        online?.setPoint(next, recenter);
      }
    };
  };
})();
