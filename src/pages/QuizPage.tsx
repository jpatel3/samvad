import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReading } from '../hooks/useReadings';
import { useLanguage } from '../hooks/useLanguage';
import { useAppStore } from '../store/useAppStore';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { QuizResults } from '../components/quiz/QuizResults';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { config } from '../constants/config';

export function QuizPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const readingId = parseInt(id || '1', 10);
  const { reading, loading } = useReading(readingId);
  const { t } = useLanguage();
  const addQuizResult = useAppStore((s) => s.addQuizResult);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!reading || reading.quiz.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-text-muted dark:text-text-muted-dark">No quiz available</p>
        <button onClick={() => navigate('/')} className="text-accent mt-2 underline">
          Go home
        </button>
      </div>
    );
  }

  const questions = reading.quiz;
  const question = questions[currentQuestion];

  if (showResults) {
    let score = 0;
    let xpEarned = 0;
    answers.forEach((answer, i) => {
      if (answer != null && answer === questions[i].correctAnswer) {
        score++;
        xpEarned += questions[i].difficulty === 'easy'
          ? config.xp.quizCorrectEasy
          : config.xp.quizCorrectMedium;
      }
    });
    if (score === questions.length) {
      xpEarned += config.xp.quizPerfectScore;
    }

    return (
      <QuizResults
        score={score}
        totalQuestions={questions.length}
        xpEarned={xpEarned}
        readingId={readingId}
      />
    );
  }

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      let score = 0;
      let xpEarned = 0;
      answers.forEach((answer, i) => {
        if (answer != null && answer === questions[i]?.correctAnswer) {
          score++;
          xpEarned += questions[i].difficulty === 'easy'
            ? config.xp.quizCorrectEasy
            : config.xp.quizCorrectMedium;
        }
      });
      if (score === questions.length) {
        xpEarned += config.xp.quizPerfectScore;
      }

      addQuizResult({
        readingId,
        score,
        totalQuestions: questions.length,
        xpEarned,
        date: new Date().toISOString().split('T')[0],
      });

      setShowResults(true);
    }
  };

  const hasAnswered = answers[currentQuestion] !== undefined && answers[currentQuestion] !== null;

  return (
    <div>
      <h1 className="text-xl font-bold text-text dark:text-text-dark mb-1">
        {t.quiz.title}
      </h1>
      <p className="text-sm text-text-muted dark:text-text-muted-dark mb-4">
        {reading.title}
      </p>

      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6">
        {questions.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i < currentQuestion
                ? answers[i] === questions[i].correctAnswer
                  ? 'bg-quiz-correct'
                  : 'bg-quiz-incorrect'
                : i === currentQuestion
                ? 'bg-accent'
                : 'bg-border dark:bg-border-dark'
            }`}
          />
        ))}
      </div>

      <Card>
        <QuestionCard
          question={question}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
          selectedAnswer={answers[currentQuestion] ?? null}
          onAnswer={handleAnswer}
        />

        {hasAnswered && (
          <div className="mt-4">
            <Button onClick={handleNext} className="w-full">
              {currentQuestion < questions.length - 1 ? t.quiz.next : t.quiz.finish}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
