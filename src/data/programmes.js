// ── STRIDE programmes — source of truth for each user's plan ──────────
export const PROGRAMMES = {
  // ── OLIVIA ──────────────────────────────────────────────────────────
  stride_strength: {
    id: 'stride_strength',
    name: 'STRIDE Strength',
    for_user: 'olivia',
    description: 'Progressive strength, 2–3 days/week. Calf finisher every lower day.',
    days_per_week: [2, 3],
    goal_tags: ['build_muscle', 'lose_weight', 'get_fitter'],
    weeks: 4,
    days: {
      A: {
        label: 'Day A — Lower + Glutes',
        category: 'Strength',
        has_calf_finisher: true,
        duration_options: [20, 30, 40],
        warmup_mins: 5,
        exercises: [
          { exercise_id: 'goblet_squat', sets: 3, reps_min: 8, reps_max: 12 },
          { exercise_id: 'romanian_deadlift', sets: 3, reps_min: 8, reps_max: 12 },
          { exercise_id: 'reverse_lunge', sets: 3, reps_min: 10, reps_max: 10, per_side: true },
          { exercise_id: 'hip_thrust', sets: 3, reps_min: 10, reps_max: 15 },
          { exercise_id: 'lateral_lunge', sets: 2, reps_min: 10, reps_max: 10, per_side: true },
        ],
        calf_finisher: [
          { exercise_id: 'standing_calf_raise', sets: 3, reps_min: 15, reps_max: 20 },
          { exercise_id: 'eccentric_calf_lower', sets: 3, reps_min: 10, reps_max: 12 },
          { exercise_id: 'single_leg_calf_raise', sets: 2, reps_min: 8, reps_max: 12, per_side: true },
        ],
        cardio_boost: true,
        mobility_addon: true,
      },
      B: {
        label: 'Day B — Upper Push + Pull',
        category: 'Strength',
        has_calf_finisher: false,
        duration_options: [20, 30, 40],
        warmup_mins: 5,
        exercises: [
          { exercise_id: 'shoulder_press', sets: 3, reps_min: 8, reps_max: 12 },
          { exercise_id: 'bent_over_row', sets: 3, reps_min: 8, reps_max: 12 },
          { exercise_id: 'push_up', sets: 3, reps_min: 8, reps_max: 15 },
          { exercise_id: 'single_arm_row', sets: 3, reps_min: 10, reps_max: 12, per_side: true },
          { exercise_id: 'lateral_raise', sets: 3, reps_min: 12, reps_max: 15 },
          { exercise_id: 'bicep_curl', sets: 2, reps_min: 10, reps_max: 12, superset: 'Superset · arms',
            note: 'Superset: do this back-to-back with tricep dips, minimal rest.' },
          { exercise_id: 'tricep_dip', sets: 2, reps_min: 10, reps_max: 12, superset: 'Superset · arms',
            note: 'Straight into these from the curls — then rest.' },
        ],
        cardio_boost: true,
        mobility_addon: true,
      },
      C: {
        label: 'Day C — Full Body (optional)',
        category: 'Strength',
        has_calf_finisher: true,
        duration_options: [20, 30, 40],
        warmup_mins: 5,
        exercises: [
          { exercise_id: 'romanian_deadlift', sets: 3, reps_min: 8, reps_max: 10 },
          { exercise_id: 'push_up', sets: 3, reps_min: 8, reps_max: 12 },
          { exercise_id: 'goblet_squat', sets: 3, reps_min: 8, reps_max: 12 },
          { exercise_id: 'bent_over_row', sets: 3, reps_min: 8, reps_max: 10 },
          { exercise_id: 'plank', sets: 3, hold_secs: 30, hold_max: 60 },
          { exercise_id: 'dead_bug', sets: 3, reps_min: 8, reps_max: 10, per_side: true },
        ],
        calf_finisher: [
          { exercise_id: 'standing_calf_raise', sets: 2, reps_min: 15, reps_max: 20 },
          { exercise_id: 'eccentric_calf_lower', sets: 2, reps_min: 10, reps_max: 12 },
        ],
        mobility_addon: true,
      },
    },
    weekly_notes: {
      1: 'Foundation week. Find your starting weights — you should finish sets feeling like you could do 2-3 more reps.',
      2: 'Same weights as Week 1. Focus on form and full range of motion.',
      3: 'Time to increase. If you hit the top of your rep range, go heavier next set.',
      4: 'Push week. Aim for personal bests. This is where it counts.',
    },
  },

  // ── MUM ─────────────────────────────────────────────────────────────
  foundations: {
    id: 'foundations',
    name: 'Foundations',
    for_user: 'mum',
    description: 'Post-menopausal strength + heart health. GLP-1 adapted. Bone-loading. 2–3 days/week.',
    days_per_week: [2, 3],
    goal_tags: ['lose_weight', 'build_muscle', 'get_fitter', 'heart_health'],
    weeks: 4,
    glp1_adapted: true,
    days: {
      A: {
        label: 'Day A — Lower Body + Bone Health',
        category: 'Strength',
        has_calf_finisher: true,
        duration_options: [20, 30, 40],
        warmup_mins: 8,
        exercises: [
          {
            exercise_id: 'step_up',
            sets: 3,
            reps_min: 8,
            reps_max: 12,
            per_side: true,
            note: 'Bone-loading move — important for bone density.',
          },
          {
            exercise_id: 'goblet_squat',
            sets: 3,
            reps_min: 10,
            reps_max: 15,
            note: 'Lighter weight, controlled pace. Quality over load.',
          },
          { exercise_id: 'hip_thrust', sets: 3, reps_min: 12, reps_max: 15 },
          {
            exercise_id: 'heel_drop',
            sets: 3,
            reps_min: 15,
            reps_max: 20,
            note: 'Bone-loading. Let your heels drop with a soft thud.',
          },
          { exercise_id: 'lateral_lunge', sets: 2, reps_min: 8, reps_max: 10, per_side: true },
        ],
        calf_finisher: [
          { exercise_id: 'standing_calf_raise', sets: 3, reps_min: 15, reps_max: 20 },
          { exercise_id: 'eccentric_calf_lower', sets: 2, reps_min: 10, reps_max: 12 },
        ],
        post_session_note:
          '💪 Great work. Have a protein-rich meal or snack within the next 2 hours — your muscles will thank you.',
        mobility_addon: true,
      },
      B: {
        label: 'Day B — Upper Body + Heart Health',
        category: 'Strength',
        has_calf_finisher: false,
        duration_options: [20, 30, 40],
        warmup_mins: 8,
        exercises: [
          { exercise_id: 'bent_over_row', sets: 3, reps_min: 10, reps_max: 15 },
          { exercise_id: 'shoulder_press', sets: 3, reps_min: 10, reps_max: 12 },
          {
            exercise_id: 'push_up',
            sets: 3,
            reps_min: 6,
            reps_max: 12,
            note: 'Wall or incline push-ups are completely fine — same muscle, safer for wrists.',
          },
          { exercise_id: 'bicep_curl', sets: 3, reps_min: 12, reps_max: 15 },
          {
            exercise_id: 'zone2_walk',
            type: 'cardio',
            duration_mins: 15,
            note: 'Zone 2: comfortable pace where you can hold a conversation. Best for heart health.',
          },
        ],
        post_session_note:
          '❤️ Heart health session done. Zone 2 cardio is one of the most powerful things you can do for longevity.',
        mobility_addon: true,
      },
      C: {
        label: 'Day C — Gentle Full Body (optional)',
        category: 'Strength',
        has_calf_finisher: false,
        duration_options: [20, 30],
        warmup_mins: 8,
        low_energy_day_option: true,
        exercises: [
          { exercise_id: 'step_up', sets: 2, reps_min: 8, reps_max: 10, per_side: true },
          { exercise_id: 'push_up', sets: 2, reps_min: 6, reps_max: 10 },
          { exercise_id: 'hip_thrust', sets: 2, reps_min: 12, reps_max: 15 },
          { exercise_id: 'bent_over_row', sets: 2, reps_min: 10, reps_max: 12 },
          { exercise_id: 'dead_bug', sets: 2, reps_min: 6, reps_max: 8, per_side: true },
        ],
        post_session_note: "🌿 Perfect. Three sessions this week — that's exactly what the research recommends.",
        mobility_addon: true,
      },
    },
    weekly_notes: {
      1: 'Start light. The goal this week is to learn the movements safely.',
      2: 'Same movements, slightly more confidence. Notice how you feel vs last week.',
      3: 'Ready to add a little more weight where it feels comfortable.',
      4: "You've built a foundation. Week 4 is about consolidating and feeling strong.",
    },
  },

  // ── HUSBAND ─────────────────────────────────────────────────────────
  maintain_and_build: {
    id: 'maintain_and_build',
    name: 'Maintain & Build',
    for_user: 'husband',
    description: 'Hybrid strength + calisthenics. Push / Pull / Legs — dumbbells, kettlebell, band and bodyweight skill work. 2–3 days/week.',
    days_per_week: [2, 3],
    goal_tags: ['build_muscle', 'get_fitter'],
    weeks: 4,
    days: {
      A: {
        label: 'Day A — Push',
        category: 'Strength',
        has_calf_finisher: false,
        duration_options: [20, 30, 40],
        warmup_mins: 5,
        exercises: [
          {
            exercise_id: 'shoulder_press',
            sets: 4,
            reps_min: 6,
            reps_max: 10,
            note: 'Strength: 7.5kg dumbbells or the kettlebell. Press hard, control the lower.',
          },
          {
            exercise_id: 'push_up',
            sets: 3,
            reps_min: 8,
            reps_max: 15,
            superset: 'Superset · chest+tris',
            note: 'Calisthenics: standard → wide → archer over time. Add reps before harder variations.',
          },
          {
            exercise_id: 'dip',
            sets: 3,
            reps_min: 8,
            reps_max: 15,
            superset: 'Superset · chest+tris',
            note: 'Straight from push-ups. Chair or sofa, elbows back.',
          },
          {
            exercise_id: 'pike_push_up',
            sets: 3,
            reps_min: 6,
            reps_max: 12,
            note: 'Shoulder skill work. Progress toward wall handstand push-ups.',
          },
          { exercise_id: 'lateral_raise', sets: 2, reps_min: 12, reps_max: 15, note: 'Light 4kg dumbbells, strict form.' },
          { exercise_id: 'plank', sets: 3, hold_secs: 30, hold_max: 60 },
        ],
        mobility_addon: true,
      },
      B: {
        label: 'Day B — Pull',
        category: 'Strength',
        has_calf_finisher: false,
        duration_options: [20, 30, 40],
        warmup_mins: 5,
        exercises: [
          {
            exercise_id: 'scapular_pushup',
            sets: 2,
            reps_min: 10,
            reps_max: 15,
            note: 'Winged-scapula activation. Spread the blades, then squeeze. Focus on driving the LEFT blade around the ribcage — a couple of extra reps on the left.',
          },
          {
            exercise_id: 'band_pull_apart',
            sets: 3,
            reps_min: 12,
            reps_max: 15,
            note: 'Squeeze the shoulder blades together. Feel the LEFT side working — that\'s your priority.',
          },
          {
            exercise_id: 'pull_up',
            sets: 4,
            reps_min: 3,
            reps_max: 10,
            note: 'Calisthenics goal. No bar? Swap in heavy bent-over rows for now.',
          },
          {
            exercise_id: 'bent_over_row',
            sets: 3,
            reps_min: 8,
            reps_max: 12,
            note: 'Strength: 7.5kg dumbbells or kettlebell. Pull to the hip, squeeze.',
          },
          {
            exercise_id: 'single_arm_row',
            sets: 3,
            reps_min: 10,
            reps_max: 12,
            per_side: true,
            note: 'One hand braced. Heaviest dumbbell you can control.',
          },
          {
            exercise_id: 'bicep_curl',
            sets: 3,
            reps_min: 10,
            reps_max: 12,
            superset: 'Superset · arms',
            note: 'Dumbbells. Straight into dead bugs after.',
          },
          { exercise_id: 'dead_bug', sets: 3, reps_min: 8, reps_max: 10, per_side: true, superset: 'Superset · arms' },
          { exercise_id: 'plank', sets: 2, hold_secs: 30, hold_max: 45 },
        ],
        mobility_addon: true,
      },
      C: {
        label: 'Day C — Legs + Core',
        category: 'Strength',
        has_calf_finisher: true,
        duration_options: [20, 30, 40],
        warmup_mins: 5,
        exercises: [
          {
            exercise_id: 'goblet_squat',
            sets: 4,
            reps_min: 8,
            reps_max: 12,
            note: 'Strength: hold the 12kg kettlebell at the chest. Deep and controlled.',
          },
          {
            exercise_id: 'romanian_deadlift',
            sets: 3,
            reps_min: 8,
            reps_max: 12,
            note: 'Kettlebell or dumbbells. Hips back, feel the hamstrings.',
          },
          {
            exercise_id: 'reverse_lunge',
            sets: 3,
            reps_min: 8,
            reps_max: 12,
            per_side: true,
            note: 'Hold dumbbells. Or add the band around the knees for the drive.',
          },
          {
            exercise_id: 'bodyweight_squat',
            sets: 3,
            reps_min: 12,
            reps_max: 20,
            note: 'Calisthenics: progress toward assisted pistol squats. Band for tempo work.',
          },
          {
            exercise_id: 'hip_thrust',
            sets: 3,
            reps_min: 12,
            reps_max: 20,
            note: 'Kettlebell on the hips, shoulders on the sofa. Squeeze at the top.',
          },
          { exercise_id: 'plank', sets: 3, hold_secs: 30, hold_max: 60 },
        ],
        calf_finisher: [
          { exercise_id: 'single_leg_calf_raise', sets: 3, reps_min: 10, reps_max: 15, per_side: true },
          { exercise_id: 'eccentric_calf_lower', sets: 3, reps_min: 8, reps_max: 12 },
        ],
        mobility_addon: true,
      },
    },
    weekly_notes: {
      1: 'Establish baselines. Log every rep of every set honestly — this data drives everything.',
      2: 'Add reps where you can. The goal before adding load is hitting the top of your range.',
      3: "Try harder variations where you're hitting 15+ reps easily.",
      4: 'Max effort week. Leave nothing in the tank on the final sets.',
    },
  },
};

// ── CARDIO / HIIT (shared, all users) ─────────────────────────────────
export const CARDIO_SESSIONS = [
  { id: 'hiit_20', name: 'HIIT 20', duration: 20, category: 'HIIT', desc: 'Short, sharp. Work intervals with minimal rest.', emoji: '🔥', difficulty: 'Intermediate', equipment: 'none' },
  { id: 'hiit_30', name: 'HIIT 30', duration: 30, category: 'HIIT', desc: 'Standard HIIT session. Full body burn.', emoji: '💥', difficulty: 'Intermediate', equipment: 'none' },
  { id: 'combat_20', name: 'Strike & Burn', duration: 20, category: 'Combat', desc: 'Kickboxing cardio. Jabs, crosses, hooks, kicks.', emoji: '🥊', difficulty: 'Beginner', equipment: 'none' },
  { id: 'combat_30', name: 'Fighter Flow', duration: 30, category: 'Combat', desc: 'Cardio Peak Training — intensity spikes throughout.', emoji: '🥋', difficulty: 'Intermediate', equipment: 'none' },
  { id: 'impact_20', name: 'Jump Start', duration: 20, category: 'Impact', desc: 'Plyometric power. Jump squats, star jumps, split jumps.', emoji: '🚀', difficulty: 'Intermediate', equipment: 'none', not_for_glp1: true },
  { id: 'impact_30', name: 'Cardio Blast', duration: 30, category: 'Impact', desc: 'High knees, skaters, burpees. Seriously sweaty.', emoji: '⚡', difficulty: 'Intermediate', equipment: 'none', not_for_glp1: true },
];

// ── MOBILITY ADD-ONS (shared, all users, post-workout) ────────────────
export const MOBILITY_SESSIONS = [
  { id: 'mob_hip', name: 'Hip & Hamstring', duration: 8, desc: 'Pigeon, hip flexor, hamstring, supine twist.', best_after: ['A', 'C'] },
  { id: 'mob_thoracic', name: 'Thoracic & Shoulder', duration: 8, desc: 'Thread the needle, chest opener, shoulder cross-stretch.', best_after: ['B'] },
  { id: 'mob_lower_back', name: 'Lower Back Release', duration: 8, desc: "Cat-cow, child's pose, knees to chest, figure-four.", best_after: ['A', 'C'] },
  { id: 'mob_full', name: 'Full Body Wind-Down', duration: 10, desc: 'Mix of all three flows. Perfect after Day C.', best_after: ['A', 'B', 'C'] },
];

// Helper: fetch a programme safely
export function getProgramme(id) {
  return PROGRAMMES[id] || null;
}

// Helper: fetch a mobility session by id
export function getMobility(id) {
  return MOBILITY_SESSIONS.find((m) => m.id === id) || null;
}

// Helper: cardio sessions filtered for GLP-1 users (hides high-impact)
export function getCardioForProfile(isGlp1) {
  return CARDIO_SESSIONS.filter((c) => !(isGlp1 && c.not_for_glp1));
}
