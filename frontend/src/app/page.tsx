'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StoryCardData } from '../types/card';
import { SAMPLE_CARDS } from '../data/sampleCards';
import { StoryFeed } from '../components/feed/StoryFeed';
import { DesktopStoryDashboard } from '../components/feed/DesktopStoryDashboard';
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
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'phone'>('desktop');
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
      // 0. Check URL query params for demo/guest bypass (e.g. ?guest=true or ?demo=true)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('portfolio') === 'true' || params.get('view') === 'portfolio') {
          setActiveView('portfolio');
        }
        if (params.get('phone') === 'true' || params.get('mode') === 'phone') {
          setDeviceMode('phone');
        }
        if (params.get('guest') === 'true' || params.get('demo') === 'true') {
          const guest: AuthUser = {
            id: 'guest-demo-user',
            email: 'guest@finfluence.demo',
            displayName: 'Guest Student',
            isGuest: true,
          };
          setGuestUser(guest);
          setUser(guest);
          setAuthChecking(false);
          return;
        }
      }

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

  // View 1: Auth Loading Shimmer
  if (authChecking) {
    return (
      <main className="h-dvh max-h-dvh w-full flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3 animate-pulse">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
        </div>
        <span className="text-sm font-semibold text-slate-300">Loading FinFluence...</span>
        <span className="text-xs text-slate-500 mt-1">Checking authentication session</span>
      </main>
    );
  }

  // View 2: Not Authenticated -> Show Responsive Auth Screen
  if (!user) {
    return (
      <main className="h-dvh max-h-dvh w-full flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden">
        <AuthScreen onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
      </main>
    );
  }

  // View 3: Authenticated but Backend Loading
  if (loading) {
    return (
      <main className="h-dvh max-h-dvh w-full flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden p-6 text-center">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <TrendingUp className="w-7 h-7 text-emerald-400 stroke-[2.5]" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
            <RefreshCw className="w-3 h-3 text-slate-950 animate-spin" />
          </span>
        </div>

        <h2 className="text-base font-bold text-white mb-1">
          Loading FinFluence Library
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mb-4">
          Connecting to backend API at <code className="text-emerald-300 font-mono">{BACKEND_URL.includes('onrender') ? 'Render' : 'localhost:8000'}</code>...
        </p>

        <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full animate-pulse w-3/4" />
        </div>
      </main>
    );
  }

  // View 4: Authenticated but Backend Offline Error
  if (error && cards.length === 0) {
    return (
      <main className="h-dvh max-h-dvh w-full flex flex-col items-center justify-center bg-slate-950 text-white relative overflow-hidden p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
          <AlertCircle className="w-7 h-7 text-rose-400" />
        </div>

        <h2 className="text-base font-bold text-white mb-1">
          FastAPI Backend Offline
        </h2>
        <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">
          Could not connect to the card server. You can retry the connection or explore all 20 cards instantly using the offline backup.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            onClick={() => fetchCardsFromBackend()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>

          <button
            onClick={loadOfflineFallback}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
          >
            <Database className="w-4 h-4 text-amber-400" />
            <span>Use Offline Backup</span>
          </button>
        </div>
      </main>
    );
  }

  // View 5: Authenticated & Cards Ready -> Dual Mode (Desktop Dashboard vs Mobile Phone Frame)
  return (
    <main className="h-dvh max-h-dvh w-full flex flex-col bg-slate-950 text-white relative overflow-hidden">
      {/* CASE A: PHONE SIMULATOR MODE (explicitly toggled on desktop) */}
      {deviceMode === 'phone' ? (
        <div className="w-full h-full flex flex-col items-center justify-between p-0 md:p-3 relative z-20 overflow-hidden">
          {/* Helper toolbar to switch back to desktop view */}
          <header className="hidden md:flex items-center justify-between w-full max-w-md px-4 py-1.5 z-30 flex-shrink-0 bg-slate-900/80 border border-slate-800 rounded-xl mb-2">
            <div className="flex items-center gap-2 text-xs">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">Phone Simulator Mode</span>
            </div>
            <button
              onClick={() => setDeviceMode('desktop')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all cursor-pointer shadow-sm"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Switch to Desktop View</span>
            </button>
          </header>

          {/* Smartphone Frame Container */}
          <div className="w-full h-full md:max-w-[400px] md:max-h-[calc(100dvh-75px)] flex items-center justify-center">
            <div className="w-full h-full relative flex flex-col bg-slate-950 md:rounded-[36px] md:p-2 md:bg-slate-900/90 md:border md:border-slate-800/90 md:shadow-[0_0_50px_rgba(0,0,0,0.8)] md:ring-1 md:ring-white/10 overflow-hidden">
              <div className="w-full h-full relative overflow-hidden bg-slate-950 md:rounded-[28px] flex flex-col">
                {activeView === 'portfolio' ? (
                  <PortfolioView
                    user={user}
                    onBackToFeed={() => setActiveView('feed')}
                  />
                ) : (
                  <StoryFeed
                    cards={cards}
                    user={user}
                    onSignOut={handleSignOut}
                    onOpenPortfolio={() => setActiveView('portfolio')}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CASE B: DEFAULT RESPONSIVE VIEW (Widescreen Desktop on lg+, Native Feed on mobile) */
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Desktop Dashboard on >= 1024px */}
          <div className="hidden lg:flex w-full h-full flex-col overflow-hidden">
            {activeView === 'portfolio' ? (
              <PortfolioView
                user={user}
                onBackToFeed={() => setActiveView('feed')}
              />
            ) : (
              <DesktopStoryDashboard
                cards={cards}
                user={user}
                onSignOut={handleSignOut}
                onOpenPortfolio={() => setActiveView('portfolio')}
                onSwitchToPhoneView={() => setDeviceMode('phone')}
                dataSource={dataSource}
                onSyncBackend={fetchCardsFromBackend}
                isSyncing={loading}
              />
            )}
          </div>

          {/* Mobile Phone Native View on < 1024px */}
          <div className="flex lg:hidden w-full h-full flex-col overflow-hidden">
            {activeView === 'portfolio' ? (
              <PortfolioView
                user={user}
                onBackToFeed={() => setActiveView('feed')}
              />
            ) : (
              <StoryFeed
                cards={cards}
                user={user}
                onSignOut={handleSignOut}
                onOpenPortfolio={() => setActiveView('portfolio')}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
