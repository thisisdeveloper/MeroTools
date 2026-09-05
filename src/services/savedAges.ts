import { ADDate, SavedAgeRecord } from '../types';

const STORAGE_KEY = 'merotools_saved_ages_v1';

export function getSavedAges(): SavedAgeRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt storage — treat as empty
  }
  return [];
}

function persist(ages: SavedAgeRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ages));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

export interface NewAgeInput {
  name: string;
  dobAd: ADDate;
}

export function saveAge(input: NewAgeInput): SavedAgeRecord {
  const record: SavedAgeRecord = {
    id: `age_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: input.name.trim() || 'Untitled',
    createdAt: new Date().toISOString(),
    dobAd: input.dobAd,
  };
  const ages = getSavedAges();
  ages.unshift(record);
  persist(ages);
  return record;
}

export function renameAge(id: string, name: string): SavedAgeRecord | null {
  const ages = getSavedAges();
  const idx = ages.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const trimmed = name.trim();
  if (!trimmed) return ages[idx];

  const updated: SavedAgeRecord = { ...ages[idx], name: trimmed };
  ages[idx] = updated;
  persist(ages);
  return updated;
}

export function deleteAge(id: string): void {
  persist(getSavedAges().filter((a) => a.id !== id));
}
