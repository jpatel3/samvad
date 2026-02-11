import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getTranslations } from '../constants/translations';

export function useLanguage() {
  const language = useAppStore((s) => s.settings.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const t = useMemo(() => getTranslations(language), [language]);

  return { language, setLanguage, t };
}

export function useTranslation() {
  const language = useAppStore((s) => s.settings.language);
  return useMemo(() => getTranslations(language), [language]);
}
