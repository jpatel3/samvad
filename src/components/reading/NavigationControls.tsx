import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { useAppStore, useActiveTrackProgress } from '../../store/useAppStore';
import { useLanguage } from '../../hooks/useLanguage';
import type { ReadingLockState } from '../../types';

interface NavigationControlsProps {
  readingId: number;
  lockState: ReadingLockState;
  totalReadings: number;
}

export function NavigationControls({ readingId, lockState, totalReadings }: NavigationControlsProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const markComplete = useAppStore((s) => s.markComplete);
  const { completedReadings } = useActiveTrackProgress();

  const isCompleted = completedReadings.includes(readingId);
  const hasPrev = readingId > 1;
  const hasNext = readingId < totalReadings;

  const handleMarkComplete = () => {
    markComplete(readingId);
    navigate(`/quiz/${readingId}`);
  };

  return (
    <div className="mt-8 space-y-3">
      {/* Mark Complete / Take Quiz */}
      {lockState === 'current' && !isCompleted && (
        <Button onClick={handleMarkComplete} className="w-full" size="lg">
          {t.reading.markComplete}
        </Button>
      )}

      {isCompleted && (
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/quiz/${readingId}`)}
            variant="secondary"
            className="flex-1"
          >
            {t.reading.takeQuiz}
          </Button>
        </div>
      )}

      {/* Prev / Next */}
      <div className="flex gap-2">
        {hasPrev && (
          <Button
            onClick={() => navigate(`/reading/${readingId - 1}`)}
            variant="ghost"
            className="flex-1"
          >
            ← {t.reading.previousReading}
          </Button>
        )}
        {hasNext && (
          <Button
            onClick={() => navigate(`/reading/${readingId + 1}`)}
            variant="ghost"
            className="flex-1"
          >
            {t.reading.nextReading} →
          </Button>
        )}
      </div>
    </div>
  );
}
