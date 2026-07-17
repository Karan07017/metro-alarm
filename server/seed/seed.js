const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
    path: path.join(__dirname, "../.env"),
});

const Station = require("../models/Station");
const { yellowLine } = require("./stationsData");

const seedDB = async () => {
    console.log("MONGO_URI =", process.env.MONGO_URI);

    await mongoose.connect(process.env.MONGO_URI);

    await Station.deleteMany({});
    await Station.insertMany(yellowLine);

    console.log("Yellow Line stations seeded successfully!");
    mongoose.connection.close();
};

seedDB();