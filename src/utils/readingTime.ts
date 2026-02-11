import { config } from '../constants/config';

export function estimateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / config.wordsPerMinute);
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  return `${minutes} min`;
}
