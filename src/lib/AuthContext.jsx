import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileChecked, setProfileChecked] = useState(false); // has a profile fetch completed?
  const [profileError, setProfileError] = useState(false); // did the fetch fail (network/RLS)?

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setProfileError(false);
      setProfileChecked(true);
      return;
    }
    // Retry once — a transient error must NOT be mistaken for "no account",
    // which would wrongly push an existing user back into onboarding.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (!error) {
        setProfile(data || null);
        setProfileError(false);
        setProfileChecked(true);
        return;
      }
      if (attempt === 0) await new Promise((r) => setTimeout(r, 700));
    }
    // Both attempts failed — keep whatever we had and flag the error so the UI
    // can offer a retry instead of silently sending them to onboarding.
    setProfileError(true);
    setProfileChecked(true);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadProfile(data.session?.user?.id);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setProfileChecked(false);
      await loadProfile(newSession?.user?.id);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(() => loadProfile(session?.user?.id), [loadProfile, session]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileChecked(true);
  }, []);

  const value = {
    session,
    user: session?.user || null,
    profile,
    loading,
    profileChecked,
    profileError,
    refreshProfile,
    setProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
