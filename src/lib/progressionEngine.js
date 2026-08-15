// ── Progressive overload engine ───────────────────────────────────────

// Weight increments by exercise type
const INCREMENTS = {
  small: 0.5, // lateral raise, bicep curl, calf raise, tricep work
  medium: 1, // shoulder press, single-arm row, lunge
  large: 2, // squat, deadlift, hip thrust, bent-over row
};

const EXERCISE_INCREMENT_MAP = {
  lateral_raise: 'small',
  bicep_curl: 'small',
  standing_calf_raise: 'small',
  single_leg_calf_raise: 'small',
  eccentric_calf_lower: 'small',
  tricep_dip: 'small',
  shoulder_press: 'medium',
  single_arm_row: 'medium',
  reverse_lunge: 'medium',
  lateral_lunge: 'medium',
  step_up: 'medium',
  goblet_squat: 'large',
  romanian_deadlift: 'large',
  hip_thrust: 'large',
  bent_over_row: 'large',
};

/**
 * Returns weight suggestion and coaching note for next session.
 * @param {string} exerciseId
 * @param {Array<Array>} lastTwoSessions - array of set-arrays, most recent first
 * @param {number} lastRPE
 * @param {{reps_min?:number, reps_max?:number}} target - programme rep target
 * @returns {{ weight: number|null, note: string, readyToProgress: boolean }}
 */
export function getSuggestedWeight(exerciseId, lastTwoSessions, lastRPE, target = {}) {
  if (!lastTwoSessions?.length || !lastTwoSessions[0]?.length) {
    return { weight: null, note: 'First time — start light and find your weight.', readyToProgress: false };
  }

  const lastSets = lastTwoSessions[0];
  const lastWeight = lastSets[0]?.weight_kg ?? null;
  const repsMax = target.reps_max ?? 12;
  const repsMin = target.reps_min ?? 8;

  const allCompleted = lastSets.every((s) => s.completed);
  const hitTopRange = lastSets.every((s) => (s.reps ?? 0) >= (s.target_reps_max ?? repsMax));
  const failedBottom = lastSets.some((s) => (s.reps ?? 0) < (s.target_reps_min ?? repsMin));
  const highRPE = lastRPE >= 9;

  if (lastWeight == null) {
    return { weight: null, note: 'Log a weight this session to start tracking progression.', readyToProgress: false };
  }
  if (!allCompleted || failedBottom) {
    return {
      weight: lastWeight,
      note: 'Stay at this weight — build consistency before adding load.',
      readyToProgress: false,
    };
  }
  if (highRPE) {
    return {
      weight: lastWeight,
      note: 'RPE was high last time — consolidate before progressing.',
      readyToProgress: false,
    };
  }
  if (hitTopRange) {
    const incrementType = EXERCISE_INCREMENT_MAP[exerciseId] || 'medium';
    const increment = INCREMENTS[incrementType];
    return {
      weight: Math.round((lastWeight + increment) * 100) / 100,
      note: `You hit your target range — time to go heavier. +${increment}kg 💪`,
      readyToProgress: true,
    };
  }
  return { weight: lastWeight, note: 'Keep building reps before adding weight.', readyToProgress: false };
}

/**
 * Hold / plank progression.
 */
export function getSuggestedHold(lastHoldSecs, targetSecs) {
  if (!lastHoldSecs) return { secs: targetSecs, note: 'Aim for this hold duration.' };
  if (lastHoldSecs >= targetSecs) {
    return { secs: targetSecs + 5, note: `You held ${lastHoldSecs}s — target ${targetSecs + 5}s today. ⏱` };
  }
  return { secs: targetSecs, note: `You managed ${lastHoldSecs}s last time. Keep building.` };
}

/**
 * PR detection — call when logging each set.
 * Returns true if this (weight, reps) beats the user's previous best.
 */
export async function checkForPR(supabase, userId, exerciseId, weight, reps) {
  const { data } = await supabase
    .from('session_sets')
    .select('weight_kg, reps')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('weight_kg', { ascending: false })
    .limit(1);

  if (!data?.length) return true; // first time = PR
  const prevBest = data[0];
  const w = weight ?? 0;
  const r = reps ?? 0;
  return w > (prevBest.weight_kg ?? 0) || (w === (prevBest.weight_kg ?? 0) && r > (prevBest.reps ?? 0));
}

/**
 * Local PR check against an in-memory list of previous sets for this exercise.
 * Avoids a network round-trip while logging live. bestSet may be null.
 */
export function isLocalPR(bestSet, weight, reps) {
  if (!bestSet) return (weight ?? 0) > 0 || (reps ?? 0) > 0;
  const w = weight ?? 0;
  const r = reps ?? 0;
  return w > (bestSet.weight_kg ?? 0) || (w === (bestSet.weight_kg ?? 0) && r > (bestSet.reps ?? 0));
}

/**
 * Total training volume (kg) for a list of sets.
 */
export function calculateVolume(sets) {
  return (sets || []).reduce((total, set) => {
    if (set.weight_kg && set.reps) return total + set.weight_kg * set.reps;
    return total;
  }, 0);
}

/**
 * GLP-1 RPE gate — Mum should never be pushed past RPE 7.
 */
export function getGlp1AdjustedTarget(target, isGlp1) {
  if (!isGlp1) return target;
  return { ...target, rpe_max: 7, note: 'On GLP-1: listen to your body. RPE 7 is your ceiling today.' };
}
