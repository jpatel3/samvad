import { WelcomeBanner } from '../components/home/WelcomeBanner';
import { TrackSelector } from '../components/home/TrackSelector';
import { TodayCard } from '../components/home/TodayCard';
import { StreakIndicator } from '../components/home/StreakIndicator';
import { KeyTeachingTeaser } from '../components/home/KeyTeachingTeaser';

export function HomePage() {
  return (
    <div className="space-y-4">
      <WelcomeBanner />
      <TrackSelector />
      <StreakIndicator />
      <TodayCard />
      <KeyTeachingTeaser />
    </div>
  );
}
