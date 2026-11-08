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
    <div className="absolute right-2 bottom-1.5 z-30 flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded-full shadow-md backdrop-blur-sm pointer-events-auto">
      <button
        onClick={onPrev}
        disabled={isFirst}
        aria-label="Previous card"
        className={`p-0.5 transition-colors cursor-pointer ${isFirst ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300 active:text-white hover:text-white'}`}
      >
        <ChevronUp className="w-3 h-3" />
      </button>

      <span className="text-[9px] font-semibold text-slate-400 px-0.5">
        {currentIndex + 1}/{totalCards}
      </span>

      <button
        onClick={onNext}
        disabled={isLast}
        aria-label="Next card"
        className={`p-0.5 transition-colors cursor-pointer ${isLast ? 'text-slate-600 cursor-not-allowed' : 'text-emerald-400 active:text-emerald-300 hover:text-emerald-300'}`}
      >
        <ChevronDown className="w-3 h-3 stroke-[2.5]" />
      </button>
    </div>
  );
}
