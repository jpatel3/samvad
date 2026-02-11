import { useState, useEffect } from 'react';

export function useMidnightTimer() {
  const [timeUntilMidnight, setTimeUntilMidnight] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilMidnight(getTimeUntilMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return timeUntilMidnight;
}

function getTimeUntilMidnight(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const formatted = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return { hours, minutes, seconds, formatted };
}
