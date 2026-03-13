import { colors } from '../../constants/colors';
import { CharacterAvatar } from '../decorative/CharacterAvatar';

interface SpeakerBadgeProps {
  speaker: string;
  type: 'question' | 'answer' | 'narrative';
  onSpeakerClick?: () => void;
}

function isMaharaj(speaker: string): boolean {
  const primarySpeakers = [
    'Shriji Maharaj', 'શ્રીજી મહારાજ', 'श्रीजी महाराज', 'Bhagwan Swaminarayan',
    'Krishna', 'કૃષ્ણ', 'कृष्ण', 'Shri Krishna', 'શ્રી કૃષ્ણ', 'श्री कृष्ण',
  ];
  return primarySpeakers.some((n) => speaker.includes(n));
}

export function SpeakerBadge({ speaker, type, onSpeakerClick }: SpeakerBadgeProps) {
  const isMaharajSpeaker = isMaharaj(speaker);
  const bgColor = isMaharajSpeaker ? colors.speakerMaharaj : colors.speakerOther;

  return (
    <div className="flex items-center gap-2 mb-1">
      <button
        onClick={onSpeakerClick}
        className="flex items-center gap-1.5 group cursor-pointer"
        type="button"
      >
        <CharacterAvatar name={speaker} size={22} />
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white group-hover:opacity-80 transition-opacity"
          style={{ backgroundColor: bgColor }}
        >
          {speaker}
          {onSpeakerClick && <span className="ml-1 opacity-60">&rsaquo;</span>}
        </span>
      </button>
      {type !== 'narrative' && (
        <span className="text-[10px] text-text-muted dark:text-text-muted-dark uppercase tracking-wider">
          {type === 'question' ? 'Q' : 'A'}
        </span>
      )}
    </div>
  );
}
