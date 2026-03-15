import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  TrackId,
  TrackProgress,
  UserSettings,
  StreakData,
  ReadingHistory,
  QuizResult,
  Language,
  Theme,
  FontSize,
} from '../types';
import { config } from '../constants/config';

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

const initialStreak: StreakData = {
  current: 0,
  longest: 0,
  lastReadDate: null,
  freezesAvailable: config.maxStreakFreezes,
  freezesUsed: [],
};

const initialSettings: UserSettings = {
  fontSize: 'medium',
  theme: 'light',
  language: 'en',
  showSetting: true,
};

export const defaultTrackProgress: TrackProgress = {
  currentReading: 1,
  completedReadings: [],
  readingHistory: {} as ReadingHistory,
  quizResults: [],
};

function getTrackProgress(state: AppState & AppActions): TrackProgress {
  return state.tracks[state.activeTrack] ?? defaultTrackProgress;
}

interface AppActions {
  setActiveTrack: (trackId: TrackId) => void;
  markComplete: (readingId: number) => void;
  syncStreak: () => void;
  useStreakFreeze: () => boolean;
  addXP: (amount: number) => void;
  addQuizResult: (result: QuizResult) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: FontSize) => void;
  resetProgress: () => void;
  setUser: (userId: string, email: string | null) => void;
  clearUser: () => void;
  setSyncStatus: (syncing: boolean) => void;
}

// Debounce timer for cloud push
let pushTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const state = useAppStore.getState();
    if (!state.userId) return;
    try {
      const { pushProgress } = await import('../lib/sync');
      const { supabase } = await import('../lib/supabase');
      state.setSyncStatus(true);
      const success = await pushProgress(supabase, state);
      if (success) {
        useAppStore.setState({ lastSyncedAt: new Date().toISOString() });
      }
      state.setSyncStatus(false);
    } catch {
      state.setSyncStatus(false);
    }
  }, 2000);
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      activeTrack: 'vachanamrut' as TrackId,
      tracks: {
        vachanamrut: { ...defaultTrackProgress },
      },
      streak: initialStreak,
      settings: initialSettings,
      xp: 0,
      startDate: null,
      userId: null,
      userEmail: null,
      lastSyncedAt: null,
      isSyncing: false,

      setUser: (userId: string, email: string | null) => {
        set({ userId, userEmail: email });
      },

      clearUser: () => {
        set({ userId: null, userEmail: null, lastSyncedAt: null, isSyncing: false });
      },

      setSyncStatus: (syncing: boolean) => {
        set({ isSyncing: syncing });
      },

      setActiveTrack: (trackId: TrackId) => {
        set({ activeTrack: trackId });
      },

      markComplete: (readingId: number) => {
        const state = get();
        const track = getTrackProgress(state);
        if (track.completedReadings.includes(readingId)) return;

        const today = getToday();
        const newCompleted = [...track.completedReadings, readingId];
        const newHistory = { ...track.readingHistory, [today]: readingId };
        const newCurrent = Math.max(track.currentReading, readingId + 1);
        const startDate = state.startDate || today;

        // Update streak
        const streak = { ...state.streak };
        const lastRead = streak.lastReadDate;

        if (lastRead === today) {
          // Already read today, no streak change
        } else if (lastRead === getYesterday()) {
          streak.current += 1;
        } else {
          streak.current = 1;
        }

        streak.lastReadDate = today;
        streak.longest = Math.max(streak.longest, streak.current);

        // Calculate XP
        let xpGain = config.xp.readingComplete;
        if (streak.current === 7) xpGain += config.xp.streakBonus7;
        if (streak.current === 30) xpGain += config.xp.streakBonus30;

        set({
          tracks: {
            ...state.tracks,
            [state.activeTrack]: {
              currentReading: newCurrent,
              completedReadings: newCompleted,
              readingHistory: newHistory,
              quizResults: track.quizResults,
            },
          },
          streak,
          xp: state.xp + xpGain,
          startDate,
        });

        schedulePush();
      },

      syncStreak: () => {
        const state = get();
        const today = getToday();
        const yesterday = getYesterday();
        const lastRead = state.streak.lastReadDate;

        if (!lastRead) return;
        if (lastRead === today || lastRead === yesterday) return;

        // Streak broken
        set({
          streak: {
            ...state.streak,
            current: 0,
          },
        });
      },

      useStreakFreeze: () => {
        const state = get();
        if (state.streak.freezesAvailable <= 0) return false;

        const today = getToday();
        set({
          streak: {
            ...state.streak,
            freezesAvailable: state.streak.freezesAvailable - 1,
            freezesUsed: [...state.streak.freezesUsed, today],
            lastReadDate: today,
          },
        });
        return true;
      },

      addXP: (amount: number) => {
        set((state) => ({ xp: state.xp + amount }));
      },

      addQuizResult: (result: QuizResult) => {
        const state = get();
        const track = getTrackProgress(state);
        set({
          tracks: {
            ...state.tracks,
            [state.activeTrack]: {
              ...track,
              quizResults: [...track.quizResults, result],
            },
          },
          xp: state.xp + result.xpEarned,
        });

        schedulePush();
      },

      updateSettings: (newSettings: Partial<UserSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      setLanguage: (language: Language) => {
        set((state) => ({
          settings: { ...state.settings, language },
        }));
      },

      setTheme: (theme: Theme) => {
        set((state) => ({
          settings: { ...state.settings, theme },
        }));
      },

      setFontSize: (fontSize: FontSize) => {
        set((state) => ({
          settings: { ...state.settings, fontSize },
        }));
      },

      resetProgress: () => {
        set({
          tracks: {
            vachanamrut: { ...defaultTrackProgress },
          },
          streak: initialStreak,
          xp: 0,
          startDate: null,
        });

        schedulePush();
      },
    }),
    {
      name: 'samvad-store',
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;

        if (version === 0 || !version) {
          // Migrate from old flat shape to new tracks shape
          if (state && 'currentReading' in state && !('tracks' in state)) {
            return {
              activeTrack: 'vachanamrut' as TrackId,
              tracks: {
                vachanamrut: {
                  currentReading: state.currentReading as number,
                  completedReadings: state.completedReadings as number[],
                  readingHistory: state.readingHistory as ReadingHistory,
                  quizResults: state.quizResults as QuizResult[],
                },
              },
              streak: state.streak as StreakData,
              settings: state.settings as UserSettings,
              xp: state.xp as number,
              startDate: state.startDate as string | null,
              userId: null,
              userEmail: null,
              lastSyncedAt: null,
              isSyncing: false,
            } as unknown as AppState & AppActions;
          }
          // Already has tracks but was v0 — add auth fields
          return {
            ...state,
            userId: null,
            userEmail: null,
            lastSyncedAt: null,
            isSyncing: false,
          } as unknown as AppState & AppActions;
        }

        if (version === 1) {
          // v1 → v2: add auth fields
          return {
            ...state,
            userId: null,
            userEmail: null,
            lastSyncedAt: null,
            isSyncing: false,
          } as unknown as AppState & AppActions;
        }

        return state as unknown as AppState & AppActions;
      },
      partialize: (state) => {
        const { isSyncing: _, ...rest } = state;
        return rest as AppState & AppActions;
      },
    }
  )
);

// Migrate data from old 'vachanamrut-store' key if present
(function migrateOldStoreKey() {
  try {
    const oldData = localStorage.getItem('vachanamrut-store');
    const newData = localStorage.getItem('samvad-store');
    if (oldData && !newData) {
      const parsed = JSON.parse(oldData);
      // Transform old flat state into new shape
      if (parsed.state && 'currentReading' in parsed.state) {
        const old = parsed.state;
        const migrated = {
          state: {
            activeTrack: 'vachanamrut',
            tracks: {
              vachanamrut: {
                currentReading: old.currentReading ?? 1,
                completedReadings: old.completedReadings ?? [],
                readingHistory: old.readingHistory ?? {},
                quizResults: old.quizResults ?? [],
              },
            },
            streak: old.streak ?? initialStreak,
            settings: old.settings ?? initialSettings,
            xp: old.xp ?? 0,
            startDate: old.startDate ?? null,
            userId: null,
            userEmail: null,
            lastSyncedAt: null,
            isSyncing: false,
          },
          version: 2,
        };
        localStorage.setItem('samvad-store', JSON.stringify(migrated));
      }
    }
  } catch {
    // Ignore migration errors
  }
})();

// Helper hook: get active track's progress
export function useActiveTrackProgress(): TrackProgress {
  return useAppStore((s) => s.tracks[s.activeTrack] ?? defaultTrackProgress);
}
