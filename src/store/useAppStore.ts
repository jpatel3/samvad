import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
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

interface AppActions {
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
}

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      currentReading: 1,
      completedReadings: [],
      readingHistory: {} as ReadingHistory,
      streak: initialStreak,
      settings: initialSettings,
      xp: 0,
      quizResults: [],
      startDate: null,

      markComplete: (readingId: number) => {
        const state = get();
        if (state.completedReadings.includes(readingId)) return;

        const today = getToday();
        const newCompleted = [...state.completedReadings, readingId];
        const newHistory = { ...state.readingHistory, [today]: readingId };
        const newCurrent = Math.max(state.currentReading, readingId + 1);
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
          completedReadings: newCompleted,
          readingHistory: newHistory,
          currentReading: newCurrent,
          streak,
          xp: state.xp + xpGain,
          startDate,
        });
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
        set((state) => ({
          quizResults: [...state.quizResults, result],
          xp: state.xp + result.xpEarned,
        }));
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
          currentReading: 1,
          completedReadings: [],
          readingHistory: {},
          streak: initialStreak,
          xp: 0,
          quizResults: [],
          startDate: null,
        });
      },
    }),
    {
      name: 'vachanamrut-store',
    }
  )
);
