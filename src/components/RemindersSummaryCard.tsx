import React from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { ToolId, Language } from '../types';
import { getTodayDate, toNepaliDigits } from '../calendar/bsCalendar';
import { getReminders, getTodayReminders, getUpcomingReminders, getDaysUntil } from '../services/reminders';

interface RemindersSummaryCardProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
}

export const RemindersSummaryCard: React.FC<RemindersSummaryCardProps> = ({ language, onSelectTool }) => {
  const isNe = language === 'ne';
  const today = getTodayDate().ad;
  const reminders = getReminders();
  const todayItems = getTodayReminders(reminders, today);
  const upcomingItems = getUpcomingReminders(reminders, today);

  if (todayItems.length === 0 && upcomingItems.length === 0) return null;

  return (
    <div
      id="reminders-summary-card"
      onClick={() => onSelectTool('reminders')}
      className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 cursor-pointer hover:bg-blue-100/40 dark:hover:bg-blue-900/30 transition-colors"
    >
      <div className="flex items-center justify-between gap-3 mb-2">
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

      {todayItems.length > 0 ? (
        <div className="space-y-1">
          {todayItems.slice(0, 3).map((r) => (
            <div key={r.id} className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              • {r.title}
            </div>
          ))}
          {todayItems.length > 3 && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {isNe ? `+${toNepaliDigits(todayItems.length - 3)} थप` : `+${todayItems.length - 3} more`}
            </div>
          )}
        </div>
      ) : (
        upcomingItems[0] &&
        (() => {
          const days = getDaysUntil(upcomingItems[0], today) ?? 0;
          return (
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {upcomingItems[0].title} —{' '}
              {isNe ? `${toNepaliDigits(days)} दिनमा` : `in ${days} day${days === 1 ? '' : 's'}`}
            </div>
          );
        })()
      )}
    </div>
  );
};
