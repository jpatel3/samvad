import { describe, it, expect } from 'vitest';
import { mergeProgress } from '../sync';
import type { TrackId, TrackProgress, StreakData, UserSettings } from '../../types';
import {
  makeTrackProgress,
  makeStreakData,
  makeSettings,
  makeQuizResult,
  makeCloudProfile,
  makeCloudTrack,
} from './fixtures';

// Helper to build the local state shape that mergeProgress expects
function makeLocal(overrides: {
  activeTrack?: TrackId;
  tracks?: Partial<Record<TrackId, TrackProgress>>;
  streak?: StreakData;
  settings?: UserSettings;
  xp?: number;
  startDate?: string | null;
  settingsUpdatedAt?: string;
} = {}) {
  return {
    activeTrack: overrides.activeTrack ?? 'vachanamrut' as TrackId,
    tracks: overrides.tracks ?? { vachanamrut: makeTrackProgress() },
    streak: overrides.streak ?? makeStreakData(),
    settings: overrides.settings ?? makeSettings(),
    xp: overrides.xp ?? 0,
    startDate: overrides.startDate ?? null,
    settingsUpdatedAt: overrides.settingsUpdatedAt,
  };
}

// ---------- Track Merging ----------

describe('mergeProgress — track merging', () => {
  it('preserves local-only tracks not in cloud', () => {
    const local = makeLocal({
      tracks: {
        vachanamrut: makeTrackProgress({ currentReading: 5 }),
        gita: makeTrackProgress({ currentReading: 3 }),
      },
    });
    const cloud = {
      profile: makeCloudProfile(),
      tracks: [makeCloudTrack({ track_id: 'vachanamrut', current_reading: 2 })],
    };

    const result = mergeProgress(local, cloud);
    expect(result.tracks.gita).toEqual(makeTrackProgress({ currentReading: 3 }));
  });

  it('adopts cloud-only tracks', () => {
    const local = makeLocal({
      tracks: { vachanamrut: makeTrackProgress() },
    });
    const cloud = {
      profile: makeCloudProfile(),
      tracks: [
        makeCloudTrack({ track_id: 'vachanamrut', current_reading: 1 }),
        makeCloudTrack({ track_id: 'gita', current_reading: 7, completed_readings: [1, 2, 3] }),
      ],
    };

    const result = mergeProgress(local, cloud);
    expect(result.tracks.gita).toEqual({
      currentReading: 7,
      completedReadings: [1, 2, 3],
      readingHistory: {},
      quizResults: [],
    });
  });

  it('unions completedReadings without duplicates', () => {
    const local = makeLocal({
      tracks: {
        vachanamrut: makeTrackProgress({ completedReadings: [1, 2, 3] }),
      },
    });
    const cloud = {
      profile: makeCloudProfile(),
      tracks: [makeCloudTrack({ track_id: 'vachanamrut', completed_readings: [2, 3, 4, 5] })],
    };

    const result = mergeProgress(local, cloud);
    const completed = result.tracks.vachanamrut!.completedReadings;
    expect(completed).toHaveLength(5);
    expect(new Set(completed)).toEqual(new Set([1, 2, 3, 4, 5]));
  });

  it('takes max currentReading', () => {
    const local = makeLocal({
      tracks: { vachanamrut: makeTrackProgress({ currentReading: 10 }) },
    });
    const cloud = {
      profile: makeCloudProfile(),
      tracks: [makeCloudTrack({ track_id: 'vachanamrut', current_reading: 5 })],
    };

    expect(mergeProgress(local, cloud).tracks.vachanamrut!.currentReading).toBe(10);

    // Reverse: cloud is higher
    const local2 = makeLocal({
      tracks: { vachanamrut: makeTrackProgress({ currentReading: 3 }) },
    });
    const cloud2 = {
      profile: makeCloudProfile(),
      tracks: [makeCloudTrack({ track_id: 'vachanamrut', current_reading: 8 })],
    };

    expect(mergeProgress(local2, cloud2).tracks.vachanamrut!.currentReading).toBe(8);
  });

  it('merges readingHistory keeping higher readingId per date', () => {
    const local = makeLocal({
      tracks: {
        vachanamrut: makeTrackProgress({
          readingHistory: { '2025-01-01': 3, '2025-01-02': 5 },
        }),
      },
    });
    const cloud = {
      profile: makeCloudProfile(),
      tracks: [
        makeCloudTrack({
          track_id: 'vachanamrut',
          reading_history: { '2025-01-01': 4, '2025-01-03': 6 },
        }),
      ],
    };

    const history = mergeProgress(local, cloud).tracks.vachanamrut!.readingHistory;
    expect(history['2025-01-01']).toBe(4); // cloud higher
    expect(history['2025-01-02']).toBe(5); // local only
    expect(history['2025-01-03']).toBe(6); // cloud only
  });

  it('deduplicates quizResults by readingId+date', () => {
    const sharedQuiz = makeQuizResult({ readingId: 1, date: '2025-01-01', score: 3 });
    const localOnlyQuiz = makeQuizResult({ readingId: 2, date: '2025-01-02', score: 5 });
    const cloudOnlyQuiz = makeQuizResult({ readingId: 3, date: '2025-01-03', score: 4 });

    const local = makeLocal({
      tracks: {
        vachanamrut: makeTrackProgress({
          quizResults: [sharedQuiz, localOnlyQuiz],
        }),
      },
    });
    const cloud = {
      profile: makeCloudProfile(),
      tracks: [
        makeCloudTrack({
          track_id: 'vachanamrut',
          quiz_results: [sharedQuiz, cloudOnlyQuiz],
        }),
      ],
    };

    const results = mergeProgress(local, cloud).tracks.vachanamrut!.quizResults;
    expect(results).toHaveLength(3);
    const keys = results.map((r) => `${r.readingId}:${r.date}`);
    expect(new Set(keys).size).toBe(3);
  });

  it('handles empty local with populated cloud', () => {
    const local = makeLocal({ tracks: {} });
    const cloud = {
      profile: makeCloudProfile({ xp: 100 }),
      tracks: [
        makeCloudTrack({
          track_id: 'vachanamrut',
          current_reading: 10,
          completed_readings: [1, 2, 3],
          quiz_results: [makeQuizResult()],
        }),
      ],
    };

    const result = mergeProgress(local, cloud);
    expect(result.tracks.vachanamrut!.currentReading).toBe(10);
    expect(result.tracks.vachanamrut!.completedReadings).toEqual([1, 2, 3]);
    expect(result.tracks.vachanamrut!.quizResults).toHaveLength(1);
  });

  it('handles null cloud arrays gracefully', () => {
    const local = makeLocal({
      tracks: { vachanamrut: makeTrackProgress({ completedReadings: [1] }) },
    });
    const cloud = {
      profile: makeCloudProfile(),
      tracks: [
        makeCloudTrack({
          track_id: 'vachanamrut',
          completed_readings: null as unknown as number[],
          reading_history: null as unknown as Record<string, number>,
          quiz_results: null as unknown as never[],
        }),
      ],
    };

    const result = mergeProgress(local, cloud);
    expect(result.tracks.vachanamrut!.completedReadings).toEqual([1]);
  });
});

// ---------- Streak Merging ----------

describe('mergeProgress — streak merging', () => {
  it('uses more recent lastReadDate side for current streak', () => {
    const local = makeLocal({
      streak: makeStreakData({ current: 5, lastReadDate: '2025-01-10' }),
    });
    const cloud = {
      profile: makeCloudProfile({
        streak_current: 3,
        streak_last_read_date: '2025-01-12',
      }),
      tracks: [],
    };

    const streak = mergeProgress(local, cloud).streak;
    expect(streak.current).toBe(3); // cloud is more recent
    expect(streak.lastReadDate).toBe('2025-01-12');
  });

  it('uses local when local lastReadDate is more recent', () => {
    const local = makeLocal({
      streak: makeStreakData({ current: 7, lastReadDate: '2025-01-15' }),
    });
    const cloud = {
      profile: makeCloudProfile({
        streak_current: 2,
        streak_last_read_date: '2025-01-10',
      }),
      tracks: [],
    };

    const streak = mergeProgress(local, cloud).streak;
    expect(streak.current).toBe(7);
    expect(streak.lastReadDate).toBe('2025-01-15');
  });

  it('takes max longest streak', () => {
    const local = makeLocal({
      streak: makeStreakData({ longest: 15 }),
    });
    const cloud = {
      profile: makeCloudProfile({ streak_longest: 20 }),
      tracks: [],
    };

    expect(mergeProgress(local, cloud).streak.longest).toBe(20);
  });

  it('takes min freezesAvailable', () => {
    const local = makeLocal({
      streak: makeStreakData({ freezesAvailable: 2 }),
    });
    const cloud = {
      profile: makeCloudProfile({ streak_freezes_available: 1 }),
      tracks: [],
    };

    expect(mergeProgress(local, cloud).streak.freezesAvailable).toBe(1);
  });

  it('unions freezesUsed', () => {
    const local = makeLocal({
      streak: makeStreakData({ freezesUsed: ['2025-01-01', '2025-01-05'] }),
    });
    const cloud = {
      profile: makeCloudProfile({
        streak_freezes_used: ['2025-01-05', '2025-01-10'],
      }),
      tracks: [],
    };

    const used = mergeProgress(local, cloud).streak.freezesUsed;
    expect(used).toHaveLength(3);
    expect(new Set(used)).toEqual(new Set(['2025-01-01', '2025-01-05', '2025-01-10']));
  });

  it('handles null lastReadDate on both sides', () => {
    const local = makeLocal({
      streak: makeStreakData({ lastReadDate: null, current: 0 }),
    });
    const cloud = {
      profile: makeCloudProfile({ streak_last_read_date: null, streak_current: 0 }),
      tracks: [],
    };

    const streak = mergeProgress(local, cloud).streak;
    expect(streak.lastReadDate).toBeNull();
    expect(streak.current).toBe(0);
  });

  it('picks non-null lastReadDate over null', () => {
    const local = makeLocal({
      streak: makeStreakData({ lastReadDate: '2025-01-05', current: 3 }),
    });
    const cloud = {
      profile: makeCloudProfile({ streak_last_read_date: null, streak_current: 0 }),
      tracks: [],
    };

    const streak = mergeProgress(local, cloud).streak;
    expect(streak.lastReadDate).toBe('2025-01-05');
    expect(streak.current).toBe(3);
  });
});

// ---------- Other fields ----------

describe('mergeProgress — other fields', () => {
  it('takes max XP', () => {
    const local = makeLocal({ xp: 100 });
    const cloud = {
      profile: makeCloudProfile({ xp: 250 }),
      tracks: [],
    };

    expect(mergeProgress(local, cloud).xp).toBe(250);
  });

  it('takes earliest startDate', () => {
    const local = makeLocal({ startDate: '2025-01-15' });
    const cloud = {
      profile: makeCloudProfile({ start_date: '2025-01-01' }),
      tracks: [],
    };

    expect(mergeProgress(local, cloud).startDate).toBe('2025-01-01');
  });

  it('uses cloud startDate when local is null', () => {
    const local = makeLocal({ startDate: null });
    const cloud = {
      profile: makeCloudProfile({ start_date: '2025-01-01' }),
      tracks: [],
    };

    expect(mergeProgress(local, cloud).startDate).toBe('2025-01-01');
  });

  it('uses local startDate when cloud is null', () => {
    const local = makeLocal({ startDate: '2025-02-01' });
    const cloud = {
      profile: makeCloudProfile({ start_date: null }),
      tracks: [],
    };

    expect(mergeProgress(local, cloud).startDate).toBe('2025-02-01');
  });

  it('uses latest-wins for settings based on settingsUpdatedAt', () => {
    const localSettings = makeSettings({ theme: 'dark', fontSize: 'large' });
    const cloudSettings = makeSettings({ theme: 'light', fontSize: 'small' });

    // Local is newer
    const local = makeLocal({
      settings: localSettings,
      settingsUpdatedAt: '2025-01-20T00:00:00Z',
    });
    const cloud = {
      profile: makeCloudProfile({ settings: cloudSettings, updated_at: '2025-01-10T00:00:00Z' }),
      tracks: [],
    };

    expect(mergeProgress(local, cloud).settings).toEqual(localSettings);

    // Cloud is newer
    const local2 = makeLocal({
      settings: localSettings,
      settingsUpdatedAt: '2025-01-05T00:00:00Z',
    });
    const cloud2 = {
      profile: makeCloudProfile({ settings: cloudSettings, updated_at: '2025-01-10T00:00:00Z' }),
      tracks: [],
    };

    expect(mergeProgress(local2, cloud2).settings).toEqual(cloudSettings);
  });

  it('preserves local activeTrack', () => {
    const local = makeLocal({ activeTrack: 'gita' });
    const cloud = {
      profile: makeCloudProfile({ active_track: 'vachanamrut' }),
      tracks: [],
    };

    expect(mergeProgress(local, cloud).activeTrack).toBe('gita');
  });
});

// ---------- Integration scenarios ----------

describe('mergeProgress — integration scenarios', () => {
  it('different readings on two devices → both preserved (union)', () => {
    const local = makeLocal({
      tracks: {
        vachanamrut: makeTrackProgress({
          currentReading: 5,
          completedReadings: [1, 2, 3, 4],
          readingHistory: { '2025-01-01': 1, '2025-01-02': 2, '2025-01-03': 3, '2025-01-04': 4 },
        }),
      },
    });
    const cloud = {
      profile: makeCloudProfile(),
      tracks: [
        makeCloudTrack({
          track_id: 'vachanamrut',
          current_reading: 4,
          completed_readings: [1, 2, 3],
          reading_history: { '2025-01-01': 1, '2025-01-02': 2, '2025-01-03': 3 },
        }),
      ],
    };

    const result = mergeProgress(local, cloud);
    const track = result.tracks.vachanamrut!;
    expect(track.currentReading).toBe(5);
    expect(new Set(track.completedReadings)).toEqual(new Set([1, 2, 3, 4]));
    expect(track.readingHistory['2025-01-04']).toBe(4);
  });

  it('empty local + cloud progress (new device sign-in)', () => {
    const local = makeLocal({
      tracks: {},
      xp: 0,
      streak: makeStreakData(),
      startDate: null,
    });
    const cloud = {
      profile: makeCloudProfile({
        xp: 500,
        start_date: '2024-12-01',
        streak_current: 10,
        streak_longest: 30,
        streak_last_read_date: '2025-01-15',
      }),
      tracks: [
        makeCloudTrack({
          track_id: 'vachanamrut',
          current_reading: 20,
          completed_readings: Array.from({ length: 19 }, (_, i) => i + 1),
        }),
        makeCloudTrack({
          track_id: 'gita',
          current_reading: 5,
          completed_readings: [1, 2, 3, 4],
        }),
      ],
    };

    const result = mergeProgress(local, cloud);
    expect(result.xp).toBe(500);
    expect(result.startDate).toBe('2024-12-01');
    expect(result.streak.current).toBe(10);
    expect(result.tracks.vachanamrut!.currentReading).toBe(20);
    expect(result.tracks.gita!.currentReading).toBe(5);
  });

  it('multiple tracks with mixed data', () => {
    const local = makeLocal({
      tracks: {
        vachanamrut: makeTrackProgress({
          currentReading: 10,
          completedReadings: [1, 2, 3],
          quizResults: [makeQuizResult({ readingId: 1, date: '2025-01-01' })],
        }),
        gita: makeTrackProgress({
          currentReading: 3,
          completedReadings: [1, 2],
        }),
      },
      xp: 200,
    });
    const cloud = {
      profile: makeCloudProfile({ xp: 150 }),
      tracks: [
        makeCloudTrack({
          track_id: 'vachanamrut',
          current_reading: 8,
          completed_readings: [1, 2, 4, 5],
          quiz_results: [makeQuizResult({ readingId: 2, date: '2025-01-02' })],
        }),
        makeCloudTrack({
          track_id: 'upanishad',
          current_reading: 2,
          completed_readings: [1],
        }),
      ],
    };

    const result = mergeProgress(local, cloud);
    // vachanamrut: merged
    expect(result.tracks.vachanamrut!.currentReading).toBe(10);
    expect(new Set(result.tracks.vachanamrut!.completedReadings)).toEqual(new Set([1, 2, 3, 4, 5]));
    expect(result.tracks.vachanamrut!.quizResults).toHaveLength(2);
    // gita: local only (not in cloud)
    expect(result.tracks.gita!.currentReading).toBe(3);
    // upanishad: cloud only
    expect(result.tracks.upanishad!.currentReading).toBe(2);
    // max XP
    expect(result.xp).toBe(200);
  });
});
