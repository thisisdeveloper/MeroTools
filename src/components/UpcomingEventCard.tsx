import React from 'react';
import { PartyPopper, ArrowRight } from 'lucide-react';
import { ToolId, Language } from '../types';
import { getTodayDate, toNepaliDigits } from '../calendar/bsCalendar';
import { NEPAL_HOLIDAYS_LIST } from '../data/holidaysData';
import { getNextUpcomingHoliday } from '../calculations/upcomingHoliday';

interface UpcomingEventCardProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
}

export const UpcomingEventCard: React.FC<UpcomingEventCardProps> = ({
  language,
  onSelectTool,
}) => {
  const isNe = language === 'ne';
  const today = getTodayDate();
  const upcoming = getNextUpcomingHoliday(NEPAL_HOLIDAYS_LIST, today);

  if (!upcoming) return null;

  const { holiday, daysUntil } = upcoming;
  const isToday = daysUntil === 0;

  return (
    <div
      id="upcoming-event-card"
      onClick={() => onSelectTool('public-holidays')}
      className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200/60 dark:border-red-900/40 cursor-pointer hover:bg-red-100/40 dark:hover:bg-red-900/30 transition-colors flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 flex items-center justify-center text-lg shrink-0">
          <PartyPopper className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
            {isNe ? holiday.nameNe : holiday.nameEn}
          </div>
          <div className="text-sm font-extrabold text-red-700 dark:text-red-400">
            {isToday
              ? isNe
                ? 'आज हो!'
                : "It's today!"
              : isNe
                ? `${toNepaliDigits(daysUntil)} दिनमा`
                : `${daysUntil} day${daysUntil === 1 ? '' : 's'} remaining`}
          </div>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-red-600 shrink-0" />
    </div>
  );
};
