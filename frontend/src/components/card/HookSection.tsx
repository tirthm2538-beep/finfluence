import React from 'react';
import { Sparkles } from 'lucide-react';

interface HookSectionProps {
  hook: string;
}

export function HookSection({ hook }: HookSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-500/10 via-[#faf8f2] to-[#f5f2e7] border border-amber-500/30 p-2.5 sm:p-3 lg:p-4 shadow-xs hover:border-amber-500/50 transition-all duration-200 group w-full min-w-0 max-w-full dark:from-amber-500/15 dark:via-slate-900/80 dark:to-slate-950/90 dark:border-amber-500/30">
      <div className="flex items-center gap-1.5 mb-1 lg:mb-2">
        <Sparkles className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span className="text-[10px] sm:text-[11px] lg:text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
          The Real Talk Hook
        </span>
      </div>
      <p className="text-slate-900 dark:text-slate-100 text-xs sm:text-sm lg:text-base font-medium leading-snug lg:leading-relaxed break-words hyphens-auto pl-0.5">
        &ldquo;{hook}&rdquo;
      </p>
    </div>
  );
}
