import React, { useState } from 'react';
import {
  Landmark,
  Calendar,
  Percent,
  PieChart,
  Table,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { calculateEmi } from '../../calculations/emi';
import { formatNepaliCurrency } from '../../services/forex';
import { toNepaliDigits } from '../../calendar/bsCalendar';
import { Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface EmiCalculatorProps {
  language: Language;
}

export const EmiCalculator: React.FC<EmiCalculatorProps> = ({ language }) => {
  const t = getTranslation(language);

  // Defaults: 50 Lakhs (5,000,000 NPR), 10.5% rate, 20 years
  const [principalStr, setPrincipalStr] = useState<string>('5000000');
  const [rateStr, setRateStr] = useState<string>('10.5');
  const [tenureYearsStr, setTenureYearsStr] = useState<string>('20');
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  const principal = parseFloat(principalStr) || 0;
  const rate = parseFloat(rateStr) || 0;
  const tenureYears = parseFloat(tenureYearsStr) || 1;

  const result = calculateEmi(principal, rate, tenureYears);

  const principalPercentage =
    result.totalPayment > 0
      ? Math.round((result.principalAmount / result.totalPayment) * 100)
      : 50;
  const interestPercentage = 100 - principalPercentage;

  const loanPresets = [
    { label: '10 Lakhs', val: 1000000 },
    { label: '25 Lakhs', val: 2500000 },
    { label: '50 Lakhs', val: 5000000 },
    { label: '1 Crore', val: 10000000 },
  ];

  return (
    <div id="emi-calculator-tool" className="space-y-6">
      {/* Inputs Card */}
      <div className="p-6 sm:p-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        {/* Loan Principal */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t.principal}
            </label>
            <span className="text-xs font-bold text-red-600 dark:text-red-400">
              {formatNepaliCurrency(principal)}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
              Rs.
            </span>
            <input
              id="emi-principal-input"
              type="number"
              min="0"
              step="10000"
              value={principalStr}
              onChange={(e) => setPrincipalStr(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2.5">
            {loanPresets.map((p) => (
              <button
                key={p.val}
                id={`emi-preset-${p.val}`}
                onClick={() => setPrincipalStr(String(p.val))}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rate & Tenure Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Interest Rate */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {t.interestRate}
            </label>
            <div className="relative">
              <input
                id="emi-rate-input"
                type="number"
                min="0"
                max="40"
                step="0.1"
                value={rateStr}
                onChange={(e) => setRateStr(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
                %
              </span>
            </div>
          </div>

          {/* Loan Duration in Years */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {t.loanTenure} ({language === 'ne' ? 'वर्ष' : 'Years'})
            </label>
            <div className="relative">
              <input
                id="emi-tenure-input"
                type="number"
                min="1"
                max="50"
                step="1"
                value={tenureYearsStr}
                onChange={(e) => setTenureYearsStr(e.target.value)}
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-semibold">
                {language === 'ne' ? `${toNepaliDigits(tenureYears * 12)} महिना` : `${tenureYears * 12} Months`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* EMI Results Hero Card */}
      <div
        id="emi-result-card"
        className="p-5 sm:p-7 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl relative overflow-hidden"
      >
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-100">
          {t.monthlyEmi}
        </span>

        {/* Big Monthly EMI */}
        <div className="my-2">
          <div className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-baseline flex-wrap">
            <span>{formatNepaliCurrency(result.monthlyEmi)}</span>
            <span className="text-xs sm:text-sm font-semibold text-red-100 ml-2">
              {language === 'ne' ? '/ महिना' : '/ month'}
            </span>
          </div>
        </div>

        {/* Visual Ratio Bar (Principal vs Interest) */}
        <div className="mt-3.5 mb-3.5">
          <div className="h-3 w-full bg-black/20 backdrop-blur-sm rounded-full overflow-hidden flex p-0.5 border border-white/20">
            <div
              style={{ width: `${principalPercentage}%` }}
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              title={`Principal: ${principalPercentage}%`}
            />
            <div
              style={{ width: `${interestPercentage}%` }}
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              title={`Interest: ${interestPercentage}%`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-blue-100 mt-1.5 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{language === 'ne' ? 'साँवा' : 'Principal'}: {principalPercentage}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{language === 'ne' ? 'ब्याज' : 'Interest'}: {interestPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Breakdown Pillars */}
        <div className="pt-3 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs sm:text-sm">
          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-blue-100 text-[11px] sm:text-xs font-medium">{language === 'ne' ? 'साँवा ऋण रकम' : 'Principal Amount'}</div>
            <div className="font-bold text-white text-sm sm:text-base mt-0.5">
              {formatNepaliCurrency(result.principalAmount)}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-blue-100 text-[11px] sm:text-xs font-medium">{t.totalInterest}</div>
            <div className="font-bold text-amber-300 text-sm sm:text-base mt-0.5">
              {formatNepaliCurrency(result.totalInterest)}
            </div>
          </div>

          <div className="p-3 sm:p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="text-blue-100 text-[11px] sm:text-xs font-medium">{t.totalPayment}</div>
            <div className="font-bold text-white text-sm sm:text-base mt-0.5">
              {formatNepaliCurrency(result.totalPayment)}
            </div>
          </div>
        </div>
      </div>

      {/* Yearly Amortization Schedule Toggle */}
      {result.yearlyBreakdown.length > 0 && (
        <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <button
            id="emi-schedule-toggle-btn"
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full p-5 flex items-center justify-between font-bold text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-red-500" />
              <span>{t.amortization}</span>
            </div>
            {showSchedule ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showSchedule && (
            <div className="overflow-x-auto border-t border-slate-200 dark:border-slate-800 p-3">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold uppercase rounded-xl">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">{t.year}</th>
                    <th className="py-2.5 px-3">{language === 'ne' ? 'साँवा भुक्तानी' : 'Principal Paid'}</th>
                    <th className="py-2.5 px-3">{language === 'ne' ? 'ब्याज भुक्तानी' : 'Interest Paid'}</th>
                    <th className="py-2.5 px-3 rounded-r-lg">{language === 'ne' ? 'बाँकी साँवा' : 'Balance'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.yearlyBreakdown.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {language === 'ne' ? `वर्ष ${toNepaliDigits(row.year)}` : `Yr ${row.year}`}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                        {formatNepaliCurrency(row.principalPaid)}
                      </td>
                      <td className="py-2.5 px-3 text-red-600 dark:text-red-400 font-semibold">
                        {formatNepaliCurrency(row.interestPaid)}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100">
                        {formatNepaliCurrency(row.remainingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
