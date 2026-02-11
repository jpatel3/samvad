import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useReadings } from './useReadings';
import { prakarans } from '../constants/prakarans';

export function useProgress() {
  const completedReadings = useAppStore((s) => s.completedReadings);
  const readingHistory = useAppStore((s) => s.readingHistory);
  const xp = useAppStore((s) => s.xp);
  const quizResults = useAppStore((s) => s.quizResults);
  const { readings } = useReadings();

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

  const prakaranStats = useMemo(() => {
    return prakarans.map((p) => {
      const prakaranReadings = readings.filter((r) => r.prakaranIndex === p.index);
      const completed = prakaranReadings.filter((r) =>
        completedReadings.includes(r.id)
      ).length;
      return {
        ...p,
        totalReadings: prakaranReadings.length,
        completedReadings: completed,
        isComplete: completed === prakaranReadings.length && prakaranReadings.length > 0,
      };
    });
  }, [readings, completedReadings]);

  return { stats, prakaranStats };
}
