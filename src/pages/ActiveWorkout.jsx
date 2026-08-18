import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { PROGRAMMES, MOBILITY_SESSIONS } from '../data/programmes.js';
import { buildWorkout, applyLowEnergy } from '../lib/workout.js';
import { nextAlternative } from '../data/alternatives.js';
import { getSuggestedWeight, getSuggestedHold, isLocalPR } from '../lib/progressionEngine.js';
import SetLogger from '../components/workout/SetLogger.jsx';
import WorkoutSummary from '../components/workout/WorkoutSummary.jsx';
import IntervalPlayer from '../components/workout/IntervalPlayer.jsx';
import { warmupForDay } from '../data/intervalWorkouts.js';
import { T } from '../lib/theme.js';

export default function ActiveWorkout() {
  const { day } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const lowEnergy = params.get('low') === '1' && profile?.is_glp1;

  const programme = PROGRAMMES[profile?.programme_id];
  const [location, setLocation] = useState(profile?.location_default || 'home');

  const workout = useMemo(() => {
    if (!programme) return null;
    const w = buildWorkout(programme, day, location, profile);
    return w && lowEnergy ? applyLowEnergy(w) : w;
  }, [programme, day, location, profile, lowEnergy]);

  const [phase, setPhase] = useState('warmup'); // warmup | active | rpe | summary
  const [warmupPlaying, setWarmupPlaying] = useState(false);
  const [index, setIndex] = useState(0);
  const [overrides, setOverrides] = useState({}); // index -> resolved exercise (after swap)
  const [setsByIndex, setSetsByIndex] = useState({}); // index -> sets[] (persists across nav)
  const [finalSets, setFinalSets] = useState([]); // flattened completed sets, computed at finish
  const [rpe, setRpe] = useState(6);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSessionVolume, setLastSessionVolume] = useState(null);

  const startTime = useRef(Date.now());
  const bestMap = useRef({}); // base_id -> best set {weight_kg, reps}
  const priorSets = useRef({}); // base_id -> array of last session's sets
  const lastRPE = useRef(null);
  const [priorLoaded, setPriorLoaded] = useState(false);

  // Load history for suggestions + PR baseline
  useEffect(() => {
    if (!user || !workout) return;
    (async () => {
      const baseIds = [...new Set(workout.exercises.map((e) => e.base_id))];
      const workoutId = `${programme.id}_${day}`;

      const [{ data: sets }, { data: lastSame }, { data: lastAny }] = await Promise.all([
        supabase
          .from('session_sets')
          .select('exercise_id, weight_kg, reps, hold_secs, set_number, session_id, logged_at')
          .eq('user_id', user.id)
          .in('exercise_id', baseIds)
          .order('logged_at', { ascending: false })
          .limit(300),
        supabase
          .from('sessions')
          .select('total_volume_kg')
          .eq('user_id', user.id)
          .eq('workout_id', workoutId)
          .order('completed_at', { ascending: false })
          .limit(1),
        supabase
          .from('sessions')
          .select('rpe')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1),
      ]);

      const byBase = {};
      const best = {};
      (sets || []).forEach((row) => {
        const b = row.exercise_id;
        if (!byBase[b]) byBase[b] = [];
        byBase[b].push(row);
        const bw = row.weight_kg ?? 0;
        if (!best[b] || bw > (best[b].weight_kg ?? 0) || (bw === (best[b].weight_kg ?? 0) && (row.reps ?? 0) > (best[b].reps ?? 0))) {
          best[b] = row;
        }
      });
      // reduce each base to just its most-recent session's sets
      const lastByBase = {};
      Object.entries(byBase).forEach(([b, rows]) => {
        const latestSession = rows[0].session_id;
        lastByBase[b] = rows.filter((r) => r.session_id === latestSession).sort((a, c) => a.set_number - c.set_number);
      });

      priorSets.current = lastByBase;
      bestMap.current = best;
      lastRPE.current = lastAny?.[0]?.rpe ?? null;
      setLastSessionVolume(lastSame?.[0]?.total_volume_kg ?? null);
      setPriorLoaded(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, day, programme?.id]);

  if (!programme || !workout) {
    return (
      <div className="page-no-nav">
        <p className="muted">Workout not found.</p>
        <button className="btn" onClick={() => navigate('/today')}>Back to Today</button>
      </div>
    );
  }

  // ── Warm-up offer (shown before the main workout) ──────────────────
  const warmup = warmupForDay(workout.label);
  if (phase === 'warmup') {
    if (warmupPlaying) {
      return (
        <IntervalPlayer
          workout={warmup}
          onComplete={() => { setWarmupPlaying(false); setPhase('active'); window.scrollTo({ top: 0 }); }}
          onQuit={() => { setWarmupPlaying(false); setPhase('active'); window.scrollTo({ top: 0 }); }}
        />
      );
    }
    return (
      <div className="page-no-nav">
        <div style={styles.topBar}>
          <Link to="/today" style={styles.close}>✕</Link>
          <div style={{ textAlign: 'center' }}>
            <div style={styles.dayName}>{workout.label}</div>
            <div style={styles.progress}>Ready when you are</div>
          </div>
          <span style={{ width: 36 }} />
        </div>
        <div className="card" style={{ textAlign: 'center', marginTop: 12 }}>
          <div style={{ fontSize: 40 }}>{warmup.emoji}</div>
          <h1 style={{ fontSize: 32, marginTop: 6 }}>Warm up first?</h1>
          <p className="muted" style={{ fontSize: 14, lineHeight: 1.5, margin: '8px 0 4px' }}>
            {warmup.name} — about {warmup.duration} minutes of easy movement to get ready. Hands-free, with beeps.
          </p>
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setWarmupPlaying(true)}>
            ▶ Start warm-up
          </button>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => { setPhase('active'); window.scrollTo({ top: 0 }); }}>
            Skip to workout
          </button>
        </div>
      </div>
    );
  }

  const current = overrides[index] || workout.exercises[index];
  const total = workout.exercises.length;

  const suggestionFor = (ex) => {
    const prior = priorSets.current[ex.base_id] || [];
    if (ex.tracking_type === 'hold') {
      const lastHold = prior[0]?.hold_secs;
      return getSuggestedHold(lastHold, ex.hold_secs || 30);
    }
    if (ex.tracking_type === 'weight_reps') {
      return getSuggestedWeight(ex.base_id, [prior], lastRPE.current, { reps_min: ex.reps_min, reps_max: ex.reps_max });
    }
    return {};
  };

  // Live PR display only — mutates a separate map so the true baseline
  // (bestMap) stays clean for the authoritative recompute at finish.
  const displayBest = useRef({});
  const isPR = (baseId, weight, reps) => {
    const cur = displayBest.current[baseId] ?? bestMap.current[baseId];
    const pr = isLocalPR(cur, weight, reps);
    if (pr) displayBest.current[baseId] = { weight_kg: weight ?? 0, reps: reps ?? 0 };
    return pr;
  };

  // Initialise a not-yet-seen exercise's sets when we first land on it.
  useEffect(() => {
    if (!priorLoaded || !workout) return;
    if (setsByIndex[index]) return;
    const ex = overrides[index] || workout.exercises[index];
    if (!ex) return;
    const init = makeInitialSets(ex, suggestionFor(ex), priorSets.current[ex.base_id] || []);
    setSetsByIndex((prev) => (prev[index] ? prev : { ...prev, [index]: init }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, priorLoaded]);

  const onSetsChange = (next) => setSetsByIndex((prev) => ({ ...prev, [index]: next }));

  const handleSwap = () => {
    const nextEx = nextAlternative(current.base_id, current.id ? current.id : current.variant_id);
    setOverrides((prev) => ({
      ...prev,
      [index]: {
        ...current,
        variant_id: nextEx.id,
        id: nextEx.id,
        name: nextEx.name,
        tracking_type: current.tracking_type === 'cardio' || current.tracking_type === 'hold' ? current.tracking_type : nextEx.tracking_type,
        key: `${current.key}-swap-${nextEx.id}`,
      },
    }));
  };

  const advance = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPhase('rpe');
      window.scrollTo({ top: 0 });
    }
  };

  const back = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const jumpTo = (i) => {
    setIndex(i);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Flatten all completed sets across every exercise, recomputing PRs
  // authoritatively against the true baseline (so edits/back-nav are correct).
  const collectLoggedSets = () => {
    const baseline = {};
    Object.keys(bestMap.current).forEach((b) => {
      const r = bestMap.current[b];
      baseline[b] = r ? { weight_kg: r.weight_kg ?? 0, reps: r.reps ?? 0 } : null;
    });
    const logged = [];
    workout.exercises.forEach((exBase, i) => {
      const ex = overrides[i] || exBase;
      const arr = setsByIndex[i] || [];
      arr.forEach((s, si) => {
        if (!s.completed) return;
        const isBW = ex.tracking_type === 'bodyweight_reps';
        const isHold = ex.tracking_type === 'hold';
        const isCardio = ex.tracking_type === 'cardio';
        const weight = isBW || isHold || isCardio ? null : s.weight === '' || s.weight == null ? null : parseFloat(s.weight);
        const reps = isHold || isCardio ? null : s.reps === '' || s.reps == null ? null : parseInt(s.reps, 10);
        const hold = isHold ? (s.hold === '' || s.hold == null ? null : parseInt(s.hold, 10)) : null;
        let pr = false;
        if (!isCardio) {
          pr = isLocalPR(baseline[ex.base_id], weight, reps);
          if (pr) baseline[ex.base_id] = { weight_kg: weight ?? 0, reps: reps ?? 0 };
        }
        logged.push({
          base_id: ex.base_id,
          variant_id: ex.variant_id || ex.id || ex.base_id,
          exercise_name: ex.name,
          set_number: si + 1,
          weight_kg: weight,
          reps,
          hold_secs: hold,
          completed: true,
          is_pr: pr,
          block: ex.block,
        });
      });
    });
    return logged;
  };

  const finish = async () => {
    setSaving(true);
    const logged = collectLoggedSets();
    setFinalSets(logged);
    const volume = logged.reduce((n, s) => n + (s.weight_kg && s.reps ? s.weight_kg * s.reps : 0), 0);
    const durationMins = Math.max(1, Math.round((Date.now() - startTime.current) / 60000));
    const workoutId = `${programme.id}_${day}`;

    const { data: session, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        workout_id: workoutId,
        programme_id: programme.id,
        duration_mins: durationMins,
        location,
        rpe,
        notes: notes || null,
        total_volume_kg: Math.round(volume * 100) / 100,
      })
      .select()
      .single();

    if (!error && session) {
      const rows = logged.map((s) => ({
        session_id: session.id,
        user_id: user.id,
        exercise_id: s.base_id, // stable base id → coherent history/PRs
        exercise_name: s.exercise_name,
        set_number: s.set_number,
        weight_kg: s.weight_kg,
        reps: s.reps,
        hold_secs: s.hold_secs,
        completed: s.completed,
        is_pr: s.is_pr,
        alternative_used: s.variant_id !== s.base_id ? s.variant_id : null,
      }));
      if (rows.length) await supabase.from('session_sets').insert(rows);
    }
    setSaving(false);
    setPhase('summary');
    window.scrollTo({ top: 0 });
  };

  // ── RENDER ──────────────────────────────────────────────────────────
  if (phase === 'summary') {
    const mob = MOBILITY_SESSIONS.find((m) => m.best_after?.includes(day)) || MOBILITY_SESSIONS[0];
    return (
      <div className="page-no-nav">
        <WorkoutSummary
          loggedSets={finalSets}
          plannedSets={workout.total_planned_sets}
          lastSessionVolume={lastSessionVolume}
          isCalfDay={workout.has_calf_finisher}
          isGlp1={profile?.is_glp1}
          onLogBodyWeight={() => navigate('/progress?log=1')}
          onAddNote={() => navigate('/progress?log=1')}
          onDone={() => navigate('/today')}
        />
        {workout.cardio_boost && (
          <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 26 }}>{profile?.is_glp1 ? '⚡' : '🔥'}</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>Optional 4-minute cardio boost?</div>
            <div className="muted" style={{ fontSize: 13, margin: '4px 0 12px' }}>
              A short finisher to spike the heart rate. Totally optional.
            </div>
            <button className="btn btn-ghost" onClick={() => navigate(`/session/${profile?.is_glp1 ? 'boost_low' : 'boost_hiit'}`)}>
              Add a boost →
            </button>
          </div>
        )}
        {workout.mobility_addon && (
          <div className="card" style={{ marginTop: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 26 }}>🧘‍♀️</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>Add {mob.name}?</div>
            <div className="muted" style={{ fontSize: 13, margin: '4px 0 12px' }}>{mob.duration} min · {mob.desc}</div>
            <button className="btn btn-ghost" onClick={() => navigate(`/session/${mob.id}`)}>Start mobility →</button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'rpe') {
    const cap = profile?.is_glp1 ? 7 : 10;
    return (
      <div className="page-no-nav">
        <div className="eyebrow">Almost done</div>
        <h1 style={{ fontSize: 38, marginBottom: 6 }}>How hard was that?</h1>
        <p className="muted">Rate your effort (RPE). Be honest — it drives your next suggestions.</p>

        <div style={{ textAlign: 'center', margin: '24px 0' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: rpe >= 9 ? T.coral : T.pink, lineHeight: 1 }}>{rpe}</div>
          <div className="muted" style={{ fontSize: 13 }}>{rpeLabel(rpe)}</div>
        </div>

        <input type="range" min="1" max="10" value={rpe} onChange={(e) => setRpe(parseInt(e.target.value, 10))} style={{ width: '100%', accentColor: T.pink }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
          <span>Easy</span><span>Max effort</span>
        </div>
        {profile?.is_glp1 && rpe > cap && (
          <div style={styles.glp1Warn}>On a GLP-1, RPE {cap} is a sensible ceiling. No need to redline — consistency wins.</div>
        )}

        <label style={{ ...styles.lbl, marginTop: 20 }}>Notes (optional)</label>
        <textarea className="input" rows="3" value={notes} placeholder="How did it feel? Anything to remember?" onChange={(e) => setNotes(e.target.value)} />

        <button className="btn" style={{ marginTop: 16 }} disabled={saving} onClick={finish}>
          {saving ? 'Saving…' : 'Finish & see summary'}
        </button>
        <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => setPhase('active')}>Back to workout</button>
      </div>
    );
  }

  // active
  return (
    <div className="page-no-nav" style={{ paddingBottom: 40 }}>
      <div style={styles.topBar}>
        <Link to="/today" style={styles.close}>✕</Link>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.dayName}>{workout.label}</div>
          <div style={styles.progress}>{index + 1} of {total}{workout.low_energy ? ' · low energy' : ''}</div>
        </div>
        <div style={styles.locToggle}>
          {['home', 'gym'].map((loc) => (
            <button key={loc} onClick={() => setLocation(loc)} style={{ ...styles.locBtn, ...(location === loc ? styles.locOn : {}) }}>
              {loc === 'home' ? '🏠' : '🏋️'}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.bar}>
        <div style={{ ...styles.barFill, width: `${((index) / total) * 100}%` }} />
      </div>

      {!priorLoaded || !setsByIndex[index] ? (
        <div className="spinner" />
      ) : (
        <SetLogger
          key={current.key}
          exercise={current}
          lastSets={priorSets.current[current.base_id] || []}
          suggestion={suggestionFor(current)}
          isPR={isPR}
          sets={setsByIndex[index]}
          onSetsChange={onSetsChange}
          onSwap={handleSwap}
          onSkip={advance}
          onDone={advance}
          onBack={back}
          canGoBack={index > 0}
        />
      )}

      <div style={styles.jump}>
        {workout.exercises.map((e, i) => {
          const arr = setsByIndex[i] || [];
          const done = arr.length > 0 && arr.every((s) => s.completed);
          const started = arr.some((s) => s.completed);
          return (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              aria-label={`Go to exercise ${i + 1}`}
              style={{
                ...styles.jumpDot,
                ...(i === index ? styles.jumpNow : done ? styles.jumpDone : started ? styles.jumpStarted : {}),
                ...(e.block === 'calf' ? { outline: `2px solid ${T.lime}`, outlineOffset: 1 } : {}),
              }}
            />
          );
        })}
      </div>
      <div style={styles.jumpHint}>Tap a dot to jump back and edit any exercise</div>
    </div>
  );
}

function makeInitialSets(ex, suggestion, lastSets) {
  const targetReps = ex.reps_max || ex.reps_min;
  const suggested = suggestion?.weight ?? null;
  const n = ex.sets || 1;
  return Array.from({ length: n }).map((_, i) => ({
    weight:
      suggested != null
        ? String(suggested)
        : lastSets[i]?.weight_kg != null
        ? String(lastSets[i].weight_kg)
        : '',
    reps: targetReps ? String(targetReps) : '',
    hold: ex.hold_secs ? String(ex.hold_secs) : '',
    completed: false,
    is_pr: false,
  }));
}

function rpeLabel(v) {
  if (v <= 3) return 'Very easy — barely worked';
  if (v <= 5) return 'Comfortable — plenty left';
  if (v <= 7) return 'Solid — a few reps in reserve';
  if (v <= 8) return 'Hard — pushing now';
  return 'Maximal — nothing left';
}

const styles = {
  topBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  close: { fontSize: 20, color: 'var(--muted)', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  dayName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, lineHeight: 1 },
  progress: { fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 },
  locToggle: { display: 'flex', gap: 3, background: 'var(--off)', borderRadius: 999, padding: 3 },
  locBtn: { width: 34, height: 30, borderRadius: 999, fontSize: 15 },
  locOn: { background: '#fff', boxShadow: 'var(--shadow-sm)' },
  bar: { height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', marginBottom: 18 },
  barFill: { height: '100%', background: T.pink, borderRadius: 999, transition: 'width .3s' },
  jump: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' },
  jumpDot: { width: 14, height: 14, borderRadius: 999, background: 'var(--border)', padding: 0 },
  jumpNow: { background: T.pink, transform: 'scale(1.25)' },
  jumpDone: { background: '#6fd08a' },
  jumpStarted: { background: T.amber },
  jumpHint: { fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 8 },
  lbl: { display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--muted)', marginBottom: 6 },
  glp1Warn: { background: '#f3ecff', color: '#6a3fb0', borderRadius: 12, padding: '10px 12px', fontSize: 13, marginTop: 14, lineHeight: 1.45 },
};
