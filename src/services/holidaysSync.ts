// Nepal holidays/festivals — backend-synced with the bundled dataset as
// an offline fallback. Most Nepali festivals are lunar/tithi-based and
// drift by roughly a week or more every year (see holidaysData.ts's own
// note), so re-shipping an app update every time a date needs fixing
// doesn't scale. The backend's Holiday table (helperapi-backend) is
// seeded from this same bundled list and can then be corrected or added
// to independently via Django admin — this module just keeps a local
// cache of whatever the backend last returned, refreshed opportunistically
// when the Public Holidays tool is opened, matching the same
// cached-first/refresh-in-background pattern already used for forex and
// gold/silver rates (see services/forex.ts, services/metals.ts).

import { NepalHoliday, NEPAL_HOLIDAYS_LIST } from '../data/holidaysData';

const STORAGE_KEY = 'merotools_holidays_cache_v1';
const HOLIDAYS_URL = 'https://kumarsunil.com.np/api/helperapi/holidays/';

interface HolidaysApiResponse {
  available: boolean;
  count?: number;
  results?: NepalHoliday[];
  message?: string;
}

// Bundled list is the "base" — used until a live sync succeeds at least
// once, and again any time the cache is empty/corrupt.
export function getCachedHolidays(): NepalHoliday[] {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore — fall back to bundled below
  }
  return NEPAL_HOLIDAYS_LIST;
}

function saveCachedHolidays(holidays: NepalHoliday[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(holidays));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

// Fails soft — on any network/parse error, the existing cache (or bundled
// base) keeps being used; this never throws and never blocks rendering.
export async function fetchLiveHolidays(): Promise<NepalHoliday[]> {
  try {
    const res = await fetch(HOLIDAYS_URL, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const json: HolidaysApiResponse = await res.json();
      if (json.available && Array.isArray(json.results) && json.results.length > 0) {
        saveCachedHolidays(json.results);
        return json.results;
      }
    }
  } catch {
    // Fallback to cache below
  }
  return getCachedHolidays();
}
