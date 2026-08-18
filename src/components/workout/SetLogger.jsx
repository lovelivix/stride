import { useEffect, useMemo, useRef, useState } from 'react';
import Timer from './Timer.jsx';
import { goBeep, unlockAudio } from '../../lib/beep.js';
import { T } from '../../lib/theme.js';

/**
 * Logs all sets for ONE exercise. Fully CONTROLLED — the parent owns the
 * `sets` array (so it survives navigating away and back).
 */
export default function SetLogger({
  exercise,
  lastSets = [],
  suggestion = {},
  isPR,
  sets = [],
  onSetsChange,
  onSwap,
  onSkip,
  onDone,
  onBack,
  canGoBack,
}) {
  const type = exercise.tracking_type;
  const isHold = type === 'hold';
  const isCardio = type === 'cardio';
  const isBodyweight = type === 'bodyweight_reps';

  const targetReps = exercise.reps_max || exercise.reps_min;
  const targetHold = exercise.hold_secs || 30;
  const completedCount = sets.filter((s) => s.completed).length;
  const allDone = sets.length > 0 && completedCount === sets.length;

  const setsRef = useRef(sets);
  setsRef.current = sets;
  const setAt = (i, patch) => onSetsChange(setsRef.current.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  // ── Live hold timer (planks etc.) ──────────────────────────────────
  const [timing, setTiming] = useState(null); // index of the set being timed
  const elapsedRef = useRef(0);
  const beepedRef = useRef(false);
  useEffect(() => {
    if (timing == null) return undefined;
    const t = setInterval(() => {
      elapsedRef.current += 1;
      const secs = elapsedRef.current;
      if (!beepedRef.current && secs >= targetHold) {
        beepedRef.current = true;
        goBeep(); // you hit the target hold
      }
      setAt(timing, { hold: String(secs) });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timing]);

  const startHold = (i) => {
    unlockAudio();
    elapsedRef.current = 0;
    beepedRef.current = false;
    setAt(i, { hold: '0' });
    setTiming(i);
  };
  const stopHold = () => setTiming(null);

  const completeSet = (i) => {
    if (timing === i) stopHold();
    const s = setsRef.current[i];
    const weight = isBodyweight || isHold || isCardio ? null : s.weight === '' ? null : parseFloat(s.weight);
    const reps = isHold || isCardio ? null : s.reps === '' ? null : parseInt(s.reps, 10);
    const hold = isHold ? (s.hold === '' ? null : parseInt(s.hold, 10)) : null;
    const pr = !isCardio && isPR ? isPR(exercise.base_id, weight, reps) : false;
    setAt(i, { completed: true, is_pr: pr });
  };

  const repeatLast = (i) => {
    const prevCompleted = [...sets.slice(0, i)].reverse().find((s) => s.completed);
    const src = prevCompleted || (lastSets[i] ? { weight: lastSets[i].weight_kg, reps: lastSets[i].reps, hold: lastSets[i].hold_secs } : null);
    if (!src) return;
    setAt(i, {
      weight: src.weight != null ? String(src.weight) : '',
      reps: src.reps != null ? String(src.reps) : '',
      hold: src.hold != null ? String(src.hold) : '',
    });
  };

  const lastLine = useMemo(() => {
    if (!lastSets.length) return null;
    const s = lastSets[0];
    if (s.hold_secs != null) return `Last time: ${s.hold_secs}s hold`;
    if (s.weight_kg != null) return `Last time: ${s.weight_kg}kg × ${s.reps ?? '–'}`;
    if (s.reps != null) return `Last time: ${s.reps} reps`;
    return null;
  }, [lastSets]);

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={styles.head}>
        <div>
          <div style={styles.name}>
            {exercise.name}
            {exercise.is_calf_focus && <span style={styles.calfTag}>calf</span>}
            {exercise.superset && <span style={styles.ssTag}>{exercise.superset}</span>}
          </div>
          <div style={styles.sub}>
            {exercise.sets} sets
            {exercise.per_side ? ' · per side' : ''}
            {targetReps ? ` · ${exercise.reps_min}${exercise.reps_max && exercise.reps_max !== exercise.reps_min ? '–' + exercise.reps_max : ''} reps` : ''}
            {isHold ? ` · ${exercise.hold_secs}${exercise.hold_max ? '–' + exercise.hold_max : ''}s hold` : ''}
          </div>
        </div>
        <div style={styles.count}>{completedCount}/{sets.length}</div>
      </div>

      {exercise.cue && <div style={styles.cue}>💡 {exercise.cue}</div>}
      {exercise.note && <div style={styles.note}>{exercise.note}</div>}
      {lastLine && <div style={styles.last}>{lastLine}</div>}
      {suggestion?.note && (
        <div style={{ ...styles.suggest, ...(suggestion.readyToProgress ? styles.suggestGo : {}) }}>{suggestion.note}</div>
      )}

      {isCardio ? (
        <div style={{ padding: '10px 0' }}>
          <Timer seconds={(exercise.duration_mins || 15) * 60} label={`${exercise.duration_mins || 15} min block`} />
          {!allDone && (
            <button className="btn" style={{ marginTop: 14 }} onClick={() => completeSet(0)}>
              ✓ Mark complete
            </button>
          )}
        </div>
      ) : isHold ? (
        // ── Hold sets: a proper count-up timer per set ──────────────
        <div style={styles.setList}>
          {sets.map((s, i) => {
            const isTiming = timing === i;
            const secs = isTiming ? elapsedRef.current : s.hold || 0;
            return (
              <div key={i} style={{ ...styles.holdRow, ...(s.completed ? styles.setRowDone : {}), ...(isTiming ? styles.holdRowActive : {}) }}>
                <div style={styles.setNo}>{i + 1}</div>
                <div style={styles.holdClock}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, color: isTiming ? T.pink : 'var(--text)' }}>
                    {String(s.hold || 0)}s
                  </span>
                  <span style={styles.holdTarget}>target {targetHold}s</span>
                </div>
                {!s.completed && (
                  <button
                    style={{ ...styles.holdBtn, ...(isTiming ? styles.holdBtnStop : {}) }}
                    onClick={() => (isTiming ? stopHold() : startHold(i))}
                  >
                    {isTiming ? '⏸' : '▶'}
                  </button>
                )}
                <button
                  style={{ ...styles.check, ...(s.completed ? styles.checkDone : {}) }}
                  onClick={() => (s.completed ? setAt(i, { completed: false, is_pr: false }) : completeSet(i))}
                >
                  {s.completed ? '✓' : '✓'}
                </button>
              </div>
            );
          })}
          <div style={styles.holdHint}>Tap ▶ to start the timer — it beeps when you reach the target. Tap ✓ to log the hold.</div>
        </div>
      ) : (
        <div style={styles.setList}>
          {sets.map((s, i) => (
            <div key={i} style={{ ...styles.setRow, ...(s.completed ? styles.setRowDone : {}) }}>
              <div style={styles.setNo}>{i + 1}</div>

              {!isBodyweight && (
                <label style={styles.field}>
                  <span style={styles.fieldLbl}>kg</span>
                  <input className="input" style={styles.numInput} type="number" inputMode="decimal" value={s.weight}
                    onChange={(e) => setAt(i, { weight: e.target.value })} />
                </label>
              )}

              <label style={styles.field}>
                <span style={styles.fieldLbl}>reps</span>
                <input className="input" style={styles.numInput} type="number" inputMode="numeric" value={s.reps}
                  onChange={(e) => setAt(i, { reps: e.target.value })} />
              </label>

              <button title="Repeat last set" style={styles.miniBtn} onClick={() => repeatLast(i)}>🔁</button>

              <button
                style={{ ...styles.check, ...(s.completed ? styles.checkDone : {}) }}
                onClick={() => (s.completed ? setAt(i, { completed: false, is_pr: false }) : completeSet(i))}
              >
                {s.completed ? (s.is_pr ? '🏆' : '✓') : '✓'}
              </button>
            </div>
          ))}
          <button style={styles.addSet} onClick={() => onSetsChange([...sets, { weight: sets[sets.length - 1]?.weight || '', reps: sets[sets.length - 1]?.reps || (targetReps ? String(targetReps) : ''), hold: '', completed: false, is_pr: false }])}>
            + Add a set
          </button>
        </div>
      )}

      <div style={styles.actions}>
        {canGoBack && <button className="btn btn-ghost btn-sm" onClick={onBack}>◀ Back</button>}
        <button className="btn btn-ghost btn-sm" onClick={onSwap}>🔄 Swap</button>
        <button className="btn btn-ghost btn-sm" onClick={onSkip}>⏭ Skip</button>
        <button className="btn btn-sm" style={{ flex: 1, opacity: allDone ? 1 : 0.55 }} onClick={onDone}>
          {allDone ? 'Next →' : 'Next anyway →'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  head: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  name: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  calfTag: { fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, background: T.lime, color: '#093', padding: '2px 7px', borderRadius: 999, letterSpacing: 0.5 },
  ssTag: { fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, background: '#efe6ff', color: '#6a3fb0', padding: '2px 7px', borderRadius: 999, letterSpacing: 0.5 },
  sub: { fontSize: 12.5, color: 'var(--muted)', marginTop: 4, fontWeight: 600 },
  count: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: 'var(--pink)' },
  cue: { fontSize: 13, color: 'var(--text)', background: 'var(--off)', borderRadius: 10, padding: '9px 11px', marginTop: 10, lineHeight: 1.4 },
  note: { fontSize: 12.5, color: 'var(--coral)', marginTop: 8, fontWeight: 600, lineHeight: 1.4 },
  last: { fontSize: 12, color: 'var(--muted)', marginTop: 8 },
  suggest: { fontSize: 12.5, color: 'var(--muted)', marginTop: 6, fontWeight: 600 },
  suggestGo: { color: '#0a8f3c' },
  setList: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 },
  setRow: { display: 'flex', alignItems: 'flex-end', gap: 8, padding: 8, borderRadius: 12, background: 'var(--off)' },
  setRowDone: { background: '#eafaef' },
  holdRow: { display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, background: 'var(--off)' },
  holdRowActive: { background: '#fff2f5', outline: `1.5px solid ${T.pink}` },
  holdClock: { flex: 1, display: 'flex', flexDirection: 'column', lineHeight: 1 },
  holdTarget: { fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginTop: 2 },
  holdBtn: { width: 46, height: 40, borderRadius: 12, background: T.pink, color: '#fff', fontSize: 16, flexShrink: 0 },
  holdBtnStop: { background: 'var(--amber)' },
  holdHint: { fontSize: 11, color: 'var(--muted)', marginTop: 2, lineHeight: 1.4 },
  setNo: { width: 22, height: 22, borderRadius: 999, background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginBottom: 8, flexShrink: 0 },
  field: { display: 'flex', flexDirection: 'column', gap: 3, flex: 1 },
  fieldLbl: { fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 2 },
  numInput: { padding: '9px 10px', textAlign: 'center' },
  miniBtn: { fontSize: 16, padding: '9px 8px', borderRadius: 10, background: 'var(--white)', border: '1px solid var(--border)', marginBottom: 1 },
  check: { width: 42, height: 40, borderRadius: 12, background: 'var(--white)', border: '1.5px solid var(--border)', fontSize: 18, color: 'var(--muted)', marginBottom: 1, flexShrink: 0 },
  checkDone: { background: T.lime, borderColor: T.lime, color: '#093' },
  addSet: { fontSize: 13, fontWeight: 700, color: 'var(--muted)', padding: '8px 0', borderRadius: 10, border: '1.5px dashed var(--border)', background: 'transparent', marginTop: 2 },
  actions: { display: 'flex', gap: 8, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' },
};
