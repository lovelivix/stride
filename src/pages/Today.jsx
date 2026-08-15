import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { PROGRAMMES } from '../data/programmes.js';
import { getDailySuggestion } from '../lib/smartSuggestions.js';
import { T } from '../lib/theme.js';

export default function Today() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [walks, setWalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walkSaving, setWalkSaving] = useState(false);

  const programme = PROGRAMMES[profile?.programme_id];

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date(Date.now() - 21 * 864e5).toISOString();
      const [{ data: s }, { data: w }] = await Promise.all([
        supabase.from('sessions').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(20),
        supabase.from('walk_logs').select('*').eq('user_id', user.id).gte('logged_at', since).order('logged_at', { ascending: false }),
      ]);
      setSessions(s || []);
      setWalks(w || []);
      setLoading(false);
    })();
  }, [user]);

  const suggestion = profile ? getDailySuggestion(profile, sessions) : null;

  const todayWalks = walks.filter((w) => new Date(w.logged_at).toDateString() === new Date().toDateString());
  const weekWalks = walks.filter((w) => (Date.now() - new Date(w.logged_at)) / 864e5 <= 7);

  const logWalk = async (mins) => {
    setWalkSaving(true);
    const { data } = await supabase.from('walk_logs').insert({ user_id: user.id, duration_mins: mins }).select().single();
    if (data) setWalks((prev) => [data, ...prev]);
    setWalkSaving(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div style={{ marginBottom: 4 }}>
        <div className="eyebrow">{greeting()}, {profile?.name || 'there'}</div>
        <h1 className="h-title">Today</h1>
      </div>

      {/* GLP-1 low-energy shortcut */}
      {profile?.is_glp1 && suggestion?.type === 'workout' && (
        <button style={styles.lowEnergy} onClick={() => navigate(`/workout/${suggestion.day}?low=1`)}>
          🌙 Low energy today? Tap for a lighter version
        </button>
      )}

      {/* Primary suggestion card */}
      {suggestion && (
        <div className="card" style={styles.suggestCard}>
          <div style={styles.suggestTop}>
            <span style={styles.suggestType}>
              {suggestion.type === 'workout' ? '🎯 Suggested today' : suggestion.type === 'rest' ? '🌿 Recovery' : '💆 Take it easy'}
            </span>
            {suggestion.max_per_week != null && (
              <span style={styles.weekPill}>{suggestion.sessions_this_week}/{suggestion.max_per_week} this week</span>
            )}
          </div>
          <p style={styles.suggestMsg}>{suggestion.message}</p>

          {suggestion.type === 'workout' ? (
            <button className="btn" onClick={() => navigate(`/workout/${suggestion.day}`)}>
              Start {programme?.days?.[suggestion.day]?.label?.split('—')[0]?.trim() || `Day ${suggestion.day}`} →
            </button>
          ) : (
            <button className="btn btn-coral" onClick={() => navigate('/browse')}>Browse workouts</button>
          )}
        </div>
      )}

      {!programme && (
        <div className="card" style={{ textAlign: 'center' }}>
          <p className="muted">No programme selected yet.</p>
          <button className="btn" onClick={() => navigate('/onboarding')}>Choose a programme</button>
        </div>
      )}

      {/* Walk tracker */}
      <div style={styles.sectionHead}>
        <h2 style={styles.h2}>Walk habit</h2>
        <span style={{ ...styles.count, color: T.walk }}>{weekWalks.length} this week</span>
      </div>
      <div className="card" style={{ borderColor: '#d7edff' }}>
        <div style={styles.walkTop}>
          <div style={{ fontSize: 30 }}>🚶‍♀️</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>
              {todayWalks.length ? `${todayWalks.reduce((n, w) => n + (w.duration_mins || 0), 0)} min logged today` : 'No walk logged yet today'}
            </div>
            <div className="muted" style={{ fontSize: 12.5 }}>Quick tap to log — every walk counts.</div>
          </div>
        </div>
        <div style={styles.walkBtns}>
          {[15, 30, 45, 60].map((m) => (
            <button key={m} style={styles.walkBtn} disabled={walkSaving} onClick={() => logWalk(m)}>+{m}m</button>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <div style={styles.sectionHead}>
        <h2 style={styles.h2}>Quick add</h2>
      </div>
      <div style={styles.quickGrid}>
        <button style={styles.quick} onClick={() => navigate('/session/warmup_full')}>
          <span style={{ fontSize: 24 }}>🌅</span><span>Warm-up</span>
        </button>
        <button style={styles.quick} onClick={() => navigate('/browse')}>
          <span style={{ fontSize: 24 }}>🔥</span><span>Workouts</span>
        </button>
        <button style={styles.quick} onClick={() => navigate('/session/mob_full')}>
          <span style={{ fontSize: 24 }}>🧘‍♀️</span><span>Mobility</span>
        </button>
        <button style={styles.quick} onClick={() => navigate('/progress')}>
          <span style={{ fontSize: 24 }}>📸</span><span>Log stats</span>
        </button>
      </div>
    </div>
  );
}

const styles = {
  lowEnergy: { width: '100%', background: '#f3ecff', color: '#6a3fb0', border: '1px solid #e3d5ff', borderRadius: 14, padding: '11px 14px', fontSize: 13.5, fontWeight: 700, marginBottom: 14 },
  suggestCard: { background: 'linear-gradient(135deg,#fff,#fff6f8)', borderColor: '#ffd7e0', marginTop: 6 },
  suggestTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  suggestType: { fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: T.pink },
  weekPill: { fontSize: 11, fontWeight: 700, background: 'var(--off)', padding: '4px 9px', borderRadius: 999, color: 'var(--muted)' },
  suggestMsg: { fontSize: 16, lineHeight: 1.45, margin: '0 0 14px' },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '24px 0 10px' },
  h2: { fontSize: 24 },
  count: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 },
  walkTop: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 },
  walkBtns: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 },
  walkBtn: { background: T.walk, color: '#fff', fontWeight: 700, padding: '11px 0', borderRadius: 12, fontSize: 14 },
  quickGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  quick: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: '16px 0', fontSize: 13, fontWeight: 600, boxShadow: 'var(--shadow-sm)' },
};
