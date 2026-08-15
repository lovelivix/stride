import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { PROGRAMMES } from '../data/programmes.js';
import { getExercise } from '../data/exercises.js';
import ExerciseCard from '../components/workout/ExerciseCard.jsx';
import { T } from '../lib/theme.js';

export default function Programme() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const programme = PROGRAMMES[profile?.programme_id];
  const [openDay, setOpenDay] = useState(null);

  if (!programme) {
    return (
      <div className="page">
        <h1 className="h-title">Plan</h1>
        <div className="card" style={{ textAlign: 'center', marginTop: 12 }}>
          <p className="muted">No programme selected.</p>
          <button className="btn" onClick={() => navigate('/onboarding')}>Choose a programme</button>
        </div>
      </div>
    );
  }

  const week = profile.current_week || 1;
  const dayKeys = Object.keys(programme.days);

  const enrich = (item) => {
    const ex = getExercise(item.exercise_id);
    return { ...item, name: ex.name, is_calf_focus: ex.is_calf_focus };
  };

  return (
    <div className="page">
      <div className="eyebrow">{programme.name}</div>
      <h1 className="h-title">Your plan</h1>
      <p className="muted" style={{ marginTop: 6 }}>{programme.description}</p>

      <div style={styles.weekBar}>
        {[1, 2, 3, 4].map((w) => (
          <div key={w} style={{ ...styles.weekDot, ...(w === week ? styles.weekDotOn : w < week ? styles.weekDotDone : {}) }}>
            <span style={{ fontSize: 10, fontWeight: 700 }}>WK</span>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, lineHeight: 1 }}>{w}</span>
          </div>
        ))}
      </div>

      {programme.weekly_notes?.[week] && (
        <div style={styles.weekNote}>
          <strong>Week {week}.</strong> {programme.weekly_notes[week]}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18 }}>
        {dayKeys.map((dk) => {
          const day = programme.days[dk];
          const open = openDay === dk;
          const totalSets =
            (day.exercises || []).reduce((n, e) => n + (e.sets || 0), 0) +
            (day.has_calf_finisher ? (day.calf_finisher || []).reduce((n, e) => n + (e.sets || 0), 0) : 0);
          return (
            <div key={dk} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <button style={styles.dayHead} onClick={() => setOpenDay(open ? null : dk)}>
                <div>
                  <div style={styles.dayLabel}>{day.label}</div>
                  <div style={styles.dayMeta}>
                    {day.exercises.length} exercises · {totalSets} sets
                    {day.has_calf_finisher && <span style={styles.calfChip}>+ calf finisher</span>}
                    {day.glp1_adapted}
                  </div>
                </div>
                <span style={{ fontSize: 18, color: 'var(--muted)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>⌄</span>
              </button>

              {open && (
                <div style={{ padding: '0 14px 14px' }}>
                  {day.exercises.map((it, i) => (
                    <ExerciseCard key={i} item={enrich(it)} index={i + 1} />
                  ))}
                  {day.has_calf_finisher && day.calf_finisher && (
                    <>
                      <div style={styles.finisherLabel}>🦵 Calf finisher</div>
                      {day.calf_finisher.map((it, i) => (
                        <ExerciseCard key={`c${i}`} item={enrich(it)} index={day.exercises.length + i + 1} />
                      ))}
                    </>
                  )}
                  {day.mobility_addon && <div style={styles.addon}>+ optional mobility add-on after this session</div>}
                  <button className="btn" style={{ marginTop: 14 }} onClick={() => navigate(`/workout/${dk}`)}>
                    Start this session →
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  weekBar: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 18 },
  weekDot: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '10px 0', borderRadius: 14, background: 'var(--white)', border: '1.5px solid var(--border)', color: 'var(--muted)' },
  weekDotOn: { background: T.pink, borderColor: T.pink, color: '#fff' },
  weekDotDone: { background: '#eafaef', borderColor: '#bfe9cd', color: '#0a8f3c' },
  weekNote: { marginTop: 14, background: 'var(--off)', borderRadius: 14, padding: '12px 14px', fontSize: 13.5, lineHeight: 1.5 },
  dayHead: { display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', padding: 16, textAlign: 'left' },
  dayLabel: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, lineHeight: 1 },
  dayMeta: { fontSize: 12.5, color: 'var(--muted)', marginTop: 5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  calfChip: { fontSize: 10, fontWeight: 700, background: T.lime, color: '#093', padding: '2px 7px', borderRadius: 999 },
  finisherLabel: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, marginTop: 14, marginBottom: 2, color: '#0a8f3c' },
  addon: { fontSize: 12, color: 'var(--muted)', marginTop: 12, fontStyle: 'italic' },
};
