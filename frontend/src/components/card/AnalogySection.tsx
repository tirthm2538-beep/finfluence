import React from 'react';
import { Dumbbell, Snowflake, PieChart, Compass } from 'lucide-react';

interface AnalogySectionProps {
  analogy: string;
  iconName?: string;
}

export function AnalogySection({ analogy, iconName = 'dumbbell' }: AnalogySectionProps) {
  const renderIcon = () => {
    switch (iconName) {
      case 'dumbbell':
        return <Dumbbell className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />;
      case 'snow':
        return <Snowflake className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />;
      case 'pie-chart':
        return <PieChart className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />;
      default:
        return <Compass className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500/10 via-slate-900/70 to-slate-900/90 border border-indigo-500/25 p-1.5 sm:p-2 shadow-sm">
      <div className="flex items-center gap-1 mb-0.5">
        {renderIcon()}
        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-300">
          Grounded Analogy
        </span>
      </div>
      <p className="text-slate-200 text-[10px] sm:text-[11px] leading-snug break-words italic pl-0.5">
        &ldquo;{analogy}&rdquo;
      </p>
    </div>
  );
}
