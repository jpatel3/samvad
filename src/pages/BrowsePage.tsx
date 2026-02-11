import { prakarans } from '../constants/prakarans';
import { PrakaranAccordion } from '../components/browse/PrakaranAccordion';
import { useLanguage } from '../hooks/useLanguage';

export function BrowsePage() {
  const { t } = useLanguage();

  return (
    <div>
      <h1 className="text-xl font-bold text-text dark:text-text-dark mb-4">
        {t.browse.title}
      </h1>
      <div className="space-y-3">
        {prakarans.map((prakaran) => (
          <PrakaranAccordion key={prakaran.index} prakaran={prakaran} />
        ))}
      </div>
    </div>
  );
}
