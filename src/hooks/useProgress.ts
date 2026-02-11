import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useActiveTrackProgress } from '../store/useAppStore';
import { useReadings } from './useReadings';
import { getTrack } from '../constants/tracks';

export function useProgress() {
  const activeTrack = useAppStore((s) => s.activeTrack);
  const trackProgress = useActiveTrackProgress();
  const xp = useAppStore((s) => s.xp);
  const { readings } = useReadings();

  const { completedReadings, readingHistory, quizResults } = trackProgress;

  const stats = useMemo(() => {
    const totalReadings = readings.length;
    const completedCount = completedReadings.length;
    const completionPercentage = totalReadings > 0
      ? Math.round((completedCount / totalReadings) * 100)
      : 0;

    const averageQuizScore = quizResults.length > 0
      ? Math.round(
          quizResults.reduce((sum, r) => sum + (r.score / r.totalQuestions) * 100, 0) /
            quizResults.length
        )
      : 0;

    const daysActive = Object.keys(readingHistory).length;

    return {
      totalReadings,
      completedCount,
      completionPercentage,
      totalXP: xp,
      averageQuizScore,
      daysActive,
      readingHistory,
    };
  }, [completedReadings, readingHistory, xp, quizResults, readings]);

  const track = getTrack(activeTrack);
  const sections = track?.sections ?? [];

  const sectionStats = useMemo(() => {
    return sections.map((p) => {
      const sectionReadings = readings.filter((r) => r.prakaranIndex === p.index);
      const completed = sectionReadings.filter((r) =>
        completedReadings.includes(r.id)
      ).length;
      return {
        ...p,
        totalReadings: sectionReadings.length,
        completedReadings: completed,
        isComplete: completed === sectionReadings.length && sectionReadings.length > 0,
      };
    });
  }, [readings, completedReadings, sections]);

  return { stats, prakaranStats: sectionStats };
}
