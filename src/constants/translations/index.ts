import { en } from './en';
import { gu } from './gu';
import { hi } from './hi';
import type { Language } from '../../types';

export type Translations = typeof en;

const translations: Record<Language, Translations> = {
  en,
  gu: gu as unknown as Translations,
  hi: hi as unknown as Translations,
};

export function getTranslations(language: Language): Translations {
  return translations[language];
}

export { en, gu, hi };
