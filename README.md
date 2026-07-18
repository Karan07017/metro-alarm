# 🚇 Metro Alarm

**A hybrid GPS + time-based alarm system that wakes commuters up one station before their destination — built to solve the real problem of GPS signal loss in underground metro tunnels.**

![Node.js](https://img.shields.io/badge/Node.js-≥18-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

---

## 📖 About

Anyone who's dozed off on a metro and missed their stop knows the problem: location-tracking apps rely on GPS, and GPS is unreliable (or completely dead) underground. **Metro Alarm** solves this with a **hybrid alerting engine**:

- When GPS signal is available, the app tracks your live location and fires the alarm when you're within a configurable distance of your trigger station.
- When GPS fails (tunnels, weak signal, or the user explicitly picks "Time Based" mode), the app automatically falls back to a **server-calculated ETA timer**, so the alarm still fires reliably based on expected travel time.

The alarm is intentionally set to ring **one station before** the actual destination — giving the rider a full stop's worth of time to get ready to get off.

> **Note:** The app is currently operational for the **Yellow Line** only (Samaypur Badli ↔ Millennium City Centre Gurugram).

---

## ✨ Features

- 🔐 **User authentication** — register/login with JWT-based sessions, passwords hashed with bcrypt
- 🚉 **Station search & selection** — searchable "from" / "to" station pickers with recent-station memory (via `localStorage`)
- 🔀 **Two alarm modes** — GPS Based and Time Based, selectable up front from a mode-selection screen
- 📍 **Live GPS tracking** — continuous `watchPosition` tracking with real-time distance-to-station calculation (Haversine formula)
- ⏱️ **Automatic GPS → Time fallback** — if GPS errors out, the app auto-switches to time-based tracking and syncs the change to the backend
- 🧮 **Server-side travel time calculation** — trigger station and ETA computed from seeded station order/line data
- 🔔 **Multi-channel alarm firing** — Web Audio API beeps, device vibration (Vibration API), and native browser notifications (Web Notifications API)
- 🔋 **Screen Wake Lock** — keeps the screen awake while an alarm is active to reduce the chance of the tab being suspended
- 📜 **Alarm history** — past alarms grouped by day with status (pending / active / triggered / cancelled)
- ⚙️ **Settings page** — view profile info and current alarm mode, resume an active alarm, or log out
- 🔁 **Alarm persistence/restore** — on reload, the app re-fetches any pending/active alarm for the logged-in user and resumes tracking
- 🍞 **Toast notifications & loading states** — for a polished, app-like UX across the client

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB with Mongoose |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs` for password hashing |
| **Browser APIs** | Geolocation API, Web Notifications API, Web Audio API, Vibration API, Screen Wake Lock API |
| **Dev Tools** | ESLint, Nodemon |

---

## 🏗️ Project Architecture / Working

```
┌─────────────────┐        REST API (JSON, JWT)       ┌──────────────────┐
│   React Client   │ ─────────────────────────────────▶ │  Express Server   │
│  (Vite + Tailwind)│ ◀───────────────────────────────── │                  │
└─────────────────┘                                     └────────┬─────────┘
        │                                                        │
        │ Geolocation / Notification /                           │ Mongoose
        │ Web Audio / Vibration / Wake Lock                      ▼
        ▼                                                ┌──────────────────┐
   Device Browser APIs                                    │  MongoDB Atlas   │
                                                            │ Users / Stations │
                                                            │ Alarms/TravelTime│
                                                            └──────────────────┘
```

**Flow summary:**
1. User authenticates → JWT stored in `localStorage`.
2. User picks a mode (GPS or Time Based) and selects `from` / `to` stations.
3. Backend calculates the **trigger station** (one stop before destination), the **trigger distance**, and the **expected duration** using seeded station order + average per-gap travel time.
4. When the user starts the journey, the server stamps `startTime` and computes `expectedArrivalTime`.
5. On the client, `GpsTest.jsx` either:
   - watches live GPS position and compares distance to the trigger station's coordinates, **or**
   - counts down to `expectedArrivalTime` if GPS fails or Time Based mode was selected.
6. When the condition is met, the alarm fires (sound + vibration + notification) and the alarm's status is updated to `triggered` on the backend.

---

## 📂 Folder Structure

```
metro-alarm/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx           # Login / Register
│   │   │   ├── AlarmSetup.jsx     # Station selection & alarm creation
│   │   │   ├── StartJourney.jsx   # Start/confirm screen before tracking begins
│   │   │   ├── GpsTest.jsx        # Live tracking screen (GPS + time-fallback logic)
│   │   │   ├── MetroLine.jsx      # Visual progress indicator
│   │   │   └── ui/                # Reusable UI primitives (Button, Card, Modal, Toast, etc.)
│   │   ├── pages/
│   │   │   ├── ModeSelect.jsx     # GPS vs Time Based mode picker
│   │   │   ├── HistoryPage.jsx    # Past alarms grouped by day
│   │   │   └── SettingsPage.jsx   # Profile & current alarm info
│   │   ├── hooks/useLocalStorage.js
│   │   ├── Audio.js               # Web Audio context helper
│   │   ├── config.js              # API base URL config
│   │   └── App.jsx                # App shell / routing state machine
│   └── .env.example
│
├── server/                        # Express backend
│   ├── controllers/
│   │   ├── authController.js      # register / login
│   │   ├── alarmController.js     # create / start / update / list alarms
│   │   ├── stationController.js   # list stations
│   │   └── db.js                  # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Alarm.js
│   │   ├── Station.js
│   │   └── TravelTime.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── alarmRoutes.js
│   │   └── stationRoutes.js
│   ├── middleware/authMiddleware.js   # JWT verification
│   ├── utils/calculateTravelTime.js   # Trigger station + ETA math
│   ├── seed/                          # Station & travel-time seed scripts (Yellow Line only — currently active)
│   ├── server.js                      # App entry point
│   └── .env.example
│
└── .gitignore
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js **≥ 18**
- A MongoDB connection string (local or MongoDB Atlas)

### Clone the repo
```bash
git clone https://github.com/<your-username>/metro-alarm.git
cd metro-alarm
```

### Install backend dependencies
```bash
cd server
npm install
```

### Install frontend dependencies
```bash
cd ../client
npm install
```

---

## 🔑 Environment Variables

**`server/.env`** (copy from `server/.env.example`)

| Variable | Description |
|---|---|
| `PORT` | Port the Express server runs on (default `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT tokens |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS — comma-separated for multiple |

**`client/.env`** (copy from `client/.env.example`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend API (e.g. `http://localhost:5000`) |

---

## ▶️ Running the Project

### 1. Seed the database (stations + travel times)
```bash
cd server
node seed/seed.js
node seed/seedTravelTime.js
```

### 2. Start the backend
```bash
cd server
npm run dev      # nodemon (development)
# or
npm start        # node (production)
```

### 3. Start the frontend
```bash
cd client
npm run dev
```

The client will be available at `http://localhost:5173` and will talk to the API at the URL set in `VITE_API_URL`.

---

## 🔌 API Endpoints

All `/api/alarms` routes require a `Bearer` JWT token in the `Authorization` header.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Log in and receive a JWT |
| `GET` | `/api/stations` | List all metro stations (sorted by line order) |
| `POST` | `/api/alarms` | Create a new alarm (calculates trigger station & ETA) |
| `GET` | `/api/alarms` | Get all alarms for the logged-in user |
| `PATCH` | `/api/alarms/:id/start` | Start a pending alarm (stamps `startTime` / `expectedArrivalTime`) |
| `PATCH` | `/api/alarms/:id/mode` | Update `triggerMode` (`gps` ↔ `time-fallback`) |
| `PATCH` | `/api/alarms/:id` | Update alarm status (`pending` / `active` / `triggered` / `cancelled`) |

---

## 🔄 Application Flow

### GPS Mode
1. On starting the journey, the client begins `navigator.geolocation.watchPosition`.
2. Every position update calculates the Haversine distance between the device and the **trigger station's coordinates**.
3. When the distance drops to or below `triggerDistance` (default `500`m), the alarm fires.

### Time Fallback Mode
Triggered automatically if a GPS error occurs, or manually if the user selects **Time Based** mode up front. In this mode:
1. The client ignores live position and instead compares the current time against the server-issued `expectedArrivalTime`.
2. A 1-second interval re-checks the countdown and updates the displayed ETA.
3. When the current time reaches `expectedArrivalTime`, the alarm fires — the same way it does in GPS mode (sound, vibration, notification).

If GPS mode was selected but a location error is detected mid-journey, the app **automatically switches to time-fallback** and syncs the new `triggerMode` back to the server, so the fallback survives a page reload.

---

## 🚧 Future Improvements

- Wire up the existing Red Line station data into the seed scripts to make it operational
- Cross-line routing / interchange support (currently limited to same-line journeys)
- Support for additional metro lines beyond Yellow (and Red, once seeded)
- Push notifications via a service worker for true background delivery
- Password reset / email verification flow
- Unit and integration test coverage

---

## 🚀 Deployment

- **Frontend:** Deployable as a static Vite build (e.g. Vercel, Netlify) — set `VITE_API_URL` to the deployed backend URL.
- **Backend:** Deployable to any Node host (e.g. Render, Railway) — set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` in the environment.

---

## 👤 Author

**Your Name**
- GitHub: [@Karan07017](https://github.com/Karan07017)
- LinkedIn: [Karan Arya](https://www.linkedin.com/in/karan-arya1797/)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

### ☕ Made with sleepless nights, endless debugging, and way too much caffeine.

**Crafted by Karan Arya ❤️**

</div>