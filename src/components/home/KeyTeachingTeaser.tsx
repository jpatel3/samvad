import { Card } from '../common/Card';
import { useAppStore } from '../../store/useAppStore';
import { useReading } from '../../hooks/useReadings';
import { useLanguage } from '../../hooks/useLanguage';

export function KeyTeachingTeaser() {
  const currentReading = useAppStore((s) => s.currentReading);
  const { reading } = useReading(currentReading);
  const { t } = useLanguage();

  if (!reading) return null;

  return (
    <Card>
      <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-2">
        {t.home.keyTeaching}
      </p>
      <p className="text-sm text-text dark:text-text-dark italic leading-relaxed">
        "{reading.keyTeaching}"
      </p>
    </Card>
  );
}
