import { useDayStore } from './hooks/useDayStore';
import { useLocalStorageSync } from './hooks/useLocalStorage';
import { useLiveTimerTick } from './hooks/useTimer';
import { DayInitScreen } from './components/DayInitScreen';
import { DayView } from './components/DayView';
import { Wallet, History } from 'lucide-react';

export default function App() {
  // Sync state with localStorage & handle 5s auto-saves
  useLocalStorageSync();
  // Live 1s re-render when timer is active
  useLiveTimerTick();

  const currentDay = useDayStore(state => state.currentDay);
  const history = useDayStore(state => state.history);

  const isDayStarted = currentDay !== null && currentDay.categories.some(c => c.locked);
  const archivedCount = Object.keys(history).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Brand Bar */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-40 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-tight text-slate-800 text-base">
              Time Wallet
            </span>
            <span className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
              Daily Budget
            </span>
          </div>

          <div className="flex items-center gap-3">
            {archivedCount > 0 && (
              <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <History className="w-3.5 h-3.5 text-slate-400" />
                <span>{archivedCount} {archivedCount === 1 ? 'day' : 'days'} archived</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {!isDayStarted ? (
          <DayInitScreen />
        ) : (
          <DayView />
        )}
      </main>
    </div>
  );
}
