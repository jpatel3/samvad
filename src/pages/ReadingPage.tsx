import { useParams, useNavigate } from 'react-router-dom';
import { useReading, useReadings } from '../hooks/useReadings';
import { useLanguage } from '../hooks/useLanguage';
import { useAppStore } from '../store/useAppStore';
import { ReadingContent } from '../components/reading/ReadingContent';
import { NavigationControls } from '../components/reading/NavigationControls';
import { ProgressBar } from '../components/reading/ProgressBar';
import { AudioControls } from '../components/reading/AudioControls';
import { getReadingLockState, canAccessReading } from '../utils/contentLocking';
import { estimateReadingTime } from '../utils/readingTime';
import { useMidnightTimer } from '../hooks/useMidnightTimer';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { Badge } from '../components/common/Badge';
import { useEffect, useCallback } from 'react';

export function ReadingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const readingId = parseInt(id || '1', 10);
  const { reading, loading } = useReading(readingId);
  const { readings } = useReadings();
  const { t } = useLanguage();
  const language = useAppStore((s) => s.settings.language);
  const currentReading = useAppStore((s) => s.currentReading);
  const completedReadings = useAppStore((s) => s.completedReadings);
  const { formatted: countdown } = useMidnightTimer();
  const tts = useTextToSpeech();

  // Scroll to top when reading changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [readingId]);

  // Stop TTS when navigating away from the reading
  useEffect(() => {
    return () => { tts.stop(); };
  }, [readingId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlay = useCallback(() => {
    if (!reading) return;
    const texts = reading.dialogue.map((d) =>
      d.type === 'narrative' ? d.text : `${d.speaker}: ${d.text}`
    );
    tts.play(texts, language);
  }, [reading, language, tts]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="space-y-3 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!reading) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted dark:text-text-muted-dark">Reading not found</p>
        <button onClick={() => navigate('/')} className="text-accent mt-2 underline">
          Go home
        </button>
      </div>
    );
  }

  const lockState = getReadingLockState(readingId, currentReading, completedReadings);
  const accessible = canAccessReading(lockState);

  if (!accessible) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <p className="text-text-muted dark:text-text-muted-dark text-lg">
          {t.reading.lockedMessage}
        </p>
        <button onClick={() => navigate('/')} className="text-accent mt-4 underline">
          Go home
        </button>
      </div>
    );
  }

  const readTime = estimateReadingTime(reading.wordCount);

  return (
    <div>
      <ProgressBar />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge color="#D4763C">{reading.prakaran}</Badge>
            {reading.totalChunks > 1 && (
              <Badge color="#607D8B">
                {t.reading.part} {reading.chunkIndex + 1}/{reading.totalChunks}
              </Badge>
            )}
            <span className="text-xs text-text-muted dark:text-text-muted-dark">
              ~{readTime} {t.home.minuteRead}
            </span>
          </div>
          <AudioControls
            state={tts.state}
            speed={tts.speed}
            isAvailable={tts.isAvailable}
            onPlay={handlePlay}
            onPause={tts.pause}
            onResume={tts.resume}
            onStop={tts.stop}
            onSpeedChange={tts.setSpeed}
          />
        </div>

        <h1 className="text-xl font-bold text-text dark:text-text-dark">
          {reading.title}
        </h1>
      </div>

      {/* Next Day Preview */}
      {lockState === 'next_day' && (
        <div className="mb-4 p-3 bg-streak/10 rounded-lg text-center">
          <p className="text-sm text-streak font-medium">
            {t.reading.nextDayMessage}
          </p>
          <p className="text-lg font-mono font-bold text-streak mt-1">{countdown}</p>
        </div>
      )}

      <ReadingContent reading={reading} activeExchangeIndex={tts.state !== 'idle' ? tts.currentIndex : -1} />

      <NavigationControls
        readingId={readingId}
        lockState={lockState}
        totalReadings={readings.length}
      />
    </div>
  );
}
