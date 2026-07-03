import { useEffect } from 'react';
import { useDayStore } from './useDayStore';

/**
 * Hook to manage automatic loading on mount and saving periodically when timer runs
 */
export function useLocalStorageSync() {
  const loadFromStorage = useDayStore(state => state.loadFromStorage);
  const saveToStorage = useDayStore(state => state.saveToStorage);
  const checkAndArchiveNewDay = useDayStore(state => state.checkAndArchiveNewDay);
  const activeTimer = useDayStore(state => state.currentDay?.activeTimer);

  // Initial load
  useEffect(() => {
    loadFromStorage();
    checkAndArchiveNewDay();
  }, [loadFromStorage, checkAndArchiveNewDay]);

  // Periodic save every 5 seconds while timer is running (as specified in prompt)
  useEffect(() => {
    if (!activeTimer || activeTimer.isPaused) return;

    const interval = setInterval(() => {
      saveToStorage();
    }, 5000);

    return () => clearInterval(interval);
  }, [activeTimer, saveToStorage]);
}
