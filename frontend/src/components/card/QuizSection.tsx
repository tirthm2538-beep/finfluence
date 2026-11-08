import React, { useState } from 'react';
import { Quiz } from '../../types/card';
import { HelpCircle, CheckCircle2, XCircle, ArrowDown } from 'lucide-react';

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
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-violet-500/10 via-slate-900/70 to-slate-950/90 border border-violet-500/30 p-1.5 sm:p-2 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1">
          <HelpCircle className="w-2.5 h-2.5 text-violet-400 flex-shrink-0" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-violet-300">
            Quick Quiz Check
          </span>
        </div>
        {hasAnsweredCorrectly && (
          <span className="text-[8px] font-semibold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-2 h-2" /> +10 XP
          </span>
        )}
      </div>

      {/* Question */}
      <p className="text-white font-semibold text-[10px] sm:text-[11px] mb-1 leading-snug break-words">
        {quiz.question}
      </p>

      {/* Options */}
      <div className="space-y-1">
        {quiz.options.map((option) => {
          const isSelected = selectedOptionId === option.id;

          let optionStyle =
            'bg-slate-800/70 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-slate-600';

          if (isSelected) {
            if (option.isCorrect) {
              optionStyle =
                'bg-emerald-500/20 border-emerald-500 text-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.25)]';
            } else {
              optionStyle =
                'bg-rose-500/20 border-rose-500/80 text-rose-100';
            }
          } else if (hasAnsweredCorrectly && option.isCorrect) {
            optionStyle =
              'bg-emerald-500/15 border-emerald-500/50 text-emerald-200';
          }

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.isCorrect)}
              className={`w-full text-left py-1 px-1.5 rounded border transition-all duration-150 flex items-center gap-1.5 text-[9px] sm:text-[10px] font-medium cursor-pointer active:scale-[0.99] ${optionStyle}`}
            >
              <span
                className={`flex-shrink-0 w-3 h-3 rounded flex items-center justify-center text-[7px] font-bold ${
                  isSelected && option.isCorrect
                    ? 'bg-emerald-500 text-slate-950'
                    : isSelected && !option.isCorrect
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-700/80 text-slate-300'
                }`}
              >
                {option.label}
              </span>
              <span className="flex-1 leading-tight break-words">{option.text}</span>
              {isSelected && option.isCorrect && (
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 flex-shrink-0" />
              )}
              {isSelected && !option.isCorrect && (
                <XCircle className="w-2.5 h-2.5 text-rose-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {selectedOption && (
        <div
          className={`mt-1 p-1 rounded text-[9px] leading-tight border transition-all duration-200 ${
            selectedOption.isCorrect
              ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/70 border-rose-500/30 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-1">
            {selectedOption.isCorrect ? (
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-2.5 h-2.5 text-rose-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="break-words">
              <span className="font-semibold mr-1">
                {selectedOption.isCorrect ? 'Spot on! 🎯' : 'Not quite! 🤔'}
              </span>
              <span className="opacity-90">{selectedOption.explanation}</span>
            </div>
          </div>
        </div>
      )}

      {/* Swipe Next CTA when answered correctly */}
      {hasAnsweredCorrectly && !isLastCard && (
        <button
          onClick={onNextCard}
          className="mt-1 w-full py-1 px-2.5 rounded bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-[10px] flex items-center justify-center gap-1 shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <span>Next Concept</span>
          <ArrowDown className="w-2.5 h-2.5 animate-bounce" />
        </button>
      )}
    </div>
  );
}
