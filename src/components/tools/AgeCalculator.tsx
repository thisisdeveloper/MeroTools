import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Cake,
  Calendar,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  PartyPopper,
  Save,
  Check,
  X,
  Users,
} from 'lucide-react';
import {
  getTodayDate,
  BS_MONTHS_EN,
  BS_MONTHS_NE,
  AD_MONTHS_EN,
  AD_MONTHS_NE,
  getDaysInBSMonth,
  toNepaliDigits,
  bsToAd,
} from '../../calendar/bsCalendar';
import {
  calculateAgeFromBs,
  calculateAgeFromAd,
} from '../../calculations/age';
import { ADDate, AgeResult, Language } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { saveAge } from '../../services/savedAges';

interface AgeCalculatorProps {
  language: Language;
  onViewSavedAges?: () => void;
}

export const AgeCalculator: React.FC<AgeCalculatorProps> = ({ language, onViewSavedAges }) => {
  const t = getTranslation(language);
  const today = getTodayDate();

  const [calendarType, setCalendarType] = useState<'BS' | 'AD'>('BS');

  // Default BS DOB (e.g. 2055-04-12)
  const [bsYear, setBsYear] = useState<number>(2055);
  const [bsMonth, setBsMonth] = useState<number>(4);
  const [bsDay, setBsDay] = useState<number>(12);

  // Default AD DOB
  const [adYear, setAdYear] = useState<number>(1998);
  const [adMonth, setAdMonth] = useState<number>(7);
  const [adDay, setAdDay] = useState<number>(27);

  const [ageResult, setAgeResult] = useState<AgeResult>(() =>
    calculateAgeFromBs({ year: 2055, month: 4, day: 12 })
  );

  // Save Age modal
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [ageNameInput, setAgeNameInput] = useState<string>('');
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Dynamic day limit adjustments
  const maxBsDays = getDaysInBSMonth(bsYear, bsMonth);
  useEffect(() => {
    if (bsDay > maxBsDays) {
      setBsDay(maxBsDays);
    }
  }, [bsYear, bsMonth, maxBsDays, bsDay]);

  const maxAdDays = new Date(adYear, adMonth, 0).getDate();
  useEffect(() => {
    if (adDay > maxAdDays) {
      setAdDay(maxAdDays);
    }
  }, [adYear, adMonth, maxAdDays, adDay]);

  // Recalculate
  useEffect(() => {
    let result: AgeResult;
    if (calendarType === 'BS') {
      result = calculateAgeFromBs({ year: bsYear, month: bsMonth, day: bsDay });
    } else {
      result = calculateAgeFromAd({ year: adYear, month: adMonth, day: adDay });
    }
    setAgeResult(result);

    if (result.isTodayBirthday) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // confetti fallback
      }
    }
  }, [calendarType, bsYear, bsMonth, bsDay, adYear, adMonth, adDay]);

  const bsYearsList = Array.from({ length: 96 }, (_, i) => 2000 + i);
  const adYearsList = Array.from({ length: 100 }, (_, i) => 1944 + i);

  const handleConfirmSaveAge = () => {
    const dobAd: ADDate =
      calendarType === 'BS'
        ? bsToAd({ year: bsYear, month: bsMonth, day: bsDay }).ad
        : { year: adYear, month: adMonth, day: adDay };
    saveAge({ name: ageNameInput, dobAd });
    setShowSaveModal(false);
    setAgeNameInput('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 5000);
  };

  return (
    <div id="age-calculator-tool" className="space-y-6">
      {/* Calendar Switcher */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
        <button
          id="age-cal-bs-btn"
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
          id="age-cal-ad-btn"
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

      {/* Date of Birth Input Section */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Cake className="w-4 h-4 text-red-500" />
            <span>{t.dob}</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {calendarType === 'BS' ? 'BS Calendar' : 'AD Calendar'}
          </span>
        </div>

        {calendarType === 'BS' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.year} (वि.सं.)
              </label>
              <select
                id="age-bs-year"
                value={bsYear}
                onChange={(e) => setBsYear(Number(e.target.value))}
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
                id="age-bs-month"
                value={bsMonth}
                onChange={(e) => setBsMonth(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {BS_MONTHS_EN.map((mName, idx) => {
                  const mNum = idx + 1;
                  return (
                    <option key={mNum} value={mNum}>
                      {language === 'ne'
                        ? `${BS_MONTHS_NE[idx]} (${toNepaliDigits(mNum)})`
                        : `${mName} (${mNum})`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.days} (गते)
              </label>
              <select
                id="age-bs-day"
                value={bsDay}
                onChange={(e) => setBsDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {Array.from({ length: maxBsDays }, (_, i) => i + 1).map((d) => (
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
                id="age-ad-year"
                value={adYear}
                onChange={(e) => setAdYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {adYearsList.map((y) => (
                  <option key={y} value={y}>
                    {language === 'ne' ? `${toNepaliDigits(y)} सन्` : `${y} AD`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.months} (महिना)
              </label>
              <select
                id="age-ad-month"
                value={adMonth}
                onChange={(e) => setAdMonth(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {AD_MONTHS_EN.map((mName, idx) => {
                  const mNum = idx + 1;
                  return (
                    <option key={mNum} value={mNum}>
                      {language === 'ne'
                        ? `${AD_MONTHS_NE[idx]} (${toNepaliDigits(mNum)})`
                        : `${mName} (${mNum})`}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.days} (तारीख)
              </label>
              <select
                id="age-ad-day"
                value={adDay}
                onChange={(e) => setAdDay(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
              >
                {Array.from({ length: maxAdDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {language === 'ne' ? `${toNepaliDigits(d)} तारिख` : `Day ${d}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Birthday Banner if today is birthday */}
      {ageResult.isTodayBirthday && (
        <div className="p-5 rounded-[2rem] bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 text-white shadow-xl flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3.5">
            <PartyPopper className="w-8 h-8" />
            <div>
              <h3 className="font-extrabold text-base">
                {language === 'ne' ? 'हार्दिक जन्मदिनको शुभकामना! 🎉' : 'Happy Birthday Today! 🎉'}
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                {language === 'ne' ? 'तपाईंको नयाँ वर्ष सुखद रहोस्!' : 'Wishing you a fantastic year ahead!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Age Highlight Hero Card */}
      <div
        id="age-result-card"
        className="p-6 sm:p-8 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-100 shrink-0">
            {t.currentAge}
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20">
              {t.bornOn}:{' '}
              <strong className="text-amber-200">
                {language === 'ne' ? ageResult.dayBornNe : ageResult.dayBornEn}
              </strong>
            </span>
            <button
              id="age-save-btn"
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.saveAge}</span>
            </button>
          </div>
        </div>

        {/* 3 Metric Pillars: Years, Months, Days */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 text-center my-3">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-2xl sm:text-4xl font-black text-white">
              {language === 'ne' ? toNepaliDigits(ageResult.years) : ageResult.years}
            </div>
            <div className="text-xs font-bold text-red-100 uppercase tracking-wider mt-1">
              {t.years}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-2xl sm:text-4xl font-black text-white">
              {language === 'ne' ? toNepaliDigits(ageResult.months) : ageResult.months}
            </div>
            <div className="text-xs font-bold text-red-100 uppercase tracking-wider mt-1">
              {t.months}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-2xl sm:text-4xl font-black text-white">
              {language === 'ne' ? toNepaliDigits(ageResult.days) : ageResult.days}
            </div>
            <div className="text-xs font-bold text-red-100 uppercase tracking-wider mt-1">
              {t.days}
            </div>
          </div>
        </div>

        {/* Next Birthday info */}
        <div className="mt-4 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-blue-50">
            <Cake className="w-4 h-4 text-red-200" />
            <span className="font-semibold text-blue-100">{t.nextBirthday}:</span>
            <span className="font-bold text-amber-200">
              {ageResult.isTodayBirthday
                ? language === 'ne'
                  ? 'आजै हो!'
                  : 'Today!'
                : language === 'ne'
                ? `${toNepaliDigits(ageResult.nextBirthdayInMonths)} महिना ${toNepaliDigits(ageResult.nextBirthdayInDays)} दिन बाकी`
                : `${ageResult.nextBirthdayInMonths} Months ${ageResult.nextBirthdayInDays} Days`}
            </span>
          </div>

          <div className="text-blue-100/90">
            {language === 'ne' ? 'पर्ने दिन:' : 'Falls on:'}{' '}
            <span className="font-bold text-white">
              {language === 'ne'
                ? ageResult.nextBirthdayDayNe
                : ageResult.nextBirthdayDayEn}
            </span>
          </div>
        </div>
      </div>

      {/* Just Saved Confirmation */}
      {justSaved && (
        <div
          id="age-just-saved-banner"
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between gap-3 flex-wrap"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            <span>{t.ageSaved}</span>
          </div>
          {onViewSavedAges && (
            <button
              id="age-just-saved-view-btn"
              onClick={onViewSavedAges}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t.savedAges}</span>
            </button>
          )}
        </div>
      )}

      {/* Summary Milestones (Total days, weeks, hours lived) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-5 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {language === 'ne' ? 'कुल बाँचिएका दिनहरू' : 'Total Days Lived'}
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-white">
            {language === 'ne'
              ? `${toNepaliDigits(ageResult.totalDays.toLocaleString('en-IN'))} दिन`
              : `${ageResult.totalDays.toLocaleString()} Days`}
          </div>
        </div>

        <div className="p-5 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {language === 'ne' ? 'कुल हप्ताहरू' : 'Total Weeks'}
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-white">
            {language === 'ne'
              ? `${toNepaliDigits(ageResult.totalWeeks.toLocaleString('en-IN'))} हप्ता`
              : `${ageResult.totalWeeks.toLocaleString()} Weeks`}
          </div>
        </div>

        <div className="p-5 rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
            {language === 'ne' ? 'कुल घण्टाहरू' : 'Total Hours'}
          </div>
          <div className="text-xl font-black text-slate-800 dark:text-white">
            {language === 'ne'
              ? `${toNepaliDigits(ageResult.totalHours.toLocaleString('en-IN'))} घण्टा`
              : `${ageResult.totalHours.toLocaleString()} Hours`}
          </div>
        </div>
      </div>

      {/* Save Age Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Save className="w-5 h-5 text-red-600" />
                <span>{t.saveAgeModalTitle}</span>
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.ageNameLabel}
              </label>
              <input
                id="age-name-input"
                type="text"
                autoFocus
                value={ageNameInput}
                onChange={(e) => setAgeNameInput(e.target.value)}
                placeholder={t.ageNamePlaceholder}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                id="age-name-confirm-save-btn"
                onClick={handleConfirmSaveAge}
                disabled={!ageNameInput.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
