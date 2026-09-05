import { ADDate, ShoppingItemRecord, ShoppingListRecord } from '../types';
import { toNepaliDigits } from '../calendar/bsCalendar';

const LISTS_KEY = 'merotools_shopping_lists_v1';
const ITEMS_KEY = 'merotools_shopping_items_v1';

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function readJson<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt storage — treat as empty
  }
  return [];
}

function writeJson<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

// ---- Lists ----

// One list icon design, colored differently per list so they're easy to
// tell apart at a glance — the color itself carries no meaning, it's
// just assigned randomly (and then kept stable) at creation time.
export const LIST_COLOR_PALETTE = [
  'blue', 'emerald', 'amber', 'rose', 'purple', 'teal', 'indigo', 'pink', 'cyan', 'orange',
] as const;

const LIST_COLOR_CLASSES: Record<string, { iconBg: string; accentText: string }> = {
  blue: { iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400', accentText: 'text-blue-700 dark:text-blue-400' },
  emerald: { iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400', accentText: 'text-emerald-700 dark:text-emerald-400' },
  amber: { iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400', accentText: 'text-amber-700 dark:text-amber-400' },
  rose: { iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400', accentText: 'text-rose-700 dark:text-rose-400' },
  purple: { iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400', accentText: 'text-purple-700 dark:text-purple-400' },
  teal: { iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400', accentText: 'text-teal-700 dark:text-teal-400' },
  indigo: { iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400', accentText: 'text-indigo-700 dark:text-indigo-400' },
  pink: { iconBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400', accentText: 'text-pink-700 dark:text-pink-400' },
  cyan: { iconBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400', accentText: 'text-cyan-700 dark:text-cyan-400' },
  orange: { iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400', accentText: 'text-orange-700 dark:text-orange-400' },
};

// Falls back to 'emerald' for lists saved before the color field existed.
export function getListColorClasses(color?: string): { iconBg: string; accentText: string } {
  return LIST_COLOR_CLASSES[color || ''] || LIST_COLOR_CLASSES.emerald;
}

export function getShoppingLists(): ShoppingListRecord[] {
  return readJson<ShoppingListRecord>(LISTS_KEY);
}

export function createShoppingList(title: string): ShoppingListRecord {
  const now = new Date().toISOString();
  const record: ShoppingListRecord = {
    id: genId('list'),
    title: title.trim() || 'Untitled List',
    notes: null,
    purchaseByDate: null,
    color: LIST_COLOR_PALETTE[Math.floor(Math.random() * LIST_COLOR_PALETTE.length)],
    createdAt: now,
    updatedAt: now,
  };
  const lists = getShoppingLists();
  lists.unshift(record);
  writeJson(LISTS_KEY, lists);
  return record;
}

export interface ShoppingListDetailsPatch {
  title?: string;
  notes?: string | null;
  purchaseByDate?: ADDate | null;
}

export function updateShoppingListDetails(id: string, patch: ShoppingListDetailsPatch): void {
  const lists = getShoppingLists();
  const idx = lists.findIndex((l) => l.id === id);
  if (idx === -1) return;
  const current = lists[idx];
  lists[idx] = {
    ...current,
    title: patch.title !== undefined ? patch.title.trim() || current.title : current.title,
    notes: patch.notes !== undefined ? patch.notes?.trim() || null : current.notes,
    purchaseByDate: patch.purchaseByDate !== undefined ? patch.purchaseByDate : current.purchaseByDate,
    updatedAt: new Date().toISOString(),
  };
  writeJson(LISTS_KEY, lists);
}

export function deleteShoppingList(id: string): void {
  writeJson(LISTS_KEY, getShoppingLists().filter((l) => l.id !== id));
  writeJson(ITEMS_KEY, getShoppingItems().filter((i) => i.listId !== id));
}

// ---- Items ----

export function getShoppingItems(): ShoppingItemRecord[] {
  return readJson<ShoppingItemRecord>(ITEMS_KEY);
}

export function getItemsForList(listId: string): ShoppingItemRecord[] {
  return getShoppingItems().filter((i) => i.listId === listId);
}

export interface NewShoppingItemInput {
  listId: string;
  name: string;
  quantity: number;
  unit?: string | null;
  price?: number | null;
}

export function addShoppingItem(input: NewShoppingItemInput): ShoppingItemRecord {
  const now = new Date().toISOString();
  const record: ShoppingItemRecord = {
    id: genId('item'),
    listId: input.listId,
    name: input.name.trim() || 'Untitled Item',
    // Small quantities like "0.5 kg" are valid, so the floor is just above
    // zero rather than 1 (a whole-number-only assumption from before units
    // existed).
    quantity: Math.max(0.01, input.quantity || 1),
    unit: input.unit?.trim() || null,
    price: input.price ?? null,
    isPurchased: false,
    createdAt: now,
    updatedAt: now,
  };
  const items = getShoppingItems();
  items.push(record);
  writeJson(ITEMS_KEY, items);
  touchList(input.listId);
  return record;
}

export function updateShoppingItem(id: string, patch: Partial<NewShoppingItemInput>): void {
  const items = getShoppingItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], ...patch, updatedAt: new Date().toISOString() };
  writeJson(ITEMS_KEY, items);
  touchList(items[idx].listId);
}

export function toggleItemPurchased(id: string): void {
  const items = getShoppingItems();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return;
  items[idx] = { ...items[idx], isPurchased: !items[idx].isPurchased, updatedAt: new Date().toISOString() };
  writeJson(ITEMS_KEY, items);
  touchList(items[idx].listId);
}

export function deleteShoppingItem(id: string): void {
  const items = getShoppingItems();
  const item = items.find((i) => i.id === id);
  writeJson(ITEMS_KEY, items.filter((i) => i.id !== id));
  if (item) touchList(item.listId);
}

export function clearPurchasedItems(listId: string): void {
  writeJson(ITEMS_KEY, getShoppingItems().filter((i) => i.listId !== listId || !i.isPurchased));
  touchList(listId);
}

// "Finish shopping" bulk action — marks every item in the list purchased
// in one go, the counterpart to clearPurchasedItems() clearing them out.
export function markAllItemsPurchased(listId: string): void {
  const now = new Date().toISOString();
  writeJson(
    ITEMS_KEY,
    getShoppingItems().map((i) => (i.listId === listId ? { ...i, isPurchased: true, updatedAt: now } : i))
  );
  touchList(listId);
}

// Signed day count to a list's purchaseByDate — negative means overdue.
// Plain epoch-day subtraction (UTC, no time-of-day/timezone drift), same
// technique used for reminders in calculations/reminderOccurrence.ts.
export function getDaysUntilPurchase(list: ShoppingListRecord, today: ADDate): number | null {
  if (!list.purchaseByDate) return null;
  const toEpochDay = (d: ADDate) => Date.UTC(d.year, d.month - 1, d.day) / 86400000;
  return toEpochDay(list.purchaseByDate) - toEpochDay(today);
}

// Shared by the Shopping List tool page and the Home summary card — kept
// here (not in either component) so both can import it without either
// one statically pulling in the other (the tool page is a lazy-loaded
// route chunk; importing from it would defeat that code-splitting).
export function formatPurchaseByStatus(days: number, isNe: boolean): { text: string; colorClass: string } {
  if (days < 0) {
    return {
      text: isNe ? `${toNepaliDigits(Math.abs(days))} दिन ढिलो भयो` : `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`,
      colorClass: 'text-red-600 dark:text-red-400',
    };
  }
  if (days === 0) return { text: isNe ? 'आज सम्म' : 'Due today', colorClass: 'text-amber-600 dark:text-amber-400' };
  if (days === 1) return { text: isNe ? 'भोलि सम्म' : 'Due tomorrow', colorClass: 'text-amber-600 dark:text-amber-400' };
  return {
    text: isNe ? `${toNepaliDigits(days)} दिनमा` : `Due in ${days} days`,
    colorClass: 'text-slate-500 dark:text-slate-400',
  };
}

// Estimated total: sum of entered prices only. Items with no price are
// excluded from the sum entirely (never treated as 0), and quantity is
// informational only — the entered price is read as the line's cost, not
// a per-unit price to multiply.
export function getEstimatedTotal(items: ShoppingItemRecord[]): number {
  return items.reduce((sum, item) => (item.price != null ? sum + item.price : sum), 0);
}

function touchList(listId: string): void {
  const lists = getShoppingLists();
  const idx = lists.findIndex((l) => l.id === listId);
  if (idx === -1) return;
  lists[idx] = { ...lists[idx], updatedAt: new Date().toISOString() };
  writeJson(LISTS_KEY, lists);
}
