import React, { useState } from 'react';
import { StoryCardData } from '../../types/card';
import { HookSection } from './HookSection';
import { ExplanationSection } from './ExplanationSection';
import { AnalogySection } from './AnalogySection';
import { QuizSection } from './QuizSection';
import { ShareModal } from './ShareModal';
import { Badge } from '../ui/Badge';
import { Share2, Bookmark, Flame, CheckCircle2 } from 'lucide-react';

interface StoryCardProps {
  card: StoryCardData;
  isLastCard?: boolean;
  isCompleted?: boolean;
  isSaved?: boolean;
  currentStreak?: number;
  onNextCard?: () => void;
  onQuizComplete?: (cardId: string) => void;
  onToggleBookmark?: (cardId: string) => void;
  isDesktopLayout?: boolean;
}

export function StoryCard({
  card,
  isLastCard = false,
  isCompleted = false,
  isSaved = false,
  currentStreak = 1,
  onNextCard,
  onQuizComplete,
  onToggleBookmark,
  isDesktopLayout = false,
}: StoryCardProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const isStockMarket = card.track === 'stock-market';

  return (
    <div
      className={`relative w-full max-w-full min-w-0 ${
        isDesktopLayout
          ? 'h-auto min-h-0 px-6 py-4'
          : 'min-h-full h-auto flex flex-col justify-between px-3 py-1.5 sm:px-4 sm:py-2.5 overflow-x-hidden'
      }`}
    >
      {/* Background ambient lighting - strictly contained within overflow-hidden boundary */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 -right-12 rounded-full transition-all duration-500 ${
            isDesktopLayout ? 'w-96 h-96 blur-[120px]' : 'w-48 h-48 blur-[80px]'
          } ${isStockMarket ? 'bg-cyan-500/10' : 'bg-emerald-500/10'}`}
        />
        <div
          className={`absolute bottom-6 -left-12 rounded-full ${
            isDesktopLayout ? 'w-96 h-96 blur-[120px]' : 'w-48 h-48 blur-[80px]'
          } ${isStockMarket ? 'bg-indigo-500/10' : 'bg-teal-500/10'}`}
        />
      </div>

      {/* Card Content Area */}
      <div
        className={`relative z-10 flex flex-col mx-auto w-full min-w-0 max-w-full ${
          isDesktopLayout ? 'max-w-4xl gap-3.5' : 'max-w-md gap-1.5 sm:gap-2 flex-1 justify-between'
        }`}
      >
        {/* Meta badges & Header */}
        <div className="flex items-center justify-between gap-1.5 w-full min-w-0 pb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Badge variant={isStockMarket ? 'blue' : 'emerald'}>
              {card.tag}
            </Badge>
            <span
              className={`font-bold bg-[#ede9dc] text-slate-800 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded ${
                isDesktopLayout ? 'text-xs' : 'text-[10px]'
              }`}
            >
              #{card.conceptNumber}
            </span>
            {isCompleted && (
              <span
                className={`flex items-center gap-1 font-bold text-emerald-800 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 dark:text-emerald-300 ${
                  isDesktopLayout ? 'text-xs' : 'text-[9px]'
                }`}
              >
                <CheckCircle2
                  className={
                    isDesktopLayout ? 'w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400' : 'w-3 h-3 text-emerald-600 dark:text-emerald-400'
                  }
                />
                <span>Done</span>
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1 font-bold text-amber-800 bg-amber-500/10 rounded-full border border-amber-500/25 flex-shrink-0 shadow-xs dark:text-amber-300 ${
              isDesktopLayout ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5'
            }`}
          >
            <Flame
              className={`fill-amber-500 text-amber-500 ${
                isDesktopLayout ? 'w-3.5 h-3.5' : 'w-3 h-3'
              }`}
            />
            <span>{currentStreak} Day Streak</span>
          </div>
        </div>

        {/* Concept Title */}
        <div className="w-full min-w-0">
          <h1
            className={`font-black tracking-tight text-slate-900 dark:text-white leading-tight break-words hyphens-auto ${
              isDesktopLayout ? 'text-2xl lg:text-3xl' : 'text-base sm:text-lg'
            }`}
          >
            {card.conceptTitle}
          </h1>
          <p
            className={`text-slate-600 dark:text-slate-400 font-medium mt-0.5 ${
              isDesktopLayout ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
            }`}
          >
            {card.trackTitle} &bull; {card.readTime}
          </p>
        </div>

        {/* 4 Modular Sections (2x2 grid if isDesktopLayout, single column if mobile) */}
        <div
          className={`w-full min-w-0 max-w-full ${
            isDesktopLayout
              ? 'grid grid-cols-2 gap-3.5'
              : 'flex flex-col gap-1.5 sm:gap-2'
          }`}
        >
          {/* Section 1: The Hook */}
          <div className="w-full min-w-0 flex flex-col">
            <HookSection hook={card.hook} />
          </div>

          {/* Section 2: In Plain English */}
          <div className="w-full min-w-0 flex flex-col">
            <ExplanationSection explanation={card.explanation} />
          </div>

          {/* Section 3: The Analogy */}
          <div className="w-full min-w-0 flex flex-col">
            <AnalogySection analogy={card.analogy} iconName={card.analogyIcon} />
          </div>

          {/* Section 4: The Quick Quiz */}
          <div className="w-full min-w-0 flex flex-col">
            <QuizSection
              quiz={card.quiz}
              onAnswerCorrect={() => onQuizComplete?.(card.id)}
              onNextCard={onNextCard}
              isLastCard={isLastCard}
            />
          </div>
        </div>

        {/* Footer actions inside card */}
        <div
          className={`flex items-center justify-between text-slate-600 dark:text-slate-400 w-full min-w-0 border-t border-[#e3decb] dark:border-slate-800/80 ${
            isDesktopLayout ? 'mt-2 pt-2.5 pb-1 text-xs' : 'mt-1 pt-1.5 pb-0.5 text-xs flex-shrink-0'
          }`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 transition-colors cursor-pointer bg-[#f5f3ec] hover:bg-[#ede9dc] border border-[#e3decb] px-2.5 py-1 rounded-lg text-slate-800 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-xs">Share</span>
            </button>
            <button
              onClick={() => onToggleBookmark?.(card.id)}
              className="flex items-center gap-1.5 transition-colors cursor-pointer bg-[#f5f3ec] hover:bg-[#ede9dc] border border-[#e3decb] px-2.5 py-1 rounded-lg dark:bg-slate-900/80 dark:border-slate-800"
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${
                  isSaved
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              />
              <span
                className={`font-semibold text-xs ${
                  isSaved
                    ? 'text-amber-700 dark:text-amber-300'
                    : 'text-slate-800 dark:text-slate-300'
                }`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isDesktopLayout ? (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 italic hidden sm:inline">
                Swipe up for next ⇅
              </span>
            ) : (
              onNextCard &&
              !isLastCard && (
                <button
                  onClick={onNextCard}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  <span>Next Concept &rarr;</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Share Modal Dialog */}
      <ShareModal
        card={card}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
