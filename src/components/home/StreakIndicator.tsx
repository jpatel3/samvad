import { Card } from '../common/Card';
import { useStreak } from '../../hooks/useStreak';
import { useLanguage } from '../../hooks/useLanguage';

export function StreakIndicator() {
  const { current, longest, isActiveToday } = useStreak();
  const { t } = useLanguage();

  return (
    <Card className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
            isActiveToday
              ? 'bg-streak/20 text-streak'
              : 'bg-gray-100 dark:bg-gray-800 text-text-muted dark:text-text-muted-dark'
          }`}
        >
          {current > 0 ? '🔥' : '○'}
        </div>
        <div>
          <p className="text-2xl font-bold text-text dark:text-text-dark">
            {current}
          </p>
          <p className="text-xs text-text-muted dark:text-text-muted-dark">
            {t.streak.day} {t.streak.streak}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-text-muted dark:text-text-muted-dark">
          {t.streak.longest}
        </p>
        <p className="text-lg font-bold text-text dark:text-text-dark">
          {longest} {t.streak.days}
        </p>
      </div>
    </Card>
  );
}
