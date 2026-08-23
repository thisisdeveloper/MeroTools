import React, { useState, useMemo } from 'react';
import { Language } from '../../types';
import {
  BS_MONTHS_EN,
  BS_MONTHS_NE,
  DAYS_SHORT_EN,
  DAYS_SHORT_NE,
  getDaysInBSMonth,
  bsToAd,
  toNepaliDigits,
  getTodayDate,
} from '../../calendar/bsCalendar';
import { NEPAL_HOLIDAYS_LIST, NepalHoliday } from '../../data/holidaysData';
import { Calendar, ChevronLeft, ChevronRight, Sparkles, Flag, Clock } from 'lucide-react';

interface NepaliCalendarProps {
  language: Language;
}

export const NepaliCalendar: React.FC<NepaliCalendarProps> = ({ language }) => {
  const isNe = language === 'ne';
  const today = useMemo(() => getTodayDate(), []);

  const [selectedYear, setSelectedYear] = useState<number>(today.bs.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(today.bs.month); // 1-12
  const [selectedDay, setSelectedDay] = useState<number | null>(today.bs.day);

  // Month navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      if (selectedYear > 2000) {
        setSelectedYear((y) => y - 1);
        setSelectedMonth(12);
        setSelectedDay(null);
      }
    } else {
      setSelectedMonth((m) => m - 1);
      setSelectedDay(null);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      if (selectedYear < 2095) {
        setSelectedYear((y) => y + 1);
        setSelectedMonth(1);
        setSelectedDay(null);
      }
    } else {
      setSelectedMonth((m) => m + 1);
      setSelectedDay(null);
    }
  };

  const handleGoToToday = () => {
    setSelectedYear(today.bs.year);
    setSelectedMonth(today.bs.month);
    setSelectedDay(today.bs.day);
  };

  // Compute first day of month weekday & total days
  const monthDetails = useMemo(() => {
    const totalDays = getDaysInBSMonth(selectedYear, selectedMonth);
    const firstDayResult = bsToAd({ year: selectedYear, month: selectedMonth, day: 1 });
    const startingDayOfWeek = firstDayResult.dayOfWeek; // 0 = Sunday

    // Days array
    const days = [];
    // Leading empty slots for calendar alignment
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days in current month
    for (let d = 1; d <= totalDays; d++) {
      const conv = bsToAd({ year: selectedYear, month: selectedMonth, day: d });
      // Check if this day is a holiday
      const bsStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const holiday = NEPAL_HOLIDAYS_LIST.find((h) => h.bsDate === bsStr);
      const isSaturday = conv.dayOfWeek === 6;

      days.push({
        bsDay: d,
        adDay: conv.ad.day,
        adMonth: conv.adMonthNameEn.substring(0, 3),
        dayOfWeek: conv.dayOfWeek,
        isSaturday,
        holiday,
        isToday:
          selectedYear === today.bs.year &&
          selectedMonth === today.bs.month &&
          d === today.bs.day,
      });
    }

    return {
      totalDays,
      startingDayOfWeek,
      days,
      adRange: `${bsToAd({ year: selectedYear, month: selectedMonth, day: 1 }).formattedAdEn.split(',')[0]} - ${
        bsToAd({ year: selectedYear, month: selectedMonth, day: totalDays }).formattedAdEn
      }`,
    };
  }, [selectedYear, selectedMonth, today]);

  // Holidays in this month
  const monthHolidays = useMemo(() => {
    return NEPAL_HOLIDAYS_LIST.filter(
      (h) => h.bsYear === selectedYear && h.bsMonth === selectedMonth
    );
  }, [selectedYear, selectedMonth]);

  // Selected Day Details
  const selectedDayInfo = useMemo(() => {
    if (!selectedDay) return null;
    const conv = bsToAd({ year: selectedYear, month: selectedMonth, day: selectedDay });
    const bsStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const holiday = NEPAL_HOLIDAYS_LIST.find((h) => h.bsDate === bsStr);

    return {
      conv,
      holiday,
    };
  }, [selectedYear, selectedMonth, selectedDay]);

  return (
    <div id="nepali-calendar-tool" className="space-y-6">
      {/* Month & Year Navigation Header */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Year & Month Picker */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <select
              id="calendar-year-select"
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSelectedDay(null);
              }}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base sm:text-lg px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {Array.from({ length: 40 }, (_, i) => 2060 + i).map((y) => (
                <option key={y} value={y}>
                  {isNe ? `${toNepaliDigits(y)} वि.सं.` : `${y} BS`}
                </option>
              ))}
            </select>

            <select
              id="calendar-month-select"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(Number(e.target.value));
                setSelectedDay(null);
              }}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-base sm:text-lg px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {BS_MONTHS_EN.map((mEn, idx) => (
                <option key={idx} value={idx + 1}>
                  {isNe ? BS_MONTHS_NE[idx] : mEn}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGoToToday}
            className="text-xs font-bold px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900 hover:bg-red-100 transition-colors"
          >
            {isNe ? 'आज' : 'Today'}
          </button>
        </div>

        {/* Gregorian range & Previous/Next Buttons */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {monthDetails.adRange}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              id="calendar-prev-month"
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors active:scale-95"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="calendar-next-month"
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors active:scale-95"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Day Header Row */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center">
          {(isNe ? DAYS_SHORT_NE : DAYS_SHORT_EN).map((dayName, idx) => {
            const isSat = idx === 6;
            return (
              <div
                key={idx}
                className={`py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider ${
                  isSat
                    ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20'
                    : 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                {dayName}
              </div>
            );
          })}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {monthDetails.days.map((item, index) => {
            if (!item) {
              return (
                <div
                  key={`empty-${index}`}
                  className="h-14 sm:h-20 rounded-2xl bg-slate-50/40 dark:bg-slate-800/20 opacity-30"
                />
              );
            }

            const isSelected = selectedDay === item.bsDay;
            const isRed = item.isSaturday || Boolean(item.holiday);

            return (
              <button
                key={`day-${item.bsDay}`}
                onClick={() => setSelectedDay(item.bsDay)}
                className={`h-14 sm:h-20 p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between items-start transition-all relative border ${
                  isSelected
                    ? 'ring-2 ring-red-500 border-red-400 dark:border-red-600 bg-red-50/70 dark:bg-red-950/30'
                    : item.isToday
                    ? 'border-blue-400 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                    : 'border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {/* Top row: BS Date and Holiday Indicator */}
                <div className="w-full flex items-center justify-between">
                  <span
                    className={`text-sm sm:text-lg font-black leading-none ${
                      isRed ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-white'
                    }`}
                  >
                    {isNe ? toNepaliDigits(item.bsDay) : item.bsDay}
                  </span>

                  {item.isToday && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Today" />
                  )}
                </div>

                {/* Bottom row: AD Date & Festival dot */}
                <div className="w-full flex items-end justify-between mt-auto">
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 leading-none">
                    {item.adDay}
                  </span>

                  {item.holiday && (
                    <span
                      className="text-[9px] sm:text-[10px] font-bold text-red-600 dark:text-red-400 truncate max-w-[45px] sm:max-w-[70px] leading-none"
                      title={item.holiday.nameNe}
                    >
                      {item.holiday.nameNe.split(' ')[0]}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Info Banner */}
      {selectedDayInfo && (
        <div
          id="calendar-selected-day-card"
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-lg space-y-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-red-100">
                {isNe ? 'छानिएको मिति विवरण' : 'Selected Date Details'}
              </span>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {isNe ? selectedDayInfo.conv.formattedBsNe : selectedDayInfo.conv.formattedBsEn}
                <span className="text-sm font-medium text-red-100 ml-2">
                  ({isNe ? selectedDayInfo.conv.dayNameNe : selectedDayInfo.conv.dayNameEn})
                </span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-blue-100 mt-0.5">
                AD: {selectedDayInfo.conv.formattedAdEn}
              </div>
            </div>

            {selectedDayInfo.holiday && (
              <div className="self-start sm:self-center px-3.5 py-1.5 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/25 text-white">
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isNe ? selectedDayInfo.holiday.nameNe : selectedDayInfo.holiday.nameEn}</span>
                </div>
                <div className="text-[11px] text-red-100">
                  {isNe ? selectedDayInfo.holiday.categoryLabelNe : selectedDayInfo.holiday.categoryLabelEn}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Month Public Holidays List */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white font-extrabold text-sm sm:text-base">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span>
              {isNe
                ? `${BS_MONTHS_NE[selectedMonth - 1]} महिनाका पर्व तथा बिदाहरू`
                : `Holidays in ${BS_MONTHS_EN[selectedMonth - 1]}`}
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {monthHolidays.length} {isNe ? 'पर्वहरू' : 'Events'}
          </span>
        </div>

        {monthHolidays.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {monthHolidays.map((holiday) => (
              <div
                key={holiday.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex flex-col items-center justify-center font-bold flex-shrink-0">
                  <span className="text-xs leading-none">
                    {isNe ? toNepaliDigits(holiday.bsDay) : holiday.bsDay}
                  </span>
                  <span className="text-[9px] font-medium leading-none mt-0.5">
                    {isNe ? BS_MONTHS_NE[holiday.bsMonth - 1] : BS_MONTHS_EN[holiday.bsMonth - 1].substring(0, 3)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                    {isNe ? holiday.nameNe : holiday.nameEn}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{holiday.dayOfWeekNe}</span>
                    <span>•</span>
                    <span>{holiday.adDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
            {isNe ? 'यस महिनामा कुनै मुख्य सार्वजनिक बिदा दर्ता गरिएको छैन।' : 'No major registered public holidays for this month.'}
          </div>
        )}
      </div>
    </div>
  );
};
