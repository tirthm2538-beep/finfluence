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
      className={`relative w-full h-full flex flex-col justify-start overflow-y-auto overflow-x-hidden text-white no-scrollbar overscroll-contain min-w-0 ${
        isDesktopLayout ? 'px-6 py-4' : 'px-2.5 py-1.5 sm:px-3 sm:py-2'
      }`}
    >
      {/* Background ambient lighting */}
      <div
        className={`absolute top-1/4 -right-16 rounded-full pointer-events-none transition-all duration-500 ${
          isDesktopLayout ? 'w-96 h-96 blur-[120px]' : 'w-48 sm:w-64 h-48 sm:h-64 blur-[80px]'
        } ${isStockMarket ? 'bg-cyan-500/10' : 'bg-emerald-500/10'}`}
      />
      <div
        className={`absolute bottom-6 -left-16 rounded-full bg-indigo-500/10 pointer-events-none ${
          isDesktopLayout ? 'w-96 h-96 blur-[120px]' : 'w-48 sm:w-64 h-48 sm:h-64 blur-[80px]'
        }`}
      />

      {/* Card Content Area */}
      <div
        className={`relative z-10 flex flex-col mx-auto w-full min-w-0 ${
          isDesktopLayout ? 'max-w-4xl gap-3.5' : 'max-w-md gap-1.5 sm:gap-2'
        }`}
      >
        {/* Meta badges & Header */}
        <div className="flex items-center justify-between gap-1 w-full min-w-0 pb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <Badge variant={isStockMarket ? 'blue' : 'emerald'}>
              {card.tag}
            </Badge>
            <span
              className={`font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded ${
                isDesktopLayout ? 'text-xs' : 'text-[9px] sm:text-[10px]'
              }`}
            >
              #{card.conceptNumber}
            </span>
            {isCompleted && (
              <span
                className={`flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 ${
                  isDesktopLayout ? 'text-xs' : 'text-[8px] sm:text-[9px]'
                }`}
              >
                <CheckCircle2
                  className={
                    isDesktopLayout ? 'w-3.5 h-3.5 text-emerald-400' : 'w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400'
                  }
                />
                <span>Done</span>
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1 font-semibold text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20 flex-shrink-0 shadow-sm ${
              isDesktopLayout ? 'text-xs px-2.5 py-1' : 'text-[9px] sm:text-[10px] px-2 py-0.5'
            }`}
          >
            <Flame
              className={`fill-amber-400 text-amber-400 ${
                isDesktopLayout ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5 sm:w-3 sm:h-3'
              }`}
            />
            <span>{currentStreak} Day Streak</span>
          </div>
        </div>

        {/* Concept Title */}
        <div className="w-full min-w-0">
          <h1
            className={`font-black tracking-tight text-white leading-tight break-words ${
              isDesktopLayout ? 'text-2xl lg:text-3xl' : 'text-xs sm:text-sm'
            }`}
          >
            {card.conceptTitle}
          </h1>
          <p
            className={`text-slate-400 mt-0.5 ${
              isDesktopLayout ? 'text-xs sm:text-sm' : 'text-[9px] sm:text-[10px]'
            }`}
          >
            {card.trackTitle} &bull; {card.readTime}
          </p>
        </div>

        {/* 4 Modular Sections (2x2 grid if isDesktopLayout, single column if mobile) */}
        <div
          className={`w-full min-w-0 ${
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
          className={`flex items-center justify-between text-slate-400 w-full min-w-0 border-t border-slate-800/60 mt-1 ${
            isDesktopLayout ? 'pt-2 pb-1 text-xs' : 'pt-1 pb-1 text-[9px] sm:text-[10px]'
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800 hover:border-slate-700"
            >
              <Share2 className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-300 hover:text-white font-medium">Share</span>
            </button>
            <button
              onClick={() => onToggleBookmark?.(card.id)}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer bg-slate-900/80 px-2 py-1 rounded-md border border-slate-800 hover:border-slate-700"
            >
              <Bookmark
                className={`w-3 h-3 ${
                  isSaved ? 'text-amber-400 fill-amber-400' : 'text-slate-400'
                }`}
              />
              <span className={isSaved ? 'text-amber-300 font-semibold' : 'text-slate-300 font-medium'}>
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {!isDesktopLayout ? (
              <span className="text-[8px] sm:text-[9px] text-slate-500 italic">
                Swipe up for next ⇅
              </span>
            ) : (
              onNextCard &&
              !isLastCard && (
                <button
                  onClick={onNextCard}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
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
