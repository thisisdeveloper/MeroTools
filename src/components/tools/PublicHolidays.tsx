import React, { useState, useMemo } from 'react';
import { Language } from '../../types';
import { NEPAL_HOLIDAYS_LIST, NepalHoliday } from '../../data/holidaysData';
import { toNepaliDigits, getTodayDate, BS_MONTHS_EN, BS_MONTHS_NE } from '../../calendar/bsCalendar';
import { Search, Filter, Calendar, Flag, Sparkles, Clock, CheckCircle2 } from 'lucide-react';

interface PublicHolidaysProps {
  language: Language;
}

export const PublicHolidays: React.FC<PublicHolidaysProps> = ({ language }) => {
  const isNe = language === 'ne';
  const today = useMemo(() => getTodayDate(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  // Filtered Holidays List
  const filteredList = useMemo(() => {
    return NEPAL_HOLIDAYS_LIST.filter((holiday) => {
      // Category filter
      if (selectedCategory !== 'all' && holiday.category !== selectedCategory) {
        return false;
      }
      // Month filter
      if (selectedMonthFilter !== 'all' && holiday.bsMonth !== Number(selectedMonthFilter)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          holiday.nameEn.toLowerCase().includes(q) || holiday.nameNe.toLowerCase().includes(q);
        const matchDesc =
          (holiday.descriptionEn && holiday.descriptionEn.toLowerCase().includes(q)) ||
          (holiday.descriptionNe && holiday.descriptionNe.toLowerCase().includes(q));
        const matchDate = holiday.bsDate.includes(q) || holiday.adDate.includes(q);

        return matchName || matchDesc || matchDate;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedMonthFilter]);

  // Categories config
  const categories = [
    { id: 'all', labelEn: 'All Holidays', labelNe: 'सबै बिदाहरू' },
    { id: 'festival', labelEn: 'Major Festivals (दशैं/तिहार)', labelNe: 'मुख्य चाडपर्व' },
    { id: 'national', labelEn: 'National Days', labelNe: 'राष्ट्रिय दिवस' },
    { id: 'religious', labelEn: 'Religious', labelNe: 'धार्मिक पर्व' },
    { id: 'regional', labelEn: 'Cultural & Regional', labelNe: 'सांस्कृतिक/क्षेत्रीय' },
    { id: 'women', labelEn: 'Women Only', labelNe: 'महिला बिदा' },
  ];

  return (
    <div id="public-holidays-tool" className="space-y-6">
      {/* Search & Filter Header */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="holiday-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isNe
                ? 'चाडपर्व वा बिदा खोज्नुहोस् (उदा: दशैं, तिहार, होली, बुद्ध)...'
                : 'Search holidays (e.g. Dashain, Tihar, Holi, Buddha)...'
            }
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg"
            >
              {isNe ? 'खाली' : 'Clear'}
            </button>
          )}
        </div>

        {/* Horizontal Category Chips */}
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
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {isNe ? cat.labelNe : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Month Dropdown Filter */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>{isNe ? 'महिना अनुसार फिल्टर:' : 'Filter by Month:'}</span>
          </div>

          <select
            id="holiday-month-select"
            value={selectedMonthFilter}
            onChange={(e) => setSelectedMonthFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="all">{isNe ? 'सबै महिना (All Months)' : 'All Months'}</option>
            {BS_MONTHS_EN.map((mEn, i) => (
              <option key={i} value={i + 1}>
                {isNe ? BS_MONTHS_NE[i] : mEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Holidays List Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isNe
              ? `कुल ${filteredList.length} वटा बिदा तथा पर्वहरू`
              : `Showing ${filteredList.length} Public Holidays`}
          </span>
        </div>

        {filteredList.length > 0 ? (
          filteredList.map((item) => {
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-red-300 dark:hover:border-red-900/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  {/* Date Badge */}
                  <div className="w-12 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex flex-col items-center justify-center font-bold flex-shrink-0 shadow-sm">
                    <span className="text-base font-black leading-none">
                      {isNe ? toNepaliDigits(item.bsDay) : item.bsDay}
                    </span>
                    <span className="text-[10px] font-semibold leading-none mt-1 text-red-100 uppercase">
                      {isNe ? BS_MONTHS_NE[item.bsMonth - 1] : BS_MONTHS_EN[item.bsMonth - 1].substring(0, 3)}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                        {isNe ? item.nameNe : item.nameEn}
                      </h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900">
                        {isNe ? item.categoryLabelNe : item.categoryLabelEn}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {isNe ? item.descriptionNe : item.descriptionEn}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-red-500" />
                        <span>{item.dayOfWeekNe}</span>
                      </span>
                      <span>•</span>
                      <span>AD: {item.adDate}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-2">
            <Flag className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {isNe ? 'कुनै चाडपर्व वा बिदा भेटिएन' : 'No matching holidays found'}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              {isNe ? 'कृपया खोज शब्द वा फिल्टर परिवर्तन गर्नुहोस्।' : 'Try changing your search query or filter.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
