import React from 'react';

interface ProgressBarProps {
  actual: number;
  planned: number;
  color?: string;
  isOver?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  actual,
  planned,
  color = '#3b82f6',
  isOver = false
}) => {
  const percentage = planned > 0 ? Math.min(100, Math.round((actual / planned) * 100)) : 100;
  const barColor = isOver ? '#f59e0b' : color; // Amber warning color if over

  return (
    <div className="w-full bg-slate-100 rounded-full h-[6px] overflow-hidden relative">
      <div
        className="h-full transition-all duration-300 rounded-full"
        style={{
          width: `${percentage}%`,
          backgroundColor: barColor
        }}
      />
    </div>
  );
};
