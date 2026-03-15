import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AppState,
  TrackId,
  TrackProgress,
  StreakData,
  UserSettings,
  QuizResult,
  ReadingHistory,
} from '../types';

// ---------- Cloud data shapes ----------

interface CloudProfile {
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

interface CloudTrackProgress {
  track_id: string;
  current_reading: number;
  completed_readings: number[];
  reading_history: ReadingHistory;
  quiz_results: QuizResult[];
  updated_at: string;
}

interface CloudData {
  profile: CloudProfile;
  tracks: CloudTrackProgress[];
}

// ---------- Push ----------

export async function pushProgress(
  supabase: SupabaseClient,
  state: AppState,
): Promise<boolean> {
  const userId = state.userId;
  if (!userId) return false;

  try {
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        active_track: state.activeTrack,
        xp: state.xp,
        start_date: state.startDate,
        streak_current: state.streak.current,
        streak_longest: state.streak.longest,
        streak_last_read_date: state.streak.lastReadDate,
        streak_freezes_available: state.streak.freezesAvailable,
        streak_freezes_used: state.streak.freezesUsed,
        settings: state.settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    const trackEntries = Object.entries(state.tracks) as [TrackId, TrackProgress | undefined][];
    for (const [trackId, progress] of trackEntries) {
      if (!progress) continue;

      const { error: trackError } = await supabase
        .from('track_progress')
        .upsert(
          {
            user_id: userId,
            track_id: trackId,
            current_reading: progress.currentReading,
            completed_readings: progress.completedReadings,
            reading_history: progress.readingHistory,
            quiz_results: progress.quizResults,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,track_id' },
        );

      if (trackError) throw trackError;
    }

    return true;
  } catch (err) {
    console.warn('[sync] push failed:', err);
    return false;
  }
}

// ---------- Pull ----------

export async function pullProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<CloudData | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) return null;

    const { data: tracks, error: tracksError } = await supabase
      .from('track_progress')
      .select('*')
      .eq('user_id', userId);

    if (tracksError) return null;

    return {
      profile: {
        active_track: profile.active_track,
        xp: profile.xp,
        start_date: profile.start_date,
        streak_current: profile.streak_current,
        streak_longest: profile.streak_longest,
        streak_last_read_date: profile.streak_last_read_date,
        streak_freezes_available: profile.streak_freezes_available,
        streak_freezes_used: profile.streak_freezes_used ?? [],
        settings: profile.settings,
        updated_at: profile.updated_at,
      },
      tracks: (tracks ?? []).map((t: Record<string, unknown>) => ({
        track_id: t.track_id as string,
        current_reading: t.current_reading as number,
        completed_readings: t.completed_readings as number[] ?? [],
        reading_history: t.reading_history as ReadingHistory ?? {},
        quiz_results: t.quiz_results as QuizResult[] ?? [],
        updated_at: t.updated_at as string,
      })),
    };
  } catch (err) {
    console.warn('[sync] pull failed:', err);
    return null;
  }
}

// ---------- Merge ----------

function unionArrays<T>(a: T[], b: T[]): T[] {
  const set = new Set([...a, ...b]);
  return Array.from(set);
}

function mergeReadingHistory(local: ReadingHistory, cloud: ReadingHistory): ReadingHistory {
  const merged = { ...cloud };
  for (const [date, readingId] of Object.entries(local)) {
    if (!merged[date] || readingId > merged[date]) {
      merged[date] = readingId;
    }
  }
  return merged;
}

function mergeQuizResults(local: QuizResult[], cloud: QuizResult[]): QuizResult[] {
  const seen = new Set<string>();
  const merged: QuizResult[] = [];

  const toKey = (r: QuizResult) => `${r.readingId}:${r.date}`;

  for (const r of cloud) {
    const key = toKey(r);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(r);
    }
  }
  for (const r of local) {
    const key = toKey(r);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(r);
    }
  }

  return merged;
}

function mergeTrackProgress(
  local: TrackProgress | undefined,
  cloud: CloudTrackProgress,
): TrackProgress {
  if (!local) {
    return {
      currentReading: cloud.current_reading,
      completedReadings: cloud.completed_readings ?? [],
      readingHistory: cloud.reading_history ?? {},
      quizResults: cloud.quiz_results ?? [],
    };
  }

  return {
    currentReading: Math.max(local.currentReading, cloud.current_reading),
    completedReadings: unionArrays(local.completedReadings, cloud.completed_readings ?? []),
    readingHistory: mergeReadingHistory(local.readingHistory, cloud.reading_history ?? {}),
    quizResults: mergeQuizResults(local.quizResults, cloud.quiz_results ?? []),
  };
}

function recalcStreak(
  localStreak: StreakData,
  cloudStreak: { current: number; longest: number; lastReadDate: string | null; freezesAvailable: number; freezesUsed: string[] },
): StreakData {
  const localDate = localStreak.lastReadDate ?? '';
  const cloudDate = cloudStreak.lastReadDate ?? '';
  const useLocal = localDate >= cloudDate;

  return {
    current: useLocal ? localStreak.current : cloudStreak.current,
    longest: Math.max(localStreak.longest, cloudStreak.longest),
    lastReadDate: localDate >= cloudDate ? localStreak.lastReadDate : cloudStreak.lastReadDate,
    freezesAvailable: Math.min(localStreak.freezesAvailable, cloudStreak.freezesAvailable),
    freezesUsed: unionArrays(localStreak.freezesUsed, cloudStreak.freezesUsed),
  };
}

export interface MergedState {
  activeTrack: TrackId;
  tracks: Partial<Record<TrackId, TrackProgress>>;
  streak: StreakData;
  settings: UserSettings;
  xp: number;
  startDate: string | null;
}

export function mergeProgress(
  local: {
    activeTrack: TrackId;
    tracks: Partial<Record<TrackId, TrackProgress>>;
    streak: StreakData;
    settings: UserSettings;
    xp: number;
    startDate: string | null;
    settingsUpdatedAt?: string;
  },
  cloud: CloudData,
): MergedState {
  const mergedTracks: Partial<Record<TrackId, TrackProgress>> = { ...local.tracks };

  for (const cloudTrack of cloud.tracks) {
    const trackId = cloudTrack.track_id as TrackId;
    mergedTracks[trackId] = mergeTrackProgress(local.tracks[trackId], cloudTrack);
  }

  const xp = Math.max(local.xp, cloud.profile.xp);

  const streak = recalcStreak(local.streak, {
    current: cloud.profile.streak_current,
    longest: cloud.profile.streak_longest,
    lastReadDate: cloud.profile.streak_last_read_date,
    freezesAvailable: cloud.profile.streak_freezes_available,
    freezesUsed: cloud.profile.streak_freezes_used,
  });

  const settingsUpdatedAt = local.settingsUpdatedAt ?? '';
  const cloudUpdatedAt = cloud.profile.updated_at ?? '';
  const settings = settingsUpdatedAt >= cloudUpdatedAt ? local.settings : cloud.profile.settings;

  const startDate = (() => {
    if (!local.startDate) return cloud.profile.start_date;
    if (!cloud.profile.start_date) return local.startDate;
    return local.startDate < cloud.profile.start_date ? local.startDate : cloud.profile.start_date;
  })();

  return {
    activeTrack: local.activeTrack,
    tracks: mergedTracks,
    streak,
    settings,
    xp,
    startDate,
  };
}
