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
import TimedSession from './pages/TimedSession.jsx';

// Routes where the bottom nav should be hidden (full-screen flows)
const HIDE_NAV = ['/', '/onboarding', '/workout', '/cardio', '/mobility'];

export default function App() {
  const { session, profile, loading } = useAuth();
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

  // Signed in but no profile → onboarding
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
        <Route path="/cardio/:id" element={<TimedSession kind="cardio" />} />
        <Route path="/mobility/:id" element={<TimedSession kind="mobility" />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}
