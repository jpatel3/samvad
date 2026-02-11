import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { useLanguage } from '../../hooks/useLanguage';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  xpEarned: number;
  readingId: number;
}

export function QuizResults({ score, totalQuestions, xpEarned, readingId }: QuizResultsProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPerfect = score === totalQuestions;

  return (
    <div className="text-center py-6">
      {/* Score circle */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border dark:text-border-dark"
          />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * 326.7} 326.7`}
            className="text-accent"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-text dark:text-text-dark">
            {score}/{totalQuestions}
          </span>
        </div>
      </div>

      {isPerfect && (
        <p className="text-lg font-bold text-xp mb-2">
          {t.quiz.perfectScore}
        </p>
      )}

      {/* XP earned */}
      <Card className="inline-block mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xp text-xl">⭐</span>
          <span className="text-lg font-bold text-xp">+{xpEarned} {t.quiz.xpEarned}</span>
        </div>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <Button onClick={() => navigate('/')} className="w-full">
          {t.reading.nextReading}
        </Button>
        <Button
          onClick={() => navigate(`/reading/${readingId}`)}
          variant="ghost"
          className="w-full"
        >
          {t.quiz.tryAgain}
        </Button>
      </div>
    </div>
  );
}
