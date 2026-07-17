import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { History as HistoryIcon, MapPin, Bell, XCircle, Clock3, Radar } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';

const statusMeta = {
  triggered: { label: 'Arrived', color: 'text-success bg-success/10 border-success/25', icon: Bell },
  active: { label: 'In progress', color: 'text-gps-to bg-gps-from/10 border-gps-from/25', icon: Radar },
  pending: { label: 'Pending', color: 'text-time-from bg-time-from/10 border-time-from/25', icon: Clock3 },
  cancelled: { label: 'Cancelled', color: 'text-faint bg-white/5 border-border', icon: XCircle },
};

function groupByDay(alarms) {
  const groups = {};
  for (const alarm of alarms) {
    const date = new Date(alarm.createdAt || alarm.startTime || Date.now());
    const key = date.toDateString();
    groups[key] = groups[key] || [];
    groups[key].push(alarm);
  }
  return Object.entries(groups).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
}

function dayLabel(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function HistoryPage({ token }) {
  const [alarms, setAlarms] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/alarms`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Could not load history');
        return res.json();
      })
      .then(setAlarms)
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <Container size="md" className="py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">History</h1>
        <p className="text-muted text-sm mb-8">Every journey Metro Alarm has watched over.</p>

        {error && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/25 rounded-lg px-3 py-2 mb-6">
            {error}
          </p>
        )}

        {!alarms && !error && (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {alarms && alarms.length === 0 && (
          <EmptyState
            icon={HistoryIcon}
            title="No alarms yet"
            description="Once you create and ride out an alarm, it'll show up here."
          />
        )}

        {alarms && alarms.length > 0 && (
          <div className="space-y-8">
            {groupByDay(alarms).map(([day, dayAlarms]) => (
              <div key={day}>
                <p className="text-xs uppercase tracking-wide text-faint mb-3">{dayLabel(day)}</p>
                <div className="space-y-3">
                  {dayAlarms.map((alarm, i) => {
                    const meta = statusMeta[alarm.status] || statusMeta.pending;
                    const StatusIcon = meta.icon;
                    return (
                      <motion.div
                        key={alarm._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                      >
                        <Card hover className="p-4 flex items-center gap-4">
                          <span className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-muted" />
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">
                              {alarm.destinationStation}
                            </p>
                            <p className="text-xs text-faint">
                              {alarm.durationMinutes} min ·{' '}
                              {alarm.triggerMode === 'time-fallback' ? 'Time based' : 'GPS based'}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${meta.color}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {meta.label}
                          </span>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </Container>
  );
}
