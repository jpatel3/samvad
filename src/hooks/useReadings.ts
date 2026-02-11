import { useState, useEffect } from 'react';
import type { VachanamrutReading, Language } from '../types';
import { useAppStore } from '../store/useAppStore';

const dataCache: Partial<Record<Language, VachanamrutReading[]>> = {};

async function loadReadings(language: Language): Promise<VachanamrutReading[]> {
  if (dataCache[language]) return dataCache[language]!;

  const modules: Record<Language, () => Promise<{ default: unknown[] }>> = {
    en: () => import('../data/vachanamrut_en.json'),
    gu: () => import('../data/vachanamrut_gu.json'),
    hi: () => import('../data/vachanamrut_hi.json'),
  };

  const mod = await modules[language]();
  const readings = mod.default as VachanamrutReading[];
  dataCache[language] = readings;
  return readings;
}

export function useReadings() {
  const language = useAppStore((s) => s.settings.language);
  const [readings, setReadings] = useState<VachanamrutReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadReadings(language).then((data) => {
      setReadings(data);
      setLoading(false);
    });
  }, [language]);

  return { readings, loading };
}

export function useReading(id: number) {
  const { readings, loading } = useReadings();
  const reading = readings.find((r) => r.id === id);
  return { reading, loading };
}

export function useReadingsByPrakaran(prakaranIndex: number) {
  const { readings, loading } = useReadings();
  const filtered = readings.filter((r) => r.prakaranIndex === prakaranIndex);
  return { readings: filtered, loading };
}

export function useTotalReadings() {
  const { readings } = useReadings();
  return readings.length;
}
