import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ExplanationSectionProps {
  explanation: string;
}

export function ExplanationSection({ explanation }: ExplanationSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-slate-900/90 border border-emerald-500/25 p-1.5 sm:p-2 shadow-sm">
      <div className="flex items-center gap-1 mb-0.5">
        <Lightbulb className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
          In Plain English
        </span>
      </div>
      <p className="text-slate-200 text-[10px] sm:text-[11px] leading-snug break-words pl-0.5">
        {explanation}
      </p>
    </div>
  );
}
