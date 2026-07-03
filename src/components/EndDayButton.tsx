import React from 'react';
import { Button } from './Button';
import { CheckSquare } from 'lucide-react';

interface EndDayButtonProps {
  onReview: () => void;
}

export const EndDayButton: React.FC<EndDayButtonProps> = ({ onReview }) => {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 py-3.5 px-4 sm:px-6 mt-8 z-30">
      <div className="max-w-4xl mx-auto flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={onReview}
          className="shadow-xs"
        >
          <CheckSquare className="w-4 h-4 mr-2" /> End Day & Review
        </Button>
      </div>
    </div>
  );
};
