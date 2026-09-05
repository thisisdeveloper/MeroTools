import React from 'react';
import { ListChecks, ArrowRight } from 'lucide-react';
import { ToolId, Language } from '../types';
import { toNepaliDigits } from '../calendar/bsCalendar';
import { getShoppingLists, getItemsForList } from '../services/shoppingLists';

interface ShoppingListSummaryCardProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
}

export const ShoppingListSummaryCard: React.FC<ShoppingListSummaryCardProps> = ({ language, onSelectTool }) => {
  const isNe = language === 'ne';
  const lists = getShoppingLists();

  const listsWithRemaining = lists
    .map((list) => ({ list, remaining: getItemsForList(list.id).filter((i) => !i.isPurchased).length }))
    .filter((x) => x.remaining > 0);

  if (listsWithRemaining.length === 0) return null;

  const visible = listsWithRemaining.slice(0, 3);
  const extra = listsWithRemaining.length - visible.length;

  return (
    <div
      id="shopping-list-summary-card"
      onClick={() => onSelectTool('shopping-list')}
      className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 cursor-pointer hover:bg-emerald-100/40 dark:hover:bg-emerald-900/30 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
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

      <div className="space-y-1">
        {visible.map(({ list, remaining }) => (
          <div key={list.id} className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {list.title} —{' '}
            {isNe ? `${toNepaliDigits(remaining)} वस्तु बाँकी` : `${remaining} item${remaining === 1 ? '' : 's'} remaining`}
          </div>
        ))}
        {extra > 0 && (
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {isNe ? `+${toNepaliDigits(extra)} थप सूची` : `+${extra} more list${extra === 1 ? '' : 's'}`}
          </div>
        )}
      </div>
    </div>
  );
};
