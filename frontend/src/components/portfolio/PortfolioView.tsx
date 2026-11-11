'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser } from '../../lib/supabase';
import {
  UserPortfolio,
  MarketInstrument,
  MarketSector,
} from '../../types/portfolio';
import {
  loadPortfolio,
  executeOrder,
  resetPortfolio,
  getSimulatedMarketInstruments,
} from '../../lib/portfolioService';
import { PortfolioChart } from './PortfolioChart';
import { StockDetailModal } from './StockDetailModal';
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
  Search,
  BarChart2,
  Filter,
} from 'lucide-react';

interface PortfolioViewProps {
  user: AuthUser;
  onBackToFeed: () => void;
}

const SECTOR_OPTIONS: { id: MarketSector | 'All'; label: string; icon: string }[] = [
  { id: 'All', label: 'All Sectors', icon: '🌐' },
  { id: 'Indices', label: 'Indices', icon: '📊' },
  { id: 'IT & Tech', label: 'IT & Tech', icon: '💻' },
  { id: 'Banking & Finance', label: 'Banking & Finance', icon: '🏦' },
  { id: 'FMCG & Consumer', label: 'FMCG & Consumer', icon: '🛒' },
  { id: 'Auto & EV', label: 'Auto & EV', icon: '⚡' },
  { id: 'Pharma & Health', label: 'Pharma & Health', icon: '💊' },
  { id: 'Energy & Power', label: 'Energy & Power', icon: '☀️' },
  { id: 'Infra & Realty', label: 'Infra & Realty', icon: '🏗️' },
  { id: 'Commodities', label: 'Commodities', icon: '🪙' },
];

export function PortfolioView({ user, onBackToFeed }: PortfolioViewProps) {
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null);
  const [marketInstruments, setMarketInstruments] = useState<MarketInstrument[]>([]);
  const [activeTab, setActiveTab] = useState<'watchlist' | 'holdings'>('watchlist');
  const [selectedSector, setSelectedSector] = useState<MarketSector | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailInstrument, setDetailInstrument] = useState<MarketInstrument | null>(null);
  const [showPitchModal, setShowPitchModal] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadPortfolio(user).then((p) => {
      setPortfolio(p);
      setMarketInstruments(getSimulatedMarketInstruments());
    });
  }, [user]);

  // Monitor theme changes
  useEffect(() => {
    const checkDark = () => {
      if (typeof document !== 'undefined') {
        setIsDark(document.documentElement.classList.contains('dark'));
      }
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Filtered market instruments
  const filteredInstruments = useMemo(() => {
    return marketInstruments.filter((inst) => {
      if (selectedSector !== 'All' && inst.sector !== selectedSector) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchSymbol = inst.symbol.toLowerCase().includes(query);
        const matchName = inst.name.toLowerCase().includes(query);
        const matchSector = inst.sector.toLowerCase().includes(query);
        return matchSymbol || matchName || matchSector;
      }
      return true;
    });
  }, [marketInstruments, selectedSector, searchQuery]);

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

  // Live portfolio summary calculations
  const totalHoldingsValue = portfolio.holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalInvestedValue = portfolio.holdings.reduce((sum, h) => sum + h.investedValue, 0);
  const netWorth = portfolio.cashBalance + totalHoldingsValue;
  const totalPnl = totalHoldingsValue - totalInvestedValue;
  const totalPnlPercent = totalInvestedValue > 0 ? (totalPnl / totalInvestedValue) * 100 : 0;
  const isPnlPositive = totalPnl >= 0;

  const handleExecuteTrade = async (symbol: string, type: 'BUY' | 'SELL', qty: number) => {
    const res = await executeOrder(user, portfolio, symbol, type, qty);
    if (res.success) {
      setPortfolio(res.portfolio);
    }
    return { success: res.success, message: res.message };
  };

  const handleReset = async () => {
    if (confirm('Reset your practice portfolio back to ₹1,00,000 virtual balance?')) {
      const fresh = await resetPortfolio(user);
      setPortfolio(fresh);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] overflow-hidden select-none">
      {/* 1. Top Header */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 border-b border-[#e5e1d5] bg-white/90 backdrop-blur-md flex-shrink-0 dark:border-slate-800/80 dark:bg-slate-900/70">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-600/20">
            <Briefcase className="w-4 h-4 lg:w-5 lg:h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">
                Practice Portfolio
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-800 border border-emerald-500/30 px-2 py-0.5 rounded-full dark:text-emerald-300">
                ₹1,00,000 Sandbox
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-medium hidden sm:block">
              Risk-Free Virtual Trading with TradingView Charts &bull; Zero Real Money
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          <button
            onClick={handleReset}
            title="Reset sandbox to ₹1,00,000"
            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-rose-600 bg-[#f5f3ec] hover:bg-[#ede9dc] border border-[#e3decb] px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300 dark:hover:text-rose-400"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Sandbox</span>
          </button>

          <button
            onClick={onBackToFeed}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Story Cards</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 lg:p-6 scrollbar-thin">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* LEFT COLUMN: Net Worth & Capital Summary */}
          <div className="w-full lg:col-span-5 flex flex-col gap-3.5">
            {/* Portfolio Summary Card */}
            <div className="w-full bg-gradient-to-br from-white via-[#faf8f2] to-[#f5f2e7] border border-[#e3decb] rounded-3xl p-4 sm:p-5 shadow-xs relative overflow-hidden dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Total Practice Net Worth
                </span>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full dark:text-emerald-300">
                  Simulated
                </span>
              </div>

              {/* Net Worth Big Number */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                  ₹{netWorth.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold flex items-center ${
                    isPnlPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isPnlPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {isPnlPositive ? '+' : ''}
                  {((netWorth - 100000) / 1000).toFixed(2)}% Overall
                </span>
              </div>

              {/* Unrealized PnL badge */}
              <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/70 border border-[#e3decb] dark:bg-slate-950/60 dark:border-slate-800/80 mb-3">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Active Returns (P&L):</span>
                <span
                  className={`font-black ${
                    isPnlPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isPnlPositive ? '+' : ''}₹{Math.abs(totalPnl).toLocaleString('en-IN', { maximumFractionDigits: 2 })} (
                  {isPnlPositive ? '+' : ''}
                  {totalPnlPercent.toFixed(2)}%)
                </span>
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
            {/* View Switcher: Market Assets vs Holdings */}
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

            {/* TAB 1: Simulated Market Assets */}
            {activeTab === 'watchlist' && (
              <div className="flex flex-col gap-3 min-w-0 pb-4">
                {/* Search Bar & Sector Filter */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by ticker, company, or sector (e.g. BYTECRAFT, Banking, EV)..."
                      className="w-full bg-white border border-[#e3decb] rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2 text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Horizontal Sector Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                    {SECTOR_OPTIONS.map((sec) => {
                      const isSelected = selectedSector === sec.id;
                      const count =
                        sec.id === 'All'
                          ? marketInstruments.length
                          : marketInstruments.filter((m) => m.sector === sec.id).length;

                      return (
                        <button
                          key={sec.id}
                          onClick={() => setSelectedSector(sec.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 border ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white border-[#e3decb] text-slate-700 hover:bg-[#ede9dc] dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{sec.icon}</span>
                          <span>{sec.label}</span>
                          <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Instruments List */}
                {filteredInstruments.length === 0 ? (
                  <div className="bg-white border border-[#e3decb] rounded-2xl p-6 text-center text-xs text-slate-500 dark:bg-slate-900 dark:border-slate-800">
                    No simulated stocks found matching &ldquo;{searchQuery}&rdquo;.
                  </div>
                ) : (
                  filteredInstruments.map((inst) => {
                    const holding = portfolio.holdings.find((h) => h.symbol === inst.symbol);
                    const isPositive = inst.change24h >= 0;

                    return (
                      <div
                        key={inst.symbol}
                        onClick={() => setDetailInstrument(inst)}
                        className="bg-white border border-[#e3decb] hover:border-emerald-600/50 hover:shadow-md rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2 transition-all cursor-pointer group dark:bg-slate-900/90 dark:border-slate-800/90 dark:hover:border-emerald-500/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                {inst.symbol}
                              </span>
                              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-[#e3decb] dark:border-slate-700">
                                {inst.sector}
                              </span>
                              {holding && (
                                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 dark:text-emerald-300">
                                  {holding.quantity} Units Owned
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400 truncate block mt-0.5 font-medium">
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
                              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {isPositive ? '+' : ''}
                              {inst.changePercent24h.toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Concept & TradingView Action Button */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#e3decb] dark:border-slate-800/60 text-xs">
                          <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                            💡 <strong className="text-slate-700 dark:text-slate-300 font-semibold">{inst.conceptTieIn}</strong>
                          </span>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailInstrument(inst);
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-600/30 transition-colors cursor-pointer text-xs flex items-center gap-1 shadow-2xs dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-300"
                            >
                              <BarChart2 className="w-3.5 h-3.5" />
                              <span>View Chart & Trade</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: User Active Holdings */}
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
                        onClick={() => marketItem && setDetailInstrument(marketItem)}
                        className="bg-white border border-[#e3decb] hover:border-emerald-600/40 rounded-2xl p-3.5 flex flex-col gap-2 shadow-xs transition-all cursor-pointer dark:bg-slate-900 dark:border-slate-800"
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
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDetailInstrument(marketItem);
                                }}
                                className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-600/30 transition-colors cursor-pointer text-xs flex items-center gap-1 dark:bg-emerald-950/60 dark:text-emerald-300"
                              >
                                <BarChart2 className="w-3.5 h-3.5" />
                                <span>Chart & Manage</span>
                              </button>
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

      {/* 3. TradingView Stock Detail & Order Ticket Modal */}
      {detailInstrument && (
        <StockDetailModal
          instrument={detailInstrument}
          holding={portfolio.holdings.find((h) => h.symbol === detailInstrument.symbol)}
          cashBalance={portfolio.cashBalance}
          isOpen={Boolean(detailInstrument)}
          onClose={() => setDetailInstrument(null)}
          onExecuteTrade={handleExecuteTrade}
          isDark={isDark}
        />
      )}

      {/* 4. CEO Pitch Partner Modal Dialog */}
      {showPitchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white border border-[#e3decb] rounded-3xl p-6 flex flex-col gap-4 shadow-2xl relative dark:bg-slate-900 dark:border-slate-800 text-[var(--foreground)]">
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
