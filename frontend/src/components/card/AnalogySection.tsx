import React from 'react';
import { Dumbbell, Snowflake, PieChart, Compass } from 'lucide-react';

interface AnalogySectionProps {
  analogy: string;
  iconName?: string;
}

export function AnalogySection({ analogy, iconName = 'dumbbell' }: AnalogySectionProps) {
  const renderIcon = () => {
    const iconClass = 'w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-indigo-400 flex-shrink-0';
    switch (iconName) {
      case 'dumbbell':
        return <Dumbbell className={iconClass} />;
      case 'snow':
        return <Snowflake className={iconClass} />;
      case 'pie-chart':
        return <PieChart className={iconClass} />;
      default:
        return <Compass className={iconClass} />;
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/15 via-slate-900/80 to-slate-950/90 border border-indigo-500/30 p-2 sm:p-2.5 lg:p-4 shadow-sm hover:border-indigo-500/50 transition-all duration-200 group">
      {/* Subtle corner glow */}
      <div className="absolute -top-6 -right-6 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

      <div className="flex items-center gap-1.5 mb-1 lg:mb-2">
        {renderIcon()}
        <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-indigo-300">
          Grounded Analogy
        </span>
      </div>
      <p className="text-slate-200 text-[10px] sm:text-[11px] lg:text-base leading-snug lg:leading-relaxed break-words italic pl-0.5">
        &ldquo;{analogy}&rdquo;
      </p>
    </div>
  );
}
