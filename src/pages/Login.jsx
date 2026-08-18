import { useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { FAMILY } from '../data/family.js';
import { T } from '../lib/theme.js';

const FP_KEY = 'stride-fp';

export default function Login() {
  const [password, setPassword] = useState(() => {
    try {
      return localStorage.getItem(FP_KEY) || '';
    } catch {
      return '';
    }
  });
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);

  const rememberPw = (pw) => {
    try {
      localStorage.setItem(FP_KEY, pw);
    } catch {
      /* ignore */
    }
  };

  const pick = async (member) => {
    setError(null);
    if (!supabaseConfigured) {
      setError('Supabase isn’t configured yet (add your keys in Vercel).');
      return;
    }
    if (!password.trim()) {
      setError('Type the family password first, then tap your name.');
      return;
    }
    setBusy(member.id);
    const creds = { email: member.email, password: password.trim() };

    // Try to sign in first.
    let { error: signInErr } = await supabase.auth.signInWithPassword(creds);

    // If that account doesn't exist yet, create it, which also signs us in.
    if (signInErr) {
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp(creds);
      if (signUpErr) {
        setBusy(null);
        setError(
          'That didn’t work — usually it means the family password is different from the one this profile was set up with. Check the password, or reset this profile in Supabase.'
        );
        return;
      }
      // If email confirmation is on, signUp won't create a session — tell the user.
      if (!signUpData?.session) {
        const retry = await supabase.auth.signInWithPassword(creds);
        if (retry.error) {
          setBusy(null);
          setError('Almost there — in Supabase, turn OFF “Confirm email” (Authentication → Providers → Email), then try again.');
          return;
        }
      }
    }

    rememberPw(password.trim());
    // AuthContext picks up the new session automatically.
  };

  return (
    <div className="center-screen">
      <div style={styles.brand}>
        <div style={styles.logo}>STRIDE</div>
        <div style={styles.tag}>Who’s training?</div>
      </div>

      <div style={styles.tiles}>
        {FAMILY.map((m) => (
          <button key={m.id} style={styles.tile} disabled={busy && busy !== m.id} onClick={() => pick(m)}>
            <span style={{ ...styles.avatar, background: m.color }}>
              {busy === m.id ? <span style={styles.tileSpin} /> : m.emoji}
            </span>
            <span style={styles.tileName}>{m.name}</span>
          </button>
        ))}
      </div>

      <div style={styles.pwWrap}>
        <label style={styles.pwLabel}>Family password</label>
        <input
          className="input"
          type="password"
          value={password}
          placeholder="Type it once — we’ll remember it here"
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="off"
        />
        {error && <div style={styles.error}>{error}</div>}
        <p style={styles.fine}>Enter the shared password once, then just tap your name to sign in.</p>
      </div>
    </div>
  );
}

const styles = {
  brand: { textAlign: 'center', marginBottom: 26 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 64, letterSpacing: 2, color: T.pink, lineHeight: 1 },
  tag: { color: 'var(--muted)', fontSize: 16, marginTop: 2, fontWeight: 600 },
  tiles: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 26 },
  tile: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 92 },
  avatar: { width: 76, height: 76, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, color: '#fff', boxShadow: 'var(--shadow)' },
  tileName: { fontWeight: 700, fontSize: 15 },
  tileSpin: { width: 24, height: 24, border: '3px solid rgba(255,255,255,0.5)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' },
  pwWrap: { width: '100%', maxWidth: 340 },
  pwLabel: { display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--muted)', marginBottom: 6 },
  error: { color: '#c0263a', fontSize: 13, background: '#fdecef', padding: '9px 11px', borderRadius: 10, marginTop: 10, lineHeight: 1.4 },
  fine: { color: 'var(--muted)', fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 1.4 },
};
