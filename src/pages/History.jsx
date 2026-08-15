import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { PROGRAMMES } from '../data/programmes.js';
import { T } from '../lib/theme.js';

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [prCounts, setPrCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: s } = await supabase.from('sessions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(60);
      setSessions(s || []);
      const ids = (s || []).map((x) => x.id);
      if (ids.length) {
        const { data: prs } = await supabase.from('session_sets').select('session_id').eq('user_id', user.id).eq('is_pr', true).in('session_id', ids);
        const counts = {};
        (prs || []).forEach((r) => { counts[r.session_id] = (counts[r.session_id] || 0) + 1; });
        setPrCounts(counts);
      }
      setLoading(false);
    })();
  }, [user]);

  const label = (s) => {
    const prog = PROGRAMMES[s.programme_id];
    const dayKey = s.workout_id?.split('_').pop();
    return prog?.days?.[dayKey]?.label || s.workout_id;
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;

  const totalVolume = sessions.reduce((n, s) => n + (s.total_volume_kg || 0), 0);

  return (
    <div className="page">
      <div className="eyebrow">Your log</div>
      <h1 className="h-title">History</h1>

      {sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontSize: 34 }}>🏁</div>
          <p className="muted" style={{ marginTop: 6 }}>No sessions yet. Your first workout will appear here.</p>
          <button className="btn" onClick={() => navigate('/today')}>Start today’s session</button>
        </div>
      ) : (
        <>
          <div style={styles.summary}>
            <div style={styles.sumStat}><div style={styles.sumVal}>{sessions.length}</div><div style={styles.sumLbl}>Sessions</div></div>
            <div style={styles.sumStat}><div style={styles.sumVal}>{Math.round(totalVolume).toLocaleString()}</div><div style={styles.sumLbl}>Total kg</div></div>
            <div style={styles.sumStat}><div style={styles.sumVal}>{Object.values(prCounts).reduce((a, b) => a + b, 0)}</div><div style={styles.sumLbl}>PRs</div></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
            {sessions.map((s) => (
              <div key={s.id} className="card" style={styles.row}>
                <div style={{ flex: 1 }}>
                  <div style={styles.rowLabel}>{label(s)}</div>
                  <div style={styles.rowMeta}>
                    {format(new Date(s.completed_at), 'EEE d MMM · HH:mm')}
                    {s.location && <span> · {s.location === 'gym' ? '🏋️ Gym' : '🏠 Home'}</span>}
                    {s.duration_mins ? <span> · {s.duration_mins} min</span> : null}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {s.total_volume_kg ? <div style={styles.vol}>{Math.round(s.total_volume_kg)}kg</div> : null}
                  <div style={styles.badges}>
                    {s.rpe ? <span style={styles.rpe}>RPE {s.rpe}</span> : null}
                    {prCounts[s.id] ? <span style={styles.pr}>🏆 {prCounts[s.id]}</span> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  summary: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16 },
  sumStat: { background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 0', textAlign: 'center', boxShadow: 'var(--shadow-sm)' },
  sumVal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, lineHeight: 1, color: T.pink },
  sumLbl: { fontSize: 10.5, color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 },
  row: { display: 'flex', alignItems: 'center', gap: 12, padding: 15 },
  rowLabel: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, lineHeight: 1 },
  rowMeta: { fontSize: 12, color: 'var(--muted)', marginTop: 4 },
  vol: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: 'var(--text)' },
  badges: { display: 'flex', gap: 5, justifyContent: 'flex-end', marginTop: 3 },
  rpe: { fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', background: 'var(--off)', padding: '2px 7px', borderRadius: 999 },
  pr: { fontSize: 10.5, fontWeight: 700, color: '#8a5a20', background: '#fff4e8', padding: '2px 7px', borderRadius: 999 },
};
