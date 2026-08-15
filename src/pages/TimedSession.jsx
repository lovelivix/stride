import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { CARDIO_SESSIONS, MOBILITY_SESSIONS } from '../data/programmes.js';
import Timer from '../components/workout/Timer.jsx';
import { T } from '../lib/theme.js';

// kind: 'cardio' | 'mobility'
export default function TimedSession({ kind }) {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const [saved, setSaved] = useState(false);

  const list = kind === 'cardio' ? CARDIO_SESSIONS : MOBILITY_SESSIONS;
  const session = list.find((s) => s.id === id) || list[0];

  const logCardio = async () => {
    if (kind !== 'cardio' || !user) {
      navigate('/today');
      return;
    }
    await supabase.from('sessions').insert({
      user_id: user.id,
      workout_id: session.id,
      programme_id: profile?.programme_id || 'cardio',
      duration_mins: session.duration,
      location: 'home',
      total_volume_kg: 0,
    });
    setSaved(true);
    setTimeout(() => navigate('/today'), 900);
  };

  return (
    <div className="page-no-nav">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button style={styles.close} onClick={() => navigate('/today')}>✕</button>
        <span style={styles.kind}>{kind === 'cardio' ? session.category || 'Cardio' : 'Mobility'}</span>
        <span style={{ width: 36 }} />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 44 }}>{session.emoji || '🧘‍♀️'}</div>
        <h1 style={{ fontSize: 40, marginTop: 6 }}>{session.name}</h1>
        <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.5, maxWidth: 320, margin: '8px auto 0' }}>{session.desc}</p>
        <div style={styles.meta}>
          <span>⏱ {session.duration} min</span>
          {session.difficulty && <span>· {session.difficulty}</span>}
        </div>
      </div>

      <div style={{ margin: '28px 0' }}>
        <Timer seconds={session.duration * 60} label={done ? 'Complete — great work!' : 'Follow along at your own pace'} onComplete={() => setDone(true)} />
      </div>

      {kind === 'cardio' ? (
        <button className="btn" disabled={saved} onClick={logCardio}>{saved ? 'Logged ✓' : done ? '✓ Log this session' : 'Finish & log'}</button>
      ) : (
        <button className="btn" onClick={() => navigate('/today')}>{done ? 'Done ✓' : 'Finish'}</button>
      )}
      <p className="muted" style={{ fontSize: 12, textAlign: 'center', marginTop: 12 }}>
        {kind === 'cardio'
          ? 'Move through the intervals at an intensity that suits you today.'
          : 'Ease into each stretch — never force a position. Breathe.'}
      </p>
    </div>
  );
}

const styles = {
  close: { fontSize: 20, color: 'var(--muted)', width: 36, height: 36 },
  kind: { fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: T.pink },
  meta: { display: 'flex', gap: 8, justifyContent: 'center', fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginTop: 10 },
};
