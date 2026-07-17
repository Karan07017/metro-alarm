import { motion } from 'framer-motion';
import { User, Mail, MapPin, Clock3, LogOut, Radar } from 'lucide-react';
import Container from '../components/ui/Container';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function SettingsPage({ user, alarm, onLogout }) {
  return (
    <Container size="sm" className="py-10 sm:py-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-3xl font-semibold tracking-tight mb-1">Settings</h1>
        <p className="text-muted text-sm mb-8">Your profile and alarm preferences.</p>

        <Card className="p-6 mb-5">
          <p className="text-xs uppercase tracking-wide text-faint mb-4">Profile</p>
          <div className="flex items-center gap-4 mb-5">
            <span className="w-14 h-14 rounded-2xl bg-gradient-gps shadow-glow flex items-center justify-center text-white font-display font-semibold text-lg">
              {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-medium text-text">{user?.name || 'Commuter'}</p>
              <p className="text-sm text-faint">{user?.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Row icon={User} label="Name" value={user?.name || '—'} />
            <Row icon={Mail} label="Email" value={user?.email || '—'} />
          </div>
        </Card>

        <Card className="p-6 mb-5">
          <p className="text-xs uppercase tracking-wide text-faint mb-4">Current alarm mode</p>
          {alarm ? (
            <div className="space-y-2">
              <Row
                icon={alarm.triggerMode === 'time-fallback' ? Clock3 : Radar}
                label="Mode"
                value={alarm.triggerMode === 'time-fallback' ? 'Time Based' : 'GPS Based'}
              />
              <Row icon={MapPin} label="Destination" value={alarm.destinationStation} />
            </div>
          ) : (
            <p className="text-sm text-faint">No alarm set right now.</p>
          )}
        </Card>

        <Button variant="danger" icon={LogOut} onClick={onLogout} className="w-full">
          Log out
        </Button>
      </motion.div>
    </Container>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between bg-surface-2 border border-border rounded-xl px-4 py-3">
      <span className="flex items-center gap-2 text-sm text-muted">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </span>
      <span className="text-sm font-medium text-text truncate max-w-[60%] text-right">{value}</span>
    </div>
  );
}
