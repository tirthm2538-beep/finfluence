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
      // Friendly explanation if user tries to submit with placeholder keys
      setErrorMessage(
        'Supabase keys are currently placeholder values in .env.local. Click "Continue as Guest" below to explore immediately, or paste your live keys into frontend/.env.local!'
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
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 sm:p-6 text-white overflow-y-auto no-scrollbar">
      {/* Background radial glow */}
      <div className="absolute top-1/4 -right-20 w-60 h-60 rounded-full blur-[90px] bg-emerald-600/15 pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-60 h-60 rounded-full blur-[90px] bg-indigo-600/15 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Brand Icon & Heading */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-500/20 mb-3">
          <TrendingUp className="w-6 h-6 text-slate-950 stroke-[2.5]" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-0.5">
          Fin<span className="text-emerald-400">Fluence</span>
        </h1>
        <p className="text-xs text-slate-400 mb-5 text-center">
          Gen Z financial literacy in bite-sized story cards
        </p>

        {/* Auth Mode Toggle (Sign In / Sign Up) */}
        <div className="w-full flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
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
                ? 'bg-emerald-500 text-slate-950 shadow-md'
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
        <form onSubmit={handleAuth} className="w-full space-y-2.5 mb-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
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
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-slate-800" />
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
            or demo mode
          </span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Continue as Guest Button */}
        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Continue as Guest / Pitch Demo</span>
          <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-auto" />
        </button>

        {/* Supabase Status Footer Note */}
        <div className="mt-4 text-center">
          {supabaseConfigured ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400/90 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Connected to Supabase Project
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
              <span>Ready for Supabase keys in <code className="text-slate-300">.env.local</code></span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
