// ── Follow-along interval workouts ────────────────────────────────────
// Warm-ups, HIIT/cardio, combat, mobility and core finishers.
// Each workout expands into a sequence of timed segments by IntervalPlayer.
//
// Shape:
//   { id, name, category, emoji, difficulty, duration, not_for_glp1, desc,
//     work_secs, rest_secs, rounds, blocks: [{ name, cue, work_secs?, rest_secs? }] }
//
// - rest_secs: 0 means moves flow straight on (used for warm-ups & mobility holds).
// - rounds: the block list repeats this many times (HIIT/combat/core).
// categories: 'Warm-up' | 'HIIT' | 'Cardio' | 'Combat' | 'Mobility' | 'Core'

export const INTERVAL_WORKOUTS = {
  // ── WARM-UPS ────────────────────────────────────────────────────────
  warmup_full: {
    id: 'warmup_full',
    name: 'Full-Body Warm-Up',
    category: 'Warm-up',
    emoji: '🌅',
    difficulty: 'All levels',
    duration: 5,
    work_secs: 40,
    rest_secs: 0,
    rounds: 1,
    desc: 'Wake the whole body up before any session.',
    blocks: [
      { name: 'March on the Spot', cue: 'Lift the knees, pump the arms. Ease the body awake.' },
      { name: 'Arm Circles', cue: 'Big slow circles forward, then reverse. Open the shoulders.' },
      { name: 'Leg Swings', cue: 'Hold a wall. Swing each leg front to back, loose hip.' },
      { name: 'Hip Openers', cue: 'Knee up and out, then back in. Circle the hips open.' },
      { name: 'Bodyweight Squats', cue: 'Slow and controlled. Wake up legs and glutes.' },
      { name: 'Torso Twists', cue: 'Feet planted, rotate side to side. Loosen the spine.' },
      { name: 'Inchworm to Plank', cue: 'Walk hands out to a plank, walk back up. Full body.' },
      { name: 'Light Jog on Spot', cue: 'Springy and light. Lift the heart rate a touch.' },
    ],
  },
  warmup_lower: {
    id: 'warmup_lower',
    name: 'Lower-Body Warm-Up',
    category: 'Warm-up',
    emoji: '🦵',
    difficulty: 'All levels',
    duration: 5,
    work_secs: 40,
    rest_secs: 0,
    rounds: 1,
    desc: 'Prime the legs, hips and glutes for a lower day.',
    blocks: [
      { name: 'March on the Spot', cue: 'Knees up, arms swinging. Get the blood moving.' },
      { name: 'Leg Swings (Front–Back)', cue: 'Hold a wall, swing each leg loosely.' },
      { name: 'Leg Swings (Side–Side)', cue: 'Swing each leg across the body and out.' },
      { name: 'Bodyweight Squats', cue: 'Full range, controlled. Feel the hips open.' },
      { name: 'Reverse Lunges', cue: 'Step back and sink, alternate sides. Slow.' },
      { name: 'Glute Bridges', cue: 'On your back, drive hips up, squeeze at the top.' },
      { name: 'Ankle Bounces', cue: 'Small springy bounces on the balls of the feet.' },
    ],
  },
  warmup_upper: {
    id: 'warmup_upper',
    name: 'Upper-Body Warm-Up',
    category: 'Warm-up',
    emoji: '💪',
    difficulty: 'All levels',
    duration: 5,
    work_secs: 40,
    rest_secs: 0,
    rounds: 1,
    desc: 'Open the shoulders and spine for a push/pull day.',
    blocks: [
      { name: 'Arm Circles', cue: 'Forward then back. Big, slow, controlled.' },
      { name: 'Shoulder Rolls', cue: 'Roll back, then forward. Release the neck.' },
      { name: 'Pull-Aparts', cue: 'Arms out front, pull hands apart, squeeze the blades.' },
      { name: 'Incline Push-Ups', cue: 'Hands on a surface, slow reps to warm the chest.' },
      { name: 'Torso Twists', cue: 'Rotate gently side to side. Loosen the mid-back.' },
      { name: 'Cat–Cow', cue: 'On all fours, arch and round with the breath.' },
    ],
  },

  // ── HIIT (high impact — hidden from GLP-1 users) ────────────────────
  hiit_20: {
    id: 'hiit_20',
    name: 'HIIT 20',
    category: 'HIIT',
    emoji: '🔥',
    difficulty: 'Intermediate',
    duration: 20,
    not_for_glp1: true,
    work_secs: 40,
    rest_secs: 20,
    rounds: 3,
    desc: 'Short and sharp. 40s work, 20s rest, 3 rounds.',
    blocks: [
      { name: 'Jumping Jacks', cue: 'Full range, steady rhythm. Get the heart up.' },
      { name: 'High Knees', cue: 'Drive the knees up fast, stay light on the feet.' },
      { name: 'Squat Jumps', cue: 'Sink to a squat, explode up, land soft.' },
      { name: 'Mountain Climbers', cue: 'Plank position, drive knees to chest fast.' },
      { name: 'Burpees', cue: 'Down to the floor, jump the feet in, stand and hop.' },
      { name: 'Skaters', cue: 'Bound side to side, land soft on one leg.' },
    ],
  },
  hiit_30: {
    id: 'hiit_30',
    name: 'HIIT 30',
    category: 'HIIT',
    emoji: '💥',
    difficulty: 'Advanced',
    duration: 30,
    not_for_glp1: true,
    work_secs: 40,
    rest_secs: 20,
    rounds: 5,
    desc: 'The full burn. 40s work, 20s rest, 5 rounds.',
    blocks: [
      { name: 'Jumping Jacks', cue: 'Steady rhythm, full range.' },
      { name: 'High Knees', cue: 'Fast feet, knees up, drive the arms.' },
      { name: 'Squat Jumps', cue: 'Explode up, land soft and controlled.' },
      { name: 'Mountain Climbers', cue: 'Hips level, knees driving fast.' },
      { name: 'Burpees', cue: 'Full rep — chest down, jump up.' },
      { name: 'Skaters', cue: 'Wide bounds, soft landings.' },
    ],
  },
  cardio_low_impact_20: {
    id: 'cardio_low_impact_20',
    name: 'Low-Impact Cardio 20',
    category: 'Cardio',
    emoji: '🚶‍♀️',
    difficulty: 'Beginner',
    duration: 20,
    not_for_glp1: false,
    work_secs: 40,
    rest_secs: 20,
    rounds: 3,
    desc: 'Get the heart rate up with no jumping. Joint-friendly.',
    blocks: [
      { name: 'Fast March', cue: 'Big arm swings, quick feet. One foot always down.' },
      { name: 'Step Jacks', cue: 'Step out side to side with the arms — no jump.' },
      { name: 'Standing Knee Drives', cue: 'Drive one knee up, tap down, alternate.' },
      { name: 'Squat to Stand', cue: 'Sit back to a squat, stand tall, repeat.' },
      { name: 'Low Fast Feet', cue: 'Quick small steps on the spot, stay low.' },
      { name: 'Side Steps', cue: 'Step wide side to side, reach with the arms.' },
    ],
  },

  // ── COMBAT ──────────────────────────────────────────────────────────
  combat_20: {
    id: 'combat_20',
    name: 'Strike & Burn',
    category: 'Combat',
    emoji: '🥊',
    difficulty: 'Beginner',
    duration: 20,
    work_secs: 40,
    rest_secs: 20,
    rounds: 3,
    desc: 'Kickboxing cardio. Light on the feet, sharp on the strikes.',
    blocks: [
      { name: 'Jab – Cross', cue: 'Guard up. Snap the punches, rotate the hips.' },
      { name: 'Hooks (L/R)', cue: 'Elbow up, turn through the hip. Alternate sides.' },
      { name: 'Front Kicks', cue: 'Knee up, push the heel out, control it back.' },
      { name: 'Roundhouse Kicks', cue: 'Pivot the standing foot, kick across. Alternate.' },
      { name: 'Bob & Weave', cue: 'Bend the knees, roll under an imaginary punch.' },
      { name: 'Uppercuts', cue: 'Drive up from the legs, alternate hands.' },
    ],
  },
  combat_30: {
    id: 'combat_30',
    name: 'Fighter Flow',
    category: 'Combat',
    emoji: '🥋',
    difficulty: 'Intermediate',
    duration: 30,
    work_secs: 40,
    rest_secs: 20,
    rounds: 5,
    desc: 'Longer combinations, rising intensity throughout.',
    blocks: [
      { name: 'Jab – Cross – Hook', cue: 'Flow the combo, reset your guard each time.' },
      { name: 'Front Kicks', cue: 'Sharp knee drive, snap the kick out.' },
      { name: 'Duck & Counter', cue: 'Slip down, come back with two punches.' },
      { name: 'Roundhouse Kicks', cue: 'Pivot and turn over the hip. Alternate.' },
      { name: 'Knee Strikes', cue: 'Pull down, drive the knee up. Alternate.' },
      { name: 'Fast Punches', cue: 'Rapid straight punches — empty the tank.' },
    ],
  },

  // ── MOBILITY / COOL-DOWN (holds — same ids the app already links to) ─
  mob_full: {
    id: 'mob_full',
    name: 'Full Body Wind-Down',
    category: 'Mobility',
    emoji: '🧘‍♀️',
    difficulty: 'All levels',
    duration: 10,
    work_secs: 45,
    rest_secs: 0,
    rounds: 1,
    desc: 'A gentle flow through the whole body. Perfect after any session.',
    blocks: [
      { name: "Child's Pose", cue: 'Sink the hips back, reach the arms long, breathe.' },
      { name: 'Cat–Cow', cue: 'Flow with the breath — arch, then round.' },
      { name: 'Pigeon (Left)', cue: 'Front shin across, fold forward. Ease into the hip.' },
      { name: 'Pigeon (Right)', cue: 'Switch sides. Let the hip soften, no forcing.' },
      { name: 'Hamstring Reach', cue: 'Legs long, hinge and reach. Soft knees are fine.' },
      { name: 'Figure-Four (Left)', cue: 'Ankle over knee, draw the leg in gently.' },
      { name: 'Figure-Four (Right)', cue: 'Switch sides. Breathe into the glute.' },
      { name: 'Supine Twist (Left)', cue: 'Knees fall to one side, arms wide. Relax.' },
      { name: 'Supine Twist (Right)', cue: 'Roll the knees the other way.' },
      { name: 'Chest Opener', cue: 'Clasp hands behind you, lift, open the chest.' },
      { name: 'Deep Breathing', cue: 'Lie still. Long slow breaths. You’re done.' },
    ],
  },
  mob_hip: {
    id: 'mob_hip',
    name: 'Hip & Hamstring',
    category: 'Mobility',
    emoji: '🦵',
    difficulty: 'All levels',
    duration: 8,
    work_secs: 45,
    rest_secs: 0,
    rounds: 1,
    desc: 'Release tight hips and hamstrings — great after leg days.',
    blocks: [
      { name: 'Pigeon (Left)', cue: 'Fold over the front shin, breathe into the hip.' },
      { name: 'Pigeon (Right)', cue: 'Switch sides. Ease, don’t force.' },
      { name: 'Hip Flexor Lunge (Left)', cue: 'Back knee down, sink the hips forward.' },
      { name: 'Hip Flexor Lunge (Right)', cue: 'Switch sides, tall through the chest.' },
      { name: 'Hamstring Reach', cue: 'Hinge and reach for the toes, soft knees.' },
      { name: 'Supine Twist (Left)', cue: 'Knees over to one side, shoulders down.' },
      { name: 'Supine Twist (Right)', cue: 'Roll to the other side.' },
    ],
  },
  mob_thoracic: {
    id: 'mob_thoracic',
    name: 'Thoracic & Shoulder',
    category: 'Mobility',
    emoji: '🙆‍♀️',
    difficulty: 'All levels',
    duration: 8,
    work_secs: 45,
    rest_secs: 0,
    rounds: 1,
    desc: 'Open the upper back and shoulders — ideal after a push/pull day.',
    blocks: [
      { name: 'Thread the Needle (Left)', cue: 'On all fours, thread one arm under, rest the shoulder.' },
      { name: 'Thread the Needle (Right)', cue: 'Switch sides, breathe into the mid-back.' },
      { name: 'Chest Opener', cue: 'Clasp hands behind, lift and open across the chest.' },
      { name: 'Shoulder Cross-Stretch (L)', cue: 'Arm across the body, draw it in gently.' },
      { name: 'Shoulder Cross-Stretch (R)', cue: 'Switch arms.' },
      { name: 'Cat–Cow', cue: 'Mobilise the spine with the breath.' },
    ],
  },
  mob_lower_back: {
    id: 'mob_lower_back',
    name: 'Lower Back Release',
    category: 'Mobility',
    emoji: '🌿',
    difficulty: 'All levels',
    duration: 8,
    work_secs: 45,
    rest_secs: 0,
    rounds: 1,
    desc: 'Soothe the lower back with gentle spinal movement.',
    blocks: [
      { name: 'Cat–Cow', cue: 'Slow arch and round, follow the breath.' },
      { name: "Child's Pose", cue: 'Hips back, arms long. Let the back lengthen.' },
      { name: 'Knees to Chest', cue: 'Hug both knees in, gently rock side to side.' },
      { name: 'Figure-Four (Left)', cue: 'Ankle over knee, draw in slowly.' },
      { name: 'Figure-Four (Right)', cue: 'Switch sides.' },
      { name: 'Supine Twist (Left)', cue: 'Knees to one side, breathe into the low back.' },
      { name: 'Supine Twist (Right)', cue: 'Roll gently the other way.' },
    ],
  },

  // ── CORE FINISHERS ──────────────────────────────────────────────────
  core_5: {
    id: 'core_5',
    name: 'Core Finisher',
    category: 'Core',
    emoji: '🎯',
    difficulty: 'Intermediate',
    duration: 6,
    work_secs: 40,
    rest_secs: 15,
    rounds: 1,
    desc: 'Quick, sharp core burner to tack onto any session.',
    blocks: [
      { name: 'Plank Hold', cue: 'Body in one line, hips level, breathe.' },
      { name: 'Mountain Climbers', cue: 'Drive the knees, keep the hips down.' },
      { name: 'Dead Bug', cue: 'Low back flat, extend opposite arm and leg slowly.' },
      { name: 'Bicycle Crunches', cue: 'Elbow to opposite knee, slow and controlled.' },
      { name: 'Hollow Hold', cue: 'Low back pressed down, arms and legs off the floor.' },
      { name: 'Leg Raises', cue: 'Lower the legs slow, keep the back flat.' },
    ],
  },
  core_gentle: {
    id: 'core_gentle',
    name: 'Gentle Core',
    category: 'Core',
    emoji: '🌾',
    difficulty: 'Beginner',
    duration: 6,
    not_for_glp1: false,
    work_secs: 40,
    rest_secs: 20,
    rounds: 1,
    desc: 'Low-strain core work — no crunching, kind to the back.',
    blocks: [
      { name: 'Dead Bug', cue: 'Slow opposite arm and leg, low back stays flat.' },
      { name: 'Bird Dog', cue: 'On all fours, extend opposite arm and leg, hold steady.' },
      { name: 'Modified Plank', cue: 'On the knees if needed. One long line.' },
      { name: 'Glute Bridge Hold', cue: 'Hips up, squeeze, brace the core.' },
      { name: 'Side Plank (Left)', cue: 'On the forearm, hips up. Knee down to modify.' },
      { name: 'Side Plank (Right)', cue: 'Switch sides.' },
    ],
  },
};

// Category display order + labels for the Browse screen
export const CATEGORY_ORDER = ['Warm-up', 'HIIT', 'Cardio', 'Combat', 'Core', 'Mobility'];

export const CATEGORY_META = {
  'Warm-up': { label: 'Warm-Ups', blurb: 'Prime the body before you train', emoji: '🌅' },
  HIIT: { label: 'HIIT', blurb: 'High-intensity intervals', emoji: '🔥' },
  Cardio: { label: 'Cardio', blurb: 'Low-impact heart-rate work', emoji: '🚶‍♀️' },
  Combat: { label: 'Combat', blurb: 'Kickboxing cardio', emoji: '🥊' },
  Core: { label: 'Core Finishers', blurb: 'Short, sharp core work', emoji: '🎯' },
  Mobility: { label: 'Mobility & Stretch', blurb: 'Cool down and release', emoji: '🧘‍♀️' },
};

export function getIntervalWorkout(id) {
  return INTERVAL_WORKOUTS[id] || null;
}

// All workouts, optionally filtered for GLP-1 users (hides high-impact).
export function listIntervalWorkouts(isGlp1) {
  return Object.values(INTERVAL_WORKOUTS).filter((w) => !(isGlp1 && w.not_for_glp1));
}

// Grouped by category, respecting CATEGORY_ORDER and GLP-1 filtering.
export function groupedIntervalWorkouts(isGlp1) {
  const all = listIntervalWorkouts(isGlp1);
  return CATEGORY_ORDER.map((cat) => ({
    category: cat,
    meta: CATEGORY_META[cat],
    workouts: all.filter((w) => w.category === cat),
  })).filter((g) => g.workouts.length > 0);
}

// Pick a warm-up appropriate to a plan day label.
export function warmupForDay(dayLabel = '') {
  const l = dayLabel.toLowerCase();
  if (l.includes('lower') || l.includes('leg')) return INTERVAL_WORKOUTS.warmup_lower;
  if (l.includes('upper') || l.includes('push') || l.includes('pull')) return INTERVAL_WORKOUTS.warmup_upper;
  return INTERVAL_WORKOUTS.warmup_full;
}

// Flatten a workout into an ordered list of timed segments for the player.
export function buildSegments(workout) {
  if (!workout) return [];
  const segs = [{ phase: 'prepare', name: 'Get Ready', cue: workout.name, secs: 10 }];
  const rounds = workout.rounds || 1;
  const blocks = workout.blocks || [];

  for (let r = 1; r <= rounds; r++) {
    blocks.forEach((b, i) => {
      const work = b.work_secs ?? workout.work_secs ?? 40;
      segs.push({ phase: 'work', name: b.name, cue: b.cue, secs: work, round: r, rounds });
      const isLast = r === rounds && i === blocks.length - 1;
      const rest = b.rest_secs ?? workout.rest_secs ?? 0;
      if (rest > 0 && !isLast) {
        segs.push({ phase: 'rest', name: 'Rest', cue: '', secs: rest, round: r, rounds });
      }
    });
  }

  // Fill in "Next: …" cues on rest segments
  for (let i = 0; i < segs.length; i++) {
    if (segs[i].phase === 'rest') {
      const next = segs.slice(i + 1).find((s) => s.phase === 'work');
      segs[i].cue = next ? `Next up: ${next.name}` : 'Almost there';
    }
  }
  return segs;
}
