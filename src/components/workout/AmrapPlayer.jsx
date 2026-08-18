import { useEffect, useRef, useState } from 'react';
import { moveLabel } from '../../data/amrapWorkouts.js';
import { countBeep, goBeep, doneBeep, unlockAudio, isMuted, toggleMuted } from '../../lib/beep.js';
import { T } from '../../lib/theme.js';

/**
 * AMRAP player: a countdown clock + a round counter you tap each time you
 * finish the move list. Beeps count down the final seconds.
 * Props: workout, onComplete(rounds, mins), onQuit()
 */
export default function AmrapPlayer({ workout, onComplete, onQuit }) {
  const [durationMin, setDurationMin] = useState(workout.default_duration || workout.durations[0]);
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState((workout.default_duration || workout.durations[0]) * 60);
  const [rounds, setRounds] = useState(0);
  const [muted, setMutedState] = useState(isMuted());

  const remRef = useRef(remaining);
  const roundsRef = useRef(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => {
      remRef.current -= 1;
      const r = remRef.current;
      if (r === 3 || r === 2 || r === 1) countBeep();
      if (r <= 0) {
        clearInterval(t);
        doneBeep();
        setRunning(false);
        setRemaining(0);
        onCompleteRef.current && onCompleteRef.current(roundsRef.current, durationMin);
        return;
      }
      setRemaining(r);
    }, 1000);
    return () => clearInterval(t);
  }, [running, durationMin]);

  const start = () => {
    unlockAudio();
    remRef.current = durationMin * 60;
    roundsRef.current = 0;
    setRemaining(durationMin * 60);
    setRounds(0);
    setStarted(true);
    setRunning(true);
  };

  const addRound = () => {
    roundsRef.current += 1;
    setRounds(roundsRef.current);
    goBeep();
  };
  const removeRound = () => {
    roundsRef.current = Math.max(0, roundsRef.current - 1);
    setRounds(roundsRef.current);
  };
  const onMute = () => setMutedState(toggleMuted());

  const mm = String(Math.floor(Math.max(0, remaining) / 60)).padStart(2, '0');
  const ss = String(Math.max(0, remaining) % 60).padStart(2, '0');
  const total = durationMin * 60;
  const pct = total ? Math.max(0, remaining) / total : 0;

  // ── Start screen ───────────────────────────────────────────────────
  if (!started) {
    return (
      <div style={styles.wrap}>
        <div style={styles.startCard}>
          <div style={{ fontSize: 48 }}>{workout.emoji}</div>
          <h1 style={{ fontSize: 40, marginTop: 6 }}>{workout.name}</h1>
          <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.5, margin: '8px 0 6px' }}>{workout.desc}</p>

          <div style={styles.lenLabel}>Time cap</div>
          <div style={styles.lenChips}>
            {workout.durations.map((d) => (
              <button key={d} onClick={() => { setDurationMin(d); setRemaining(d * 60); }}
                style={{ ...styles.lenChip, ...(durationMin === d ? styles.lenChipOn : {}) }}>{d} min</button>
            ))}
          </div>

          <div style={styles.roundBox}>
            <div style={styles.roundTitle}>ONE ROUND</div>
            {workout.moves.map((m, i) => (
              <div key={i} style={styles.moveRow}>
                <span style={styles.moveNo}>{i + 1}</span>
                <span>{moveLabel(m)}</span>
              </div>
            ))}
          </div>

          <button className="btn" onClick={start}>▶ Start — sound on</button>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={onQuit}>Back</button>
          <p className="muted" style={{ fontSize: 11.5, textAlign: 'center', marginTop: 10 }}>
            Do the moves in order, then tap <strong>+ Round</strong>. Keep going till the clock beeps. ⏱
          </p>
        </div>
      </div>
    );
  }

  // ── Live ───────────────────────────────────────────────────────────
  return (
    <div style={{ ...styles.wrap, background: '#fff2f5', minHeight: '100vh' }}>
      <div style={styles.topBar}>
        <button style={styles.iconBtn} onClick={onQuit}>✕</button>
        <div style={styles.wkName}>{workout.name}</div>
        <button style={styles.iconBtn} onClick={onMute}>{muted ? '🔇' : '🔊'}</button>
      </div>

      <div style={styles.overall}><div style={{ ...styles.overallFill, width: `${pct * 100}%` }} /></div>

      <div style={styles.ringWrap}>
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle cx="110" cy="110" r="96" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="12" />
          <circle cx="110" cy="110" r="96" fill="none" stroke={T.pink} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 96} strokeDashoffset={2 * Math.PI * 96 * (1 - pct)}
            transform="rotate(-90 110 110)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div style={styles.clock}>{mm}:{ss}</div>
      </div>

      <div style={styles.roundsLabel}>ROUNDS DONE</div>
      <div style={styles.roundsBig}>{rounds}</div>

      <button style={styles.roundBtn} onClick={addRound}>+ Round complete</button>
      <div style={styles.subControls}>
        <button style={styles.smallBtn} onClick={removeRound}>− Undo round</button>
        <button style={styles.smallBtn} onClick={() => setRunning((v) => !v)}>{running ? '❚❚ Pause' : '▶ Resume'}</button>
      </div>

      <div style={styles.miniList}>
        {workout.moves.map((m, i) => (
          <span key={i} style={styles.miniMove}>{moveLabel(m)}</span>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  startCard: { width: '100%', maxWidth: 400, textAlign: 'center', margin: '0 auto' },
  lenLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--muted)', margin: '10px 0 8px' },
  lenChips: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 6 },
  lenChip: { padding: '10px 14px', borderRadius: 999, border: '1.5px solid var(--border)', background: 'var(--white)', fontSize: 14, fontWeight: 700, color: 'var(--text)', minWidth: 62 },
  lenChipOn: { background: T.pink, borderColor: T.pink, color: '#fff' },
  roundBox: { textAlign: 'left', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: 14, margin: '14px 0 18px' },
  roundTitle: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 15, color: 'var(--muted)', letterSpacing: 1, marginBottom: 6 },
  moveRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 2px', fontSize: 14.5, fontWeight: 600 },
  moveNo: { width: 22, height: 22, borderRadius: 999, background: 'var(--off)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--muted)', flexShrink: 0 },
  topBar: { width: '100%', maxWidth: 440, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconBtn: { fontSize: 18, width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  wkName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20 },
  overall: { width: '100%', maxWidth: 440, height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 999, overflow: 'hidden', marginBottom: 14 },
  overallFill: { height: '100%', background: T.pink, borderRadius: 999, transition: 'width 1s linear' },
  ringWrap: { position: 'relative', width: 220, height: 220 },
  clock: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 60, color: 'var(--text)', letterSpacing: 2 },
  roundsLabel: { fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: 'var(--muted)', marginTop: 12 },
  roundsBig: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, color: T.pink, lineHeight: 1 },
  roundBtn: { width: '100%', maxWidth: 360, background: 'var(--text)', color: '#fff', fontWeight: 700, fontSize: 18, padding: '16px 0', borderRadius: 16, marginTop: 8 },
  subControls: { display: 'flex', gap: 10, marginTop: 12 },
  smallBtn: { background: 'rgba(255,255,255,0.85)', boxShadow: 'var(--shadow-sm)', padding: '10px 16px', borderRadius: 12, fontSize: 14, fontWeight: 700, color: 'var(--text)' },
  miniList: { display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 20, maxWidth: 420 },
  miniMove: { fontSize: 11.5, fontWeight: 600, color: 'var(--muted)', background: 'rgba(255,255,255,0.7)', padding: '4px 9px', borderRadius: 999 },
};
