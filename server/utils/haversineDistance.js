const EARTH_RADIUS_KM = 6371;

const toRadians = (deg) => (deg * Math.PI) / 180;

/**
 * Great-circle distance between two lat/lng points, in kilometers.
 * Pure function — same inputs always produce the same output.
 *
 * @param {{lat: number, lng: number}} a
 * @param {{lat: number, lng: number}} b
 * @returns {number} distance in km
 */
const haversineDistanceKm = (a, b) => {
    const dLat = toRadians(b.lat - a.lat);
    const dLng = toRadians(b.lng - a.lng);

    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);

    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.asin(Math.min(1, Math.sqrt(h)));

    return EARTH_RADIUS_KM * c;
};

module.exports = haversineDistanceKm;