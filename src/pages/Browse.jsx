import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { groupedIntervalWorkouts, durationLabel } from '../data/intervalWorkouts.js';
import { listAmraps, amrapDurationLabel } from '../data/amrapWorkouts.js';
import { T } from '../lib/theme.js';

export default function Browse() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const groups = groupedIntervalWorkouts(profile?.is_glp1);
  const amraps = listAmraps(profile?.is_glp1);

  return (
    <div className="page">
      <div className="eyebrow">Beyond the plan</div>
      <h1 className="h-title">Workouts</h1>
      <p className="muted" style={{ marginTop: 6 }}>
        Follow-along sessions with hands-free beep timers — warm up, get your heart rate going, or wind down.
      </p>

      {groups.map((g) => (
        <div key={g.category} style={{ marginTop: 24 }}>
          <div style={styles.groupHead}>
            <span style={{ fontSize: 20 }}>{g.meta.emoji}</span>
            <div>
              <h2 style={styles.h2}>{g.meta.label}</h2>
              <div className="muted" style={{ fontSize: 12.5 }}>{g.meta.blurb}</div>
            </div>
          </div>

          <div style={styles.grid}>
            {g.workouts.map((w) => (
              <button key={w.id} className="card" style={styles.card} onClick={() => navigate(`/session/${w.id}`)}>
                <div style={styles.emoji}>{w.emoji}</div>
                <div style={styles.name}>{w.name}</div>
                <div style={styles.meta}>
                  <span>⏱ {durationLabel(w)}</span>
                  <span style={styles.dot}>·</span>
                  <span>{w.difficulty}</span>
                </div>
                <div style={styles.desc}>{w.desc}</div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {amraps.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={styles.groupHead}>
            <span style={{ fontSize: 20 }}>⏳</span>
            <div>
              <h2 style={styles.h2}>AMRAP</h2>
              <div className="muted" style={{ fontSize: 12.5 }}>As many rounds as possible — pick your time cap</div>
            </div>
          </div>
          <div style={styles.grid}>
            {amraps.map((w) => (
              <button key={w.id} className="card" style={styles.card} onClick={() => navigate(`/amrap/${w.id}`)}>
                <div style={styles.emoji}>{w.emoji}</div>
                <div style={styles.name}>{w.name}</div>
                <div style={styles.meta}>
                  <span>⏱ {amrapDurationLabel(w)}</span>
                  <span style={styles.dot}>·</span>
                  <span>{w.difficulty}</span>
                </div>
                <div style={styles.desc}>{w.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {profile?.is_glp1 && (
        <p className="muted" style={{ fontSize: 12, marginTop: 24, lineHeight: 1.5, fontStyle: 'italic' }}>
          High-impact jumping workouts are hidden on your profile — the low-impact cardio here gives the same heart-rate
          benefit, kinder on the joints.
        </p>
      )}
    </div>
  );
}

const styles = {
  groupHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  h2: { fontSize: 24, lineHeight: 1 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  card: { textAlign: 'left', padding: 15, display: 'flex', flexDirection: 'column', gap: 4 },
  emoji: { fontSize: 26 },
  name: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 21, lineHeight: 1, marginTop: 4 },
  meta: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: T.pink, fontWeight: 700, marginTop: 2 },
  dot: { color: 'var(--muted)' },
  desc: { fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.4 },
};
