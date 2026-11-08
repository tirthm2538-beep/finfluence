import { getSupabaseClient, isSupabaseConfigured, AuthUser } from './supabase';

export interface UserProgressData {
  userId: string;
  isGuest: boolean;
  xpPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  completedCardIds: string[];
  bookmarkedCardIds: string[];
}

export const getTodayDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isYesterday = (prevDateStr: string, todayStr: string): boolean => {
  try {
    const prevParts = prevDateStr.split('-').map(Number);
    const todayParts = todayStr.split('-').map(Number);
    if (prevParts.length !== 3 || todayParts.length !== 3) return false;

    // Use Date.UTC to guarantee pure day arithmetic immune to DST / local hours
    const prevUtc = Date.UTC(prevParts[0], prevParts[1] - 1, prevParts[2]);
    const todayUtc = Date.UTC(todayParts[0], todayParts[1] - 1, todayParts[2]);

    const diffDays = Math.round((todayUtc - prevUtc) / (1000 * 60 * 60 * 24));
    return diffDays === 1;
  } catch {
    return false;
  }
};

const getStorageKey = (userId: string) => `finfluence_progress_${userId}`;

/**
 * Load user progress from Supabase if authenticated, or from localStorage for guest
 */
export async function loadUserProgress(user: AuthUser): Promise<UserProgressData> {
  const today = getTodayDateString();

  // Guest Mode
  if (user.isGuest || !isSupabaseConfigured()) {
    if (typeof window === 'undefined') {
      return {
        userId: user.id,
        isGuest: true,
        xpPoints: 0,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        completedCardIds: [],
        bookmarkedCardIds: [],
      };
    }

    try {
      const stored = localStorage.getItem(getStorageKey(user.id));
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore localStorage parse errors
    }

    const defaultGuest: UserProgressData = {
      userId: user.id,
      isGuest: true,
      xpPoints: 0,
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: today,
      completedCardIds: [],
      bookmarkedCardIds: [],
    };
    saveLocalProgress(defaultGuest);
    return defaultGuest;
  }

  // Supabase Authenticated Mode
  const supabase = getSupabaseClient();
  if (!supabase) {
    return loadUserProgress({ ...user, isGuest: true });
  }

  try {
    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp_points, current_streak, longest_streak, last_active_date')
      .eq('user_id', user.id)
      .maybeSingle();

    // 2. Fetch Completed Cards
    const { data: completions } = await supabase
      .from('completed_cards')
      .select('card_id')
      .eq('user_id', user.id);

    // 3. Fetch Bookmarks
    const { data: bookmarks } = await supabase
      .from('bookmarks')
      .select('card_id')
      .eq('user_id', user.id);

    const completedCardIds = (completions || []).map((c: { card_id: string }) => c.card_id);
    const bookmarkedCardIds = (bookmarks || []).map((b: { card_id: string }) => b.card_id);

    let xpPoints = profile?.xp_points ?? 0;
    let currentStreak = profile?.current_streak ?? 1;
    let longestStreak = profile?.longest_streak ?? 1;
    let lastActiveDate = profile?.last_active_date ?? today;

    // If profile didn't exist yet, attempt to insert initial row
    if (!profile) {
      const initialProfile = {
        user_id: user.id,
        username: user.email ? user.email.split('@')[0] : 'user',
        display_name: user.displayName || (user.email ? user.email.split('@')[0] : 'Student'),
        xp_points: 0,
        current_streak: 1,
        longest_streak: 1,
        last_active_date: today,
      };
      await supabase.from('profiles').insert(initialProfile);
    }

    const result: UserProgressData = {
      userId: user.id,
      isGuest: false,
      xpPoints,
      currentStreak,
      longestStreak,
      lastActiveDate,
      completedCardIds,
      bookmarkedCardIds,
    };

    saveLocalProgress(result);
    return result;
  } catch (err) {
    console.warn('Error loading Supabase progress, falling back to local storage:', err);
    return loadUserProgress({ ...user, isGuest: true });
  }
}

/**
 * Record quiz completion: updates completed_cards, advances daily streak, and adds XP.
 */
export async function recordQuizCompletion(
  user: AuthUser,
  currentProgress: UserProgressData,
  cardId: string,
  track: string
): Promise<UserProgressData> {
  const today = getTodayDateString();
  const alreadyCompleted = currentProgress.completedCardIds.includes(cardId);

  // Calculate new streak
  let newStreak = currentProgress.currentStreak;
  let newLongest = currentProgress.longestStreak;
  const lastActive = currentProgress.lastActiveDate;

  if (!lastActive) {
    newStreak = 1;
  } else if (lastActive === today) {
    // Already active today, maintain streak
    newStreak = Math.max(1, currentProgress.currentStreak);
  } else if (isYesterday(lastActive, today)) {
    // Exactly 1 day since last activity -> increment streak!
    newStreak = currentProgress.currentStreak + 1;
    newLongest = Math.max(newStreak, currentProgress.longestStreak);
  } else {
    // Missed one or more days -> reset to 1
    newStreak = 1;
  }

  // Calculate new XP (+10 XP per new completion)
  const newXp = alreadyCompleted ? currentProgress.xpPoints : currentProgress.xpPoints + 10;
  const updatedCompleted = alreadyCompleted
    ? currentProgress.completedCardIds
    : [...currentProgress.completedCardIds, cardId];

  const updatedProgress: UserProgressData = {
    ...currentProgress,
    xpPoints: newXp,
    currentStreak: newStreak,
    longestStreak: newLongest,
    lastActiveDate: today,
    completedCardIds: updatedCompleted,
  };

  // Always update local storage for instant responsiveness
  saveLocalProgress(updatedProgress);

  // If Guest, return immediately
  if (user.isGuest || !isSupabaseConfigured()) {
    return updatedProgress;
  }

  // Authenticated Mode: persist to Supabase
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // 1. Insert into completed_cards (if not already completed)
      if (!alreadyCompleted) {
        await supabase.from('completed_cards').upsert(
          {
            user_id: user.id,
            card_id: cardId,
            track,
            score: 10,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,card_id' }
        );
      }

      // 2. Update profiles table (Try update first, insert if not present)
      const { data: updatedRows, error: updateErr } = await supabase
        .from('profiles')
        .update({
          xp_points: newXp,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_active_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select();

      if (!updatedRows || updatedRows.length === 0) {
        await supabase.from('profiles').insert({
          user_id: user.id,
          username: user.email ? user.email.split('@')[0] : 'user',
          display_name: user.displayName || (user.email ? user.email.split('@')[0] : 'Learner'),
          xp_points: newXp,
          current_streak: newStreak,
          longest_streak: newLongest,
          last_active_date: today,
        });
      }
    } catch (err) {
      console.error('Failed to sync quiz completion to Supabase:', err);
    }
  }

  return updatedProgress;
}

/**
 * Toggle bookmark state for a card
 */
export async function toggleBookmark(
  user: AuthUser,
  currentProgress: UserProgressData,
  cardId: string
): Promise<UserProgressData> {
  const isSaved = currentProgress.bookmarkedCardIds.includes(cardId);
  const updatedBookmarks = isSaved
    ? currentProgress.bookmarkedCardIds.filter((id) => id !== cardId)
    : [...currentProgress.bookmarkedCardIds, cardId];

  const updatedProgress: UserProgressData = {
    ...currentProgress,
    bookmarkedCardIds: updatedBookmarks,
  };

  saveLocalProgress(updatedProgress);

  if (user.isGuest || !isSupabaseConfigured()) {
    return updatedProgress;
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      if (isSaved) {
        // Remove from bookmarks
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('card_id', cardId);
      } else {
        // Insert into bookmarks
        await supabase.from('bookmarks').insert({
          user_id: user.id,
          card_id: cardId,
          saved_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Failed to sync bookmark to Supabase:', err);
    }
  }

  return updatedProgress;
}

function saveLocalProgress(progress: UserProgressData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(progress.userId), JSON.stringify(progress));
  } catch {
    // Ignore storage quota errors
  }
}
