import { Card } from '../common/Card';
import { useLanguage } from '../../hooks/useLanguage';

interface PrakaranStat {
  index: number;
  name: string;
  nameGu: string;
  nameHi: string;
  totalReadings: number;
  completedReadings: number;
  isComplete: boolean;
}

interface PrakaranProgressProps {
  prakaranStats: PrakaranStat[];
}

export function PrakaranProgress({ prakaranStats }: PrakaranProgressProps) {
  const { t, language } = useLanguage();

  return (
    <Card>
      <p className="text-sm font-semibold text-text dark:text-text-dark mb-3">
        {t.progress.prakaranProgress}
      </p>
      <div className="space-y-3">
        {prakaranStats.map((p) => {
          const pName = language === 'gu' ? p.nameGu : language === 'hi' ? p.nameHi : p.name;
          const pct = p.totalReadings > 0
            ? Math.round((p.completedReadings / p.totalReadings) * 100)
            : 0;

          return (
            <div key={p.index}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-text dark:text-text-dark">
                  {pName}
                </span>
                <span className="text-text-muted dark:text-text-muted-dark">
                  {p.completedReadings}/{p.totalReadings}
                </span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    p.isComplete ? 'bg-quiz-correct' : 'bg-accent'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
