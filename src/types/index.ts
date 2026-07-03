export interface Category {
  id: string;                      // e.g., "sleep", "work", "other"
  name: string;                    // e.g., "Sleep", "Work", "Other"
  planned: number;                 // planned decimal hours (e.g., 8, 8.5)
  actual: number;                  // accumulated decimal hours (e.g., 4.25)
  locked: boolean;                 // cannot be edited after day starts
  color?: string;                  // e.g., "#3b82f6", "#10b981"
}

export interface ActiveTimer {
  categoryId: string;
  startTime: number;               // initial timestamp (ms) when timer was first started
  lastResumeTimestamp: number;     // timestamp (ms) when last resumed (or started)
  accumulatedSecondsBeforeResume: number; // seconds accumulated in previous run intervals before the latest resume
  isPaused: boolean;
}

export interface Day {
  date: string;                    // e.g., "2026-07-02" (YYYY-MM-DD)
  totalHours: 24;                  // always 24
  categories: Category[];
  activeTimer: ActiveTimer | null;
  createdAt: string;               // ISO string
  completedAt: string | null;      // ISO string when completed
}

export interface DayStore {
  currentDay: Day | null;
  history: Record<string, Day>;
  
  // Actions
  initializeDay: (template?: { name: string; planned: number; id?: string }[]) => void;
  addCategory: (name: string, hours: number) => void;
  removeCategory: (id: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  startDay: () => void;

  startTimer: (categoryId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;

  rebalanceCategories: (adjustments: Record<string, number>) => void;
  endDay: (review?: { accepted: boolean }) => void;
  continueWorking: () => void;

  // Persistence & tick
  loadFromStorage: () => void;
  saveToStorage: () => void;
  checkAndArchiveNewDay: () => void;
}
