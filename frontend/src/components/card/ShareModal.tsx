'use client';

import React, { useState } from 'react';
import { StoryCardData } from '../../types/card';
import { X, Copy, Check, Share2, Sparkles, TrendingUp } from 'lucide-react';

interface ShareModalProps {
  card: StoryCardData;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ card, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `⚡ FinFluence Concept #${card.conceptNumber}: ${card.conceptTitle}\n\n🪝 "${card.hook}"\n\n💡 In Plain English: ${card.explanation}\n\n🏋️ Analogy: "${card.analogy}"\n\nLearn Gen Z Finance on FinFluence!`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FinFluence: ${card.conceptTitle}`,
          text: shareText,
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl flex flex-col gap-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Story Card</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close share dialog"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Story Card Graphic Preview */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 border border-emerald-500/30 p-3.5 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
              </div>
              <span className="text-[10px] font-black tracking-tight text-white">
                Fin<span className="text-emerald-400">Fluence</span>
              </span>
            </div>
            <span className="text-[9px] font-bold text-emerald-300 uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              Concept #{card.conceptNumber}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">
            {card.conceptTitle}
          </h3>

          <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800 mb-2">
            <div className="flex items-center gap-1 text-amber-300 text-[9px] font-bold uppercase mb-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Real Talk</span>
            </div>
            <p className="text-[10px] text-slate-200 italic leading-snug">
              &ldquo;{card.hook}&rdquo;
            </p>
          </div>

          <div className="bg-slate-900/80 rounded-lg p-2 border border-slate-800">
            <div className="text-indigo-300 text-[9px] font-bold uppercase mb-0.5">
              The Analogy
            </div>
            <p className="text-[10px] text-slate-300 leading-snug">
              &ldquo;{card.analogy}&rdquo;
            </p>
          </div>

          <div className="mt-2.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[8px] text-slate-500">
            <span>{card.trackTitle}</span>
            <span>finfluence.app</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>
          <button
            onClick={handleNativeShare}
            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
