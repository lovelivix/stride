import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './lib/AuthContext.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import Login from './pages/Login.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Today from './pages/Today.jsx';
import Programme from './pages/Programme.jsx';
import ActiveWorkout from './pages/ActiveWorkout.jsx';
import History from './pages/History.jsx';
import Progress from './pages/Progress.jsx';
import Profile from './pages/Profile.jsx';
import Browse from './pages/Browse.jsx';
import IntervalSession from './pages/IntervalSession.jsx';
import AmrapSession from './pages/AmrapSession.jsx';

// Routes where the bottom nav should be hidden (full-screen flows)
const HIDE_NAV = ['/', '/onboarding', '/workout', '/session', '/amrap', '/cardio', '/mobility'];

export default function App() {
  const { session, profile, loading, profileChecked, profileError, refreshProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }

  // Not signed in → login only
  if (!session) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // Signed in but the profile fetch hasn't returned yet → wait.
  // (Prevents briefly showing onboarding to an existing user.)
  if (!profileChecked) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    );
  }

  // Signed in, fetch failed (network/RLS) — offer a retry rather than wrongly
  // sending an existing account back through onboarding.
  if (profileError && !profile) {
    return (
      <div className="center-screen">
        <p className="muted" style={{ textAlign: 'center', marginBottom: 14 }}>
          Couldn’t load your account just now. Check your connection and try again.
        </p>
        <button className="btn" style={{ maxWidth: 240 }} onClick={refreshProfile}>Retry</button>
      </div>
    );
  }

  // Signed in but genuinely no profile → onboarding
  if (!profile) {
    return (
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  const showNav = !HIDE_NAV.some((p) => (p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)));

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/today" element={<Today />} />
        <Route path="/programme" element={<Programme />} />
        <Route path="/workout/:day" element={<ActiveWorkout />} />
        <Route path="/history" element={<History />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/session/:id" element={<IntervalSession />} />
        <Route path="/amrap/:id" element={<AmrapSession />} />
        {/* Legacy links still work — routed through the interval player */}
        <Route path="/cardio/:id" element={<IntervalSession />} />
        <Route path="/mobility/:id" element={<IntervalSession />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}
