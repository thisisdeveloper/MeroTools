import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNepaliCurrency } from '../services/forex';
import { buildMetalsData, RateHistoryDay } from '../services/metals';
import { toNepaliDigits } from '../calendar/bsCalendar';

interface GoldRateCalendarProps {
  historyDays: RateHistoryDay[];
  language: 'en' | 'ne';
}

const DAYS_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_SHORT_NE = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_NE = [
  'जनवरी', 'फेब्रुअरी', 'मार्च', 'अप्रिल', 'मे', 'जुन',
  'जुलाई', 'अगस्ट', 'सेप्टेम्बर', 'अक्टोबर', 'नोभेम्बर', 'डिसेम्बर',
];

function ymKey(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}`;
}

export const GoldRateCalendar: React.FC<GoldRateCalendarProps> = ({ historyDays, language }) => {
  const isNe = language === 'ne';

  const byDate = useMemo(() => {
    const map = new Map<string, RateHistoryDay>();
    historyDays.forEach((d) => map.set(d.date, d));
    return map;
  }, [historyDays]);

  const sortedDates = useMemo(() => historyDays.map((d) => d.date).sort(), [historyDays]);
  const earliest = sortedDates[0];
  const latest = sortedDates[sortedDates.length - 1];

  const initial = latest ? new Date(`${latest}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string | null>(latest ?? null);

  const canGoPrev = !earliest || ymKey(viewYear, viewMonth) > earliest.slice(0, 7);
  const canGoNext = !latest || ymKey(viewYear, viewMonth) < latest.slice(0, 7);

  const handlePrevMonth = () => {
    if (!canGoPrev) return;
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const handleNextMonth = () => {
    if (!canGoNext) return;
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const cells = useMemo(() => {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sun
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const todayStr = new Date().toISOString().slice(0, 10);

    const result: ({ dateStr: string; day: number; hasData: boolean; isToday: boolean } | null)[] = [];
    for (let i = 0; i < startWeekday; i++) result.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      result.push({ dateStr, day, hasData: byDate.has(dateStr), isToday: dateStr === todayStr });
    }
    return result;
  }, [viewYear, viewMonth, byDate]);

  const selectedInfo = useMemo(() => {
    if (!selectedDate) return null;
    const day = byDate.get(selectedDate);
    if (!day) return null;
    const data = buildMetalsData(day.data);
    return data ? { date: selectedDate, data } : null;
  }, [selectedDate, byDate]);

  if (historyDays.length === 0) {
    return (
      <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isNe
            ? 'क्यालेन्डरको लागि अहिलेसम्म कुनै ऐतिहासिक दर छैन।'
            : 'No historical rates recorded yet for the calendar.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-black text-slate-800 dark:text-slate-100">
          {isNe ? MONTHS_NE[viewMonth] : MONTHS_EN[viewMonth]}{' '}
          {isNe ? toNepaliDigits(viewYear) : viewYear}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            disabled={!canGoPrev}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            disabled={!canGoNext}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3 sm:p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-1.5 text-center">
          {(isNe ? DAYS_SHORT_NE : DAYS_SHORT_EN).map((d, idx) => (
            <div key={idx} className="py-1.5 text-[10px] sm:text-xs font-black uppercase text-slate-500 dark:text-slate-400">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {cells.map((cell, idx) => {
            if (!cell) return <div key={`empty-${idx}`} className="h-12 sm:h-14" />;
            const isSelected = selectedDate === cell.dateStr;
            return (
              <button
                key={cell.dateStr}
                onClick={() => cell.hasData && setSelectedDate(cell.dateStr)}
                disabled={!cell.hasData}
                className={`h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 border transition-all ${
                  isSelected
                    ? 'ring-2 ring-red-500 border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/30'
                    : cell.isToday
                      ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                      : cell.hasData
                        ? 'border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                        : 'border-transparent opacity-30 cursor-default'
                }`}
              >
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                  {isNe ? toNepaliDigits(cell.day) : cell.day}
                </span>
                {cell.hasData && <span className="w-1 h-1 rounded-full bg-amber-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {selectedInfo && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-lg space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-red-100">{selectedInfo.date}</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[10px] text-blue-100">{isNe ? 'सुन (२४K)' : 'Gold (24K)'}</div>
              <div className="text-sm sm:text-base font-black">{formatNepaliCurrency(selectedInfo.data.rates.fineGold.tolaPrice)}</div>
            </div>
            <div>
              <div className="text-[10px] text-blue-100">{isNe ? 'सुन (२२K)' : 'Gold (22K)'}</div>
              <div className="text-sm sm:text-base font-black">{formatNepaliCurrency(selectedInfo.data.rates.tejabiGold.tolaPrice)}</div>
            </div>
            <div>
              <div className="text-[10px] text-blue-100">{isNe ? 'चाँदी' : 'Silver'}</div>
              <div className="text-sm sm:text-base font-black">{formatNepaliCurrency(selectedInfo.data.rates.silver.tolaPrice)}</div>
            </div>
          </div>
          <div className="text-[10px] text-blue-100 text-center">{isNe ? 'प्रति तोला दर' : 'Rates per tola'}</div>
        </div>
      )}
    </div>
  );
};
