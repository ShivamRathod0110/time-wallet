import React, { useState } from 'react';
import { useDayStore } from '../hooks/useDayStore';
import { 
  formatTimeFromHours, 
  getLiveCategoryHours, 
  getWallClockElapsedHours, 
  getFormattedWallClockTime 
} from '../utils/formatTime';
import { Clock, Zap, ArrowUpRight } from 'lucide-react';

export const DayHeader: React.FC = () => {
  const currentDay = useDayStore(state => state.currentDay);
  const updateCategory = useDayStore(state => state.updateCategory);

  const [selectedCatId, setSelectedCatId] = useState<string>('');

  if (!currentDay) return null;

  // Calculate live used hours across all categories
  const totalUsedHours = currentDay.categories.reduce((sum, cat) => {
    return sum + getLiveCategoryHours(cat, currentDay.activeTimer);
  }, 0);

  const remainingHours = Math.max(0, 24 - totalUsedHours);

  const wallClockHours = getWallClockElapsedHours();
  const unloggedGapHours = Math.max(0, wallClockHours - totalUsedHours);
  const hasUnloggedGap = unloggedGapHours > 0.03; // > ~2 mins gap

  // Default selection for quick log
  const activeSelectedId = selectedCatId || (currentDay.categories[0]?.id ?? '');

  const handleQuickLog = () => {
    if (!activeSelectedId || unloggedGapHours <= 0) return;
    const targetCat = currentDay.categories.find(c => c.id === activeSelectedId);
    if (!targetCat) return;

    updateCategory(activeSelectedId, {
      actual: targetCat.actual + unloggedGapHours
    });
  };

  // Format date nicely
  const dateObj = new Date(currentDay.date + 'T00:00:00');
  const dateStr = isNaN(dateObj.getTime())
    ? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const formattedUsed = formatTimeFromHours(totalUsedHours, true);
  const formattedRemaining = formatTimeFromHours(remainingHours, true);
  const formattedWallClockElapsed = formatTimeFromHours(wallClockHours, false);
  const formattedGap = formatTimeFromHours(unloggedGapHours, false);
  const wallClockPercentage = Math.min(100, Math.round((wallClockHours / 24) * 100));

  return (
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">00:00:00 → 23:59:59 Budget</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <Clock className="w-3 h-3 text-blue-500 animate-pulse" />
              {getFormattedWallClockTime()}
            </span>
          </div>
          <h1 className="text-2xl font-medium text-slate-900 mt-1.5">{dateStr}</h1>
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

      {/* Real-Time Wall Clock Synchronization Banner */}
      <div className="mt-5 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-sm border border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>Real-Time Clock Progress</span>
            </div>
            <div className="text-sm mt-1 text-slate-200">
              Wall Clock Elapsed: <span className="font-mono font-semibold text-white">{formattedWallClockElapsed}</span> ({wallClockPercentage}% of day gone)
            </div>
          </div>

          {hasUnloggedGap ? (
            <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 border border-slate-600/80 p-2 rounded-lg">
              <span className="text-xs text-amber-300 font-medium pl-1">
                Unlogged Gap: <span className="font-mono underline">{formattedGap}</span>
              </span>
              <div className="flex items-center gap-1.5 ml-auto">
                <select
                  value={activeSelectedId}
                  onChange={(e) => setSelectedCatId(e.target.value)}
                  className="bg-slate-900 text-xs text-slate-200 border border-slate-600 rounded px-2 py-1 focus:outline-none focus:border-blue-500 font-medium"
                >
                  {currentDay.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleQuickLog}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-2.5 py-1 rounded transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span>Quick Sync</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1.5 rounded-lg">
              ✓ Wallet logged time matches wall clock
            </div>
          )}
        </div>

        {/* Thin progress bar comparing wall clock to logged time */}
        <div className="mt-3 w-full bg-slate-700/60 rounded-full h-[4px] overflow-hidden relative">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${wallClockPercentage}%` }}
          />
        </div>
      </div>
    </header>
  );
};
