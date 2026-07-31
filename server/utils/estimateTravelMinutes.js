const haversineDistanceKm = require('./haversineDistance');

/**
 * Assumed average operating speed for an urban metro train between
 * consecutive stations, including acceleration/deceleration but NOT
 * dwell time at stops (that's added separately below). 32 km/h is a
 * commonly cited average for dense urban metro systems (e.g. Delhi
 * Metro's published average is in the ~32-35 km/h range).
 */
const AVERAGE_SPEED_KMH = 40;

/**
 * Fixed buffer per hop for station dwell time (doors open/close,
 * boarding/alighting) plus the brief accel/decel that pure
 * distance/speed doesn't capture. Kept as a flat constant so the
 * model stays simple and fully deterministic.
 */
const DWELL_MINUTES = 0.33;

/**
 * Minimum realistic travel time for any single hop, so that two
 * very closely spaced stations don't round down to 0.
 */
const MIN_MINUTES = 1;

/**
 * Deterministically estimates avgMinutes for a single station-to-station
 * hop from coordinates alone. Same coordinates always produce the same
 * result — no randomness, no external calls.
 *
 * @param {{lat: number, lng: number}} fromCoords
 * @param {{lat: number, lng: number}} toCoords
 * @returns {number} avgMinutes, rounded to the nearest whole minute
 */
const estimateTravelMinutes = (fromCoords, toCoords) => {
    const distanceKm = haversineDistanceKm(fromCoords, toCoords);
    const runningMinutes = (distanceKm / AVERAGE_SPEED_KMH) * 60;
    const totalMinutes = runningMinutes + DWELL_MINUTES;

    return Math.max(MIN_MINUTES, Math.round(totalMinutes));
};

module.exports = estimateTravelMinutes;