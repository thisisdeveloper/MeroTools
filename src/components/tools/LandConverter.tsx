import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Layers,
  Calculator,
  RotateCcw,
  Copy,
  Check,
  Building,
  TreePine,
  DollarSign,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../i18n/translations';
import {
  convertFromSqFeet,
  ropaniToSqFeet,
  bighaToSqFeet,
  SQ_FT_PER_ROPANI,
  SQ_FT_PER_AANA,
  SQ_FT_PER_PAISA,
  SQ_FT_PER_DAAM,
  SQ_FT_PER_BIGHA,
  SQ_FT_PER_KATTHA,
  SQ_FT_PER_DHUR,
  SQ_FT_PER_KANWA,
  SQ_FT_PER_SQ_METER,
  SQ_FT_PER_ACRE,
  SQ_FT_PER_HECTARE,
  SQ_FT_PER_SQ_YARD,
  SQ_FT_PER_SQ_HAAT,
} from '../../calculations/land';
import { formatNepaliCurrency } from '../../services/forex';
import { toNepaliDigits } from '../../calendar/bsCalendar';

interface LandConverterProps {
  language: Language;
}

type InputMode = 'ropani' | 'bigha' | 'single';

const SINGLE_UNITS = [
  { id: 'sqFt', labelEn: 'Square Feet (वर्ग फिट)', labelNe: 'वर्ग फिट (Sq. Ft.)', factor: 1 },
  { id: 'sqM', labelEn: 'Square Meter (वर्ग मिटर)', labelNe: 'वर्ग मिटर (Sq. M.)', factor: SQ_FT_PER_SQ_METER },
  { id: 'aana', labelEn: 'Aana (आना)', labelNe: 'आना (Aana)', factor: SQ_FT_PER_AANA },
  { id: 'ropani', labelEn: 'Ropani (रोपनी)', labelNe: 'रोपनी (Ropani)', factor: SQ_FT_PER_ROPANI },
  { id: 'kattha', labelEn: 'Kattha (कट्ठा)', labelNe: 'कट्ठा (Kattha)', factor: SQ_FT_PER_KATTHA },
  { id: 'bigha', labelEn: 'Bigha (बिघा)', labelNe: 'बिघा (Bigha)', factor: SQ_FT_PER_BIGHA },
  { id: 'dhur', labelEn: 'Dhur (धुर)', labelNe: 'धुर (Dhur)', factor: SQ_FT_PER_DHUR },
  { id: 'paisa', labelEn: 'Paisa (पैसा)', labelNe: 'पैसा (Paisa)', factor: SQ_FT_PER_PAISA },
  { id: 'daam', labelEn: 'Daam (दाम)', labelNe: 'दाम (Daam)', factor: SQ_FT_PER_DAAM },
  { id: 'acre', labelEn: 'Acre (एकर)', labelNe: 'एकर (Acre)', factor: SQ_FT_PER_ACRE },
  { id: 'hectare', labelEn: 'Hectare (हेक्टर)', labelNe: 'हेक्टर (Hectare)', factor: SQ_FT_PER_HECTARE },
  { id: 'sqYd', labelEn: 'Gaj / Sq. Yard (वर्ग गज)', labelNe: 'वर्ग गज (Gaj)', factor: SQ_FT_PER_SQ_YARD },
  { id: 'sqHaat', labelEn: 'Sq. Haat (वर्ग हात)', labelNe: 'वर्ग हात (Sq. Haat)', factor: SQ_FT_PER_SQ_HAAT },
];

export const LandConverter: React.FC<LandConverterProps> = ({ language }) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';

  // Input Mode state
  const [inputMode, setInputMode] = useState<InputMode>('ropani');

  // Ropani System Inputs
  const [ropaniStr, setRopaniStr] = useState<string>('0');
  const [aanaStr, setAanaStr] = useState<string>('4');
  const [paisaStr, setPaisaStr] = useState<string>('0');
  const [daamStr, setDaamStr] = useState<string>('0');

  // Bigha System Inputs
  const [bighaStr, setBighaStr] = useState<string>('0');
  const [katthaStr, setKatthaStr] = useState<string>('10');
  const [dhurStr, setDhurStr] = useState<string>('0');
  const [kanwaStr, setKanwaStr] = useState<string>('0');

  // Single Unit Input
  const [singleValueStr, setSingleValueStr] = useState<string>('1369');
  const [singleUnit, setSingleUnit] = useState<string>('sqFt');

  // Valuation calculation state
  const [enableValuation, setEnableValuation] = useState<boolean>(false);
  const [ratePerUnitStr, setRatePerUnitStr] = useState<string>('3500000');
  const [valuationUnit, setValuationUnit] = useState<string>('aana');

  const [copied, setCopied] = useState<boolean>(false);

  // Compute Total Sq Feet based on active mode
  const totalSqFeet = useMemo(() => {
    if (inputMode === 'ropani') {
      const r = parseFloat(ropaniStr) || 0;
      const a = parseFloat(aanaStr) || 0;
      const p = parseFloat(paisaStr) || 0;
      const d = parseFloat(daamStr) || 0;
      return ropaniToSqFeet(r, a, p, d);
    } else if (inputMode === 'bigha') {
      const b = parseFloat(bighaStr) || 0;
      const k = parseFloat(katthaStr) || 0;
      const dh = parseFloat(dhurStr) || 0;
      const kn = parseFloat(kanwaStr) || 0;
      return bighaToSqFeet(b, k, dh, kn);
    } else {
      const val = parseFloat(singleValueStr) || 0;
      const unitObj = SINGLE_UNITS.find((u) => u.id === singleUnit);
      const factor = unitObj ? unitObj.factor : 1;
      return val * factor;
    }
  }, [inputMode, ropaniStr, aanaStr, paisaStr, daamStr, bighaStr, katthaStr, dhurStr, kanwaStr, singleValueStr, singleUnit]);

  // Derived Conversion Result
  const result = useMemo(() => {
    return convertFromSqFeet(totalSqFeet);
  }, [totalSqFeet]);

  // Valuation Calculation
  const estimatedPrice = useMemo(() => {
    if (!enableValuation) return 0;
    const rate = parseFloat(ratePerUnitStr) || 0;
    if (rate <= 0 || totalSqFeet <= 0) return 0;

    let unitsCount = 0;
    if (valuationUnit === 'aana') unitsCount = totalSqFeet / SQ_FT_PER_AANA;
    else if (valuationUnit === 'ropani') unitsCount = totalSqFeet / SQ_FT_PER_ROPANI;
    else if (valuationUnit === 'kattha') unitsCount = totalSqFeet / SQ_FT_PER_KATTHA;
    else if (valuationUnit === 'bigha') unitsCount = totalSqFeet / SQ_FT_PER_BIGHA;
    else if (valuationUnit === 'dhur') unitsCount = totalSqFeet / SQ_FT_PER_DHUR;
    else if (valuationUnit === 'sqFt') unitsCount = totalSqFeet;
    else if (valuationUnit === 'sqM') unitsCount = totalSqFeet / SQ_FT_PER_SQ_METER;

    return unitsCount * rate;
  }, [enableValuation, ratePerUnitStr, valuationUnit, totalSqFeet]);

  const handleCopy = () => {
    const text = `Nepal Land Area Measurement:
• Ropani System (R-A-P-D): ${result.ropaniSystem.formatted} (${result.ropaniSystem.ropani} Ropani, ${result.ropaniSystem.aana} Aana, ${result.ropaniSystem.paisa} Paisa, ${result.ropaniSystem.daam} Daam)
• Bigha System (B-K-D): ${result.bighaSystem.formatted} (${result.bighaSystem.bigha} Bigha, ${result.bighaSystem.kattha} Kattha, ${result.bighaSystem.dhur} Dhur, ${result.bighaSystem.kanwa} Kanwa)
• Square Feet: ${result.sqFeet.toLocaleString(undefined, { maximumFractionDigits: 2 })} sq. ft.
• Square Meter: ${result.sqMeters.toLocaleString(undefined, { maximumFractionDigits: 2 })} sq. m.
• Acres: ${result.acres.toFixed(4)} acre`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setRopaniStr('0');
    setAanaStr('4');
    setPaisaStr('0');
    setDaamStr('0');
    setBighaStr('0');
    setKatthaStr('10');
    setDhurStr('0');
    setKanwaStr('0');
    setSingleValueStr('1369');
  };

  return (
    <div id="land-converter-tool" className="space-y-6">
      {/* Input Mode Selector Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 gap-1">
        <button
          id="tab-mode-ropani"
          onClick={() => setInputMode('ropani')}
          className={`flex-1 py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all ${
            inputMode === 'ropani'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <TreePine className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">{isNe ? 'पहाड (रोपनी)' : 'Hills (R-A-P)'}</span>
        </button>

        <button
          id="tab-mode-bigha"
          onClick={() => setInputMode('bigha')}
          className={`flex-1 py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all ${
            inputMode === 'bigha'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">{isNe ? 'तराई (बिघा)' : 'Terai (B-K-D)'}</span>
        </button>

        <button
          id="tab-mode-single"
          onClick={() => setInputMode('single')}
          className={`flex-1 py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all ${
            inputMode === 'single'
              ? 'bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">{isNe ? 'एकल एकाइ' : 'Single Unit'}</span>
        </button>
      </div>

      {/* Input Section Card */}
      <div className="p-6 sm:p-7 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Ropani System Inputs */}
        {inputMode === 'ropani' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              {isNe ? 'रोपनी, आना, पैसा, दाम राख्नुहोस्:' : 'Enter Ropani - Aana - Paisa - Daam:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'रोपनी (Ropani)' : 'Ropani'}
                </span>
                <input
                  id="input-ropani"
                  type="number"
                  min="0"
                  value={ropaniStr}
                  onChange={(e) => setRopaniStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'आना (Aana)' : 'Aana (0-15)'}
                </span>
                <input
                  id="input-aana"
                  type="number"
                  min="0"
                  value={aanaStr}
                  onChange={(e) => setAanaStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'पैसा (Paisa)' : 'Paisa (0-3)'}
                </span>
                <input
                  id="input-paisa"
                  type="number"
                  min="0"
                  value={paisaStr}
                  onChange={(e) => setPaisaStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'दाम (Daam)' : 'Daam (0-3.99)'}
                </span>
                <input
                  id="input-daam"
                  type="number"
                  step="0.1"
                  min="0"
                  value={daamStr}
                  onChange={(e) => setDaamStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bigha System Inputs */}
        {inputMode === 'bigha' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              {isNe ? 'बिघा, कट्ठा, धुर, कनवा राख्नुहोस्:' : 'Enter Bigha - Kattha - Dhur - Kanwa:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'बिघा (Bigha)' : 'Bigha'}
                </span>
                <input
                  id="input-bigha"
                  type="number"
                  min="0"
                  value={bighaStr}
                  onChange={(e) => setBighaStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'कट्ठा (Kattha)' : 'Kattha (0-19)'}
                </span>
                <input
                  id="input-kattha"
                  type="number"
                  min="0"
                  value={katthaStr}
                  onChange={(e) => setKatthaStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'धुर (Dhur)' : 'Dhur (0-19)'}
                </span>
                <input
                  id="input-dhur"
                  type="number"
                  min="0"
                  value={dhurStr}
                  onChange={(e) => setDhurStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'कनवा (Kanwa)' : 'Kanwa (0-15.99)'}
                </span>
                <input
                  id="input-kanwa"
                  type="number"
                  step="0.1"
                  min="0"
                  value={kanwaStr}
                  onChange={(e) => setKanwaStr(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Single Unit Input */}
        {inputMode === 'single' && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              {isNe ? 'क्षेत्रफल र एकाइ छान्नुहोस्:' : 'Enter Area & Choose Unit:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'मान (Value)' : 'Value'}
                </span>
                <input
                  id="input-single-val"
                  type="number"
                  step="any"
                  min="0"
                  value={singleValueStr}
                  onChange={(e) => setSingleValueStr(e.target.value)}
                  placeholder="1000"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isNe ? 'एकाइ (Unit)' : 'Unit'}
                </span>
                <select
                  id="select-single-unit"
                  value={singleUnit}
                  onChange={(e) => setSingleUnit(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  {SINGLE_UNITS.map((u) => (
                    <option key={u.id} value={u.id}>
                      {isNe ? u.labelNe : u.labelEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons (Reset & Copy) */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.reset}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.copied : t.copy}</span>
          </button>
        </div>
      </div>

      {/* Primary Result Highlight Banner */}
      <div
        id="land-primary-result-card"
        className="p-6 sm:p-7 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-red-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isNe ? 'कुल क्षेत्रफल (Total Area)' : 'Total Converted Area'}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-1">
              {result.sqFeet.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              <span className="text-lg sm:text-xl font-medium text-red-100 ml-1.5">वर्ग फिट (sq. ft.)</span>
            </div>
            <div className="text-xs text-blue-100 mt-0.5">
              ≈ {result.sqMeters.toLocaleString(undefined, { maximumFractionDigits: 2 })} वर्ग मिटर (sq. m.) • {result.acres.toFixed(4)} एकर (acres)
            </div>
          </div>

          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 min-w-[200px]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-red-100">{isNe ? 'रोपनी ढाँचा:' : 'R-A-P-D:'}</span>
              <strong className="text-white text-sm tracking-wide font-black">
                {isNe ? result.ropaniSystem.formattedNe : result.ropaniSystem.formatted}
              </strong>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-white/10 pt-1.5">
              <span className="text-red-100">{isNe ? 'बिघा ढाँचा:' : 'B-K-D:'}</span>
              <strong className="text-white text-sm tracking-wide font-black">
                {isNe ? result.bighaSystem.formattedNe : result.bighaSystem.formatted}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Detailed Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Ropani System Breakdown Card */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <TreePine className="w-4 h-4 text-emerald-500" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              {isNe ? 'पहाडी प्रणाली (काठमाडौं उपत्यका)' : 'Hilly & Valley System (R-A-P-D)'}
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'रोपनी (Ropani)' : 'Ropani (16 Aana / 5,476 sq. ft.)'}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {isNe ? toNepaliDigits(result.ropaniSystem.ropani) : result.ropaniSystem.ropani}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'आना (Aana)' : 'Aana (4 Paisa / 342.25 sq. ft.)'}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {isNe ? toNepaliDigits(result.ropaniSystem.aana) : result.ropaniSystem.aana}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'पैसा (Paisa)' : 'Paisa (4 Daam / 85.56 sq. ft.)'}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {isNe ? toNepaliDigits(result.ropaniSystem.paisa) : result.ropaniSystem.paisa}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'दाम (Daam)' : 'Daam (21.39 sq. ft.)'}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {isNe ? toNepaliDigits(result.ropaniSystem.daam) : result.ropaniSystem.daam}
              </span>
            </div>
          </div>
        </div>

        {/* Bigha System Breakdown Card */}
        <div className="p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building className="w-4 h-4 text-amber-500" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
              {isNe ? 'तराई / मधेश प्रणाली' : 'Terai / Madhesh System (B-K-D)'}
            </h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'बिघा (Bigha)' : 'Bigha (20 Kattha / 72,900 sq. ft.)'}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {isNe ? toNepaliDigits(result.bighaSystem.bigha) : result.bighaSystem.bigha}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'कट्ठा (Kattha)' : 'Kattha (20 Dhur / 3,645 sq. ft.)'}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {isNe ? toNepaliDigits(result.bighaSystem.kattha) : result.bighaSystem.kattha}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'धुर (Dhur)' : 'Dhur (16 Kanwa / 182.25 sq. ft.)'}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {isNe ? toNepaliDigits(result.bighaSystem.dhur) : result.bighaSystem.dhur}
              </span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                {isNe ? 'कनवा (Kanwa)' : 'Kanwa (11.39 sq. ft.)'}
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                {isNe ? toNepaliDigits(result.bighaSystem.kanwa) : result.bighaSystem.kanwa}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* International & Standard Units Summary */}
      <div className="p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-500" />
          <span>{isNe ? 'अन्तर्राष्ट्रिय तथा अन्य एकाइहरू' : 'International & Standard Equivalents'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-slate-500 dark:text-slate-400 font-medium">{isNe ? 'एकर (Acre)' : 'Acres'}</div>
            <div className="font-black text-slate-800 dark:text-slate-100 text-sm mt-0.5">
              {result.acres.toFixed(4)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-slate-500 dark:text-slate-400 font-medium">{isNe ? 'हेक्टर (Hectare)' : 'Hectares'}</div>
            <div className="font-black text-slate-800 dark:text-slate-100 text-sm mt-0.5">
              {result.hectares.toFixed(4)}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-slate-500 dark:text-slate-400 font-medium">{isNe ? 'वर्ग गज (Sq. Yard)' : 'Sq. Yards (Gaj)'}</div>
            <div className="font-black text-slate-800 dark:text-slate-100 text-sm mt-0.5">
              {result.sqYards.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <div className="text-slate-500 dark:text-slate-400 font-medium">{isNe ? 'वर्ग हात (Sq. Haat)' : 'Sq. Haat'}</div>
            <div className="font-black text-slate-800 dark:text-slate-100 text-sm mt-0.5">
              {result.sqHaat.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </div>
          </div>
        </div>
      </div>

      {/* Optional Land Valuation / Price Calculator */}
      <div className="p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {isNe ? 'जग्गाको मूल्य / मूल्यांकन हिसाब' : 'Land Price & Valuation Calculator'}
            </h3>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={enableValuation}
              onChange={(e) => setEnableValuation(e.target.checked)}
              className="w-4 h-4 accent-red-600 rounded"
            />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              {isNe ? 'सक्रिय गर्नुहोस्' : 'Enable'}
            </span>
          </label>
        </div>

        {enableValuation && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {isNe ? 'प्रति एकाइ दर (Rate in NPR):' : 'Rate (NPR):'}
                </label>
                <input
                  type="number"
                  value={ratePerUnitStr}
                  onChange={(e) => setRatePerUnitStr(e.target.value)}
                  placeholder="3500000"
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  {isNe ? 'दरको एकाइ (Rate Unit):' : 'Per Unit:'}
                </label>
                <select
                  value={valuationUnit}
                  onChange={(e) => setValuationUnit(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="aana">{isNe ? 'प्रति आना (Per Aana)' : 'Per Aana'}</option>
                  <option value="ropani">{isNe ? 'प्रति रोपनी (Per Ropani)' : 'Per Ropani'}</option>
                  <option value="kattha">{isNe ? 'प्रति कट्ठा (Per Kattha)' : 'Per Kattha'}</option>
                  <option value="bigha">{isNe ? 'प्रति बिघा (Per Bigha)' : 'Per Bigha'}</option>
                  <option value="dhur">{isNe ? 'प्रति धुर (Per Dhur)' : 'Per Dhur'}</option>
                  <option value="sqFt">{isNe ? 'प्रति वर्ग फिट (Per Sq. Ft.)' : 'Per Sq. Ft.'}</option>
                  <option value="sqM">{isNe ? 'प्रति वर्ग मिटर (Per Sq. Meter)' : 'Per Sq. Meter'}</option>
                </select>
              </div>
            </div>

            {/* Estimated Total Price Result Banner */}
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">
                  {isNe ? 'अनुमानित कुल जग्गा मूल्य:' : 'Estimated Total Land Valuation:'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                  {formatNepaliCurrency(estimatedPrice)}
                </div>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isNe ? 'क्षेत्रफल अनुसार गणना गरिएको' : 'Calculated proportionally to exact area'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
