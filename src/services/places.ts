// Location search for Location Reminders — search by place name, never
// raw lat/lng entry. Calls the backend proxy (never Google directly);
// see helperapi-backend/README.md for why the API key lives there.

// TEMPORARY (testing only): the production endpoint doesn't exist yet —
// pointed at the local dev backend on the LAN so the connected phone can
// reach it. Revert to 'https://kumarsunil.com.np/api/helperapi' once
// /places/search/ and /places/reverse/ are deployed there (also remove
// the matching NSExceptionDomains entry in ios/App/App/Info.plist).
const HELPERAPI_BASE = 'http://172.20.10.5:8811/api/helperapi';

export interface PlaceSearchResult {
  name: string;
  lat: number;
  lng: number;
}

interface PlacesSearchResponse {
  available: boolean;
  source?: string;
  results?: PlaceSearchResult[];
  message?: string;
}

interface PlacesReverseResponse {
  available: boolean;
  name?: string;
  message?: string;
}

// Fails soft — returns [] on any network/parse/rate-limit error, matching
// the convention used everywhere else in this app (fetchLiveMetalsData,
// fetchRateHistory), so a flaky search never crashes the reminder form.
export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  try {
    const res = await fetch(`${HELPERAPI_BASE}/places/search/?q=${encodeURIComponent(trimmed)}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Places search returned ${res.status}`);
    const payload: PlacesSearchResponse = await res.json();
    if (!payload.available || !Array.isArray(payload.results)) return [];
    return payload.results;
  } catch {
    return [];
  }
}

// Turns a manually-dropped map pin into a display name, for the "search
// didn't find it, pick on the map" fallback. Fails soft to null so the
// caller can fall back to a plain coordinate label rather than blocking
// the save — a pin the user placed on purpose is still a valid location
// even if reverse geocoding can't name it.
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(`${HELPERAPI_BASE}/places/reverse/?lat=${lat}&lng=${lng}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`Reverse geocode returned ${res.status}`);
    const payload: PlacesReverseResponse = await res.json();
    if (!payload.available || !payload.name) return null;
    return payload.name;
  } catch {
    return null;
  }
}
