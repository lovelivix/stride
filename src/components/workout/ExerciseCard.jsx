import { T } from '../../lib/theme.js';

/**
 * Compact, read-only exercise row for programme/day previews.
 * Props: item (programme exercise), index, showCalfTag
 */
export default function ExerciseCard({ item, index }) {
  const reps =
    item.hold_secs != null
      ? `${item.hold_secs}${item.hold_max ? '–' + item.hold_max : ''}s`
      : item.reps_min != null
      ? `${item.reps_min}${item.reps_max && item.reps_max !== item.reps_min ? '–' + item.reps_max : ''}`
      : item.duration_mins
      ? `${item.duration_mins} min`
      : '';

  return (
    <div style={styles.row}>
      <div style={styles.no}>{index}</div>
      <div style={{ flex: 1 }}>
        <div style={styles.name}>{item.name}</div>
        {item.note && <div style={styles.note}>{item.note}</div>}
      </div>
      <div style={styles.meta}>
        <span style={styles.sets}>{item.sets ? `${item.sets}×` : ''}{reps}</span>
        {item.per_side && <span style={styles.side}>/side</span>}
        {item.is_calf_focus && <span style={styles.calf}>calf</span>}
      </div>
    </div>
  );
}

const styles = {
  row: { display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px', borderBottom: '1px solid var(--border)' },
  no: { width: 24, height: 24, borderRadius: 999, background: 'var(--off)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--muted)', flexShrink: 0 },
  name: { fontSize: 15, fontWeight: 600 },
  note: { fontSize: 11.5, color: 'var(--coral)', marginTop: 2, lineHeight: 1.35 },
  meta: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 },
  sets: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: 'var(--text)', letterSpacing: 0.4 },
  side: { fontSize: 10, color: 'var(--muted)', fontWeight: 600 },
  calf: { fontSize: 9, fontWeight: 700, background: T.lime, color: '#093', padding: '2px 6px', borderRadius: 999, letterSpacing: 0.5 },
};
