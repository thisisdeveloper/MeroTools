import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ArrowUpDown,
  Clock,
  CalendarRange,
  RotateCcw,
} from 'lucide-react';
import {
  getTodayDate,
  BS_MONTHS_EN,
  BS_MONTHS_NE,
  AD_MONTHS_EN,
  AD_MONTHS_NE,
  getDaysInBSMonth,
  toNepaliDigits,
} from '../../calendar/bsCalendar';
import {
  calculateDateDiffBs,
  calculateDateDiffAd,
} from '../../calculations/dateDifference';
import { BSDate, ADDate, DateDiffResult, Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface DateDifferenceProps {
  language: Language;
}

export const DateDifference: React.FC<DateDifferenceProps> = ({ language }) => {
  const t = getTranslation(language);
  const today = getTodayDate();

  const [calendarType, setCalendarType] = useState<'BS' | 'AD'>('BS');

  // Start Date BS (e.g. 2083-01-01)
  const [startBsYear, setStartBsYear] = useState<number>(today.bs.year);
  const [startBsMonth, setStartBsMonth] = useState<number>(1);
  const [startBsDay, setStartBsDay] = useState<number>(1);

  // End Date BS (e.g. today's BS date)
  const [endBsYear, setEndBsYear] = useState<number>(today.bs.year);
  const [endBsMonth, setEndBsMonth] = useState<number>(today.bs.month);
  const [endBsDay, setEndBsDay] = useState<number>(today.bs.day);

  // Start Date AD
  const [startAdYear, setStartAdYear] = useState<number>(today.ad.year);
  const [startAdMonth, setStartAdMonth] = useState<number>(1);
  const [startAdDay, setStartAdDay] = useState<number>(1);

  // End Date AD
  const [endAdYear, setEndAdYear] = useState<number>(today.ad.year);
  const [endAdMonth, setEndAdMonth] = useState<number>(today.ad.month);
  const [endAdDay, setEndAdDay] = useState<number>(today.ad.day);

  const [diffResult, setDiffResult] = useState<DateDiffResult>(() =>
    calculateDateDiffBs(
      { year: today.bs.year, month: 1, day: 1 },
      { year: today.bs.year, month: today.bs.month, day: today.bs.day }
    )
  );

  // Dynamic day limits
  const maxStartBsDays = getDaysInBSMonth(startBsYear, startBsMonth);
  const maxEndBsDays = getDaysInBSMonth(endBsYear, endBsMonth);
  const maxStartAdDays = new Date(startAdYear, startAdMonth, 0).getDate();
  const maxEndAdDays = new Date(endAdYear, endAdMonth, 0).getDate();

  useEffect(() => {
    if (startBsDay > maxStartBsDays) setStartBsDay(maxStartBsDays);
  }, [startBsYear, startBsMonth, maxStartBsDays, startBsDay]);

  useEffect(() => {
    if (endBsDay > maxEndBsDays) setEndBsDay(maxEndBsDays);
  }, [endBsYear, endBsMonth, maxEndBsDays, endBsDay]);

  useEffect(() => {
    if (startAdDay > maxStartAdDays) setStartAdDay(maxStartAdDays);
  }, [startAdYear, startAdMonth, maxStartAdDays, startAdDay]);

  useEffect(() => {
    if (endAdDay > maxEndAdDays) setEndAdDay(maxEndAdDays);
  }, [endAdYear, endAdMonth, maxEndAdDays, endAdDay]);

  // Recalculate difference
  useEffect(() => {
    let result: DateDiffResult;
    if (calendarType === 'BS') {
      result = calculateDateDiffBs(
        { year: startBsYear, month: startBsMonth, day: startBsDay },
        { year: endBsYear, month: endBsMonth, day: endBsDay }
      );
    } else {
      result = calculateDateDiffAd(
        { year: startAdYear, month: startAdMonth, day: startAdDay },
        { year: endAdYear, month: endAdMonth, day: endAdDay }
      );
    }
    setDiffResult(result);
  }, [
    calendarType,
    startBsYear,
    startBsMonth,
    startBsDay,
    endBsYear,
    endBsMonth,
    endBsDay,
    startAdYear,
    startAdMonth,
    startAdDay,
    endAdYear,
    endAdMonth,
    endAdDay,
  ]);

  // Swap dates
  const handleSwapDates = () => {
    if (calendarType === 'BS') {
      const tempY = startBsYear;
      const tempM = startBsMonth;
      const tempD = startBsDay;

      setStartBsYear(endBsYear);
      setStartBsMonth(endBsMonth);
      setStartBsDay(endBsDay);

      setEndBsYear(tempY);
      setEndBsMonth(tempM);
      setEndBsDay(tempD);
    } else {
      const tempY = startAdYear;
      const tempM = startAdMonth;
      const tempD = startAdDay;

      setStartAdYear(endAdYear);
      setStartAdMonth(endAdMonth);
      setStartAdDay(endAdDay);

      setEndAdYear(tempY);
      setEndAdMonth(tempM);
      setEndAdDay(tempD);
    }
  };

  const bsYearsList = Array.from({ length: 96 }, (_, i) => 2000 + i);
  const adYearsList = Array.from({ length: 100 }, (_, i) => 1944 + i);

  return (
    <div id="date-difference-tool" className="space-y-6">
      {/* Calendar Switcher */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
        <button
          id="diff-cal-bs-btn"
          onClick={() => setCalendarType('BS')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            calendarType === 'BS'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {language === 'ne' ? 'विक्रम संवत् (वि.सं.)' : 'Bikram Sambat (BS)'}
        </button>
        <button
          id="diff-cal-ad-btn"
          onClick={() => setCalendarType('AD')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            calendarType === 'AD'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {language === 'ne' ? 'ईस्वी संवत् (सन्)' : 'Gregorian (AD)'}
        </button>
      </div>

      {/* Date Pickers Container */}
      <div className="space-y-4">
        {/* Start Date Card */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4" />
              <span>{language === 'ne' ? 'सुरुको मिति (Start Date)' : 'Start Date'}</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {calendarType === 'BS' ? 'BS' : 'AD'}
            </span>
          </div>

          {calendarType === 'BS' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.year} (वि.सं.)
                </label>
                <select
                  id="diff-start-bs-year"
                  value={startBsYear}
                  onChange={(e) => setStartBsYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {bsYearsList.map((y) => (
                    <option key={y} value={y}>
                      {language === 'ne' ? `${toNepaliDigits(y)} वि.सं.` : `${y} BS`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.months} (महिना)
                </label>
                <select
                  id="diff-start-bs-month"
                  value={startBsMonth}
                  onChange={(e) => setStartBsMonth(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {BS_MONTHS_EN.map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {language === 'ne' ? BS_MONTHS_NE[idx] : mName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.days} (गते)
                </label>
                <select
                  id="diff-start-bs-day"
                  value={startBsDay}
                  onChange={(e) => setStartBsDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {Array.from({ length: maxStartBsDays }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {language === 'ne' ? `${toNepaliDigits(d)} गते` : `Day ${d}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.year} (AD)
                </label>
                <select
                  id="diff-start-ad-year"
                  value={startAdYear}
                  onChange={(e) => setStartAdYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {adYearsList.map((y) => (
                    <option key={y} value={y}>
                      {y} AD
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.months} (महिना)
                </label>
                <select
                  id="diff-start-ad-month"
                  value={startAdMonth}
                  onChange={(e) => setStartAdMonth(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {AD_MONTHS_EN.map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {language === 'ne' ? AD_MONTHS_NE[idx] : mName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.days} (तारीख)
                </label>
                <select
                  id="diff-start-ad-day"
                  value={startAdDay}
                  onChange={(e) => setStartAdDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {Array.from({ length: maxStartAdDays }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Swap Button Divider */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            id="swap-dates-btn"
            onClick={handleSwapDates}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
            title={t.swap}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{language === 'ne' ? 'मिति अदलबदल (Swap)' : 'Swap Dates'}</span>
          </button>
        </div>

        {/* End Date Card */}
        <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
              <CalendarRange className="w-4 h-4" />
              <span>{language === 'ne' ? 'अन्तिम मिति (End Date)' : 'End Date'}</span>
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {calendarType === 'BS' ? 'BS' : 'AD'}
            </span>
          </div>

          {calendarType === 'BS' ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.year} (वि.सं.)
                </label>
                <select
                  id="diff-end-bs-year"
                  value={endBsYear}
                  onChange={(e) => setEndBsYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {bsYearsList.map((y) => (
                    <option key={y} value={y}>
                      {language === 'ne' ? `${toNepaliDigits(y)} वि.सं.` : `${y} BS`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.months} (महिना)
                </label>
                <select
                  id="diff-end-bs-month"
                  value={endBsMonth}
                  onChange={(e) => setEndBsMonth(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {BS_MONTHS_EN.map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {language === 'ne' ? BS_MONTHS_NE[idx] : mName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.days} (गते)
                </label>
                <select
                  id="diff-end-bs-day"
                  value={endBsDay}
                  onChange={(e) => setEndBsDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {Array.from({ length: maxEndBsDays }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {language === 'ne' ? `${toNepaliDigits(d)} गते` : `Day ${d}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.year} (AD)
                </label>
                <select
                  id="diff-end-ad-year"
                  value={endAdYear}
                  onChange={(e) => setEndAdYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {adYearsList.map((y) => (
                    <option key={y} value={y}>
                      {y} AD
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.months} (महिना)
                </label>
                <select
                  id="diff-end-ad-month"
                  value={endAdMonth}
                  onChange={(e) => setEndAdMonth(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {AD_MONTHS_EN.map((mName, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {language === 'ne' ? AD_MONTHS_NE[idx] : mName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {t.days} (तारीख)
                </label>
                <select
                  id="diff-end-ad-day"
                  value={endAdDay}
                  onChange={(e) => setEndAdDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {Array.from({ length: maxEndAdDays }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Difference Result Card */}
      <div
        id="diff-result-card"
        className="p-6 sm:p-8 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl relative overflow-hidden"
      >
        <span className="text-xs font-bold uppercase tracking-wider text-red-100">
          {language === 'ne' ? 'कुल मिति फरक' : 'Total Date Difference'}
        </span>

        {/* Big Total Days */}
        <div className="my-3">
          <div className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-baseline gap-2">
            <span>
              {language === 'ne'
                ? toNepaliDigits(diffResult.totalDays.toLocaleString('en-IN'))
                : diffResult.totalDays.toLocaleString()}
            </span>
            <span className="text-base sm:text-lg font-bold text-red-100">
              {t.days}
            </span>
          </div>
        </div>

        {/* Breakdown in Weeks + Days and Years/Months/Days */}
        <div className="pt-4 border-t border-white/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-between">
            <span className="text-blue-100 text-xs font-medium">{language === 'ne' ? 'हप्ता र दिन:' : 'Weeks & Days:'}</span>
            <span className="font-bold text-white">
              {language === 'ne'
                ? `${toNepaliDigits(diffResult.totalWeeks)} हप्ता ${toNepaliDigits(diffResult.remainingDays)} दिन`
                : `${diffResult.totalWeeks} Weeks ${diffResult.remainingDays} Days`}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-between">
            <span className="text-blue-100 text-xs font-medium">{language === 'ne' ? 'वर्ष, महिना र दिन:' : 'Years, Months, Days:'}</span>
            <span className="font-bold text-white">
              {language === 'ne'
                ? `${toNepaliDigits(diffResult.years)} वर्ष ${toNepaliDigits(diffResult.months)} महिना ${toNepaliDigits(diffResult.days)} दिन`
                : `${diffResult.years}y ${diffResult.months}m ${diffResult.days}d`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
