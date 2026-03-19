import { useState, useCallback, useRef, useEffect } from 'react';
import type { Language } from '../types';

export type TTSState = 'idle' | 'playing' | 'paused';

export type TTSSpeed = 0.8 | 1 | 1.2 | 1.5;

export interface WordRange {
  charIndex: number;
  charLength: number;
}

interface UseTextToSpeechReturn {
  state: TTSState;
  currentIndex: number;
  activeWordRange: WordRange | null;
  speed: TTSSpeed;
  isAvailable: boolean;
  play: (texts: string[], lang: Language, prefixLengths?: number[]) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setSpeed: (speed: TTSSpeed) => void;
}

const langMap: Record<Language, string[]> = {
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
  gu: ['gu-IN', 'gu'],
  hi: ['hi-IN', 'hi'],
};

function findVoice(lang: Language): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  const prefixes = langMap[lang];

  for (const prefix of prefixes) {
    const voice = voices.find((v) => v.lang === prefix || v.lang.startsWith(prefix));
    if (voice) return voice;
  }
  return null;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [state, setState] = useState<TTSState>('idle');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [activeWordRange, setActiveWordRange] = useState<WordRange | null>(null);
  const [speed, setSpeedState] = useState<TTSSpeed>(1);
  const [isAvailable, setIsAvailable] = useState(true);

  const textsRef = useRef<string[]>([]);
  const prefixLensRef = useRef<number[]>([]);
  const langRef = useRef<Language>('en');
  const speedRef = useRef<TTSSpeed>(1);
  const indexRef = useRef(-1);
  const stoppedRef = useRef(false);

  useEffect(() => {
    setIsAvailable(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const speakAt = useCallback((index: number) => {
    if (index >= textsRef.current.length) {
      setState('idle');
      setCurrentIndex(-1);
      setActiveWordRange(null);
      indexRef.current = -1;
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textsRef.current[index]);
    utterance.rate = speedRef.current;

    const voice = findVoice(langRef.current);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = langMap[langRef.current][0];
    }

    const prefixLen = prefixLensRef.current[index] || 0;

    utterance.onboundary = (e) => {
      if (stoppedRef.current) return;
      if (e.name === 'word') {
        const adjustedIndex = e.charIndex - prefixLen;
        if (adjustedIndex >= 0) {
          setActiveWordRange({ charIndex: adjustedIndex, charLength: e.charLength });
        }
      }
    };

    utterance.onend = () => {
      if (stoppedRef.current) return;
      setActiveWordRange(null);
      const next = indexRef.current + 1;
      indexRef.current = next;
      setCurrentIndex(next);
      speakAt(next);
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      setState('idle');
      setCurrentIndex(-1);
      setActiveWordRange(null);
      indexRef.current = -1;
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const play = useCallback((texts: string[], lang: Language, prefixLengths?: number[]) => {
    if (!isAvailable) return;

    window.speechSynthesis.cancel();
    stoppedRef.current = false;
    textsRef.current = texts;
    prefixLensRef.current = prefixLengths || texts.map(() => 0);
    langRef.current = lang;
    indexRef.current = 0;
    setCurrentIndex(0);
    setActiveWordRange(null);
    setState('playing');
    speakAt(0);
  }, [isAvailable, speakAt]);

  const pause = useCallback(() => {
    if (!isAvailable) return;
    window.speechSynthesis.pause();
    setState('paused');
  }, [isAvailable]);

  const resume = useCallback(() => {
    if (!isAvailable) return;
    window.speechSynthesis.resume();
    setState('playing');
  }, [isAvailable]);

  const stop = useCallback(() => {
    if (!isAvailable) return;
    stoppedRef.current = true;
    window.speechSynthesis.cancel();
    setState('idle');
    setCurrentIndex(-1);
    setActiveWordRange(null);
    indexRef.current = -1;
  }, [isAvailable]);

  const setSpeed = useCallback((newSpeed: TTSSpeed) => {
    setSpeedState(newSpeed);
    speedRef.current = newSpeed;

    if (state === 'playing') {
      stoppedRef.current = true;
      window.speechSynthesis.cancel();
      stoppedRef.current = false;
      setState('playing');
      speakAt(indexRef.current);
    }
  }, [state, speakAt]);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      window.speechSynthesis.cancel();
    };
  }, []);

  return { state, currentIndex, activeWordRange, speed, isAvailable, play, pause, resume, stop, setSpeed };
}
