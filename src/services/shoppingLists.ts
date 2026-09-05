import { ShoppingItemRecord, ShoppingListRecord } from '../types';

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
    createdAt: now,
    updatedAt: now,
  };
  const lists = getShoppingLists();
  lists.unshift(record);
  writeJson(LISTS_KEY, lists);
  return record;
}

export function renameShoppingList(id: string, title: string): void {
  const lists = getShoppingLists();
  const idx = lists.findIndex((l) => l.id === id);
  if (idx === -1) return;
  lists[idx] = { ...lists[idx], title: title.trim() || lists[idx].title, updatedAt: new Date().toISOString() };
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
  price?: number | null;
}

export function addShoppingItem(input: NewShoppingItemInput): ShoppingItemRecord {
  const now = new Date().toISOString();
  const record: ShoppingItemRecord = {
    id: genId('item'),
    listId: input.listId,
    name: input.name.trim() || 'Untitled Item',
    quantity: Math.max(1, input.quantity || 1),
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
