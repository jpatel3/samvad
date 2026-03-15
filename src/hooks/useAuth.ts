import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import { pullProgress, mergeProgress, pushProgress } from '../lib/sync';

export function useAuth() {
  const setUser = useAppStore((s) => s.setUser);
  const clearUser = useAppStore((s) => s.clearUser);
  const userId = useAppStore((s) => s.userId);
  const userEmail = useAppStore((s) => s.userEmail);

  // Restore session on mount + listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user.id, session.user.email ?? null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user.id, session.user.email ?? null);
      } else {
        clearUser();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, clearUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      setUser(data.user.id, data.user.email ?? null);
      await pullAndMerge(data.user.id);
    }
  }, [setUser]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      setUser(data.user.id, data.user.email ?? null);
      // Push local progress to cloud for new account
      const state = useAppStore.getState();
      await pushProgress(supabase, { ...state, userId: data.user.id });
    }
  }, [setUser]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearUser();
  }, [clearUser]);

  return {
    userId,
    userEmail,
    isSignedIn: !!userId,
    signIn,
    signUp,
    signOut,
  };
}

async function pullAndMerge(userId: string) {
  const cloud = await pullProgress(supabase, userId);
  if (!cloud) return;

  const state = useAppStore.getState();
  const merged = mergeProgress(
    {
      activeTrack: state.activeTrack,
      tracks: state.tracks,
      streak: state.streak,
      settings: state.settings,
      xp: state.xp,
      startDate: state.startDate,
    },
    cloud,
  );

  useAppStore.setState({
    ...merged,
    lastSyncedAt: new Date().toISOString(),
  });

  // Push merged state back to cloud
  const updatedState = useAppStore.getState();
  await pushProgress(supabase, updatedState);
}
