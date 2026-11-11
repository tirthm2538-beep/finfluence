'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StoryCardData } from '../../types/card';
import { StoryCard } from '../card/StoryCard';
import { FeedHeader } from './FeedHeader';
import { FeedNavigation } from './FeedNavigation';
import { StoryProgressBar } from '../ui/ProgressBar';
import { AuthUser } from '../../lib/supabase';
import {
  UserProgressData,
  loadUserProgress,
  recordQuizCompletion,
  toggleBookmark,
} from '../../lib/userProgress';

interface StoryFeedProps {
  cards: StoryCardData[];
  user?: AuthUser | null;
  onSignOut?: () => void;
  onOpenPortfolio?: () => void;
}

export function StoryFeed({ cards, user, onSignOut, onOpenPortfolio }: StoryFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<UserProgressData | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);

  // Load user progress
  useEffect(() => {
    if (user) {
      loadUserProgress(user).then((p) => {
        setProgress(p);
      });
    }
  }, [user]);

  const scrollToCard = useCallback((index: number) => {
    if (index < 0 || index >= cards.length) return;
    const container = containerRef.current;
    if (!container) return;

    isProgrammaticScroll.current = true;
    setCurrentIndex(index);

    const targetY = index * container.clientHeight;
    container.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });

    setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  }, [cards.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      scrollToCard(currentIndex + 1);
    }
  }, [currentIndex, cards.length, scrollToCard]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      scrollToCard(currentIndex - 1);
    }
  }, [currentIndex, scrollToCard]);

  // Handle scroll detection
  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;
    const container = containerRef.current;
    if (!container) return;

    const height = container.clientHeight;
    if (height === 0) return;

    const scrollPos = container.scrollTop;
    const newIndex = Math.round(scrollPos / height);
    if (newIndex >= 0 && newIndex < cards.length && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
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

  const activeCard = cards[currentIndex] || cards[0];

  return (
    <div className="relative w-full max-w-full h-full flex flex-col bg-[var(--background)] overflow-hidden select-none">
      {/* Top Segmented Story Progress Bar */}
      <StoryProgressBar
        total={cards.length}
        current={currentIndex}
        onSelect={(idx) => scrollToCard(idx)}
      />

      {/* Header Bar */}
      <FeedHeader
        activeTrackTitle={activeCard.trackTitle}
        currentIndex={currentIndex}
        totalCards={cards.length}
        user={user}
        streak={progress?.currentStreak ?? 1}
        xp={progress?.xpPoints ?? 0}
        bookmarksCount={progress?.bookmarkedCardIds.length ?? 0}
        onSignOut={onSignOut}
        onOpenPortfolio={onOpenPortfolio}
      />

      {/* Vertical Snap Scroll Feed Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="relative flex-1 min-h-0 w-full max-w-full overflow-x-hidden overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {cards.map((card, index) => {
          const isCompleted = progress?.completedCardIds.includes(card.id) ?? false;
          const isSaved = progress?.bookmarkedCardIds.includes(card.id) ?? false;

          return (
            <section
              key={card.id}
              className="w-full max-w-full h-full snap-start snap-always flex-shrink-0 flex flex-col justify-start relative overflow-y-auto overflow-x-hidden no-scrollbar"
              aria-label={`Story card ${index + 1}: ${card.conceptTitle}`}
            >
              <StoryCard
                card={card}
                isLastCard={index === cards.length - 1}
                isCompleted={isCompleted}
                isSaved={isSaved}
                currentStreak={progress?.currentStreak ?? 1}
                onNextCard={handleNext}
                onQuizComplete={() => handleQuizComplete(card.id, card.track)}
                onToggleBookmark={() => handleToggleBookmark(card.id)}
                isDesktopLayout={false}
              />
            </section>
          );
        })}
      </div>

      {/* Floating Navigation Controls */}
      <FeedNavigation
        currentIndex={currentIndex}
        totalCards={cards.length}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </div>
  );
}
