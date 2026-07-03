import React, { useState } from 'react';
import { useDayStore } from '../hooks/useDayStore';
import { Button } from './Button';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TemplateCategory {
  id: string;
  name: string;
  planned: number;
}

export const DayInitScreen: React.FC = () => {
  const initializeDay = useDayStore(state => state.initializeDay);
  const startDay = useDayStore(state => state.startDay);

  const [categories, setCategories] = useState<TemplateCategory[]>([
    { id: 'sleep', name: 'Sleep', planned: 8 },
    { id: 'work', name: 'Work', planned: 8 },
    { id: 'other', name: 'Other', planned: 8 }
  ]);

  const totalHours = Number(categories.reduce((sum, c) => sum + (c.planned || 0), 0).toFixed(2));
  const isValid = Math.abs(totalHours - 24) < 0.01 && categories.every(c => c.name.trim() !== '' && c.planned > 0);

  const handleNameChange = (index: number, name: string) => {
    const next = [...categories];
    next[index].name = name;
    setCategories(next);
  };

  const handleHoursChange = (index: number, hoursStr: string) => {
    const hours = parseFloat(hoursStr) || 0;
    const next = [...categories];
    next[index].planned = hours;
    setCategories(next);
  };

  const addCategory = () => {
    if (categories.length >= 8) return;
    const remaining = Math.max(0, Number((24 - totalHours).toFixed(2)));
    setCategories([
      ...categories,
      {
        id: `cat-${Date.now()}`,
        name: `Category ${categories.length + 1}`,
        planned: remaining > 0 ? remaining : 2
      }
    ]);
  };

  const removeCategory = (index: number) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter((_, i) => i !== index));
  };

  const applyTemplate = (templateName: string) => {
    if (templateName === 'default') {
      setCategories([
        { id: 'sleep', name: 'Sleep', planned: 8 },
        { id: 'work', name: 'Work', planned: 8 },
        { id: 'other', name: 'Other', planned: 8 }
      ]);
    } else if (templateName === 'student') {
      setCategories([
        { id: 'sleep', name: 'Sleep', planned: 8 },
        { id: 'classes', name: 'Classes', planned: 6 },
        { id: 'study', name: 'Study', planned: 4 },
        { id: 'life', name: 'Life & Leisure', planned: 6 }
      ]);
    } else if (templateName === 'worker') {
      setCategories([
        { id: 'sleep', name: 'Sleep', planned: 8 },
        { id: 'work', name: 'Work', planned: 9 },
        { id: 'commute', name: 'Commute', planned: 1 },
        { id: 'personal', name: 'Personal', planned: 6 }
      ]);
    }
  };

  const handleStartDay = () => {
    if (!isValid) return;
    initializeDay(categories);
    startDay();
  };

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            Daily Budget Setup
          </span>
          <h1 className="text-2xl font-medium text-slate-900 mt-2">{dateStr}</h1>
          <p className="text-sm text-slate-500 mt-1">
            Allocate your fixed 24-hour budget across your custom categories to design your intentional day.
          </p>
        </div>

        {/* Quick Templates */}
        <div className="mb-6 p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-600">Templates:</span>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => applyTemplate('default')}
              className="text-xs bg-white border border-slate-200 hover:border-blue-400 px-2.5 py-1 rounded-md text-slate-700 transition-colors"
            >
              8/8/8 Balanced
            </button>
            <button
              onClick={() => applyTemplate('student')}
              className="text-xs bg-white border border-slate-200 hover:border-blue-400 px-2.5 py-1 rounded-md text-slate-700 transition-colors"
            >
              Student
            </button>
            <button
              onClick={() => applyTemplate('worker')}
              className="text-xs bg-white border border-slate-200 hover:border-blue-400 px-2.5 py-1 rounded-md text-slate-700 transition-colors"
            >
              9-to-5 Worker
            </button>
          </div>
        </div>

        {/* Category Inputs */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center px-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
            <span>Category Name</span>
            <span>Hours (24h Total)</span>
          </div>

          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input
                type="text"
                value={cat.name}
                onChange={(e) => handleNameChange(idx, e.target.value)}
                placeholder="Category name"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="relative w-28">
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="24"
                  value={cat.planned || ''}
                  onChange={(e) => handleHoursChange(idx, e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-7 py-2 text-sm text-right font-mono text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">h</span>
              </div>
              <button
                type="button"
                onClick={() => removeCategory(idx)}
                disabled={categories.length <= 1}
                className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-30 disabled:hover:text-slate-400 rounded-lg hover:bg-slate-50 transition-colors"
                title="Remove category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {categories.length < 8 && (
            <button
              type="button"
              onClick={addCategory}
              className="w-full py-2 border border-dashed border-slate-200 hover:border-slate-300 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1.5 transition-all mt-2"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category (Max 8)
            </button>
          )}
        </div>

        {/* Total & Validation */}
        <div className={`p-4 rounded-xl border flex items-center justify-between mb-6 ${
          isValid
            ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {isValid ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <div className="text-sm font-medium">
                Allocated: <span className="font-mono font-semibold">{totalHours}h</span> / 24h
              </div>
              {!isValid && (
                <div className="text-xs mt-0.5 opacity-80">
                  {totalHours < 24 ? `Add ${(24 - totalHours).toFixed(2)}h more to reach 24 hours.` : `Reduce ${(totalHours - 24).toFixed(2)}h to reach 24 hours.`}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Save & Start */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid}
          onClick={handleStartDay}
          className="shadow-sm font-medium"
        >
          Start Day
        </Button>
      </div>
    </div>
  );
};
