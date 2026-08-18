import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext.jsx';
import { supabase } from '../lib/supabase.js';
import { getAmrap } from '../data/amrapWorkouts.js';
import AmrapPlayer from '../components/workout/AmrapPlayer.jsx';
import { T } from '../lib/theme.js';

export default function AmrapSession() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const workout = getAmrap(id);
  const [result, setResult] = useState(null); // { rounds, mins }

  if (!workout) {
    return (
      <div className="page-no-nav">
        <p className="muted">Workout not found.</p>
        <button className="btn" onClick={() => navigate('/browse')}>Back to workouts</button>
      </div>
    );
  }

  const handleComplete = async (rounds, mins) => {
    if (user) {
      await supabase.from('sessions').insert({
        user_id: user.id,
        workout_id: workout.id,
        programme_id: profile?.programme_id || 'library',
        duration_mins: mins,
        location: 'home',
        notes: `${rounds} rounds`,
        total_volume_kg: 0,
      });
    }
    setResult({ rounds, mins });
  };

  if (result) {
    return (
      <div className="page-no-nav">
        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <div style={styles.tick}>✓</div>
          <h1 style={{ fontSize: 38, marginTop: 8 }}>Time!</h1>
          <div style={styles.big}>{result.rounds}</div>
          <div className="muted" style={{ fontSize: 15, marginBottom: 6 }}>rounds in {result.mins} minutes</div>
          <p className="muted" style={{ fontSize: 13, margin: '0 0 20px' }}>
            Logged to your history — beat it next time. 🔥
          </p>
          <button className="btn" onClick={() => navigate('/browse')}>Back to workouts</button>
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => navigate('/today')}>Home</button>
        </div>
      </div>
    );
  }

  return <AmrapPlayer workout={workout} onComplete={handleComplete} onQuit={() => navigate('/browse')} />;
}

const styles = {
  tick: { width: 64, height: 64, borderRadius: 999, background: T.lime, color: '#093', fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' },
  big: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, color: T.pink, lineHeight: 1 },
};
