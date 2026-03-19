import { useRef, useEffect } from 'react';
import type { DialogueExchange } from '../../types';
import type { WordRange } from '../../hooks/useTextToSpeech';
import { SpeakerBadge } from './SpeakerBadge';
import { useAppStore } from '../../store/useAppStore';

interface DialogueBlockProps {
  exchange: DialogueExchange;
  isLast: boolean;
  isActive?: boolean;
  activeWordRange?: WordRange | null;
  onSpeakerClick?: (speaker: string) => void;
}

const fontSizeClasses = {
  small: 'text-sm leading-relaxed',
  medium: 'text-base leading-relaxed',
  large: 'text-lg leading-loose',
};

function HighlightedText({ text, wordRange, className }: { text: string; wordRange: WordRange; className: string }) {
  const { charIndex, charLength } = wordRange;
  const before = text.slice(0, charIndex);
  const word = text.slice(charIndex, charIndex + charLength);
  const after = text.slice(charIndex + charLength);

  return (
    <div className={className}>
      {before}
      <span className="bg-accent/15 rounded-sm">{word}</span>
      {after}
    </div>
  );
}

export function DialogueBlock({ exchange, isLast, isActive, activeWordRange, onSpeakerClick }: DialogueBlockProps) {
  const fontSize = useAppStore((s) => s.settings.fontSize);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

  const showWordHighlight = isActive && activeWordRange && activeWordRange.charIndex >= 0;
  const textClassName = `text-text dark:text-text-dark ${fontSizeClasses[fontSize]} mt-1 whitespace-pre-wrap`;

  return (
    <div
      ref={ref}
      className={`relative pl-4 transition-all duration-300 ${
        isActive ? 'border-l-2 border-accent -ml-0.5' : ''
      }`}
    >
      {/* Threading line */}
      {!isLast && !isActive && (
        <div className="absolute left-0 top-8 bottom-0 w-0.5 bg-border dark:bg-border-dark" />
      )}

      {/* Connector dot */}
      <div
        className={`absolute left-[-3px] top-2 w-2 h-2 rounded-full ${
          isActive ? 'bg-accent animate-pulse left-[-5px] w-2.5 h-2.5' : 'bg-accent'
        }`}
      />

      <div
        className={`pb-6 ${
          exchange.type === 'narrative'
            ? 'bg-dialogue-bg dark:bg-dialogue-bg-dark rounded-lg p-3 -ml-1'
            : ''
        } ${isActive ? 'bg-accent/5 dark:bg-accent/10 rounded-lg p-3 -ml-1' : ''}`}
      >
        <SpeakerBadge
          speaker={exchange.speaker}
          type={exchange.type}
          onSpeakerClick={onSpeakerClick ? () => onSpeakerClick(exchange.speaker) : undefined}
        />
        {showWordHighlight ? (
          <HighlightedText
            text={exchange.text}
            wordRange={activeWordRange}
            className={textClassName}
          />
        ) : (
          <div className={textClassName}>
            {exchange.text}
          </div>
        )}
      </div>
    </div>
  );
}
