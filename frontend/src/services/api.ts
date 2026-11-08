import { StoryCardData, TrackType } from '../types/card';
import { SAMPLE_CARDS } from '../data/sampleCards';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface CardsResponse {
  cards: StoryCardData[];
  source: 'api' | 'local';
}

/**
 * Fetch cards from FastAPI backend with automatic fallback to local cards
 * if the backend server is unreachable.
 */
export async function fetchCards(track?: TrackType): Promise<CardsResponse> {
  const url = track
    ? `${API_BASE_URL}/cards?track=${encodeURIComponent(track)}`
    : `${API_BASE_URL}/cards`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    const data: StoryCardData[] = await res.json();
    return {
      cards: data,
      source: 'api',
    };
  } catch {
    // Graceful fallback to local mock data
    const localFiltered = track
      ? SAMPLE_CARDS.filter((c) => c.track === track)
      : SAMPLE_CARDS;

    return {
      cards: localFiltered,
      source: 'local',
    };
  }
}

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);
    return res.ok;
  } catch {
    return false;
  }
}
