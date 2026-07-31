import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import AlarmSetup from './components/AlarmSetup';
import StartJourney from './components/StartJourney';
import GpsTest from './components/GpsTest';
import ModeSelect from './pages/ModeSelect';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/ui/Layout';
import Navbar from './components/ui/Navbar';
import Loader from './components/ui/Loader';
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';
import { ToastProvider } from './components/ui/Toast';
import { API_BASE_URL } from './config';

function AppShell() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [alarm, setAlarm] = useState(null);
  const [checkingAlarm, setCheckingAlarm] = useState(true);
  const [page, setPage] = useState('home');
  const [selectedMode, setSelectedMode] = useState(null);
  const [confirmModeChange, setConfirmModeChange] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();
  const isGuest = Boolean(user?.isGuest);

  // Guests can only reach Metro Alarm — History/Settings/Profile/Account
  // are off-limits, so any attempt to navigate there bounces back to home.
  const navigate = (target) => {
    if (isGuest && (target === 'history' || target === 'settings')) {
      setPage('home');
      return;
    }
    setPage(target);
  };

  useEffect(() => {
    if (!token) {
      setCheckingAlarm(false);
      return;
    }

    const restoreAlarm = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/alarms`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch alarms');
        const alarms = await res.json();
        const relevant = alarms.find(
          (a) => a.status === 'active' || a.status === 'pending'
        );
        if (relevant) setAlarm(relevant);
      } catch (err) {
        console.error('Alarm restore failed:', err);
      } finally {
        setCheckingAlarm(false);
      }
    };

    restoreAlarm();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setAlarm(null);
    setSelectedMode(null);
    setPage('home');
  };

  // Single source of truth for "leave the current alarm setup and go back
  // to Mode Selection" — reused by the navbar's mode-selection target and
  // by the new Change Mode action below, so there's only one reset path.
  const resetToModeSelect = () => {
    setAlarm(null);
    setSelectedMode(null);
    navigate('home');
  };

  // Called from AlarmSetup's "Change Mode" button. No alarm has been
  // created yet at that point (AlarmSetup only renders while alarm is
  // null), so this resets straight away. The alarm-exists branch is kept
  // here too so the same handler stays correct if ever reused from a
  // screen where an alarm already exists (e.g. an active journey).
  const handleChangeMode = () => {
    if (!alarm) {
      resetToModeSelect();
    } else {
      setConfirmModeChange(true);
    }
  };

  if (!token) return <Auth onLogin={setToken} />;

  if (checkingAlarm) return <Loader full label="Checking for active alarm..." />;

  let homeContent;
  if (!alarm) {
    homeContent = selectedMode ? (
      <AlarmSetup
        token={token}
        mode={selectedMode}
        onAlarmCreated={setAlarm}
        onChangeMode={handleChangeMode}
      />
    ) : (
      <ModeSelect onContinue={setSelectedMode} />
    );
  } else if (alarm.status === 'pending') {
    homeContent = (
      <StartJourney
        alarm={alarm}
        token={token}
        onStarted={setAlarm}
        onCancel={() => {
          setAlarm(null);
          setSelectedMode(null);
        }}
      />
    );
  } else {
    homeContent = (
      <GpsTest
        alarm={alarm}
        token={token}
        onCancel={() => {
          setAlarm(null);
          setSelectedMode(null);
        }}
      />
    );
  }

  const content =
    page === 'history' && !isGuest ? (
      <HistoryPage token={token} />
    ) : page === 'settings' && !isGuest ? (
      // <SettingsPage user={user} alarm={alarm} onLogout={handleLogout} />
      // NEW
      <SettingsPage
        user={user}
        alarm={alarm}
        onLogout={handleLogout}
        onResume={() => setPage('home')}
      />
    ) : (
      homeContent
    );

  const effectivePage = isGuest && (page === 'history' || page === 'settings') ? 'home' : page;

  return (
    <Layout
      navbar={
        // <Navbar
        //   page={page}
        //   onNavigate={setPage}
        //   onLogout={page === 'settings' ? undefined : handleLogout}
        //   showNav
        // />
        <Navbar
          page={effectivePage}
          isGuest={isGuest}
          onNavigate={(target) => {
            if (target === "mode-selection") {
              resetToModeSelect();
              return;
            }

            navigate(target);
          }}
          onLogout={effectivePage === "settings" ? undefined : handleLogout}
          showNav
        />
      }
    >
      {content}

      <Modal
        open={confirmModeChange}
        onClose={() => setConfirmModeChange(false)}
        title="Change alarm mode?"
      >
        <p className="text-sm text-muted mb-6">
          Changing the mode will discard your current alarm setup.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setConfirmModeChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmModeChange(false);
              resetToModeSelect();
            }}
            className="flex-1"
          >
            Continue
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}

export default App;