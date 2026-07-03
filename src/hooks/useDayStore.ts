import { create } from 'zustand';
import type { Day, DayStore, Category, ActiveTimer } from '../types';
import { getTodayDateString, loadAllDaysFromStorage, saveAllDaysToStorage, getDefaultCategories } from '../utils/storage';

export const useDayStore = create<DayStore>((set, get) => ({
  currentDay: null,
  history: {},

  loadFromStorage: () => {
    const allDays = loadAllDaysFromStorage();
    const today = getTodayDateString();
    const todayData = allDays[today] || null;

    set({
      history: allDays,
      currentDay: todayData
    });
  },

  saveToStorage: () => {
    const { currentDay, history } = get();
    if (!currentDay) return;

    const updatedHistory = {
      ...history,
      [currentDay.date]: currentDay
    };

    saveAllDaysToStorage(updatedHistory);
    set({ history: updatedHistory });
  },

  checkAndArchiveNewDay: () => {
    const { currentDay, history } = get();
    const today = getTodayDateString();

    // If currentDay exists and is from a previous calendar day
    if (currentDay && currentDay.date !== today) {
      // If timer was running, stop it
      if (currentDay.activeTimer) {
        get().stopTimer();
      }

      const archivedDay = {
        ...get().currentDay!,
        completedAt: get().currentDay!.completedAt || new Date().toISOString()
      };

      const updatedHistory = {
        ...history,
        [archivedDay.date]: archivedDay
      };

      saveAllDaysToStorage(updatedHistory);

      set({
        history: updatedHistory,
        currentDay: null
      });
    }
  },

  initializeDay: (template) => {
    const today = getTodayDateString();
    const categories: Category[] = template
      ? template.map(c => ({
          id: c.id || c.name.toLowerCase().replace(/\s+/g, '-'),
          name: c.name,
          planned: c.planned,
          actual: 0,
          locked: false,
          color: c.name.toLowerCase().includes('sleep') ? '#6366f1' :
                 c.name.toLowerCase().includes('work') ? '#3b82f6' : '#10b981'
        }))
      : getDefaultCategories();

    const newDay: Day = {
      date: today,
      totalHours: 24,
      categories,
      activeTimer: null,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    set({ currentDay: newDay });
    get().saveToStorage();
  },

  addCategory: (name, hours) => {
    const { currentDay } = get();
    if (!currentDay) return;
    if (currentDay.categories.length >= 8) return; // Max 8 categories

    const id = name.toLowerCase().trim().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];
    const color = colors[currentDay.categories.length % colors.length];

    const newCategory: Category = {
      id,
      name: name.trim(),
      planned: hours,
      actual: 0,
      locked: false,
      color
    };

    set({
      currentDay: {
        ...currentDay,
        categories: [...currentDay.categories, newCategory]
      }
    });
  },

  removeCategory: (id) => {
    const { currentDay } = get();
    if (!currentDay) return;

    set({
      currentDay: {
        ...currentDay,
        categories: currentDay.categories.filter(c => c.id !== id)
      }
    });
  },

  updateCategory: (id, updates) => {
    const { currentDay } = get();
    if (!currentDay) return;

    set({
      currentDay: {
        ...currentDay,
        categories: currentDay.categories.map(c => c.id === id ? { ...c, ...updates } : c)
      }
    });
  },

  startDay: () => {
    const { currentDay } = get();
    if (!currentDay) return;

    // Lock all categories
    set({
      currentDay: {
        ...currentDay,
        categories: currentDay.categories.map(c => ({ ...c, locked: true }))
      }
    });
    get().saveToStorage();
  },

  startTimer: (categoryId) => {
    const { currentDay } = get();
    if (!currentDay) return;

    // If a timer is already running, stop it first
    if (currentDay.activeTimer) {
      get().stopTimer();
    }

    const now = Date.now();
    const newTimer: ActiveTimer = {
      categoryId,
      startTime: now,
      lastResumeTimestamp: now,
      accumulatedSecondsBeforeResume: 0,
      isPaused: false
    };

    set(state => ({
      currentDay: state.currentDay ? {
        ...state.currentDay,
        activeTimer: newTimer
      } : null
    }));
    get().saveToStorage();
  },

  pauseTimer: () => {
    const { currentDay } = get();
    if (!currentDay || !currentDay.activeTimer || currentDay.activeTimer.isPaused) return;

    const now = Date.now();
    const elapsed = Math.floor((now - currentDay.activeTimer.lastResumeTimestamp) / 1000);

    set({
      currentDay: {
        ...currentDay,
        activeTimer: {
          ...currentDay.activeTimer,
          accumulatedSecondsBeforeResume: currentDay.activeTimer.accumulatedSecondsBeforeResume + Math.max(0, elapsed),
          isPaused: true
        }
      }
    });
    get().saveToStorage();
  },

  resumeTimer: () => {
    const { currentDay } = get();
    if (!currentDay || !currentDay.activeTimer || !currentDay.activeTimer.isPaused) return;

    set({
      currentDay: {
        ...currentDay,
        activeTimer: {
          ...currentDay.activeTimer,
          lastResumeTimestamp: Date.now(),
          isPaused: false
        }
      }
    });
    get().saveToStorage();
  },

  stopTimer: () => {
    const { currentDay } = get();
    if (!currentDay || !currentDay.activeTimer) return;

    const timer = currentDay.activeTimer;
    let totalSeconds = timer.accumulatedSecondsBeforeResume;
    if (!timer.isPaused) {
      totalSeconds += Math.max(0, Math.floor((Date.now() - timer.lastResumeTimestamp) / 1000));
    }

    const addedHours = totalSeconds / 3600;

    set({
      currentDay: {
        ...currentDay,
        categories: currentDay.categories.map(c => 
          c.id === timer.categoryId 
            ? { ...c, actual: c.actual + addedHours }
            : c
        ),
        activeTimer: null
      }
    });
    get().saveToStorage();
  },

  rebalanceCategories: (adjustments) => {
    const { currentDay } = get();
    if (!currentDay) return;

    set({
      currentDay: {
        ...currentDay,
        categories: currentDay.categories.map(c => 
          adjustments[c.id] !== undefined ? { ...c, planned: adjustments[c.id] } : c
        )
      }
    });
    get().saveToStorage();
  },

  endDay: () => {
    const { currentDay } = get();
    if (!currentDay) return;

    if (currentDay.activeTimer) {
      get().stopTimer();
    }

    const completed = {
      ...get().currentDay!,
      completedAt: new Date().toISOString()
    };

    const updatedHistory = {
      ...get().history,
      [completed.date]: completed
    };

    saveAllDaysToStorage(updatedHistory);

    set({
      history: updatedHistory,
      currentDay: null // Clearing currentDay starts a new day setup!
    });
  },

  continueWorking: () => {
    // Keeps current day open
    const { currentDay } = get();
    if (!currentDay) return;
    get().saveToStorage();
  }
}));
