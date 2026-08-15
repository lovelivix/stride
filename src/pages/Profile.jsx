import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { PROGRAMMES } from '../data/programmes.js';
import { T } from '../lib/theme.js';

const HOME_KIT = ['bodyweight', '4kg', '8kg', '12kg', 'bands'];
const GYM_KIT = ['dumbbells', 'barbells', 'cables', 'machines', 'smith'];

export default function Profile() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  if (!profile) return <div className="page"><div className="spinner" /></div>;

  const patch = async (fields) => {
    setSaving(true);
    await supabase.from('profiles').update(fields).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  };

  const toggleKit = (which, value) => {
    const key = which === 'home' ? 'equipment_home' : 'equipment_gym';
    const arr = profile[key] || [];
    const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
    patch({ [key]: next });
  };

  const programme = PROGRAMMES[profile.programme_id];
  const week = profile.current_week || 1;

  return (
    <div className="page">
      <div className="eyebrow">Settings</div>
      <h1 className="h-title">{profile.name}</h1>
      {savedFlash && <div style={styles.flash}>Saved ✓</div>}

      {/* Programme + week */}
      <div className="card" style={{ marginTop: 14 }}>
        <div style={styles.rowTitle}>Programme</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24 }}>{programme?.name || '—'}</div>
        <div className="muted" style={{ fontSize: 13, marginTop: 2 }}>{programme?.description}</div>
        <div style={styles.weekRow}>
          <span style={styles.weekLabel}>Current week: <strong>{week}</strong> / {programme?.weeks || 4}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" disabled={saving || week <= 1} onClick={() => patch({ current_week: week - 1 })}>−</button>
            <button className="btn btn-sm" disabled={saving || week >= (programme?.weeks || 4)} onClick={() => patch({ current_week: week + 1 })}>Advance week</button>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => navigate('/onboarding')}>Change programme</button>
      </div>

      {/* Default location */}
      <div className="card" style={{ marginTop: 12 }}>
        <div style={styles.rowTitle}>Default location</div>
        <div style={styles.segment}>
          {['home', 'gym'].map((loc) => (
            <button key={loc} onClick={() => patch({ location_default: loc })} style={{ ...styles.segBtn, ...(profile.location_default === loc ? styles.segOn : {}) }}>
              {loc === 'home' ? '🏠 Home' : '🏋️ Gym'}
            </button>
          ))}
        </div>
      </div>

      {/* Home equipment */}
      <div className="card" style={{ marginTop: 12 }}>
        <div style={styles.rowTitle}>Home equipment</div>
        <div style={styles.chips}>
          {HOME_KIT.map((k) => (
            <button key={k} className={`chip ${(profile.equipment_home || []).includes(k) ? 'active' : ''}`} onClick={() => toggleKit('home', k)}>{k}</button>
          ))}
        </div>
      </div>

      {/* Gym equipment */}
      <div className="card" style={{ marginTop: 12 }}>
        <div style={styles.rowTitle}>Gym equipment</div>
        <div style={styles.chips}>
          {GYM_KIT.map((k) => (
            <button key={k} className={`chip ${(profile.equipment_gym || []).includes(k) ? 'active' : ''}`} onClick={() => toggleKit('gym', k)}>{k}</button>
          ))}
        </div>
      </div>

      {/* GLP-1 */}
      <div className="card" style={{ marginTop: 12 }}>
        <button style={styles.glp1} onClick={() => patch({ is_glp1: !profile.is_glp1 })}>
          <span>
            <div style={styles.rowTitle}>GLP-1 mode</div>
            <div className="muted" style={{ fontSize: 12.5 }}>Caps RPE at 7, protein reminders, hides high-impact, more recovery.</div>
          </span>
          <span style={{ ...styles.switch, ...(profile.is_glp1 ? styles.switchOn : {}) }}>
            <span style={{ ...styles.knob, ...(profile.is_glp1 ? styles.knobOn : {}) }} />
          </span>
        </button>
      </div>

      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <div className="muted" style={{ fontSize: 12, marginBottom: 10 }}>{user.email}</div>
        <button className="btn btn-ghost" onClick={async () => { await signOut(); navigate('/'); }}>Sign out</button>
      </div>
    </div>
  );
}

const styles = {
  flash: { position: 'fixed', top: 14, left: '50%', transform: 'translateX(-50%)', background: T.lime, color: '#093', fontWeight: 700, fontSize: 13, padding: '8px 16px', borderRadius: 999, zIndex: 60 },
  rowTitle: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--muted)', marginBottom: 8 },
  weekRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, gap: 10 },
  weekLabel: { fontSize: 13.5 },
  segment: { display: 'flex', gap: 6, background: 'var(--off)', borderRadius: 12, padding: 4 },
  segBtn: { flex: 1, padding: '10px 0', borderRadius: 9, fontWeight: 700, fontSize: 14, color: 'var(--muted)' },
  segOn: { background: '#fff', color: 'var(--text)', boxShadow: 'var(--shadow-sm)' },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  glp1: { display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', gap: 12, textAlign: 'left' },
  switch: { width: 46, height: 28, borderRadius: 999, background: 'var(--border)', padding: 3, flexShrink: 0, transition: 'background .18s' },
  switchOn: { background: T.pink },
  knob: { display: 'block', width: 22, height: 22, borderRadius: 999, background: '#fff', transition: 'transform .18s' },
  knobOn: { transform: 'translateX(18px)' },
};
