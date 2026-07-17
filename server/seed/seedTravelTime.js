const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
    path: path.join(__dirname, "../.env"),
});

const Station = require("../models/Station");
const TravelTime = require("../models/TravelTime");

const DEFAULT_MINUTES = 2; // har consecutive station gap ke liye default time

const seedTravelTimes = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    // Yellow Line ke saare stations order ke hisaab se le lo
    const stations = await Station.find({ line: "Yellow Line" }).sort({ order: 1 });

    await TravelTime.deleteMany({});

    const travelTimes = [];

    for (let i = 0; i < stations.length - 1; i++) {
        const from = stations[i];
        const to = stations[i + 1];

        // dono directions store karo (forward aur backward journey ke liye)
        travelTimes.push({
            fromStation: from._id,
            toStation: to._id,
            avgMinutes: DEFAULT_MINUTES,
        });
        travelTimes.push({
            fromStation: to._id,
            toStation: from._id,
            avgMinutes: DEFAULT_MINUTES,
        });
    }

    await TravelTime.insertMany(travelTimes);
    console.log(`TravelTime seeded: ${travelTimes.length} records`);
    mongoose.connection.close();
};

seedTravelTimes();