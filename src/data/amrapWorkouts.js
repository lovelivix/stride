// ── AMRAP workouts ────────────────────────────────────────────────────
// "As Many Rounds As Possible" in a time cap. You work through the move
// list as a round, then repeat — counting rounds — until the timer ends.
// Weighted moves use whatever weight suits you; reps are per round.
//
// Shape:
//   { id, name, emoji, difficulty, durations:[10,15,20], default_duration,
//     not_for_glp1, desc, moves: [{ name, reps?, secs?, per_side?, cue }] }

export const AMRAP_WORKOUTS = {
  amrap_full: {
    id: 'amrap_full',
    name: 'Full-Body AMRAP',
    emoji: '🔁',
    difficulty: 'Intermediate',
    durations: [10, 15, 20],
    default_duration: 15,
    desc: 'A full-body round you repeat as many times as you can. Use weights that challenge you.',
    moves: [
      { name: 'Goblet Squats', reps: 12, cue: 'Weight at the chest, sit back and drive up.' },
      { name: 'Push-Ups', reps: 10, cue: 'Chest to floor. Knees down to modify.' },
      { name: 'Bent-Over Rows', reps: 12, cue: 'Hinge, pull the elbows back, squeeze.' },
      { name: 'Reverse Lunges', reps: 10, per_side: true, cue: 'Step back, drop the knee, drive up.' },
      { name: 'Plank', secs: 30, cue: 'Hold strong, hips level, breathe.' },
    ],
  },
  amrap_lower: {
    id: 'amrap_lower',
    name: 'Lower-Body AMRAP',
    emoji: '🦵',
    difficulty: 'Intermediate',
    durations: [10, 15, 20],
    default_duration: 15,
    desc: 'Legs and glutes on repeat. Keep the rest short.',
    moves: [
      { name: 'Goblet Squats', reps: 15, cue: 'Controlled down, powerful up.' },
      { name: 'Romanian Deadlifts', reps: 12, cue: 'Hips back, feel the hamstrings load.' },
      { name: 'Reverse Lunges', reps: 10, per_side: true, cue: 'Alternate legs, stay tall.' },
      { name: 'Hip Thrusts', reps: 15, cue: 'Drive the hips high, squeeze the glutes.' },
      { name: 'Calf Raises', reps: 20, cue: 'Full range, pause at the top.' },
    ],
  },
  amrap_upper: {
    id: 'amrap_upper',
    name: 'Upper-Body AMRAP',
    emoji: '💪',
    difficulty: 'Intermediate',
    durations: [10, 15, 20],
    default_duration: 15,
    desc: 'Push, pull and arms — round after round.',
    moves: [
      { name: 'Push-Ups', reps: 10, cue: 'Full range, body in a line.' },
      { name: 'Shoulder Press', reps: 10, cue: 'Press overhead, ribs down.' },
      { name: 'Bent-Over Rows', reps: 12, cue: 'Elbows back, control the lower.' },
      { name: 'Bicep Curls', reps: 12, cue: 'Elbows pinned, no swinging.' },
      { name: 'Tricep Dips', reps: 12, cue: 'Elbows back, lower to 90°.' },
    ],
  },
  amrap_bodyweight: {
    id: 'amrap_bodyweight',
    name: 'Bodyweight Burner',
    emoji: '🤸',
    difficulty: 'Intermediate',
    durations: [10, 15, 20],
    default_duration: 12,
    not_for_glp1: true,
    desc: 'No kit needed. Move fast, keep the rounds ticking.',
    moves: [
      { name: 'Air Squats', reps: 15, cue: 'Sit back, drive through the heels.' },
      { name: 'Push-Ups', reps: 10, cue: 'Chest to floor, strong press.' },
      { name: 'Sit-Ups', reps: 15, cue: 'Controlled up and down.' },
      { name: 'Reverse Lunges', reps: 10, per_side: true, cue: 'Alternate legs.' },
      { name: 'Burpees', reps: 5, cue: 'Chest down, jump up. Empty the tank.' },
    ],
  },
  amrap_low: {
    id: 'amrap_low',
    name: 'Low-Impact AMRAP',
    emoji: '🌿',
    difficulty: 'Beginner',
    durations: [10, 15, 20],
    default_duration: 12,
    not_for_glp1: false,
    desc: 'Strength rounds with no jumping — steady and joint-friendly.',
    moves: [
      { name: 'Goblet Squats', reps: 12, cue: 'Light weight, quality reps.' },
      { name: 'Incline Push-Ups', reps: 10, cue: 'Hands raised, controlled tempo.' },
      { name: 'Bent-Over Rows', reps: 12, cue: 'Squeeze the shoulder blades.' },
      { name: 'Step-Ups', reps: 10, per_side: true, cue: 'Full foot on the step, drive up.' },
      { name: 'March on the Spot', secs: 40, cue: 'Big arms, quick feet.' },
    ],
  },
  amrap_core: {
    id: 'amrap_core',
    name: 'Core AMRAP',
    emoji: '🎯',
    difficulty: 'Intermediate',
    durations: [8, 10, 15],
    default_duration: 10,
    desc: 'Round after round of core. Quality over speed.',
    moves: [
      { name: 'Plank', secs: 30, cue: 'One long line, hips level.' },
      { name: 'Bicycle Crunches', reps: 20, cue: 'Elbow to opposite knee, slow.' },
      { name: 'Dead Bugs', reps: 10, per_side: true, cue: 'Low back flat, extend slowly.' },
      { name: 'Leg Raises', reps: 12, cue: 'Lower slow, keep the back down.' },
      { name: 'Hollow Hold', secs: 20, cue: 'Arms and legs off the floor.' },
    ],
  },
};

export function getAmrap(id) {
  return AMRAP_WORKOUTS[id] || null;
}

export function listAmraps(isGlp1) {
  return Object.values(AMRAP_WORKOUTS).filter((w) => !(isGlp1 && w.not_for_glp1));
}

export function amrapDurationLabel(w) {
  const d = w.durations;
  return `${d[0]}–${d[d.length - 1]} min`;
}

export function moveLabel(m) {
  if (m.secs) return `${m.name} — ${m.secs}s`;
  return `${m.reps}${m.per_side ? '/side' : ''} ${m.name}`;
}
