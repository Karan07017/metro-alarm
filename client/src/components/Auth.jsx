import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, TrainFront, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config';
import Input from './ui/Input';
import Button from './ui/Button';
import Card from './ui/Card';
import MetroLine from './MetroLine';

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const url = `${API_BASE_URL}/api/auth/${mode === 'login' ? 'login' : 'register'}`;
    const body = mode === 'login' ? { email, password } : { name, email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ _id: data._id, name: data.name, email: data.email }));
      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-gradient-radial-glow" />
      <div className="pointer-events-none absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gps-from/20 blur-[110px] animate-pulse" />
      <div className="pointer-events-none absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-gps-to/20 blur-[110px] animate-pulse" />

      {/* Left brand panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative z-10">
        <div className="flex items-center gap-2 font-display font-semibold text-lg">
          <span className="w-9 h-9 rounded-xl bg-gradient-gps flex items-center justify-center shadow-glow">
            <TrainFront className="w-4.5 h-4.5 text-white" />
          </span>
          Metro Alarm
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md"
        >
          <h1 className="font-display text-4xl font-semibold tracking-tight mb-4 leading-tight">
            Never miss your
            <br />
            destination again.
          </h1>
          <p className="text-muted mb-8">
            Set a station, doze off if you like — Metro Alarm wakes you up right before you
            arrive, using live GPS or a smart time fallback underground.
          </p>
          <MetroLine progress={0.62} mode="gps" />
        </motion.div>

        <p className="text-xs text-faint">Built for daily commuters.</p>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <div className="lg:hidden flex items-center gap-2 font-display font-semibold text-lg mb-8 justify-center">
            <span className="w-9 h-9 rounded-xl bg-gradient-gps flex items-center justify-center shadow-glow">
              <TrainFront className="w-4.5 h-4.5 text-white" />
            </span>
            Metro Alarm
          </div>

          <Card className="p-7">
            <h2 className="font-display text-2xl font-semibold mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-sm text-muted mb-6">
              {mode === 'login' ? 'Log in to manage your alarms.' : 'Start commuting stress-free.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence initial={false}>
                {mode === 'register' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <Input
                      label="Name"
                      icon={User}
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                label="Email"
                icon={Mail}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                label="Password"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                endAdornment={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-faint hover:text-text transition-colors p-1.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
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
                icon={ArrowRight}
                className="w-full flex-row-reverse"
                size="lg"
              >
                {mode === 'login' ? 'Log in' : 'Create account'}
              </Button>
            </form>

            <p className="text-sm text-muted text-center mt-6">
              {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setError(null);
                }}
                className="text-text font-medium hover:text-gps-to transition-colors"
              >
                {mode === 'login' ? 'Register' : 'Log in'}
              </button>
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default Auth;
