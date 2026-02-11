import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { useTheme } from '../../hooks/useTheme';
import { useLanguage } from '../../hooks/useLanguage';
import { useAppStore } from '../../store/useAppStore';

export function AppShell() {
  // Initialize theme on mount
  useTheme();

  const { t } = useLanguage();
  const xp = useAppStore((s) => s.xp);

  return (
    <div className="min-h-screen bg-bg dark:bg-bg-dark">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border dark:border-border-dark">
        <div className="max-w-lg mx-auto flex items-center justify-between h-14 px-4">
          <h1 className="text-base font-bold text-accent truncate">
            {t.app.title}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-xp bg-xp/10 px-2 py-1 rounded-full">
              {xp} XP
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pb-20 pt-4">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
