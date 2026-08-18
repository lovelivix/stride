import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { PROGRAMMES } from '../data/programmes.js';
import { T } from '../lib/theme.js';

const GOALS = [
  { id: 'build_muscle', label: 'Build muscle', emoji: '💪' },
  { id: 'lose_weight', label: 'Lose weight', emoji: '🔥' },
  { id: 'get_fitter', label: 'Get fitter', emoji: '🏃‍♀️' },
  { id: 'heart_health', label: 'Heart health', emoji: '❤️' },
];

const HOME_KIT = ['bodyweight', '4kg', '7.5kg', 'band', 'kettlebell'];
const GYM_KIT = ['dumbbells', 'barbells', 'cables', 'machines', 'smith'];

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [height, setHeight] = useState('');
  const [goals, setGoals] = useState([]);
  const [programmeId, setProgrammeId] = useState('');
  const [homeKit, setHomeKit] = useState(['bodyweight']);
  const [gymKit, setGymKit] = useState([]);
  const [isGlp1, setIsGlp1] = useState(false);

  const toggle = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const programmeList = Object.values(PROGRAMMES);

  const canNext = [name.trim().length > 0, goals.length > 0, !!programmeId, homeKit.length > 0][step];

  const finish = async () => {
    setSaving(true);
    setError(null);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: name.trim(),
      goal_types: goals,
      programme_id: programmeId,
      current_week: 1,
      location_default: 'home',
      equipment_home: homeKit,
      equipment_gym: gymKit,
      is_glp1: isGlp1,
      height_cm: height ? parseInt(height, 10) : null,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    await refreshProfile();
    navigate('/today');
  };

  return (
    <div className="page-no-nav">
      <div style={styles.progress}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ ...styles.dot, ...(i <= step ? styles.dotOn : {}) }} />
        ))}
      </div>

      {step === 0 && (
        <Section eyebrow="Welcome to STRIDE" title="Let’s set you up">
          <p style={styles.lead}>First, what should we call you?</p>
          <label style={styles.lbl}>Name</label>
          <input className="input" value={name} placeholder="e.g. Olivia" onChange={(e) => setName(e.target.value)} />
          <label style={{ ...styles.lbl, marginTop: 14 }}>Height (cm) — optional</label>
          <input className="input" type="number" inputMode="numeric" value={height} placeholder="e.g. 168" onChange={(e) => setHeight(e.target.value)} />
        </Section>
      )}

      {step === 1 && (
        <Section eyebrow="Step 2" title="What are your goals?">
          <p style={styles.lead}>Pick everything that applies. This shapes your suggestions.</p>
          <div style={styles.chips}>
            {GOALS.map((g) => (
              <button key={g.id} className={`chip ${goals.includes(g.id) ? 'active' : ''}`} onClick={() => toggle(goals, setGoals, g.id)}>
                <span>{g.emoji}</span> {g.label}
              </button>
            ))}
          </div>
        </Section>
      )}

      {step === 2 && (
        <Section eyebrow="Step 3" title="Choose your programme">
          <p style={styles.lead}>Each is a 4-week block you can repeat and progress.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {programmeList.map((p) => (
              <button
                key={p.id}
                onClick={() => setProgrammeId(p.id)}
                className="card"
                style={{ ...styles.progCard, ...(programmeId === p.id ? styles.progCardOn : {}) }}
              >
                <div style={styles.progName}>{p.name}</div>
                <div style={styles.progDesc}>{p.description}</div>
                <div style={styles.progMeta}>{p.days_per_week.join('–')} days/week · {p.weeks} weeks</div>
              </button>
            ))}
          </div>
        </Section>
      )}

      {step === 3 && (
        <Section eyebrow="Last step" title="Your equipment">
          <p style={styles.lead}>What do you have at home?</p>
          <div style={styles.chips}>
            {HOME_KIT.map((k) => (
              <button key={k} className={`chip ${homeKit.includes(k) ? 'active' : ''}`} onClick={() => toggle(homeKit, setHomeKit, k)}>
                {k}
              </button>
            ))}
          </div>
          <p style={{ ...styles.lead, marginTop: 18 }}>Gym access? (optional)</p>
          <div style={styles.chips}>
            {GYM_KIT.map((k) => (
              <button key={k} className={`chip ${gymKit.includes(k) ? 'active' : ''}`} onClick={() => toggle(gymKit, setGymKit, k)}>
                {k}
              </button>
            ))}
          </div>
          <button style={styles.glp1} onClick={() => setIsGlp1((v) => !v)}>
            <span style={{ ...styles.switch, ...(isGlp1 ? styles.switchOn : {}) }}>
              <span style={{ ...styles.knob, ...(isGlp1 ? styles.knobOn : {}) }} />
            </span>
            <span>
              <div style={{ fontWeight: 700, fontSize: 14 }}>On a GLP-1 medication?</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Adapts intensity, adds protein reminders & recovery.</div>
            </span>
          </button>
        </Section>
      )}

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.nav}>
        {step > 0 && (
          <button className="btn btn-ghost" style={{ width: 'auto', flex: '0 0 auto', paddingInline: 22 }} onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {step < 3 ? (
          <button className="btn" disabled={!canNext} onClick={() => setStep(step + 1)}>Continue</button>
        ) : (
          <button className="btn" disabled={!canNext || saving} onClick={finish}>{saving ? 'Setting up…' : 'Start training'}</button>
        )}
      </div>
    </div>
  );
}

function Section({ eyebrow, title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="eyebrow">{eyebrow}</div>
      <h1 style={{ fontSize: 38, marginTop: 4, marginBottom: 8 }}>{title}</h1>
      {children}
    </div>
  );
}

const styles = {
  progress: { display: 'flex', gap: 6, marginBottom: 22 },
  dot: { flex: 1, height: 5, borderRadius: 999, background: 'var(--border)' },
  dotOn: { background: T.pink },
  lead: { color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.5, marginTop: 0, marginBottom: 14 },
  lbl: { display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--muted)', marginBottom: 6 },
  chips: { display: 'flex', flexWrap: 'wrap', gap: 9 },
  progCard: { textAlign: 'left', padding: 16, border: '1.5px solid var(--border)' },
  progCardOn: { borderColor: T.pink, boxShadow: '0 0 0 3px rgba(255,92,122,0.14)' },
  progName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, lineHeight: 1 },
  progDesc: { fontSize: 13, color: 'var(--muted)', marginTop: 6, lineHeight: 1.45 },
  progMeta: { fontSize: 11.5, color: T.pink, fontWeight: 700, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  glp1: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 22, textAlign: 'left', width: '100%' },
  switch: { width: 46, height: 28, borderRadius: 999, background: 'var(--border)', padding: 3, flexShrink: 0, transition: 'background 0.18s' },
  switchOn: { background: T.pink },
  knob: { display: 'block', width: 22, height: 22, borderRadius: 999, background: '#fff', transition: 'transform 0.18s' },
  knobOn: { transform: 'translateX(18px)' },
  error: { color: '#c0263a', fontSize: 13, background: '#fdecef', padding: '10px 12px', borderRadius: 10, marginBottom: 12 },
  nav: { display: 'flex', gap: 10, marginTop: 8 },
};
