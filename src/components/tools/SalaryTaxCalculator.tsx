import React, { useState, useMemo } from 'react';
import { Language } from '../../types';
import { calculateSalaryTax, SalaryTaxInput } from '../../calculations/salaryTax';
import { formatNepaliCurrency } from '../../services/forex';
import { Calculator, Sparkles, Copy, Check, Info, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface SalaryTaxCalculatorProps {
  language: Language;
}

export const SalaryTaxCalculator: React.FC<SalaryTaxCalculatorProps> = ({ language }) => {
  const isNe = language === 'ne';

  // Input states
  const [status, setStatus] = useState<'single' | 'married'>('single');
  const [monthlySalary, setMonthlySalary] = useState<number>(60000);
  const [bonusMonths, setBonusMonths] = useState<number>(1);
  const [otherAllowancesMonthly, setOtherAllowancesMonthly] = useState<number>(0);
  const [isSsfEnrolled, setIsSsfEnrolled] = useState<boolean>(true);
  const [epfMonthly, setEpfMonthly] = useState<number>(0);
  const [citMonthly, setCitMonthly] = useState<number>(0);
  const [lifeInsuranceAnnual, setLifeInsuranceAnnual] = useState<number>(40000);
  const [healthInsuranceAnnual, setHealthInsuranceAnnual] = useState<number>(0);
  const [showAdvancedDeductions, setShowAdvancedDeductions] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Compute Tax
  const taxResult = useMemo(() => {
    const input: SalaryTaxInput = {
      status,
      monthlySalary: Math.max(0, monthlySalary || 0),
      bonusMonths: Math.max(0, bonusMonths || 0),
      otherAllowancesMonthly: Math.max(0, otherAllowancesMonthly || 0),
      isSsfEnrolled,
      epfMonthly: Math.max(0, epfMonthly || 0),
      citMonthly: Math.max(0, citMonthly || 0),
      lifeInsuranceAnnual: Math.max(0, lifeInsuranceAnnual || 0),
      healthInsuranceAnnual: Math.max(0, healthInsuranceAnnual || 0),
      remoteAreaDeductionAnnual: 0,
    };
    return calculateSalaryTax(input);
  }, [
    status,
    monthlySalary,
    bonusMonths,
    otherAllowancesMonthly,
    isSsfEnrolled,
    epfMonthly,
    citMonthly,
    lifeInsuranceAnnual,
    healthInsuranceAnnual,
  ]);

  const handleCopy = () => {
    const summaryText = `[MeroTools Salary & Tax Summary]
Status: ${status === 'married' ? 'Married (दम्पती)' : 'Single (व्यक्तिगत)'}
Monthly Gross Salary: NPR ${taxResult.grossMonthlyIncome.toLocaleString()}
Annual Gross Income: NPR ${taxResult.grossAnnualIncome.toLocaleString()}
Annual Allowable Deductions: NPR ${taxResult.totalAnnualDeductions.toLocaleString()}
Net Taxable Income: NPR ${taxResult.netTaxableIncome.toLocaleString()}
Total Annual Tax: NPR ${taxResult.totalAnnualTax.toLocaleString()} (Effective: ${taxResult.effectiveTaxRate}%)
Monthly Tax Deduction: NPR ${taxResult.totalMonthlyTax.toLocaleString()}
Net Monthly In-Hand Salary: NPR ${taxResult.netMonthlyTakeHome.toLocaleString()}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="salary-tax-tool" className="space-y-6">
      {/* Input Configuration Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-red-600" />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              {isNe ? 'तलब तथा कर विवरण भर्नुहोस्' : 'Salary & Tax Parameters'}
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900">
            {isNe ? 'नेपाल आर्थिक ऐन' : 'Nepal IRD Slabs'}
          </span>
        </div>

        {/* Marital Status Selector Tabs */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {isNe ? 'कर स्थिति (Marital Status)' : 'Tax Assessment Status'}
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button
              onClick={() => setStatus('single')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                status === 'single'
                  ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isNe ? 'व्यक्तिगत / अविवाहित (Single - 5L Base)' : 'Single / Individual (5L Base)'}
            </button>
            <button
              onClick={() => setStatus('married')}
              className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                status === 'married'
                  ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isNe ? 'दम्पती / विवाहित (Couple - 6L Base)' : 'Married / Couple (6L Base)'}
            </button>
          </div>
        </div>

        {/* Monthly Base Salary Input */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>{isNe ? 'मासिक आधारभूत तलब (Monthly Salary)' : 'Monthly Basic Salary'}</span>
              <span className="text-red-600 font-bold">NPR</span>
            </label>
            <input
              type="number"
              value={monthlySalary || ''}
              onChange={(e) => setMonthlySalary(Number(e.target.value))}
              placeholder="60000"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Bonus / Festival Months */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>{isNe ? 'दशैं / चाडपर्व बोनस (महिना)' : 'Festival / Dashain Bonus'}</span>
              <span className="text-slate-400 font-medium">{isNe ? 'महिना तलब' : 'Month Salary'}</span>
            </label>
            <select
              value={bonusMonths}
              onChange={(e) => setBonusMonths(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
            >
              <option value={0}>{isNe ? 'बोनस छैन (० महिना)' : 'No Bonus (0 Month)'}</option>
              <option value={1}>{isNe ? '१ महिना (दशैं खर्च)' : '1 Month (Standard Dashain)'}</option>
              <option value={2}>{isNe ? '२ महिना बोनस' : '2 Months Bonus'}</option>
              <option value={3}>{isNe ? '३ महिना बोनस' : '3 Months Bonus'}</option>
            </select>
          </div>
        </div>

        {/* SSF Enrolled Checkbox */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isNe ? 'सामाजिक सुरक्षा कोष (SSF) मा आबद्ध?' : 'Enrolled in Social Security Fund (SSF)?'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isNe
                ? 'SSF मा आबद्ध कर्मचारीले पहिलो स्ल्याबमा १% सामाजिक सुरक्षा कर तिर्नु पर्दैन।'
                : 'SSF enrolled individuals are exempt from the 1% Social Security Tax on the 1st bracket.'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={isSsfEnrolled}
            onChange={(e) => setIsSsfEnrolled(e.target.checked)}
            className="w-5 h-5 text-red-600 rounded-lg focus:ring-red-500 cursor-pointer"
          />
        </div>

        {/* Advanced Deductions Toggle */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setShowAdvancedDeductions(!showAdvancedDeductions)}
            className="flex items-center justify-between w-full text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <span>{isNe ? 'थप छुट तथा कटौतीहरू (CIT, EPF, बीमा)' : 'Additional Deductions (CIT, EPF, Insurance)'}</span>
            {showAdvancedDeductions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvancedDeductions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isNe ? 'नागरिक लगानी कोष (CIT) मासिक' : 'CIT Monthly Contribution'}
                </label>
                <input
                  type="number"
                  value={citMonthly || ''}
                  onChange={(e) => setCitMonthly(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isNe ? 'कर्मचारी सञ्चय कोष (EPF) मासिक' : 'EPF Monthly Contribution'}
                </label>
                <input
                  type="number"
                  value={epfMonthly || ''}
                  onChange={(e) => setEpfMonthly(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isNe ? 'जीवन बीमा प्रिमियम वार्षिक (अधिकतम रु. ४०,०००)' : 'Annual Life Insurance (Max 40k)'}
                </label>
                <input
                  type="number"
                  value={lifeInsuranceAnnual || ''}
                  onChange={(e) => setLifeInsuranceAnnual(Number(e.target.value))}
                  placeholder="40000"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {isNe ? 'स्वास्थ्य बीमा वार्षिक (अधिकतम रु. २०,०००)' : 'Annual Health Insurance (Max 20k)'}
                </label>
                <input
                  type="number"
                  value={healthInsuranceAnnual || ''}
                  onChange={(e) => setHealthInsuranceAnnual(Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Salary & Tax Results Card */}
      <div
        id="salary-tax-results-card"
        className="p-5 sm:p-7 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isNe ? 'मासिक हातमा पर्ने खुद तलब (Net In-Hand Pay)' : 'Net Monthly Take-Home Pay'}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1 leading-tight">
              {formatNepaliCurrency(taxResult.netMonthlyTakeHome)}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isNe ? 'कपी भयो!' : 'Copied!') : isNe ? 'विवरण कपी' : 'Copy'}</span>
          </button>
        </div>

        {/* 2-Column Split: Monthly Tax vs Annual Tax */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/15">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-red-100 font-medium">
              {isNe ? 'मासिक आयकर कट्टी:' : 'Monthly Tax Deduction:'}
            </span>
            <div className="text-lg font-extrabold text-amber-300 mt-0.5">
              {formatNepaliCurrency(taxResult.totalMonthlyTax)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-red-100 font-medium">
              {isNe ? 'वार्षिक कुल आयकर:' : 'Total Annual Tax:'}
            </span>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {formatNepaliCurrency(taxResult.totalAnnualTax)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-red-100 font-medium">
              {isNe ? 'प्रभावकारी कर दर:' : 'Effective Tax Rate:'}
            </span>
            <div className="text-lg font-extrabold text-emerald-300 mt-0.5">
              {taxResult.effectiveTaxRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Tax Slabs Breakdown Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
          {isNe ? 'आयकर स्ल्याब अनुसार गणना विवरण' : 'Tax Slab Breakdown (Finance Act)'}
        </h3>

        <div className="space-y-2 font-mono text-xs">
          {taxResult.brackets.map((b, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between font-sans"
            >
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                  {isNe ? b.slabNameNe : b.slabName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isNe ? `करयोग्य रकम: रु. ${b.taxableInSlab.toLocaleString()}` : `Taxable: NPR ${b.taxableInSlab.toLocaleString()}`}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mr-2">
                  {b.ratePercent}%
                </span>
                <span className="font-bold text-red-600 dark:text-red-400">
                  रु. {b.taxAmount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
