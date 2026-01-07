import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, PanResponder, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const MAIN_DARK_COLOR = '#03302E';

const PortCard = ({ port, dynamicStatus }) => {
    const currentStatus = dynamicStatus || port.status;

    const isFree = currentStatus === 'FREE';
    const btnColor = isFree ? '#B5E48C' : (currentStatus === 'BUSY' ? '#FFD6A5' : '#E0E0E0');
    const btnTextColor = isFree ? '#1A5319' : (currentStatus === 'BUSY' ? '#9C6615' : '#757575');
    const btnText = isFree ? 'Ulash 🔗' : (currentStatus === 'BUSY' ? 'Band ⚡' : 'Offline 🚫');

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                    <Text style={{ fontSize: 24 }}>{port.connector.includes('DC') ? '🔌' : '⚡'}</Text>
                </View>
                <View style={{ marginLeft: 10 }}>
                    <Text style={styles.connectorType}>{port.connector}</Text>
                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>{port.price} UZS</Text>
                    </View>
                </View>
                <Text style={styles.portLabel}>{port.label}</Text>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.powerBadge}>
                    <Text style={styles.powerText}>{port.powerKw} kVt</Text>
                </View>
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: btnColor }]}>
                    <Text style={[styles.actionButtonText, { color: btnTextColor }]}>{btnText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export const StationDetails = ({ station, statusMap, onClose, onRoute }) => {
    const slideAnim = useRef(new Animated.Value(400)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100) {
                    closeModal();
                } else {
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                        bounciness: 4
                    }).start();
                }
            }
        })
    ).current;

    useEffect(() => {
        slideAnim.setValue(400);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            damping: 15,
        }).start();
    }, [station]);

    const closeModal = () => {
        Animated.timing(slideAnim, {
            toValue: 400,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    };

    const ports = Object.values(station.ports);
    const stationStatuses = statusMap ? statusMap[station.stationId] : undefined;

    return (
        <Animated.View
            style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
            {...panResponder.panHandlers}
        >
            <View style={styles.handleContainer}>
                <View style={styles.handle} />
            </View>

            <View style={styles.header}>
                <View style={styles.brandIcon}>
                    <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 20 }}>{station.brand.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.stationName}>{station.name}</Text>
                    <Text style={styles.address}>{station.details.address}</Text>
                </View>
                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                    <Text style={{ fontSize: 18, color: '#999' }}>✕</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                style={{ marginBottom: 20 }}
            >
                {ports.map((port) => (
                    <PortCard
                        key={port.portId}
                        port={port}
                        dynamicStatus={stationStatuses ? stationStatuses[port.portId] : undefined}
                    />
                ))}
            </ScrollView>

            <View style={styles.bottomBar}>
                <TouchableOpacity style={styles.mainBtn}>
                    <Text style={styles.mainBtnText}>📤</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.mainBtn, styles.primaryBtn]}
                    onPress={() => onRoute(station.coordinate)}
                >
                    <Text style={{ marginRight: 8, fontSize: 20 }}>📍</Text>
                    <Text style={[styles.mainBtnText, { fontWeight: 'bold' }]}>Marshrut</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.mainBtn}>
                    <Text style={styles.mainBtnText}>🔖</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 8,
        paddingBottom: 34,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 20,
        zIndex: 1000,
    },
    handleContainer: {
        alignItems: 'center',
        paddingBottom: 12,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
    },
    header: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    brandIcon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#2962FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stationName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#121212',
    },
    address: {
        fontSize: 12,
        color: '#757575',
        marginTop: 2,
    },
    closeBtn: {
        padding: 5,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    card: {
        width: 170,
        backgroundColor: '#F9F9F9',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#EEEEEE',
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#EEEEEE',
        justifyContent: 'center',
        alignItems: 'center',
    },
    connectorType: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#000',
    },
    priceContainer: {
        backgroundColor: '#03302E',
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 2,
        marginTop: 4,
    },
    priceText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    portLabel: {
        position: 'absolute',
        right: 0,
        top: 0,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E0E0E0',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
    },
    powerBadge: {
        backgroundColor: '#03302E',
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 6,
        minWidth: 45,
    },
    powerText: {
        color: 'white',
        fontSize: 11,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    actionButton: {
        flex: 1,
        borderRadius: 8,
        paddingVertical: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    bottomBar: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        gap: 12,
    },
    mainBtn: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtn: {
        flex: 1,
        backgroundColor: MAIN_DARK_COLOR,
        flexDirection: 'row',
    },
    mainBtnText: {
        color: 'white',
        fontSize: 16,
    }
});
