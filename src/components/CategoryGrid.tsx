import React from 'react';
import { useDayStore } from '../hooks/useDayStore';
import { CategoryCard } from './CategoryCard';

export const CategoryGrid: React.FC = () => {
  const categories = useDayStore(state => state.currentDay?.categories || []);

  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20 min-w-[340px]">
      {categories.map(cat => (
        <CategoryCard key={cat.id} category={cat} />
      ))}
    </div>
  );
};
