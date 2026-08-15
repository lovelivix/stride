import { useMemo } from 'react';
import { T } from '../../lib/theme.js';
import { calculateVolume } from '../../lib/progressionEngine.js';

/**
 * Post-session summary. Shows after RPE is logged.
 * Props:
 *  - loggedSets: array of sets logged this session
 *  - plannedSets: number planned
 *  - lastSessionVolume: number | null
 *  - isCalfDay, isGlp1
 *  - onLogBodyWeight, onAddNote, onDone
 */
export default function WorkoutSummary({ loggedSets = [], plannedSets = 0, lastSessionVolume = null, isCalfDay, isGlp1, onLogBodyWeight, onAddNote, onDone }) {
  const volume = useMemo(() => calculateVolume(loggedSets), [loggedSets]);
  const prs = loggedSets.filter((s) => s.is_pr);
  const calfSets = loggedSets.filter((s) => s.block === 'calf');
  const volDelta = lastSessionVolume != null ? volume - lastSessionVolume : null;

  return (
    <div style={styles.wrap}>
      <div style={styles.hero}>
        <div style={styles.tick}>✓</div>
        <h2 style={styles.h}>Session complete</h2>
        <div style={styles.sub}>Nice work. Here's how it went.</div>
      </div>

      <div style={styles.grid}>
        <Stat label="Sets done" value={`${loggedSets.length}/${plannedSets}`} />
        <Stat label="Volume" value={`${Math.round(volume)}kg`} accent={T.pink} />
        {volDelta != null && (
          <Stat
            label="vs last time"
            value={`${volDelta >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(volDelta))}kg`}
            accent={volDelta >= 0 ? '#0a8f3c' : T.coral}
          />
        )}
        <Stat label="PRs" value={String(prs.length)} accent={T.amber} />
      </div>

      {prs.length > 0 && (
        <div className="card" style={{ padding: 14 }}>
          <div style={styles.blockTitle}>🏆 New personal bests</div>
          {prs.map((s, i) => (
            <div key={i} style={styles.prRow}>
              <span>{s.exercise_name}</span>
              <span style={styles.prVal}>
                {s.weight_kg != null ? `${s.weight_kg}kg × ${s.reps ?? '–'}` : s.hold_secs != null ? `${s.hold_secs}s` : `${s.reps ?? ''} reps`}
              </span>
            </div>
          ))}
        </div>
      )}

      {isCalfDay && calfSets.length > 0 && (
        <div className="card" style={{ padding: 14 }}>
          <div style={styles.blockTitle}>🦵 Calf finisher</div>
          <div style={styles.muted}>
            {calfSets.length} calf sets logged, {Math.round(calculateVolume(calfSets))}kg volume. Consistency here is what builds them.
          </div>
        </div>
      )}

      {isGlp1 && (
        <div style={styles.protein}>
          💪 Have a protein-rich meal or snack within the next 2 hours — your muscles will thank you.
        </div>
      )}

      <div style={styles.actions}>
        <button className="btn btn-ghost" onClick={onLogBodyWeight}>Log body weight today?</button>
        <button className="btn btn-ghost" onClick={onAddNote}>Add a note</button>
        <button className="btn" onClick={onDone}>Done</button>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div className="card" style={styles.stat}>
      <div style={{ ...styles.statVal, color: accent || 'var(--text)' }}>{value}</div>
      <div style={styles.statLbl}>{label}</div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', gap: 14 },
  hero: { textAlign: 'center', padding: '10px 0 4px' },
  tick: { width: 64, height: 64, borderRadius: 999, background: T.lime, color: '#093', fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  h: { fontSize: 34 },
  sub: { color: 'var(--muted)', marginTop: 4, fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  stat: { padding: 14, textAlign: 'center' },
  statVal: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, lineHeight: 1 },
  statLbl: { fontSize: 11, color: 'var(--muted)', fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.6 },
  blockTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 19, marginBottom: 8 },
  prRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, padding: '5px 0' },
  prVal: { fontWeight: 700, color: T.amber },
  muted: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.45 },
  protein: { background: '#fff4e8', border: '1px solid #ffe0c0', borderRadius: 14, padding: 14, fontSize: 13.5, lineHeight: 1.5, color: '#8a5a20' },
  actions: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 },
};
