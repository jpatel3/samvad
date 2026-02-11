import type { QuizQuestion } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswer: (answerIndex: number) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
}: QuestionCardProps) {
  const { t } = useLanguage();
  const hasAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div>
      {/* Question number */}
      <p className="text-xs text-text-muted dark:text-text-muted-dark mb-2">
        {t.quiz.question} {questionNumber} {t.quiz.of} {totalQuestions}
      </p>

      {/* Question text */}
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-4">
        {question.question}
      </h3>

      {/* Options */}
      <div className="space-y-2">
        {question.type === 'true_false' ? (
          <div className="flex gap-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => !hasAnswered && onAnswer(i)}
                disabled={hasAnswered}
                className={`flex-1 py-3 px-4 rounded-xl text-base font-medium transition-all border-2 ${
                  hasAnswered
                    ? i === question.correctAnswer
                      ? 'border-quiz-correct bg-quiz-correct/10 text-quiz-correct'
                      : i === selectedAnswer
                      ? 'border-quiz-incorrect bg-quiz-incorrect/10 text-quiz-incorrect'
                      : 'border-border dark:border-border-dark text-text-muted dark:text-text-muted-dark'
                    : 'border-border dark:border-border-dark hover:border-accent text-text dark:text-text-dark'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => !hasAnswered && onAnswer(i)}
              disabled={hasAnswered}
              className={`w-full py-3 px-4 rounded-xl text-left text-sm font-medium transition-all border-2 ${
                hasAnswered
                  ? i === question.correctAnswer
                    ? 'border-quiz-correct bg-quiz-correct/10 text-quiz-correct'
                    : i === selectedAnswer
                    ? 'border-quiz-incorrect bg-quiz-incorrect/10 text-quiz-incorrect'
                    : 'border-border dark:border-border-dark text-text-muted dark:text-text-muted-dark'
                  : 'border-border dark:border-border-dark hover:border-accent text-text dark:text-text-dark'
              }`}
            >
              <span className="text-text-muted dark:text-text-muted-dark mr-2">
                {String.fromCharCode(65 + i)}.
              </span>
              {option}
            </button>
          ))
        )}
      </div>

      {/* Feedback */}
      {hasAnswered && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            isCorrect
              ? 'bg-quiz-correct/10 border border-quiz-correct/30'
              : 'bg-quiz-incorrect/10 border border-quiz-incorrect/30'
          }`}
        >
          <p
            className={`text-sm font-semibold ${
              isCorrect ? 'text-quiz-correct' : 'text-quiz-incorrect'
            }`}
          >
            {isCorrect ? t.quiz.correct : t.quiz.incorrect}
          </p>
          <p className="text-sm text-text dark:text-text-dark mt-1">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
