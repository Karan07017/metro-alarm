import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Radar,
  Clock3,
  SignalHigh,
  SignalMedium,
  SignalLow,
  Bell,
  X,
  TrainFront,
  RotateCcw,
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { getAudioContext } from '../Audio';
import Button from './ui/Button';
import Card from './ui/Card';
import Container from './ui/Container';
import MetroLine from './MetroLine';

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function playAlarmSound() {
  const ctx = getAudioContext();

  // Backgrounded tab se wapas aane par context suspend ho sakta hai —
  // fire karne se theek pehle ek aakhri baar resume try karo.
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (err) {
      console.error('Audio resume failed:', err.message);
    }
  }

  const beep = () => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };
  beep();
  setTimeout(beep, 500);
  setTimeout(beep, 1000);
  if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
}

// In-page sound sirf tab active/foreground hone par hi sunayi deta hai.
// Native OS notification zyada reliable hai — browser process zinda hone
// tak dikh sakta hai chahe tab background mein ho.
function showAlarmNotification(stationName) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification('🔔 Metro Alarm', {
      body: `${stationName} aa gaya — utarne ki tayyari karo!`,
      requireInteraction: true,
    });
  } catch (err) {
    console.error('Notification failed:', err);
  }
}

function signalQuality(accuracy) {
  if (accuracy == null) return { label: 'Searching', icon: SignalLow, color: 'text-faint' };
  if (accuracy <= 20) return { label: 'Strong', icon: SignalHigh, color: 'text-success' };
  if (accuracy <= 60) return { label: 'Fair', icon: SignalMedium, color: 'text-time-from' };
  return { label: 'Weak', icon: SignalLow, color: 'text-danger' };
}

function GpsTest({ alarm, token, onCancel }) {
  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState('Waiting for GPS...');
  const [failCount, setFailCount] = useState(0);
  // Time Based mode chosen upfront on the landing screen sets triggerMode
  // to time-fallback immediately, so start in fallback mode right away
  // instead of waiting for a GPS failure to be detected.
  const [fallbackMode, setFallbackMode] = useState(alarm.triggerMode === 'time-fallback');
  const [distance, setDistance] = useState(null);
  const [triggered, setTriggered] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const watchIdRef = useRef(null);
  const wakeLockRef = useRef(null);
  const initialDistanceRef = useRef(null);
  // Offset between this device's clock and the server's clock, captured
  // once from the server-issued startTime. Neutralizes any client/server
  // clock disagreement so the countdown always respects the backend's
  // computed duration, instead of comparing two different clocks directly.
  // const clockOffsetRef = useRef(null);

  // Screen ko awake rakhta hai jab tak alarm active hai — isse mobile browser
  // ke tab ko suspend karne ka chance kaafi kam ho jaata hai. Poori tarah se
  // guarantee nahi hai (OS phir bhi kabhi kabhi background tabs suspend kar
  // sakta hai), par best-effort improvement hai.
  useEffect(() => {
    let released = false;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log('Wake lock not available:', err.message);
      }
    };

    requestWakeLock();

    // Tab dobara visible hone par wake lock re-acquire karo — browser
    // automatically release kar deta hai jab tab hidden hoti hai.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !released) requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      released = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      wakeLockRef.current?.release().catch(() => { });
    };
  }, []);

  // NEW (added)
  useEffect(() => {
    const tickId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tickId);
  }, []);

  useEffect(() => {
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setPosition({ latitude, longitude, accuracy });
        // setFailCount((prev) => (accuracy > 100 ? prev + 1 : 0));
        setFailCount(0);
      },
      // () => setFailCount((prev) => prev + 1),
      (error) => {
        console.log("GPS Error:", error.code, error.message);

        setFailCount((prev) => prev + 1);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchIdRef.current);
  }, []);

  useEffect(() => {
    if (failCount >= 1) setFallbackMode(true);
  }, [failCount]);

  const modeSyncedRef = useRef(alarm.triggerMode === 'time-fallback');

  useEffect(() => {
    if (fallbackMode && !modeSyncedRef.current) {
      modeSyncedRef.current = true;
      fetch(`${API_BASE_URL}/api/alarms/${alarm._id}/mode`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ triggerMode: 'time-fallback' }),
      }).catch((err) => console.error('Mode sync failed:', err));
    }
  }, [fallbackMode, alarm._id, token]);

  useEffect(() => {
    if (!alarm || triggered) return;

    if (!fallbackMode && position) {
      const target = alarm.triggerCoords || alarm.destinationCoords;
      const targetName = alarm.triggerStation || alarm.destinationStation;
      const d = getDistanceMeters(
        position.latitude,
        position.longitude,
        target.lat,
        target.lng
      );
      if (initialDistanceRef.current == null) initialDistanceRef.current = d;
      setDistance(d);
      setStatus(`GPS mode — ${Math.round(d)}m from ${targetName}`);
      if (d <= alarm.triggerDistance) fireAlarm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, fallbackMode, alarm, triggered]);

  // NEW
  // useEffect(() => {
  //   if (!fallbackMode || !alarm || triggered) return;

  //   if (clockOffsetRef.current == null && alarm.startTime) {
  //     // How far ahead/behind this device's clock is vs. the server's,
  //     // measured once against the server-issued startTime.
  //     clockOffsetRef.current = Date.now() - new Date(alarm.startTime).getTime();
  //   }
  //   const offset = clockOffsetRef.current || 0;

  //   const checkEta = () => {
  //     const eta = new Date(alarm.expectedArrivalTime);
  //     const correctedNow = new Date(Date.now() - offset);
  //     setStatus(`Time-fallback mode — ETA ${eta.toLocaleTimeString()}`);
  //     if (correctedNow >= eta) fireAlarm();
  //   };

  //   checkEta(); // turant ek baar check karo
  //   const intervalId = setInterval(checkEta, 5000);

  //   return () => clearInterval(intervalId);
  // }, [fallbackMode, alarm, triggered]);

  // NEW
  // useEffect(() => {
  //   if (!fallbackMode || !alarm || triggered) return;
  //   if (clockOffsetRef.current == null && alarm.startTime) {
  //     clockOffsetRef.current = Date.now() - new Date(alarm.startTime).getTime();
  //   }
  //   const offset = clockOffsetRef.current || 0;
  //   const eta = new Date(alarm.expectedArrivalTime);
  //   const correctedNow = new Date(now - offset);
  //   setStatus(`Time-fallback mode — ETA ${eta.toLocaleTimeString()}`);
  //   if (correctedNow >= eta) fireAlarm();
  // }, [now, fallbackMode, alarm, triggered]);
  useEffect(() => {
    if (!fallbackMode || !alarm || triggered) return;
    const eta = new Date(alarm.expectedArrivalTime);
    setStatus(`Time-fallback mode — ETA ${eta.toLocaleTimeString()}`);
    if (new Date(now) >= eta) fireAlarm();
  }, [now, fallbackMode, alarm, triggered]);

  const fireAlarm = async () => {

    setTriggered(true);
    setStatus('🔔 ALARM! Destination aa gaya');
    playAlarmSound();
    showAlarmNotification(alarm.triggerStation || alarm.destinationStation);
    navigator.geolocation.clearWatch(watchIdRef.current);
    wakeLockRef.current?.release().catch(() => { });
    try {
      await fetch(`${API_BASE_URL}/api/alarms/${alarm._id}`, {
        method: 'PATCH',
        // headers: { 'Content-Type': 'application/json' },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'triggered' }),
      });
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleCancel = async () => {

    navigator.geolocation.clearWatch(watchIdRef.current);
    try {
      await fetch(`${API_BASE_URL}/api/alarms/${alarm._id}`, {
        method: 'PATCH',
        // headers: { 'Content-Type': 'application/json' },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'cancelled' }),
      });
    } catch (err) {
      console.error('Cancel failed:', err);
    }
    onCancel();
  };

  // --- Presentation-only derived values (do not affect trigger logic) ---
  const targetName = alarm.triggerStation || alarm.destinationStation;

  let progress = 0;
  if (fallbackMode && alarm.startTime && alarm.expectedArrivalTime) {
    const start = new Date(alarm.startTime).getTime();
    const end = new Date(alarm.expectedArrivalTime).getTime();
    // const now = Date.now();
    // progress = end > start ? (now - start) / (end - start) : 0;
    // NEW
    progress = end > start ? (now - start) / (end - start) : 0;
  } else if (!fallbackMode && distance != null) {
    const initial = initialDistanceRef.current || distance || 1;
    progress = 1 - distance / initial;
  }
  progress = Math.min(1, Math.max(0, progress));

  // Live ETA for GPS mode. Instantaneous device GPS speed is too noisy for
  // this (tunnels, curves the straight-line Haversine distance doesn't
  // capture, station dwell time), so instead of measuring speed directly
  // we scale the already-computed average trip duration
  // (alarm.durationMinutes — sourced from the real per-station-gap
  // TravelTime data, see server/utils/calculateTravelTime.js) by how much
  // of the original straight-line distance to the target is still left.
  // This is the single place GPS-mode ETA is computed — no duplicate math
  // elsewhere.
  const gpsRemainingMinutes =
    !fallbackMode && distance != null && initialDistanceRef.current
      ? Math.max(0, (alarm.durationMinutes * distance) / initialDistanceRef.current)
      : null;

  const signal = signalQuality(position?.accuracy);
  const SignalIcon = signal.icon;

  if (triggered) {
    return (
      <Container size="sm" className="py-10 sm:py-16">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 text-center relative overflow-hidden">
            <div className="flex justify-center mb-6 relative">
              <span className="absolute w-24 h-24 rounded-full bg-danger/20 animate-pulse-ring" />
              <span className="absolute w-24 h-24 rounded-full bg-danger/20 animate-pulse-ring [animation-delay:0.5s]" />
              <motion.span
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-danger to-time-from flex items-center justify-center shadow-lg"
              >
                <Bell className="w-9 h-9 text-white" />
              </motion.span>
            </div>
            <h2 className="font-display text-2xl font-semibold mb-1">You've arrived!</h2>
            <p className="text-muted text-sm mb-6">
              Time to get off at <strong className="text-text">{targetName}</strong>.
            </p>
            <Button onClick={onCancel} icon={RotateCcw} className="w-full" size="lg">
              Set New Alarm
            </Button>
          </Card>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container size="sm" className="py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2 ${fallbackMode
                ? 'bg-time-from/10 text-time-from border border-time-from/25'
                : 'bg-gps-from/10 text-gps-to border border-gps-from/25'
                }`}
            >
              {fallbackMode ? <Clock3 className="w-3 h-3" /> : <Radar className="w-3 h-3" />}
              {fallbackMode ? 'Time-fallback tracking' : 'Live GPS tracking'}
            </span>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Heading to {targetName}
            </h1>
          </div>
          <motion.span
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${fallbackMode ? 'bg-gradient-time shadow-glow-time' : 'bg-gradient-gps shadow-glow'
              }`}
          >
            <TrainFront className="w-5 h-5 text-white" />
          </motion.span>
        </div>

        <Card className="p-6 mb-4">
          <MetroLine progress={progress} mode={fallbackMode ? 'time' : 'gps'} />

          <div className="grid grid-cols-2 gap-3 mt-2">
            <Stat label="Destination" value={targetName} icon={MapPin} />
            <Stat
              label={fallbackMode ? 'ETA' : 'Distance'}
              value={
                fallbackMode
                  ? new Date(alarm.expectedArrivalTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  : distance != null
                    ? `${Math.round(distance)} m${
                        gpsRemainingMinutes != null ? ` · ~${Math.round(gpsRemainingMinutes)} min` : ''
                      }`
                    : '—'
              }
              icon={fallbackMode ? Clock3 : Radar}
            />
            <Stat
              label="GPS accuracy"
              value={position ? `${Math.round(position.accuracy)} m` : '—'}
              icon={SignalIcon}
              valueClass={signal.color}
            />
            <Stat label="Signal" value={signal.label} icon={SignalIcon} valueClass={signal.color} />
          </div>
        </Card>

        <Card className="p-4 mb-6">
          <p className="text-xs text-faint font-mono truncate">{status}</p>
        </Card>

        <Button variant="ghost" onClick={handleCancel} icon={X} className="w-full">
          Cancel Alarm
        </Button>
      </motion.div>
    </Container>
  );
}

function Stat({ label, value, icon: Icon, valueClass = 'text-text' }) {
  return (
    <div className="bg-surface-2 border border-border rounded-xl px-4 py-3">
      <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-faint mb-1">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className={`text-sm font-medium font-mono truncate ${valueClass}`}>{value}</p>
    </div>
  );
}

export default GpsTest;