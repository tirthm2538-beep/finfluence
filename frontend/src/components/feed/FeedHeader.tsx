import React from 'react';
import {
  TrendingUp,
  Volume2,
  ShieldCheck,
  User,
  LogOut,
  Flame,
  Sparkles,
  Briefcase,
} from 'lucide-react';
import { AuthUser } from '../../lib/supabase';

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
    <header className="relative z-20 flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md w-full min-w-0">
      {/* Brand logo & Daily Streak */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-sm">
          <TrendingUp className="w-3 h-3 text-slate-950 stroke-[2.5]" />
        </div>
        <span className="text-xs sm:text-sm font-black tracking-tight text-white hidden xxs:inline">
          Fin<span className="text-emerald-400">Fluence</span>
        </span>

        {/* Real Dynamic Daily Streak Badge */}
        <div
          title={`Daily Learning Streak: ${streak} day(s)`}
          className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] text-amber-300 font-bold shadow-sm shadow-amber-500/10 animate-fade-in"
        >
          <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400 animate-pulse" />
          <span>{streak} {streak === 1 ? 'day' : 'days'}</span>
        </div>
      </div>

      {/* Practice Portfolio Simulator Shortcut */}
      {onOpenPortfolio && (
        <button
          onClick={onOpenPortfolio}
          title="Open Practice Portfolio Simulator"
          className="flex items-center gap-1 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors cursor-pointer shadow-sm shadow-emerald-500/10 animate-fade-in"
        >
          <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
          <span>₹1L Sandbox</span>
        </button>
      )}

      {/* User identity & Controls */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* User Badge with XP */}
        {user && (
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded-full text-[9px] text-slate-300">
            <User className="w-2.5 h-2.5 text-emerald-400" />
            <span className="font-medium max-w-[55px] sm:max-w-[85px] truncate">
              {userIdentifier}
            </span>
            {xp > 0 && (
              <span className="text-emerald-400 font-bold flex items-center gap-0.5 text-[8px] bg-emerald-500/10 px-1 rounded">
                <Sparkles className="w-2 h-2" />
                {xp}
              </span>
            )}
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Log Out"
                aria-label="Log Out"
                className="ml-0.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        )}

        {/* Counter */}
        <span className="text-[9px] sm:text-[10px] font-semibold text-slate-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-800">
          {currentIndex + 1}/{totalCards}
        </span>

        {/* Audio Toggle */}
        <button
          onClick={() => alert('Audio explanations coming in Phase 2!')}
          aria-label="Toggle Audio"
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <Volume2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </button>
      </div>
    </header>
  );
}
