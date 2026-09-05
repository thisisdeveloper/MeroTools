import React, { useState } from 'react';
import { Bell, ArrowRight, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
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
import { TYPE_META } from '../data/reminderTypeMeta';
import { formatTime12h } from '../calculations/reminderOccurrence';
import { SwipeableRow } from './SwipeableRow';

interface RemindersSummaryCardProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
}

function dayLabel(days: number, isNe: boolean): string {
  if (days === 0) return isNe ? 'आज' : 'Today';
  if (days === 1) return isNe ? 'भोलि' : 'Tomorrow';
  return isNe ? `${toNepaliDigits(days)} दिनमा` : `In ${days} days`;
}

const TODAY_ROW_CAP = 3;
const UPCOMING_ROW_CAP = 3;

export const RemindersSummaryCard: React.FC<RemindersSummaryCardProps> = ({ language, onSelectTool }) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';
  const today = getTodayDate().ad;

  const [reminders, setReminders] = useState<ReminderRecord[]>(() => getReminders());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const refresh = () => setReminders(getReminders());

  const todayItems = getTodayReminders(reminders, today);
  const upcomingItems = getUpcomingReminders(reminders, today);
  const isEmpty = todayItems.length === 0 && upcomingItems.length === 0;

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
    const meta = TYPE_META[reminder.type as keyof typeof TYPE_META] || TYPE_META.task;
    const Icon = meta.icon;

    if (confirmDeleteId === reminder.id) {
      return (
        <div
          key={reminder.id}
          className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white dark:bg-slate-900"
        >
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate flex-1">
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
        <div className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white dark:bg-slate-900">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
              {reminder.title}
            </div>
            {reminder.notes && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {reminder.notes}
              </div>
            )}
            <div className={`text-sm font-extrabold truncate ${meta.accentText}`}>
              {dayLabel(days, isNe)}
              {reminder.time && (
                <span className="font-semibold"> · {formatTime12h(reminder.time, isNe)}</span>
              )}
            </div>
          </div>
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

      {isEmpty && (
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
          {isNe ? 'आज वा आउँदा दिनहरूमा कुनै रिमाइन्डर छैन।' : 'No reminders for today or the days ahead.'}
        </div>
      )}

      {todayItems.length > 0 && (
        <div className="space-y-2">
          {todayItems.slice(0, TODAY_ROW_CAP).map((r) => renderRow(r, 0))}
          {todayItems.length > TODAY_ROW_CAP && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
              {isNe ? `+${toNepaliDigits(todayItems.length - TODAY_ROW_CAP)} थप` : `+${todayItems.length - TODAY_ROW_CAP} more`}
            </div>
          )}
        </div>
      )}

      {upcomingItems.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            {isNe ? 'आगामी' : 'Upcoming'}
          </div>
          {upcomingItems.slice(0, UPCOMING_ROW_CAP).map((r) => renderRow(r, getDaysUntil(r, today) ?? 0))}
          {upcomingItems.length > UPCOMING_ROW_CAP && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
              {isNe
                ? `+${toNepaliDigits(upcomingItems.length - UPCOMING_ROW_CAP)} थप`
                : `+${upcomingItems.length - UPCOMING_ROW_CAP} more`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
