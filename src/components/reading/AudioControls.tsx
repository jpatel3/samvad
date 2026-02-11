import type { TTSState, TTSSpeed } from '../../hooks/useTextToSpeech';

interface AudioControlsProps {
  state: TTSState;
  speed: TTSSpeed;
  isAvailable: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSpeedChange: (speed: TTSSpeed) => void;
}

const speeds: TTSSpeed[] = [0.8, 1, 1.2, 1.5];

export function AudioControls({
  state,
  speed,
  isAvailable,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSpeedChange,
}: AudioControlsProps) {
  if (!isAvailable) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark opacity-50 cursor-not-allowed"
        title="Text-to-speech not available for this language on your device"
      >
        <SpeakerIcon className="w-4 h-4 text-text-muted dark:text-text-muted-dark" />
        <span className="text-xs text-text-muted dark:text-text-muted-dark">Unavailable</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark">
      {/* Play / Pause */}
      {state === 'idle' ? (
        <button
          onClick={onPlay}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors"
          title="Play"
        >
          <PlayIcon />
        </button>
      ) : state === 'playing' ? (
        <button
          onClick={onPause}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors"
          title="Pause"
        >
          <PauseIcon />
        </button>
      ) : (
        <button
          onClick={onResume}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors"
          title="Resume"
        >
          <PlayIcon />
        </button>
      )}

      {/* Stop - only visible when not idle */}
      {state !== 'idle' && (
        <button
          onClick={onStop}
          className="flex items-center justify-center w-7 h-7 rounded-full text-text-muted dark:text-text-muted-dark hover:text-text dark:hover:text-text-dark transition-colors"
          title="Stop"
        >
          <StopIcon />
        </button>
      )}

      {/* Speed selector */}
      <button
        onClick={() => {
          const idx = speeds.indexOf(speed);
          const next = speeds[(idx + 1) % speeds.length];
          onSpeedChange(next);
        }}
        className="px-2 py-1 text-xs font-semibold text-text-muted dark:text-text-muted-dark hover:text-accent transition-colors min-w-[36px]"
        title="Playback speed"
      >
        {speed}x
      </button>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}
