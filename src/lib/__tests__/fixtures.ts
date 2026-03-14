import type {
  TrackProgress,
  StreakData,
  UserSettings,
  QuizResult,
  ReadingHistory,
} from '../../types';

export function makeTrackProgress(
  overrides: Partial<TrackProgress> = {},
): TrackProgress {
  return {
    currentReading: 1,
    completedReadings: [],
    readingHistory: {},
    quizResults: [],
    ...overrides,
  };
}

export function makeStreakData(
  overrides: Partial<StreakData> = {},
): StreakData {
  return {
    current: 0,
    longest: 0,
    lastReadDate: null,
    freezesAvailable: 3,
    freezesUsed: [],
    ...overrides,
  };
}

export function makeSettings(
  overrides: Partial<UserSettings> = {},
): UserSettings {
  return {
    fontSize: 'medium',
    theme: 'light',
    language: 'en',
    showSetting: true,
    ...overrides,
  };
}

export function makeQuizResult(
  overrides: Partial<QuizResult> = {},
): QuizResult {
  return {
    readingId: 1,
    score: 3,
    totalQuestions: 5,
    xpEarned: 15,
    date: '2025-01-01',
    ...overrides,
  };
}

export interface CloudProfile {
  active_track: string;
  xp: number;
  start_date: string | null;
  streak_current: number;
  streak_longest: number;
  streak_last_read_date: string | null;
  streak_freezes_available: number;
  streak_freezes_used: string[];
  settings: UserSettings;
  updated_at: string;
}

export interface CloudTrack {
  track_id: string;
  current_reading: number;
  completed_readings: number[];
  reading_history: ReadingHistory;
  quiz_results: QuizResult[];
  updated_at: string;
}

export function makeCloudProfile(
  overrides: Partial<CloudProfile> = {},
): CloudProfile {
  return {
    active_track: 'vachanamrut',
    xp: 0,
    start_date: null,
    streak_current: 0,
    streak_longest: 0,
    streak_last_read_date: null,
    streak_freezes_available: 3,
    streak_freezes_used: [],
    settings: makeSettings(),
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export function makeCloudTrack(
  overrides: Partial<CloudTrack> = {},
): CloudTrack {
  return {
    track_id: 'vachanamrut',
    current_reading: 1,
    completed_readings: [],
    reading_history: {},
    quiz_results: [],
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}
