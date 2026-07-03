import React, { useState } from 'react';
import { useDayStore } from '../hooks/useDayStore';
import { SummaryTable } from './SummaryTable';
import { Button } from './Button';
import { calculateDaySummary } from '../utils/calculateVariance';
import { formatTimeFromHours } from '../utils/formatTime';
import { AlertCircle, CheckCircle2, Sliders, Sparkles } from 'lucide-react';

interface ReviewScreenProps {
  onClose: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({ onClose }) => {
  const currentDay = useDayStore(state => state.currentDay);
  const rebalanceCategories = useDayStore(state => state.rebalanceCategories);
  const endDay = useDayStore(state => state.endDay);

  const [mode, setMode] = useState<'review' | 'manual'>('review');
  const [manualAdjustments, setManualAdjustments] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    currentDay?.categories.forEach(c => {
      init[c.id] = c.planned;
    });
    return init;
  });

  if (!currentDay) return null;

  const summary = calculateDaySummary(currentDay.categories, currentDay.activeTimer);
  const overageCategories = summary.variances.filter(v => v.status === 'over');
  const underCategories = summary.variances.filter(v => v.status === 'under');

  const totalManualHours = Number(Object.values(manualAdjustments).reduce((sum, val) => sum + (val || 0), 0).toFixed(2));
  const isManualValid = Math.abs(totalManualHours - 24) < 0.01;

  const handleManualHoursChange = (id: string, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    setManualAdjustments(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleConfirmManualRebalance = () => {
    if (!isManualValid) return;
    rebalanceCategories(manualAdjustments);
    setMode('review');
  };

  const handleAutoBorrow = () => {
    // Borrow from under-used categories to cover overages
    const updates: Record<string, number> = {};
    let totalOverage = 0;

    overageCategories.forEach(o => {
      totalOverage += o.diff;
      updates[o.categoryId] = Number((o.planned + o.diff).toFixed(2));
    });

    // Deduct proportional amount from under categories
    const totalUnderDiff = underCategories.reduce((sum, u) => sum + Math.abs(u.diff), 0);

    underCategories.forEach(u => {
      if (totalUnderDiff > 0) {
        const share = (Math.abs(u.diff) / totalUnderDiff) * totalOverage;
        updates[u.categoryId] = Math.max(0.25, Number((u.planned - share).toFixed(2)));
      }
    });

    // Final normalization to ensure exactly 24
    let currentSum = 0;
    currentDay.categories.forEach(c => {
      const val = updates[c.id] !== undefined ? updates[c.id] : c.planned;
      currentSum += val;
    });

    if (Math.abs(currentSum - 24) > 0.001 && underCategories.length > 0) {
      const targetId = underCategories[0].categoryId;
      updates[targetId] = Number((updates[targetId] + (24 - currentSum)).toFixed(2));
    }

    rebalanceCategories(updates);
  };

  const handleSaveDay = () => {
    endDay({ accepted: true });
  };

  const overageText = overageCategories.map(o => `${o.categoryName} overran by ${formatTimeFromHours(o.diff)}`).join(', ');

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            End of Day Review
          </span>
          <h1 className="text-2xl font-medium text-slate-900 mt-2">Today's summary</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review your planned vs. actual time usage before archiving today's wallet.
          </p>
        </div>

        {/* Summary Table */}
        <div className="mb-8">
          <SummaryTable categories={currentDay.categories} activeTimer={currentDay.activeTimer} />
        </div>

        {/* Rebalance Section if overages exist */}
        {summary.hasOverages && mode === 'review' && (
          <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-5 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-900">Over-budget Allocation Notice</h4>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  {overageText}. Adjust your planned allocation:
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {}} // Accept & save keeps planned as is
                className="bg-white text-xs"
              >
                Accept & Save (Keep Planned)
              </Button>
              {underCategories.length > 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAutoBorrow}
                  className="bg-white text-xs border-blue-200 hover:border-blue-400 text-blue-700 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Borrow from Other
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setMode('manual')}
                className="bg-white text-xs flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" /> Manual rebalance
              </Button>
            </div>
          </div>
        )}

        {/* Manual Rebalance UI */}
        {mode === 'manual' && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-slate-800 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" /> Manual Allocation Rebalance
              </h4>
              <button
                onClick={() => setMode('review')}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {currentDay.categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between gap-4 bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium text-slate-800">{cat.name}</span>
                    <span className="text-xs text-slate-400 font-mono">(Actual: {formatTimeFromHours(cat.actual)})</span>
                  </div>
                  <div className="relative w-28">
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      value={manualAdjustments[cat.id] ?? cat.planned}
                      onChange={(e) => handleManualHoursChange(cat.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md pl-2.5 pr-6 py-1.5 text-sm text-right font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">h</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs">
                {isManualValid ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Total: {totalManualHours}h / 24h
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Total: {totalManualHours}h (Must equal 24h)
                  </span>
                )}
              </div>
              <Button
                variant="primary"
                size="sm"
                disabled={!isManualValid}
                onClick={handleConfirmManualRebalance}
              >
                Confirm Rebalance
              </Button>
            </div>
          </div>
        )}

        {/* End Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <Button
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Continue working
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSaveDay}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Save day & start new
          </Button>
        </div>
      </div>
    </div>
  );
};
