import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if real Supabase keys are configured (and not the default placeholders)
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes('your-project.supabase.co') &&
    !supabaseAnonKey.includes('your-anon-key-here')
  );
};

// Lazy client instantiation
let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return supabaseInstance;
};

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  isGuest?: boolean;
}

const GUEST_STORAGE_KEY = 'finfluence_guest_user';

export const getGuestUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(GUEST_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export const setGuestUser = (user: AuthUser | null): void => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(GUEST_STORAGE_KEY);
  }
};
