import { NavLink } from 'react-router-dom';

const items = [
  { to: '/today', label: 'Today', icon: '🏠' },
  { to: '/programme', label: 'Plan', icon: '📋' },
  { to: '/browse', label: 'Workouts', icon: '🔥' },
  { to: '/history', label: 'History', icon: '📈' },
  { to: '/progress', label: 'Stats', icon: '📸' },
  { to: '/profile', label: 'You', icon: '⚙️' },
];

export default function BottomNav() {
  return (
    <nav style={styles.nav}>
      {items.map((it) => (
        <NavLink key={it.to} to={it.to} style={({ isActive }) => ({ ...styles.item, ...(isActive ? styles.active : {}) })}>
          <span style={styles.icon}>{it.icon}</span>
          <span style={styles.label}>{it.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    height: 'var(--nav-h)',
    background: 'rgba(255,255,255,0.94)',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 'env(safe-area-inset-bottom)',
    zIndex: 50,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 3,
    color: 'var(--muted)',
    fontSize: 10,
    fontWeight: 600,
    flex: 1,
    padding: '6px 0',
  },
  active: { color: 'var(--pink)' },
  icon: { fontSize: 19, lineHeight: 1 },
  label: { letterSpacing: 0.2 },
};
