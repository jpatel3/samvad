import { useMemo } from 'react';
import { Card } from '../common/Card';
import { useLanguage } from '../../hooks/useLanguage';
import type { ReadingHistory } from '../../types';

interface CalendarHeatmapProps {
  readingHistory: ReadingHistory;
}

export function CalendarHeatmap({ readingHistory }: CalendarHeatmapProps) {
  const { t } = useLanguage();

  const weeks = useMemo(() => {
    const today = new Date();
    const days: { date: string; hasReading: boolean }[] = [];

    // Go back 12 weeks
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        hasReading: dateStr in readingHistory,
      });
    }

    // Group into weeks
    const grouped: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      grouped.push(days.slice(i, i + 7));
    }
    return grouped;
  }, [readingHistory]);

  return (
    <Card>
      <p className="text-sm font-semibold text-text dark:text-text-dark mb-3">
        {t.progress.readingCalendar}
      </p>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-3 h-3 rounded-sm ${
                  day.hasReading
                    ? 'bg-accent'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
                title={day.date}
              />
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}
