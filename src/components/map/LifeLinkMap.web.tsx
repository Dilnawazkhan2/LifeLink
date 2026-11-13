import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPin } from 'lucide-react-native';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/colors';

import { MAP_STYLE, markerColors, type LifeLinkMapProps } from './types';

export { DEFAULT_CENTER, MAP_STYLE, type LifeLinkMapProps, type MapPoint } from './types';

// maplibre-gl 6 starts a module Web Worker from a file next to its bundle, which Metro's web
// bundler does not serve. Load the exact same worker version from jsDelivr through a same-origin
// blob (workers must be same-origin). Web preview only; the Android app uses MapLibre native.
let workerReady = false;
function ensureWorker() {
  if (workerReady || typeof window === 'undefined') return;
  const src = `https://cdn.jsdelivr.net/npm/maplibre-gl@${maplibregl.getVersion()}/dist/maplibre-gl-worker.mjs`;
  maplibregl.setWorkerUrl(URL.createObjectURL(new Blob([`import ${JSON.stringify(src)};`], { type: 'text/javascript' })));
  workerReady = true;
}

/** Web map (maplibre-gl, same engine and tiles as the native app and the website). */
export function LifeLinkMap({
  center,
  zoom = 12,
  points = [],
  userLocation,
  onPointPress,
  onPress,
  onCenterChange,
  centerPin,
  interactive = true,
  style,
  testID,
}: LifeLinkMapProps) {
  const host = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const initial = useRef({ center, zoom, interactive });
  const handlers = useRef({ onPointPress, onPress, onCenterChange });
  useLayoutEffect(() => {
    handlers.current = { onPointPress, onPress, onCenterChange };
  });

  useEffect(() => {
    if (!host.current) return;
    ensureWorker();
    const { center: c, zoom: z, interactive: canMove } = initial.current;
    const m = new maplibregl.Map({
      container: host.current,
      style: MAP_STYLE,
      center: [c.lng, c.lat],
      zoom: z,
      dragRotate: false,
      pitchWithRotate: false,
      interactive: canMove,
      attributionControl: { compact: true },
    });
    m.on('click', (e: maplibregl.MapMouseEvent) => handlers.current.onPress?.({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
    m.on('moveend', (e: { originalEvent?: unknown }) => {
      const at = m.getCenter();
      handlers.current.onCenterChange?.({ lat: at.lat, lng: at.lng }, m.getZoom(), !!e.originalEvent);
    });
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const c = m.getCenter();
    if (Math.abs(c.lat - center.lat) > 1e-6 || Math.abs(c.lng - center.lng) > 1e-6 || Math.abs(m.getZoom() - zoom) > 0.01) {
      m.easeTo({ center: [center.lng, center.lat], zoom, duration: 600 });
    }
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    markers.current.forEach((mk) => mk.remove());
    markers.current = [];
    if (userLocation) {
      const dot = document.createElement('div');
      Object.assign(dot.style, { width: '16px', height: '16px', borderRadius: '50%', background: '#2563EB', border: '3px solid #fff', boxShadow: '0 0 0 2px rgba(37,99,235,.3)' });
      dot.title = 'You are here';
      markers.current.push(new maplibregl.Marker({ element: dot }).setLngLat([userLocation.lng, userLocation.lat]).addTo(m));
    }
    for (const p of points) {
      const c = markerColors(p);
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = p.label ?? '';
      el.setAttribute('aria-label', `${p.kind === 'request' ? 'Request' : 'Donor'} ${p.label ?? ''}`);
      el.dataset.markerId = p.id;
      Object.assign(el.style, {
        minWidth: '38px',
        height: '30px',
        padding: '0 6px',
        borderRadius: p.kind === 'request' ? '9px' : '15px',
        border: `2.5px solid ${c.border}`,
        background: c.bg,
        color: c.fg,
        font: '800 13px system-ui, sans-serif',
        cursor: 'pointer',
        // (maplibre positions markers with `transform`, so selection is shown with a ring)
        boxShadow: p.selected ? '0 0 0 4px rgba(196,30,58,.45), 0 2px 6px rgba(15,23,42,.25)' : '0 2px 6px rgba(15,23,42,.25)',
      });
      el.addEventListener('click', (ev) => {
        ev.stopPropagation();
        handlers.current.onPointPress?.(p.id);
      });
      markers.current.push(new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([p.lng, p.lat]).addTo(m));
    }
  }, [points, userLocation]);

  return (
    <View style={[styles.wrap, style]} testID={testID}>
      <div ref={host} style={{ position: 'absolute', inset: 0 }} />
      {centerPin ? (
        <View pointerEvents="none" style={styles.pinWrap}>
          <MapPin size={44} color={Colors.white} fill={Colors.primary} strokeWidth={1.6} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', borderRadius: 20, backgroundColor: '#E5E7EB' },
  pinWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
});
