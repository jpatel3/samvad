import { colors } from '../../constants/colors';

interface SpeakerBadgeProps {
  speaker: string;
  type: 'question' | 'answer' | 'narrative';
}

function isMaharaj(speaker: string): boolean {
  const primarySpeakers = [
    'Shriji Maharaj', 'શ્રીજી મહારાજ', 'श्रीजी महाराज', 'Bhagwan Swaminarayan',
    'Krishna', 'કૃષ્ણ', 'कृष्ण', 'Shri Krishna', 'શ્રી કૃષ્ણ', 'श्री कृष्ण',
  ];
  return primarySpeakers.some((n) => speaker.includes(n));
}

export function SpeakerBadge({ speaker, type }: SpeakerBadgeProps) {
  const isMaharajSpeaker = isMaharaj(speaker);
  const bgColor = isMaharajSpeaker ? colors.speakerMaharaj : colors.speakerOther;

  return (
    <div className="flex items-center gap-2 mb-1">
      <span
        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: bgColor }}
      >
        {speaker}
      </span>
      {type !== 'narrative' && (
        <span className="text-[10px] text-text-muted dark:text-text-muted-dark uppercase tracking-wider">
          {type === 'question' ? 'Q' : 'A'}
        </span>
      )}
    </div>
  );
}
