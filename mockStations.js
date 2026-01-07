// mockStations.js
// Zaryadlash stansiyalari uchun test ma'lumotlari

export const BRANDS = ['TOK', 'UZCHARGE', 'MEGO', 'VOLT'];
const AMENITIES_LIST = ["🍽 Kafe", "📶 Wi-Fi", "🅿️ Parking", "🚾 WC", "☕️ Coffee", "🛍 Shopping"];

/**
 * Tasodifiy stansiya ma'lumotlarini yaratish funksiyasi
 * @param {number} count - yaratiladigan stansiyalar soni
 */
const generateStationsData = (count) => {
    const stations = [];
    const initialStatusMap = {};

    // Toshkent markazi koordinatalari (Siz ko'rsatgan nuqta)
    const centerLat = 41.311081;
    const centerLng = 69.240562;

    for (let i = 1; i <= count; i++) {
        // Toshkent atrofida (taxminan 5km radiusda) tarqatish
        const latOffset = (Math.random() - 0.5) * 0.05;
        const lngOffset = (Math.random() - 0.5) * 0.05;

        const lat = centerLat + latOffset;
        const lng = centerLng + lngOffset;

        const id = i.toString();
        const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];

        // Dinamik portlar yaratish (1 tadan 8 tagacha)
        const portCount = Math.floor(Math.random() * 8) + 1;
        const stationPorts = {};
        const stationStatus = {};

        for (let p = 1; p <= portCount; p++) {
            const portId = `${id}.${p}`;
            const isFree = Math.random() > 0.4;
            const status = isFree ? 'FREE' : 'BUSY';

            // Tasodifiy konnektor turlari (Type2 yoki GB/T DC)
            const isType2 = Math.random() > 0.5;

            stationPorts[portId] = {
                portId: portId,
                label: String.fromCharCode(64 + p), // A, B, C...
                status: status,
                powerKw: isType2 ? 22 : 120,
                connector: isType2 ? "Type2" : "GB/T DC",
                price: isType2 ? 1500 : 2500,
                isDC: !isType2
            };

            stationStatus[portId] = status;
        }

        // Boshlang'ich holat xaritasi
        initialStatusMap[id] = stationStatus;

        stations.push({
            stationId: id,
            name: `${brand} Station #${id}`,
            brand: brand,
            lat: lat,
            lng: lng,
            coordinate: [lng, lat], // Mapbox [longitude, latitude] formatini so'raydi
            ports: stationPorts,
            details: {
                address: `Tashkent, Random Street ${i}`,
                phone: "+998 90 123 45 67",
                amenities: [
                    AMENITIES_LIST[Math.floor(Math.random() * AMENITIES_LIST.length)],
                    AMENITIES_LIST[Math.floor(Math.random() * AMENITIES_LIST.length)]
                ],
                workTime: "24/7"
            }
        });
    }
    return { stations, initialStatusMap };
};

// 10 ta stansiya bilan test qilamiz
const { stations: complexStations, initialStatusMap: complexStatusMap } = generateStationsData(10);

export const STATIONS_BASE = complexStations;
export const INITIAL_STATUS_MAP = complexStatusMap;
export const mockStations = STATIONS_BASE;
