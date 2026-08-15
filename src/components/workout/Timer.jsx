import { useEffect, useRef, useState } from 'react';
import { T } from '../../lib/theme.js';

/**
 * Countdown timer for holds, cardio blocks and rest.
 * Props:
 *  - seconds: starting duration
 *  - autoStart: begin immediately
 *  - onComplete: called when it reaches 0
 *  - label: small caption under the clock
 *  - countUp: if true, counts up from 0 instead of down (for open holds)
 */
export default function Timer({ seconds = 60, autoStart = false, onComplete, label, countUp = false }) {
  const [remaining, setRemaining] = useState(countUp ? 0 : seconds);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (countUp) return r + 1;
        if (r <= 1) {
          clearInterval(intervalRef.current);
          if (!doneRef.current) {
            doneRef.current = true;
            onComplete && onComplete();
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, countUp, onComplete]);

  const reset = () => {
    clearInterval(intervalRef.current);
    doneRef.current = false;
    setRemaining(countUp ? 0 : seconds);
    setRunning(false);
  };

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  const pct = countUp ? 0 : Math.max(0, Math.min(1, remaining / seconds));

  return (
    <div style={styles.wrap}>
      <div style={styles.ring}>
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="66" fill="none" stroke={T.border} strokeWidth="10" />
          {!countUp && (
            <circle
              cx="75"
              cy="75"
              r="66"
              fill="none"
              stroke={T.pink}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 66}
              strokeDashoffset={2 * Math.PI * 66 * (1 - pct)}
              transform="rotate(-90 75 75)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          )}
        </svg>
        <div style={styles.clock}>
          {mm}:{ss}
        </div>
      </div>
      {label && <div style={styles.label}>{label}</div>}
      <div style={styles.controls}>
        <button className="btn btn-sm" style={{ minWidth: 92 }} onClick={() => setRunning((v) => !v)}>
          {running ? '⏸ Pause' : '▶ Start'}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={reset}>
          ↺ Reset
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  ring: { position: 'relative', width: 150, height: 150 },
  clock: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: 42,
    color: 'var(--text)',
    letterSpacing: 1,
  },
  label: { fontSize: 14, color: 'var(--muted)', fontWeight: 600, textAlign: 'center' },
  controls: { display: 'flex', gap: 10 },
};
