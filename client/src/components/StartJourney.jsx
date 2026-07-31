import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Clock3, PlayCircle, X, TrainFront } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Button from './ui/Button';
import Card from './ui/Card';
import Container from './ui/Container';
import MetroLine from './MetroLine';
import { useToast } from './ui/Toast';

function StartJourney({ alarm, token, onStarted, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const isTimeMode = alarm.triggerMode === 'time-fallback';

  const handleStart = async () => {
    setLoading(true);
    setError(null);

  
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/alarms/${alarm._id}/start`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Could not start journey');
      const updated = await res.json();
      onStarted(updated);
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/alarms/${alarm._id}`, {
        method: 'PATCH',
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

  return (
    <Container size="sm" className="py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="p-7 text-center">
          <div className="flex justify-center mb-5">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                isTimeMode ? 'bg-gradient-time shadow-glow-time' : 'bg-gradient-gps shadow-glow'
              }`}
            >
              <TrainFront className="w-7 h-7 text-white" />
            </motion.span>
          </div>

          <h2 className="font-display text-2xl font-semibold mb-1">Ready to go?</h2>
          <p className="text-muted text-sm mb-6">
            Hop on the train, then tap Start Journey to begin tracking.
          </p>

          <div className="text-left space-y-3 mb-6">
            <MetroLine progress={0} mode={isTimeMode ? 'time' : 'gps'} compact />

            <div className="flex items-center justify-between bg-surface-2 border border-border rounded-xl px-4 py-3">
              <span className="text-sm text-muted">Destination</span>
              <span className="text-sm font-medium text-text">{alarm.destinationStation}</span>
            </div>

            {alarm.triggerStation && alarm.triggerStation !== alarm.destinationStation && (
              <div className="flex gap-2.5 items-start bg-white/5 border border-border rounded-xl px-4 py-3">
                <Bell className="w-4 h-4 text-gps-to shrink-0 mt-0.5" />
                <p className="text-sm text-text/90">
                  The alarm rings at <strong>{alarm.triggerStation}</strong> — one stop early, so
                  you have time to get ready.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between bg-surface-2 border border-border rounded-xl px-4 py-3">
              <span className="text-sm text-muted flex items-center gap-1.5">
                <Clock3 className="w-3.5 h-3.5" /> Estimated duration
              </span>
              <span className="text-sm font-medium text-text">{alarm.durationMinutes} min</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/25 rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleCancel} icon={X} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleStart}
              loading={loading}
              variant={isTimeMode ? 'time' : 'primary'}
              icon={PlayCircle}
              className="flex-[2]"
            >
              Start Journey
            </Button>
          </div>
        </Card>
      </motion.div>
    </Container>
  );
}

export default StartJourney;
