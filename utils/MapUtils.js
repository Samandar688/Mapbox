// utils/MapUtils.js

const R = 6378137; // Earth radius (meters)

/**
 * Converts meters to coordinate deltas at a given latitude.
 * This allows us to draw shapes in "meters" around a center point.
 */
function metersToLngLatDelta(lat, meters) {
  const dLat = meters / R;
  const dLng = meters / (R * Math.cos((Math.PI * lat) / 180));
  return {
    dLat: (dLat * 180) / Math.PI,
    dLng: (dLng * 180) / Math.PI,
  };
}

/**
 * Generates points along the perimeter of a rounded rectangle for a segment range.
 * Path starts from Top-Center and goes clockwise.
 *
 * @param {number} centerLng
 * @param {number} centerLat
 * @param {number} widthMeters - Full width/height of the square (in meters)
 * @param {number} radiusMeters - Corner radius (in meters)
 * @param {number} startFract - Start position along perimeter (0..1)
 * @param {number} endFract - End position along perimeter (0..1)
 * @param {number} steps - Resolution for points count
 * @returns {[number, number][]} coordinates (lng, lat)
 */
function roundedRectLine(
  centerLng,
  centerLat,
  widthMeters,
  radiusMeters,
  startFract,
  endFract,
  steps = 14
) {
  const halfSize = widthMeters / 2;
  const r = Math.min(radiusMeters, halfSize); // safety clamp

  const straightLen = widthMeters - 2 * r;
  const cornerLen = (Math.PI * r) / 2; // quarter circle length
  const perimeter = 4 * straightLen + 4 * cornerLen;

  // delta for 1 meter at this latitude
  const { dLat, dLng } = metersToLngLatDelta(centerLat, 1);

  // Get local (x,y) in meters at distance d along perimeter (Top-Center start, clockwise)
  const getPointAtDist = (d) => {
    d = d % perimeter;
    if (d < 0) d += perimeter;

    // Start at Top Center: (x=0, y=halfSize)
    // 1) Top edge right-half
    let currentDist = straightLen / 2;
    if (d <= currentDist) return [d, halfSize];

    // 2) Top-right corner (90 -> 0 deg)
    let segLen = cornerLen;
    if (d <= currentDist + segLen) {
      const angle = (Math.PI / 2) - (d - currentDist) / r;
      return [
        (halfSize - r) + r * Math.cos(angle),
        (halfSize - r) + r * Math.sin(angle),
      ];
    }
    currentDist += segLen;

    // 3) Right edge
    segLen = straightLen;
    if (d <= currentDist + segLen) {
      return [halfSize, (halfSize - r) - (d - currentDist)];
    }
    currentDist += segLen;

    // 4) Bottom-right corner (0 -> -90)
    segLen = cornerLen;
    if (d <= currentDist + segLen) {
      const angle = 0 - (d - currentDist) / r;
      return [
        (halfSize - r) + r * Math.cos(angle),
        -(halfSize - r) + r * Math.sin(angle),
      ];
    }
    currentDist += segLen;

    // 5) Bottom edge
    segLen = straightLen;
    if (d <= currentDist + segLen) {
      return [(halfSize - r) - (d - currentDist), -halfSize];
    }
    currentDist += segLen;

    // 6) Bottom-left corner (270 -> 180)
    segLen = cornerLen;
    if (d <= currentDist + segLen) {
      const angle = (3 * Math.PI / 2) - (d - currentDist) / r;
      return [
        -(halfSize - r) + r * Math.cos(angle),
        -(halfSize - r) + r * Math.sin(angle),
      ];
    }
    currentDist += segLen;

    // 7) Left edge
    segLen = straightLen;
    if (d <= currentDist + segLen) {
      return [-halfSize, -(halfSize - r) + (d - currentDist)];
    }
    currentDist += segLen;

    // 8) Top-left corner (180 -> 90)
    segLen = cornerLen;
    if (d <= currentDist + segLen) {
      const angle = Math.PI - (d - currentDist) / r;
      return [
        -(halfSize - r) + r * Math.cos(angle),
        (halfSize - r) + r * Math.sin(angle),
      ];
    }
    currentDist += segLen;

    // 9) Remaining top edge to Top Center
    return [-(halfSize - r) + (d - currentDist), halfSize];
  };

  const points = [];
  const startDist = startFract * perimeter;
  const endDist = endFract * perimeter;

  // allow wrap if end < start (not used in our case usually)
  let totalDist = endDist - startDist;
  if (totalDist < 0) totalDist += perimeter;

  for (let i = 0; i <= steps; i++) {
    const dist = startDist + totalDist * (i / steps);
    const [mx, my] = getPointAtDist(dist);

    // Convert local meters (mx,my) into lng/lat
    points.push([centerLng + mx * dLng, centerLat + my * dLat]);
  }

  return points;
}

/**
 * Creates a closed polygon ring for a rounded rectangle.
 */
function roundedRectPolygon(centerLng, centerLat, widthMeters, radiusMeters, steps = 60) {
  // build full perimeter line
  const ring = roundedRectLine(centerLng, centerLat, widthMeters, radiusMeters, 0, 1, steps);

  // ensure closed ring
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (!last || last[0] !== first[0] || last[1] !== first[1]) {
    ring.push(first);
  }
  return ring;
}

/**
 * Builds features for a single station:
 * - Center rounded-rectangle polygon (kind:center)
 * - Port segments as rounded-rectangle perimeter parts (kind:seg)
 *
 * IMPORTANT:
 * - Segment feature ids must be stable: `seg:<stationId>:<portIndex>`
 * - Center feature id: `center:<stationId>`
 */
export function buildStationFeatures(st) {
  const features = [];

  // =========================
  // TUNING (meters)
  // =========================
  const OUTER_SIZE_M = 90;   // overall outer "ring" footprint
  const OUTER_RADIUS_M = 22; // outer corner radius

  const CENTER_SIZE_M = 55;  // center box size
  const CENTER_RADIUS_M = 14; // center corner radius

  // =========================
  // 1) Center marker polygon
  // =========================
  features.push({
    type: 'Feature',
    id: `center:${st.stationId}`,
    properties: {
      kind: 'center',
      brand: st.brand,
      stationId: st.stationId,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [roundedRectPolygon(st.lng, st.lat, CENTER_SIZE_M, CENTER_RADIUS_M, 50)],
    },
  });

  // =========================
  // 2) Port segments
  // =========================
  const portKeys = st.ports ? Object.keys(st.ports).sort() : [];
  const count = portKeys.length > 0 ? Math.min(portKeys.length, 8) : 1;

  // gap is a fraction of the whole perimeter [0..1]
  const gap = 0.03; // ~3% gap between segments
  const slice = 1.0 / count;

  for (let i = 0; i < count; i++) {
    const start = i * slice + gap / 2;
    const end = (i + 1) * slice - gap / 2;

    const portId = portKeys[i] ?? `p${i}`;
    const status = st.ports?.[portId]?.status ?? 'OFFLINE';

    features.push({
      type: 'Feature',
      id: `seg:${st.stationId}:${i}`,
      properties: {
        kind: 'seg',
        stationId: st.stationId,
        portIndex: i,
        status, // (faqat initial) realtime rang feature-state bilan bo‘ladi
      },
      geometry: {
        type: 'LineString',
        coordinates: roundedRectLine(st.lng, st.lat, OUTER_SIZE_M, OUTER_RADIUS_M, start, end, 14),
      },
    });
  }

  return features;
}
