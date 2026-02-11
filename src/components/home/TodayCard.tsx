import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useActiveTrackProgress } from '../../store/useAppStore';
import { useReading } from '../../hooks/useReadings';
import { useLanguage } from '../../hooks/useLanguage';
import { estimateReadingTime } from '../../utils/readingTime';

export function TodayCard() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currentReading, completedReadings } = useActiveTrackProgress();
  const { reading, loading } = useReading(currentReading);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      </Card>
    );
  }

  if (!reading) {
    return (
      <Card>
        <p className="text-text-muted dark:text-text-muted-dark text-center py-4">
          All readings completed!
        </p>
      </Card>
    );
  }

  const isCompleted = completedReadings.includes(reading.id);
  const readTime = estimateReadingTime(reading.wordCount);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
          {reading.prakaran}
        </span>
        <span className="text-xs text-text-muted dark:text-text-muted-dark">
          ~{readTime} {t.home.minuteRead}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-1">
        {t.home.todayReading}
      </h3>

      <p className="text-base font-medium text-text dark:text-text-dark">
        {reading.title}
        {reading.totalChunks > 1 && (
          <span className="text-text-muted dark:text-text-muted-dark text-sm ml-1">
            ({t.reading.part} {reading.chunkIndex + 1} {t.reading.of} {reading.totalChunks})
          </span>
        )}
      </p>

      <p className="text-sm text-text-muted dark:text-text-muted-dark mt-2 line-clamp-2">
        {reading.summary}
      </p>

      <div className="mt-4">
        <Button
          onClick={() => navigate(`/reading/${reading.id}`)}
          className="w-full"
          variant={isCompleted ? 'secondary' : 'primary'}
        >
          {isCompleted ? t.home.completed : t.home.startReading}
        </Button>
      </div>
    </Card>
  );
}
