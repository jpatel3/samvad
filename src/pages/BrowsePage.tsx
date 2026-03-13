import { PrakaranAccordion } from '../components/browse/PrakaranAccordion';
import { useLanguage } from '../hooks/useLanguage';
import { useAppStore } from '../store/useAppStore';
import { getTrack } from '../constants/tracks';
import { TrackIcon } from '../components/decorative/TrackIcon';

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
      <div className="flex items-center gap-3 mb-4">
        <TrackIcon trackId={activeTrack} size={32} />
        <h1 className="text-xl font-bold text-text dark:text-text-dark">
          {t.browse.title} {trackName}
        </h1>
      </div>
      <div className="space-y-3">
        {sections.map((section) => (
          <PrakaranAccordion key={section.index} prakaran={section} />
        ))}
      </div>
    </div>
  );
}
