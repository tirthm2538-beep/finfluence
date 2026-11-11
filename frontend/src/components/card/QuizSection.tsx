import React, { useState } from 'react';
import { Quiz } from '../../types/card';
import { HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface QuizSectionProps {
  quiz: Quiz;
  onAnswerCorrect?: () => void;
  onNextCard?: () => void;
  isLastCard?: boolean;
  className?: string;
}

export function QuizSection({
  quiz,
  onAnswerCorrect,
  onNextCard,
  isLastCard = false,
  className = '',
}: QuizSectionProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasAnsweredCorrectly, setHasAnsweredCorrectly] = useState(false);

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    setSelectedOptionId(optionId);
    if (isCorrect) {
      setHasAnsweredCorrectly(true);
      onAnswerCorrect?.();
    }
  };

  const selectedOption = quiz.options.find((opt) => opt.id === selectedOptionId);

  return (
    <div
      className={`relative rounded-xl bg-white border border-emerald-600/25 p-2 sm:p-2.5 lg:p-3 shadow-xs transition-all duration-200 w-full min-w-0 max-w-full dark:bg-gradient-to-br dark:from-emerald-950/30 dark:via-slate-900/80 dark:to-slate-950/90 dark:border-emerald-500/35 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1 sm:mb-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[10px] sm:text-[11px] lg:text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            Quick Quiz Check
          </span>
        </div>
        {hasAnsweredCorrectly && (
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-emerald-800 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse flex items-center gap-1 dark:text-emerald-300">
            <Sparkles className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> +10 XP Earned
          </span>
        )}
      </div>

      {/* Question */}
      <p className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm mb-1.5 lg:mb-2 leading-snug break-words hyphens-auto flex-shrink-0">
        {quiz.question}
      </p>

      {/* Options - Always full visibility without clipping */}
      <div className="flex flex-col gap-1.5 sm:gap-2 w-full min-w-0">
        {quiz.options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          let optionStyle =
            'bg-[#faf8f2] border-[#e3decb] text-slate-800 hover:bg-[#f5f2e7] hover:border-emerald-600/40 dark:bg-slate-800/70 dark:border-slate-700/80 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-600';

          if (isSelected) {
            if (option.isCorrect) {
              optionStyle =
                'bg-emerald-50 border-emerald-600 text-emerald-950 ring-1 ring-emerald-600/30 shadow-xs dark:bg-emerald-500/20 dark:border-emerald-500 dark:text-emerald-100 dark:shadow-[0_0_15px_rgba(16,185,129,0.3)]';
            } else {
              optionStyle =
                'bg-rose-50 border-rose-500 text-rose-950 shadow-xs dark:bg-rose-500/20 dark:border-rose-500/80 dark:text-rose-100';
            }
          } else if (hasAnsweredCorrectly && option.isCorrect) {
            optionStyle =
              'bg-emerald-50/70 border-emerald-600/50 text-emerald-900 dark:bg-emerald-500/15 dark:border-emerald-500/50 dark:text-emerald-200';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.isCorrect)}
              className={`w-full text-left py-1.5 px-2 sm:py-2 sm:px-2.5 rounded-lg border transition-all duration-150 flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer active:scale-[0.99] min-w-0 flex-shrink-0 min-h-[34px] sm:min-h-[36px] ${optionStyle}`}
            >
              <span
                className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center text-[9px] sm:text-[10px] lg:text-xs font-black transition-colors ${
                  isSelected && option.isCorrect
                    ? 'bg-emerald-600 text-white'
                    : isSelected && !option.isCorrect
                    ? 'bg-rose-600 text-white'
                    : 'bg-[#e9e4d4] text-slate-700 dark:bg-slate-700/80 dark:text-slate-300'
                }`}
              >
                {option.label}
              </span>
              <span className="flex-1 leading-snug break-words hyphens-auto">{option.text}</span>
              {isSelected && option.isCorrect && (
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              )}
              {isSelected && !option.isCorrect && (
                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {selectedOption && (
        <div
          className={`mt-1.5 sm:mt-2 p-1.5 sm:p-2 rounded-lg text-xs leading-snug border transition-all duration-200 flex-shrink-0 ${
            selectedOption.isCorrect
              ? 'bg-emerald-50 border-emerald-600/40 text-emerald-950 dark:bg-emerald-950/70 dark:border-emerald-500/30 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-500/40 text-rose-950 dark:bg-rose-950/70 dark:border-rose-500/30 dark:text-rose-200'
          }`}
        >
          <div className="flex items-start gap-1.5">
            {selectedOption.isCorrect ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="break-words hyphens-auto">
              <span className="font-extrabold mr-1">
                {selectedOption.isCorrect ? 'Spot on! 🎯' : 'Not quite! 🤔'}
              </span>
              <span>{selectedOption.explanation}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
