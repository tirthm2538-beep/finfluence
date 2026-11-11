import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'emerald', size = 'sm' }: BadgeProps) {
  const variantStyles = {
    emerald: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-bold',
    amber: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 font-bold',
    blue: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30 font-bold',
    purple: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30 font-bold',
    slate: 'bg-[#f0ece1] text-slate-800 border-[#ded8c4] dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 font-semibold',
  };

  const sizeStyles = {
    sm: 'text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full tracking-wide',
    md: 'text-xs px-3 py-1 rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border uppercase backdrop-blur-sm ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
