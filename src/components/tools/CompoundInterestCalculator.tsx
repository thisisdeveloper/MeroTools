import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  Percent,
  Calendar,
  Layers,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  ArrowUpRight,
  PlusCircle,
  HelpCircle,
  Save,
  X,
  Wallet,
} from 'lucide-react';
import { Language, CompoundingFrequency, ADDate } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { calculateCompoundInterest } from '../../calculations/compoundInterest';
import { calculateDateDiffAd, calculateDateDiffBs } from '../../calculations/dateDifference';
import { formatNepaliCurrency } from '../../services/forex';
import { saveLoan } from '../../services/savedLoans';
import {
  toNepaliDigits,
  getTodayDate,
  getDaysInBSMonth,
  BS_MONTHS_EN,
  BS_MONTHS_NE,
  AD_MONTHS_EN,
  AD_MONTHS_NE,
  bsToAd,
} from '../../calendar/bsCalendar';

function getDaysInAdMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function subtractFromDate(date: Date, years: number, months: number, days: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() - years);
  d.setMonth(d.getMonth() - months);
  d.setDate(d.getDate() - days);
  return d;
}

interface CompoundInterestCalculatorProps {
  language: Language;
  onViewSavedLoans?: () => void;
}

export const CompoundInterestCalculator: React.FC<CompoundInterestCalculatorProps> = ({
  language,
  onViewSavedLoans,
}) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';
  const today = getTodayDate();

  // Inputs
  const [principalStr, setPrincipalStr] = useState<string>('500000');
  const [rateStr, setRateStr] = useState<string>('10');
  const [yearsStr, setYearsStr] = useState<string>('5');
  const [monthsStr, setMonthsStr] = useState<string>('0');
  const [daysStr, setDaysStr] = useState<string>('0');
  const [frequency, setFrequency] = useState<CompoundingFrequency>('annual');

  // Tenure can be entered directly, or derived from a start/end date pair
  const [tenureMode, setTenureMode] = useState<'duration' | 'dates'>('dates');
  const [dateCalendarType, setDateCalendarType] = useState<'BS' | 'AD'>('AD');

  // AD start/end (used when dateCalendarType === 'AD')
  const [startAdYear, setStartAdYear] = useState<number>(today.ad.year - 5);
  const [startAdMonth, setStartAdMonth] = useState<number>(today.ad.month);
  const [startAdDay, setStartAdDay] = useState<number>(today.ad.day);
  const [endAdYear, setEndAdYear] = useState<number>(today.ad.year);
  const [endAdMonth, setEndAdMonth] = useState<number>(today.ad.month);
  const [endAdDay, setEndAdDay] = useState<number>(today.ad.day);

  // BS start/end (used when dateCalendarType === 'BS')
  const [startBsYear, setStartBsYear] = useState<number>(today.bs.year - 5);
  const [startBsMonth, setStartBsMonth] = useState<number>(today.bs.month);
  const [startBsDay, setStartBsDay] = useState<number>(today.bs.day);
  const [endBsYear, setEndBsYear] = useState<number>(today.bs.year);
  const [endBsMonth, setEndBsMonth] = useState<number>(today.bs.month);
  const [endBsDay, setEndBsDay] = useState<number>(today.bs.day);

  const maxStartBsDays = getDaysInBSMonth(startBsYear, startBsMonth);
  const maxEndBsDays = getDaysInBSMonth(endBsYear, endBsMonth);
  const maxStartAdDays = getDaysInAdMonth(startAdYear, startAdMonth);
  const maxEndAdDays = getDaysInAdMonth(endAdYear, endAdMonth);

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

  const bsYearsList = Array.from({ length: 96 }, (_, i) => 2000 + i);
  const adYearsList = Array.from({ length: 100 }, (_, i) => 1944 + i);

  // Regular Contribution / SIP
  const [enableContribution, setEnableContribution] = useState<boolean>(false);
  const [depositAmountStr, setDepositAmountStr] = useState<string>('10000');
  const [depositFreq, setDepositFreq] = useState<'monthly' | 'yearly'>('monthly');

  const [copied, setCopied] = useState<boolean>(false);

  // Save Loan modal
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [loanTitleInput, setLoanTitleInput] = useState<string>('');
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Parse numerical inputs
  const principal = parseFloat(principalStr) || 0;
  const rate = parseFloat(rateStr) || 0;
  const years = parseInt(yearsStr) || 0;
  const months = parseInt(monthsStr) || 0;
  const days = parseInt(daysStr) || 0;
  const deposit = enableContribution ? parseFloat(depositAmountStr) || 0 : 0;

  // When tenure comes from a date range, derive Years/Months/Days from the
  // calendar difference between the two dates — a plain date-to-date diff
  // already counts the span once (it never double-counts the disbursement
  // or collection day), which matches standard banking day-count practice.
  useEffect(() => {
    if (tenureMode !== 'dates') return;
    const diff =
      dateCalendarType === 'BS'
        ? calculateDateDiffBs(
            { year: startBsYear, month: startBsMonth, day: startBsDay },
            { year: endBsYear, month: endBsMonth, day: endBsDay }
          )
        : calculateDateDiffAd(
            { year: startAdYear, month: startAdMonth, day: startAdDay },
            { year: endAdYear, month: endAdMonth, day: endAdDay }
          );
    setYearsStr(String(diff.years));
    setMonthsStr(String(diff.months));
    setDaysStr(String(diff.days));
  }, [
    tenureMode,
    dateCalendarType,
    startAdYear,
    startAdMonth,
    startAdDay,
    endAdYear,
    endAdMonth,
    endAdDay,
    startBsYear,
    startBsMonth,
    startBsDay,
    endBsYear,
    endBsMonth,
    endBsDay,
  ]);

  // Compute result
  const result = useMemo(() => {
    return calculateCompoundInterest(
      principal,
      rate,
      years,
      months,
      frequency,
      deposit,
      depositFreq,
      days
    );
  }, [principal, rate, years, months, days, frequency, deposit, depositFreq]);

  // Visual bar percentages
  const principalPct = result.maturityAmount > 0 ? (result.totalDeposit / result.maturityAmount) * 100 : 100;
  const interestPct = result.maturityAmount > 0 ? (result.totalInterest / result.maturityAmount) * 100 : 0;

  const quickPrincipalPresets = [
    { label: isNe ? '१ लाख' : '1 Lakh', val: 100000 },
    { label: isNe ? '५ लाख' : '5 Lakh', val: 500000 },
    { label: isNe ? '१० लाख' : '10 Lakh', val: 1000000 },
    { label: isNe ? '२५ लाख' : '25 Lakh', val: 2500000 },
    { label: isNe ? '५० लाख' : '50 Lakh', val: 5000000 },
  ];

  const handleCopy = () => {
    const text = `Compound Interest Summary:
• Principal Invested: ${formatNepaliCurrency(result.totalDeposit)}
• Annual Interest Rate: ${result.annualRate}% (${result.frequency} compounding)
• Time Horizon: ${result.years} Years${result.months > 0 ? ` ${result.months} Months` : ''}${result.days > 0 ? ` ${result.days} Days` : ''}
• Total Interest Earned: ${formatNepaliCurrency(result.totalInterest)}
• Total Maturity Amount: ${formatNepaliCurrency(result.maturityAmount)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setPrincipalStr('500000');
    setRateStr('10');
    setYearsStr('5');
    setMonthsStr('0');
    setDaysStr('0');
    setFrequency('annual');
    setTenureMode('dates');
    setDateCalendarType('AD');
    setStartAdYear(today.ad.year - 5);
    setStartAdMonth(today.ad.month);
    setStartAdDay(today.ad.day);
    setEndAdYear(today.ad.year);
    setEndAdMonth(today.ad.month);
    setEndAdDay(today.ad.day);
    setStartBsYear(today.bs.year - 5);
    setStartBsMonth(today.bs.month);
    setStartBsDay(today.bs.day);
    setEndBsYear(today.bs.year);
    setEndBsMonth(today.bs.month);
    setEndBsDay(today.bs.day);
    setEnableContribution(false);
    setDepositAmountStr('10000');
  };

  // Resolves the actual start date used for this loan, so it can be saved
  // and later used to compute "interest till today". In date-range mode
  // this is the date the user picked; in manual-duration mode we infer it
  // by counting the entered duration back from today.
  const getEffectiveStartDateAd = (): ADDate => {
    if (tenureMode === 'dates') {
      if (dateCalendarType === 'AD') {
        return { year: startAdYear, month: startAdMonth, day: startAdDay };
      }
      return bsToAd({ year: startBsYear, month: startBsMonth, day: startBsDay }).ad;
    }
    const d = subtractFromDate(new Date(), years, months, days);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  };

  const handleConfirmSaveLoan = () => {
    saveLoan({
      title: loanTitleInput,
      principal,
      rate,
      frequency,
      regularDeposit: deposit,
      regularDepositFrequency: depositFreq,
      startDateAd: getEffectiveStartDateAd(),
      plannedMaturityAmount: result.maturityAmount,
    });
    setShowSaveModal(false);
    setLoanTitleInput('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 5000);
  };

  return (
    <div id="compound-interest-tool" className="space-y-6">
      {/* Input Parameters Card */}
      <div className="p-6 sm:p-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold tracking-wider text-slate-800 dark:text-slate-200">
              {isNe ? 'लगानी तथा ब्याज विवरण' : 'Investment & Compounding Inputs'}
            </h2>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.reset}</span>
          </button>
        </div>

        {/* 1. Principal Amount Input & Quick Chips */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {isNe ? 'सुरुवाती साँवा रकम (Initial Principal)' : 'Initial Principal Amount (NPR)'}
          </label>
          <input
            id="input-principal"
            type="number"
            min="0"
            step="5000"
            value={principalStr}
            onChange={(e) => setPrincipalStr(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-extrabold text-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {quickPrincipalPresets.map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setPrincipalStr(p.val.toString())}
                className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Annual Interest Rate & Compounding Frequency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isNe ? 'वार्षिक ब्याज दर (%)' : 'Annual Interest Rate (%)'}
              </label>
              <span className="text-xs font-black text-red-600 dark:text-red-400">
                {rate}%
              </span>
            </div>
            <input
              id="input-rate"
              type="number"
              step="0.1"
              min="0"
              max="50"
              value={rateStr}
              onChange={(e) => setRateStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <input
              type="range"
              min="1"
              max="25"
              step="0.25"
              value={rate || 10}
              onChange={(e) => setRateStr(e.target.value)}
              className="w-full mt-2 accent-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {isNe ? 'चक्रवृद्धि अवधि (Compounding Frequency)' : 'Compounding Frequency'}
            </label>
            <select
              id="select-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as CompoundingFrequency)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="quarterly">{isNe ? 'त्रैमासिक (Quarterly - नेपालका बैंक)' : 'Quarterly (Every 3 months)'}</option>
              <option value="semi-annual">{isNe ? 'अर्ध-वार्षिक (Semi-Annually)' : 'Semi-Annually (Every 6 months)'}</option>
              <option value="annual">{isNe ? 'वार्षिक (Annually)' : 'Annually (Once a year)'}</option>
              <option value="monthly">{isNe ? 'मासिक (Monthly)' : 'Monthly (Every month)'}</option>
              <option value="daily">{isNe ? 'दैनिक (Daily)' : 'Daily'}</option>
            </select>
          </div>
        </div>

        {/* 3. Time Tenure (Years, Months & Days) — manual entry, or derived from dates */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isNe ? 'अवधि (Tenure)' : 'Tenure'}
            </label>
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              <button
                type="button"
                id="tenure-mode-duration-btn"
                onClick={() => setTenureMode('duration')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  tenureMode === 'duration'
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isNe ? 'अवधि हाल्नुहोस्' : 'Enter Duration'}
              </button>
              <button
                type="button"
                id="tenure-mode-dates-btn"
                onClick={() => setTenureMode('dates')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                  tenureMode === 'dates'
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {isNe ? 'सुरु र अन्त्य मिति' : 'Start & End Date'}
              </button>
            </div>
          </div>

          {tenureMode === 'dates' && (
            <div className="mb-3">
              {/* BS / AD Calendar Switcher for the date range */}
              <div className="flex items-center gap-1 p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 w-fit mb-2.5">
                <button
                  type="button"
                  id="tenure-date-cal-bs-btn"
                  onClick={() => setDateCalendarType('BS')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                    dateCalendarType === 'BS'
                      ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isNe ? 'वि.सं. (BS)' : 'Nepali (BS)'}
                </button>
                <button
                  type="button"
                  id="tenure-date-cal-ad-btn"
                  onClick={() => setDateCalendarType('AD')}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                    dateCalendarType === 'AD'
                      ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isNe ? 'ईस्वी (AD)' : 'Gregorian (AD)'}
                </button>
              </div>

              {dateCalendarType === 'AD' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      {isNe ? 'ऋण वितरण मिति' : 'Loan Distributed Date'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        id="input-start-ad-year"
                        value={startAdYear}
                        onChange={(e) => setStartAdYear(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {adYearsList.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      <select
                        id="input-start-ad-month"
                        value={startAdMonth}
                        onChange={(e) => setStartAdMonth(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {AD_MONTHS_EN.map((mName, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {isNe ? AD_MONTHS_NE[idx] : mName}
                          </option>
                        ))}
                      </select>
                      <select
                        id="input-start-ad-day"
                        value={startAdDay}
                        onChange={(e) => setStartAdDay(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {Array.from({ length: maxStartAdDays }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      {isNe ? 'ऋण बन्द मिति' : 'Loan Closing Date'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        id="input-end-ad-year"
                        value={endAdYear}
                        onChange={(e) => setEndAdYear(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {adYearsList.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      <select
                        id="input-end-ad-month"
                        value={endAdMonth}
                        onChange={(e) => setEndAdMonth(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {AD_MONTHS_EN.map((mName, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {isNe ? AD_MONTHS_NE[idx] : mName}
                          </option>
                        ))}
                      </select>
                      <select
                        id="input-end-ad-day"
                        value={endAdDay}
                        onChange={(e) => setEndAdDay(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {Array.from({ length: maxEndAdDays }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      {isNe ? 'ऋण वितरण मिति' : 'Loan Distributed Date'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        id="input-start-bs-year"
                        value={startBsYear}
                        onChange={(e) => setStartBsYear(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {bsYearsList.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      <select
                        id="input-start-bs-month"
                        value={startBsMonth}
                        onChange={(e) => setStartBsMonth(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {BS_MONTHS_EN.map((mName, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {isNe ? BS_MONTHS_NE[idx] : mName}
                          </option>
                        ))}
                      </select>
                      <select
                        id="input-start-bs-day"
                        value={startBsDay}
                        onChange={(e) => setStartBsDay(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {Array.from({ length: maxStartBsDays }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                      {isNe ? 'ऋण बन्द मिति' : 'Loan Closing Date'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        id="input-end-bs-year"
                        value={endBsYear}
                        onChange={(e) => setEndBsYear(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {bsYearsList.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      <select
                        id="input-end-bs-month"
                        value={endBsMonth}
                        onChange={(e) => setEndBsMonth(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {BS_MONTHS_EN.map((mName, idx) => (
                          <option key={idx + 1} value={idx + 1}>
                            {isNe ? BS_MONTHS_NE[idx] : mName}
                          </option>
                        ))}
                      </select>
                      <select
                        id="input-end-bs-day"
                        value={endBsDay}
                        onChange={(e) => setEndBsDay(Number(e.target.value))}
                        className="w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                      >
                        {Array.from({ length: maxEndBsDays }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {tenureMode === 'dates' && (
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              {isNe
                ? 'कुल अवधि (माथिको मिति अनुसार स्वतः गणना गरिएको हो)'
                : 'Total Duration (Auto-calculated from the dates above)'}
            </label>
          )}

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                {isNe ? 'वर्ष' : 'Years'}
              </label>
              <input
                id="input-years"
                type="number"
                min="0"
                max="50"
                disabled={tenureMode === 'dates'}
                value={yearsStr}
                onChange={(e) => setYearsStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                {isNe ? 'महिना' : 'Months'}
              </label>
              <input
                id="input-months"
                type="number"
                min="0"
                max="11"
                disabled={tenureMode === 'dates'}
                value={monthsStr}
                onChange={(e) => setMonthsStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                {isNe ? 'दिन' : 'Days'}
              </label>
              <input
                id="input-days"
                type="number"
                min="0"
                max="30"
                disabled={tenureMode === 'dates'}
                value={daysStr}
                onChange={(e) => setDaysStr(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* 4. Optional Regular Contribution / Recurring SIP */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isNe ? 'नियमित थप बचत / SIP जोड्नुहोस्' : 'Regular Recurring Deposit / SIP'}
              </span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableContribution}
                onChange={(e) => setEnableContribution(e.target.checked)}
                className="w-4 h-4 accent-red-600 rounded"
              />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {enableContribution ? (isNe ? 'सक्रिय' : 'Enabled') : (isNe ? 'निष्क्रिय' : 'Off')}
              </span>
            </label>
          </div>

          {enableContribution && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {isNe ? 'नियमित रकम (Deposit Amount)' : 'Deposit Amount (NPR)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={depositAmountStr}
                  onChange={(e) => setDepositAmountStr(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {isNe ? 'बचतको अन्तराल' : 'Deposit Interval'}
                </label>
                <select
                  value={depositFreq}
                  onChange={(e) => setDepositFreq(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="monthly">{isNe ? 'प्रत्येक महिना (Monthly)' : 'Every Month'}</option>
                  <option value="yearly">{isNe ? 'प्रत्येक वर्ष (Yearly)' : 'Every Year'}</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Primary Results Hero Card */}
      <div
        id="compound-interest-results-card"
        className="p-5 sm:p-7 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isNe ? 'कुल परिपक्वता रकम (Total Maturity)' : 'Total Maturity Value'}
            </span>
            <div className="text-2xl sm:text-4xl font-black text-white mt-1 leading-snug">
              {formatNepaliCurrency(result.maturityAmount)}
            </div>
          </div>

          <div className="self-start sm:self-center flex items-center gap-2">
            <button
              id="compound-interest-save-btn"
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{t.saveLoan}</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.copy}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Split: Principal vs Interest */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1.5 border-t border-white/15">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] sm:text-xs text-red-100 font-medium">
              {isNe ? 'कुल जम्मा साँवा (Principal):' : 'Total Principal Invested:'}
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              {formatNepaliCurrency(result.totalDeposit)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] sm:text-xs text-red-100 font-medium">
              {isNe ? 'कुल चक्रवृद्धि ब्याज (Interest):' : 'Total Compound Interest:'}
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-emerald-300 mt-0.5">
              {formatNepaliCurrency(result.totalInterest)}
            </div>
          </div>
        </div>

        {/* Visual Bar Breakdown */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-red-100 font-semibold">
            <span>{isNe ? 'साँवा' : 'Principal'}: {principalPct.toFixed(1)}%</span>
            <span>{isNe ? 'ब्याज' : 'Interest'}: {interestPct.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${principalPct}%` }}
              className="h-full bg-white/90 transition-all duration-500"
              title={`Principal: ${principalPct.toFixed(1)}%`}
            />
            <div
              style={{ width: `${interestPct}%` }}
              className="h-full bg-emerald-400 transition-all duration-500"
              title={`Interest: ${interestPct.toFixed(1)}%`}
            />
          </div>
        </div>

        {/* Power of Compounding Delta Badge */}
        {result.compoundInterestAdvantage > 0 && (
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-xs text-red-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>
                {isNe
                  ? 'साधारण ब्याजभन्दा थप अतिरिक्त लाभ:'
                  : 'Extra gain over simple interest:'}
              </span>
            </div>
            <strong className="text-white font-extrabold text-sm">
              +{formatNepaliCurrency(result.compoundInterestAdvantage)}
            </strong>
          </div>
        )}
      </div>

      {/* Just Saved Confirmation */}
      {justSaved && (
        <div
          id="loan-just-saved-banner"
          className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between gap-3 flex-wrap"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            <span>{t.loanSaved}</span>
          </div>
          {onViewSavedLoans && (
            <button
              id="loan-just-saved-view-btn"
              onClick={onViewSavedLoans}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{t.savedLoans}</span>
            </button>
          )}
        </div>
      )}

      {/* Yearly Growth Schedule Table */}
      {result.yearlySchedule.length > 0 && (
        <div className="p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-500" />
            <span>{isNe ? 'वार्षिक लगानी वृद्धि तालिका' : 'Year-by-Year Growth Schedule'}</span>
          </h3>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-1">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-xl">{isNe ? 'वर्ष' : 'Year'}</th>
                  <th className="py-2.5 px-3">{isNe ? 'सुरुवाती रकम' : 'Opening'}</th>
                  {enableContribution && <th className="py-2.5 px-3">{isNe ? 'थप बचत' : 'Deposit'}</th>}
                  <th className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">
                    {isNe ? 'ब्याज आम्दानी' : 'Interest Earned'}
                  </th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">{isNe ? 'अन्तिम मौज्दात' : 'Closing Balance'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                      {isNe ? `वर्ष ${toNepaliDigits(row.year)}` : `Year ${row.year}`}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {formatNepaliCurrency(row.openingBalance)}
                    </td>
                    {enableContribution && (
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {row.annualContribution > 0 ? formatNepaliCurrency(row.annualContribution) : '-'}
                      </td>
                    )}
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatNepaliCurrency(row.interestEarned)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900 dark:text-slate-100">
                      {formatNepaliCurrency(row.closingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Loan Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Save className="w-5 h-5 text-red-600" />
                <span>{t.saveLoanModalTitle}</span>
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t.loanTitleLabel}
              </label>
              <input
                id="loan-title-input"
                type="text"
                autoFocus
                value={loanTitleInput}
                onChange={(e) => setLoanTitleInput(e.target.value)}
                placeholder={t.loanTitlePlaceholder}
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
                id="loan-title-confirm-save-btn"
                onClick={handleConfirmSaveLoan}
                disabled={!loanTitleInput.trim()}
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
