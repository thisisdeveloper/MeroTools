import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { ToolId, Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface ToolsListViewProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
}

export const ToolsListView: React.FC<ToolsListViewProps> = ({
  language,
  onSelectTool,
}) => {
  const isNe = language === 'ne';
  const t = getTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const tools: {
    id: ToolId;
    title: string;
    desc: string;
    icon: string;
    iconBg: string;
    category: 'calendar' | 'finance' | 'utilities' | 'units';
    categoryLabel: string;
    isOffline: boolean;
  }[] = [
    {
      id: 'nepali-calendar',
      title: t.nepaliCalendar,
      desc: t.nepaliCalendarDesc,
      icon: '🗓️',
      iconBg: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400',
      category: 'calendar',
      categoryLabel: isNe ? 'पात्रो' : 'Calendar',
      isOffline: true,
    },
    {
      id: 'public-holidays',
      title: t.publicHolidays,
      desc: t.publicHolidaysDesc,
      icon: '🇳🇵',
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      category: 'calendar',
      categoryLabel: isNe ? 'बिदाहरू' : 'Holidays',
      isOffline: true,
    },
    {
      id: 'date-converter',
      title: t.dateConverter,
      desc: t.dateConverterDesc,
      icon: '📅',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      category: 'calendar',
      categoryLabel: isNe ? 'पात्रो' : 'Calendar',
      isOffline: true,
    },
    {
      id: 'age-calculator',
      title: t.ageCalculator,
      desc: t.ageCalculatorDesc,
      icon: '🎂',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      category: 'calendar',
      categoryLabel: isNe ? 'उमेर' : 'Age',
      isOffline: true,
    },
    {
      id: 'date-difference',
      title: t.dateDifference,
      desc: t.dateDifferenceDesc,
      icon: '📆',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      category: 'calendar',
      categoryLabel: isNe ? 'मिति' : 'Date',
      isOffline: true,
    },
    {
      id: 'salary-tax',
      title: t.salaryTax,
      desc: t.salaryTaxDesc,
      icon: '💼',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      category: 'finance',
      categoryLabel: isNe ? 'आयकर' : 'Tax',
      isOffline: true,
    },
    {
      id: 'electricity-bill',
      title: t.electricityBill,
      desc: t.electricityBillDesc,
      icon: '⚡',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      category: 'utilities',
      categoryLabel: isNe ? 'बिजुली' : 'Electricity',
      isOffline: true,
    },
    {
      id: 'vehicle-tax',
      title: t.vehicleTax,
      desc: t.vehicleTaxDesc,
      icon: '🚗',
      iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
      category: 'utilities',
      categoryLabel: isNe ? 'सवारी' : 'Vehicle',
      isOffline: true,
    },
    {
      id: 'gpa-calculator',
      title: t.gpaCalculator,
      desc: t.gpaCalculatorDesc,
      icon: '🎓',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      category: 'utilities',
      categoryLabel: isNe ? 'शिक्षा' : 'Education',
      isOffline: true,
    },
    {
      id: 'gold-silver',
      title: t.goldSilver,
      desc: t.goldSilverDesc,
      icon: '💰',
      iconBg: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
      category: 'finance',
      categoryLabel: isNe ? 'सुनचाँदी' : 'Gold/Silver',
      isOffline: false,
    },
    {
      id: 'forex',
      title: t.forex,
      desc: t.forexDesc,
      icon: '💵',
      iconBg: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400',
      category: 'finance',
      categoryLabel: isNe ? 'मुद्रा' : 'Forex',
      isOffline: false,
    },
    {
      id: 'land-converter',
      title: t.landConverter,
      desc: t.landConverterDesc,
      icon: '📐',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      category: 'units',
      categoryLabel: isNe ? 'जग्गा' : 'Land',
      isOffline: true,
    },
    {
      id: 'unit-converter',
      title: t.unitConverter,
      desc: t.unitConverterDesc,
      icon: '⚖️',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400',
      category: 'units',
      categoryLabel: isNe ? 'इकाइ' : 'Units',
      isOffline: true,
    },
    {
      id: 'compound-interest',
      title: t.compoundInterest,
      desc: t.compoundInterestDesc,
      icon: '📈',
      iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      category: 'finance',
      categoryLabel: isNe ? 'ब्याज/SIP' : 'Interest',
      isOffline: true,
    },
    {
      id: 'saved-loans',
      title: t.savedLoans,
      desc: t.savedLoansDesc,
      icon: '💾',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      category: 'finance',
      categoryLabel: isNe ? 'सुरक्षित ऋण' : 'Saved',
      isOffline: true,
    },
    {
      id: 'vat-calculator',
      title: t.vatCalculator,
      desc: t.vatCalculatorDesc,
      icon: '🧾',
      iconBg: 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
      category: 'finance',
      categoryLabel: isNe ? 'भ्याट' : 'VAT',
      isOffline: true,
    },
    {
      id: 'emi-calculator',
      title: t.emiCalculator,
      desc: t.emiCalculatorDesc,
      icon: '🏦',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      category: 'finance',
      categoryLabel: isNe ? 'ऋण EMI' : 'Loan EMI',
      isOffline: true,
    },
  ];

  const categories = [
    { id: 'all', labelEn: 'All Tools', labelNe: 'सबै टूल्स (१६)' },
    { id: 'calendar', labelEn: 'Calendar & Dates', labelNe: 'पात्रो र मिति' },
    { id: 'finance', labelEn: 'Financial & Tax', labelNe: 'वित्त तथा कर' },
    { id: 'utilities', labelEn: 'Daily Utilities', labelNe: 'दैनिक उपयोगिता' },
    { id: 'units', labelEn: 'Land & Units', labelNe: 'जग्गा तथा इकाइ' },
  ];

  const comingSoonFeatures: {
    id: string;
    title: string;
    desc: string;
    icon: string;
    iconBg: string;
  }[] = [
    {
      id: 'location-reminders',
      title: t.locationRemindersTitle,
      desc: t.locationRemindersDesc,
      icon: '📍',
      iconBg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
    },
    {
      id: 'smart-task-reminders',
      title: t.smartTaskRemindersTitle,
      desc: t.smartTaskRemindersDesc,
      icon: '⏰',
      iconBg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
    },
  ];

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      if (selectedCategory !== 'all' && tool.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          tool.title.toLowerCase().includes(q) ||
          tool.desc.toLowerCase().includes(q) ||
          tool.categoryLabel.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tools, selectedCategory, searchQuery]);

  return (
    <div id="tools-list-view" className="space-y-5 max-w-4xl mx-auto pb-6">
      {/* Header & Search */}
      <div className="space-y-4">
        <div className="px-1 flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {t.everydayTools}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isNe
                ? '१७ वटा नेपाल-केन्द्रित क्यालकुलेटर तथा सूचना टूल्स'
                : '17 complete Nepal-centric calculators and information tools'}
            </p>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900">
            {filteredTools.length} {isNe ? 'टूल्स' : 'Tools'}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="tools-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isNe
                ? 'टूल खोज्नुहोस् (उदा: पात्रो, कर, बिजुली, सवारी, सुन, GPA)...'
                : 'Search any tool (e.g. calendar, tax, electricity, vehicle, gold, GPA)...'
            }
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
            >
              {isNe ? 'खाली' : 'Clear'}
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                }`}
              >
                {isNe ? cat.labelNe : cat.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            id={`tools-item-${tool.id}`}
            onClick={() => onSelectTool(tool.id)}
            className="w-full group p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-red-300 dark:hover:border-slate-700 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-12 h-12 rounded-2xl ${tool.iconBg} text-2xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 shadow-sm`}
              >
                {tool.icon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate leading-snug">
                    {tool.title}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                    {tool.categoryLabel}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {tool.desc}
                </p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </button>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div id="coming-soon-section" className="space-y-4 pt-4">
        <div className="px-1">
          <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">
            {t.comingSoon}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.comingSoonSectionDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {comingSoonFeatures.map((feature) => (
            <div
              key={feature.id}
              id={`coming-soon-${feature.id}`}
              className="w-full p-4 rounded-3xl bg-slate-50/70 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700 text-left flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl ${feature.iconBg} text-2xl flex items-center justify-center shrink-0`}
                >
                  {feature.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-600 dark:text-slate-300 truncate leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {feature.desc}
                  </p>
                </div>
              </div>

              <span className="text-[9px] sm:text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 whitespace-nowrap">
                {t.comingSoon}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
