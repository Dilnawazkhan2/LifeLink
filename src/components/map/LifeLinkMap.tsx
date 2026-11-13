import { Camera, Map, Marker, type CameraRef } from '@maplibre/maplibre-react-native';
import { MapPin } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/colors';

import { MAP_STYLE, markerColors, type LifeLinkMapProps, type MapPoint } from './types';

export { DEFAULT_CENTER, MAP_STYLE, type LifeLinkMapProps, type MapPoint } from './types';

/** Android/iOS map (MapLibre native, OpenStreetMap tiles). Same props as LifeLinkMap.web.tsx. */
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
  const camera = useRef<CameraRef>(null);
  const mounted = useRef(false);

  // Follow centre/zoom changes made by the screen (e.g. "Use my location").
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    camera.current?.easeTo({ center: [center.lng, center.lat], zoom, duration: 600 });
  }, [center.lat, center.lng, zoom]);

  return (
    <View style={[styles.wrap, style]} testID={testID}>
      <Map
        style={StyleSheet.absoluteFill}
        mapStyle={MAP_STYLE}
        dragPan={interactive}
        touchZoom={interactive}
        doubleTapZoom={interactive}
        touchRotate={false}
        touchPitch={false}
        compass={false}
        logo={false}
        attribution
        onPress={onPress ? (e) => onPress({ lat: e.nativeEvent.lngLat[1], lng: e.nativeEvent.lngLat[0] }) : undefined}
        onRegionDidChange={
          onCenterChange
            ? (e) => onCenterChange({ lat: e.nativeEvent.center[1], lng: e.nativeEvent.center[0] }, e.nativeEvent.zoom, e.nativeEvent.userInteraction)
            : undefined
        }>
        <Camera ref={camera} initialViewState={{ center: [center.lng, center.lat], zoom }} />
        {userLocation ? (
          <Marker id="me" lngLat={[userLocation.lng, userLocation.lat]}>
            <View style={styles.me} />
          </Marker>
        ) : null}
        {points.map((p) => (
          <Marker key={p.id} id={p.id} lngLat={[p.lng, p.lat]} anchor="bottom" onPress={() => onPointPress?.(p.id)}>
            <MarkerBadge point={p} />
          </Marker>
        ))}
      </Map>
      {centerPin ? (
        <View pointerEvents="none" style={styles.pinWrap}>
          <MapPin size={44} color={Colors.white} fill={Colors.primary} strokeWidth={1.6} />
        </View>
      ) : null}
    </View>
  );
}

function MarkerBadge({ point }: { point: MapPoint }) {
  const c = markerColors(point);
  return (
    <View style={styles.markerCol}>
      <View
        style={[
          styles.marker,
          { backgroundColor: c.bg, borderColor: c.border },
          point.kind === 'request' && styles.requestMarker,
          point.selected && styles.selected,
        ]}>
        <Text style={[styles.markerText, { color: c.fg }]}>{point.label ?? ''}</Text>
      </View>
      <View style={[styles.tail, { borderTopColor: point.kind === 'donor' ? c.border : c.bg }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden', borderRadius: 20, backgroundColor: '#E5E7EB' },
  me: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#2563EB', borderWidth: 3, borderColor: '#FFFFFF' },
  markerCol: { alignItems: 'center' },
  marker: {
    minWidth: 38,
    height: 30,
    paddingHorizontal: 6,
    borderRadius: 15,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestMarker: { borderRadius: 9 },
  selected: { transform: [{ scale: 1.2 }] },
  markerText: { fontSize: 13, fontWeight: '800' },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  pinWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', paddingBottom: 40 },
});
