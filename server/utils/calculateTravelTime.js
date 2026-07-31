const Station = require('../models/Station');
const TravelTime = require('../models/TravelTime');

/**
 * Kisi bhi do stations (same line) ke beech total expected travel time nikaalta hai.
 * Saath hi "alert station" bhi nikaalta hai — destination se ek stop pehle wala
 * station, direction of travel ke hisaab se — taaki alarm exact destination pe
 * nahi, balki ek station pehle hi trigger ho jaaye.
 *
 * Per-hop timing ka single source of truth TravelTime collection hai (real
 * average minutes har consecutive station pair ke liye, seedTravelTime.js se
 * seeded). Pehle yahan ek alag hardcoded "AVG_MINUTES_PER_GAP" constant tha
 * jo TravelTime collection se completely disconnected tha — do jagah same
 * fact maintain ho raha tha, jo drift ka risk banata hai. Ab sirf TravelTime
 * se hi padha jaata hai, taaki uniform na hoke per-gap (kabhi zyada, kabhi
 * kam) real average duration honor ho.
 */
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

    // Station ek stop pehle destination se, travel ki direction mein.
    const alertOrder = toStation.order - direction;
    let alertStation = await Station.findOne({ line: toStation.line, order: alertOrder });

    // Edge case: agar destination origin se sirf 1 stop door hai, to koi
    // "pehle wala" station nahi milega — us case mein destination pe hi trigger karo.
    if (!alertStation) alertStation = toStation;

    // Route mein har station jo fromStation aur toStation ke beech (dono
    // inclusive) padta hai, travel ki direction ke order mein sorted —
    // taaki index 0 hamesha fromStation ho, chahe direction kuch bhi ho.
    const lowOrder = Math.min(fromStation.order, toStation.order);
    const highOrder = Math.max(fromStation.order, toStation.order);
    const routeStations = await Station.find({
        line: fromStation.line,
        order: { $gte: lowOrder, $lte: highOrder },
    }).sort({ order: direction === 1 ? 1 : -1 });

    const routeStationIds = routeStations.map((s) => s._id);
    const hopTimes = await TravelTime.find({
        fromStation: { $in: routeStationIds },
        toStation: { $in: routeStationIds },
    });
    const hopMinutesByKey = new Map(
        hopTimes.map((h) => [`${h.fromStation}_${h.toStation}`, h.avgMinutes])
    );

    // Consecutive hops ke real avgMinutes ko sum karta hai, fromIdx (inclusive)
    // se toIdx (inclusive) tak, routeStations array ke andar.
    const minutesBetween = (fromIdx, toIdx) => {
        let total = 0;
        for (let i = fromIdx; i < toIdx; i++) {
            const a = routeStations[i]._id.toString();
            const b = routeStations[i + 1]._id.toString();
            const minutes = hopMinutesByKey.get(`${a}_${b}`);
            if (minutes == null) {
                throw new Error(
                    `Missing travel time between ${routeStations[i].name} and ${routeStations[i + 1].name}`
                );
            }
            total += minutes;
        }
        return total;
    };

    const alertIndex = routeStations.findIndex(
        (s) => s._id.toString() === alertStation._id.toString()
    );

    const totalMinutes = minutesBetween(0, routeStations.length - 1); // time to actual destination
    const alertMinutes = minutesBetween(0, alertIndex); // time to alert (trigger) station

    return { totalMinutes, alertMinutes, stationGap, fromStation, toStation, alertStation };
};

module.exports = calculateTravelTime;