import React, { useState } from 'react';
import { Bell, ArrowRight, CheckCircle2, Trash2 } from 'lucide-react';
import { ToolId, Language, ReminderRecord } from '../types';
import { getTodayDate, toNepaliDigits } from '../calendar/bsCalendar';
import { getTranslation } from '../i18n/translations';
import {
  getReminders,
  getTodayReminders,
  getUpcomingReminders,
  getDaysUntil,
  toggleReminderCompleted,
  deleteReminder,
} from '../services/reminders';
import { SwipeableRow } from './SwipeableRow';

interface RemindersSummaryCardProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
}

function dayLabel(days: number, isNe: boolean): string {
  if (days === 0) return isNe ? 'आज' : 'Today';
  if (days === 1) return isNe ? 'भोलि' : 'Tomorrow';
  return isNe ? `${toNepaliDigits(days)} दिनमा` : `in ${days} days`;
}

const TODAY_ROW_CAP = 3;

export const RemindersSummaryCard: React.FC<RemindersSummaryCardProps> = ({ language, onSelectTool }) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';
  const today = getTodayDate().ad;

  const [reminders, setReminders] = useState<ReminderRecord[]>(() => getReminders());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = () => setReminders(getReminders());

  const todayItems = getTodayReminders(reminders, today);
  const upcomingItems = getUpcomingReminders(reminders, today);
  const nextUp = upcomingItems[0] ?? null;

  if (todayItems.length === 0 && !nextUp) return null;

  const handleComplete = (id: string) => {
    toggleReminderCompleted(id);
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteReminder(id);
    setConfirmDeleteId(null);
    refresh();
  };

  const renderRow = (reminder: ReminderRecord, days: number) => {
    if (confirmDeleteId === reminder.id) {
      return (
        <div
          key={reminder.id}
          className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900"
        >
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
            {isNe ? 'मेटाउने?' : 'Delete this?'}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => handleDelete(reminder.id)}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white"
            >
              {t.confirm}
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      );
    }

    const canComplete = reminder.repeat === 'none';

    return (
      <SwipeableRow
        key={reminder.id}
        revealOnDragRight={
          canComplete
            ? {
                icon: CheckCircle2,
                bgClassName: 'bg-emerald-500',
                ariaLabel: isNe ? 'सम्पन्न चिन्ह लगाउनुहोस्' : 'Mark complete',
                onTrigger: () => handleComplete(reminder.id),
              }
            : undefined
        }
        revealOnDragLeft={{
          icon: Trash2,
          bgClassName: 'bg-red-600',
          ariaLabel: isNe ? 'मेटाउनुहोस्' : 'Delete',
          onTrigger: () => setConfirmDeleteId(reminder.id),
        }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{reminder.title}</span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            {dayLabel(days, isNe)}
          </span>
        </div>
      </SwipeableRow>
    );
  };

  return (
    <div
      id="reminders-summary-card"
      className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 space-y-2.5"
    >
      <div
        onClick={() => onSelectTool('reminders')}
        className="flex items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {isNe ? 'रिमाइन्डरहरू' : 'Reminders'}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-blue-600 shrink-0" />
      </div>

      {todayItems.length > 0 && (
        <div className="space-y-1.5">
          {todayItems.slice(0, TODAY_ROW_CAP).map((r) => renderRow(r, 0))}
          {todayItems.length > TODAY_ROW_CAP && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
              {isNe ? `+${toNepaliDigits(todayItems.length - TODAY_ROW_CAP)} थप` : `+${todayItems.length - TODAY_ROW_CAP} more`}
            </div>
          )}
        </div>
      )}

      {nextUp && (
        <div className="space-y-1">
          {todayItems.length > 0 && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              {isNe ? 'आगामी' : 'Next up'}
            </div>
          )}
          {renderRow(nextUp, getDaysUntil(nextUp, today) ?? 0)}
        </div>
      )}
    </div>
  );
};
