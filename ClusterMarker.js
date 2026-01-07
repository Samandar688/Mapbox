import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Mapbox from '@rnmapbox/maps';

export const ClusterMarker = React.memo(({ id, coordinate, points, onPress }) => {
    const SIZE = 35;
    const CLUSTER_COLOR = '#63F813';

    return (
        <Mapbox.MarkerView coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onPress}
                style={[styles.clusterContainer, {
                    width: SIZE,
                    height: SIZE,
                    borderRadius: SIZE / 2,
                    backgroundColor: CLUSTER_COLOR,
                }]}
            >
                <Text style={styles.clusterText}>{points}</Text>
            </TouchableOpacity>
        </Mapbox.MarkerView>
    );
});

const styles = StyleSheet.create({
    clusterContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#03302E',
    },
    clusterText: {
        color: '#03302E',
        fontWeight: 'bold',
        fontSize: 14,
    }
});
