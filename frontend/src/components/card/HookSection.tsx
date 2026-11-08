import React from 'react';
import { Sparkles } from 'lucide-react';

interface HookSectionProps {
  hook: string;
}

export function HookSection({ hook }: HookSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-500/10 via-slate-900/70 to-slate-900/90 border border-amber-500/25 p-1.5 sm:p-2 shadow-sm">
      <div className="flex items-center gap-1 mb-0.5">
        <Sparkles className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300">
          The Real Talk Hook
        </span>
      </div>
      <p className="text-slate-100 text-[10px] sm:text-[11px] font-medium leading-snug break-words pl-0.5">
        &ldquo;{hook}&rdquo;
      </p>
    </div>
  );
}
