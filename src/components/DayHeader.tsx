import React from 'react';
import { useDayStore } from '../hooks/useDayStore';
import { formatTimeFromHours } from '../utils/formatTime';
import { getLiveCategoryHours } from '../utils/formatTime';

export const DayHeader: React.FC = () => {
  const currentDay = useDayStore(state => state.currentDay);

  if (!currentDay) return null;

  // Calculate live used hours across all categories
  const totalUsedHours = currentDay.categories.reduce((sum, cat) => {
    return sum + getLiveCategoryHours(cat, currentDay.activeTimer);
  }, 0);

  const remainingHours = Math.max(0, 24 - totalUsedHours);

  // Format date nicely
  const dateObj = new Date(currentDay.date + 'T00:00:00');
  const dateStr = isNaN(dateObj.getTime())
    ? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const formattedUsed = formatTimeFromHours(totalUsedHours, true);
  const formattedRemaining = formatTimeFromHours(remainingHours, true);

  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Fixed 24-Hour Budget</span>
          <h1 className="text-2xl font-medium text-slate-900 mt-1">{dateStr}</h1>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:w-80">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Used Today</div>
            <div className="text-lg font-mono font-semibold text-slate-800 mt-0.5">
              {formattedUsed}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="text-xs font-medium text-slate-500">Remaining</div>
            <div className={`text-lg font-mono font-semibold mt-0.5 ${
              remainingHours === 0 ? 'text-amber-600' : 'text-blue-600'
            }`}>
              {formattedRemaining}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
