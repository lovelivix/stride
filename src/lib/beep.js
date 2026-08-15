// ── Web Audio beeps for interval timers ───────────────────────────────
// No audio files needed — we synthesise short tones. AudioContext must be
// created/resumed after a user gesture (the Start button), so call unlock()
// from a tap handler before relying on sound.

let ctx = null;
let muted = false;

// Load mute preference (safe if storage is unavailable)
try {
  muted = localStorage.getItem('stride_muted') === '1';
} catch {
  muted = false;
}

export function isMuted() {
  return muted;
}

export function setMuted(v) {
  muted = !!v;
  try {
    localStorage.setItem('stride_muted', muted ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

function getCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  return ctx;
}

// Call once from a user gesture to unlock audio on iOS/Safari.
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
}

function tone(freq, ms, { type = 'sine', vol = 0.18 } = {}) {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(c.destination);
  const t = c.currentTime;
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
  osc.start(t);
  osc.stop(t + ms / 1000);
}

// Short tick for the 3-2-1 countdown before a change
export function countBeep() {
  tone(660, 120, { type: 'square', vol: 0.12 });
}

// Higher "go" tone when a new work interval starts
export function goBeep() {
  tone(990, 240, { type: 'sine', vol: 0.2 });
}

// Lower tone when entering a rest interval
export function restBeep() {
  tone(440, 240, { type: 'sine', vol: 0.16 });
}

// Two-tone flourish when the whole session finishes
export function doneBeep() {
  tone(880, 180);
  setTimeout(() => tone(1245, 320), 190);
}
