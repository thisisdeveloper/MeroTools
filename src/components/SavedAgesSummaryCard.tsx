import React, { useMemo } from 'react';
import { Cake, ArrowRight } from 'lucide-react';
import { ToolId, Language } from '../types';
import { toNepaliDigits } from '../calendar/bsCalendar';
import { getSavedAges } from '../services/savedAges';
import { getDaysUntilNextBirthday } from '../calculations/age';

interface SavedAgesSummaryCardProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
}

const UPCOMING_WINDOW_DAYS = 30;
const ROW_CAP = 3;

function dayLabel(days: number, isNe: boolean): string {
  if (days === 0) return isNe ? 'आज' : 'Today';
  if (days === 1) return isNe ? 'भोलि' : 'Tomorrow';
  return isNe ? `${toNepaliDigits(days)} दिनमा` : `In ${days} days`;
}

export const SavedAgesSummaryCard: React.FC<SavedAgesSummaryCardProps> = ({ language, onSelectTool }) => {
  const isNe = language === 'ne';
  const ages = useMemo(() => getSavedAges(), []);

  // Only shown once the user has saved at least one person — this is an
  // opt-in feature, not a core to-do list like Reminders/Shopping, so an
  // always-visible-with-empty-state card here would just be clutter for
  // everyone who hasn't used Age Calculator's Save option.
  if (ages.length === 0) return null;

  const upcoming = ages
    .map((age) => ({ age, daysUntil: getDaysUntilNextBirthday(age.dobAd) }))
    .filter((x) => x.daysUntil <= UPCOMING_WINDOW_DAYS)
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const visible = upcoming.slice(0, ROW_CAP);
  const extra = upcoming.length - visible.length;

  return (
    <div
      id="saved-ages-summary-card"
      className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 dark:from-amber-950/20 dark:to-rose-950/20 border border-rose-200/50 dark:border-rose-900/30 space-y-2.5"
    >
      <div
        onClick={() => onSelectTool('saved-ages')}
        className="flex items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-white/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Cake className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {isNe ? 'जन्मदिनहरू' : 'Birthdays'}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-rose-500 shrink-0" />
      </div>

      {upcoming.length === 0 ? (
        <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
          {isNe
            ? 'आगामी दिनहरूमा कुनै सुरक्षित जन्मदिन छैन।'
            : 'No saved birthdays coming up soon.'}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(({ age, daysUntil }) => (
            <div
              key={age.id}
              className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-white/70 dark:bg-white/5 border border-white/60 dark:border-white/10"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-white/10 text-rose-500 dark:text-rose-400">
                <Cake className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {age.name}
                </div>
                <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400 truncate">
                  {dayLabel(daysUntil, isNe)}
                </div>
              </div>
            </div>
          ))}
          {extra > 0 && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
              {isNe ? `+${toNepaliDigits(extra)} थप` : `+${extra} more`}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
