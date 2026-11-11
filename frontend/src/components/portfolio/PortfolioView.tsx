'use client';

import React, { useState, useEffect } from 'react';
import { AuthUser } from '../../lib/supabase';
import {
  UserPortfolio,
  MarketInstrument,
} from '../../types/portfolio';
import {
  loadPortfolio,
  executeOrder,
  resetPortfolio,
  getSimulatedMarketInstruments,
} from '../../lib/portfolioService';
import { PortfolioChart } from './PortfolioChart';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  Wallet,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  PieChart,
  AlertTriangle,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

interface PortfolioViewProps {
  user: AuthUser;
  onBackToFeed: () => void;
}

export function PortfolioView({ user, onBackToFeed }: PortfolioViewProps) {
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [marketInstruments, setMarketInstruments] = useState<MarketInstrument[]>([]);
  const [activeTab, setActiveTab] = useState<'holdings' | 'watchlist'>('watchlist');
  const [selectedInstrument, setSelectedInstrument] = useState<MarketInstrument | null>(null);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderQty, setOrderQty] = useState<number>(1);
  const [orderStatus, setOrderStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPitchModal, setShowPitchModal] = useState(false);

  useEffect(() => {
    loadPortfolio(user).then((p) => {
      setPortfolio(p);
      setMarketInstruments(getSimulatedMarketInstruments());
    });
  }, [user]);

  if (!portfolio) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[var(--background)] text-[var(--foreground)]">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3 animate-pulse">
          <Briefcase className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-300">Loading Practice Portfolio Simulator...</span>
        <span className="text-xs text-slate-500 mt-1">Preparing ₹1,00,000 virtual balance</span>
      </div>
    );
  }

  // Calculate live portfolio summary
  const totalHoldingsValue = portfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvestedValue = portfolio.holdings.reduce((sum, h) => sum + h.investedValue, 0);
  const netWorth = portfolio.cashBalance + totalHoldingsValue;
  const totalPnl = totalHoldingsValue - totalInvestedValue;
  const totalPnlPercent = totalInvestedValue > 0 ? (totalPnl / totalInvestedValue) * 100 : 0;
  const isPnlPositive = totalPnl >= 0;

  const handleOpenTrade = (instrument: MarketInstrument, type: 'BUY' | 'SELL') => {
    setSelectedInstrument(instrument);
    setOrderType(type);
    setOrderQty(1);
    setOrderStatus(null);
  };

  const handleExecuteOrder = async () => {
    if (!selectedInstrument || orderQty <= 0) return;
    setIsSubmitting(true);
    setOrderStatus(null);

    const res = await executeOrder(user, portfolio, selectedInstrument.symbol, orderType, orderQty);

    setIsSubmitting(false);
    if (res.success) {
      setPortfolio(res.portfolio);
      setOrderStatus({ type: 'success', message: res.message });
      setTimeout(() => {
        setSelectedInstrument(null);
        setOrderStatus(null);
      }, 1500);
    } else {
      setOrderStatus({ type: 'error', message: res.message });
    }
  };

  const handleReset = async () => {
    if (confirm('Reset your practice portfolio back to ₹1,00,000 virtual balance?')) {
      const fresh = await resetPortfolio(user);
      setPortfolio(fresh);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] overflow-hidden select-none">
      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3.5 border-b border-[#e5e1d5] bg-white/90 backdrop-blur-md flex-shrink-0 dark:border-slate-800/80 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-600/20">
            <Briefcase className="w-4 h-4 lg:w-5 lg:h-5 text-white stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base lg:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-tight truncate">
                Practice Portfolio
              </h1>
              <span className="text-[9px] lg:text-[10px] font-bold bg-amber-500/20 text-amber-800 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase dark:text-amber-300 flex-shrink-0">
                ₹1L Sandbox
              </span>
            </div>
            <p className="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 truncate hidden xs:block">
              Zero-risk simulated trading &bull; Fictional assets &bull; CEO demo ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <ThemeToggle compact={true} />

          <button
            onClick={handleReset}
            title="Reset Portfolio to ₹1,00,000"
            className="px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-[#f5f3ec] hover:bg-[#ede9dc] border border-[#e3decb] text-xs flex items-center gap-1.5 transition-colors cursor-pointer dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Reset ₹1L</span>
          </button>

          <button
            onClick={onBackToFeed}
            className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Feed</span>
          </button>
        </div>
      </header>

      {/* Educational Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 sm:px-6 lg:px-8 py-1.5 flex items-center gap-2 text-[10px] sm:text-xs text-amber-900 dark:text-amber-300/90 flex-shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span className="truncate">
          <strong>EDUCATIONAL SIMULATION ONLY:</strong> All assets, pricing, and balances are 100% fictional. No real money or trading advice.
        </span>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-6 flex flex-col min-w-0">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-12 lg:gap-6 lg:items-start space-y-4 lg:space-y-0">
          {/* LEFT COLUMN: Summary Card, Chart, Cash/Invested, Partner Callout */}
          <div className="w-full lg:col-span-5 flex flex-col gap-3.5">
            {/* Net Worth & Balance Card */}
            <div className="w-full bg-gradient-to-br from-white via-[#faf8f2] to-[#f5f2e7] border border-[#e3decb] rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-300">
                  <PieChart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Simulated Net Worth</span>
                </span>
                <span className="text-emerald-800 font-bold text-[10px] bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 dark:text-emerald-300">
                  Active Virtual Demo
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                    ₹{netWorth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </div>
                  <div className="flex items-center gap-2 text-xs mt-1">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Total Return:</span>
                    <span
                      className={`flex items-center font-bold ${
                        isPnlPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {isPnlPositive ? (
                        <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      )}
                      {isPnlPositive ? '+' : ''}₹{Math.abs(totalPnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })} (
                      {isPnlPositive ? '+' : ''}
                      {totalPnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Sparkline Performance Chart */}
              <PortfolioChart history={portfolio.history} isPositive={isPnlPositive} />

              {/* Cash vs Invested Split */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#e3decb] dark:border-slate-800/80 text-xs">
                <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-[#e3decb] dark:bg-slate-950/80 dark:border-slate-800/60">
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-500 dark:text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Virtual Cash</span>
                    <span className="font-extrabold text-slate-900 dark:text-white truncate block text-xs sm:text-sm">
                      ₹{portfolio.cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/80 p-2.5 rounded-xl border border-[#e3decb] dark:bg-slate-950/80 dark:border-slate-800/60">
                  <Briefcase className="w-4 h-4 text-teal-600 dark:text-sky-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-slate-500 dark:text-slate-400 block text-[9px] font-bold uppercase tracking-wider">Invested Value</span>
                    <span className="font-extrabold text-slate-900 dark:text-white truncate block text-xs sm:text-sm">
                      ₹{totalHoldingsValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CEO Pitch Partner Callout */}
            <div className="w-full bg-gradient-to-r from-emerald-50 via-white to-teal-50 border border-emerald-600/30 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-xs dark:from-emerald-950/50 dark:via-slate-900 dark:to-indigo-950/50 dark:border-emerald-500/30">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Brokerage Partner Tie-In</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-snug mt-0.5">
                  Graduate from simulated sandbox into a 1-click Demat account.
                </p>
              </div>
              <button
                onClick={() => setShowPitchModal(true)}
                className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Partner Pitch</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Market Watchlist & Active Holdings */}
          <div className="w-full lg:col-span-7 flex flex-col gap-3.5">
            {/* Tab Toggle: Watchlist vs Holdings */}
            <div className="flex items-center gap-1 bg-[#ede9dc] p-1 rounded-xl border border-[#e3decb] text-xs font-bold dark:bg-slate-900 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('watchlist')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'watchlist'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Simulated Market Assets ({marketInstruments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('holdings')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'holdings'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>My Active Holdings ({portfolio.holdings.length})</span>
              </button>
            </div>

            {/* Tab 1: Simulated Market Assets */}
            {activeTab === 'watchlist' && (
              <div className="flex flex-col gap-2.5 min-w-0 pb-4">
                {marketInstruments.map((inst) => {
                  const holding = portfolio.holdings.find((h) => h.symbol === inst.symbol);
                  const isPositive = inst.change24h >= 0;

                  return (
                    <div
                      key={inst.symbol}
                      className="bg-white border border-[#e3decb] hover:border-emerald-600/40 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2 transition-all shadow-xs dark:bg-slate-900/90 dark:border-slate-800/90 dark:hover:border-slate-700/90"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">{inst.symbol}</span>
                            <span className="text-[9px] text-amber-800 bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.5 rounded-full font-bold dark:text-amber-300">
                              Simulated
                            </span>
                            {holding && (
                              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 dark:text-emerald-300">
                                {holding.quantity} Units Owned
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate block mt-0.5 font-medium">
                            {inst.name}
                          </span>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                            ₹{inst.price.toFixed(2)}
                          </div>
                          <div
                            className={`text-xs font-bold flex items-center justify-end ${
                              isPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {inst.changePercent24h.toFixed(2)}%
                          </div>
                        </div>
                      </div>

                      {/* Educational Concept Tie-in tag */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#e3decb] dark:border-slate-800/60 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 truncate max-w-sm">
                          💡 <strong className="text-slate-700 dark:text-slate-300 font-semibold">{inst.conceptTieIn}</strong>
                        </span>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {holding && (
                            <button
                              onClick={() => handleOpenTrade(inst, 'SELL')}
                              className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors cursor-pointer text-xs dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-300 dark:border-rose-500/30"
                            >
                              Sell
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenTrade(inst, 'BUY')}
                            className="px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer text-xs shadow-xs"
                          >
                            Buy
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Tab 2: User Holdings */}
            {activeTab === 'holdings' && (
              <div className="flex flex-col gap-2.5 min-w-0 pb-4">
                {portfolio.holdings.length === 0 ? (
                  <div className="bg-white border border-[#e3decb] rounded-2xl p-8 text-center dark:bg-slate-900 dark:border-slate-800">
                    <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No Active Positions Yet</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4 leading-relaxed">
                      You have ₹{portfolio.cashBalance.toLocaleString('en-IN')} in virtual cash ready to deploy. Pick a simulated asset to start building your portfolio!
                    </p>
                    <button
                      onClick={() => setActiveTab('watchlist')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
                    >
                      Browse Practice Assets
                    </button>
                  </div>
                ) : (
                  portfolio.holdings.map((h) => {
                    const isPos = h.pnl >= 0;
                    const marketItem = marketInstruments.find((m) => m.symbol === h.symbol);

                    return (
                      <div
                        key={h.symbol}
                        className="bg-white border border-[#e3decb] rounded-2xl p-3.5 flex flex-col gap-2 shadow-xs dark:bg-slate-900 dark:border-slate-800"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">{h.symbol}</span>
                              <span className="text-[10px] text-slate-700 bg-[#ede9dc] px-2 py-0.5 rounded-full font-bold dark:bg-slate-800 dark:text-slate-400">
                                {h.quantity} units
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block font-medium">
                              Avg: ₹{h.avgPrice.toFixed(2)} &bull; CMP: ₹{h.currentPrice.toFixed(2)}
                            </span>
                          </div>

                          <div className="text-right">
                            <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                              ₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </div>
                            <div
                              className={`text-xs font-bold flex items-center justify-end ${
                                isPos ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isPos ? '+' : ''}₹{h.pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({isPos ? '+' : ''}
                              {h.pnlPercent.toFixed(2)}%)
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#e3decb] dark:border-slate-800/60 text-xs">
                          <span className="text-slate-500 italic text-[10px]">Simulated Holding Position</span>

                          <div className="flex items-center gap-1.5">
                            {marketItem && (
                              <>
                                <button
                                  onClick={() => handleOpenTrade(marketItem, 'SELL')}
                                  className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-colors cursor-pointer text-xs dark:bg-rose-500/20 dark:hover:bg-rose-500/30 dark:text-rose-300 dark:border-rose-500/30"
                                >
                                  Sell
                                </button>
                                <button
                                  onClick={() => handleOpenTrade(marketItem, 'BUY')}
                                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors cursor-pointer text-xs shadow-xs"
                                >
                                  Buy More
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trade Execution Modal Dialog */}
      {selectedInstrument && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white border border-[#e3decb] rounded-3xl p-5 flex flex-col gap-3.5 shadow-2xl animate-scale-up dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between pb-2 border-b border-[#e3decb] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 dark:text-white">{selectedInstrument.symbol}</span>
                <span className="text-[10px] text-amber-800 bg-amber-500/15 px-2 py-0.5 rounded-full font-bold dark:text-amber-300">Simulated Order</span>
              </div>
              <button
                onClick={() => setSelectedInstrument(null)}
                className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer hover:bg-[#f5f3ec] dark:hover:text-white dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Buy vs Sell Mode Toggle */}
            <div className="grid grid-cols-2 gap-1.5 bg-[#ede9dc] p-1 rounded-xl border border-[#e3decb] dark:bg-slate-950 dark:border-slate-800">
              <button
                onClick={() => setOrderType('BUY')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                BUY (Long)
              </button>
              <button
                onClick={() => setOrderType('SELL')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                SELL (Close)
              </button>
            </div>

            {/* Live Simulated Price & Available Capital */}
            <div className="flex items-center justify-between text-xs text-slate-600 bg-[#f5f3ec] p-3 rounded-xl border border-[#e3decb] dark:bg-slate-950/80 dark:border-slate-800/80 dark:text-slate-400">
              <div>
                <span>Simulated Price: </span>
                <strong className="text-slate-900 dark:text-white font-bold">₹{selectedInstrument.price.toFixed(2)}</strong>
              </div>
              <div>
                {orderType === 'BUY' ? (
                  <span>
                    Virtual Cash: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">₹{portfolio.cashBalance.toFixed(0)}</strong>
                  </span>
                ) : (
                  <span>
                    Owned:{' '}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {portfolio.holdings.find((h) => h.symbol === selectedInstrument.symbol)?.quantity ?? 0}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-700 dark:text-slate-300 font-bold">Quantity (Units):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-white border border-[#e3decb] rounded-xl px-3 py-2 text-sm text-slate-900 font-mono text-center focus:outline-none focus:border-emerald-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:focus:border-emerald-500"
                />
                {[1, 5, 10, 25].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setOrderQty(qty)}
                    className="px-2.5 py-2 rounded-xl bg-[#f5f3ec] hover:bg-[#ede9dc] border border-[#e3decb] text-xs text-slate-800 font-bold cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-300"
                  >
                    +{qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Order Calculation */}
            <div className="flex items-center justify-between text-sm pt-2 border-t border-[#e3decb] dark:border-slate-800">
              <span className="text-slate-500 text-xs font-medium">Total Virtual Amount:</span>
              <span className="font-black text-slate-950 dark:text-white text-base">
                ₹{(orderQty * selectedInstrument.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Status Message */}
            {orderStatus && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  orderStatus.type === 'success'
                    ? 'bg-emerald-50 border border-emerald-600/30 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-rose-50 border border-rose-500/30 text-rose-900 dark:bg-rose-500/10 dark:text-rose-300'
                }`}
              >
                {orderStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                )}
                <span className="font-semibold">{orderStatus.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleExecuteOrder}
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                orderType === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25'
              }`}
            >
              <span>Execute Simulated {orderType} Order</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CEO Pitch Partner Modal Dialog */}
      {showPitchModal && (
        <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-white border border-[#e3decb] rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative dark:bg-slate-900 dark:border-slate-800">
            <button
              onClick={() => setShowPitchModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer hover:bg-[#f5f3ec] dark:hover:text-white dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Trading Platform Partnership</h3>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Strategic B2B Thesis for Brokerage CEO</span>
              </div>
            </div>

            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-2.5 leading-relaxed bg-[#f5f3ec] p-3.5 rounded-2xl border border-[#e3decb] dark:bg-slate-950/70 dark:border-slate-800/80">
              <p>
                <strong>The Student Fear Barrier:</strong> Millions of Gen Z college students want to invest, but are intimidated by traditional trading terminals and afraid of losing real savings.
              </p>
              <p>
                <strong>FinFluence Bridge:</strong> Bite-sized story cards educate them in 60-second bursts. The ₹1,00,000 Practice Portfolio gives them confidence to execute orders without stress.
              </p>
              <p className="text-emerald-800 dark:text-emerald-300 font-bold">
                <strong>CEO Win-Win:</strong> Connect your brokerage API directly to our graduate funnel. Financially literate students convert to lifetime active Demat traders with near-zero churn.
              </p>
            </div>

            <button
              onClick={() => {
                alert('Demo: Partner Brokerage Demat Account Gateway Opened!');
                setShowPitchModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Simulate Partner Account Opening Flow</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
