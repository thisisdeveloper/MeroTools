import { HomeCardId, HomeSettings } from '../types';

const STORAGE_KEY = 'merotools_home_settings_v1';

export const DEFAULT_HOME_SETTINGS: HomeSettings = {
  date: true,
  forex: true,
  gold: true,
  upcomingEvent: true,
  reminders: true,
  shoppingList: true,
  savedAges: true,
};

export function getHomeSettings(): HomeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_HOME_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // corrupt storage — fall back to defaults
  }
  return { ...DEFAULT_HOME_SETTINGS };
}

function persist(settings: HomeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function setHomeCardEnabled(id: HomeCardId, enabled: boolean): HomeSettings {
  const settings = { ...getHomeSettings(), [id]: enabled };
  persist(settings);
  return settings;
}

export function resetHomeSettings(): HomeSettings {
  persist(DEFAULT_HOME_SETTINGS);
  return { ...DEFAULT_HOME_SETTINGS };
}
