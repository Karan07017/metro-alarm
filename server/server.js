const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./controllers/db');

dotenv.config();
connectDB();

const app = express();


// const allowedOrigins = process.env.CLIENT_URL
//   ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
//   : '*';

// app.use(cors({ origin: allowedOrigins }));
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin (Postman, mobile apps, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Explicitly allowed origins from env
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Metro Alarm API running...');
});

app.use('/api/alarms', require('./routes/alarmRoutes'));
app.use('/api/stations', require('./routes/stationRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Fallback error handler so unexpected errors return JSON, not an HTML page
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));