import type { Category, ActiveTimer } from '../types';
import { getLiveCategoryHours } from './formatTime';

export interface CategoryVariance {
  categoryId: string;
  categoryName: string;
  planned: number;
  actual: number;
  diff: number; // actual - planned
  status: 'over' | 'under' | 'on-track';
}

export function calculateCategoryVariance(category: Category, activeTimer: ActiveTimer | null = null): CategoryVariance {
  const actual = getLiveCategoryHours(category, activeTimer);
  const diff = actual - category.planned;
  
  let status: 'over' | 'under' | 'on-track' = 'on-track';
  if (diff > 0.01) {
    status = 'over';
  } else if (diff < -0.01) {
    status = 'under';
  }

  return {
    categoryId: category.id,
    categoryName: category.name,
    planned: category.planned,
    actual,
    diff,
    status
  };
}

export function calculateDaySummary(categories: Category[], activeTimer: ActiveTimer | null = null) {
  const variances = categories.map(c => calculateCategoryVariance(c, activeTimer));
  const totalPlanned = categories.reduce((sum, c) => sum + c.planned, 0);
  const totalActual = variances.reduce((sum, v) => sum + v.actual, 0);
  const hasOverages = variances.some(v => v.status === 'over');

  return {
    variances,
    totalPlanned,
    totalActual,
    remaining: Math.max(0, 24 - totalActual),
    hasOverages
  };
}
