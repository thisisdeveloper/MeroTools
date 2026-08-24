import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ArrowRightLeft,
  Copy,
  Check,
  Share2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  bsToAd,
  adToBs,
  getTodayDate,
  BS_MONTHS_EN,
  BS_MONTHS_NE,
  AD_MONTHS_EN,
  AD_MONTHS_NE,
  getDaysInBSMonth,
  toNepaliDigits,
} from '../../calendar/bsCalendar';
import { BSDate, ADDate, DateConversionResult, Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface DateConverterProps {
  language: Language;
}

export const DateConverter: React.FC<DateConverterProps> = ({ language }) => {
  const t = getTranslation(language);
  const today = getTodayDate();

  // Mode: 'BS_TO_AD' or 'AD_TO_BS'
  const [mode, setMode] = useState<'BS_TO_AD' | 'AD_TO_BS'>('BS_TO_AD');

  // BS State
  const [bsYear, setBsYear] = useState<number>(today.bs.year);
  const [bsMonth, setBsMonth] = useState<number>(today.bs.month);
  const [bsDay, setBsDay] = useState<number>(today.bs.day);

  // AD State
  const [adYear, setAdYear] = useState<number>(today.ad.year);
  const [adMonth, setAdMonth] = useState<number>(today.ad.month);
  const [adDay, setAdDay] = useState<number>(today.ad.day);

  const [result, setResult] = useState<DateConversionResult>(today);
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);

  // Adjust max days when month/year changes for BS
  const maxBsDays = getDaysInBSMonth(bsYear, bsMonth);
  useEffect(() => {
    if (bsDay > maxBsDays) {
      setBsDay(maxBsDays);
    }
  }, [bsYear, bsMonth, maxBsDays, bsDay]);

  // Adjust max days for AD month
  const maxAdDays = new Date(adYear, adMonth, 0).getDate();
  useEffect(() => {
    if (adDay > maxAdDays) {
      setAdDay(maxAdDays);
    }
  }, [adYear, adMonth, maxAdDays, adDay]);

  // Run conversion
  const handleConvert = () => {
    if (mode === 'BS_TO_AD') {
      const res = bsToAd({ year: bsYear, month: bsMonth, day: bsDay });
      setResult(res);
      setAdYear(res.ad.year);
      setAdMonth(res.ad.month);
      setAdDay(res.ad.day);
    } else {
      const res = adToBs({ year: adYear, month: adMonth, day: adDay });
      setResult(res);
      setBsYear(res.bs.year);
      setBsMonth(res.bs.month);
      setBsDay(res.bs.day);
    }
  };

  // Convert whenever input fields change
  useEffect(() => {
    handleConvert();
  }, [mode, bsYear, bsMonth, bsDay, adYear, adMonth, adDay]);

  const handleResetToToday = () => {
    const td = getTodayDate();
    setBsYear(td.bs.year);
    setBsMonth(td.bs.month);
    setBsDay(td.bs.day);
    setAdYear(td.ad.year);
    setAdMonth(td.ad.month);
    setAdDay(td.ad.day);
    setResult(td);
  };

  const handleCopy = () => {
    const text =
      language === 'ne'
        ? `वि.सं.: ${result.formattedBsNe} (${result.dayNameNe})\nसन्: ${result.formattedAdNe}`
        : `BS: ${result.formattedBsEn} (${result.dayNameEn})\nAD: ${result.formattedAdEn}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const text =
      language === 'ne'
        ? `नेपाली मिति: ${result.formattedBsNe} (${result.dayNameNe}) = अंग्रेजी मिति: ${result.formattedAdNe} - via Mero Tools`
        : `Nepali Date: ${result.formattedBsEn} (${result.dayNameEn}) = Gregorian: ${result.formattedAdEn} - via Mero Tools`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nepali Date Converter - Mero Tools',
          text,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
      setShareFeedback(true);
      setTimeout(() => setShareFeedback(false), 2000);
    }
  };

  // Generate Year options
  const bsYearsList = Array.from({ length: 96 }, (_, i) => 2000 + i); // 2000 to 2095
  const adYearsList = Array.from({ length: 100 }, (_, i) => 1944 + i); // 1944 to 2043

  return (
    <div id="date-converter-tool" className="space-y-6">
      {/* Top Banner / Today's Glance */}
      <div className="p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/40 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="font-semibold text-slate-900 dark:text-slate-200">
            {t.todayDate}:
          </span>
          <span className="font-bold text-red-600 dark:text-red-400">
            {language === 'ne' ? today.formattedBsNe : today.formattedBsEn}
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600 dark:text-slate-300">
            {language === 'ne' ? today.formattedAdNe : today.formattedAdEn}
          </span>
        </div>

        <button
          id="converter-reset-today-btn"
          onClick={handleResetToToday}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <RotateCcw className="w-3 h-3 text-red-500" />
          <span>{language === 'ne' ? 'आजको मिति' : "Today's Date"}</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
        <button
          id="mode-bs-to-ad-btn"
          onClick={() => setMode('BS_TO_AD')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mode === 'BS_TO_AD'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {language === 'ne' ? 'वि.सं. → सन् (BS to AD)' : 'Bikram Sambat → Gregorian (BS to AD)'}
        </button>
        <button
          id="mode-ad-to-bs-btn"
          onClick={() => setMode('AD_TO_BS')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            mode === 'AD_TO_BS'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {language === 'ne' ? 'सन् → वि.सं. (AD to BS)' : 'Gregorian → Bikram Sambat (AD to BS)'}
        </button>
      </div>

      {/* Inputs Card */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-500" />
            <span>
              {mode === 'BS_TO_AD'
                ? language === 'ne'
                  ? 'विक्रम संवत् मिति छान्नुहोस्'
                  : 'Select Bikram Sambat (BS) Date'
                : language === 'ne'
                ? 'ईस्वी संवत् मिति छान्नुहोस्'
                : 'Select Gregorian (AD) Date'}
            </span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {mode === 'BS_TO_AD' ? 'BS Calendar' : 'AD Calendar'}
          </span>
        </div>

        {mode === 'BS_TO_AD' ? (
          /* BS Input Fields */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* BS Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.year} (वि.सं.)
              </label>
              <select
                id="bs-year-select"
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

            {/* BS Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.months} (महिना)
              </label>
              <select
                id="bs-month-select"
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

            {/* BS Day */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.days} (गते)
              </label>
              <select
                id="bs-day-select"
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
          /* AD Input Fields */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* AD Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.year} (AD)
              </label>
              <select
                id="ad-year-select"
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

            {/* AD Month */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.months} (महिना)
              </label>
              <select
                id="ad-month-select"
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

            {/* AD Day */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                {t.days} (तारीख)
              </label>
              <select
                id="ad-day-select"
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

      {/* Conversion Output Result Card */}
      <div
        id="conversion-result-card"
        className="p-6 sm:p-8 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-red-100">
            {mode === 'BS_TO_AD'
              ? language === 'ne'
                ? 'परिवर्तित अंग्रेजी मिति (Gregorian AD)'
                : 'Converted Gregorian (AD) Date'
              : language === 'ne'
              ? 'परिवर्तित नेपाली मिति (Bikram Sambat BS)'
              : 'Converted Bikram Sambat (BS) Date'}
          </span>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm border border-white/20">
            {language === 'ne' ? result.dayNameNe : result.dayNameEn}
          </span>
        </div>

        {/* Primary converted text */}
        <div className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white mb-2 leading-snug break-words">
          {mode === 'BS_TO_AD'
            ? language === 'ne'
              ? result.formattedAdNe
              : result.formattedAdEn
            : language === 'ne'
            ? result.formattedBsNe
            : result.formattedBsEn}
        </div>

        {/* Secondary complement info */}
        <div className="pt-3.5 border-t border-white/20 flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm text-blue-50">
          <div>
            <span className="text-[11px] sm:text-xs text-blue-100/80">
              {mode === 'BS_TO_AD'
                ? language === 'ne'
                  ? 'स्रोत विक्रम संवत्: '
                  : 'Source BS: '
                : language === 'ne'
                ? 'स्रोत ईस्वी संवत्: '
                : 'Source AD: '}
            </span>
            <span className="font-semibold text-white ml-1">
              {mode === 'BS_TO_AD'
                ? language === 'ne'
                  ? result.formattedBsNe
                  : result.formattedBsEn
                : language === 'ne'
                  ? result.formattedAdNe
                  : result.formattedAdEn}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="copy-result-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-200">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>

            <button
              id="share-result-btn"
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5 text-red-600" />
              <span>{shareFeedback ? t.copied : t.share}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
