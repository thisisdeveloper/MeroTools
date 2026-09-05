import React, { useMemo, useState } from 'react';
import { ChevronLeft, ListChecks, Plus, Trash2, X, CheckCircle2 } from 'lucide-react';
import { Language, ShoppingListRecord } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { formatNepaliCurrency } from '../../services/forex';
import {
  getShoppingLists,
  createShoppingList,
  renameShoppingList,
  deleteShoppingList,
  getItemsForList,
  addShoppingItem,
  updateShoppingItem,
  toggleItemPurchased,
  deleteShoppingItem,
  clearPurchasedItems,
  getEstimatedTotal,
} from '../../services/shoppingLists';
import { getItemSuggestions, rememberItemUnit, findExactItemMatch } from '../../services/itemSuggestions';

interface ShoppingListsProps {
  language: Language;
}

const COMMON_UNITS: { value: string; labelEn: string; labelNe: string }[] = [
  { value: '', labelEn: 'No unit', labelNe: 'एकाइ छैन' },
  { value: 'kg', labelEn: 'kg', labelNe: 'के.जी.' },
  { value: 'g', labelEn: 'g', labelNe: 'ग्राम' },
  { value: 'L', labelEn: 'L', labelNe: 'लिटर' },
  { value: 'mL', labelEn: 'mL', labelNe: 'मि.लि.' },
  { value: 'pcs', labelEn: 'pcs', labelNe: 'थान' },
  { value: 'dozen', labelEn: 'dozen', labelNe: 'दर्जन' },
  { value: 'pack', labelEn: 'pack', labelNe: 'प्याक' },
  { value: 'box', labelEn: 'box', labelNe: 'बाकस' },
  { value: 'other', labelEn: 'Other…', labelNe: 'अन्य…' },
];

export const ShoppingLists: React.FC<ShoppingListsProps> = ({ language }) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';

  const [lists, setLists] = useState<ShoppingListRecord[]>(() => getShoppingLists());
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [confirmDeleteListId, setConfirmDeleteListId] = useState<string | null>(null);

  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editListTitle, setEditListTitle] = useState('');

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemQty, setItemQty] = useState('1');
  const [itemUnit, setItemUnit] = useState('');
  const [itemCustomUnit, setItemCustomUnit] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [nameSuggestions, setNameSuggestions] = useState<{ name: string; unit: string | null }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [confirmDeleteItemId, setConfirmDeleteItemId] = useState<string | null>(null);

  const activeList = lists.find((l) => l.id === activeListId) || null;
  const items = useMemo(() => (activeListId ? getItemsForList(activeListId) : []), [activeListId, lists]);
  const estimatedTotal = useMemo(() => getEstimatedTotal(items), [items]);
  const hasPurchased = items.some((i) => i.isPurchased);

  const refreshLists = () => setLists(getShoppingLists());

  const handleCreateList = () => {
    if (!newListTitle.trim()) return;
    const record = createShoppingList(newListTitle);
    refreshLists();
    setNewListTitle('');
    setShowNewListModal(false);
    setActiveListId(record.id);
  };

  const handleRenameList = () => {
    if (!activeList || !editListTitle.trim()) return;
    renameShoppingList(activeList.id, editListTitle);
    refreshLists();
    setShowEditListModal(false);
  };

  const handleDeleteList = (id: string) => {
    deleteShoppingList(id);
    refreshLists();
    setConfirmDeleteListId(null);
    if (activeListId === id) setActiveListId(null);
  };

  // Splits a stored unit string into the (select value, custom text) pair
  // the form needs — 'kg' -> ('kg', ''), 'bunch' -> ('other', 'bunch').
  const applyUnitToForm = (unit: string | null) => {
    if (!unit) {
      setItemUnit('');
      setItemCustomUnit('');
    } else if (COMMON_UNITS.some((u) => u.value === unit)) {
      setItemUnit(unit);
      setItemCustomUnit('');
    } else {
      setItemUnit('other');
      setItemCustomUnit(unit);
    }
  };

  const openAddItem = () => {
    setEditingItemId(null);
    setItemName('');
    setItemQty('1');
    applyUnitToForm(null);
    setItemPrice('');
    setNameSuggestions([]);
    setShowSuggestions(false);
    setShowItemModal(true);
  };

  const openEditItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    setEditingItemId(id);
    setItemName(item.name);
    setItemQty(String(item.quantity));
    applyUnitToForm(item.unit);
    setItemPrice(item.price != null ? String(item.price) : '');
    setNameSuggestions([]);
    setShowSuggestions(false);
    setShowItemModal(true);
  };

  const handleItemNameChange = (value: string) => {
    setItemName(value);
    setNameSuggestions(getItemSuggestions(value));
    setShowSuggestions(value.trim().length > 0);
    // Only auto-fill for a brand-new item — editing shouldn't clobber a
    // unit the user already set just because the name happens to match.
    if (!editingItemId) {
      const match = findExactItemMatch(value);
      if (match) applyUnitToForm(match.unit);
    }
  };

  const handleSelectSuggestion = (suggestion: { name: string; unit: string | null }) => {
    setItemName(suggestion.name);
    applyUnitToForm(suggestion.unit);
    setShowSuggestions(false);
  };

  const handleSaveItem = () => {
    if (!activeListId || !itemName.trim()) return;
    const finalUnit = itemUnit === 'other' ? itemCustomUnit.trim() || null : itemUnit || null;
    const patch = {
      name: itemName,
      quantity: Number(itemQty) || 1,
      unit: finalUnit,
      price: itemPrice.trim() === '' ? null : Number(itemPrice),
    };
    if (editingItemId) {
      updateShoppingItem(editingItemId, patch);
    } else {
      addShoppingItem({ listId: activeListId, ...patch });
    }
    rememberItemUnit(itemName, finalUnit);
    setLists([...getShoppingLists()]);
    setShowItemModal(false);
  };

  const handleToggleItem = (id: string) => {
    toggleItemPurchased(id);
    setLists([...getShoppingLists()]);
  };

  const handleDeleteItem = (id: string) => {
    deleteShoppingItem(id);
    setLists([...getShoppingLists()]);
    setConfirmDeleteItemId(null);
  };

  const handleClearPurchased = () => {
    if (!activeListId) return;
    clearPurchasedItems(activeListId);
    setLists([...getShoppingLists()]);
  };

  // ---- List-of-lists view ----
  if (!activeList) {
    return (
      <div id="shopping-lists-tool" className="space-y-5">
        <div className="px-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {isNe ? 'किनमेल सूची' : 'Shopping Lists'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isNe ? 'तपाईंका सबै किनमेल सूचीहरू' : 'All your shopping lists'}
          </p>
        </div>

        {lists.length === 0 ? (
          <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-2">
            <ListChecks className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isNe ? 'तपाईंको किनमेल सूची खाली छ।' : 'Your shopping list is empty.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lists.map((list) => {
              const listItems = getItemsForList(list.id);
              const remaining = listItems.filter((i) => !i.isPurchased).length;
              return (
                <div
                  key={list.id}
                  id={`shopping-list-item-${list.id}`}
                  className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3"
                >
                  <button onClick={() => setActiveListId(list.id)} className="flex-1 min-w-0 text-left">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{list.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isNe
                        ? `${listItems.length} वस्तु · ${remaining} बाँकी`
                        : `${listItems.length} item${listItems.length === 1 ? '' : 's'} · ${remaining} remaining`}
                    </p>
                  </button>
                  {confirmDeleteListId === list.id ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleDeleteList(list.id)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white"
                      >
                        {t.confirm}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteListId(null)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteListId(list.id)}
                      className="shrink-0 p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <button
          id="shopping-list-fab"
          onClick={() => setShowNewListModal(true)}
          className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl flex items-center justify-center transition-all active:scale-95"
          aria-label={isNe ? 'नयाँ सूची' : 'New list'}
        >
          <Plus className="w-6 h-6" />
        </button>

        {showNewListModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-[2rem] sm:rounded-[2rem] max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {isNe ? 'नयाँ सूची' : 'New List'}
                </h3>
                <button onClick={() => setShowNewListModal(false)} className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                id="new-list-title-input"
                type="text"
                autoFocus
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder={isNe ? 'जस्तै: घर किराना' : 'e.g. Home Grocery'}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewListModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={handleCreateList}
                  disabled={!newListTitle.trim()}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---- Single list items view ----
  return (
    <div id="shopping-list-detail" className="space-y-5">
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={() => setActiveListId(null)}
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-slate-800 dark:text-white tracking-tight truncate">{activeList.title}</h2>
        </div>
        <button
          onClick={() => {
            setEditListTitle(activeList.title);
            setShowEditListModal(true);
          }}
          className="text-xs font-bold text-red-600 dark:text-red-400 shrink-0"
        >
          {t.edit}
        </button>
      </div>

      {items.length > 0 && (
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isNe ? 'अनुमानित जम्मा' : 'Estimated Total'}
          </span>
          <span className="text-base font-black text-slate-800 dark:text-slate-100">
            {formatNepaliCurrency(estimatedTotal)}
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-2">
          <ListChecks className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isNe ? 'तपाईंको किनमेल सूची खाली छ।' : 'Your shopping list is empty.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              id={`shopping-item-${item.id}`}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3"
            >
              <button onClick={() => handleToggleItem(item.id)} aria-label={isNe ? 'खरिद चिन्ह लगाउनुहोस्' : 'Mark purchased'}>
                <CheckCircle2
                  className={`w-5 h-5 ${
                    item.isPurchased ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              </button>
              <button onClick={() => openEditItem(item.id)} className="flex-1 min-w-0 text-left">
                <p
                  className={`font-bold text-sm text-slate-800 dark:text-slate-100 truncate ${
                    item.isPurchased ? 'line-through text-slate-400 dark:text-slate-500' : ''
                  }`}
                >
                  {item.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isNe
                    ? `परिमाण: ${item.quantity}${item.unit ? ' ' + item.unit : ''}`
                    : `Qty: ${item.quantity}${item.unit ? ' ' + item.unit : ''}`}
                  {item.price != null && ` · ${formatNepaliCurrency(item.price)}`}
                </p>
              </button>
              {confirmDeleteItemId === item.id ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white"
                  >
                    {t.confirm}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteItemId(null)}
                    className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {t.cancel}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteItemId(item.id)}
                  className="shrink-0 p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {hasPurchased && (
        <button
          onClick={handleClearPurchased}
          className="w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {isNe ? 'खरिद गरिएका हटाउनुहोस्' : 'Clear purchased items'}
        </button>
      )}

      <button
        id="shopping-item-fab"
        onClick={openAddItem}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl flex items-center justify-center transition-all active:scale-95"
        aria-label={isNe ? 'वस्तु थप्नुहोस्' : 'Add item'}
      >
        <Plus className="w-6 h-6" />
      </button>

      {showEditListModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-[2rem] sm:rounded-[2rem] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {isNe ? 'सूची सम्पादन गर्नुहोस्' : 'Edit List'}
              </h3>
              <button onClick={() => setShowEditListModal(false)} className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              autoFocus
              value={editListTitle}
              onChange={(e) => setEditListTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEditListModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleRenameList}
                disabled={!editListTitle.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-[2rem] sm:rounded-[2rem] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {editingItemId ? (isNe ? 'वस्तु सम्पादन गर्नुहोस्' : 'Edit Item') : (isNe ? 'वस्तु थप्नुहोस्' : 'Add Item')}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'वस्तुको नाम' : 'Item name'}
              </label>
              <input
                id="item-name-input"
                type="text"
                autoFocus
                autoComplete="off"
                value={itemName}
                onChange={(e) => handleItemNameChange(e.target.value)}
                onFocus={() => setShowSuggestions(nameSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                placeholder={isNe ? 'जस्तै: दूध' : 'e.g. Milk'}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              {showSuggestions && nameSuggestions.length > 0 && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                  {nameSuggestions.map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      onMouseDown={() => handleSelectSuggestion(s)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {s.name}
                      </span>
                      {s.unit && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
                          {s.unit}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isNe ? 'परिमाण' : 'Quantity'}
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isNe ? 'एकाइ' : 'Unit'}
                </label>
                <select
                  value={itemUnit}
                  onChange={(e) => setItemUnit(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {isNe ? u.labelNe : u.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {itemUnit === 'other' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isNe ? 'एकाइ (आफैं लेख्नुहोस्)' : 'Custom unit'}
                </label>
                <input
                  type="text"
                  value={itemCustomUnit}
                  onChange={(e) => setItemCustomUnit(e.target.value)}
                  placeholder={isNe ? 'जस्तै: मुठा' : 'e.g. bunch'}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.amount} ({isNe ? 'ऐच्छिक' : 'optional'})
              </label>
              <input
                type="number"
                min="0"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowItemModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                id="item-save-btn"
                onClick={handleSaveItem}
                disabled={!itemName.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
