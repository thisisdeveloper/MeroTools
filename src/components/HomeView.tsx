import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TodayDateCard } from './TodayDateCard';
import { UpcomingEventCard } from './UpcomingEventCard';
import { RemindersSummaryCard } from './RemindersSummaryCard';
import { ShoppingListSummaryCard } from './ShoppingListSummaryCard';
import { SavedAgesSummaryCard } from './SavedAgesSummaryCard';
import { ToolId, Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { getCachedForexData, formatNepaliCurrency } from '../services/forex';
import { getCachedMetalsData } from '../services/metals';
import { getHomeSettings } from '../services/homeSettings';

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
  const homeSettings = getHomeSettings();

  const usdRate = forex.rates.find((r) => r.iso3 === 'USD');
  const inrRate = forex.rates.find((r) => r.iso3 === 'INR');
  const audRate = forex.rates.find((r) => r.iso3 === 'AUD');

  return (
    <div id="home-view" className="flex flex-col gap-6 sm:gap-8 max-w-xl mx-auto">
      {/* 1. Today's Date Banner Card */}
      {homeSettings.date && (
        <TodayDateCard
          language={language}
          onOpenDateConverter={() => onSelectTool('date-converter')}
        />
      )}

      {/* 2. Upcoming Event Countdown */}
      {homeSettings.upcomingEvent && (
        <UpcomingEventCard language={language} onSelectTool={onSelectTool} />
      )}

      {/* 2b. Reminders & Shopping List summaries */}
      {homeSettings.reminders && <RemindersSummaryCard language={language} onSelectTool={onSelectTool} />}
      {homeSettings.shoppingList && <ShoppingListSummaryCard language={language} onSelectTool={onSelectTool} />}
      {homeSettings.savedAges && <SavedAgesSummaryCard language={language} onSelectTool={onSelectTool} />}

      {/* 2c. Gold & Silver Rate Banner (independent of Forex) */}
      {homeSettings.gold && metals && (
        <div
          onClick={() => onSelectTool('gold-silver')}
          className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 cursor-pointer hover:bg-amber-100/40 dark:hover:bg-amber-900/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg shrink-0">
                💰
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {language === 'ne' ? 'सुन तथा चाँदी' : 'Gold & Silver'}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-amber-600 shrink-0" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {language === 'ne' ? 'छापावाल सुन (24K)' : 'Fine Gold (24K)'}
              </div>
              <div className="text-sm font-extrabold text-amber-800 dark:text-amber-400">
                {formatNepaliCurrency(metals.rates.fineGold.tolaPrice)}
                <span className="text-[10px] text-slate-500 font-normal ml-1">/ तोला</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {language === 'ne' ? 'चाँदी' : 'Silver'}
              </div>
              <div className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
                {formatNepaliCurrency(metals.rates.silver.tolaPrice)}
                <span className="text-[10px] text-slate-500 font-normal ml-1">/ तोला</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Forex & Converter Section */}
      {homeSettings.forex && (
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 flex items-center justify-center text-lg shrink-0">
              💵
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{t.forex}</span>
          </div>
          <span className="px-2.5 py-1 bg-green-50 dark:bg-green-950/60 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full shrink-0">
            NRB Live
          </span>
        </div>

        {/* Currency Glance Rows */}
        <div className="space-y-2">
          {usdRate && (
            <div
              onClick={() => onSelectTool('forex')}
              className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{usdRate.flag}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">USD</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Rs {usdRate.buy.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{t.buyRate}</div>
              </div>
            </div>
          )}

          {inrRate && (
            <div
              onClick={() => onSelectTool('forex')}
              className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{inrRate.flag}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">INR (100)</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Rs {inrRate.buy.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Fixed Rate</div>
              </div>
            </div>
          )}

          {audRate && (
            <div
              onClick={() => onSelectTool('forex')}
              className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{audRate.flag}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">AUD</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                  Rs {audRate.buy.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{t.buyRate}</div>
              </div>
            </div>
          )}
        </div>

        {/* Sleek CTA Card for Quick Converter */}
        <div
          onClick={() => onSelectTool('forex')}
          className="mt-3 p-3.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-white text-center cursor-pointer transition-all active:scale-98"
        >
          <p className="text-[11px] text-slate-400 mb-0.5 font-medium">
            {language === 'ne' ? 'द्रुत विनिमय क्यालकुलेटर' : 'Convert Quickly'}
          </p>
          <p className="text-sm font-bold flex items-center justify-center gap-1.5">
            <span>{t.currencyConverter}</span>
            <ArrowRight className="w-3.5 h-3.5 text-red-400" />
          </p>
        </div>
    </div>
      )}
    </div>
  );
};
