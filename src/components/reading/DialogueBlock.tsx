import { useRef, useEffect } from 'react';
import type { DialogueExchange } from '../../types';
import { SpeakerBadge } from './SpeakerBadge';
import { useAppStore } from '../../store/useAppStore';

interface DialogueBlockProps {
  exchange: DialogueExchange;
  isLast: boolean;
  isActive?: boolean;
  onSpeakerClick?: (speaker: string) => void;
}

const fontSizeClasses = {
  small: 'text-sm leading-relaxed',
  medium: 'text-base leading-relaxed',
  large: 'text-lg leading-loose',
};

export function DialogueBlock({ exchange, isLast, isActive, onSpeakerClick }: DialogueBlockProps) {
  const fontSize = useAppStore((s) => s.settings.fontSize);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

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
        <div
          className={`text-text dark:text-text-dark ${fontSizeClasses[fontSize]} mt-1 whitespace-pre-wrap`}
        >
          {exchange.text}
        </div>
      </div>
    </div>
  );
}
