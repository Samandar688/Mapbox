import React, { useMemo } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { height } = Dimensions.get('window');

// Ikki nuqta orasidagi masofani hisoblash (km da)
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Yer radiusi
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const deg2rad = (deg) => deg * (Math.PI / 180);

export const StationList = ({ stations, userCoords, onSelect, onClose }) => {

    const sortedStations = useMemo(() => {
        if (!userCoords) return stations;

        return [...stations].map(station => {
            const dist = getDistance(
                userCoords[1], // Latitude
                userCoords[0], // Longitude
                station.lat,
                station.lng
            );
            return { ...station, distance: dist };
        }).sort((a, b) => a.distance - b.distance);

    }, [stations, userCoords]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => onSelect(item)}
        >
            <View style={styles.iconPlaceholder}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>{item.brand.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.stationName}>{item.name}</Text>
                <Text style={styles.address}>{item.details.address}</Text>
            </View>
            {item.distance !== undefined && (
                <View style={styles.distanceBadge}>
                    <Text style={styles.distanceText}>{item.distance.toFixed(1)} km</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Eng yaqin stansiyalar</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                    <Text style={{ fontSize: 20 }}>✕</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={sortedStations}
                renderItem={renderItem}
                keyExtractor={item => item.stationId}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.5,
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
        zIndex: 1100, // Details panelidan yuqoriroq
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#121212',
    },
    closeBtn: {
        padding: 8,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#FBFAFA',
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#03302E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#121212',
    },
    address: {
        fontSize: 12,
        color: '#757575',
        marginTop: 2,
    },
    distanceBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    distanceText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2E7D32',
    }
});
