import React from 'react';
import type { Category, ActiveTimer } from '../types';
import { calculateCategoryVariance } from '../utils/calculateVariance';
import { formatTimeFromHours } from '../utils/formatTime';
import { Check, AlertTriangle } from 'lucide-react';

interface SummaryTableProps {
  categories: Category[];
  activeTimer: ActiveTimer | null;
}

export const SummaryTable: React.FC<SummaryTableProps> = ({ categories, activeTimer }) => {
  const variances = categories.map(c => calculateCategoryVariance(c, activeTimer));

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Planned</th>
            <th className="py-3 px-4">Actual</th>
            <th className="py-3 px-4">Variance</th>
            <th className="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {variances.map(v => {
            const absDiff = Math.abs(v.diff);
            const formattedDiff = formatTimeFromHours(absDiff);
            const sign = v.diff > 0.01 ? '+' : v.diff < -0.01 ? '-' : '';

            return (
              <tr key={v.categoryId} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 px-4 font-medium text-slate-900 flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: categories.find(c => c.id === v.categoryId)?.color || '#3b82f6' }}
                  />
                  {v.categoryName}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600">
                  {v.planned}h
                </td>
                <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                  {formatTimeFromHours(v.actual)}
                </td>
                <td className="py-3.5 px-4 font-mono">
                  <span className={
                    v.status === 'over' ? 'text-amber-600 font-semibold' :
                    v.status === 'under' ? 'text-slate-500' : 'text-emerald-600'
                  }>
                    {sign}{formattedDiff}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {v.status === 'over' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                      <AlertTriangle className="w-3 h-3" /> Over
                    </span>
                  ) : v.status === 'under' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      <Check className="w-3 h-3" /> Under
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                      <Check className="w-3 h-3" /> Balanced
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
