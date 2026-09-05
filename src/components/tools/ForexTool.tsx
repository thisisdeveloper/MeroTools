import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  ArrowRightLeft,
  Search,
  RefreshCw,
  TrendingUp,
  AlertCircle,
  Building2,
} from 'lucide-react';
import {
  getCachedForexData,
  fetchLiveForexData,
  convertCurrency,
  formatNepaliCurrency,
} from '../../services/forex';
import { ForexData, ForexCurrency, Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface ForexToolProps {
  language: Language;
}

export const ForexTool: React.FC<ForexToolProps> = ({ language }) => {
  const t = getTranslation(language);

  const [forexData, setForexData] = useState<ForexData>(getCachedForexData());
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Converter State
  const [selectedCurrencyIso, setSelectedCurrencyIso] = useState<string>('USD');
  const [amountStr, setAmountStr] = useState<string>('100');
  const [direction, setDirection] = useState<'toNPR' | 'fromNPR'>('toNPR');
  const [rateType, setRateType] = useState<'buy' | 'sell'>('buy');

  const handleRefresh = async () => {
    setLoading(true);
    const updated = await fetchLiveForexData();
    setForexData(updated);
    setLoading(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const selectedCurrency =
    forexData.rates.find((c) => c.iso3 === selectedCurrencyIso) ||
    forexData.rates[0];

  const amount = parseFloat(amountStr) || 0;
  const convertedValue = convertCurrency(amount, selectedCurrency, direction, rateType);

  const filteredRates = forexData.rates.filter(
    (c) =>
      c.iso3.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nameNe.includes(searchTerm)
  );

  return (
    <div id="forex-tool" className="space-y-6">
      {/* Top Banner with NRB Attribution and Refresh */}
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {t.nrbRates}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-500 dark:text-slate-400 text-xs">
            {t.lastUpdated}: {forexData.lastUpdated}
          </span>
        </div>

        <button
          id="forex-refresh-btn"
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{language === 'ne' ? 'ताजा गर्नुहोस्' : 'Refresh'}</span>
        </button>
      </div>

      {/* Interactive Currency Converter Card */}
      <div className="p-6 sm:p-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-red-500" />
            <span>{t.currencyConverter}</span>
          </h2>

          {/* Buy vs Sell Rate Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700">
            <button
              id="forex-buy-mode-btn"
              onClick={() => setRateType('buy')}
              className={`px-3 py-1 rounded-lg transition-all ${
                rateType === 'buy'
                  ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.buyRate}
            </button>
            <button
              id="forex-sell-mode-btn"
              onClick={() => setRateType('sell')}
              className={`px-3 py-1 rounded-lg transition-all ${
                rateType === 'sell'
                  ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t.sellRate}
            </button>
          </div>
        </div>

        {/* Converter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Amount and Currency */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              {direction === 'toNPR'
                ? language === 'ne'
                  ? 'विदेशी मुद्रा रकम'
                  : 'Foreign Amount'
                : language === 'ne'
                ? 'नेपाली रकम (NPR)'
                : 'NPR Amount'}
            </label>
            <div className="flex gap-2">
              <input
                id="forex-calc-amount-input"
                type="number"
                min="0"
                step="any"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="100"
                className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
              {direction === 'toNPR' && (
                <select
                  id="forex-calc-currency-select"
                  value={selectedCurrencyIso}
                  onChange={(e) => setSelectedCurrencyIso(e.target.value)}
                  className="px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {forexData.rates.map((c) => (
                    <option key={c.iso3} value={c.iso3}>
                      {c.flag} {c.iso3}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Direction Swap Button */}
          <div className="sm:col-span-2 flex justify-center py-1">
            <button
              id="forex-swap-direction-btn"
              onClick={() =>
                setDirection(direction === 'toNPR' ? 'fromNPR' : 'toNPR')
              }
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-sm"
              title={t.swap}
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Converted Output preview */}
          <div className="sm:col-span-5 space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              {direction === 'toNPR'
                ? language === 'ne'
                  ? 'बराबर नेपाली रुपैयाँ (NPR)'
                  : 'Equivalent NPR'
                : language === 'ne'
                ? `बराबर ${selectedCurrency.nameNe}`
                : `Equivalent ${selectedCurrency.iso3}`}
            </label>
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 font-black text-slate-900 dark:text-slate-100 text-lg truncate">
              {direction === 'toNPR'
                ? formatNepaliCurrency(convertedValue)
                : `${convertedValue.toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })} ${selectedCurrency.iso3}`}
            </div>
          </div>
        </div>

        {/* Current Conversion Rate Detail */}
        <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 flex items-center justify-between">
          <span>
            1 {selectedCurrency.iso3} ={' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {formatNepaliCurrency(
                (rateType === 'buy' ? selectedCurrency.buy : selectedCurrency.sell) /
                  selectedCurrency.unit
              )}
            </strong>{' '}
            ({rateType === 'buy' ? t.buyRate : t.sellRate})
          </span>
          {selectedCurrency.unit > 1 && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
              *Rate is per {selectedCurrency.unit} units
            </span>
          )}
        </div>
      </div>

      {/* Forex Rates Table with Search */}
      <div className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden space-y-3 p-5 sm:p-6">
        {/* Table Header & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
            {language === 'ne' ? 'सबै विदेशी मुद्रा दरहरू' : 'All Foreign Exchange Rates'}
          </h3>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="forex-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchCurrency}
              className="w-full sm:w-64 pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl p-1">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold uppercase rounded-xl">
              <tr>
                <th className="py-3 px-3.5 rounded-l-xl">Currency</th>
                <th className="py-3 px-3 text-center">{t.perUnit}</th>
                <th className="py-3 px-3.5 text-right">{t.buyRate} (NPR)</th>
                <th className="py-3 px-3.5 text-right rounded-r-xl">{t.sellRate} (NPR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredRates.map((curr) => (
                <tr
                  key={curr.iso3}
                  onClick={() => setSelectedCurrencyIso(curr.iso3)}
                  className={`cursor-pointer hover:bg-red-50/60 dark:hover:bg-slate-800/60 transition-colors ${
                    selectedCurrencyIso === curr.iso3
                      ? 'bg-red-50/80 dark:bg-red-950/30'
                      : ''
                  }`}
                >
                  <td className="py-3 px-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{curr.flag}</span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          {curr.iso3}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {language === 'ne' ? curr.nameNe : curr.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center text-slate-600 dark:text-slate-400 font-semibold">
                    {curr.unit}
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    Rs {curr.buy.toFixed(2)}
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-red-600 dark:text-red-400">
                    Rs {curr.sell.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
