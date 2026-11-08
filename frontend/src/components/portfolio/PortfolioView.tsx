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
import {
  TrendingUp,
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
  Info,
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
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-white">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-2 animate-pulse">
          <Briefcase className="w-5 h-5 text-emerald-400" />
        </div>
        <span className="text-xs text-slate-400">Loading Practice Portfolio Simulator...</span>
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
    <div className="relative w-full h-full flex flex-col bg-slate-950 text-white overflow-hidden select-none">
      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-3 py-1.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-3 h-3 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xs font-bold leading-tight flex items-center gap-1">
              <span>Practice Portfolio</span>
              <span className="text-[8px] font-bold bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded border border-amber-500/30 uppercase">
                Simulator
              </span>
            </h1>
            <p className="text-[8px] text-slate-400 truncate">₹1,00,000 Virtual Sandbox • Not Real Money</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleReset}
            title="Reset Portfolio to ₹1,00,000"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 text-[10px] flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span className="hidden xxs:inline text-[9px]">Reset</span>
          </button>

          <button
            onClick={onBackToFeed}
            className="py-1 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-colors cursor-pointer"
          >
            Feed 📖
          </button>
        </div>
      </header>

      {/* Prominent Educational Disclaimer Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1 flex items-center gap-1.5 text-[9px] text-amber-300/90">
        <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
        <span className="truncate">
          <strong>PRACTICE TOOL ONLY:</strong> 100% fictional assets & virtual funds. No real trading or investment advice.
        </span>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-3 py-2 flex flex-col gap-2 min-w-0">
        {/* Net Worth & Balance Card */}
        <div className="w-full bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-2.5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
            <span className="flex items-center gap-1">
              <PieChart className="w-3 h-3 text-emerald-400" />
              <span>Simulated Net Worth</span>
            </span>
            <span className="text-emerald-400 font-semibold text-[8px] bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Active Paper Demo
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
                ₹{netWorth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-400">P&L:</span>
                <span
                  className={`flex items-center font-bold ${
                    isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPnlPositive ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3" />
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
          <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/50">
              <Wallet className="w-3 h-3 text-emerald-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-400 block text-[8px]">Virtual Cash Balance</span>
                <span className="font-bold text-white truncate block text-[11px]">
                  ₹{portfolio.cashBalance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/50">
              <Briefcase className="w-3 h-3 text-sky-400 flex-shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-400 block text-[8px]">Invested Value</span>
                <span className="font-bold text-white truncate block text-[11px]">
                  ₹{totalHoldingsValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CEO Pitch Partner Callout */}
        <div className="w-full bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 rounded-xl p-2 flex items-center justify-between gap-2 shadow-sm">
          <div className="min-w-0">
            <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-400 uppercase tracking-wide">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Brokerage Partner Tie-In</span>
            </div>
            <p className="text-[9px] text-slate-300 font-medium leading-tight">
              Ready to graduate from practice? Connect your Demat brokerage.
            </p>
          </div>
          <button
            onClick={() => setShowPitchModal(true)}
            className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[9px] font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Partner Pitch</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Tab Toggle: Watchlist vs Holdings */}
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'watchlist'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            <span>Simulated Assets ({marketInstruments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('holdings')}
            className={`flex-1 py-1 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'holdings'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3 h-3" />
            <span>My Holdings ({portfolio.holdings.length})</span>
          </button>
        </div>

        {/* Tab 1: Simulated Market Assets */}
        {activeTab === 'watchlist' && (
          <div className="flex flex-col gap-1.5 min-w-0 pb-2">
            {marketInstruments.map((inst) => {
              const holding = portfolio.holdings.find((h) => h.symbol === inst.symbol);
              const isPositive = inst.change24h >= 0;

              return (
                <div
                  key={inst.symbol}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-xl p-2 flex flex-col gap-1 transition-all"
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs text-white">{inst.symbol}</span>
                        <span className="text-[8px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-1 rounded">
                          Simulated
                        </span>
                        {holding && (
                          <span className="text-[8px] font-bold text-emerald-400 bg-emerald-500/10 px-1 rounded border border-emerald-500/20">
                            {holding.quantity} Owned
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 truncate block">
                        {inst.name}
                      </span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-white">
                        ₹{inst.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-[9px] font-semibold flex items-center justify-end ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {inst.changePercent24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  {/* Educational Concept Tie-in tag */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-800/60 text-[8px]">
                    <span className="text-slate-400 truncate max-w-[200px]">
                      💡 <strong className="text-slate-300">{inst.conceptTieIn}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      {holding && (
                        <button
                          onClick={() => handleOpenTrade(inst, 'SELL')}
                          className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition-colors cursor-pointer text-[9px]"
                        >
                          Sell
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenTrade(inst, 'BUY')}
                        className="px-2.5 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer text-[9px]"
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
          <div className="flex flex-col gap-1.5 min-w-0 pb-2">
            {portfolio.holdings.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
                <Briefcase className="w-7 h-7 text-slate-500 mx-auto mb-1.5 opacity-50" />
                <h3 className="text-xs font-bold text-white mb-0.5">No Active Positions</h3>
                <p className="text-[9px] text-slate-400 max-w-[220px] mx-auto mb-2.5 leading-relaxed">
                  You have ₹{portfolio.cashBalance.toLocaleString('en-IN')} in virtual cash. Pick a simulated asset to practice trading!
                </p>
                <button
                  onClick={() => setActiveTab('watchlist')}
                  className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
                >
                  Explore Practice Assets
                </button>
              </div>
            ) : (
              portfolio.holdings.map((h) => {
                const isPos = h.pnl >= 0;
                const marketItem = marketInstruments.find((m) => m.symbol === h.symbol);

                return (
                  <div
                    key={h.symbol}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-white">{h.symbol}</span>
                          <span className="text-[8px] text-slate-400 bg-slate-800 px-1 rounded">
                            {h.quantity} units
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400">
                          Avg: ₹{h.avgPrice.toFixed(2)} • CMP: ₹{h.currentPrice.toFixed(2)}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold text-white">
                          ₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                        <div
                          className={`text-[9px] font-bold flex items-center justify-end ${
                            isPos ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPos ? '+' : ''}₹{h.pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({isPos ? '+' : ''}
                          {h.pnlPercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[9px]">
                      <span className="text-slate-500 italic text-[8px]">Simulated Holding</span>

                      <div className="flex items-center gap-1">
                        {marketItem && (
                          <>
                            <button
                              onClick={() => handleOpenTrade(marketItem, 'SELL')}
                              className="px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition-colors cursor-pointer text-[9px]"
                            >
                              Sell
                            </button>
                            <button
                              onClick={() => handleOpenTrade(marketItem, 'BUY')}
                              className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-colors cursor-pointer text-[9px]"
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

      {/* Trade Execution Modal Sheet */}
      {selectedInstrument && (
        <div className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end p-2 animate-fade-in">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{selectedInstrument.symbol}</span>
                <span className="text-[9px] text-amber-300 bg-amber-500/10 px-1 rounded">Simulated</span>
              </div>
              <button
                onClick={() => setSelectedInstrument(null)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Buy vs Sell Mode Toggle */}
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setOrderType('BUY')}
                className={`py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'BUY'
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => setOrderType('SELL')}
                className={`py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'SELL'
                    ? 'bg-rose-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Live Simulated Price & Available Capital */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
              <div>
                <span>Simulated Price: </span>
                <strong className="text-white">₹{selectedInstrument.price.toFixed(2)}</strong>
              </div>
              <div>
                {orderType === 'BUY' ? (
                  <span>
                    Virtual Cash: <strong className="text-emerald-400">₹{portfolio.cashBalance.toFixed(0)}</strong>
                  </span>
                ) : (
                  <span>
                    Owned:{' '}
                    <strong className="text-white">
                      {portfolio.holdings.find((h) => h.symbol === selectedInstrument.symbol)?.quantity ?? 0}
                    </strong>
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] text-slate-400 font-medium">Quantity (Units):</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none focus:border-emerald-500"
                />
                {[1, 5, 10, 25].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setOrderQty(qty)}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-semibold cursor-pointer"
                  >
                    +{qty}
                  </button>
                ))}
              </div>
            </div>

            {/* Total Order Calculation */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <span className="text-slate-400 text-[10px]">Total Virtual Amount:</span>
              <span className="font-bold text-white text-xs sm:text-sm">
                ₹{(orderQty * selectedInstrument.price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Status Message */}
            {orderStatus && (
              <div
                className={`p-1.5 rounded-lg text-[9px] flex items-center gap-1.5 ${
                  orderStatus.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {orderStatus.type === 'success' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-rose-400 flex-shrink-0" />
                )}
                <span>{orderStatus.message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleExecuteOrder}
              disabled={isSubmitting}
              className={`w-full py-1.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                orderType === 'BUY'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-rose-500 hover:bg-rose-400 text-white'
              }`}
            >
              <span>Execute Simulated {orderType}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* CEO Pitch Partner Modal Dialog */}
      {showPitchModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2 shadow-2xl relative">
            <button
              onClick={() => setShowPitchModal(false)}
              className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Trading Platform Partnership</h3>
                <span className="text-[8px] text-emerald-400 font-semibold">Strategic B2B Thesis</span>
              </div>
            </div>

            <div className="text-[9px] text-slate-300 space-y-1.5 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <p>
                <strong>The Student Fear Barrier:</strong> Millions of Gen Z students from commerce, science, and arts want to invest, but are intimidated by trading terminals and terrified of losing money.
              </p>
              <p>
                <strong>FinFluence Bridge:</strong>
                Story cards teach core market concepts. The ₹1,00,000 Practice Portfolio simulator gives them zero-risk confidence.
              </p>
              <p className="text-emerald-300 font-semibold">
                <strong>CEO Win:</strong> Connect your brokerage API to offer seamless 1-click account opening. Financially literate students convert to lifetime active traders with low churn.
              </p>
            </div>

            <button
              onClick={() => {
                alert('Demo: Partner Brokerage Demat Account Gateway Opened!');
                setShowPitchModal(false);
              }}
              className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Simulate Partner Account Opening</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
