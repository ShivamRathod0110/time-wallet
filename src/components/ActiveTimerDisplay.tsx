import React, { useState } from 'react';
import { useDayStore } from '../hooks/useDayStore';
import { getLiveCategoryHours, formatTimeFromHours } from '../utils/formatTime';
import { Play, Pause, Square, Maximize2, Minimize2 } from 'lucide-react';

export const ActiveTimerDisplay: React.FC = () => {
  const activeTimer = useDayStore(state => state.currentDay?.activeTimer);
  const categories = useDayStore(state => state.currentDay?.categories || []);
  const pauseTimer = useDayStore(state => state.pauseTimer);
  const resumeTimer = useDayStore(state => state.resumeTimer);
  const stopTimer = useDayStore(state => state.stopTimer);

  const [isFocusMode, setIsFocusMode] = useState(false);

  if (!activeTimer) return null;

  const activeCategory = categories.find(c => c.id === activeTimer.categoryId);
  if (!activeCategory) return null;

  const liveHours = getLiveCategoryHours(activeCategory, activeTimer);
  const formattedTime = formatTimeFromHours(liveHours, true);
  const isRunning = !activeTimer.isPaused;

  if (isFocusMode) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white animate-in fade-in duration-200">
        <button
          onClick={() => setIsFocusMode(false)}
          className="absolute top-6 right-6 p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          title="Exit Focus Mode"
        >
          <Minimize2 className="w-6 h-6" />
        </button>

        <div className="text-center max-w-md">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-6">
            Focus Mode
          </span>
          <h2 className="text-3xl font-medium text-slate-100 mb-2">{activeCategory.name}</h2>
          <div className="text-7xl font-mono font-bold tracking-tight my-8 text-white">
            {formattedTime}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            {isRunning ? (
              <button
                onClick={pauseTimer}
                className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium flex items-center gap-2 transition-all"
              >
                <Pause className="w-5 h-5" /> Pause
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 transition-all"
              >
                <Play className="w-5 h-5 fill-current" /> Resume
              </button>
            )}
            <button
              onClick={() => {
                stopTimer();
                setIsFocusMode(false);
              }}
              className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium flex items-center gap-2 transition-all"
            >
              <Square className="w-5 h-5 fill-current" /> Stop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-16 right-6 z-40 bg-white border border-blue-200 rounded-xl p-3.5 shadow-lg flex items-center gap-4 max-w-sm animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2.5">
        <span
          className="w-3 h-3 rounded-full animate-pulse shrink-0"
          style={{ backgroundColor: activeCategory.color || '#3b82f6' }}
        />
        <div>
          <div className="text-xs font-medium text-slate-500 line-clamp-1">{activeCategory.name}</div>
          <div className="text-base font-mono font-semibold text-slate-900">{formattedTime}</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-auto border-l border-slate-100 pl-3">
        <button
          onClick={() => setIsFocusMode(true)}
          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Enter Focus Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
