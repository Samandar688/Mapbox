import React, { useRef, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';

import { mockStations } from './mockStations';
import { buildStationFeatures } from './utils/MapUtils';

// ✅ Mapbox token
Mapbox.setAccessToken('pk.eyJ1IjoiZG9taW5hbmQiLCJhIjoiY21qc2N1OGQ5MGhpOTNjcXdzaXJ6cjdxbyJ9.MzO3-7XIy1HPd7jC0ka07g');

// ✅ Port status ranglari (segmentlar uchun)
const STATUS_COLOR = {
  FREE: '#4CAF50',
  BUSY: '#FFC107',
  OFFLINE: '#9E9E9E',
};

// ✅ Brand ranglari (markazdagi rounded-rect uchun)
const BRAND_COLOR = {
  TOK: '#7C3AED',      // purple
  UZCHARGE: '#22C55E',  // green
  VOLT: '#2563EB',     // blue
  MEGO: '#F97316',     // orange (agar keyin qo‘shsang)
  default: '#0B1220',
};

function colorByStatus(status) {
  return STATUS_COLOR[status] ?? STATUS_COLOR.OFFLINE;
}

export default function App() {
  const camera = useRef(null);
  const mapRef = useRef(null); // ✅ Map ref for setFeatureState
  const sourceRef = useRef(null);

  const [userCoords, setUserCoords] = useState(null);

  // ✅ 1) GeoJSON — faqat 1 marta build (eng katta fix)
  const stationCollection = useMemo(() => {
    const allFeatures = mockStations.flatMap(station => buildStationFeatures(station));
    return {
      type: 'FeatureCollection',
      features: allFeatures,
    };
  }, []);

  // ✅ 2) Location permission
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Xatolik', 'Joylashuvingizni aniqlash uchun ruxsat kerak!');
      }
    })();
  }, []);

  // ✅ 3) Realtime (demo) — endi setTick yo'q, faqat feature-state update
  useEffect(() => {
    const interval = setInterval(() => {
      const st = mockStations[Math.floor(Math.random() * mockStations.length)];
      if (!st?.ports) return;

      const keys = Object.keys(st.ports);
      if (!keys.length) return;

      const portIndex = Math.floor(Math.random() * keys.length);
      const statuses = ['FREE', 'BUSY', 'OFFLINE'];
      const newStatus = statuses[Math.floor(Math.random() * statuses.length)];

      // local mock update (ixtiyoriy)
      const portId = keys[portIndex];
      st.ports[portId].status = newStatus;

      // ✅ Segment rangini feature-state bilan yangilash (MAP REF orqali!)
      const segFid = `seg:${st.stationId}:${portIndex}`;
      mapRef.current?.setFeatureState(
        { sourceId: 'stations-source', id: segFid },
        { c: colorByStatus(newStatus) }
      );
    }, 250);

    return () => clearInterval(interval);
  }, []);

  // ✅ 4) Startda hamma segmentlarga initial rang berib chiqamiz (1 marta)
  useEffect(() => {
    // Map yuklangandan keyin bir oz kechikib bersak, ishonchliroq
    const t = setTimeout(() => {
      for (const st of mockStations) {
        const keys = Object.keys(st.ports || {}).sort();
        for (let i = 0; i < keys.length; i++) {
          const status = st.ports[keys[i]]?.status ?? 'OFFLINE';
          const fid = `seg:${st.stationId}:${i}`;
          mapRef.current?.setFeatureState(
            { sourceId: 'stations-source', id: fid },
            { c: colorByStatus(status) }
          );
        }
      }
    }, 600);

    return () => clearTimeout(t);
  }, []);

  const onUserLocationUpdate = (location) => {
    if (location?.coords) {
      setUserCoords([location.coords.longitude, location.coords.latitude]);
    }
  };

  const moveToUserLocation = () => {
    if (!userCoords) return;
    camera.current?.setCamera({
      centerCoordinate: userCoords,
      zoomLevel: 15,
      animationDuration: 900,
    });
  };

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Outdoors}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
      >
        <Mapbox.Camera
          ref={camera}
          zoomLevel={12}
          centerCoordinate={[69.2401, 41.2995]}
          animationDuration={800}
        />

        <Mapbox.UserLocation
          visible
          animated
          androidRenderMode="gps"
          onUpdate={onUserLocationUpdate}
        />

        <Mapbox.ShapeSource
          id="stations-source"
          ref={sourceRef}
          shape={stationCollection}
        >
          {/* ===========================
              1) PORT SEGMENTLAR (HALQA)
             =========================== */}
          <Mapbox.LineLayer
            id="segments-layer"
            filter={['==', ['get', 'kind'], 'seg']}
            style={{
              lineWidth: [
                'interpolate', ['linear'], ['zoom'],
                10, 2,
                15, 6,
                20, 12
              ],
              lineCap: 'round',
              lineJoin: 'round',
              // ✅ Realtime rang feature-state'dan
              lineColor: ['coalesce', ['feature-state', 'c'], STATUS_COLOR.OFFLINE],
            }}
          />

          {/* ===========================
              2) MARKAZ (ROUNDED-RECT)
                 Brand rangida
             =========================== */}
          <Mapbox.FillLayer
            id="center-fill"
            filter={['==', ['get', 'kind'], 'center']}
            style={{
              fillColor: [
                'match',
                ['get', 'brand'],
                'TOK', BRAND_COLOR.TOK,
                'UZCHARGE', BRAND_COLOR.UZCHARGE,
                'VOLT', BRAND_COLOR.VOLT,
                'MEGO', BRAND_COLOR.MEGO,
                BRAND_COLOR.default
              ],
              fillOpacity: 1,
            }}
          />

          <Mapbox.LineLayer
            id="center-stroke"
            filter={['==', ['get', 'kind'], 'center']}
            style={{
              lineWidth: [
                'interpolate', ['linear'], ['zoom'],
                10, 1,
                16, 3,
                20, 6
              ],
              lineColor: '#FFFFFF',
              lineOpacity: 0.85,
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />

          {/* ==========================================================
             3) 2-HOLAT: Markazga RASM qo‘yish (hozircha kommentda)
             - Bunda siz Mapbox.Images bilan iconlarni yuklaysiz
             - buildStationFeatures ichida `kind: 'station'` point qaytarish kerak
             - Bu yo‘l metrga 100% mos bo‘lmaydi, lekin zoom expression bilan
               juda yaqin qilib qo‘yish mumkin.
          =========================================================== */}

          {/*
          <Mapbox.Images images={{
            neo_power: require('./img/neo_power.png'),
            tez_quvvat: require('./img/tez_quvvat.png'),
            watt: require('./img/watt.png'),
            default_icon: require('./img/neo_power.png'),
          }} />

          <Mapbox.SymbolLayer
            id="icons-layer"
            filter={['==', ['get', 'kind'], 'station']}
            style={{
              iconImage: ['get', 'icon'],
              iconAllowOverlap: true,
              iconIgnorePlacement: true,
              iconSize: [
                'interpolate', ['linear'], ['zoom'],
                10, 0.08,
                13, 0.14,
                16, 0.22,
                20, 0.35
              ],
            }}
          />
          */}

        </Mapbox.ShapeSource>
      </Mapbox.MapView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={moveToUserLocation}>
          <Text style={{ fontSize: 24 }}>📍</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttonsContainer: {
    position: 'absolute',
    top: 60,
    right: 16,
    gap: 12,
  },
  actionBtn: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
