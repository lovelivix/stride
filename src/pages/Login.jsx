import { useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { T } from '../lib/theme.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendLink = async (e) => {
    e.preventDefault();
    setError(null);
    if (!supabaseConfigured) {
      setError('Supabase isn’t configured yet. Add your keys to the .env file (see SETUP.md).');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="center-screen">
      <div style={styles.brand}>
        <div style={styles.logo}>STRIDE</div>
        <div style={styles.tag}>Family strength, tracked properly.</div>
      </div>

      {sent ? (
        <div className="card" style={styles.card}>
          <div style={{ fontSize: 40, textAlign: 'center' }}>📬</div>
          <h2 style={{ fontSize: 26, textAlign: 'center', marginTop: 8 }}>Check your email</h2>
          <p style={styles.muted}>
            We sent a magic link to <strong>{email}</strong>. Tap it on this device to sign in — no password needed.
          </p>
          <button className="btn btn-ghost" onClick={() => setSent(false)}>Use a different email</button>
        </div>
      ) : (
        <form className="card" style={styles.card} onSubmit={sendLink}>
          <label style={styles.label}>Email address</label>
          <input
            className="input"
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          {error && <div style={styles.error}>{error}</div>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Send magic link'}
          </button>
          <p style={styles.fine}>We’ll email you a secure link to sign in. Nothing to remember.</p>
        </form>
      )}
    </div>
  );
}

const styles = {
  brand: { textAlign: 'center', marginBottom: 28 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 2, color: T.pink, lineHeight: 1 },
  tag: { color: 'var(--muted)', fontSize: 15, marginTop: 2 },
  card: { width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 12 },
  label: { fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--muted)' },
  muted: { color: 'var(--muted)', fontSize: 14, lineHeight: 1.5, textAlign: 'center' },
  fine: { color: 'var(--muted)', fontSize: 12, textAlign: 'center', margin: 0 },
  error: { color: '#c0263a', fontSize: 13, background: '#fdecef', padding: '9px 11px', borderRadius: 10 },
};
