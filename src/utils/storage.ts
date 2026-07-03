import type { Day } from '../types';

export const STORAGE_KEY = 'time-budget-days';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadAllDaysFromStorage(): Record<string, Day> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Day>;
  } catch (err) {
    console.error('Failed to load days from storage:', err);
    return {};
  }
}

export function saveAllDaysToStorage(days: Record<string, Day>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
  } catch (err) {
    console.error('Failed to save days to storage:', err);
  }
}

export function getDefaultCategories() {
  return [
    { id: 'sleep', name: 'Sleep', planned: 8, actual: 0, locked: false, color: '#6366f1' },
    { id: 'work', name: 'Work', planned: 8, actual: 0, locked: false, color: '#3b82f6' },
    { id: 'other', name: 'Other', planned: 8, actual: 0, locked: false, color: '#10b981' },
  ];
}
