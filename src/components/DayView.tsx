import React, { useState } from 'react';
import { DayHeader } from './DayHeader';
import { CategoryGrid } from './CategoryGrid';
import { ActiveTimerDisplay } from './ActiveTimerDisplay';
import { EndDayButton } from './EndDayButton';
import { ReviewScreen } from './ReviewScreen';

export const DayView: React.FC = () => {
  const [isReviewing, setIsReviewing] = useState(false);

  if (isReviewing) {
    return <ReviewScreen onClose={() => setIsReviewing(false)} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 relative min-h-screen pb-24">
      <DayHeader />
      <CategoryGrid />
      <ActiveTimerDisplay />
      <EndDayButton onReview={() => setIsReviewing(true)} />
    </div>
  );
};
