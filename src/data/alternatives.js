// ── Alternative / equipment resolution ────────────────────────────────
// Programme exercises reference a "base" exercise (e.g. goblet_squat).
// Each base exercise carries an `alternatives` map of variant ids keyed by
// context (home_bodyweight, home_light, gym_barbell, …).
// This module turns the user's location + equipment into the right variant,
// and gives every variant a readable label + a tracking type.

import { getExercise } from './exercises.js';

// Human labels for known variant ids. Anything missing is humanised on the fly.
const VARIANT_LABELS = {
  // squat family
  bodyweight_squat: 'Bodyweight Squat',
  goblet_squat_4kg: 'Goblet Squat (4kg)',
  goblet_squat_12kg: 'Goblet Squat (12kg)',
  goblet_squat_db: 'Goblet Squat (Dumbbell)',
  back_squat: 'Barbell Back Squat',
  leg_press: 'Leg Press',
  smith_squat: 'Smith Machine Squat',
  jump_squat: 'Jump Squat',
  pistol_squat_assisted: 'Assisted Pistol Squat',
  // hinge / rdl family
  single_leg_hip_hinge: 'Single-Leg Hip Hinge',
  rdl_4kg: 'Romanian Deadlift (4kg)',
  rdl_12kg: 'Romanian Deadlift (12kg)',
  rdl_db: 'Romanian Deadlift (Dumbbell)',
  rdl_barbell: 'Barbell Romanian Deadlift',
  lying_leg_curl: 'Lying Leg Curl',
  // lunges
  reverse_lunge_bw: 'Reverse Lunge (Bodyweight)',
  reverse_lunge_4kg: 'Reverse Lunge (4kg)',
  reverse_lunge_12kg: 'Reverse Lunge (12kg)',
  reverse_lunge_db: 'Reverse Lunge (Dumbbell)',
  reverse_lunge_barbell: 'Barbell Reverse Lunge',
  smith_lunge: 'Smith Machine Lunge',
  lateral_lunge_bw: 'Lateral Lunge (Bodyweight)',
  lateral_lunge_4kg: 'Lateral Lunge (4kg)',
  lateral_lunge_12kg: 'Lateral Lunge (12kg)',
  lateral_lunge_db: 'Lateral Lunge (Dumbbell)',
  // hip thrust / glute
  glute_bridge: 'Glute Bridge',
  glute_bridge_4kg: 'Glute Bridge (4kg)',
  glute_bridge_12kg: 'Glute Bridge (12kg)',
  hip_thrust_db: 'Hip Thrust (Dumbbell)',
  hip_thrust_barbell: 'Barbell Hip Thrust',
  hip_thrust_machine: 'Hip Thrust Machine',
  // calves
  standing_calf_raise_bw: 'Standing Calf Raise (Bodyweight)',
  standing_calf_raise_4kg: 'Standing Calf Raise (4kg)',
  standing_calf_raise_12kg: 'Standing Calf Raise (12kg)',
  standing_calf_raise_db: 'Standing Calf Raise (Dumbbell)',
  standing_calf_raise_barbell: 'Barbell Calf Raise',
  calf_raise_machine: 'Calf Raise Machine',
  eccentric_calf_lower_bw: 'Eccentric Calf Lower (Bodyweight)',
  eccentric_calf_lower_db: 'Eccentric Calf Lower (Dumbbell)',
  eccentric_calf_lower_machine: 'Eccentric Calf Lower (Machine)',
  single_leg_calf_raise_bw: 'Single-Leg Calf Raise (Bodyweight)',
  single_leg_calf_raise_4kg: 'Single-Leg Calf Raise (4kg)',
  single_leg_calf_raise_db: 'Single-Leg Calf Raise (Dumbbell)',
  // shoulders
  pike_pushup: 'Pike Push-Up',
  shoulder_press_4kg: 'Shoulder Press (4kg)',
  shoulder_press_12kg: 'Shoulder Press (12kg)',
  shoulder_press_db: 'Shoulder Press (Dumbbell)',
  overhead_press_barbell: 'Barbell Overhead Press',
  shoulder_press_machine: 'Shoulder Press Machine',
  lateral_raise_bw: 'Lateral Raise (Bodyweight)',
  lateral_raise_4kg: 'Lateral Raise (4kg)',
  lateral_raise_db: 'Lateral Raise (Dumbbell)',
  lateral_raise_machine: 'Lateral Raise Machine',
  cable_lateral_raise: 'Cable Lateral Raise',
  // back / rows
  bodyweight_row: 'Bodyweight Row',
  bent_over_row_4kg: 'Bent-Over Row (4kg)',
  bent_over_row_12kg: 'Bent-Over Row (12kg)',
  bent_over_row_db: 'Bent-Over Row (Dumbbell)',
  bent_over_row_barbell: 'Barbell Bent-Over Row',
  seated_cable_row: 'Seated Cable Row',
  single_arm_row_4kg: 'Single-Arm Row (4kg)',
  single_arm_row_12kg: 'Single-Arm Row (12kg)',
  single_arm_row_db: 'Single-Arm Row (Dumbbell)',
  lat_pulldown: 'Lat Pulldown',
  negative_pull_up: 'Negative Pull-Up',
  band_assisted_pull_up: 'Band-Assisted Pull-Up',
  // arms
  bicep_curl_4kg: 'Bicep Curl (4kg)',
  bicep_curl_12kg: 'Bicep Curl (12kg)',
  bicep_curl_db: 'Bicep Curl (Dumbbell)',
  barbell_curl: 'Barbell Curl',
  cable_curl: 'Cable Curl',
  chair_dip: 'Chair Dip',
  bench_dip_bent_knee: 'Bench Dip (Bent Knee)',
  weighted_dip: 'Weighted Dip',
  parallel_bar_dip: 'Parallel Bar Dip',
  diamond_push_up: 'Diamond Push-Up',
  tricep_pushdown: 'Tricep Pushdown',
  // chest / push
  incline_push_up: 'Incline Push-Up',
  knee_push_up: 'Knee Push-Up',
  db_chest_press: 'Dumbbell Chest Press',
  barbell_bench_press: 'Barbell Bench Press',
  chest_press_machine: 'Chest Press Machine',
  cable_chest_fly: 'Cable Chest Fly',
  elevated_pike_push_up: 'Elevated Pike Push-Up',
  wall_handstand_push_up: 'Wall Handstand Push-Up',
  // core / holds
  knee_plank: 'Knee Plank',
  rkc_plank: 'RKC Plank',
  ab_wheel_rollout: 'Ab Wheel Rollout',
  dead_bug_arm_only: 'Dead Bug (Arms Only)',
  dead_bug_with_db: 'Dead Bug (Weighted)',
  // steps
  step_up_bw: 'Step-Up (Bodyweight)',
  step_up_db: 'Step-Up (Dumbbell)',
  step_up_db_gym: 'Step-Up (Dumbbell)',
  low_step_up: 'Low Step-Up',
  // cardio
  zone2_march: 'Zone 2 March (Indoor)',
  treadmill_incline_walk: 'Treadmill Incline Walk',
};

// Variant ids that are unloaded bodyweight movements → track reps, not weight.
const BODYWEIGHT_VARIANT_HINTS = [
  '_bw',
  'bodyweight',
  'pushup',
  'push_up',
  'push-up',
  'pistol',
  'jump_squat',
  'glute_bridge',
  'single_leg_hip_hinge',
  'chair_dip',
  'bench_dip',
  'diamond',
  'negative_pull_up',
  'band_assisted',
  'pike',
  'handstand',
  'knee_plank',
  'rkc_plank',
  'dead_bug',
  'zone2_march',
];

export function variantLabel(variantId) {
  if (!variantId) return '';
  if (VARIANT_LABELS[variantId]) return VARIANT_LABELS[variantId];
  return variantId
    .split('_')
    .map((w) => (/^\d/.test(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

// Which alternatives key to pick from a base exercise given location + kit.
export function getAlternative(exercise, location, profile) {
  const alts = exercise.alternatives || {};
  const homeKit = profile?.equipment_home || [];
  const gymKit = profile?.equipment_gym || [];

  if (location === 'gym') {
    if (gymKit.includes('barbells') && alts.gym_barbell) return alts.gym_barbell;
    if (gymKit.includes('machines') && alts.gym_machine) return alts.gym_machine;
    if (gymKit.includes('cables') && alts.gym_cable) return alts.gym_cable;
    if (gymKit.includes('smith') && alts.gym_smith) return alts.gym_smith;
    if (alts.gym_dumbbell) return alts.gym_dumbbell;
    if (alts.gym) return alts.gym;
    // fall back to any gym_* option, else the base exercise itself
    const gymKey = Object.keys(alts).find((k) => k.startsWith('gym'));
    return gymKey ? alts[gymKey] : exercise.id;
  }

  // Home — treat 7.5kg dumbbells / a kettlebell / heavier plates as "heavy"
  const heavyKit = ['12kg', '8kg', '7.5kg', 'kettlebell'];
  if (heavyKit.some((k) => homeKit.includes(k)) && alts.home_heavy) return alts.home_heavy;
  if (homeKit.includes('4kg') && alts.home_light) return alts.home_light;
  if (alts.home_bodyweight) return alts.home_bodyweight;
  if (alts.standard) return alts.standard;
  const homeKey = Object.keys(alts).find((k) => k.startsWith('home'));
  return homeKey ? alts[homeKey] : exercise.id;
}

// Full resolution: base programme exercise -> concrete display exercise.
// Returns { base_id, id, name, tracking_type, is_calf_focus, cue }.
export function resolveExercise(baseId, location, profile) {
  const base = getExercise(baseId);
  const variantId = getAlternative(base, location, profile);
  const isBodyweightVariant = BODYWEIGHT_VARIANT_HINTS.some((h) => variantId.includes(h));

  let tracking = base.tracking_type;
  // A loaded lift whose chosen variant is unloaded should log reps only.
  if (tracking === 'weight_reps' && isBodyweightVariant) tracking = 'bodyweight_reps';

  return {
    base_id: baseId,
    id: variantId,
    name: variantId === base.id ? base.name : variantLabel(variantId),
    tracking_type: tracking,
    is_calf_focus: base.is_calf_focus,
    cue: base.cue,
  };
}

// Cycle to the next alternative (for the 🔄 swap button in SetLogger).
export function nextAlternative(baseId, currentVariantId) {
  const base = getExercise(baseId);
  const options = [base.id, ...Object.values(base.alternatives || {})];
  const unique = [...new Set(options)];
  const idx = unique.indexOf(currentVariantId);
  const next = unique[(idx + 1) % unique.length];
  const isBodyweightVariant = BODYWEIGHT_VARIANT_HINTS.some((h) => next.includes(h));
  let tracking = base.tracking_type;
  if (tracking === 'weight_reps' && isBodyweightVariant) tracking = 'bodyweight_reps';
  return {
    base_id: baseId,
    id: next,
    name: next === base.id ? base.name : variantLabel(next),
    tracking_type: tracking,
    is_calf_focus: base.is_calf_focus,
    cue: base.cue,
  };
}
