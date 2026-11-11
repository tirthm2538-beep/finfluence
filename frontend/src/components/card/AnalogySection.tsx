import React from 'react';
import { Dumbbell, Snowflake, PieChart, Compass } from 'lucide-react';

interface AnalogySectionProps {
  analogy: string;
  iconName?: string;
}

export function AnalogySection({ analogy, iconName = 'dumbbell' }: AnalogySectionProps) {
  const renderIcon = () => {
    const iconClass = 'w-3.5 h-3.5 lg:w-4 lg:h-4 text-teal-700 dark:text-indigo-400 flex-shrink-0';
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
    <div className="relative rounded-xl bg-gradient-to-br from-teal-500/10 via-[#faf8f2] to-[#f5f2e7] border border-teal-600/30 p-2 sm:p-2.5 lg:p-4 shadow-xs hover:border-teal-500/50 transition-all duration-200 group w-full min-w-0 max-w-full dark:from-indigo-500/15 dark:via-slate-900/80 dark:to-slate-950/90 dark:border-indigo-500/30">
      <div className="flex items-center gap-1.5 mb-0.5 sm:mb-1 lg:mb-2">
        {renderIcon()}
        <span className="text-[10px] sm:text-[11px] lg:text-xs font-black uppercase tracking-wider text-teal-800 dark:text-indigo-300">
          Grounded Analogy
        </span>
      </div>
      <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm lg:text-base leading-snug lg:leading-relaxed break-words hyphens-auto italic pl-0.5">
        &ldquo;{analogy}&rdquo;
      </p>
    </div>
  );
}
