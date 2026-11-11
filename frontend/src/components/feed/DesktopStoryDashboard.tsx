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
import { ThemeToggle } from '../ui/ThemeToggle';
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
  User,
  LogOut,
} from 'lucide-react';

interface DesktopStoryDashboardProps {
  cards: StoryCardData[];
  user: AuthUser;
  onSignOut?: () => void;
  onOpenPortfolio?: () => void;
  dataSource?: 'backend' | 'fallback' | null;
  onSyncBackend?: () => void;
  isSyncing?: boolean;
}

export function DesktopStoryDashboard({
  cards,
  user,
  onSignOut,
  onOpenPortfolio,
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
      if (activeTrackFilter === 'core-finance' && card.track !== 'core-finance') return false;
      if (activeTrackFilter === 'stock-market' && card.track !== 'stock-market') return false;
      if (activeTrackFilter === 'saved' && !progress?.bookmarkedCardIds.includes(card.id)) return false;

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  const getRank = () => {
    if (completedCount >= 18) return { label: 'Wall Street Prodigy 🏆', color: 'text-amber-700 dark:text-amber-400' };
    if (completedCount >= 12) return { label: 'Market Strategist ⚡', color: 'text-cyan-700 dark:text-cyan-400' };
    if (completedCount >= 6) return { label: 'Compound Crusader 🚀', color: 'text-emerald-700 dark:text-emerald-400' };
    return { label: 'Finance Novice 🌱', color: 'text-slate-700 dark:text-slate-300' };
  };

  const currentRank = getRank();
  const isCurrentCardCompleted = progress?.completedCardIds.includes(activeCard?.id) ?? false;
  const isCurrentCardSaved = progress?.bookmarkedCardIds.includes(activeCard?.id) ?? false;

  return (
    <div className="w-full h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] overflow-hidden select-none">
      {/* 1. Desktop Top Navigation Header */}
      <header className="h-12 lg:h-14 w-full border-b border-[#e5e1d5] bg-white/90 backdrop-blur-md px-4 lg:px-6 flex items-center justify-between z-30 flex-shrink-0 dark:border-slate-800/80 dark:bg-slate-900/70">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-600/20">
              <TrendingUp className="w-5 h-5 text-white stroke-[2.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-slate-950 dark:text-white">
                  Fin<span className="text-emerald-600 dark:text-emerald-400">Fluence</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 px-2 py-0.5 rounded-full dark:text-emerald-300">
                  Edu Platform
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Gen Z Financial Literacy &bull; Bite-sized Interactive Stories
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-[#e5e1d5] dark:bg-slate-800 mx-1" />

          {/* Navigation View Switcher (Feed vs Portfolio) */}
          <div className="flex items-center bg-[#f5f3ec] border border-[#e3decb] p-1 rounded-xl dark:bg-slate-950/80 dark:border-slate-800">
            <button
              onClick={() => {}}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 cursor-default"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Story Cards</span>
            </button>
            <button
              onClick={onOpenPortfolio}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-[#eae6d8] transition-all cursor-pointer dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Practice Portfolio</span>
              <span className="text-[9px] bg-amber-500/20 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-500/30 dark:text-amber-300">
                ₹1L Sandbox
              </span>
            </button>
          </div>
        </div>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-3">
          {/* API Connection pill */}
          {dataSource === 'backend' ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
              Live API Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full font-medium dark:text-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Offline Backup
            </span>
          )}

          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-full shadow-xs dark:text-amber-300">
            <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{streak} Day Streak</span>
          </div>

          {/* XP Points */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full shadow-xs dark:text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{xpPoints} XP</span>
          </div>

          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* User profile & sign out */}
          <div className="flex items-center gap-2 bg-[#f5f3ec] border border-[#e3decb] pl-3 pr-1.5 py-1 rounded-full dark:bg-slate-900 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-300">
              {user.isGuest ? 'Guest Student' : user.email}
            </span>
            {onSignOut && (
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="text-xs text-slate-500 hover:text-rose-600 hover:bg-[#ede9dc] p-1 rounded-full transition-colors cursor-pointer dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Desktop Content Area (Left Sidebar + Center Canvas) */}
      <div className="flex-1 min-h-0 w-full flex overflow-hidden">
        {/* LEFT SIDEBAR (Progress, Filters, Concept Jump List) */}
        <aside className="w-80 lg:w-88 border-r border-[#e5e1d5] bg-[#faf8f2] flex flex-col flex-shrink-0 z-20 dark:border-slate-800/80 dark:bg-slate-900/40">
          {/* User Rank & Progress Card */}
          <div className="p-4 border-b border-[#e5e1d5] bg-[#f5f3ec]/60 dark:border-slate-800/60 dark:bg-slate-900/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
                Learning Journey
              </span>
              <span className={`text-xs font-black ${currentRank.color}`}>
                {currentRank.label}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#e3decb] dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (completedCount / Math.max(1, cards.length)) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {completedCount} of {cards.length} Mastered
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {Math.round((completedCount / Math.max(1, cards.length)) * 100)}% Done
              </span>
            </div>
          </div>

          {/* Track Filter Tabs */}
          <div className="p-3 border-b border-[#e5e1d5] space-y-2 dark:border-slate-800/60">
            <div className="grid grid-cols-2 gap-1 bg-[#ede9dc] p-1 rounded-xl border border-[#e3decb] dark:bg-slate-950 dark:border-slate-800/80">
              <button
                onClick={() => setActiveTrackFilter('all')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTrackFilter === 'all'
                    ? 'bg-white text-slate-950 shadow-xs dark:bg-slate-800 dark:text-white'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                All ({cards.length})
              </button>
              <button
                onClick={() => setActiveTrackFilter('core-finance')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTrackFilter === 'core-finance'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-emerald-800 dark:text-slate-400 dark:hover:text-emerald-300'
                }`}
              >
                🌿 Core Finance
              </button>
              <button
                onClick={() => setActiveTrackFilter('stock-market')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTrackFilter === 'stock-market'
                    ? 'bg-teal-700 text-white shadow-xs dark:bg-cyan-600'
                    : 'text-slate-700 hover:text-teal-800 dark:text-slate-400 dark:hover:text-cyan-300'
                }`}
              >
                📈 Stock Market
              </button>
              <button
                onClick={() => setActiveTrackFilter('saved')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTrackFilter === 'saved'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-amber-800 dark:text-slate-400 dark:hover:text-amber-300'
                }`}
              >
                ⭐ Saved ({bookmarksCount})
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts (SIP, Nifty, EMI)..."
                className="w-full bg-white border border-[#e3decb] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
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
                        ? 'bg-white border-emerald-600 shadow-sm ring-1 ring-emerald-600/30 text-slate-950 dark:bg-emerald-950/40 dark:border-emerald-500 dark:ring-emerald-500/30 dark:text-white'
                        : 'bg-transparent hover:bg-[#f3efdf] border-transparent text-slate-700 dark:hover:bg-slate-800/60 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Concept Number Pill */}
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#ede9dc] text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        #{card.conceptNumber}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight">
                          {card.conceptTitle}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isStock ? 'bg-teal-600 dark:bg-cyan-400' : 'bg-emerald-600 dark:bg-emerald-400'
                            }`}
                          />
                          <span className="truncate font-medium">{card.tag}</span>
                          <span>&bull;</span>
                          <span>{card.readTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Icons */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isSaved && (
                        <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      )}
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-[#ded8c4] dark:border-slate-700" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Sandbox Callout at bottom */}
          <div className="p-3 border-t border-[#e5e1d5] bg-[#f5f3ec] dark:border-slate-800/80 dark:bg-slate-950/60 flex-shrink-0">
            <button
              onClick={onOpenPortfolio}
              className="w-full p-2.5 rounded-xl bg-white border border-[#e3decb] hover:border-emerald-600/40 flex items-center justify-between text-left transition-all cursor-pointer shadow-xs dark:bg-slate-900/60 dark:border-slate-800 dark:hover:border-emerald-500/40 group"
            >
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>₹1,00,000 Sandbox</span>
                  <span className="text-[8px] bg-emerald-600 text-white px-1 py-0.2 rounded font-black uppercase">
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Practice simulated trading risk-free
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </aside>

        {/* CENTER STAGE (Expanded Interactive Card Workspace) */}
        <main className="flex-1 flex flex-col min-w-0 bg-[var(--background)] overflow-hidden relative">
          {/* Ambient Lighting Background */}
          <div
            className={`absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
              activeCard.track === 'stock-market' ? 'bg-cyan-500/5' : 'bg-emerald-500/5'
            }`}
          />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full blur-[140px] bg-teal-500/5 pointer-events-none" />

          {/* Interactive Card Canvas (Centered & Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-6 py-1.5 lg:py-2.5 pb-6 lg:pb-8 flex flex-col items-center scrollbar-thin">
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
          <footer className="h-12 lg:h-14 w-full border-t border-[#e5e1d5] bg-white/90 backdrop-blur-md px-6 lg:px-8 flex items-center justify-between flex-shrink-0 z-30 dark:border-slate-800/80 dark:bg-slate-900/70">
            {/* Prev button */}
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                currentIndex === 0
                  ? 'opacity-40 text-slate-400 cursor-not-allowed bg-[#f5f3ec] dark:bg-slate-900'
                  : 'bg-white hover:bg-[#f5f3ec] text-slate-800 border border-[#e3decb] dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Concept</span>
            </button>

            {/* Concept Step Dots / Progress Indicator */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Concept <strong className="text-slate-950 dark:text-white font-black">{currentIndex + 1}</strong> of{' '}
                <strong className="text-slate-950 dark:text-white font-black">{cards.length}</strong>
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
                        ? 'w-6 bg-emerald-600 dark:bg-emerald-400'
                        : progress?.completedCardIds.includes(c.id)
                        ? 'w-2 bg-emerald-600/40 hover:bg-emerald-600/70 dark:bg-emerald-500/40'
                        : 'w-1.5 bg-[#ded8c4] hover:bg-slate-400 dark:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <span className="text-[11px] text-slate-500 hidden lg:inline">
                💡 Tip: Use <kbd className="bg-[#ede9dc] dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300 font-mono">←</kbd> / <kbd className="bg-[#ede9dc] dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] text-slate-700 dark:text-slate-300 font-mono">→</kbd> to browse
              </span>
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                currentIndex === cards.length - 1
                  ? 'opacity-50 text-slate-400 cursor-not-allowed bg-slate-300 dark:bg-slate-800'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25 font-black'
              }`}
            >
              <span>Next Concept</span>
              <ChevronRight className="w-4 h-4 stroke-[2.8]" />
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
