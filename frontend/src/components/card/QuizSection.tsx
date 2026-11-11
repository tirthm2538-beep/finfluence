import React, { useState } from 'react';
import { Quiz } from '../../types/card';
import { HelpCircle, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface QuizSectionProps {
  quiz: Quiz;
  onAnswerCorrect?: () => void;
  onNextCard?: () => void;
  isLastCard?: boolean;
}

export function QuizSection({
  quiz,
  onAnswerCorrect,
  onNextCard,
  isLastCard = false,
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
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/15 via-slate-900/80 to-slate-950/90 border border-violet-500/35 p-2 sm:p-2.5 lg:p-4 shadow-sm hover:border-violet-500/50 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5 lg:mb-2.5">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-violet-400 flex-shrink-0" />
          <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-wider text-violet-300">
            Quick Quiz Check
          </span>
        </div>
        {hasAnsweredCorrectly && (
          <span className="text-[8px] sm:text-[9px] lg:text-xs font-semibold text-emerald-400 flex items-center gap-1 bg-emerald-500/15 px-1.5 lg:px-2 py-0.5 rounded-full border border-emerald-500/30 animate-pulse">
            <Sparkles className="w-2 h-2 lg:w-3 lg:h-3" /> +10 XP Earned
          </span>
        )}
      </div>

      {/* Question */}
      <p className="text-white font-semibold text-[10px] sm:text-[11px] lg:text-base mb-1.5 lg:mb-3 leading-snug lg:leading-relaxed break-words">
        {quiz.question}
      </p>

      {/* Options */}
      <div className="space-y-1 lg:space-y-2">
        {quiz.options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          let optionStyle =
            'bg-slate-800/70 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600 hover:shadow-md';

          if (isSelected) {
            if (option.isCorrect) {
              optionStyle =
                'bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/50';
            } else {
              optionStyle =
                'bg-rose-500/20 border-rose-500/80 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
            }
          } else if (hasAnsweredCorrectly && option.isCorrect) {
            optionStyle =
              'bg-emerald-500/15 border-emerald-500/50 text-emerald-200';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.isCorrect)}
              className={`w-full text-left py-1 px-1.5 sm:py-1.5 sm:px-2 lg:py-2.5 lg:px-3.5 rounded-lg border transition-all duration-150 flex items-center gap-2 text-[9px] sm:text-[10px] lg:text-sm font-medium cursor-pointer active:scale-[0.99] ${optionStyle}`}
            >
              <span
                className={`flex-shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-6 lg:h-6 rounded-md flex items-center justify-center text-[7px] sm:text-[8px] lg:text-xs font-bold transition-colors ${
                  isSelected && option.isCorrect
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : isSelected && !option.isCorrect
                    ? 'bg-rose-500 text-white font-black'
                    : 'bg-slate-700/80 text-slate-300'
                }`}
              >
                {option.label}
              </span>
              <span className="flex-1 leading-tight break-words">{option.text}</span>
              {isSelected && option.isCorrect && (
                <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-5 lg:h-5 text-emerald-400 flex-shrink-0" />
              )}
              {isSelected && !option.isCorrect && (
                <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-5 lg:h-5 text-rose-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {selectedOption && (
        <div
          className={`mt-1.5 lg:mt-3 p-1.5 lg:p-3 rounded-lg text-[9px] sm:text-[10px] lg:text-sm leading-tight border transition-all duration-200 ${
            selectedOption.isCorrect
              ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/70 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-1.5 lg:gap-2">
            {selectedOption.isCorrect ? (
              <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-3 h-3 lg:w-4 lg:h-4 text-rose-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="break-words">
              <span className="font-bold mr-1">
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
