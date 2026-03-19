import { useState } from 'react';
import type { VachanamrutReading } from '../../types';
import type { WordRange } from '../../hooks/useTextToSpeech';
import { DialogueBlock } from './DialogueBlock';
import { CharacterBioModal } from './CharacterBioModal';
import { getCharacterBio, type CharacterBio } from '../../constants/characterBios';
import { useAppStore } from '../../store/useAppStore';
import { useLanguage } from '../../hooks/useLanguage';

interface ReadingContentProps {
  reading: VachanamrutReading;
  activeExchangeIndex?: number;
  activeWordRange?: WordRange | null;
}

export function ReadingContent({ reading, activeExchangeIndex = -1, activeWordRange = null }: ReadingContentProps) {
  const showSetting = useAppStore((s) => s.settings.showSetting);
  const { t } = useLanguage();
  const [selectedBio, setSelectedBio] = useState<CharacterBio | null>(null);
  const [showBioModal, setShowBioModal] = useState(false);

  const handleSpeakerClick = (speaker: string) => {
    const bio = getCharacterBio(speaker);
    if (bio) {
      setSelectedBio(bio);
      setShowBioModal(true);
    }
  };

  return (
    <div className="scroll-parchment relative rounded-xl overflow-hidden">
      {/* Parchment background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FDF6EC] via-[#FAF0E0] to-[#F5E6D0] dark:from-[#1E1A14] dark:via-[#1C1710] dark:to-[#1A150E] rounded-xl" />
      {/* Vignette overlay */}
      <div className="absolute inset-0 rounded-xl shadow-[inset_0_0_60px_rgba(139,90,43,0.08)] dark:shadow-[inset_0_0_60px_rgba(0,0,0,0.3)]" />
      {/* Subtle texture */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"}} />
      {/* Decorative top border */}
      <div className="relative h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <div className="relative px-5 py-6">
        {/* Setting / Assembly Description */}
        {reading.setting && showSetting && (
          <div className="mb-6 bg-[#EDE0CC]/50 dark:bg-[#2A2218]/60 rounded-lg p-4 border border-[#D4C5A9]/30 dark:border-[#3D3020]/50">
            <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
              {t.reading.setting}
            </p>
            <p className="text-sm text-text-muted dark:text-text-muted-dark leading-relaxed">
              {reading.setting}
            </p>
          </div>
        )}

        {/* Date */}
        {reading.date && (
          <p className="text-xs text-text-muted dark:text-text-muted-dark mb-4 italic">
            {reading.date}
          </p>
        )}

        {/* Dialogue */}
        <div className="ml-2">
          {reading.dialogue.map((exchange, index) => (
            <DialogueBlock
              key={index}
              exchange={exchange}
              isLast={index === reading.dialogue.length - 1}
              isActive={index === activeExchangeIndex}
              activeWordRange={index === activeExchangeIndex ? activeWordRange : null}
              onSpeakerClick={handleSpeakerClick}
            />
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 p-4 bg-accent/5 dark:bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
            {t.reading.summary}
          </p>
          <p className="text-sm text-text dark:text-text-dark leading-relaxed">
            {reading.summary}
          </p>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="relative h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

      <CharacterBioModal
        bio={selectedBio}
        isOpen={showBioModal}
        onClose={() => setShowBioModal(false)}
      />
    </div>
  );
}
