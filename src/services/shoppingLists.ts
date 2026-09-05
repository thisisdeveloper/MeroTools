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
