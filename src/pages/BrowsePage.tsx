import { PrakaranAccordion } from '../components/browse/PrakaranAccordion';
import { useLanguage } from '../hooks/useLanguage';
import { useAppStore } from '../store/useAppStore';
import { getTrack } from '../constants/tracks';

export function BrowsePage() {
  const { t, language } = useLanguage();
  const activeTrack = useAppStore((s) => s.activeTrack);
  const track = getTrack(activeTrack);

  const trackName = track
    ? language === 'gu' ? track.nameGu : language === 'hi' ? track.nameHi : track.name
    : '';

  const sections = track?.sections ?? [];

  return (
    <div>
      <h1 className="text-xl font-bold text-text dark:text-text-dark mb-4">
        {t.browse.title} {trackName}
      </h1>
      <div className="space-y-3">
        {sections.map((section) => (
          <PrakaranAccordion key={section.index} prakaran={section} />
        ))}
      </div>
    </div>
  );
}
