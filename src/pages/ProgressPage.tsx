import { useLanguage } from '../hooks/useLanguage';
import { useProgress } from '../hooks/useProgress';
import { useStreak } from '../hooks/useStreak';
import { StatsGrid } from '../components/progress/StatsGrid';
import { CalendarHeatmap } from '../components/progress/CalendarHeatmap';
import { PrakaranProgress } from '../components/progress/PrakaranProgress';
import { colors } from '../constants/colors';

export function ProgressPage() {
  const { t } = useLanguage();
  const { stats, prakaranStats } = useProgress();
  const { current, longest } = useStreak();

  const statItems = [
    {
      label: t.progress.readingsCompleted,
      value: stats.completedCount,
      icon: '📖',
      color: colors.accent,
    },
    {
      label: t.progress.totalXP,
      value: stats.totalXP,
      icon: '⭐',
      color: colors.xp,
    },
    {
      label: t.progress.currentStreak,
      value: `${current}`,
      icon: '🔥',
      color: colors.streak,
    },
    {
      label: t.progress.longestStreak,
      value: `${longest}`,
      icon: '🏆',
      color: colors.quizCorrect,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-text dark:text-text-dark">
        {t.progress.title}
      </h1>

      <StatsGrid stats={statItems} />

      {/* Completion bar */}
      <div className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border-dark p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">{t.progress.readingsCompleted}</span>
          <span className="text-text-muted dark:text-text-muted-dark">
            {stats.completedCount}/{stats.totalReadings} ({stats.completionPercentage}%)
          </span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-700"
            style={{ width: `${stats.completionPercentage}%` }}
          />
        </div>
      </div>

      <CalendarHeatmap readingHistory={stats.readingHistory} />
      <PrakaranProgress prakaranStats={prakaranStats} />
    </div>
  );
}
