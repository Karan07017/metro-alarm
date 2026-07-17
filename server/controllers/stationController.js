const Station = require('../models/Station');

exports.getStations = async (req, res) => {
    try {
        const stations = await Station.find().sort({ order: 1 });
        res.json(stations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};