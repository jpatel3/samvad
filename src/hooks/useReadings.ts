import { useState, useEffect } from 'react';
import type { VachanamrutReading, Language, TrackId } from '../types';
import { useAppStore } from '../store/useAppStore';

const dataCache: Partial<Record<string, VachanamrutReading[]>> = {};

async function loadReadings(trackId: TrackId, language: Language): Promise<VachanamrutReading[]> {
  const cacheKey = `${trackId}_${language}`;
  if (dataCache[cacheKey]) return dataCache[cacheKey]!;

  if (trackId === 'vachanamrut') {
    const modules: Record<Language, () => Promise<{ default: unknown[] }>> = {
      en: () => import('../data/vachanamrut_en.json'),
      gu: () => import('../data/vachanamrut_gu.json'),
      hi: () => import('../data/vachanamrut_hi.json'),
    };

    const mod = await modules[language]();
    const readings = mod.default as VachanamrutReading[];
    dataCache[cacheKey] = readings;
    return readings;
  }

  if (trackId === 'gita') {
    const modules: Record<Language, () => Promise<{ default: unknown[] }>> = {
      en: () => import('../data/gita_en.json'),
      gu: () => import('../data/gita_gu.json'),
      hi: () => import('../data/gita_hi.json'),
    };

    const mod = await modules[language]();
    const readings = mod.default as VachanamrutReading[];
    dataCache[cacheKey] = readings;
    return readings;
  }

  if (trackId === 'upanishad') {
    const modules: Record<Language, () => Promise<{ default: unknown[] }>> = {
      en: () => import('../data/upanishad_en.json'),
      gu: () => import('../data/upanishad_gu.json'),
      hi: () => import('../data/upanishad_hi.json'),
    };

    const mod = await modules[language]();
    const readings = mod.default as VachanamrutReading[];
    dataCache[cacheKey] = readings;
    return readings;
  }

  return [];
}

export function useReadings() {
  const language = useAppStore((s) => s.settings.language);
  const activeTrack = useAppStore((s) => s.activeTrack);
  const [readings, setReadings] = useState<VachanamrutReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadReadings(activeTrack, language).then((data) => {
      setReadings(data);
      setLoading(false);
    });
  }, [activeTrack, language]);

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
