import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, TriangleAlert, Zap, Radar, BatteryCharging, ShieldCheck, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import Container from '../components/ui/Container';
import MetroLine from '../components/MetroLine';

const options = [
  {
    key: 'gps',
    icon: MapPin,
    title: 'GPS Based',
    description: 'Uses continuous live GPS tracking.',
    benefits: [
      { icon: Zap, label: 'Most accurate' },
      { icon: Radar, label: 'Live distance tracking' },
      { icon: ShieldCheck, label: 'Real-time alerts' },
    ],
    warning: 'Best experience requires continuous GPS. Avoid underground stations where GPS signals may be weak.',
    gradient: 'bg-gradient-gps',
    glow: 'shadow-glow',
  },
  {
    key: 'time',
    icon: Clock,
    title: 'Time Based',
    description: 'Uses estimated arrival time.',
    benefits: [
      { icon: Zap, label: 'Works without continuous GPS' },
      { icon: BatteryCharging, label: 'Battery friendly' },
      { icon: ShieldCheck, label: 'Reliable underground' },
    ],
    gradient: 'bg-gradient-time',
    glow: 'shadow-glow-time',
  },
];

export default function ModeSelect({ onContinue }) {
  const [selected, setSelected] = useState(null);

  return (
    <Container size="lg" className="py-14 sm:py-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="font-display text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
          Metro Alarm
        </h1>
        <p className="text-muted text-base sm:text-lg">Never miss your destination again.</p>
        <div className="max-w-xs mx-auto mt-8 opacity-80">
          <MetroLine progress={0.55} mode={selected === 'time' ? 'time' : 'gps'} compact />
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-5">
        {options.map((opt, i) => {
          const Icon = opt.icon;
          const isSelected = selected === opt.key;
          return (
            <motion.button
              key={opt.key}
              type="button"
              onClick={() => setSelected(opt.key)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.985 }}
              className={`text-left glass rounded-2xl p-6 relative overflow-hidden transition-shadow duration-300 ${
                isSelected ? opt.glow : ''
              }`}
              style={{
                borderColor: isSelected ? 'rgba(255,255,255,0.22)' : undefined,
              }}
            >
              {isSelected && (
                <motion.div
                  layoutId="mode-select-glow"
                  className={`absolute inset-0 opacity-[0.08] ${opt.gradient}`}
                />
              )}

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <span className={`w-11 h-11 rounded-xl ${opt.gradient} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </span>
                  <motion.span
                    animate={{
                      scale: isSelected ? 1 : 0.6,
                      opacity: isSelected ? 1 : 0,
                    }}
                    className={`w-6 h-6 rounded-full ${opt.gradient} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    ✓
                  </motion.span>
                </div>

                <h3 className="font-display text-lg font-semibold mb-1">{opt.title}</h3>
                <p className="text-sm text-muted mb-4">{opt.description}</p>

                <ul className="space-y-2 mb-4">
                  {opt.benefits.map((b) => {
                    const BIcon = b.icon;
                    return (
                      <li key={b.label} className="flex items-center gap-2 text-sm text-text/90">
                        <BIcon className="w-3.5 h-3.5 text-muted shrink-0" />
                        {b.label}
                      </li>
                    );
                  })}
                </ul>

                {opt.warning && (
                  <div className="flex gap-2 items-start bg-time-from/10 border border-time-from/25 rounded-xl px-3 py-2.5">
                    <TriangleAlert className="w-3.5 h-3.5 text-time-from shrink-0 mt-0.5" />
                    <p className="text-xs text-time-from/90 leading-relaxed">{opt.warning}</p>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center mt-8"
      >
        <Button
          size="lg"
          disabled={!selected}
          variant={selected === 'time' ? 'time' : 'primary'}
          onClick={() => selected && onContinue(selected)}
          icon={ArrowRight}
          className="min-w-[200px] flex-row-reverse"
        >
          Continue
        </Button>
      </motion.div>
    </Container>
  );
}
