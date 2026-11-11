'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StoryCardData } from '../../types/card';
import { StoryCard } from '../card/StoryCard';
import { AuthUser } from '../../lib/supabase';
import {
  UserProgressData,
  loadUserProgress,
  recordQuizCompletion,
  toggleBookmark,
} from '../../lib/userProgress';
import {
  Flame,
  Sparkles,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Compass,
  Award,
  ExternalLink,
} from 'lucide-react';

interface DesktopStoryDashboardProps {
  cards: StoryCardData[];
  user: AuthUser;
  onSignOut?: () => void;
  onOpenPortfolio?: () => void;
  onSwitchToPhoneView?: () => void;
  dataSource?: 'backend' | 'fallback' | null;
  onSyncBackend?: () => void;
  isSyncing?: boolean;
}

export function DesktopStoryDashboard({
  cards,
  user,
  onSignOut,
  onOpenPortfolio,
  onSwitchToPhoneView,
  dataSource,
  onSyncBackend,
  isSyncing = false,
}: DesktopStoryDashboardProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [activeTrackFilter, setActiveTrackFilter] = useState<'all' | 'core-finance' | 'stock-market' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [progress, setProgress] = useState<UserProgressData | null>(null);

  // Load user progress
  useEffect(() => {
    if (user) {
      loadUserProgress(user).then((p) => {
        setProgress(p);
      });
    }
  }, [user]);

  // Keep selectedCardId valid if cards change
  useEffect(() => {
    if (cards.length > 0 && !cards.some((c) => c.id === selectedCardId)) {
      setSelectedCardId(cards[0].id);
    }
  }, [cards, selectedCardId]);

  // Support URL search params for direct track or card preview
  useEffect(() => {
    if (typeof window !== 'undefined' && cards.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const cardParam = params.get('card');
      if (cardParam && cards.some((c) => c.id === cardParam)) {
        setSelectedCardId(cardParam);
      }
      const trackParam = params.get('track');
      if (trackParam === 'stock-market' || trackParam === 'core-finance') {
        setActiveTrackFilter(trackParam);
        const match = cards.find((c) => c.track === trackParam);
        if (match) setSelectedCardId(match.id);
      }
    }
  }, [cards]);

  // Filtered cards based on track and search query
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Track filter
      if (activeTrackFilter === 'core-finance' && card.track !== 'core-finance') return false;
      if (activeTrackFilter === 'stock-market' && card.track !== 'stock-market') return false;
      if (activeTrackFilter === 'saved' && !progress?.bookmarkedCardIds.includes(card.id)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = card.conceptTitle.toLowerCase().includes(query);
        const matchTag = card.tag.toLowerCase().includes(query);
        const matchHook = card.hook.toLowerCase().includes(query);
        return matchTitle || matchTag || matchHook;
      }

      return true;
    });
  }, [cards, activeTrackFilter, searchQuery, progress?.bookmarkedCardIds]);

  // Current active card
  const currentIndex = cards.findIndex((c) => c.id === selectedCardId);
  const activeCard = cards[currentIndex] || cards[0];

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setSelectedCardId(cards[currentIndex + 1].id);
    }
  }, [currentIndex, cards]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setSelectedCardId(cards[currentIndex - 1].id);
    }
  }, [currentIndex, cards]);

  // Keyboard navigation (ArrowLeft / ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Handler for quiz completion
  const handleQuizComplete = async (cardId: string, track: string) => {
    if (!user) return;
    const current = progress || {
      userId: user.id,
      isGuest: Boolean(user.isGuest),
      xpPoints: 0,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: '',
      completedCardIds: [],
      bookmarkedCardIds: [],
    };
    const updated = await recordQuizCompletion(user, current, cardId, track);
    setProgress(updated);
  };

  // Handler for bookmark toggle
  const handleToggleBookmark = async (cardId: string) => {
    if (!user) return;
    const current = progress || {
      userId: user.id,
      isGuest: Boolean(user.isGuest),
      xpPoints: 0,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: '',
      completedCardIds: [],
      bookmarkedCardIds: [],
    };
    const updated = await toggleBookmark(user, current, cardId);
    setProgress(updated);
  };

  const completedCount = progress?.completedCardIds.length ?? 0;
  const bookmarksCount = progress?.bookmarkedCardIds.length ?? 0;
  const xpPoints = progress?.xpPoints ?? 0;
  const streak = progress?.currentStreak ?? 1;

  // Calculate Level / Rank
  const getRank = () => {
    if (completedCount >= 18) return { label: 'Wall Street Prodigy 🏆', color: 'text-amber-400' };
    if (completedCount >= 12) return { label: 'Market Strategist ⚡', color: 'text-cyan-400' };
    if (completedCount >= 6) return { label: 'Compound Crusader 🚀', color: 'text-emerald-400' };
    return { label: 'Finance Novice 🌱', color: 'text-slate-300' };
  };

  const currentRank = getRank();
  const isCurrentCardCompleted = progress?.completedCardIds.includes(activeCard?.id) ?? false;
  const isCurrentCardSaved = progress?.bookmarkedCardIds.includes(activeCard?.id) ?? false;

  return (
    <div className="w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* 1. Desktop Top Navigation Header */}
      <header className="h-16 w-full border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between z-30 flex-shrink-0">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-slate-950 stroke-[2.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  Fin<span className="text-emerald-400">Fluence</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Web Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Gen Z Financial Literacy &bull; Byte-sized interactive stories
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-1" />

          {/* Navigation View Switcher (Feed vs Portfolio) */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/15 cursor-default"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Story Cards</span>
            </button>
            <button
              onClick={onOpenPortfolio}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Practice Portfolio</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                ₹1L Sandbox
              </span>
            </button>
          </div>
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-3">
          {/* API Connection pill */}
          {dataSource === 'backend' ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live API Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Offline Mode
            </span>
          )}

          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-full shadow-sm">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{streak} Day Streak</span>
          </div>

          {/* XP Points */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/25 px-3 py-1 rounded-full shadow-sm">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>{xpPoints} XP</span>
          </div>

          {/* Phone Simulator Switcher */}
          {onSwitchToPhoneView && (
            <button
              onClick={onSwitchToPhoneView}
              title="Test in mobile phone simulator layout"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700/80 hover:border-slate-500 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
            >
              <span>📱 Phone View</span>
            </button>
          )}

          {/* User profile & sign out */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 pl-3 pr-1.5 py-1 rounded-full">
            <span className="text-xs font-medium text-slate-300">
              {user.isGuest ? 'Guest Student' : user.email}
            </span>
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="text-xs text-slate-400 hover:text-rose-400 hover:bg-slate-800 p-1 rounded-full transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Desktop Content Area (Left Sidebar + Center Canvas) */}
      <div className="flex-1 min-h-0 w-full flex overflow-hidden">
        {/* LEFT SIDEBAR (Progress, Filters, Concept Jump List) */}
        <aside className="w-80 lg:w-88 border-r border-slate-800/80 bg-slate-900/40 flex flex-col flex-shrink-0 z-20">
          {/* User Rank & Progress Card */}
          <div className="p-4 border-b border-slate-800/60 bg-gradient-to-b from-slate-900/90 to-transparent">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Learning Journey
              </span>
              <span className={`text-xs font-bold ${currentRank.color}`}>
                {currentRank.label}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (completedCount / Math.max(1, cards.length)) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {completedCount} of {cards.length} Mastered
              </span>
              <span className="font-semibold text-emerald-400">
                {Math.round((completedCount / Math.max(1, cards.length)) * 100)}% Done
              </span>
            </div>
          </div>

          {/* Track Filter Tabs */}
          <div className="p-3 border-b border-slate-800/60 space-y-2">
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80">
              <button
                onClick={() => setActiveTrackFilter('all')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTrackFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({cards.length})
              </button>
              <button
                onClick={() => setActiveTrackFilter('core-finance')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTrackFilter === 'core-finance'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                🌿 Core Finance
              </button>
              <button
                onClick={() => setActiveTrackFilter('stock-market')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTrackFilter === 'stock-market'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                📈 Stock Market
              </button>
              <button
                onClick={() => setActiveTrackFilter('saved')}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTrackFilter === 'saved'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                ⭐ Saved ({bookmarksCount})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts (SIP, Nifty, EMI)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Concept Navigation List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
            {filteredCards.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                No concepts found matching your filters.
              </div>
            ) : (
              filteredCards.map((card) => {
                const isSelected = card.id === selectedCardId;
                const isCompleted = progress?.completedCardIds.includes(card.id) ?? false;
                const isSaved = progress?.bookmarkedCardIds.includes(card.id) ?? false;
                const isStock = card.track === 'stock-market';

                return (
                  <button
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`w-full text-left p-2.5 rounded-xl transition-all duration-150 flex items-center justify-between gap-2.5 border cursor-pointer ${
                      isSelected
                        ? isStock
                          ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                          : 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/30 hover:bg-slate-800/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Concept Number Pill */}
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                          isSelected
                            ? isStock
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-emerald-500 text-slate-950'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        #{card.conceptNumber}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate leading-tight">
                          {card.conceptTitle}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isStock ? 'bg-cyan-400' : 'bg-emerald-400'
                            }`}
                          />
                          <span className="truncate">{card.tag}</span>
                          <span>&bull;</span>
                          <span>{card.readTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Icons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isSaved && (
                        <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      )}
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Pitch Sandbox Callout at bottom */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
            <button
              onClick={onOpenPortfolio}
              className="w-full p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-indigo-500/15 border border-emerald-500/30 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>₹1,00,000 Sandbox</span>
                  <span className="text-[8px] bg-emerald-500 text-slate-950 px-1 py-0.2 rounded font-extrabold uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Test simulated trades without losing real money
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </aside>

        {/* CENTER STAGE (Expanded Interactive Card Workspace) */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden relative">
          {/* Ambient Lighting Background */}
          <div
            className={`absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
              activeCard.track === 'stock-market' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'
            }`}
          />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[140px] bg-indigo-500/10 pointer-events-none" />

          {/* Interactive Card Canvas (Centered & Scrollable) */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 flex flex-col items-center">
            <div className="w-full max-w-4xl">
              <StoryCard
                card={activeCard}
                isLastCard={currentIndex === cards.length - 1}
                isCompleted={isCurrentCardCompleted}
                isSaved={isCurrentCardSaved}
                currentStreak={streak}
                onNextCard={handleNext}
                onQuizComplete={() => handleQuizComplete(activeCard.id, activeCard.track)}
                onToggleBookmark={() => handleToggleBookmark(activeCard.id)}
                isDesktopLayout={true}
              />
            </div>
          </div>

          {/* DESKTOP BOTTOM CONTROLS & PAGINATION BAR */}
          <footer className="h-16 w-full border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between flex-shrink-0 z-30">
            {/* Prev button */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentIndex === 0
                  ? 'opacity-40 text-slate-500 cursor-not-allowed bg-slate-900'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-slate-500'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Concept</span>
            </button>

            {/* Concept Step Dots / Progress Indicator */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-400">
                Concept <strong className="text-white">{currentIndex + 1}</strong> of{' '}
                <strong className="text-white">{cards.length}</strong>
              </span>

              {/* Mini dots */}
              <div className="hidden md:flex items-center gap-1">
                {cards.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCardId(c.id)}
                    title={c.conceptTitle}
                    className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                      i === currentIndex
                        ? 'w-6 bg-emerald-400'
                        : progress?.completedCardIds.includes(c.id)
                        ? 'w-2 bg-emerald-500/40 hover:bg-emerald-400/60'
                        : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[11px] text-slate-500 hidden lg:inline">
                💡 Tip: Use <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-300">←</kbd> / <kbd className="bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-300">→</kbd> to browse
              </span>
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                currentIndex === cards.length - 1
                  ? 'opacity-50 text-slate-400 cursor-not-allowed bg-slate-800'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 font-black'
              }`}
            >
              <span>Next Concept</span>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
