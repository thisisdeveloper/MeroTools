import React, { useState, useEffect } from 'react';
import {
  Coins,
  RefreshCw,
  AlertCircle,
  Calculator,
  Scale,
  Sparkles,
} from 'lucide-react';
import {
  getCachedMetalsData,
  fetchLiveMetalsData,
  calculateMetalPrice,
  METAL_UNITS,
  MetalUnit,
  DATA_SOURCE_FULL_NAME,
} from '../../services/metals';
import { formatNepaliCurrency } from '../../services/forex';
import { toNepaliDigits } from '../../calendar/bsCalendar';
import { GoldSilverData, Language } from '../../types';
import { getTranslation } from '../../i18n/translations';

interface GoldSilverCalculatorProps {
  language: Language;
}

export const GoldSilverCalculator: React.FC<GoldSilverCalculatorProps> = ({
  language,
}) => {
  const t = getTranslation(language);

  const [data, setData] = useState<GoldSilverData | null>(getCachedMetalsData());
  const [isLive, setIsLive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Calculator State
  const [selectedMetal, setSelectedMetal] = useState<'fineGold' | 'tejabiGold' | 'silver'>('fineGold');
  const [weightStr, setWeightStr] = useState<string>('1');
  const [unit, setUnit] = useState<MetalUnit>('tola');

  const handleRefresh = async () => {
    setLoading(true);
    const { data: refreshed, isLive: live } = await fetchLiveMetalsData();
    if (refreshed) setData(refreshed);
    setIsLive(live);
    setLoading(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const weight = parseFloat(weightStr) || 0;
  const currentRatePerTola = data?.rates[selectedMetal].tolaPrice ?? 0;
  const calculated = calculateMetalPrice(currentRatePerTola, weight, unit);

  if (!data) {
    return (
      <div id="gold-silver-tool" className="space-y-6">
        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-3">
          <AlertCircle className="w-8 h-8 mx-auto text-slate-500" />
          <div className="font-bold text-slate-800 dark:text-slate-100">
            {t.ratesUnavailable}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {t.ratesUnavailableDesc}
          </p>
          <button
            id="metals-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'ne' ? 'ताजा गर्नुहोस्' : 'Refresh'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="gold-silver-tool" className="space-y-6">
      {/* Header Info Banner & Disclaimer */}
      <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs sm:text-sm">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-amber-900 dark:text-amber-200">
              {t.indicativeRate}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isLive
                  ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isLive ? t.liveData : t.cachedData}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-600 dark:text-slate-300 text-xs">
              {t.lastUpdated}: {data.lastUpdated}
            </span>
          </div>

          <button
            id="metals-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'ne' ? 'ताजा गर्नुहोस्' : 'Refresh'}</span>
          </button>
        </div>

        <div className="flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300/90">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{t.goldDisclaimer}</span>
        </div>

        <div className="mt-1.5 text-[11px] text-amber-700/80 dark:text-amber-400/70">
          {t.dataSource}: {DATA_SOURCE_FULL_NAME}
        </div>
      </div>

      {/* Bullion Rates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Fine Gold (24K) Card */}
        <div
          id="fine-gold-rate-card"
          className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-500/10 via-slate-50 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border border-amber-200 dark:border-amber-900/60 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                {language === 'ne' ? data.rates.fineGold.nameNe : data.rates.fineGold.name}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-300">
              {data.rates.fineGold.purity}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatNepaliCurrency(data.rates.fineGold.tolaPrice)}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {t.perTola} (11.66g)
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs flex justify-between text-slate-600 dark:text-slate-400">
            <span>10g: <strong>{formatNepaliCurrency(data.rates.fineGold.tenGramPrice)}</strong></span>
            <span>1g: <strong>{formatNepaliCurrency(data.rates.fineGold.gramPrice)}</strong></span>
          </div>
        </div>

        {/* Tejabi Gold (22K) Card */}
        <div
          id="tejabi-gold-rate-card"
          className="p-6 rounded-[2rem] bg-gradient-to-br from-yellow-500/10 via-slate-50 to-white dark:from-yellow-950/40 dark:via-slate-900 dark:to-slate-900 border border-yellow-200 dark:border-yellow-900/60 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-yellow-600" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                {language === 'ne' ? data.rates.tejabiGold.nameNe : data.rates.tejabiGold.name}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/80 text-yellow-800 dark:text-yellow-300">
              {data.rates.tejabiGold.purity}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatNepaliCurrency(data.rates.tejabiGold.tolaPrice)}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {t.perTola} (11.66g)
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs flex justify-between text-slate-600 dark:text-slate-400">
            <span>10g: <strong>{formatNepaliCurrency(data.rates.tejabiGold.tenGramPrice)}</strong></span>
            <span>1g: <strong>{formatNepaliCurrency(data.rates.tejabiGold.gramPrice)}</strong></span>
          </div>
        </div>

        {/* Silver Card */}
        <div
          id="silver-rate-card"
          className="p-6 rounded-[2rem] bg-gradient-to-br from-slate-200/40 via-slate-50 to-white dark:from-slate-800/40 dark:via-slate-900 dark:to-slate-900 border border-slate-300 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                {language === 'ne' ? data.rates.silver.nameNe : data.rates.silver.name}
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
              {data.rates.silver.purity}
            </span>
          </div>

          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
              {formatNepaliCurrency(data.rates.silver.tolaPrice)}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              {t.perTola} (11.66g)
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs flex justify-between text-slate-600 dark:text-slate-400">
            <span>10g: <strong>{formatNepaliCurrency(data.rates.silver.tenGramPrice)}</strong></span>
            <span>1g: <strong>{formatNepaliCurrency(data.rates.silver.gramPrice)}</strong></span>
          </div>
        </div>
      </div>

      {/* Metal Calculator Section */}
      <div className="p-6 sm:p-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-red-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t.metalCalculator}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Metal Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {t.selectMetal}
            </label>
            <select
              id="metal-type-select"
              value={selectedMetal}
              onChange={(e) => setSelectedMetal(e.target.value as any)}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              <option value="fineGold">{language === 'ne' ? 'छापावाल सुन (24K)' : 'Fine Gold (24K)'}</option>
              <option value="tejabiGold">{language === 'ne' ? 'तेजाबी सुन (22K)' : 'Tejabi Gold (22K)'}</option>
              <option value="silver">{language === 'ne' ? 'चाँदी (Silver)' : 'Silver'}</option>
            </select>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {t.weight}
            </label>
            <input
              id="metal-weight-input"
              type="number"
              min="0"
              step="any"
              value={weightStr}
              onChange={(e) => setWeightStr(e.target.value)}
              placeholder="1"
              className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {t.unit}
            </label>
            <select
              id="metal-unit-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value as MetalUnit)}
              className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-red-500 focus:outline-none"
            >
              {METAL_UNITS.map((u) => (
                <option key={u.id} value={u.id}>
                  {language === 'ne' ? u.nameNe : u.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculation Result Card */}
        <div
          id="metal-calc-result-card"
          className="p-6 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl flex flex-wrap items-center justify-between gap-4 mt-3"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-100">
              {t.estimatedValue}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {formatNepaliCurrency(calculated.estimatedPrice)}
            </div>
          </div>

          <div className="text-xs text-blue-100 text-right space-y-1 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div>
              {language === 'ne' ? 'तौल (ग्राममा): ' : 'Weight in Grams: '}
              <strong className="text-white">{calculated.weightInGrams} g</strong>
            </div>
            <div>
              {language === 'ne' ? 'तौल (तोलामा): ' : 'Weight in Tolas: '}
              <strong className="text-white">{calculated.weightInTolas} tola</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
