'use client';

import React, { useState } from 'react';
import {
  getSupabaseClient,
  isSupabaseConfigured,
  setGuestUser,
  AuthUser,
} from '../../lib/supabase';
import {
  TrendingUp,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  CheckCircle2,
  Briefcase,
  Flame,
  Zap,
} from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: AuthUser) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const supabaseConfigured = isSupabaseConfigured();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!supabaseConfigured) {
      setErrorMessage(
        'Supabase keys are currently placeholder values in .env.local. Click "Continue as Guest" below to explore immediately!'
      );
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          if (data.session) {
            onAuthSuccess({
              id: data.user.id,
              email: data.user.email || email,
              isGuest: false,
            });
          } else {
            setSuccessMessage(
              'Account created! Check your email to confirm registration or sign in.'
            );
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email || email,
            isGuest: false,
          });
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guest: AuthUser = {
      id: `guest-${Date.now()}`,
      email: 'guest@finfluence.demo',
      displayName: 'Guest Student',
      isGuest: true,
    };
    setGuestUser(guest);
    onAuthSuccess(guest);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 text-white overflow-y-auto no-scrollbar">
      {/* Background radial glow */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 rounded-full blur-[140px] bg-emerald-600/15 pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-96 h-96 rounded-full blur-[140px] bg-indigo-600/15 pointer-events-none" />

      {/* Main Container (Responsive: Single column on mobile, 2-column on desktop) */}
      <div className="relative z-10 w-full max-w-sm lg:max-w-5xl lg:grid lg:grid-cols-12 lg:gap-12 lg:items-center">
        {/* DESKTOP LEFT HERO SHOWCASE (hidden on mobile, visible on lg) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20">
              <TrendingUp className="w-7 h-7 text-slate-950 stroke-[2.8]" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">
                Fin<span className="text-emerald-400">Fluence</span>
              </h1>
              <p className="text-xs text-emerald-400/90 font-semibold tracking-wide uppercase">
                Gen Z Financial Literacy Platform
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
              Master Money & Stocks.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Without Boring Textbooks.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
              Swipeable bite-sized story cards designed for college students across science, arts, and commerce. Learn SIPs, compounding, crypto, and stock market fundamentals in 60 seconds each.
            </p>
          </div>

          {/* 3 Core Value Pillars */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">20 Interactive Story Cards & Quizzes</h4>
                <p className="text-[11px] text-slate-400">
                  Two tracks: Core Finance & Stock Market literacy with grounded analogies and instant XP checks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Briefcase className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">₹1,00,000 Virtual Practice Sandbox</h4>
                <p className="text-[11px] text-slate-400">
                  Simulated order book with 6 realistic market instruments to practice trading risk-free.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Flame className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Daily Streak Engine & Cloud Progress</h4>
                <p className="text-[11px] text-slate-400">
                  Build habits that compound. Track daily streaks, rank progression, and save favorite cards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AUTH FORM CARD (Centered on mobile, Right column on desktop) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">
          {/* Mobile-only brand header */}
          <div className="lg:hidden flex flex-col items-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-2">
              <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-0.5">
              Fin<span className="text-emerald-400">Fluence</span>
            </h1>
            <p className="text-xs text-slate-400 text-center">
              Gen Z financial literacy in bite-sized story cards
            </p>
          </div>

          <div className="w-full mb-4">
            <h3 className="text-lg font-bold text-white hidden lg:block">
              {mode === 'signin' ? 'Welcome Back!' : 'Start Your Journey'}
            </h3>
            <p className="text-xs text-slate-400 hidden lg:block">
              Sign in with your email or explore instantly with Guest Mode.
            </p>
          </div>

          {/* Continue as Guest Button (Top Pitch Priority) */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg shadow-emerald-500/25 mb-4"
          >
            <Sparkles className="w-4 h-4 fill-slate-950 text-slate-950" />
            <span>Continue as Guest / Pitch Demo (1-Click)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              or sign in with email
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Auth Mode Toggle (Sign In / Sign Up) */}
          <div className="w-full flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error / Success Messages */}
          {errorMessage && (
            <div className="w-full p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/30 text-rose-200 text-xs mb-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="w-full p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/30 text-emerald-200 text-xs mb-3 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug">{successMessage}</span>
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleAuth} className="w-full space-y-3 mb-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@college.edu"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In with Email' : 'Create Supabase Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Supabase Status Footer Note */}
          <div className="mt-2 text-center">
            {supabaseConfigured ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Protected by Supabase Auth (PostgreSQL)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
                <span>Guest mode active • Connect Supabase in <code className="text-slate-300">.env.local</code></span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
