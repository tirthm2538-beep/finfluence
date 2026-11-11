'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StoryCardData } from '../types/card';
import { SAMPLE_CARDS } from '../data/sampleCards';
import { StoryFeed } from '../components/feed/StoryFeed';
import { DesktopStoryDashboard } from '../components/feed/DesktopStoryDashboard';
import { AuthScreen } from '../components/auth/AuthScreen';
import { PortfolioView } from '../components/portfolio/PortfolioView';
import { OpeningAnimation } from '../components/ui/OpeningAnimation';
import {
  AuthUser,
  getSupabaseClient,
  isSupabaseConfigured,
  getGuestUser,
  setGuestUser,
} from '../lib/supabase';
import {
  RefreshCw,
  AlertCircle,
  Database,
  TrendingUp,
} from 'lucide-react';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://finfluence-d420.onrender.com';

export default function Home() {
  const [activeView, setActiveView] = useState<'feed' | 'portfolio'>('feed');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [cards, setCards] = useState<StoryCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'backend' | 'fallback' | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  // Check initial authentication state (Supabase session or Guest session)
  useEffect(() => {
    const checkAuth = async () => {
      // 0. Check URL query params for demo/guest bypass (e.g. ?guest=true or ?demo=true)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('portfolio') === 'true' || params.get('view') === 'portfolio') {
          setActiveView('portfolio');
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
      <main className="h-dvh max-h-dvh w-full flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-3 animate-pulse">
          <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="text-sm font-bold text-slate-800 dark:text-slate-300">Loading FinFluence...</span>
        <span className="text-xs text-slate-500 mt-1">Checking authentication session</span>
      </main>
    );
  }

  // View 2: Not Authenticated -> Show Responsive Auth Screen
  if (!user) {
    return (
      <main className="h-dvh max-h-dvh w-full flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
        <AuthScreen onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />
      </main>
    );
  }

  // View 3: Authenticated but Backend Loading
  if (loading) {
    return (
      <main className="h-dvh max-h-dvh w-full flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden p-6 text-center">
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <TrendingUp className="w-7 h-7 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center shadow-md">
            <RefreshCw className="w-3 h-3 text-white animate-spin" />
          </span>
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Loading FinFluence Library
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mb-4">
          Connecting to backend API at <code className="text-emerald-700 dark:text-emerald-300 font-mono">{BACKEND_URL.includes('onrender') ? 'Render' : 'localhost:8000'}</code>...
        </p>

        <div className="w-56 h-1.5 bg-[#e3decb] dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full animate-pulse w-3/4" />
        </div>
      </main>
    );
  }

  // View 4: Authenticated but Backend Offline Error
  if (error && cards.length === 0) {
    return (
      <main className="h-dvh max-h-dvh w-full flex flex-col items-center justify-center bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
          <AlertCircle className="w-7 h-7 text-rose-500" />
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          FastAPI Backend Offline
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
          Could not connect to the card server. You can retry the connection or explore all 20 cards instantly using the offline backup.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            onClick={() => fetchCardsFromBackend()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>

          <button
            onClick={loadOfflineFallback}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#ede9dc] hover:bg-[#e2ddd0] border border-[#ded8c4] text-slate-900 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            <Database className="w-4 h-4 text-amber-500" />
            <span>Use Offline Backup</span>
          </button>
        </div>
      </main>
    );
  }

  // View 5: Authenticated & Cards Ready -> Clean Responsive Platform
  return (
    <main className="h-dvh max-h-dvh w-full max-w-full flex flex-col bg-[var(--background)] text-[var(--foreground)] relative overflow-hidden">
      {/* Short, non-blocking polished entrance intro */}
      {showIntro && <OpeningAnimation onFinish={() => setShowIntro(false)} />}

      {/* DESKTOP DASHBOARD (>= 1024px) */}
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
            dataSource={dataSource}
            onSyncBackend={fetchCardsFromBackend}
            isSyncing={loading}
          />
        )}
      </div>

      {/* MOBILE PHONE FEED (< 1024px) */}
      <div className="flex lg:hidden w-full max-w-full h-full flex-col overflow-hidden">
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
    </main>
  );
}
