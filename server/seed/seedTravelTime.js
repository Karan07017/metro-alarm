console.log("🔥 NEW SEED SCRIPT RUNNING");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
    path: path.join(__dirname, "../.env"),
});

const Station = require("../models/Station");
const TravelTime = require("../models/TravelTime");
const estimateTravelMinutes = require("../utils/estimateTravelMinutes");

const seedTravelTimes = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Yellow Line ke saare stations order ke hisaab se le lo
    const stations = await Station.find({ line: "Yellow Line" }).sort({ order: 1 });

    await TravelTime.deleteMany({});

    const travelTimes = [];

    for (let i = 0; i < stations.length - 1; i++) {
        const from = stations[i];
        const to = stations[i + 1];

        // Coordinates se deterministically nikala gaya avgMinutes — Haversine
        // distance + assumed average metro speed + fixed dwell time. Same
        // coords hamesha same value denge, koi randomness nahi.
        // const avgMinutes = estimateTravelMinutes(from.coords, to.coords);
        const avgMinutes = estimateTravelMinutes(from.coords, to.coords);

        console.log(from.name, "->", to.name, avgMinutes);

        // dono directions store karo (forward aur backward journey ke liye) —
        // distance (aur isliye estimated time) dono direction mein same hai
        travelTimes.push({
            fromStation: from._id,
            toStation: to._id,
            avgMinutes,
        });
        travelTimes.push({
            fromStation: to._id,
            toStation: from._id,
            avgMinutes,
        });
    }

    await TravelTime.insertMany(travelTimes);
    console.log(`TravelTime seeded: ${travelTimes.length} records`);
    mongoose.connection.close();
};

seedTravelTimes();