import { useAppStore } from '../../store/useAppStore';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../common/Card';

interface AccountSectionProps {
  onSignInClick: () => void;
}

export function AccountSection({ onSignInClick }: AccountSectionProps) {
  const { signOut, isSignedIn } = useAuth();
  const userEmail = useAppStore((s) => s.userEmail);
  const lastSyncedAt = useAppStore((s) => s.lastSyncedAt);
  const isSyncing = useAppStore((s) => s.isSyncing);

  if (!isSignedIn) {
    return (
      <Card>
        <button
          onClick={onSignInClick}
          className="w-full text-left flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-semibold text-text dark:text-text-dark">
              Sync Your Progress
            </p>
            <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">
              Sign in to sync progress across devices
            </p>
          </div>
          <span className="text-accent font-semibold">{'>'}</span>
        </button>
      </Card>
    );
  }

  const syncLabel = isSyncing
    ? 'Syncing...'
    : lastSyncedAt
      ? `Last synced ${formatRelativeTime(lastSyncedAt)}`
      : 'Not yet synced';

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-text dark:text-text-dark">
            {userEmail}
          </p>
          <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">
            {syncLabel}
          </p>
        </div>
        <button
          onClick={signOut}
          className="text-sm font-semibold text-red-500 hover:text-red-600"
        >
          Sign Out
        </button>
      </div>
    </Card>
  );
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
