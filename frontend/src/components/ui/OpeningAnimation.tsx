'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Sparkles } from 'lucide-react';

interface OpeningAnimationProps {
  onFinish?: () => void;
}

export function OpeningAnimation({ onFinish }: OpeningAnimationProps) {
  const [stage, setStage] = useState<'enter' | 'active' | 'exit' | 'done'>('enter');

  useEffect(() => {
    // Stage 1: Active animation start
    const t1 = setTimeout(() => {
      setStage('active');
    }, 50);

    // Stage 2: Begin exit fade-out at 1.1s
    const t2 = setTimeout(() => {
      setStage('exit');
    }, 1150);

    // Stage 3: Fully unmount at 1.45s
    const t3 = setTimeout(() => {
      setStage('done');
      onFinish?.();
    }, 1450);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onFinish]);

  // Click or keypress to immediately skip
  const handleSkip = () => {
    setStage('done');
    onFinish?.();
  };

  useEffect(() => {
    const handleKeyDown = () => handleSkip();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (stage === 'done') return null;

  return (
    <div
      onClick={handleSkip}
      role="button"
      tabIndex={0}
      aria-label="FinFluence intro animation. Click to skip."
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center select-none cursor-pointer transition-opacity duration-300 ${
        stage === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
      } bg-[#fbfbf9]/95 dark:bg-[#020617]/95 backdrop-blur-xl`}
    >
      {/* Ambient background glows */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-64 h-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none -translate-x-12 translate-y-12" />

      {/* Main card showcase */}
      <div
        className={`relative z-10 flex flex-col items-center text-center p-6 transition-all duration-500 ${
          stage === 'active'
            ? 'scale-100 translate-y-0 opacity-100'
            : 'scale-95 translate-y-2 opacity-0'
        }`}
      >
        {/* Animated Brand Icon */}
        <div className="relative mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-600/30 ring-4 ring-emerald-500/20">
            <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-white stroke-[2.8] animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-slate-900 fill-slate-900" />
          </span>
        </div>

        {/* Brand Name */}
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-1">
          Fin<span className="text-emerald-600 dark:text-emerald-400">Fluence</span>
        </h1>

        {/* Tagline */}
        <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 max-w-xs mb-5">
          Master Money &amp; Stocks in 60-Second Stories
        </p>

        {/* Quick filling progress line */}
        <div className="w-44 sm:w-56 h-1.5 bg-[#e3decb] dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all ease-out duration-1000 ${
              stage === 'active' || stage === 'exit' ? 'w-full' : 'w-0'
            }`}
          />
        </div>

        {/* Non-intrusive skip tip */}
        <span className="text-[10px] text-slate-600 dark:text-slate-400 mt-4 font-medium tracking-wide">
          Tap anywhere to skip &rarr;
        </span>
      </div>
    </div>
  );
}
