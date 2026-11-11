import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ExplanationSectionProps {
  explanation: string;
}

export function ExplanationSection({ explanation }: ExplanationSectionProps) {
  return (
    <div className="relative rounded-xl bg-gradient-to-br from-emerald-500/10 via-[#faf8f2] to-[#f5f2e7] border border-emerald-600/30 p-2 sm:p-2.5 lg:p-4 shadow-xs hover:border-emerald-500/50 transition-all duration-200 group w-full min-w-0 max-w-full dark:from-emerald-500/15 dark:via-slate-900/80 dark:to-slate-950/90 dark:border-emerald-500/30">
      <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1 lg:mb-2">
        <Lightbulb className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
        <span className="text-[10px] sm:text-[11px] lg:text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          In Plain English
        </span>
      </div>
      <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm lg:text-base leading-snug lg:leading-relaxed break-words hyphens-auto pl-0.5">
        {explanation}
      </p>
    </div>
  );
}
