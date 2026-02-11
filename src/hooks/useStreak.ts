import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useStreak() {
  const streak = useAppStore((s) => s.streak);
  const syncStreak = useAppStore((s) => s.syncStreak);
  const useStreakFreeze = useAppStore((s) => s.useStreakFreeze);

  // Sync streak on mount and when tab becomes visible
  useEffect(() => {
    syncStreak();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncStreak();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [syncStreak]);

  return {
    current: streak.current,
    longest: streak.longest,
    lastReadDate: streak.lastReadDate,
    freezesAvailable: streak.freezesAvailable,
    useFreeze: useStreakFreeze,
    isActiveToday: streak.lastReadDate === new Date().toISOString().split('T')[0],
  };
}
