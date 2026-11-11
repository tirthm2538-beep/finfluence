'use client';

import React, { useState } from 'react';
import { MarketInstrument, PortfolioHolding } from '../../types/portfolio';
import { TradingViewStockChart } from './TradingViewStockChart';
import {
  X,
  TrendingUp,
  BarChart2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';

interface StockDetailModalProps {
  instrument: MarketInstrument;
  holding?: PortfolioHolding;
  cashBalance: number;
  isOpen: boolean;
  onClose: () => void;
  onExecuteTrade: (symbol: string, type: 'BUY' | 'SELL', qty: number) => Promise<{ success: boolean; message: string }>;
  isDark?: boolean;
}

export function StockDetailModal({
  instrument,
  holding,
  cashBalance,
  isOpen,
  onClose,
  onExecuteTrade,
  isDark = false,
}: StockDetailModalProps) {
  const [chartType, setChartType] = useState<'candlestick' | 'area'>('candlestick');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [tradeQty, setTradeQty] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const isPositive = instrument.change24h >= 0;
  const orderTotal = Number((tradeQty * instrument.price).toFixed(2));
  const maxAffordable = Math.floor(cashBalance / Math.max(0.01, instrument.price));
  const maxSellable = holding ? holding.quantity : 0;

  const handleQuickQty = (qty: number) => {
    setTradeQty(Math.max(1, qty));
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (tradeQty <= 0) return;
    setIsSubmitting(true);
    setFeedback(null);

    const res = await onExecuteTrade(instrument.symbol, tradeType, tradeQty);
    setIsSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setFeedback(null);
      }, 2500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-white border border-[#e3decb] rounded-3xl shadow-2xl overflow-hidden dark:bg-slate-950 dark:border-slate-800 text-[var(--foreground)]">
        {/* 1. Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#e5e1d5] bg-[#faf8f2] flex-shrink-0 dark:bg-slate-900/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-emerald-600/20 flex-shrink-0">
              {instrument.symbol.replace('SIM-', '').slice(0, 3)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white truncate">
                  {instrument.symbol}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 dark:text-emerald-300">
                  {instrument.sector}
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/25 dark:text-amber-300 hidden sm:inline">
                  Simulated
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                {instrument.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#ded8c4] hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 scrollbar-thin">
          {/* Price Overview Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#f5f3ec] border border-[#e3decb] dark:bg-slate-900/60 dark:border-slate-800/80">
            <div>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Simulated Market Price
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                  ₹{instrument.price.toFixed(2)}
                </span>
                <span
                  className={`text-xs sm:text-sm font-black flex items-center gap-0.5 ${
                    isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {isPositive ? '+' : ''}₹{instrument.change24h.toFixed(2)} ({isPositive ? '+' : ''}
                  {instrument.changePercent24h.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">Day Range</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{instrument.dayLow.toFixed(1)} &bull; ₹{instrument.dayHigh.toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-sans block">52W Range</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  ₹{instrument.fiftyTwoWeekLow.toFixed(0)} - ₹{instrument.fiftyTwoWeekHigh.toFixed(0)}
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-[10px] text-slate-500 font-sans block">Volatility</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400 font-sans">
                  {instrument.volatilityLevel} (β {instrument.beta})
                </span>
              </div>
            </div>
          </div>

          {/* Chart Header Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>TradingView Interactive Chart</span>
              </span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                45-Day Simulated History
              </span>
            </div>

            {/* Chart Type Toggle */}
            <div className="flex items-center bg-[#ede9dc] p-1 rounded-xl border border-[#e3decb] dark:bg-slate-900 dark:border-slate-800">
              <button
                onClick={() => setChartType('candlestick')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  chartType === 'candlestick'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Candles</span>
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  chartType === 'area'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Line</span>
              </button>
            </div>
          </div>

          {/* Real TradingView Canvas */}
          <TradingViewStockChart
            candles={instrument.candles}
            symbol={instrument.symbol}
            isDark={isDark}
            chartType={chartType}
            height={310}
          />

          {/* Educational Concept Tie-In Callout */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#faf8f2] to-teal-500/10 border border-emerald-600/30 flex items-start gap-2.5 text-xs dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-teal-950/40 dark:border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide text-[10px] block">
                FinFluence Concept Connection &bull; {instrument.conceptTieIn}
              </span>
              <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mt-0.5">
                {instrument.description}
              </p>
            </div>
          </div>

          {/* 3. Trade Execution Box */}
          <div className="p-4 rounded-2xl bg-[#faf8f2] border border-[#e3decb] dark:bg-slate-900/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Practice Order Ticket
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Available Cash: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">₹{cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong>
              </span>
            </div>

            {/* Buy / Sell Tab Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-[#ede9dc] p-1 rounded-xl border border-[#e3decb] dark:bg-slate-950 dark:border-slate-800 text-xs font-bold">
              <button
                onClick={() => setTradeType('BUY')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  tradeType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300'
                }`}
              >
                Buy (Simulated)
              </button>
              <button
                onClick={() => setTradeType('SELL')}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  tradeType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-300'
                }`}
              >
                Sell {holding ? `(${holding.quantity} Owned)` : '(0 Owned)'}
              </button>
            </div>

            {/* Quantity Selector & Presets */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Quantity:</span>
                <div className="flex items-center bg-white border border-[#e3decb] rounded-xl dark:bg-slate-950 dark:border-slate-800 overflow-hidden">
                  <button
                    onClick={() => handleQuickQty(tradeQty - 1)}
                    disabled={tradeQty <= 1}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#ede9dc] disabled:opacity-40 cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={tradeQty}
                    onChange={(e) => handleQuickQty(parseInt(e.target.value) || 1)}
                    className="w-14 text-center text-xs font-black bg-transparent text-slate-900 dark:text-white focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuickQty(tradeQty + 1)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-[#ede9dc] cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    +
                  </button>
                </div>

                {/* Preset pills */}
                <div className="flex items-center gap-1">
                  {[1, 5, 10].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQuickQty(q)}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg bg-white border border-[#e3decb] text-slate-700 hover:bg-[#ede9dc] cursor-pointer dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                    >
                      +{q}
                    </button>
                  ))}
                  {tradeType === 'BUY' && maxAffordable > 0 && (
                    <button
                      onClick={() => handleQuickQty(maxAffordable)}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 hover:bg-emerald-500/20 cursor-pointer dark:text-emerald-300"
                    >
                      Max ({maxAffordable})
                    </button>
                  )}
                  {tradeType === 'SELL' && maxSellable > 0 && (
                    <button
                      onClick={() => handleQuickQty(maxSellable)}
                      className="px-2 py-1 text-[11px] font-bold rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-800 hover:bg-rose-500/20 cursor-pointer dark:text-rose-300"
                    >
                      All ({maxSellable})
                    </button>
                  )}
                </div>
              </div>

              {/* Order Total & Submit */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-medium">Estimated Total</span>
                  <span className="text-sm font-black text-slate-950 dark:text-white">
                    ₹{orderTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || (tradeType === 'SELL' && maxSellable === 0)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                    tradeType === 'BUY'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : `Confirm ${tradeType}`}
                </button>
              </div>
            </div>

            {/* Notification Banner */}
            {feedback && (
              <div
                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-500/30 dark:bg-emerald-950/60 dark:text-emerald-200'
                    : 'bg-rose-50 text-rose-950 border-rose-500/30 dark:bg-rose-950/60 dark:text-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="px-6 py-2.5 border-t border-[#e5e1d5] bg-[#f5f3ec] text-[10px] text-slate-500 dark:bg-slate-950 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <span>⚠️ 100% Risk-Free Simulated Educational Sandbox &bull; Real money is never involved</span>
          <span className="hidden sm:inline">Powered by TradingView Lightweight Charts</span>
        </div>
      </div>
    </div>
  );
}
