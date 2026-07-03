import { useState, useEffect } from 'react';
import { useDayStore } from './useDayStore';

/**
 * Hook that ticks every second when a timer is active, triggering a re-render
 * so that live time displays update every 1s.
 */
export function useLiveTimerTick() {
  const activeTimer = useDayStore(state => state.currentDay?.activeTimer);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!activeTimer || activeTimer.isPaused) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);
}
