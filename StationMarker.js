import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import Svg, { Rect } from 'react-native-svg';

const COLORS = {
    FREE: '#4CAF50',
    BUSY: '#FFC107',
    OFFLINE: '#9E9E9E',
};

const getBrandLogo = (brand) => {
    return null;
};

export const StationMarker = React.memo(({ item, onPress, coordinate, dynamicStatusObj }) => {
    const SIZE = 40;
    const STROKE_WIDTH = 4;
    const RADIUS = 8;
    const d = SIZE - STROKE_WIDTH;

    // Calculate port statuses dynamically
    const portStatuses = useMemo(() => {
        if (dynamicStatusObj) return Object.values(dynamicStatusObj);
        if (!item.ports) return [];
        return Object.values(item.ports).map(p => p.status);
    }, [dynamicStatusObj, item.ports]);

    // Generate SVG border segments based on port statuses
    const borderSegments = useMemo(() => {
        const total = portStatuses.length;
        if (total === 0) return null;
        const perimeter = (d * 4) - (8 * RADIUS) + (2 * Math.PI * RADIUS);

        if (total === 1) {
            return (
                <Rect
                    x={STROKE_WIDTH / 2}
                    y={STROKE_WIDTH / 2}
                    width={d}
                    height={d}
                    rx={RADIUS}
                    ry={RADIUS}
                    stroke={COLORS[portStatuses[0]] || COLORS.OFFLINE}
                    strokeWidth={STROKE_WIDTH}
                    fill="white"
                />
            );
        }

        return portStatuses.map((status, index) => {
            const segmentLength = perimeter / total;
            const gap = 3;
            const dashArray = [Math.max(0, segmentLength - gap), perimeter - Math.max(0, segmentLength - gap)];
            const offset = -(index * segmentLength);

            return (
                <Rect
                    key={index}
                    x={STROKE_WIDTH / 2}
                    y={STROKE_WIDTH / 2}
                    width={d}
                    height={d}
                    rx={RADIUS}
                    ry={RADIUS}
                    stroke={COLORS[status] || COLORS.OFFLINE}
                    strokeWidth={STROKE_WIDTH}
                    strokeDasharray={dashArray.map(n => n.toString())}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill={index === 0 ? "white" : "none"}
                />
            );
        });
    }, [portStatuses, d]);

    return (
        <Mapbox.MarkerView
            coordinate={coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={true} // Explicitly set to true to prevent disappearance
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => onPress && onPress(item)}
                style={styles.markerContainer}
            >
                <View style={StyleSheet.absoluteFill}>
                    <Svg height={SIZE} width={SIZE}>
                        {borderSegments}
                    </Svg>
                </View>

                {getBrandLogo(item.brand) ? (
                    <Image source={getBrandLogo(item.brand)} style={styles.logo} />
                ) : (
                    <Text style={styles.brandText}>{item.brand.charAt(0)}</Text>
                )}
            </TouchableOpacity>
        </Mapbox.MarkerView>
    );
});

const styles = StyleSheet.create({
    markerContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    brandText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#03302E',
    },
    logo: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    }
});
