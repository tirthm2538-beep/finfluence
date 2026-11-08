import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'emerald', size = 'sm' }: BadgeProps) {
  const variantStyles = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    slate: 'bg-slate-800/80 text-slate-300 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 rounded-full font-medium tracking-wide',
    md: 'text-xs px-3 py-1 rounded-full font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border uppercase backdrop-blur-sm ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      {children}
    </span>
  );
}
