import { motion } from 'framer-motion';

// Signature element: a metro line with the current train position travelling
// toward the destination stop. Doubles as a progress indicator across the
// hero, GPS tracking screen and the active-alarm screen.
export default function MetroLine({ progress = 0, mode = 'gps', triggered = false, compact = false }) {
  const clamped = Math.min(1, Math.max(0, progress));
  const gradientId = mode === 'time' ? 'metroLineTime' : 'metroLineGps';
  const dotColor = mode === 'time' ? '#FFB347' : '#7C5CFF';
  const height = compact ? 64 : 96;

  return (
    <svg viewBox={`0 0 400 ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id="metroLineGps" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
        <linearGradient id="metroLineTime" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFB347" />
          <stop offset="100%" stopColor="#FF6B4A" />
        </linearGradient>
      </defs>

      {/* base track */}
      <line
        x1="20"
        y1={height / 2}
        x2="380"
        y2={height / 2}
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* travelled track */}
      <motion.line
        x1="20"
        y1={height / 2}
        x2="380"
        y2={height / 2}
        stroke={`url(#${gradientId})`}
        strokeWidth="4"
        strokeLinecap="round"
        style={{ pathLength: clamped }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: clamped }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* origin stop */}
      <circle cx="20" cy={height / 2} r="6" fill="#181B24" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
      {/* destination stop */}
      <circle
        cx="380"
        cy={height / 2}
        r="7"
        fill={triggered ? dotColor : '#181B24'}
        stroke={dotColor}
        strokeWidth="2.5"
      />

      {/* moving train dot */}
      <motion.g
        initial={{ x: 20 }}
        animate={{ x: 20 + clamped * 360 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {!compact && (
          <circle cy={height / 2} r="12" fill={dotColor} opacity="0.25" className="animate-pulse-ring" />
        )}
        <circle cy={height / 2} r="7" fill="white" />
        <circle cy={height / 2} r="7" fill={dotColor} fillOpacity="0.85" />
      </motion.g>
    </svg>
  );
}
