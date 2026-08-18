import { useEffect, useMemo, useRef, useState } from 'react';
import { buildSegments, hasLengths } from '../../data/intervalWorkouts.js';
import { countBeep, goBeep, restBeep, doneBeep, unlockAudio, isMuted, toggleMuted } from '../../lib/beep.js';
import { T } from '../../lib/theme.js';

const PHASE = {
  prepare: { label: 'Get Ready', color: T.amber, bg: '#fff7ea' },
  work: { label: 'Work', color: T.pink, bg: '#fff2f5' },
  rest: { label: 'Rest', color: T.walk, bg: '#eef7ff' },
};

/**
 * Auto-advancing interval player with audio beeps.
 * Props: workout, onComplete(), onQuit()
 */
export default function IntervalPlayer({ workout, onComplete, onQuit }) {
  const selectable = hasLengths(workout);
  const [selectedLen, setSelectedLen] = useState(
    selectable ? workout.default_length || workout.lengths[0] : null
  );
  const segs = useMemo(() => buildSegments(workout, selectedLen), [workout, selectedLen]);
  const total = segs.length;
  const chosenMins = selectedLen || workout.duration || 0;

  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [segIndex, setSegIndex] = useState(0);
  const [remaining, setRemaining] = useState(segs[0]?.secs || 0);
  const [muted, setMutedState] = useState(isMuted());

  const idxRef = useRef(0);
  const remRef = useRef(segs[0]?.secs || 0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const goToSegment = (i) => {
    idxRef.current = i;
    remRef.current = segs[i].secs;
    setSegIndex(i);
    setRemaining(segs[i].secs);
    if (segs[i].phase === 'rest') restBeep();
    else if (segs[i].phase === 'work') goBeep();
  };

  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => {
      remRef.current -= 1;
      const rem = remRef.current;
      if (rem === 3 || rem === 2 || rem === 1) countBeep();
      if (rem <= 0) {
        const nextIdx = idxRef.current + 1;
        if (nextIdx >= total) {
          clearInterval(t);
          doneBeep();
          setRunning(false);
          onCompleteRef.current && onCompleteRef.current(chosenMins);
          return;
        }
        goToSegment(nextIdx);
      } else {
        setRemaining(rem);
      }
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, total]);

  const start = () => {
    unlockAudio();
    idxRef.current = 0;
    remRef.current = segs[0]?.secs || 0;
    setSegIndex(0);
    setRemaining(segs[0]?.secs || 0);
    setStarted(true);
    setRunning(true);
  };

  const skip = () => {
    const next = idxRef.current + 1;
    if (next >= total) {
      setRunning(false);
      doneBeep();
      onCompleteRef.current && onCompleteRef.current(chosenMins);
      return;
    }
    goToSegment(next);
  };

  const back = () => {
    const prev = Math.max(0, idxRef.current - 1);
    idxRef.current = prev;
    remRef.current = segs[prev].secs;
    setSegIndex(prev);
    setRemaining(segs[prev].secs);
  };

  const onMute = () => setMutedState(toggleMuted());

  const seg = segs[segIndex] || {};
  const phase = PHASE[seg.phase] || PHASE.work;
  const nextWork = segs.slice(segIndex + 1).find((s) => s.phase === 'work');
  const pct = seg.secs ? remaining / seg.secs : 0;
  const overall = total ? segIndex / total : 0;
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(Math.max(0, remaining) % 60).padStart(2, '0');

  // ── Start overlay (also unlocks audio) ─────────────────────────────
  if (!started) {
    return (
      <div style={styles.wrap}>
        <div style={styles.startCard}>
          <div style={{ fontSize: 48 }}>{workout.emoji || '⏱'}</div>
          <h1 style={{ fontSize: 40, marginTop: 6 }}>{workout.name}</h1>
          <p className="muted" style={{ fontSize: 14.5, lineHeight: 1.5, margin: '8px 0 4px' }}>{workout.desc}</p>
          <div style={styles.meta}>
            <span>⏱ ~{chosenMins} min</span>
            <span>· {workout.blocks?.length || 0} moves</span>
            {selectable && <span>· {workout.work_secs}s / {workout.rest_secs}s</span>}
          </div>

          {selectable && (
            <div style={styles.lenPicker}>
              <div style={styles.lenLabel}>Choose your length</div>
              <div style={styles.lenChips}>
                {workout.lengths.map((L) => (
                  <button
                    key={L}
                    onClick={() => setSelectedLen(L)}
                    style={{ ...styles.lenChip, ...(selectedLen === L ? styles.lenChipOn : {}) }}
                  >
                    {L} min
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={styles.previewList}>
            {workout.blocks?.slice(0, 8).map((b, i) => (
              <div key={i} style={styles.previewRow}>
                <span style={styles.previewNo}>{i + 1}</span>
                <span>{b.name}</span>
              </div>
            ))}
          </div>
          <button className="btn" onClick={start}>▶ Start — sound on</button>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={onQuit}>Back</button>
          <p className="muted" style={{ fontSize: 11.5, textAlign: 'center', marginTop: 10 }}>
            Beeps count you in and switch moves automatically. Turn your volume up. 🔊
          </p>
        </div>
      </div>
    );
  }

  // ── Live player ────────────────────────────────────────────────────
  return (
    <div style={{ ...styles.wrap, background: phase.bg, minHeight: '100vh', transition: 'background .3s' }}>
      <div style={styles.topBar}>
        <button style={styles.iconBtn} onClick={onQuit}>✕</button>
        <div style={{ textAlign: 'center' }}>
          <div style={styles.wkName}>{workout.name}</div>
          {seg.phase === 'work' && seg.rounds > 1 && (
            <div style={styles.round}>Round {seg.round} / {seg.rounds}</div>
          )}
        </div>
        <button style={styles.iconBtn} onClick={onMute}>{muted ? '🔇' : '🔊'}</button>
      </div>

      <div style={styles.overall}>
        <div style={{ ...styles.overallFill, width: `${overall * 100}%` }} />
      </div>

      <div style={styles.phasePill(phase.color)}>{phase.label.toUpperCase()}</div>

      <div style={styles.ringWrap}>
        <svg width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r="104" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="12" />
          <circle
            cx="120"
            cy="120"
            r="104"
            fill="none"
            stroke={phase.color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 104}
            strokeDashoffset={2 * Math.PI * 104 * (1 - pct)}
            transform="rotate(-90 120 120)"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={styles.clock}>{mm}:{ss}</div>
      </div>

      <div style={styles.moveName}>{seg.name}</div>
      {seg.cue && <div style={styles.cue}>{seg.cue}</div>}
      {seg.phase !== 'rest' && nextWork && (
        <div style={styles.next}>Next: {nextWork.name}</div>
      )}

      <div style={styles.controls}>
        <button style={styles.ctrlSmall} onClick={back}>◀</button>
        <button style={styles.ctrlMain} onClick={() => setRunning((v) => !v)}>
          {running ? '❚❚' : '▶'}
        </button>
        <button style={styles.ctrlSmall} onClick={skip}>▶▶</button>
      </div>
      <div style={styles.stepInfo}>{segIndex + 1} of {total}</div>
    </div>
  );
}

const styles = {
  wrap: { minHeight: '100vh', padding: '20px 20px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  startCard: { width: '100%', maxWidth: 400, textAlign: 'center', margin: '0 auto' },
  meta: { display: 'flex', gap: 8, justifyContent: 'center', fontSize: 13, color: 'var(--muted)', fontWeight: 600, margin: '4px 0 16px', flexWrap: 'wrap' },
  lenPicker: { margin: '4px 0 16px' },
  lenLabel: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, color: 'var(--muted)', marginBottom: 8 },
  lenChips: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  lenChip: { padding: '10px 14px', borderRadius: 999, border: '1.5px solid var(--border)', background: 'var(--white)', fontSize: 14, fontWeight: 700, color: 'var(--text)', minWidth: 62 },
  lenChipOn: { background: T.pink, borderColor: T.pink, color: '#fff' },
  previewList: { textAlign: 'left', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 16, padding: 12, marginBottom: 18 },
  previewRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', fontSize: 14, fontWeight: 600 },
  previewNo: { width: 22, height: 22, borderRadius: 999, background: 'var(--off)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--muted)', flexShrink: 0 },
  topBar: { width: '100%', maxWidth: 440, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  iconBtn: { fontSize: 18, width: 40, height: 40, borderRadius: 999, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  wkName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, lineHeight: 1 },
  round: { fontSize: 11.5, color: 'var(--muted)', fontWeight: 700 },
  overall: { width: '100%', maxWidth: 440, height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 999, overflow: 'hidden', marginBottom: 18 },
  overallFill: { height: '100%', background: 'var(--text)', opacity: 0.5, borderRadius: 999, transition: 'width .5s' },
  phasePill: (c) => ({ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: 1.5, color: '#fff', background: c, padding: '5px 16px', borderRadius: 999, marginBottom: 6 }),
  ringWrap: { position: 'relative', width: 240, height: 240, margin: '4px 0' },
  clock: { position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bebas Neue', sans-serif", fontSize: 68, color: 'var(--text)', letterSpacing: 2 },
  moveName: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 34, textAlign: 'center', lineHeight: 1.05, marginTop: 6, maxWidth: 420 },
  cue: { fontSize: 14.5, color: 'var(--text)', opacity: 0.75, textAlign: 'center', maxWidth: 360, margin: '8px auto 0', lineHeight: 1.45 },
  next: { fontSize: 12.5, color: 'var(--muted)', fontWeight: 700, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.6 },
  controls: { display: 'flex', alignItems: 'center', gap: 22, marginTop: 22 },
  ctrlSmall: { width: 56, height: 56, borderRadius: 999, background: 'rgba(255,255,255,0.85)', boxShadow: 'var(--shadow-sm)', fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  ctrlMain: { width: 72, height: 72, borderRadius: 999, background: 'var(--text)', color: '#fff', fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  stepInfo: { fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 16 },
};
