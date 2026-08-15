import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { getIntervalWorkout } from '../data/intervalWorkouts.js';
import IntervalPlayer from '../components/workout/IntervalPlayer.jsx';
import { T } from '../lib/theme.js';

// Categories we log to History as a completed session (skip warm-ups/mobility)
const LOGGED = new Set(['HIIT', 'Cardio', 'Combat', 'Core']);

export default function IntervalSession() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const workout = getIntervalWorkout(id);
  const [done, setDone] = useState(false);

  if (!workout) {
    return (
      <div className="page-no-nav">
        <p className="muted">Workout not found.</p>
        <button className="btn" onClick={() => navigate('/browse')}>Back to workouts</button>
      </div>
    );
  }

  const handleComplete = async () => {
    if (LOGGED.has(workout.category) && user) {
      await supabase.from('sessions').insert({
        user_id: user.id,
        workout_id: workout.id,
        programme_id: profile?.programme_id || 'library',
        duration_mins: workout.duration,
        location: 'home',
        total_volume_kg: 0,
      });
    }
    setDone(true);
  };

  if (done) {
    const logged = LOGGED.has(workout.category);
    return (
      <div className="page-no-nav">
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={styles.tick}>✓</div>
          <h1 style={{ fontSize: 38, marginTop: 8 }}>Done!</h1>
          <p className="muted" style={{ fontSize: 15, margin: '6px 0 20px' }}>
            {workout.name} complete.{' '}
            {logged ? 'Logged to your history.' : workout.category === 'Warm-up' ? 'Nicely warmed up.' : 'Lovely — well stretched.'}
          </p>
          <button className="btn" onClick={() => navigate('/browse')}>Back to workouts</button>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigate('/today')}>Home</button>
        </div>
      </div>
    );
  }

  return <IntervalPlayer workout={workout} onComplete={handleComplete} onQuit={() => navigate('/browse')} />;
}

const styles = {
  tick: { width: 64, height: 64, borderRadius: 999, background: T.lime, color: '#093', fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' },
};
