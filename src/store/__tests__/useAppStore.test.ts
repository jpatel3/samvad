// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { StreakData, ReadingHistory, QuizResult, UserSettings, TrackId } from '../../types';

// Mock config to avoid import.meta.env issues in test
vi.mock('../../constants/config', () => ({
  config: {
    xp: {
      readingComplete: 10,
      quizCorrectEasy: 5,
      quizCorrectMedium: 10,
      quizPerfectScore: 15,
      streakBonus7: 20,
      streakBonus30: 50,
    },
    maxStreakFreezes: 3,
    freezeRefillDays: 30,
  },
}));

// Mock the sync module to prevent real imports
vi.mock('../../lib/sync', () => ({
  pushProgress: vi.fn().mockResolvedValue(true),
}));

// Mock supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {},
}));

// Dynamically import the store after mocks are in place
const { useAppStore } = await import('../useAppStore');

function resetStore() {
  useAppStore.setState({
    activeTrack: 'vachanamrut' as TrackId,
    tracks: {
      vachanamrut: {
        currentReading: 1,
        completedReadings: [],
        readingHistory: {} as ReadingHistory,
        quizResults: [],
      },
    },
    streak: {
      current: 0,
      longest: 0,
      lastReadDate: null,
      freezesAvailable: 3,
      freezesUsed: [],
    },
    settings: {
      fontSize: 'medium',
      theme: 'light',
      language: 'en',
      showSetting: true,
    } as UserSettings,
    xp: 0,
    startDate: null,
    userId: null,
    userEmail: null,
    lastSyncedAt: null,
    isSyncing: false,
  });
}

beforeEach(() => {
  resetStore();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// ---------- Auth actions ----------

describe('auth actions', () => {
  it('setUser sets userId and email', () => {
    useAppStore.getState().setUser('user-123', 'test@example.com');
    const state = useAppStore.getState();
    expect(state.userId).toBe('user-123');
    expect(state.userEmail).toBe('test@example.com');
  });

  it('clearUser clears auth but preserves progress', () => {
    const store = useAppStore.getState();
    store.setUser('user-123', 'test@example.com');
    store.addXP(100);

    store.clearUser();
    const state = useAppStore.getState();
    expect(state.userId).toBeNull();
    expect(state.userEmail).toBeNull();
    expect(state.lastSyncedAt).toBeNull();
    expect(state.isSyncing).toBe(false);
    // Progress preserved
    expect(state.xp).toBe(100);
  });

  it('setSyncStatus updates isSyncing', () => {
    useAppStore.getState().setSyncStatus(true);
    expect(useAppStore.getState().isSyncing).toBe(true);
    useAppStore.getState().setSyncStatus(false);
    expect(useAppStore.getState().isSyncing).toBe(false);
  });
});

// ---------- markComplete ----------

describe('markComplete', () => {
  it('adds reading to completedReadings and updates currentReading', () => {
    // Mock today
    vi.setSystemTime(new Date('2025-01-15'));

    useAppStore.getState().markComplete(1);
    const track = useAppStore.getState().tracks.vachanamrut!;
    expect(track.completedReadings).toContain(1);
    expect(track.currentReading).toBe(2);
  });

  it('does not duplicate already completed readings', () => {
    vi.setSystemTime(new Date('2025-01-15'));

    useAppStore.getState().markComplete(1);
    useAppStore.getState().markComplete(1);
    const track = useAppStore.getState().tracks.vachanamrut!;
    expect(track.completedReadings.filter((r) => r === 1)).toHaveLength(1);
  });

  it('increments streak when reading on consecutive days', () => {
    vi.setSystemTime(new Date('2025-01-15'));
    useAppStore.getState().markComplete(1);
    expect(useAppStore.getState().streak.current).toBe(1);

    vi.setSystemTime(new Date('2025-01-16'));
    useAppStore.getState().markComplete(2);
    expect(useAppStore.getState().streak.current).toBe(2);
  });

  it('resets streak to 1 when gap in reading days', () => {
    vi.setSystemTime(new Date('2025-01-15'));
    useAppStore.getState().markComplete(1);

    vi.setSystemTime(new Date('2025-01-18')); // 3-day gap
    useAppStore.getState().markComplete(2);
    expect(useAppStore.getState().streak.current).toBe(1);
  });

  it('does not change streak on same-day second reading', () => {
    vi.setSystemTime(new Date('2025-01-15'));
    useAppStore.getState().markComplete(1);
    expect(useAppStore.getState().streak.current).toBe(1);

    useAppStore.getState().markComplete(2);
    expect(useAppStore.getState().streak.current).toBe(1);
  });

  it('awards base XP on completion', () => {
    vi.setSystemTime(new Date('2025-01-15'));
    useAppStore.getState().markComplete(1);
    expect(useAppStore.getState().xp).toBe(10);
  });

  it('sets startDate on first completion', () => {
    vi.setSystemTime(new Date('2025-01-15'));
    expect(useAppStore.getState().startDate).toBeNull();
    useAppStore.getState().markComplete(1);
    expect(useAppStore.getState().startDate).toBe('2025-01-15');
  });

  it('does not overwrite existing startDate', () => {
    vi.setSystemTime(new Date('2025-01-10'));
    useAppStore.getState().markComplete(1);

    vi.setSystemTime(new Date('2025-01-11'));
    useAppStore.getState().markComplete(2);
    expect(useAppStore.getState().startDate).toBe('2025-01-10');
  });

  it('updates readingHistory with today entry', () => {
    vi.setSystemTime(new Date('2025-01-15'));
    useAppStore.getState().markComplete(5);
    const history = useAppStore.getState().tracks.vachanamrut!.readingHistory;
    expect(history['2025-01-15']).toBe(5);
  });
});

// ---------- addQuizResult ----------

describe('addQuizResult', () => {
  it('appends quiz result to track', () => {
    const result: QuizResult = {
      readingId: 1,
      score: 4,
      totalQuestions: 5,
      xpEarned: 20,
      date: '2025-01-15',
    };

    useAppStore.getState().addQuizResult(result);
    const track = useAppStore.getState().tracks.vachanamrut!;
    expect(track.quizResults).toHaveLength(1);
    expect(track.quizResults[0]).toEqual(result);
  });

  it('adds xpEarned to total XP', () => {
    const result: QuizResult = {
      readingId: 1,
      score: 5,
      totalQuestions: 5,
      xpEarned: 25,
      date: '2025-01-15',
    };

    useAppStore.getState().addQuizResult(result);
    expect(useAppStore.getState().xp).toBe(25);
  });
});

// ---------- syncStreak ----------

describe('syncStreak', () => {
  it('resets streak when lastReadDate is stale', () => {
    vi.setSystemTime(new Date('2025-01-20'));

    useAppStore.setState({
      streak: {
        current: 5,
        longest: 10,
        lastReadDate: '2025-01-15', // 5 days ago
        freezesAvailable: 3,
        freezesUsed: [],
      },
    });

    useAppStore.getState().syncStreak();
    expect(useAppStore.getState().streak.current).toBe(0);
  });

  it('does not reset when lastReadDate is today', () => {
    vi.setSystemTime(new Date('2025-01-15'));

    useAppStore.setState({
      streak: {
        current: 5,
        longest: 10,
        lastReadDate: '2025-01-15',
        freezesAvailable: 3,
        freezesUsed: [],
      },
    });

    useAppStore.getState().syncStreak();
    expect(useAppStore.getState().streak.current).toBe(5);
  });

  it('does not reset when lastReadDate is yesterday', () => {
    vi.setSystemTime(new Date('2025-01-16'));

    useAppStore.setState({
      streak: {
        current: 5,
        longest: 10,
        lastReadDate: '2025-01-15',
        freezesAvailable: 3,
        freezesUsed: [],
      },
    });

    useAppStore.getState().syncStreak();
    expect(useAppStore.getState().streak.current).toBe(5);
  });

  it('no-op when lastReadDate is null', () => {
    useAppStore.setState({
      streak: {
        current: 0,
        longest: 0,
        lastReadDate: null,
        freezesAvailable: 3,
        freezesUsed: [],
      },
    });

    useAppStore.getState().syncStreak();
    expect(useAppStore.getState().streak.current).toBe(0);
  });
});

// ---------- Migration ----------

describe('store migration', () => {
  it('v0 flat state → v2 with tracks and auth fields', () => {
    // Simulate v0 persisted data
    const v0State = {
      state: {
        currentReading: 5,
        completedReadings: [1, 2, 3, 4],
        readingHistory: { '2025-01-01': 1 },
        quizResults: [],
        streak: { current: 3, longest: 5, lastReadDate: '2025-01-04', freezesAvailable: 3, freezesUsed: [] },
        settings: { fontSize: 'medium', theme: 'light', language: 'en', showSetting: true },
        xp: 40,
        startDate: '2025-01-01',
      },
      version: 0,
    };
    localStorage.setItem('samvad-store', JSON.stringify(v0State));

    // Re-create store to trigger migration
    useAppStore.persist.rehydrate();

    const state = useAppStore.getState();
    expect(state.activeTrack).toBe('vachanamrut');
    expect(state.tracks.vachanamrut?.currentReading).toBe(5);
    expect(state.tracks.vachanamrut?.completedReadings).toEqual([1, 2, 3, 4]);
    expect(state.userId).toBeNull();
    expect(state.userEmail).toBeNull();
  });

  it('v1 → v2 adds auth fields', () => {
    const v1State = {
      state: {
        activeTrack: 'vachanamrut',
        tracks: {
          vachanamrut: {
            currentReading: 3,
            completedReadings: [1, 2],
            readingHistory: {},
            quizResults: [],
          },
        },
        streak: { current: 1, longest: 1, lastReadDate: '2025-01-10', freezesAvailable: 3, freezesUsed: [] },
        settings: { fontSize: 'medium', theme: 'dark', language: 'en', showSetting: true },
        xp: 20,
        startDate: '2025-01-10',
      },
      version: 1,
    };
    localStorage.setItem('samvad-store', JSON.stringify(v1State));
    useAppStore.persist.rehydrate();

    const state = useAppStore.getState();
    expect(state.userId).toBeNull();
    expect(state.lastSyncedAt).toBeNull();
    expect(state.isSyncing).toBe(false);
    // Existing data preserved
    expect(state.xp).toBe(20);
    expect(state.settings.theme).toBe('dark');
  });

  it('v2 passes through unchanged', () => {
    const v2State = {
      state: {
        activeTrack: 'vachanamrut',
        tracks: {
          vachanamrut: {
            currentReading: 10,
            completedReadings: [1, 2, 3],
            readingHistory: { '2025-01-01': 1 },
            quizResults: [],
          },
        },
        streak: { current: 2, longest: 5, lastReadDate: '2025-01-12', freezesAvailable: 2, freezesUsed: ['2025-01-05'] },
        settings: { fontSize: 'large', theme: 'dark', language: 'gu', showSetting: false },
        xp: 150,
        startDate: '2025-01-01',
        userId: 'user-abc',
        userEmail: 'abc@test.com',
        lastSyncedAt: '2025-01-12T00:00:00Z',
        isSyncing: false,
      },
      version: 2,
    };
    localStorage.setItem('samvad-store', JSON.stringify(v2State));
    useAppStore.persist.rehydrate();

    const state = useAppStore.getState();
    expect(state.userId).toBe('user-abc');
    expect(state.xp).toBe(150);
    expect(state.settings.language).toBe('gu');
  });
});

// ---------- schedulePush ----------

describe('schedulePush (via markComplete)', () => {
  it('debounces push calls', async () => {
    const { pushProgress } = await import('../../lib/sync');
    vi.setSystemTime(new Date('2025-01-15'));
    useAppStore.getState().setUser('user-123', 'test@example.com');

    useAppStore.getState().markComplete(1);
    useAppStore.getState().markComplete(2);

    // Timer hasn't fired yet
    expect(pushProgress).not.toHaveBeenCalled();

    // Advance past debounce (2000ms)
    await vi.advanceTimersByTimeAsync(2500);

    // Should have been called once (debounced)
    expect(pushProgress).toHaveBeenCalledTimes(1);
  });

  it('skips push in guest mode (no userId)', async () => {
    const { pushProgress } = await import('../../lib/sync');
    vi.mocked(pushProgress).mockClear();
    vi.setSystemTime(new Date('2025-01-15'));

    // No user set
    useAppStore.getState().markComplete(1);
    await vi.advanceTimersByTimeAsync(2500);

    expect(pushProgress).not.toHaveBeenCalled();
  });
});
