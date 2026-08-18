import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { PROGRAMMES } from '../data/programmes.js';
import { T } from '../lib/theme.js';

// Calendar marker types — colour is reinforced by an icon + legend label,
// so identity never rests on colour alone.
const MARKERS = {
  workout: { color: T.pink, icon: '💪', label: 'Workout' },
  pb: { color: '#E0912B', icon: '🏆', label: 'PB' },
  walk: { color: T.walk, icon: '🚶', label: 'Walk' },
  stat: { color: '#8B6FE8', icon: '📸', label: 'Measurement / photo' },
};

const dayKey = (d) => format(new Date(d), 'yyyy-MM-dd');

export default function Activity() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursor, setCursor] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ sessions: [], walks: [], stats: [], pbDates: [] });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: sessions }, { data: walks }, { data: stats }, { data: prs }] = await Promise.all([
        supabase.from('sessions').select('*').eq('user_id', user.id).order('completed_at', { ascending: true }),
        supabase.from('walk_logs').select('logged_at, duration_mins').eq('user_id', user.id),
        supabase.from('body_stats').select('logged_at, weight_kg').eq('user_id', user.id).order('logged_at', { ascending: true }),
        supabase.from('session_sets').select('logged_at').eq('user_id', user.id).eq('is_pr', true),
      ]);
      setData({ sessions: sessions || [], walks: walks || [], stats: stats || [], pbDates: (prs || []).map((p) => p.logged_at) });
      setLoading(false);
    })();
  }, [user]);

  // Map every date → which marker types happened that day.
  const dayMap = useMemo(() => {
    const m = {};
    const add = (dateStr, type) => {
      const k = dayKey(dateStr);
      if (!m[k]) m[k] = {};
      m[k][type] = true;
    };
    data.sessions.forEach((s) => add(s.completed_at, 'workout'));
    data.walks.forEach((w) => add(w.logged_at, 'walk'));
    data.stats.forEach((s) => add(s.logged_at, 'stat'));
    data.pbDates.forEach((d) => add(d, 'pb'));
    return m;
  }, [data]);

  // Calendar grid (weeks start Monday).
  const gridDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [cursor]);

  // This-month summary tiles.
  const monthStats = useMemo(() => {
    const inMonth = (d) => isSameMonth(new Date(d), cursor);
    const workouts = data.sessions.filter((s) => inMonth(s.completed_at));
    const walks = data.walks.filter((w) => inMonth(w.logged_at));
    const pbs = data.pbDates.filter((d) => inMonth(d));
    const volume = workouts.reduce((n, s) => n + (s.total_volume_kg || 0), 0);
    return { workouts: workouts.length, walks: walks.length, pbs: pbs.length, volume: Math.round(volume) };
  }, [data, cursor]);

  // Weekly training volume — last 8 weeks (single series → no legend needed).
  const weeklyVolume = useMemo(() => {
    const byWeek = {};
    data.sessions.forEach((s) => {
      if (!s.total_volume_kg) return;
      const wk = format(startOfWeek(new Date(s.completed_at), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      byWeek[wk] = (byWeek[wk] || 0) + s.total_volume_kg;
    });
    return Object.entries(byWeek)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .slice(-8)
      .map(([wk, vol]) => ({ week: format(new Date(wk), 'd MMM'), volume: Math.round(vol) }));
  }, [data]);

  // Body-weight trend.
  const weightTrend = useMemo(
    () => data.stats.filter((s) => s.weight_kg != null).map((s) => ({ date: format(new Date(s.logged_at), 'd MMM'), weight: Number(s.weight_kg) })),
    [data]
  );

  const recentSessions = useMemo(() => [...data.sessions].reverse().slice(0, 6), [data]);

  const sessionLabel = (s) => {
    const prog = PROGRAMMES[s.programme_id];
    const dk = s.workout_id?.split('_').pop();
    return prog?.days?.[dk]?.label || s.workout_id;
  };

  if (loading) return <div className="page"><div className="spinner" /></div>;

  const selectedMarks = selected ? dayMap[dayKey(selected)] : null;

  return (
    <div className="page">
      <div className="eyebrow">Your month</div>
      <h1 className="h-title">Activity</h1>

      {/* Month stat tiles */}
      <div style={styles.tiles}>
        <Tile value={monthStats.workouts} label="Workouts" color={T.pink} />
        <Tile value={monthStats.walks} label="Walks" color={T.walk} />
        <Tile value={monthStats.pbs} label="PBs" color={MARKERS.pb.color} />
        <Tile value={monthStats.volume.toLocaleString()} label="kg lifted" color="#8B6FE8" />
      </div>

      {/* Calendar */}
      <div className="card" style={{ marginTop: 16 }}>
        <div style={styles.calHead}>
          <button style={styles.calNav} onClick={() => { setCursor(subMonths(cursor, 1)); setSelected(null); }}>‹</button>
          <div style={styles.calMonth}>{format(cursor, 'MMMM yyyy')}</div>
          <button style={styles.calNav} onClick={() => { setCursor(addMonths(cursor, 1)); setSelected(null); }}>›</button>
        </div>
        <div style={styles.weekRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} style={styles.weekDay}>{d}</div>
          ))}
        </div>
        <div style={styles.grid}>
          {gridDays.map((day) => {
            const k = dayKey(day);
            const marks = dayMap[k];
            const dim = !isSameMonth(day, cursor);
            const today = isToday(day);
            const isSel = selected && isSameDay(day, selected);
            return (
              <button
                key={k}
                onClick={() => setSelected(marks ? day : null)}
                style={{ ...styles.cell, ...(dim ? styles.cellDim : {}), ...(today ? styles.cellToday : {}), ...(isSel ? styles.cellSel : {}) }}
              >
                <span style={styles.cellNum}>{format(day, 'd')}</span>
                {marks && (
                  <span style={styles.dots}>
                    {Object.keys(MARKERS).filter((t) => marks[t]).map((t) => (
                      <span key={t} style={{ ...styles.dot, background: MARKERS[t].color }} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected day detail */}
        {selectedMarks && (
          <div style={styles.selDetail}>
            <strong>{format(selected, 'EEEE d MMM')}:</strong>{' '}
            {Object.keys(MARKERS).filter((t) => selectedMarks[t]).map((t) => `${MARKERS[t].icon} ${MARKERS[t].label}`).join('  ·  ')}
          </div>
        )}

        {/* Legend */}
        <div style={styles.legend}>
          {Object.entries(MARKERS).map(([t, m]) => (
            <span key={t} style={styles.legendItem}>
              <span style={{ ...styles.dot, background: m.color }} /> {m.icon} {m.label}
            </span>
          ))}
        </div>
      </div>

      {/* Weekly volume */}
      {weeklyVolume.length >= 2 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={styles.chartTitle}>Weekly training volume</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Total weight lifted per week (kg)</div>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={weeklyVolume} margin={{ top: 6, right: 6, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: T.muted }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: T.muted }} tickLine={false} axisLine={false} width={44} />
              <Tooltip cursor={{ fill: 'rgba(255,92,122,0.06)' }} contentStyle={{ borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 13 }} formatter={(v) => [`${v.toLocaleString()} kg`, 'Volume']} />
              <Bar dataKey="volume" fill={T.pink} radius={[4, 4, 0, 0]} maxBarSize={34}>
                {weeklyVolume.map((_, i) => (
                  <Cell key={i} fill={i === weeklyVolume.length - 1 ? T.pink : T.pinkL} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weight trend */}
      {weightTrend.length >= 2 && (
        <div className="card" style={{ marginTop: 16 }}>
          <div style={styles.chartTitle}>Body weight</div>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>Logged over time (kg)</div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={weightTrend} margin={{ top: 6, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: T.muted }} tickLine={false} axisLine={false} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fontSize: 11, fill: T.muted }} tickLine={false} axisLine={false} width={44} />
              <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 13 }} formatter={(v) => [`${v} kg`, 'Weight']} />
              <Line type="monotone" dataKey="weight" stroke={T.walk} strokeWidth={2.5} dot={{ r: 3, fill: T.walk }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/progress?log=1')}>
        📸 Log weight, measurements or a photo
      </button>

      {/* Recent sessions */}
      {recentSessions.length > 0 && (
        <>
          <div style={styles.sectionHead}>
            <h2 style={{ fontSize: 22 }}>Recent</h2>
            <button style={styles.link} onClick={() => navigate('/history')}>See all →</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentSessions.map((s) => (
              <div key={s.id} className="card" style={styles.recentRow}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, lineHeight: 1 }}>{sessionLabel(s)}</div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{format(new Date(s.completed_at), 'EEE d MMM')}</div>
                </div>
                {s.total_volume_kg ? <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18 }}>{Math.round(s.total_volume_kg)}kg</div> : null}
              </div>
            ))}
          </div>
        </>
      )}

      {data.sessions.length === 0 && data.walks.length === 0 && (
        <div className="card" style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontSize: 30 }}>📅</div>
          <p className="muted" style={{ marginTop: 6 }}>Your workouts, walks and PBs will fill in this calendar as you go.</p>
        </div>
      )}
    </div>
  );
}

function Tile({ value, label, color }) {
  return (
    <div className="card" style={{ padding: 12, textAlign: 'center' }}>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, lineHeight: 1, color }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
    </div>
  );
}

const styles = {
  tiles: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 14 },
  calHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  calNav: { width: 36, height: 36, borderRadius: 999, background: 'var(--off)', fontSize: 20, color: 'var(--text)' },
  calMonth: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22 },
  weekRow: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 },
  weekDay: { textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 },
  cell: { aspectRatio: '1', borderRadius: 10, background: 'var(--off)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, padding: 0, position: 'relative' },
  cellDim: { opacity: 0.35 },
  cellToday: { outline: `2px solid ${T.pink}`, outlineOffset: -2 },
  cellSel: { background: '#fff2f5' },
  cellNum: { fontSize: 13, fontWeight: 600, color: 'var(--text)' },
  dots: { display: 'flex', gap: 2, position: 'absolute', bottom: 5 },
  dot: { width: 6, height: 6, borderRadius: 999, display: 'inline-block' },
  selDetail: { marginTop: 12, fontSize: 13, background: 'var(--off)', borderRadius: 10, padding: '10px 12px', lineHeight: 1.5 },
  legend: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' },
  legendItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 },
  chartTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, lineHeight: 1 },
  sectionHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '24px 0 10px' },
  link: { fontSize: 13, fontWeight: 700, color: 'var(--pink)' },
  recentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
};
