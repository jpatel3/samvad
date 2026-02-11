import { useLanguage } from '../../hooks/useLanguage';

function getGreeting(t: ReturnType<typeof useLanguage>['t']): string {
  const hour = new Date().getHours();
  if (hour < 12) return t.home.greeting.morning;
  if (hour < 17) return t.home.greeting.afternoon;
  return t.home.greeting.evening;
}

export function WelcomeBanner() {
  const { t } = useLanguage();
  const greeting = getGreeting(t);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-text dark:text-text-dark">
        {greeting}
      </h2>
      <p className="text-text-muted dark:text-text-muted-dark mt-1">
        {t.app.subtitle}
      </p>
    </div>
  );
}
