import React from 'react';
import type { Category } from '../types';
import { useDayStore } from '../hooks/useDayStore';
import { getLiveCategoryHours, formatTimeFromHours, formatVariance } from '../utils/formatTime';
import { ProgressBar } from './ProgressBar';
import { Button } from './Button';
import { Play, Pause, Square, AlertTriangle } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const activeTimer = useDayStore(state => state.currentDay?.activeTimer ?? null);
  const startTimer = useDayStore(state => state.startTimer);
  const pauseTimer = useDayStore(state => state.pauseTimer);
  const resumeTimer = useDayStore(state => state.resumeTimer);
  const stopTimer = useDayStore(state => state.stopTimer);

  const isThisActive = activeTimer !== null && activeTimer?.categoryId === category.id;
  const isRunning = isThisActive && !activeTimer?.isPaused;
  const isPaused = isThisActive && activeTimer?.isPaused;

  const liveHours = getLiveCategoryHours(category, activeTimer);
  const formattedActual = formatTimeFromHours(liveHours, isThisActive);
  const formattedPlanned = `${category.planned}h`;

  const variance = formatVariance(liveHours, category.planned);

  return (
    <div className={`bg-white rounded-xl p-5 border transition-all duration-200 flex flex-col justify-between ${
      isThisActive
        ? 'border-blue-500 bg-blue-50/20 shadow-md ring-1 ring-blue-500/20'
        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
    }`}>
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: category.color || '#3b82f6' }}
            />
            <h3 className="text-[15px] font-medium text-slate-900">{category.name}</h3>
          </div>

          <div className="flex items-center gap-1.5">
            {variance.isOver && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                <AlertTriangle className="w-3 h-3" /> Over by {variance.text.replace('+', '')}
              </span>
            )}
            {isRunning && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 animate-pulse">
                Active
              </span>
            )}
            {isPaused && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                Paused
              </span>
            )}
          </div>
        </div>

        {/* Real-time large display when active */}
        {isThisActive && (
          <div className="my-4 py-2 text-center bg-white/80 rounded-lg border border-blue-100">
            <div className="text-2xl font-mono font-semibold text-blue-600 tracking-tight">
              {formattedActual}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">
              Elapsed Time
            </div>
          </div>
        )}

        <div className="space-y-1.5 my-3">
          <div className="flex justify-between items-center text-[13px] text-slate-500 font-mono">
            <span>{formattedActual}</span>
            <span>/ {formattedPlanned}</span>
          </div>
          <ProgressBar
            actual={liveHours}
            planned={category.planned}
            color={category.color}
            isOver={variance.isOver}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        {!isThisActive ? (
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            onClick={() => startTimer(category.id)}
            className="hover:border-blue-300 hover:text-blue-600 font-medium text-[14px]"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" /> Start
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {isRunning ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={pauseTimer}
                className="text-[14px]"
              >
                <Pause className="w-3.5 h-3.5 mr-1" /> Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={resumeTimer}
                className="text-[14px]"
              >
                <Play className="w-3.5 h-3.5 mr-1 fill-current" /> Resume
              </Button>
            )}
            <Button
              variant="danger"
              size="sm"
              onClick={stopTimer}
              className="text-[14px]"
            >
              <Square className="w-3.5 h-3.5 mr-1 fill-current" /> Stop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
