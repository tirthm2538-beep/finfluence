import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ExplanationSectionProps {
  explanation: string;
}

export function ExplanationSection({ explanation }: ExplanationSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/15 via-slate-900/80 to-slate-950/90 border border-emerald-500/30 p-2 sm:p-2.5 lg:p-4 shadow-sm hover:border-emerald-500/50 transition-all duration-200 group">
      {/* Subtle corner glow */}
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

      <div className="flex items-center gap-1.5 mb-1 lg:mb-2">
        <Lightbulb className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-emerald-400 flex-shrink-0" />
        <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-emerald-300">
          In Plain English
        </span>
      </div>
      <p className="text-slate-200 text-[10px] sm:text-[11px] lg:text-base leading-snug lg:leading-relaxed break-words pl-0.5">
        {explanation}
      </p>
    </div>
  );
}
