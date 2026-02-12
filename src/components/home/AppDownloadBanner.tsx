const APP_STORE_URL = 'https://apps.apple.com/app/samvad/id6759070534';

export function AppDownloadBanner() {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl bg-gradient-to-r from-accent to-accent-light p-4 transition-transform active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
          {'\uD83D\uDCF1'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">Get the Samvad App</p>
          <p className="text-white/70 text-xs">
            Listen along, track streaks & read offline
          </p>
        </div>
        <div className="flex-shrink-0 text-white/80 text-xs font-medium bg-white/15 px-3 py-1.5 rounded-full">
          App Store
        </div>
      </div>
    </a>
  );
}
