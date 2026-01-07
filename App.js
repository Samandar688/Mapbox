import React, { useState, useRef, useEffect, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, SafeAreaView } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import * as Location from 'expo-location';
import { MapboxNavigationView } from '@youssefhenna/expo-mapbox-navigation';
import { mockStations, INITIAL_STATUS_MAP } from './mockStations';
import { StationDetails } from './StationDetails';
import { StationList } from './StationList';
import { StationMarker } from './StationMarker';

// Set your Mapbox Access Token
Mapbox.setAccessToken('pk.eyJ1IjoiZG9taW5hbmQiLCJhIjoiY21qc2N1OGQ5MGhpOTNjcXdzaXJ6cjdxbyJ9.MzO3-7XIy1HPd7jC0ka07g');

export default function App() {
  const camera = useRef(null);
  const [userCoords, setUserCoords] = useState(null);
  const [statusMap, setStatusMap] = useState(INITIAL_STATUS_MAP);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [destination, setDestination] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showList, setShowList] = useState(false);

  // Toggle day/night mode
  const toggleDayNight = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 1. Request Location Permissions
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Xatolik', 'Joylashuvingizni aniqlash uchun ruxsat kerak!');
      }
    })();
  }, []);

  // 2. Simulate Port Status Changes (Every 3 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      setStatusMap(currentMap => {
        const newMap = { ...currentMap };
        const randomIndex = Math.floor(Math.random() * mockStations.length);
        const targetStationId = mockStations[randomIndex].stationId;

        if (newMap[targetStationId]) {
          const portKeys = Object.keys(newMap[targetStationId]);
          const randomPortKey = portKeys[Math.floor(Math.random() * portKeys.length)];
          const statuses = ['FREE', 'BUSY', 'OFFLINE'];
          newMap[targetStationId] = {
            ...newMap[targetStationId],
            [randomPortKey]: statuses[Math.floor(Math.random() * statuses.length)]
          };
        }
        return newMap;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const onUserLocationUpdate = (location) => {
    if (location && location.coords) {
      setUserCoords([location.coords.longitude, location.coords.latitude]);
    }
  };

  const moveToUserLocation = () => {
    if (userCoords) {
      camera.current?.setCamera({
        centerCoordinate: userCoords,
        zoomLevel: 15,
        animationDuration: 1000,
      });
    }
  };

  const startNavigation = (coords) => {
    Alert.alert(
      "Navigatsiya",
      "Ushbu stansiyagacha yo'l ko'rsataymi?",
      [
        { text: "Yo'q", style: "cancel" },
        {
          text: "Ha", onPress: () => {
            setDestination(coords);
            setIsNavigating(true);
          }
        }
      ]
    );
  };

  // Navigation Mode
  if (isNavigating && userCoords && destination) {
    return (
      <View style={styles.container}>
        <MapboxNavigationView
          style={{ flex: 1 }}
          coordinates={[
            { longitude: userCoords[0], latitude: userCoords[1] },
            { longitude: destination[0], latitude: destination[1] }
          ]}
          onArrive={() => setIsNavigating(false)}
          onCancelNavigation={() => setIsNavigating(false)}
        />

        {/* Back Button */}
        <SafeAreaView style={styles.navHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setIsNavigating(false)}
          >
            <Text style={{ fontSize: 28 }}>⬅️</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        style={styles.map}
        styleURL={isDarkMode ? Mapbox.StyleURL.Dark : Mapbox.StyleURL.Outdoors}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        projection="globe"
      >
        <Mapbox.Camera
          ref={camera}
          zoomLevel={12}
          centerCoordinate={[69.2401, 41.2995]}
          pitch={45}
          animationDuration={1000}
        />

        {/* 3D Buildings Layer - visible only when zoomed in */}
        <Mapbox.FillExtrusionLayer
          id="3d-buildings"
          sourceID="composite"
          sourceLayerID="building"
          minZoomLevel={14}
          filter={['==', 'extrude', 'true']}
          style={{
            fillExtrusionColor: isDarkMode ? '#1a1a2e' : '#d4d4d8',
            fillExtrusionHeight: ['get', 'height'],
            fillExtrusionBase: ['get', 'min_height'],
            fillExtrusionOpacity: isDarkMode ? 0.8 : 0.6,
          }}
        />

        <Mapbox.UserLocation
          visible={true}
          animated={true}
          androidRenderMode="gps"
          onUpdate={onUserLocationUpdate}
        />

        {/* Individual Station Markers */}
        {!showList && mockStations.map((station) => (
          <StationMarker
            key={`${station.stationId}-${statusMap[station.stationId] ? Object.values(statusMap[station.stationId]).join('') : ''}`}
            item={station}
            coordinate={station.coordinate}
            dynamicStatusObj={statusMap[station.stationId]}
            onPress={(s) => setSelectedStation(s)}
          />
        ))}

      </Mapbox.MapView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={moveToUserLocation}>
          <Text style={{ fontSize: 24 }}>📍</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowList(true)}>
          <Text style={{ fontSize: 24 }}>📋</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, isDarkMode && styles.actionBtnDark]}
          onPress={toggleDayNight}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 24 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Station List Modal */}
      {showList && (
        <StationList
          stations={mockStations}
          userCoords={userCoords}
          onClose={() => setShowList(false)}
          onSelect={(station) => {
            setShowList(false);
            setSelectedStation(station);
            camera.current?.setCamera({
              centerCoordinate: station.coordinate,
              zoomLevel: 15,
              animationDuration: 1000,
            });
          }}
        />
      )}

      {/* Station Details Modal */}
      {selectedStation && (
        <StationDetails
          station={selectedStation}
          statusMap={statusMap}
          onClose={() => setSelectedStation(null)}
          onRoute={(coords) => startNavigation(coords)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
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
  actionBtnDark: {
    backgroundColor: '#1a1a2e',
    shadowColor: '#fff',
    shadowOpacity: 0.1,
  },
  navHeader: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 100,
  },
  backButton: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});