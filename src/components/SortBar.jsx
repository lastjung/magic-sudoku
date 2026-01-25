import React from 'react';
import { cn } from '../utils/cn';

export const SortBar = ({ value, max, isComparing, isSwapping, isSorted }) => {
  const height = (value / max) * 100;
  
  return (
    <div 
      className={cn(
        "flex-1 mx-[1px] rounded-t-sm transition-all duration-150",
        isSorted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
        isSwapping ? "bg-rose-500 scale-y-110 z-10 shadow-[0_0_12px_rgba(244,63,94,0.6)]" :
        isComparing ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" :
        "bg-indigo-500/60 hover:bg-indigo-400"
      )}
      style={{ height: `${height}%` }}
    />
  );
};
