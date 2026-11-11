import React from 'react';
import {
  TrendingUp,
  Flame,
  Sparkles,
  Briefcase,
  User,
  LogOut,
} from 'lucide-react';
import { AuthUser } from '../../lib/supabase';
import { ThemeToggle } from '../ui/ThemeToggle';

interface FeedHeaderProps {
  activeTrackTitle: string;
  currentIndex?: number;
  totalCards?: number;
  user?: AuthUser | null;
  streak?: number;
  xp?: number;
  bookmarksCount?: number;
  onSignOut?: () => void;
  onOpenPortfolio?: () => void;
}

export function FeedHeader({
  activeTrackTitle,
  currentIndex = 0,
  totalCards = 1,
  user,
  streak = 1,
  xp = 0,
  bookmarksCount = 0,
  onSignOut,
  onOpenPortfolio,
}: FeedHeaderProps) {
  const userIdentifier = user?.isGuest
    ? 'Guest'
    : user?.email
    ? user.email.split('@')[0]
    : 'User';

  return (
    <header className="relative z-20 flex items-center justify-between px-3 py-1.5 border-b border-[#e3decb] bg-white/90 backdrop-blur-md w-full max-w-full overflow-hidden flex-shrink-0 dark:border-slate-800/80 dark:bg-slate-950/80">
      {/* Left: Brand logo & Streak */}
      <div className="flex items-center gap-1.5 flex-shrink min-w-0">
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xs flex-shrink-0">
          <TrendingUp className="w-3 h-3 text-white stroke-[2.8]" />
        </div>
        <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white hidden sm:inline truncate">
          Fin<span className="text-emerald-600 dark:text-emerald-400">Fluence</span>
        </span>

        {/* Dynamic Streak Badge */}
        <div
          title={`Daily Learning Streak: ${streak} day(s)`}
          className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full text-[10px] text-amber-800 font-bold dark:text-amber-300 flex-shrink-0"
        >
          <Flame className="w-3 h-3 fill-amber-500 text-amber-500 flex-shrink-0" />
          <span>{streak}d</span>
        </div>
      </div>

      {/* Center: Practice Portfolio Shortcut */}
      {onOpenPortfolio && (
        <button
          onClick={onOpenPortfolio}
          title="Open Practice Portfolio Simulator"
          className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-600/30 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer shadow-xs dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:border-emerald-500/40 dark:text-emerald-300 flex-shrink-0 mx-1"
        >
          <Briefcase className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>₹1L Sandbox</span>
        </button>
      )}

      {/* Right: Theme Toggle & User identity */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <ThemeToggle compact={true} />

        {user && (
          <div className="flex items-center gap-1 bg-[#f5f3ec] border border-[#e3decb] px-2 py-0.5 rounded-full text-[10px] text-slate-800 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
            <User className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold max-w-[50px] xs:max-w-[70px] truncate">
              {userIdentifier}
            </span>
            {xp > 0 && (
              <span className="text-emerald-800 font-bold flex items-center gap-0.5 text-[9px] bg-emerald-500/15 px-1 rounded dark:text-emerald-300">
                <Sparkles className="w-2 h-2" />
                {xp}
              </span>
            )}
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Log Out"
                aria-label="Log Out"
                className="ml-0.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
