import React from 'react';
import { StyleSheet, View } from 'react-native';
import Mapbox from '@rnmapbox/maps';

// Public Access Tokenni shu yerga qo'ying
Mapbox.setAccessToken('pk.eyJ1IjoiZG9taW5hbmQiLCJhIjoiY21qc2N1OGQ5MGhpOTNjcXdzaXJ6cjdxbyJ9.MzO3-7XIy1HPd7jC0ka07g');

export default function App() {
  return (
    <View style={styles.container}>
      <Mapbox.MapView style={styles.map}>
        <Mapbox.Camera
          zoomLevel={12}
          centerCoordinate={[69.2401, 41.2995]} // Toshkent
        />
      </Mapbox.MapView>
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
});