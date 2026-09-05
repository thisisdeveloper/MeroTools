import React from 'react';
import { ListChecks, ArrowRight } from 'lucide-react';
import { ToolId, Language } from '../types';
import { getTodayDate, toNepaliDigits } from '../calendar/bsCalendar';
import { formatNepaliCurrency } from '../services/forex';
import {
  getShoppingLists,
  getItemsForList,
  getEstimatedTotal,
  getDaysUntilPurchase,
  formatPurchaseByStatus,
} from '../services/shoppingLists';

interface ShoppingListSummaryCardProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
}

const LIST_ROW_CAP = 3;

export const ShoppingListSummaryCard: React.FC<ShoppingListSummaryCardProps> = ({ language, onSelectTool }) => {
  const isNe = language === 'ne';
  const today = getTodayDate().ad;
  const lists = getShoppingLists();

  const listsWithDetails = lists
    .map((list) => {
      const items = getItemsForList(list.id);
      return {
        list,
        remaining: items.filter((i) => !i.isPurchased).length,
        total: getEstimatedTotal(items),
        purchaseDays: getDaysUntilPurchase(list, today),
      };
    })
    .filter((x) => x.remaining > 0);

  if (listsWithDetails.length === 0) return null;

  const visible = listsWithDetails.slice(0, LIST_ROW_CAP);
  const extra = listsWithDetails.length - visible.length;

  return (
    <div
      id="shopping-list-summary-card"
      onClick={() => onSelectTool('shopping-list')}
      className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 cursor-pointer hover:bg-emerald-100/40 dark:hover:bg-emerald-900/30 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <ListChecks className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {isNe ? 'किनमेल सूची' : 'Shopping List'}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
      </div>

      <div className="space-y-2">
        {visible.map(({ list, remaining, total, purchaseDays }) => (
          <div key={list.id} className="p-3 rounded-xl bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{list.title}</span>
              {total > 0 && (
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 shrink-0">
                  {formatNepaliCurrency(total)}
                </span>
              )}
            </div>
            {list.notes && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{list.notes}</div>
            )}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {isNe ? `${toNepaliDigits(remaining)} वस्तु बाँकी` : `${remaining} item${remaining === 1 ? '' : 's'} remaining`}
              </span>
              {purchaseDays !== null && (
                <span className={`text-[11px] font-bold ${formatPurchaseByStatus(purchaseDays, isNe).colorClass}`}>
                  {formatPurchaseByStatus(purchaseDays, isNe).text}
                </span>
              )}
            </div>
          </div>
        ))}
        {extra > 0 && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
            {isNe ? `+${toNepaliDigits(extra)} थप सूची` : `+${extra} more list${extra === 1 ? '' : 's'}`}
          </div>
        )}
      </div>
    </div>
  );
};
