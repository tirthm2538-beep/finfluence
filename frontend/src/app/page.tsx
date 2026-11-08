'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StoryCardData } from '../types/card';
import { SAMPLE_CARDS } from '../data/sampleCards';
import { StoryFeed } from '../components/feed/StoryFeed';
import { AuthScreen } from '../components/auth/AuthScreen';
import { PortfolioView } from '../components/portfolio/PortfolioView';
import {
  AuthUser,
  getSupabaseClient,
  isSupabaseConfigured,
  getGuestUser,
  setGuestUser,
} from '../lib/supabase';
import {
  Smartphone,
  Monitor,
  Info,
  Server,
  RefreshCw,
  AlertCircle,
  Database,
  TrendingUp,
  ShieldCheck,
  LogOut,
  User,
  Briefcase,
  BookOpen,
} from 'lucide-react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://finfluence-d420.onrender.com';

export default function Home() {
  const [deviceMode, setDeviceMode] = useState<'phone' | 'full'>('phone');
  const [activeView, setActiveView] = useState<'feed' | 'portfolio'>('feed');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [cards, setCards] = useState<StoryCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'backend' | 'fallback' | null>(null);

  // Check initial authentication state (Supabase session or Guest session)
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check Guest storage
      const guest = getGuestUser();
      if (guest) {
        setUser(guest);
        setAuthChecking(false);
        return;
      }

      // 2. Check Supabase session if configured
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || 'user@finfluence.app',
              isGuest: false,
            });
          }
        }
      }

      setAuthChecking(false);
    };

    checkAuth();
  }, []);

  const handleSignOut = async () => {
    if (user?.isGuest) {
      setGuestUser(null);
    } else if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
  };

  const fetchCardsFromBackend = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

      const res = await fetch(`${BACKEND_URL}/cards`, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Backend returned status ${res.status}: ${res.statusText}`);
      }

      const data: StoryCardData[] = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Backend returned empty card list.');
      }

      setCards(data);
      setDataSource('backend');
      setError(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to connect to backend server';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOfflineFallback = () => {
    setCards(SAMPLE_CARDS);
    setDataSource('fallback');
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchCardsFromBackend();
    }
  }, [user, fetchCardsFromBackend]);

  return (
    <main className="h-dvh max-h-dvh w-full flex flex-col items-center justify-between bg-slate-950 text-white relative overflow-hidden p-0 md:p-2">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Desktop Helper Toolbar (hidden on mobile) */}
      <header className="hidden md:flex items-center justify-between w-full max-w-4xl px-4 py-1.5 z-30 flex-shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
            </div>
            <span>FinFluence</span>
          </div>

          <span className="text-slate-600">•</span>

          {/* User state in desktop toolbar */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-[11px] text-slate-300">
              <User className="w-3 h-3 text-emerald-400" />
              <span>{user.isGuest ? 'Guest Demo' : user.email}</span>
              <button
                onClick={handleSignOut}
                title="Log Out"
                className="ml-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Authentication Gateway</span>
            </span>
          )}

          {/* Connection Status Indicator */}
          {user && (
            <>
              <span className="text-slate-600">•</span>
              {loading ? (
                <span className="flex items-center gap-1.5 text-amber-400 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  Connecting API...
                </span>
              ) : dataSource === 'backend' ? (
                <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live API ({BACKEND_URL.includes('onrender') ? 'Render' : ':8000'})
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-300 text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Offline Backup
                </span>
              )}
            </>
          )}
        </div>

        {/* View Mode & Reload Controls */}
        <div className="flex items-center gap-1.5">
          {user && (
            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg mr-1">
              <button
                onClick={() => setActiveView('feed')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'feed'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Feed</span>
              </button>
              <button
                onClick={() => setActiveView('portfolio')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'portfolio'
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Practice Portfolio</span>
              </button>
            </div>
          )}

          {user && (
            <button
              onClick={() => fetchCardsFromBackend()}
              title="Refresh cards from FastAPI backend"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="hidden sm:inline">Sync API</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-0.5 rounded-lg">
            <button
              onClick={() => setDeviceMode('phone')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                deviceMode === 'phone'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Phone Frame</span>
            </button>
            <button
              onClick={() => setDeviceMode('full')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                deviceMode === 'full'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Full Width</span>
            </button>
          </div>
        </div>
      </header>

      {/* App Feed Center Area */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center relative z-20 overflow-hidden">
        <div
          className={`w-full h-full transition-all duration-300 flex items-center justify-center ${
            deviceMode === 'phone'
              ? 'md:max-w-[400px] md:max-h-[calc(100dvh-70px)]'
              : 'max-w-2xl md:max-h-[calc(100dvh-70px)]'
          }`}
        >
          {/* Smartphone Mockup Frame */}
          <div
            className={`w-full h-full relative flex flex-col bg-slate-950 transition-all duration-300 ${
              deviceMode === 'phone'
                ? 'md:rounded-[36px] md:p-2 md:bg-slate-900/90 md:border md:border-slate-800/90 md:shadow-[0_0_50px_rgba(0,0,0,0.8)] md:ring-1 md:ring-white/10'
                : 'md:rounded-xl md:border md:border-slate-800'
            }`}
          >
            {/* Screen Viewport */}
            <div
              className={`w-full h-full relative overflow-hidden bg-slate-950 flex flex-col ${
                deviceMode === 'phone' ? 'md:rounded-[28px]' : 'md:rounded-lg'
              }`}
            >
              {/* AUTH CHECKING SHIMMER */}
              {authChecking && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-2 animate-pulse">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-400">Loading FinFluence...</span>
                </div>
              )}

              {/* VIEW 1: NOT AUTHENTICATED -> SHOW LOGIN SCREEN */}
              {!authChecking && !user && (
                <AuthScreen onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
              )}

              {/* VIEW 2: AUTHENTICATED -> LOADING CARDS */}
              {!authChecking && user && loading && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="relative mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                      <TrendingUp className="w-6 h-6 text-emerald-400 stroke-[2.5]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <RefreshCw className="w-2.5 h-2.5 text-slate-950 animate-spin" />
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-white mb-1">
                    Loading Story Cards
                  </h2>
                  <p className="text-xs text-slate-400 max-w-[240px] mb-4">
                    Fetching cards from FastAPI backend on <code className="text-emerald-300 font-mono text-[11px]">localhost:8000</code>...
                  </p>

                  <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full animate-pulse w-3/4" />
                  </div>
                </div>
              )}

              {/* VIEW 3: AUTHENTICATED -> ERROR / BACKEND OFFLINE */}
              {!authChecking && user && !loading && error && (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                  </div>

                  <h2 className="text-sm font-bold text-white mb-1">
                    FastAPI Backend Offline
                  </h2>
                  <p className="text-xs text-slate-400 max-w-[260px] mb-3 leading-relaxed">
                    Could not connect to <code className="text-rose-300 font-mono text-[11px]">http://localhost:8000/cards</code>.
                  </p>

                  <div className="w-full max-w-[280px] bg-slate-900 border border-slate-800 rounded-xl p-2.5 mb-4 text-left">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Server className="w-3 h-3 text-slate-400" />
                      <span>Start Backend Command</span>
                    </div>
                    <code className="text-[11px] text-emerald-300 font-mono block bg-slate-950 px-2 py-1 rounded border border-slate-800/80">
                      npm run backend
                    </code>
                  </div>

                  <div className="flex flex-col gap-2 w-full max-w-[260px]">
                    <button
                      onClick={() => fetchCardsFromBackend()}
                      className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Backend Connection</span>
                    </button>

                    <button
                      onClick={loadOfflineFallback}
                      className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Database className="w-3.5 h-3.5 text-amber-400" />
                      <span>Use Offline Backup Cards</span>
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 4: AUTHENTICATED -> READY / FEED ACTIVE OR PORTFOLIO */}
              {!authChecking && user && (
                activeView === 'portfolio' ? (
                  <PortfolioView
                    user={user}
                    onBackToFeed={() => setActiveView('feed')}
                  />
                ) : (
                  !loading && !error && cards.length > 0 && (
                    <StoryFeed
                      cards={cards}
                      user={user}
                      onSignOut={handleSignOut}
                      onOpenPortfolio={() => setActiveView('portfolio')}
                    />
                  )
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Tip footer (hidden on mobile) */}
      <footer className="hidden md:flex items-center justify-center gap-2 py-1 text-[11px] text-slate-500 z-30 flex-shrink-0">
        <Info className="w-3 h-3 text-slate-400" />
        <span>
          FinFluence • Gen Z Financial Literacy App. Protected by Supabase Auth with Guest Pitch Mode.
        </span>
      </footer>
    </main>
  );
}
