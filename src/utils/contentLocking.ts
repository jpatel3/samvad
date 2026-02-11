import type { ReadingLockState } from '../types';

export function getReadingLockState(
  readingId: number,
  currentReading: number,
  completedReadings: number[]
): ReadingLockState {
  if (completedReadings.includes(readingId)) {
    return 'review';
  }

  if (readingId === currentReading) {
    return 'current';
  }

  if (readingId === currentReading + 1 && completedReadings.includes(currentReading)) {
    return 'next_day';
  }

  return 'future';
}

export function canAccessReading(lockState: ReadingLockState): boolean {
  return lockState === 'review' || lockState === 'current' || lockState === 'next_day';
}
