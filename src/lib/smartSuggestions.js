// ── Smart daily suggestion engine ─────────────────────────────────────
import { PROGRAMMES } from '../data/programmes.js';

/**
 * Returns today's recommended session based on recent history.
 * recentSessions: array of session rows, most recent first.
 */
export function getDailySuggestion(profile, recentSessions = []) {
  const today = new Date();
  const hour = today.getHours();
  const programmeId = profile?.programme_id;
  const programme = PROGRAMMES[programmeId];
  if (!programme) return null;

  const lastSession = recentSessions[0];
  const last7Days = recentSessions.filter((s) => {
    const d = new Date(s.completed_at);
    return (today - d) / (1000 * 60 * 60 * 24) <= 7;
  });

  const sessionsThisWeek = last7Days.length;
  const lastRPE = lastSession?.rpe;
  // workout_id is stored as `${programme_id}_${day}`; last token is the day letter
  const lastDay = lastSession?.workout_id?.split('_').pop();
  const maxPerWeek = Math.max(...programme.days_per_week);

  // Rest if already at weekly target
  if (sessionsThisWeek >= maxPerWeek) {
    return {
      type: 'rest',
      message: `${sessionsThisWeek} sessions done this week — you've hit your target. Rest or do a short mobility session today.`,
      suggested_session: 'mob_full',
      sessions_this_week: sessionsThisWeek,
      max_per_week: maxPerWeek,
    };
  }

  // Recovery if last RPE was very high
  if (lastRPE >= 9) {
    return {
      type: 'recovery',
      message: 'Last session was intense (RPE 9+). Consider mobility or a lighter day today.',
      suggested_session: 'mob_full',
      sessions_this_week: sessionsThisWeek,
      max_per_week: maxPerWeek,
    };
  }

  // Rotate days intelligently
  const dayOrder = Object.keys(programme.days); // ['A','B','C'] (or subset)
  const lastDayIndex = dayOrder.indexOf(lastDay);
  const nextDay = dayOrder[(lastDayIndex + 1) % dayOrder.length] || dayOrder[0];

  const label = programme.days[nextDay]?.label || 'your next session';
  const timeContext =
    hour < 12
      ? `Good morning — perfect time for ${label}.`
      : hour < 17
      ? `Afternoon session: ${label}.`
      : `Evening workout: ${label}.`;

  return {
    type: 'workout',
    day: nextDay,
    programme_id: programmeId,
    message: timeContext,
    sessions_this_week: sessionsThisWeek,
    max_per_week: maxPerWeek,
  };
}
