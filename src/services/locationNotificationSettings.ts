// User's preferred urgency for Location Reminder alerts. Stored
// separately from services/geofences.ts (which pulls in the native
// plugin bridge) so Settings can read/write this preference without
// eagerly loading that plugin into the app's main bundle.

export type LocationNotificationStyle = 'alarm' | 'alert';

const STORAGE_KEY = 'merotools_location_notification_style_v1';
const DEFAULT_STYLE: LocationNotificationStyle = 'alarm';

export function getLocationNotificationStyle(): LocationNotificationStyle {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'alarm' || saved === 'alert') return saved;
  } catch {
    // ignore — fall back to default
  }
  return DEFAULT_STYLE;
}

export function setLocationNotificationStyle(style: LocationNotificationStyle): void {
  try {
    localStorage.setItem(STORAGE_KEY, style);
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}
