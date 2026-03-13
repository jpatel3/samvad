import { useAppStore } from '../../store/useAppStore';
import { useLanguage } from '../../hooks/useLanguage';
import { TRACKS } from '../../constants/tracks';
import { TrackIcon } from '../decorative/TrackIcon';
import type { TrackId, Language } from '../../types';

function getTrackName(track: typeof TRACKS[number], language: Language): string {
  if (language === 'gu') return track.nameGu;
  if (language === 'hi') return track.nameHi;
  return track.name;
}

export function TrackSelector() {
  const activeTrack = useAppStore((s) => s.activeTrack);
  const setActiveTrack = useAppStore((s) => s.setActiveTrack);
  const { t, language } = useLanguage();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {TRACKS.map((track) => {
        const isActive = activeTrack === track.id;
        const isDisabled = !!track.comingSoon;

        return (
          <button
            key={track.id}
            onClick={() => !isDisabled && setActiveTrack(track.id as TrackId)}
            disabled={isDisabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-accent text-white shadow-sm'
                : isDisabled
                ? 'bg-gray-100 dark:bg-gray-800 text-text-muted dark:text-text-muted-dark opacity-60 cursor-not-allowed'
                : 'bg-gray-100 dark:bg-gray-800 text-text dark:text-text-dark hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <TrackIcon
              trackId={track.id}
              size={18}
              color={isActive ? '#FFFFFF' : undefined}
            />
            <span>{getTrackName(track, language)}</span>
            {track.comingSoon && (
              <span className="text-[10px] bg-gray-200 dark:bg-gray-700 text-text-muted dark:text-text-muted-dark px-1.5 py-0.5 rounded-full">
                {t.tracks.comingSoon}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
