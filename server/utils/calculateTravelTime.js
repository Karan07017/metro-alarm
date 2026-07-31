

const Station = require('../models/Station');

const AVG_MINUTES_PER_GAP = 2; // TravelTime seed jaisa hi consistent rakho


const calculateTravelTime = async (fromStationId, toStationId) => {
    const fromStation = await Station.findById(fromStationId);
    const toStation = await Station.findById(toStationId);

    if (!fromStation || !toStation) {
        throw new Error('Station not found');
    }

    if (fromStation.line !== toStation.line) {
        throw new Error('Cross-line routing not supported yet');
    }

    const direction = toStation.order > fromStation.order ? 1 : -1;
    const stationGap = Math.abs(toStation.order - fromStation.order);
    const totalMinutes = stationGap * AVG_MINUTES_PER_GAP; // time to actual destination

    // Station ek stop pehle destination se, travel ki direction mein.
    const alertOrder = toStation.order - direction;
    let alertStation = await Station.findOne({ line: toStation.line, order: alertOrder });

    // Edge case: agar destination origin se sirf 1 stop door hai, to koi
    // "pehle wala" station nahi milega — us case mein destination pe hi trigger karo.
    if (!alertStation) alertStation = toStation;

    const alertGap = Math.abs(alertStation.order - fromStation.order);
    const alertMinutes = alertGap * AVG_MINUTES_PER_GAP; // time to alert (trigger) station

    return { totalMinutes, alertMinutes, stationGap, fromStation, toStation, alertStation };
};

module.exports = calculateTravelTime;