import React from 'react';
import {
  Calendar,
  Cake,
  CalendarRange,
  Receipt,
  Landmark,
  Coins,
  DollarSign,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { TodayDateCard } from './TodayDateCard';
import { ToolId, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { getCachedForexData, formatNepaliCurrency } from '../services/forex';
import { getCachedMetalsData } from '../services/metals';

interface HomeViewProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  language,
  onSelectTool,
}) => {
  const t = getTranslation(language);
  const forex = getCachedForexData();
  const metals = getCachedMetalsData();

  const usdRate = forex.rates.find((r) => r.iso3 === 'USD');
  const inrRate = forex.rates.find((r) => r.iso3 === 'INR');
  const audRate = forex.rates.find((r) => r.iso3 === 'AUD');

  const toolsList: {
    id: ToolId;
    title: string;
    desc: string;
    icon: string;
    iconBg: string;
    tag?: string;
  }[] = [
    {
      id: 'nepali-calendar',
      title: t.nepaliCalendarShort,
      desc: language === 'ne' ? 'पात्रो, तिथि र चाडपर्व' : 'Monthly BS calendar & tithi',
      icon: '🗓️',
      iconBg: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
      tag: 'New',
    },
    {
      id: 'public-holidays',
      title: t.publicHolidaysShort,
      desc: language === 'ne' ? 'सार्वजनिक बिदा सूची' : 'Nepal official holidays',
      icon: '🇳🇵',
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      tag: 'New',
    },
    {
      id: 'salary-tax',
      title: t.salaryTaxShort,
      desc: language === 'ne' ? 'आयकर तथा तलब हिसाब' : 'Nepal IRD salary tax calc',
      icon: '💼',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      tag: 'New',
    },
    {
      id: 'electricity-bill',
      title: t.electricityBillShort,
      desc: language === 'ne' ? 'NEA बिजुली महशुल' : 'NEA electricity tariff',
      icon: '⚡',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      tag: 'New',
    },
    {
      id: 'vehicle-tax',
      title: t.vehicleTaxShort,
      desc: language === 'ne' ? 'सवारी कर र नवीकरण' : 'Road tax & renewal fees',
      icon: '🚗',
      iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
      tag: 'New',
    },
    {
      id: 'gpa-calculator',
      title: t.gpaCalculatorShort,
      desc: language === 'ne' ? 'SEE / NEB ग्रेड GPA' : 'SEE & NEB letter grades',
      icon: '🎓',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      tag: 'New',
    },
    {
      id: 'unit-converter',
      title: t.unitConverterShort,
      desc: language === 'ne' ? 'तोला, धार्नी, माना, पाथी' : 'SI & traditional units',
      icon: '⚖️',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
      tag: 'New',
    },
    {
      id: 'date-converter',
      title: t.dateConverterShort,
      desc: language === 'ne' ? 'वि.सं. ↔ सन् मिति' : 'BS to AD & reverse',
      icon: '📅',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      tag: 'Popular',
    },
    {
      id: 'land-converter',
      title: t.landConverterShort,
      desc: language === 'ne' ? 'रोपनी ↔ बिघा ↔ फिट' : 'Ropani & Bigha converter',
      icon: '📐',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      tag: 'Popular',
    },
    {
      id: 'gold-silver',
      title: t.goldSilverShort,
      desc: language === 'ne' ? 'सुन चाँदीको बजार दर' : 'FENEGOSIDA daily rate',
      icon: '💰',
      iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
    },
    {
      id: 'forex',
      title: t.forexShort,
      desc: language === 'ne' ? 'राष्ट्र बैंक विदेशी मुद्रा' : 'NRB live exchange rate',
      icon: '💵',
      iconBg: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400',
    },
    {
      id: 'age-calculator',
      title: t.ageCalculatorShort,
      desc: language === 'ne' ? 'उमेर र जन्मदिन' : 'By both calendars',
      icon: '🎂',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'compound-interest',
      title: t.compoundInterestShort,
      desc: language === 'ne' ? 'चक्रवृद्धि ब्याज र SIP' : 'Compound interest & SIP',
      icon: '📈',
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    },
    {
      id: 'vat-calculator',
      title: t.vatCalculatorShort,
      desc: language === 'ne' ? '१३% भ्याट हिसाब' : 'Quick 13% tax calc',
      icon: '🧾',
      iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
    },
    {
      id: 'emi-calculator',
      title: t.emiCalculatorShort,
      desc: language === 'ne' ? 'ऋण मासिक किस्ता' : 'Home & Auto loans',
      icon: '🏦',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'date-difference',
      title: t.dateDifferenceShort,
      desc: language === 'ne' ? 'मिति बीचको फरक' : 'Days between dates',
      icon: '📆',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div id="home-view" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      {/* Primary Column (Hero & 8 Sleek Tool Cards) */}
      <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 sm:gap-8">
        {/* 1. Today's Date Banner Card */}
        <TodayDateCard
          language={language}
          onOpenDateConverter={() => onSelectTool('date-converter')}
        />

        {/* 2. Everyday Tools Section */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.everydayTools}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {language === 'ne' ? '१७ वटा टूल्स' : '17 Tools'}
            </span>
          </div>

          {/* 3-Column / 2-Column Sleek Tool Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {toolsList.map((tool) => (
              <div
                key={tool.id}
                id={`home-tool-card-${tool.id}`}
                onClick={() => onSelectTool(tool.id)}
                className="group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800/90 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-slate-700 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl ${tool.iconBg} shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      {tool.icon}
                    </div>
                    {tool.tag && (
                      <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/80 text-red-600 dark:text-red-400">
                        {tool.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
                    {tool.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-400 group-hover:text-red-600 transition-colors">
                  <span>{language === 'ne' ? 'खोल्नुहोस्' : 'Open'}</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Glance Column (Forex & Gold & Converter) */}
      <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
        {/* Sleek Forex & Rates Section Card */}
        <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span className="text-2xl">💵</span> {t.forex}
              </h3>
              <span className="px-3 py-1 bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 text-[10px] font-bold uppercase rounded-full">
                NRB Live
              </span>
            </div>

            {/* Currency Glance Rows */}
            <div className="space-y-3.5">
              {usdRate && (
                <div
                  onClick={() => onSelectTool('forex')}
                  className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{usdRate.flag}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">USD</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-800 dark:text-slate-100 text-base">
                      Rs {usdRate.buy.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{t.buyRate}</div>
                  </div>
                </div>
              )}

              {inrRate && (
                <div
                  onClick={() => onSelectTool('forex')}
                  className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{inrRate.flag}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">INR (100)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-800 dark:text-slate-100 text-base">
                      Rs {inrRate.buy.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">Fixed Rate</div>
                  </div>
                </div>
              )}

              {audRate && (
                <div
                  onClick={() => onSelectTool('forex')}
                  className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{audRate.flag}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">AUD</span>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-slate-800 dark:text-slate-100 text-base">
                      Rs {audRate.buy.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">{t.buyRate}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Gold Rate Indicator Banner */}
            {metals && (
              <div
                onClick={() => onSelectTool('gold-silver')}
                className="mt-4 p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 cursor-pointer hover:bg-amber-100/70 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg">
                    💰
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {language === 'ne' ? 'छापावाल सुन' : 'Fine Gold (24K)'}
                    </div>
                    <div className="text-sm font-extrabold text-amber-700 dark:text-amber-400">
                      {formatNepaliCurrency(metals.rates.fineGold.tolaPrice)}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">/ तोल</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-600" />
              </div>
            )}
          </div>

          {/* Sleek CTA Card for Quick Converter */}
          <div
            onClick={() => onSelectTool('forex')}
            className="mt-6 p-6 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-3xl text-white text-center cursor-pointer transition-all shadow-lg active:scale-98"
          >
            <p className="text-xs text-slate-400 mb-1 font-medium">
              {language === 'ne' ? 'द्रुत विनिमय क्यालकुलेटर' : 'Convert Quickly'}
            </p>
            <p className="text-lg font-bold flex items-center justify-center gap-2">
              <span>{t.currencyConverter}</span>
              <ArrowRight className="w-4 h-4 text-red-400" />
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
};
