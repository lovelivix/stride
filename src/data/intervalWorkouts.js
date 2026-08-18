// ── Follow-along interval workouts ────────────────────────────────────
// Warm-ups, HIIT/cardio, combat, mobility and core finishers.
// Each workout expands into a sequence of timed segments by IntervalPlayer.
//
// Two kinds:
//  • Length-selectable (HIIT, Cardio, Combat, Core): have a `lengths` array
//    (e.g. [15,20,30,40,60]). The player cycles the moves to fill the chosen
//    time. work_secs/rest_secs set the interval.
//  • Fixed sequences (Warm-ups, Mobility): a set list of moves played once.
//
// categories: 'Warm-up' | 'HIIT' | 'Cardio' | 'Combat' | 'Core' | 'Mobility'

export const INTERVAL_WORKOUTS = {
  // ── WARM-UPS (fixed) ────────────────────────────────────────────────
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

  // ── HIIT (length-selectable, high impact → hidden from GLP-1) ───────
  hiit: {
    id: 'hiit',
    name: 'HIIT',
    category: 'HIIT',
    emoji: '🔥',
    difficulty: 'Intermediate',
    not_for_glp1: true,
    lengths: [15, 20, 30, 40, 60],
    default_length: 20,
    work_secs: 40,
    rest_secs: 20,
    desc: 'High-intensity intervals. 40s work, 20s rest — pick your length.',
    blocks: [
      { name: 'Jumping Jacks', cue: 'Full range, steady rhythm. Get the heart up.' },
      { name: 'High Knees', cue: 'Drive the knees up fast, stay light on the feet.' },
      { name: 'Squat Jumps', cue: 'Sink to a squat, explode up, land soft.' },
      { name: 'Mountain Climbers', cue: 'Plank position, drive knees to chest fast.' },
      { name: 'Burpees', cue: 'Down to the floor, jump the feet in, stand and hop.' },
      { name: 'Skaters', cue: 'Bound side to side, land soft on one leg.' },
      { name: 'Plank Jacks', cue: 'In a plank, jump the feet wide and back.' },
      { name: 'Tuck Jumps', cue: 'Jump and drive the knees up. Land soft.' },
    ],
  },

  // ── CARDIO (length-selectable, low impact — GLP-1 friendly) ─────────
  cardio_low_impact: {
    id: 'cardio_low_impact',
    name: 'Low-Impact Cardio',
    category: 'Cardio',
    emoji: '🚶‍♀️',
    difficulty: 'Beginner',
    not_for_glp1: false,
    lengths: [15, 20, 30, 40, 60],
    default_length: 20,
    work_secs: 40,
    rest_secs: 20,
    desc: 'Raise the heart rate with no jumping. Kind to the joints.',
    blocks: [
      { name: 'Fast March', cue: 'Big arm swings, quick feet. One foot always down.' },
      { name: 'Step Jacks', cue: 'Step out side to side with the arms — no jump.' },
      { name: 'Standing Knee Drives', cue: 'Drive one knee up, tap down, alternate.' },
      { name: 'Squat to Stand', cue: 'Sit back to a squat, stand tall, repeat.' },
      { name: 'Low Fast Feet', cue: 'Quick small steps on the spot, stay low.' },
      { name: 'Side Steps', cue: 'Step wide side to side, reach with the arms.' },
      { name: 'Standing Oblique Crunch', cue: 'Knee up to the elbow, alternate sides.' },
      { name: 'Toe Taps', cue: 'Light taps forward, quick feet, arms pumping.' },
    ],
  },

  // ── COMBAT (length-selectable) ──────────────────────────────────────
  combat: {
    id: 'combat',
    name: 'Combat Cardio',
    category: 'Combat',
    emoji: '🥊',
    difficulty: 'Beginner',
    lengths: [15, 20, 30, 40, 60],
    default_length: 20,
    work_secs: 40,
    rest_secs: 20,
    desc: 'Kickboxing cardio. Light on the feet, sharp on the strikes.',
    blocks: [
      { name: 'Jab – Cross', cue: 'Guard up. Snap the punches, rotate the hips.' },
      { name: 'Hooks (L/R)', cue: 'Elbow up, turn through the hip. Alternate sides.' },
      { name: 'Front Kicks', cue: 'Knee up, push the heel out, control it back.' },
      { name: 'Roundhouse Kicks', cue: 'Pivot the standing foot, kick across. Alternate.' },
      { name: 'Bob & Weave', cue: 'Bend the knees, roll under an imaginary punch.' },
      { name: 'Uppercuts', cue: 'Drive up from the legs, alternate hands.' },
      { name: 'Knee Strikes', cue: 'Pull down, drive the knee up. Alternate.' },
      { name: 'Fast Punches', cue: 'Rapid straight punches — empty the tank.' },
    ],
  },

  // ── CORE FINISHERS (length-selectable, shorter) ─────────────────────
  core: {
    id: 'core',
    name: 'Core Finisher',
    category: 'Core',
    emoji: '🎯',
    difficulty: 'Intermediate',
    lengths: [10, 15, 20],
    default_length: 10,
    work_secs: 40,
    rest_secs: 15,
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
    not_for_glp1: false,
    lengths: [10, 15, 20],
    default_length: 10,
    work_secs: 40,
    rest_secs: 20,
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

  // ── BOOSTS (short optional finishers, fixed ~4 min) ─────────────────
  boost_low: {
    id: 'boost_low',
    name: '4-Minute Low-Impact Boost',
    category: 'Boost',
    emoji: '⚡',
    difficulty: 'Beginner',
    duration: 4,
    not_for_glp1: false,
    work_secs: 40,
    rest_secs: 20,
    rounds: 1,
    desc: 'A quick heart-rate spike with no jumping — a perfect finisher.',
    blocks: [
      { name: 'Fast March', cue: 'Big arms, quick feet. Lift the pace.' },
      { name: 'Step Jacks', cue: 'Step wide side to side with the arms.' },
      { name: 'Standing Knee Drives', cue: 'Drive the knees up, alternate fast.' },
      { name: 'Squat to Stand', cue: 'Sit back, stand tall, repeat with pace.' },
    ],
  },
  boost_hiit: {
    id: 'boost_hiit',
    name: '4-Minute HIIT Boost',
    category: 'Boost',
    emoji: '🔥',
    difficulty: 'Intermediate',
    duration: 4,
    not_for_glp1: true,
    work_secs: 40,
    rest_secs: 20,
    rounds: 1,
    desc: 'A short sharp burst to finish strong. Empty the tank.',
    blocks: [
      { name: 'Jumping Jacks', cue: 'Full range, fast rhythm.' },
      { name: 'High Knees', cue: 'Drive the knees, light on the feet.' },
      { name: 'Squat Jumps', cue: 'Explode up, land soft.' },
      { name: 'Burpees', cue: 'Chest down, jump up. Go.' },
    ],
  },

  // ── MOBILITY / COOL-DOWN (fixed — ids the app already links to) ─────
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
  mob_plantar: {
    id: 'mob_plantar',
    name: 'Plantar Fasciitis Relief',
    category: 'Mobility',
    emoji: '🦶',
    difficulty: 'All levels',
    duration: 9,
    work_secs: 45,
    rest_secs: 0,
    rounds: 1,
    desc: 'Gentle stretches and strengthening to ease sore heels and arches. Never push into sharp pain — see a physio if it persists.',
    blocks: [
      { name: 'Wall Calf Stretch (Left)', cue: 'Back leg straight, heel pressed down, lean into the wall. Feel the upper calf.' },
      { name: 'Wall Calf Stretch (Right)', cue: 'Switch sides. Slow and steady, no bouncing.' },
      { name: 'Soleus Stretch (Left)', cue: 'Same position but soften the back knee — the stretch drops lower.' },
      { name: 'Soleus Stretch (Right)', cue: 'Switch sides.' },
      { name: 'Plantar Fascia Stretch (Left)', cue: 'Seated, cross ankle over knee, gently pull the toes back. Stretch the arch.' },
      { name: 'Plantar Fascia Stretch (Right)', cue: 'Switch feet. Ease into it — no sharp pain.' },
      { name: 'Toe / Towel Scrunches', cue: 'Scrunch the toes (or a towel) toward you, then release. Wakes up the arch.' },
      { name: 'Seated Calf Raises', cue: 'Rise slow, lower even slower. Builds the calf and supports the arch.' },
      { name: 'Arch Roll (Left)', cue: 'Roll the arch over a ball or bottle — firm pressure, not painful.' },
      { name: 'Arch Roll (Right)', cue: 'Switch feet. Finish relaxed.' },
    ],
  },
};

// Category display order + labels for the Browse screen
export const CATEGORY_ORDER = ['Warm-up', 'HIIT', 'Cardio', 'Combat', 'Core', 'Boost', 'Mobility'];

export const CATEGORY_META = {
  'Warm-up': { label: 'Warm-Ups', blurb: 'Prime the body before you train', emoji: '🌅' },
  HIIT: { label: 'HIIT', blurb: 'High-intensity intervals', emoji: '🔥' },
  Cardio: { label: 'Cardio', blurb: 'Low-impact heart-rate work', emoji: '🚶‍♀️' },
  Combat: { label: 'Combat', blurb: 'Kickboxing cardio', emoji: '🥊' },
  Core: { label: 'Core Finishers', blurb: 'Short, sharp core work', emoji: '🎯' },
  Boost: { label: 'Boosts', blurb: 'Quick optional finishers', emoji: '⚡' },
  Mobility: { label: 'Mobility & Stretch', blurb: 'Cool down and release', emoji: '🧘‍♀️' },
};

export function getIntervalWorkout(id) {
  return INTERVAL_WORKOUTS[id] || null;
}

// Does this workout let you pick a length?
export function hasLengths(workout) {
  return Array.isArray(workout?.lengths) && workout.lengths.length > 0;
}

// A short duration label for cards: "15–60 min" or "10 min".
export function durationLabel(workout) {
  if (hasLengths(workout)) {
    const ls = workout.lengths;
    return `${ls[0]}–${ls[ls.length - 1]} min`;
  }
  return `${workout.duration} min`;
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

/**
 * Flatten a workout into an ordered list of timed segments.
 * @param workout
 * @param targetMins  chosen length (only used for length-selectable workouts)
 */
export function buildSegments(workout, targetMins) {
  if (!workout) return [];
  const blocks = workout.blocks || [];
  const workOf = (b) => b.work_secs ?? workout.work_secs ?? 40;
  const restOf = (b) => b.rest_secs ?? workout.rest_secs ?? 0;
  const segs = [{ phase: 'prepare', name: 'Get Ready', cue: workout.name, secs: 10 }];

  if (hasLengths(workout)) {
    // Cycle the moves to fill the chosen time.
    const target = (targetMins || workout.default_length || workout.lengths[0]) * 60;
    let total = 10;
    let i = 0;
    const MAX = 800; // safety cap
    while (total < target && segs.length < MAX) {
      const b = blocks[i % blocks.length];
      const round = Math.floor(i / blocks.length) + 1;
      segs.push({ phase: 'work', name: b.name, cue: b.cue, secs: workOf(b), round });
      total += workOf(b);
      i += 1;
      if (total >= target) break;
      const rest = restOf(b);
      if (rest > 0) {
        segs.push({ phase: 'rest', name: 'Rest', cue: '', secs: rest });
        total += rest;
      }
    }
  } else {
    // Fixed sequence, single (or fixed rounds) pass.
    const rounds = workout.rounds || 1;
    for (let r = 1; r <= rounds; r++) {
      blocks.forEach((b, idx) => {
        segs.push({ phase: 'work', name: b.name, cue: b.cue, secs: workOf(b), round: r, rounds });
        const isLast = r === rounds && idx === blocks.length - 1;
        if (restOf(b) > 0 && !isLast) segs.push({ phase: 'rest', name: 'Rest', cue: '', secs: restOf(b) });
      });
    }
  }

  // Drop any trailing rest so we end on a work move.
  while (segs.length && segs[segs.length - 1].phase === 'rest') segs.pop();

  // Stamp total round count onto work segments (for "Round r / n" display).
  const maxRound = segs.reduce((m, s) => (s.phase === 'work' ? Math.max(m, s.round || 1) : m), 1);
  segs.forEach((s) => {
    if (s.phase === 'work') s.rounds = maxRound;
  });

  // Fill in "Next up: …" cues on rest segments.
  for (let k = 0; k < segs.length; k++) {
    if (segs[k].phase === 'rest') {
      const next = segs.slice(k + 1).find((s) => s.phase === 'work');
      segs[k].cue = next ? `Next up: ${next.name}` : 'Almost there';
    }
  }
  return segs;
}
