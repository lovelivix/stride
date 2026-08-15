// ── Workout assembly ──────────────────────────────────────────────────
// Turns a programme day into a flat, resolved list of exercises (main block
// + calf finisher) ready for ActiveWorkout to render and log.
import { resolveExercise } from '../data/alternatives.js';
import { getExercise } from '../data/exercises.js';

export function buildWorkout(programme, dayKey, location, profile) {
  const day = programme?.days?.[dayKey];
  if (!day) return null;

  const mapItem = (item, block) => {
    const resolved = resolveExercise(item.exercise_id, location, profile);
    const base = getExercise(item.exercise_id);
    return {
      key: `${block}-${item.exercise_id}-${Math.random().toString(36).slice(2, 7)}`,
      base_id: item.exercise_id,
      variant_id: resolved.id,
      name: resolved.name,
      base_name: base.name,
      cue: resolved.cue,
      tracking_type: item.type === 'cardio' ? 'cardio' : resolved.tracking_type,
      is_calf_focus: resolved.is_calf_focus,
      block, // 'main' | 'calf'
      sets: item.sets || 1,
      reps_min: item.reps_min,
      reps_max: item.reps_max,
      hold_secs: item.hold_secs,
      hold_max: item.hold_max,
      duration_mins: item.duration_mins,
      per_side: !!item.per_side,
      note: item.note,
    };
  };

  const main = (day.exercises || []).map((it) => mapItem(it, 'main'));
  const calf = day.has_calf_finisher && day.calf_finisher ? day.calf_finisher.map((it) => mapItem(it, 'calf')) : [];

  return {
    day_key: dayKey,
    label: day.label,
    warmup_mins: day.warmup_mins || 5,
    has_calf_finisher: !!day.has_calf_finisher,
    mobility_addon: !!day.mobility_addon,
    post_session_note: day.post_session_note || null,
    low_energy_day_option: !!day.low_energy_day_option,
    exercises: [...main, ...calf],
    total_planned_sets: [...main, ...calf].reduce((n, e) => n + (e.sets || 0), 0),
  };
}

// GLP-1 "low energy today" adaptation: one fewer set, ~10% lighter.
export function applyLowEnergy(workout) {
  return {
    ...workout,
    low_energy: true,
    exercises: workout.exercises.map((e) => ({
      ...e,
      sets: Math.max(1, (e.sets || 1) - 1),
      low_energy: true,
    })),
    total_planned_sets: workout.exercises.reduce((n, e) => n + Math.max(1, (e.sets || 1) - 1), 0),
  };
}
