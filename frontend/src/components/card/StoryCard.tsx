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
}: StoryCardProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const isStockMarket = card.track === 'stock-market';

  return (
    <div className="relative w-full h-full flex flex-col justify-start overflow-y-auto overflow-x-hidden px-2.5 py-1.5 sm:px-3 sm:py-2 text-white no-scrollbar overscroll-contain min-w-0">
      {/* Background ambient lighting */}
      <div
        className={`absolute top-1/4 -right-16 w-48 h-48 rounded-full blur-[80px] pointer-events-none ${
          isStockMarket ? 'bg-sky-600/10' : 'bg-emerald-600/10'
        }`}
      />
      <div className="absolute bottom-6 -left-16 w-48 h-48 rounded-full blur-[80px] bg-purple-600/10 pointer-events-none" />

      {/* Card Content Area */}
      <div className="relative z-10 flex flex-col gap-1 sm:gap-1.5 max-w-md mx-auto w-full min-w-0">
        {/* Meta badges & Header */}
        <div className="flex items-center justify-between gap-1 w-full min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <Badge variant={isStockMarket ? 'blue' : 'emerald'}>
              {card.tag}
            </Badge>
            <span className="text-[9px] font-medium text-slate-400">
              #{card.conceptNumber}
            </span>
            {isCompleted && (
              <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/30">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                <span>Done</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[9px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 flex-shrink-0">
            <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            <span>{currentStreak} Streak</span>
          </div>
        </div>

        {/* Concept Title */}
        <div className="w-full min-w-0">
          <h1 className="text-xs sm:text-sm font-bold tracking-tight text-white leading-tight break-words">
            {card.conceptTitle}
          </h1>
          <p className="text-[9px] text-slate-400">
            {card.trackTitle} • {card.readTime}
          </p>
        </div>

        {/* Section 1: The Hook */}
        <div className="w-full min-w-0">
          <HookSection hook={card.hook} />
        </div>

        {/* Section 2: In Plain English */}
        <div className="w-full min-w-0">
          <ExplanationSection explanation={card.explanation} />
        </div>

        {/* Section 3: The Analogy */}
        <div className="w-full min-w-0">
          <AnalogySection analogy={card.analogy} iconName={card.analogyIcon} />
        </div>

        {/* Section 4: The Quick Quiz */}
        <div className="w-full min-w-0">
          <QuizSection
            quiz={card.quiz}
            onAnswerCorrect={() => onQuizComplete?.(card.id)}
            onNextCard={onNextCard}
            isLastCard={isLastCard}
          />
        </div>

        {/* Footer actions inside card */}
        <div className="flex items-center justify-between pt-0.5 pb-1 text-slate-400 text-[9px] w-full min-w-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsShareOpen(true)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <Share2 className="w-2.5 h-2.5 text-emerald-400" />
              <span className="text-slate-300 hover:text-white">Share</span>
            </button>
            <button
              onClick={() => onToggleBookmark?.(card.id)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <Bookmark className={`w-2.5 h-2.5 ${isSaved ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
              <span className={isSaved ? 'text-amber-300 font-semibold' : 'text-slate-300'}>
                {isSaved ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>

          <span className="text-[8px] text-slate-500 italic">
            Swipe up for next ⇅
          </span>
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
