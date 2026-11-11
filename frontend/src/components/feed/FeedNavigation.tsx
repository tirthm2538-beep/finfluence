import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FeedNavigationProps {
  currentIndex: number;
  totalCards: number;
  onPrev: () => void;
  onNext: () => void;
}

export function FeedNavigation({
  currentIndex,
  totalCards,
  onPrev,
  onNext,
}: FeedNavigationProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalCards - 1;

  return (
    <div className="absolute right-3 bottom-2 z-30 flex items-center gap-1 bg-white/95 border border-[#e3decb] px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm pointer-events-auto dark:bg-slate-900/90 dark:border-slate-800">
      <button
        onClick={onPrev}
        disabled={isFirst}
        aria-label="Previous card"
        className={`p-0.5 transition-colors cursor-pointer ${
          isFirst
            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
        }`}
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>

      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 px-0.5">
        {currentIndex + 1}/{totalCards}
      </span>

      <button
        onClick={onNext}
        disabled={isLast}
        aria-label="Next card"
        className={`p-0.5 transition-colors cursor-pointer ${
          isLast
            ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
            : 'text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300'
        }`}
      >
        <ChevronDown className="w-3.5 h-3.5 stroke-[2.8]" />
      </button>
    </div>
  );
}
