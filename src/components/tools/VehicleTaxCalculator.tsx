import React, { useState, useMemo } from 'react';
import { Language } from '../../types';
import {
  calculateVehicleTax,
  VEHICLE_TAX_SCHEDULES,
  VehicleCategory,
} from '../../calculations/vehicleTax';
import { formatNepaliCurrency } from '../../services/forex';
import { Car, Bike, Zap, Shield, Sparkles, Copy, Check, AlertCircle } from 'lucide-react';

interface VehicleTaxCalculatorProps {
  language: Language;
}

export const VehicleTaxCalculator: React.FC<VehicleTaxCalculatorProps> = ({ language }) => {
  const isNe = language === 'ne';

  const [category, setCategory] = useState<VehicleCategory>('2wheeler');
  const [engineCapacityId, setEngineCapacityId] = useState<string>('2w_150');
  const [overdueYears, setOverdueYears] = useState<number>(0);
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);
  const [includePollution, setIncludePollution] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // When category changes, reset selected engine capacity
  const handleCategoryChange = (newCat: VehicleCategory) => {
    setCategory(newCat);
    const schedules = VEHICLE_TAX_SCHEDULES[newCat];
    if (schedules && schedules.length > 0) {
      setEngineCapacityId(schedules[0].id);
    }
  };

  const taxResult = useMemo(() => {
    return calculateVehicleTax({
      category,
      engineCapacityId,
      overdueYears: Math.max(0, overdueYears || 0),
      includeThirdPartyInsurance: includeInsurance,
      includePollutionRenewal: includePollution,
    });
  }, [category, engineCapacityId, overdueYears, includeInsurance, includePollution]);

  const handleCopy = () => {
    const text = `[Mero Tools Nepal Vehicle Tax Summary]
Category: ${category}
Engine Capacity: ${taxResult.selectedOptionLabelEn}
Annual Road Tax: NPR ${taxResult.annualTax.toLocaleString()}
Bluebook Renewal Fee: NPR ${taxResult.renewalFee.toLocaleString()}
Late Penalty Fee: NPR ${taxResult.latePenaltyFee.toLocaleString()}
Third Party Insurance: NPR ${taxResult.insuranceFee.toLocaleString()}
Pollution Sticker: NPR ${taxResult.pollutionFee.toLocaleString()}
Total Estimated Payable: NPR ${taxResult.totalPayable.toLocaleString()}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="vehicle-tax-tool" className="space-y-6">
      {/* Configuration Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-red-600" />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              {isNe ? 'सवारी साधनको विवरण छान्नुहोस्' : 'Vehicle Type & Engine Specifications'}
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900">
            {isNe ? 'प्रदेश सरकार दर' : 'Provincial Transport Tax'}
          </span>
        </div>

        {/* Category Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: '2wheeler', labelEn: 'Motorbike / Scooter', labelNe: 'मोटरसाइकल / स्कुटर', icon: Bike },
            { id: '2wheeler_ev', labelEn: 'Electric 2W (EV)', labelNe: 'विद्युतीय २-पाङ्ग्रे (EV)', icon: Zap },
            { id: '4wheeler_car', labelEn: 'Car / Jeep / Van', labelNe: 'कार / जीप / भ्यान', icon: Car },
            { id: '4wheeler_ev', labelEn: 'Electric Car (EV)', labelNe: 'विद्युतीय कार (EV)', icon: Zap },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = category === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleCategoryChange(item.id as VehicleCategory)}
                className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 text-center transition-all border ${
                  isSelected
                    ? 'border-red-500 bg-red-50/80 dark:bg-red-950/40 text-red-600 dark:text-red-400 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold">{isNe ? item.labelNe : item.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Engine Capacity Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {isNe ? 'इन्जिन क्षमता (CC वा किलोवाट)' : 'Engine Capacity / Power Output'}
          </label>
          <select
            value={engineCapacityId}
            onChange={(e) => setEngineCapacityId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
          >
            {VEHICLE_TAX_SCHEDULES[category]?.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {isNe ? sch.labelNe : sch.labelEn} (कर: रु. {sch.annualTax.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Overdue Years & Add-ons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {isNe ? 'नवीकरण म्याद नाघेको वर्ष (Late Penalty)' : 'Overdue Renewal (Years Missed)'}
            </label>
            <select
              value={overdueYears}
              onChange={(e) => setOverdueYears(Number(e.target.value))}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
            >
              <option value={0}>{isNe ? 'समयमै नवीकरण (० जरिवाना)' : 'On-time Renewal (0 Fine)'}</option>
              <option value={1}>{isNe ? '१ वर्ष नाघेको' : '1 Year Overdue'}</option>
              <option value={2}>{isNe ? '२ वर्ष नाघेको' : '2 Years Overdue'}</option>
              <option value={3}>{isNe ? '३ वर्ष नाघेको' : '3 Years Overdue'}</option>
              <option value={4}>{isNe ? '४ वर्ष नाघेको' : '4 Years Overdue'}</option>
              <option value={5}>{isNe ? '५ वर्ष नाघेको' : '5 Years Overdue'}</option>
            </select>
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInsurance}
                onChange={(e) => setIncludeInsurance(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span>{isNe ? 'तेस्रो पक्ष बीमा (Third Party Insurance)' : 'Include 3rd Party Insurance'}</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={includePollution}
                onChange={(e) => setIncludePollution(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span>{isNe ? 'प्रदूषण जाँच (Green Sticker Test)' : 'Include Pollution Sticker'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Result Card */}
      <div
        id="vehicle-tax-result-card"
        className="p-5 sm:p-7 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isNe ? 'अनुमानित कुल सवारी कर तथा खर्च' : 'Total Estimated Renewal & Tax'}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1 leading-tight">
              {formatNepaliCurrency(taxResult.totalPayable)}
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

        {/* 4-Item Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-white/15">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-red-100 font-medium">
              {isNe ? 'सवारी कर (Annual Tax):' : 'Annual Road Tax:'}
            </span>
            <div className="text-base font-extrabold text-white mt-0.5">
              रु. {taxResult.annualTax.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-red-100 font-medium">
              {isNe ? 'नवीकरण दस्तुर:' : 'Renewal Fee:'}
            </span>
            <div className="text-base font-extrabold text-white mt-0.5">
              रु. {taxResult.renewalFee.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-red-100 font-medium">
              {isNe ? 'तेस्रो पक्ष बीमा:' : 'Insurance (approx):'}
            </span>
            <div className="text-base font-extrabold text-emerald-300 mt-0.5">
              रु. {taxResult.insuranceFee.toLocaleString()}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-red-100 font-medium">
              {isNe ? 'ढिलाइ जरिवाना:' : 'Late Penalty:'}
            </span>
            <div className="text-base font-extrabold text-amber-300 mt-0.5">
              रु. {taxResult.latePenaltyFee.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
