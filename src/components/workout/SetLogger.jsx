import { useMemo, useState } from 'react';
import Timer from './Timer.jsx';
import { T } from '../../lib/theme.js';

/**
 * Logs all sets for ONE exercise.
 * Props:
 *  - exercise: resolved workout item
 *  - lastSets: array of the user's sets for this base exercise last time
 *  - suggestion: { weight, note, readyToProgress } | { secs, note }
 *  - isPR: (baseId, weight, reps) => boolean   (also records running best)
 *  - onLogSet: (set) => void
 *  - onSwap / onSkip / onDone: () => void
 *  - rpeCap: number | null  (GLP-1 guidance, visual only)
 */
export default function SetLogger({ exercise, lastSets = [], suggestion = {}, isPR, onLogSet, onSwap, onSkip, onDone }) {
  const type = exercise.tracking_type;
  const isHold = type === 'hold';
  const isCardio = type === 'cardio';
  const isBodyweight = type === 'bodyweight_reps';

  const targetReps = exercise.reps_max || exercise.reps_min;
  const suggestedWeight = suggestion?.weight ?? null;

  const makeInitial = () =>
    Array.from({ length: exercise.sets || 1 }).map((_, i) => ({
      weight: suggestedWeight != null ? String(suggestedWeight) : lastSets[i]?.weight_kg != null ? String(lastSets[i].weight_kg) : '',
      reps: targetReps ? String(targetReps) : '',
      hold: exercise.hold_secs ? String(exercise.hold_secs) : '',
      completed: false,
      is_pr: false,
    }));

  const [sets, setSets] = useState(makeInitial);

  const completedCount = sets.filter((s) => s.completed).length;
  const allDone = completedCount === sets.length;

  const update = (i, patch) => setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));

  const completeSet = (i) => {
    const s = sets[i];
    const weight = isBodyweight || isHold || isCardio ? null : s.weight === '' ? null : parseFloat(s.weight);
    const reps = isHold || isCardio ? null : s.reps === '' ? null : parseInt(s.reps, 10);
    const hold = isHold ? (s.hold === '' ? null : parseInt(s.hold, 10)) : null;

    const pr = !isCardio && isPR ? isPR(exercise.base_id, weight, reps) : false;
    update(i, { completed: true, is_pr: pr });

    onLogSet &&
      onLogSet({
        base_id: exercise.base_id,
        exercise_id: exercise.variant_id,
        exercise_name: exercise.name,
        set_number: i + 1,
        weight_kg: weight,
        reps,
        hold_secs: hold,
        completed: true,
        is_pr: pr,
        block: exercise.block,
      });
  };

  const repeatLast = (i) => {
    // copy the most recent completed set, or last session's matching set
    const prevCompleted = [...sets.slice(0, i)].reverse().find((s) => s.completed);
    const src = prevCompleted || (lastSets[i] ? { weight: lastSets[i].weight_kg, reps: lastSets[i].reps, hold: lastSets[i].hold_secs } : null);
    if (!src) return;
    update(i, {
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
          </div>
          <div style={styles.sub}>
            {exercise.sets} sets
            {exercise.per_side ? ' · per side' : ''}
            {targetReps ? ` · ${exercise.reps_min}${exercise.reps_max && exercise.reps_max !== exercise.reps_min ? '–' + exercise.reps_max : ''} reps` : ''}
            {exercise.hold_secs ? ` · ${exercise.hold_secs}s hold` : ''}
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

      {/* Cardio: single timed block */}
      {isCardio ? (
        <div style={{ padding: '10px 0' }}>
          <Timer seconds={(exercise.duration_mins || 15) * 60} label={`${exercise.duration_mins || 15} min block`} />
          {!allDone && (
            <button className="btn" style={{ marginTop: 14 }} onClick={() => { completeSet(0); }}>
              ✓ Mark complete
            </button>
          )}
        </div>
      ) : (
        <div style={styles.setList}>
          {sets.map((s, i) => (
            <div key={i} style={{ ...styles.setRow, ...(s.completed ? styles.setRowDone : {}) }}>
              <div style={styles.setNo}>{i + 1}</div>

              {!isHold && !isBodyweight && (
                <label style={styles.field}>
                  <span style={styles.fieldLbl}>kg</span>
                  <input
                    className="input"
                    style={styles.numInput}
                    type="number"
                    inputMode="decimal"
                    value={s.weight}
                    disabled={s.completed}
                    onChange={(e) => update(i, { weight: e.target.value })}
                  />
                </label>
              )}

              {!isHold && (
                <label style={styles.field}>
                  <span style={styles.fieldLbl}>reps</span>
                  <input
                    className="input"
                    style={styles.numInput}
                    type="number"
                    inputMode="numeric"
                    value={s.reps}
                    disabled={s.completed}
                    onChange={(e) => update(i, { reps: e.target.value })}
                  />
                </label>
              )}

              {isHold && (
                <label style={styles.field}>
                  <span style={styles.fieldLbl}>secs</span>
                  <input
                    className="input"
                    style={styles.numInput}
                    type="number"
                    inputMode="numeric"
                    value={s.hold}
                    disabled={s.completed}
                    onChange={(e) => update(i, { hold: e.target.value })}
                  />
                </label>
              )}

              <button title="Repeat last set" style={styles.miniBtn} disabled={s.completed} onClick={() => repeatLast(i)}>
                🔁
              </button>

              <button
                style={{ ...styles.check, ...(s.completed ? styles.checkDone : {}) }}
                onClick={() => (s.completed ? update(i, { completed: false, is_pr: false }) : completeSet(i))}
              >
                {s.completed ? (s.is_pr ? '🏆' : '✓') : '✓'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.actions}>
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
  name: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 8 },
  calfTag: { fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, background: T.lime, color: '#093', padding: '2px 7px', borderRadius: 999, letterSpacing: 0.5 },
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
  setNo: { width: 22, height: 22, borderRadius: 999, background: 'var(--white)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, marginBottom: 8, flexShrink: 0 },
  field: { display: 'flex', flexDirection: 'column', gap: 3, flex: 1 },
  fieldLbl: { fontSize: 10, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5, paddingLeft: 2 },
  numInput: { padding: '9px 10px', textAlign: 'center' },
  miniBtn: { fontSize: 16, padding: '9px 8px', borderRadius: 10, background: 'var(--white)', border: '1px solid var(--border)', marginBottom: 1 },
  check: { width: 42, height: 40, borderRadius: 12, background: 'var(--white)', border: '1.5px solid var(--border)', fontSize: 18, color: 'var(--muted)', marginBottom: 1, flexShrink: 0 },
  checkDone: { background: T.lime, borderColor: T.lime, color: '#093' },
  actions: { display: 'flex', gap: 8, marginTop: 14, alignItems: 'center' },
};
