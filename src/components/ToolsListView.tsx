import React, { useState, useMemo } from 'react';
import {
  Calendar,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Star,
  ArrowRight,
} from 'lucide-react';
import { ToolId, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { getMostUsedTools } from '../services/toolUsage';
import { getFavoriteToolIds, toggleFavoriteTool } from '../services/favorites';

interface ToolCardData {
  id: ToolId;
  title: string;
  desc: string;
  icon: string;
  iconBg: string;
  category: 'calendar' | 'finance' | 'utilities' | 'units' | 'personal';
  categoryLabel: string;
  isOffline: boolean;
}

interface ToolsListViewProps {
  language: Language;
  onSelectTool: (toolId: ToolId) => void;
  viewMode: 'list' | 'card';
}

export const ToolsListView: React.FC<ToolsListViewProps> = ({
  language,
  onSelectTool,
  viewMode,
}) => {
  const isNe = language === 'ne';
  const t = getTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const tools: ToolCardData[] = [
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
      id: 'saved-ages',
      title: t.savedAges,
      desc: t.savedAgesDesc,
      icon: '🎈',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      category: 'personal',
      categoryLabel: isNe ? 'उमेर' : 'Age',
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
    {
      id: 'reminders',
      title: t.reminders,
      desc: t.remindersDesc,
      icon: '🔔',
      iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      category: 'personal',
      categoryLabel: isNe ? 'रिमाइन्डर' : 'Reminders',
      isOffline: true,
    },
    {
      id: 'shopping-list',
      title: t.shoppingList,
      desc: t.shoppingListDesc,
      icon: '🛒',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      category: 'personal',
      categoryLabel: isNe ? 'किनमेल' : 'Shopping',
      isOffline: true,
    },
  ];

  const categories = [
    { id: 'all', labelEn: 'All Tools', labelNe: 'सबै टूल्स (२०)' },
    { id: 'calendar', labelEn: 'Calendar & Dates', labelNe: 'पात्रो र मिति' },
    { id: 'finance', labelEn: 'Financial & Tax', labelNe: 'वित्त तथा कर' },
    { id: 'utilities', labelEn: 'Daily Utilities', labelNe: 'दैनिक उपयोगिता' },
    { id: 'units', labelEn: 'Land & Units', labelNe: 'जग्गा तथा इकाइ' },
    { id: 'personal', labelEn: 'Personal', labelNe: 'व्यक्तिगत' },
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

  const [mostUsedIds] = useState<ToolId[]>(() => getMostUsedTools(50));
  const [favoriteIds, setFavoriteIds] = useState<ToolId[]>(() => getFavoriteToolIds());

  const handleToggleFavorite = (toolId: ToolId) => {
    setFavoriteIds(toggleFavoriteTool(toolId));
  };

  // Favorites first, then frequently-used (by usage rank), then everything
  // else A-Z — one ordered list instead of separate duplicated sections.
  const sortedTools = useMemo(() => {
    const mostUsedRank = new Map<ToolId, number>(mostUsedIds.map((id, idx) => [id, idx]));

    return [...filteredTools].sort((a, b) => {
      const aFav = favoriteIds.includes(a.id);
      const bFav = favoriteIds.includes(b.id);
      if (aFav !== bFav) return aFav ? -1 : 1;
      if (aFav && bFav) return a.title.localeCompare(b.title, isNe ? 'ne' : 'en');

      const aRank = mostUsedRank.has(a.id) ? mostUsedRank.get(a.id)! : Infinity;
      const bRank = mostUsedRank.has(b.id) ? mostUsedRank.get(b.id)! : Infinity;
      if (aRank !== bRank) return aRank - bRank;

      return a.title.localeCompare(b.title, isNe ? 'ne' : 'en');
    });
  }, [filteredTools, favoriteIds, mostUsedIds, isNe]);

  const gridClass =
    viewMode === 'card'
      ? 'grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4'
      : 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4';

  const renderFavoriteButton = (tool: ToolCardData, idPrefix: string, className: string) => {
    const isFavorite = favoriteIds.includes(tool.id);
    return (
      <button
        id={`${idPrefix}-${tool.id}-favorite-btn`}
        onClick={(e) => {
          e.stopPropagation();
          handleToggleFavorite(tool.id);
        }}
        aria-label={isFavorite ? t.removeFromFavorites : t.addToFavorites}
        title={isFavorite ? t.removeFromFavorites : t.addToFavorites}
        className={`rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
      >
        <Star
          className={`w-4 h-4 transition-colors ${
            isFavorite
              ? 'fill-amber-400 text-amber-500'
              : 'text-slate-500 dark:text-slate-600 group-hover:text-slate-600'
          }`}
        />
      </button>
    );
  };

  const renderToolCard = (tool: ToolCardData, idPrefix: string) => {
    if (viewMode === 'card') {
      return (
        <div
          key={tool.id}
          id={`${idPrefix}-${tool.id}`}
          role="button"
          tabIndex={0}
          onClick={() => onSelectTool(tool.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onSelectTool(tool.id);
          }}
          className="group bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800/90 shadow-sm hover:shadow-md hover:border-red-200 dark:hover:border-slate-700 cursor-pointer transition-all active:scale-[0.98] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl ${tool.iconBg} shadow-sm group-hover:scale-105 transition-transform`}
              >
                {tool.icon}
              </div>
              {renderFavoriteButton(tool, idPrefix, 'p-1 -m-1')}
            </div>

            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-1 leading-snug">
              {tool.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
              {tool.desc}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] sm:text-xs font-bold text-slate-500 group-hover:text-red-600 transition-colors">
            <span>{isNe ? 'खोल्नुहोस्' : 'Open'}</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      );
    }

    return (
      <div
        key={tool.id}
        id={`${idPrefix}-${tool.id}`}
        role="button"
        tabIndex={0}
        onClick={() => onSelectTool(tool.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelectTool(tool.id);
        }}
        className="w-full group p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-red-300 dark:hover:border-slate-700 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-between gap-3 cursor-pointer"
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

        <div className="flex items-center gap-1 shrink-0">
          {renderFavoriteButton(tool, idPrefix, 'p-1.5 -m-1.5')}
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all ml-1" />
        </div>
      </div>
    );
  };

  return (
    <div id="tools-list-view" className="space-y-5 max-w-4xl mx-auto pb-6">
      {/* Header & Search */}
      <div className="space-y-4">
        <div className="px-1 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {t.everydayTools}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {isNe
                ? '१९ वटा नेपाल-केन्द्रित क्यालकुलेटर तथा सूचना टूल्स'
                : '19 complete Nepal-centric calculators and information tools'}
            </p>
          </div>

          <span className="shrink-0 whitespace-nowrap text-center text-xs font-bold px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900">
            {filteredTools.length} {isNe ? 'टूल्स' : 'Tools'}
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
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
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-600 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
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

      {/* Tools Grid — favorites first, then frequently used, then A-Z */}
      <div className={`${gridClass} pt-1`}>
        {sortedTools.map((tool) => renderToolCard(tool, 'tools-item'))}
      </div>

    </div>
  );
};
