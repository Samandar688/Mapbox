export const PortStatus = {
  FREE: 'FREE',
  BUSY: 'BUSY',
  OFFLINE: 'OFFLINE',
};

const CENTER_LAT = 41.2995;
const CENTER_LNG = 69.2401;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const mockStations = Array.from({ length: 500 }).map((_, i) => {
  const brands = ['UZCHARGE', 'VOLT', 'TOK', 'MEGO'];
  const brand = brands[i % brands.length];

  const portCount = Math.floor(Math.random() * 8) + 1; // 1..8
  const ports = {};

  for (let p = 0; p < portCount; p++) {
    ports[`p${p}`] = {
      id: `p${p}`,
      status: pick(Object.values(PortStatus)),
      power: 22 + Math.floor(Math.random() * 100),
    };
  }

  const lng = CENTER_LNG + rand(-0.05, 0.05);
  const lat = CENTER_LAT + rand(-0.05, 0.05);

  return {
    stationId: i + 1,
    name: `${brand} Station ${i + 1}`,
    brand,
    lng,
    lat,
    location: 'Tashkent City',
    ports,
  };
});
