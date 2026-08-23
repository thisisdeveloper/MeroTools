import React, { useState, useMemo } from 'react';
import { Language } from '../../types';
import {
  UNIT_CATEGORIES,
  UnitCategory,
  convertUnits,
} from '../../calculations/unitConverter';
import {
  Ruler,
  Scale,
  Droplets,
  Thermometer,
  Gauge,
  HardDrive,
  Sparkles,
  ArrowRightLeft,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

interface UnitConverterProps {
  language: Language;
}

export const UnitConverter: React.FC<UnitConverterProps> = ({ language }) => {
  const isNe = language === 'ne';

  const [category, setCategory] = useState<UnitCategory>('weight');
  const currentCategoryConfig = useMemo(
    () => UNIT_CATEGORIES.find((c) => c.id === category) || UNIT_CATEGORIES[0],
    [category]
  );

  const [fromUnitId, setFromUnitId] = useState<string>('tola');
  const [toUnitId, setToUnitId] = useState<string>('g');
  const [inputValue, setInputValue] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  // Switch category
  const handleCategorySelect = (catId: UnitCategory) => {
    setCategory(catId);
    const cat = UNIT_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.units.length >= 2) {
      setFromUnitId(cat.units[0].id);
      setToUnitId(cat.units[1].id);
    }
  };

  // Swap units
  const handleSwap = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  // Convert
  const convertedResult = useMemo(() => {
    return convertUnits(category, fromUnitId, toUnitId, inputValue || 0);
  }, [category, fromUnitId, toUnitId, inputValue]);

  const fromUnitObj = currentCategoryConfig.units.find((u) => u.id === fromUnitId);
  const toUnitObj = currentCategoryConfig.units.find((u) => u.id === toUnitId);

  const handleCopy = () => {
    const text = `${inputValue} ${fromUnitObj?.symbol} = ${convertedResult} ${toUnitObj?.symbol}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryIcon = (id: UnitCategory) => {
    switch (id) {
      case 'length':
        return Ruler;
      case 'weight':
        return Scale;
      case 'volume':
        return Droplets;
      case 'temperature':
        return Thermometer;
      case 'speed':
        return Gauge;
      case 'digital':
        return HardDrive;
      default:
        return Ruler;
    }
  };

  return (
    <div id="unit-converter-tool" className="space-y-6">
      {/* Category Pills Tab Bar */}
      <div className="p-2 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {UNIT_CATEGORIES.map((cat) => {
          const Icon = getCategoryIcon(cat.id);
          const isSelected = category === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isNe ? cat.nameNe.split(' (')[0] : cat.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Converter Input & Selector Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* FROM UNIT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isNe ? 'बाट (From Unit)' : 'From Unit'}
            </label>
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {currentCategoryConfig.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {isNe ? u.nameNe : u.nameEn} ({u.symbol}) {u.isTraditionalNepali ? '🇳🇵' : ''}
                </option>
              ))}
            </select>

            <div className="pt-1">
              <input
                type="number"
                value={inputValue || ''}
                onChange={(e) => setInputValue(Number(e.target.value))}
                placeholder="1"
                className="w-full px-4 py-3 bg-slate-100/70 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 text-lg font-black text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* SWAP BUTTON */}
          <div className="flex justify-center pt-2 md:pt-6">
            <button
              onClick={handleSwap}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-all active:scale-90"
              title="Swap units"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </button>
          </div>

          {/* TO UNIT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isNe ? 'मा (To Unit)' : 'To Unit'}
            </label>
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {currentCategoryConfig.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {isNe ? u.nameNe : u.nameEn} ({u.symbol}) {u.isTraditionalNepali ? '🇳🇵' : ''}
                </option>
              ))}
            </select>

            <div className="pt-1">
              <div className="w-full px-4 py-3 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200/80 dark:border-red-900/60 text-lg font-black text-red-600 dark:text-red-400 truncate flex items-center justify-between">
                <span>{convertedResult}</span>
                <span className="text-xs font-bold text-red-500 ml-2">{toUnitObj?.symbol}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Big Result Card */}
      <div
        id="unit-converter-result-banner"
        className="p-5 sm:p-7 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isNe ? 'इकाइ रूपान्तरण नतिजा' : 'Unit Conversion Formula Result'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1 break-all">
              {inputValue} {fromUnitObj?.symbol} ={' '}
              <span className="text-amber-300">
                {convertedResult} {toUnitObj?.symbol}
              </span>
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5 text-white" />}
            <span>{copied ? (isNe ? 'कपी भयो!' : 'Copied!') : isNe ? 'नतिजा कपी' : 'Copy Result'}</span>
          </button>
        </div>
      </div>

      {/* Quick Reference Equivalent List for Nepali Units */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {isNe ? 'यस श्रेणीका सबै इकाइहरूको तुलनात्मक मान (१ मान बराबर)' : `Quick Equivalents for 1 ${fromUnitObj?.nameEn}`}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          {currentCategoryConfig.units.map((u) => {
            const eq = convertUnits(category, fromUnitId, u.id, 1);
            return (
              <div
                key={u.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isNe ? u.nameNe.split(' (')[0] : u.nameEn}
                </div>
                <div className="text-sm font-extrabold text-slate-800 dark:text-white mt-0.5">
                  {eq} <span className="text-[11px] font-bold text-red-500">{u.symbol}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
