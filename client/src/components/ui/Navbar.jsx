import { motion } from 'framer-motion';
import { TrainFront, History, Settings, LogOut } from 'lucide-react';

export default function Navbar({ page, onNavigate, onLogout, showNav }) {
  const items = [
    { key: 'home', label: 'Alarm', icon: TrainFront },
    { key: 'history', label: 'History', icon: History },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40">
      <div className="glass border-x-0 border-t-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 font-display font-semibold text-text"
          > */}
          <button
            onClick={() => onNavigate("home")}
            className="
    group
    flex
    items-center
    gap-2
    font-display
    font-semibold
    text-text
    transition-all
    duration-300
    hover:scale-105
    cursor-pointer
  "
          >
            {/* <span className="w-8 h-8 rounded-lg bg-gradient-gps flex items-center justify-center shadow-glow"> */}
            <span
              className="
    w-8
    h-8
    rounded-lg
    bg-gradient-gps
    flex
    items-center
    justify-center
    shadow-glow
    transition-all
    duration-300
    group-hover:shadow-[0_0_25px_rgba(99,102,241,0.7)]
"
            >
              <TrainFront className="w-4 h-4 text-white" />
            </span>
            {/* Metro Alarm */}
            {/* <div className="flex flex-col items-start"> */}
            <div className="hidden sm:flex flex-col items-start">
              <span className="transition-colors duration-300 group-hover:text-white">
                Metro Alarm
              </span>

              <span className="hidden md:block text-[10px] text-muted leading-none">
                Smart Metro Alerts
              </span>
            </div>
          </button>

          {showNav && (
            <nav className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              {items.map((item) => {
                const Icon = item.icon;
                const active = page === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className="relative px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors"
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-surface-2 border border-border-hover rounded-lg"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <Icon
                      className={`w-3.5 h-3.5 relative z-10 ${active ? 'text-text' : 'text-muted'}`}
                    />
                    <span className={`relative z-10 ${active ? 'text-text' : 'text-muted'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          )}

          {onLogout ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition-colors px-3 py-1.5 rounded-lg hover:bg-danger/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          ) : (
            <span className="w-8" />
          )}
        </div>
      </div>
    </header>
  );
}