import React, { useState } from 'react';
import {
  Receipt,
  PlusCircle,
  MinusCircle,
  Copy,
  Check,
  Percent,
} from 'lucide-react';
import { calculateVat, DEFAULT_VAT_RATE } from '../../calculations/vat';
import { formatNepaliCurrency } from '../../services/forex';
import { toNepaliDigits } from '../../calendar/bsCalendar';
import { Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface VatCalculatorProps {
  language: Language;
}

export const VatCalculator: React.FC<VatCalculatorProps> = ({ language }) => {
  const t = getTranslation(language);

  const [amountStr, setAmountStr] = useState<string>('10000');
  const [isAddingVat, setIsAddingVat] = useState<boolean>(true);
  const [vatRateStr, setVatRateStr] = useState<string>(String(DEFAULT_VAT_RATE));
  const [copied, setCopied] = useState(false);

  const amount = parseFloat(amountStr) || 0;
  const rate = parseFloat(vatRateStr) || DEFAULT_VAT_RATE;

  const result = calculateVat(amount, rate, isAddingVat);

  const presets = [1000, 5000, 10000, 25000, 50000, 100000];

  const handleCopySummary = () => {
    const summary =
      language === 'ne'
        ? `भ्याट हिसाब (VAT Calculation):\nरकम: ${formatNepaliCurrency(result.amount)}\nभ्याट प्रकार: ${
            result.isAddingVat ? 'भ्याट जोड्ने (+१३%)' : 'भ्याट हटाउने (-१३%)'
          }\nकरयोग्य रकम: ${formatNepaliCurrency(result.taxableAmount)}\nभ्याट (${result.rate}%): ${formatNepaliCurrency(
            result.vatAmount
          )}\nकुल जम्मा: ${formatNepaliCurrency(result.totalAmount)}`
        : `VAT Calculation (${result.rate}%):\nAmount: ${formatNepaliCurrency(result.amount)}\nType: ${
            result.isAddingVat ? 'Add VAT (Exclusive)' : 'Remove VAT (Inclusive)'
          }\nTaxable Subtotal: ${formatNepaliCurrency(result.taxableAmount)}\nVAT (${
            result.rate
          }%): ${formatNepaliCurrency(result.vatAmount)}\nTotal: ${formatNepaliCurrency(result.totalAmount)}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="vat-calculator-tool" className="space-y-6">
      {/* Add / Remove VAT Mode Pills */}
      <div className="bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
        <button
          id="vat-mode-add-btn"
          onClick={() => setIsAddingVat(true)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            isAddingVat
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.addVat}</span>
        </button>

        <button
          id="vat-mode-remove-btn"
          onClick={() => setIsAddingVat(false)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
            !isAddingVat
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <MinusCircle className="w-4 h-4" />
          <span>{t.removeVat}</span>
        </button>
      </div>

      {/* Input Card */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            {language === 'ne' ? 'रकम (नेपाली रुपैयाँ NPR)' : 'Amount (NPR)'}
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">
              Rs.
            </span>
            <input
              id="vat-amount-input"
              type="number"
              min="0"
              step="any"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="10000"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-lg font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
            {language === 'ne' ? 'द्रुत रकम:' : 'Quick:'}
          </span>
          {presets.map((val) => (
            <button
              key={val}
              id={`vat-preset-${val}`}
              onClick={() => setAmountStr(String(val))}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {val >= 100000
                ? '1 Lakh'
                : val >= 1000
                ? `${val / 1000}k`
                : val}
            </button>
          ))}
        </div>

        {/* VAT Rate setting */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-red-500" />
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {t.vatRate}
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="vat-rate-input"
              type="number"
              min="0"
              max="100"
              value={vatRateStr}
              onChange={(e) => setVatRateStr(e.target.value)}
              className="w-16 px-2.5 py-1 text-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
            <span className="text-xs font-semibold text-slate-500">%</span>
            {rate !== DEFAULT_VAT_RATE && (
              <button
                id="vat-rate-reset-btn"
                onClick={() => setVatRateStr(String(DEFAULT_VAT_RATE))}
                className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline ml-1"
              >
                (Reset 13%)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice / VAT Breakdown Receipt Card */}
      <div
        id="vat-receipt-card"
        className="p-5 sm:p-7 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-red-200" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-100">
              {language === 'ne' ? 'भ्याट हिसाब विवरण' : 'VAT Invoice Breakdown'}
            </span>
          </div>
          <button
            id="vat-copy-btn"
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span className="text-emerald-200">{t.copied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white/80" />
                <span>{t.copy}</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-2.5 font-mono text-sm">
          {/* Subtotal */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-between text-white">
            <span className="font-sans text-[11px] sm:text-sm text-blue-100 font-medium">
              {language === 'ne' ? 'कर बाहेक रकम (Subtotal):' : 'Taxable Subtotal:'}
            </span>
            <span className="font-bold text-white text-sm sm:text-base">
              {formatNepaliCurrency(result.taxableAmount)}
            </span>
          </div>

          {/* VAT Amount */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 flex items-center justify-between text-white">
            <span className="font-sans text-[11px] sm:text-sm flex items-center gap-1 text-blue-100 font-medium">
              <span>{language === 'ne' ? `भ्याट (VAT @ ${result.rate}%):` : `VAT (${result.rate}%):`}</span>
            </span>
            <span className="font-bold text-amber-300 text-sm sm:text-base">
              + {formatNepaliCurrency(result.vatAmount)}
            </span>
          </div>

          {/* Total Amount Divider */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/20 border border-white/20 flex items-center justify-between mt-2">
            <span className="font-sans font-bold text-white text-xs sm:text-base">
              {language === 'ne' ? 'कुल जम्मा रकम (Total):' : 'Grand Total:'}
            </span>
            <span className="text-xl sm:text-3xl font-black text-white">
              {formatNepaliCurrency(result.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
