import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/useAppStore';
import { pushProgress, pullProgress, mergeProgress } from '../lib/sync';

const DEBOUNCE_MS = 2000;

export function useSync() {
  const userId = useAppStore((s) => s.userId);
  const isSyncing = useAppStore((s) => s.isSyncing);
  const setSyncStatus = useAppStore((s) => s.setSyncStatus);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pull on tab visibility change (foreground)
  useEffect(() => {
    if (!userId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && userId) {
        pull(userId, setSyncStatus);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [userId, setSyncStatus]);

  // Debounced push
  const debouncedPush = useCallback(() => {
    if (!userId) return;

    if (pushTimerRef.current) {
      clearTimeout(pushTimerRef.current);
    }

    pushTimerRef.current = setTimeout(async () => {
      const state = useAppStore.getState();
      if (!state.userId) return;
      setSyncStatus(true);
      const success = await pushProgress(supabase, state);
      if (success) {
        useAppStore.setState({ lastSyncedAt: new Date().toISOString() });
      }
      setSyncStatus(false);
    }, DEBOUNCE_MS);
  }, [userId, setSyncStatus]);

  useEffect(() => {
    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, []);

  return { debouncedPush, isSyncing };
}

async function pull(userId: string, setSyncStatus: (syncing: boolean) => void) {
  setSyncStatus(true);
  try {
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
  } catch (err) {
    console.warn('[sync] pull on foreground failed:', err);
  } finally {
    setSyncStatus(false);
  }
}
