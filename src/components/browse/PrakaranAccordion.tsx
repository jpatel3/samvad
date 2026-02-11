import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Section } from '../../types';
import { useReadingsByPrakaran } from '../../hooks/useReadings';
import { useActiveTrackProgress } from '../../store/useAppStore';
import { useLanguage } from '../../hooks/useLanguage';
import { getReadingLockState, canAccessReading } from '../../utils/contentLocking';
import { Card } from '../common/Card';

interface PrakaranAccordionProps {
  prakaran: Section;
}

export function PrakaranAccordion({ prakaran }: PrakaranAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { readings } = useReadingsByPrakaran(prakaran.index);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { currentReading, completedReadings } = useActiveTrackProgress();

  const completedCount = readings.filter((r) => completedReadings.includes(r.id)).length;
  const prakaranName = language === 'gu' ? prakaran.nameGu : language === 'hi' ? prakaran.nameHi : prakaran.name;

  return (
    <Card padding="none" className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <h3 className="font-semibold text-text dark:text-text-dark">{prakaranName}</h3>
          <p className="text-xs text-text-muted dark:text-text-muted-dark mt-0.5">
            {completedCount}/{readings.length} {t.browse.readings}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress ring */}
          <div className="relative w-10 h-10">
            <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-border dark:text-border-dark"
              />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${(completedCount / Math.max(readings.length, 1)) * 97.4} 97.4`}
                className="text-accent"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
              {readings.length > 0 ? Math.round((completedCount / readings.length) * 100) : 0}%
            </span>
          </div>
          <svg
            className={`w-5 h-5 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border dark:border-border-dark">
          {readings.map((reading) => {
            const lockState = getReadingLockState(reading.id, currentReading, completedReadings);
            const accessible = canAccessReading(lockState);
            const isCompleted = lockState === 'review';

            return (
              <button
                key={reading.id}
                onClick={() => accessible && navigate(`/reading/${reading.id}`)}
                disabled={!accessible}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-border/50 dark:border-border-dark/50 last:border-b-0 ${
                  accessible ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : 'opacity-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                    isCompleted
                      ? 'bg-quiz-correct text-white'
                      : lockState === 'current'
                      ? 'bg-accent text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-text-muted'
                  }`}
                >
                  {isCompleted ? '✓' : lockState === 'future' ? '🔒' : reading.prakaranVachno}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text dark:text-text-dark truncate">
                    {reading.title}
                  </p>
                  {reading.totalChunks > 1 && (
                    <p className="text-[10px] text-text-muted dark:text-text-muted-dark">
                      {t.reading.part} {reading.chunkIndex + 1} {t.reading.of} {reading.totalChunks}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
