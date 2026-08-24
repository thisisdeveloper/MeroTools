import React, { useState, useMemo } from 'react';
import { Language } from '../../types';
import {
  calculateNeaElectricityBill,
  AmpereCapacity,
  ElectricityBillInput,
} from '../../calculations/electricityBill';
import { formatNepaliCurrency } from '../../services/forex';
import { Zap, Copy, Check, Info, Sparkles, TrendingDown, AlertTriangle } from 'lucide-react';

interface ElectricityBillCalculatorProps {
  language: Language;
}

export const ElectricityBillCalculator: React.FC<ElectricityBillCalculatorProps> = ({ language }) => {
  const isNe = language === 'ne';

  const [unitsConsumed, setUnitsConsumed] = useState<number>(85);
  const [capacity, setCapacity] = useState<AmpereCapacity>('5A');
  const [paymentTiming, setPaymentTiming] = useState<ElectricityBillInput['paymentTiming']>('within_7_days');
  const [copied, setCopied] = useState<boolean>(false);

  const billResult = useMemo(() => {
    return calculateNeaElectricityBill({
      unitsConsumed: Math.max(0, unitsConsumed || 0),
      capacity,
      paymentTiming,
    });
  }, [unitsConsumed, capacity, paymentTiming]);

  const handleCopy = () => {
    const text = `[Mero Tools NEA Electricity Bill]
Units Consumed: ${billResult.unitsConsumed} kWh
Meter Capacity: ${billResult.capacity}
Minimum Demand Charge: NPR ${billResult.minimumCharge}
Energy Charge: NPR ${billResult.energyCharge}
Adjustments (${billResult.discountOrPenaltyPercent}%): NPR ${billResult.discountOrPenaltyAmount}
Total Payable Amount: NPR ${billResult.finalPayableAmount}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="electricity-bill-tool" className="space-y-6">
      {/* Input Parameters Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              {isNe ? 'विद्युत खपत र मिटर क्षमता' : 'Electricity Usage & Meter Capacity'}
            </h2>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900">
            {isNe ? 'NEA महशुल दर' : 'NEA Approved Tariff'}
          </span>
        </div>

        {/* Units Consumed Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>{isNe ? 'खपत भएको युनिट (Units Consumed)' : 'Monthly Electricity Units (kWh)'}</span>
            <span className="text-amber-600 font-bold">kWh (Units)</span>
          </label>
          <input
            id="units-consumed-input"
            type="number"
            value={unitsConsumed || ''}
            onChange={(e) => setUnitsConsumed(Number(e.target.value))}
            placeholder="85"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-base font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
          />
        </div>

        {/* Meter Capacity Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {isNe ? 'मिटर एम्पियर क्षमता (Meter Capacity)' : 'Meter Connection Capacity'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: '5A', labelEn: '5 Ampere (Standard)', labelNe: '५ एम्पियर (घरायसी)' },
              { id: '15A', labelEn: '15 Ampere', labelNe: '१५ एम्पियर' },
              { id: '30A', labelEn: '30 Ampere', labelNe: '३० एम्पियर' },
              { id: '60A', labelEn: '60 Ampere', labelNe: '६० एम्पियर' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCapacity(item.id as AmpereCapacity)}
                className={`py-2.5 px-3 rounded-2xl text-xs font-bold transition-all border ${
                  capacity === item.id
                    ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {isNe ? item.labelNe : item.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Timing Discount/Rebate */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {isNe ? 'बिल भुक्तानी समय (छुट वा जरिवाना)' : 'Payment Timeline (Rebate / Late Fine)'}
          </label>
          <select
            value={paymentTiming}
            onChange={(e) => setPaymentTiming(e.target.value as ElectricityBillInput['paymentTiming'])}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 dark:text-white"
          >
            <option value="within_7_days">
              {isNe ? '७ दिन भित्र (३% छुट प्राप्त)' : 'Within 7 Days (3% Early Rebate)'}
            </option>
            <option value="8_to_15_days">
              {isNe ? '८ देखि १५ दिन सम्म (नियमित महशुल)' : '8 to 15 Days (Regular Bill - 0%)'}
            </option>
            <option value="16_to_22_days">
              {isNe ? '१६ देखि २२ दिन सम्म (५% जरिवाना)' : '16 to 22 Days (5% Late Fine)'}
            </option>
            <option value="23_to_30_days">
              {isNe ? '२३ देखि ३० दिन सम्म (१०% जरिवाना)' : '23 to 30 Days (10% Late Fine)'}
            </option>
            <option value="after_30_days">
              {isNe ? '३० दिन पछि (२५% जरिवाना)' : 'After 30 Days (25% Heavy Penalty)'}
            </option>
          </select>
        </div>
      </div>

      {/* Bill Results Card */}
      <div
        id="electricity-bill-result-card"
        className="p-5 sm:p-7 rounded-[2rem] bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-amber-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isNe ? 'कुल तिर्नुपर्ने बिजुली महशुल' : 'Total Payable Electricity Bill'}
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white mt-1 leading-tight">
              {formatNepaliCurrency(billResult.finalPayableAmount)}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isNe ? 'कपी भयो!' : 'Copied!') : isNe ? 'बिल कपी' : 'Copy Bill'}</span>
          </button>
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/15">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-amber-100 font-medium">
              {isNe ? 'न्यूनतम डिमान्ड शुल्क:' : 'Minimum Charge:'}
            </span>
            <div className="text-lg font-extrabold text-white mt-0.5">
              रु. {billResult.minimumCharge}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-amber-100 font-medium">
              {isNe ? 'युनिट ऊर्जा शुल्क:' : 'Energy Charge:'}
            </span>
            <div className="text-lg font-extrabold text-white mt-0.5">
              रु. {billResult.energyCharge}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-amber-100 font-medium">
              {billResult.discountOrPenaltyPercent < 0
                ? isNe ? 'छुट (Rebate):' : 'Early Rebate:'
                : isNe ? 'जरिवाना (Fine):' : 'Late Fine:'}
            </span>
            <div
              className={`text-lg font-extrabold mt-0.5 ${
                billResult.discountOrPenaltyPercent < 0 ? 'text-emerald-300' : 'text-amber-200'
              }`}
            >
              {billResult.discountOrPenaltyAmount < 0 ? '-' : '+'} रु.{' '}
              {Math.abs(billResult.discountOrPenaltyAmount)}
            </div>
          </div>
        </div>
      </div>

      {/* Slabs Consumption Breakdown */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
          {isNe ? 'युनिट स्ल्याब अनुसार हिसाब' : 'Tariff Slabs Breakdown'}
        </h3>

        <div className="space-y-2 text-xs">
          {billResult.slabs.map((slab, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  {isNe ? slab.slabRangeNe : slab.slabRange}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {slab.unitsInSlab} {isNe ? 'युनिट' : 'units'} × रु. {slab.ratePerUnit}/unit
                </div>
              </div>
              <div className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">
                रु. {slab.cost}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
