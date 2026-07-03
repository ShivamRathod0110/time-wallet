import { useState, useEffect } from 'react';
import { useDayStore } from './useDayStore';

/**
 * Hook that ticks every second unconditionally, triggering a re-render
 * for live wall-clock updates, running timer updates, and midnight rollover checks.
 */
export function useLiveTimerTick() {
  const checkAndArchiveNewDay = useDayStore(state => state.checkAndArchiveNewDay);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      checkAndArchiveNewDay();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkAndArchiveNewDay]);
}
