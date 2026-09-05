// Remembers which unit was last used for a given item name, entirely on
// this device — no account/backend involved. Powers the "type an item
// you've bought before, get its usual unit filled in" convenience in the
// Shopping List tool. Deliberately separate from ShoppingItemRecord: this
// is cross-list memory ("sugar is always kg"), not tied to any one list.

const STORAGE_KEY = 'merotools_shopping_item_suggestions_v1';
const MAX_SUGGESTIONS = 5;

interface KnownItem {
  name: string; // original casing, as last typed
  unit: string | null;
  lastUsedAt: string;
}

function normalize(name: string): string {
  return name.trim().toLowerCase();
}

function getKnownItems(): KnownItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt storage — treat as empty
  }
  return [];
}

function saveKnownItems(items: KnownItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

// Call whenever an item is saved, so future typing of the same name
// suggests this unit. Upserts by normalized name (case-insensitive).
export function rememberItemUnit(name: string, unit: string | null): void {
  const key = normalize(name);
  if (!key) return;
  const items = getKnownItems().filter((i) => normalize(i.name) !== key);
  items.unshift({ name: name.trim(), unit, lastUsedAt: new Date().toISOString() });
  saveKnownItems(items);
}

// Returns known items whose name contains `query` (case-insensitive),
// most-recently-used first. Empty query returns nothing — this is meant
// for an as-you-type suggestion list, not a full item browser.
export function getItemSuggestions(query: string, limit: number = MAX_SUGGESTIONS): KnownItem[] {
  const q = normalize(query);
  if (!q) return [];
  return getKnownItems()
    .filter((i) => normalize(i.name).includes(q))
    .slice(0, limit);
}

// Exact (case-insensitive) match, used to auto-fill the unit the moment
// a name matches something already known, without waiting for the user
// to pick from the suggestion list.
export function findExactItemMatch(name: string): KnownItem | null {
  const key = normalize(name);
  if (!key) return null;
  return getKnownItems().find((i) => normalize(i.name) === key) ?? null;
}
