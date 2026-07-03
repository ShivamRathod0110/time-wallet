import type { Category, ActiveTimer } from '../types';

/**
 * Formats total seconds into human readable string: e.g. "4h 30m" or "4h 30m 15s"
 * Rules: hours only shown if > 0 (or if showZeroHours is true)
 */
export function formatTimeFromSeconds(totalSeconds: number, showSeconds: boolean = false): string {
  const absSeconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = absSeconds % 60;

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  // If hours > 0 or minutes > 0 or we don't show seconds, include minutes
  if (hours > 0 || minutes > 0 || !showSeconds) {
    parts.push(`${minutes}m`);
  }

  if (showSeconds) {
    // If < 1 min, show e.g. "15s" or if hours > 0 "4h 30m 15s"
    parts.push(`${seconds}s`);
  }

  return parts.length > 0 ? parts.join(' ') : '0m';
}

/**
 * Formats decimal hours into "Xh Ym" or "Xh Ym Zs"
 */
export function formatTimeFromHours(hours: number, showSeconds: boolean = false): string {
  const totalSeconds = hours * 3600;
  return formatTimeFromSeconds(totalSeconds, showSeconds);
}

/**
 * Formats variance (e.g. +1h 30m or -0h 15m)
 */
export function formatVariance(actualHours: number, plannedHours: number): {
  text: string;
  isOver: boolean;
  isUnder: boolean;
  diffHours: number;
} {
  const diffHours = actualHours - plannedHours;
  const absSeconds = Math.round(Math.abs(diffHours) * 3600);
  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);

  const isOver = diffHours > (1 / 120); // more than 30 seconds over
  const isUnder = diffHours < -(1 / 120);

  const sign = isOver ? '+' : isUnder ? '-' : '';
  const text = `${sign}${hours}h ${minutes}m`;

  return { text, isOver, isUnder, diffHours };
}

/**
 * Computes live accumulated seconds for a given category right now
 */
export function getLiveCategorySeconds(category: Category, activeTimer: ActiveTimer | null): number {
  const baseSeconds = category.actual * 3600;
  if (!activeTimer || activeTimer.categoryId !== category.id) {
    return baseSeconds;
  }

  if (activeTimer.isPaused) {
    return baseSeconds + activeTimer.accumulatedSecondsBeforeResume;
  }

  const elapsedSinceResume = Math.max(0, Math.floor((Date.now() - activeTimer.lastResumeTimestamp) / 1000));
  return baseSeconds + activeTimer.accumulatedSecondsBeforeResume + elapsedSinceResume;
}

/**
 * Computes live accumulated hours for a given category right now
 */
export function getLiveCategoryHours(category: Category, activeTimer: ActiveTimer | null): number {
  return getLiveCategorySeconds(category, activeTimer) / 3600;
}

/**
 * Returns exact seconds elapsed since local midnight (00:00:00) today
 */
export function getWallClockElapsedSeconds(): number {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
}

/**
 * Returns decimal hours elapsed since local midnight (00:00:00) today
 */
export function getWallClockElapsedHours(): number {
  return getWallClockElapsedSeconds() / 3600;
}

/**
 * Returns local wall clock formatted string HH:MM:SS
 */
export function getFormattedWallClockTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
}
