// import { useState, useEffect, useMemo } from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  ArrowRight,
  ArrowLeftRight,
  Clock3,
  Star,
  History as HistoryIcon,
  TrainFront,
  RefreshCcw,
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';
import Container from './ui/Container';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from './ui/Toast';

function StationPicker({
  id,
  activeDropdown,
  setActiveDropdown,
  label,
  stations,
  value,
  onChange,
  recentIds,
  query,
  onQuery
}) {
  const wrapperRef = useRef(null);
  // const [open, setOpen] = useState(false);
  const open = activeDropdown === id;
  const selected = stations.find((s) => s._id === value);
  useEffect(() => {

    function handleOutside(e) {

      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        // setOpen(false);
        setActiveDropdown(null);
      }

    }

    document.addEventListener("mousedown", handleOutside);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutside
      );

  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return stations;
    return stations.filter((s) => s.name.toLowerCase().includes(q));
  }, [stations, query]);

  const recent = stations.filter((s) => recentIds.includes(s._id)).slice(0, 4);
  const popular = stations.slice(0, 6);

  return (
    // <div className="relative">
    <div ref={wrapperRef} className="relative">
      <label className="block text-xs font-medium text-muted mb-1.5">{label}</label>
      <button
        type="button"
        // onClick={() => setOpen((v) => !v)}
        onClick={() =>
          setActiveDropdown(
            open ? null : id
          )
        }
        className={`w-full flex items-center gap-3 bg-surface-2 border rounded-xl px-4 py-3.5 text-left transition-colors ${open ? 'border-gps-from/60' : 'border-border hover:border-border-hover'
          }`}
      >
        <MapPin className="w-4 h-4 text-faint shrink-0" />
        <span className={`text-sm flex-1 truncate ${selected ? 'text-text' : 'text-faint'}`}>
          {selected ? selected.name : 'Select a station'}
        </span>
        {selected && (
          <span className="text-[10px] uppercase tracking-wide text-faint bg-white/5 px-2 py-0.5 rounded-full">
            {selected.line}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 mt-2 w-full glass rounded-2xl shadow-glass p-3 max-h-96 overflow-y-auto"
          >
            <Input
              icon={Search}
              placeholder="Search stations..."
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              autoFocus
              containerClassName="mb-3"
            />

            {!query && recent.length > 0 && (
              <div className="mb-3">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-faint mb-1.5 px-1">
                  <HistoryIcon className="w-3 h-3" /> Recent
                </p>
                {recent.map((s) => (
                  <StationRow key={s._id} station={s} onClick={() => { onChange(s._id); setActiveDropdown(null); onQuery(''); }} />
                ))}
              </div>
            )}

            {/* {!query && (
              <div className="mb-1">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-faint mb-1.5 px-1">
                  <Star className="w-3 h-3" /> Popular
                </p>
                {popular.map((s) => (
                  <StationRow key={s._id} station={s} onClick={() => { onChange(s._id); setOpen(false); onQuery(''); }} />
                ))}
              </div>
            )} */}
            {!query && (
              <div className="mb-1">
                <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-faint mb-1.5 px-1">
                  <Star className="w-3 h-3" />
                  All Stations
                </p>

                {stations.map((s) => (
                  <StationRow
                    key={s._id}
                    station={s}
                    onClick={() => {
                      onChange(s._id);
                      // setOpen(false);
                      setActiveDropdown(null);
                      onQuery('');
                    }}
                  />
                ))}
              </div>
            )}

            {query && (
              <div>
                {filtered.length === 0 && (
                  <p className="text-sm text-faint text-center py-6">No stations found.</p>
                )}
                {filtered.map((s) => (
                  <StationRow key={s._id} station={s} onClick={() => { onChange(s._id); setActiveDropdown(null); onQuery(''); }} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StationRow({ station, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
    >
      <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <TrainFront className="w-3.5 h-3.5 text-muted" />
      </span>
      <span className="text-sm text-text flex-1 truncate">{station.name}</span>
      <span className="text-[10px] uppercase tracking-wide text-faint">{station.line}</span>
    </button>
  );
}

function AlarmSetup({ token, mode = 'gps', onAlarmCreated, onChangeMode }) {
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [triggerDistance, setTriggerDistance] = useState(500);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentIds, setRecentIds] = useLocalStorage('metro-alarm:recent-stations', []);
  const toast = useToast();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/stations`)
      .then((res) => res.json())
      .then((data) => {
        setStations(data);
        setLoadingStations(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoadingStations(false);
      });
  }, []);

  // const swapStations = () => {
  //   setFromId(toId);
  //   setToId(fromId);
  // };
  const swapStations = () => {
    setFromId(toId);
    setToId(fromId);

    setFromQuery("");
    setToQuery("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromId || !toId) return setError('Select both stations to continue.');
    if (fromId === toId) return setError('From and To stations must be different.');

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/alarms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fromStationId: fromId,
          toStationId: toId,
          triggerDistance: Number(triggerDistance),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Alarm creation failed');
      let alarm = await res.json();

      // Time Based mode chosen upfront on the landing screen — set the
      // trigger mode immediately instead of waiting for a GPS failure.
      if (mode === 'time') {
        try {
          const modeRes = await fetch(`${API_BASE_URL}/api/alarms/${alarm._id}/mode`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ triggerMode: 'time-fallback' }),
          });
          if (modeRes.ok) alarm = await modeRes.json();
        } catch (modeErr) {
          console.error('Mode sync failed:', modeErr);
        }
      }

      setRecentIds((prev) => [fromId, toId, ...prev.filter((id) => id !== fromId && id !== toId)].slice(0, 6));
      toast('Alarm created — ready when you are.', 'success');
      onAlarmCreated(alarm);
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" className="py-10 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-7">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${mode === 'time'
                ? 'bg-time-from/10 text-time-from border border-time-from/25'
                : 'bg-gps-from/10 text-gps-to border border-gps-from/25'
                }`}
            >
              <Clock3 className="w-3 h-3" />
              {mode === 'time' ? 'Time Based mode' : 'GPS Based mode'}
            </span>

            {onChangeMode && (
              <button
                type="button"
                onClick={onChangeMode}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-text transition-colors px-2.5 py-1 rounded-full hover:bg-white/5"
              >
                <RefreshCcw className="w-3 h-3" />
                Change Mode
              </button>
            )}
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Set your alarm</h1>
          <p className="text-muted text-sm mt-1">Pick where you're getting on and off.</p>
        </div>

        <Card className="p-6">
          {loadingStations ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                {/* <StationPicker
                  label="From"
                  stations={stations}
                  value={fromId}
                  onChange={setFromId}
                  recentIds={recentIds}
                  query={fromQuery}
                  onQuery={setFromQuery}
                /> */}
                <StationPicker
                  id="from"
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  label="From"
                  stations={stations}
                  value={fromId}
                  onChange={setFromId}
                  recentIds={recentIds}
                  query={fromQuery}
                  onQuery={setFromQuery}
                />

                <div className="flex justify-center -my-1 relative z-20">
                  <button
                    type="button"
                    onClick={swapStations}
                    className="w-8 h-8 rounded-full bg-surface-2 border border-border hover:border-border-hover flex items-center justify-center transition-colors my-1"
                    title="Swap stations"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-muted" />
                  </button>
                </div>

                {/* <StationPicker
                  label="To"
                  stations={stations}
                  value={toId}
                  onChange={setToId}
                  recentIds={recentIds}
                  query={toQuery}
                  onQuery={setToQuery}
                /> */}
                <StationPicker
                  id="to"
                  activeDropdown={activeDropdown}
                  setActiveDropdown={setActiveDropdown}
                  label="To"
                  stations={stations}
                  value={toId}
                  onChange={setToId}
                  recentIds={recentIds}
                  query={toQuery}
                  onQuery={setToQuery}
                />
              </div>

              <Input
                label="Trigger distance (meters)"
                type="number"
                min={100}
                step={50}
                value={triggerDistance}
                onChange={(e) => setTriggerDistance(e.target.value)}
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-danger bg-danger/10 border border-danger/25 rounded-lg px-3 py-2"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                loading={loading}
                variant={mode === 'time' ? 'time' : 'primary'}
                icon={ArrowRight}
                className="w-full flex-row-reverse"
                size="lg"
              >
                Start Alarm
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </Container>
  );
}

export default AlarmSetup;