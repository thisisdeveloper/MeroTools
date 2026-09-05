import React from 'react';
import { ArrowRight } from 'lucide-react';
import { TodayDateCard } from './TodayDateCard';
import { UpcomingEventCard } from './UpcomingEventCard';
import { RemindersSummaryCard } from './RemindersSummaryCard';
import { ShoppingListSummaryCard } from './ShoppingListSummaryCard';
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

      {/* 2c. Gold Rate Banner (independent of Forex) */}
      {homeSettings.gold && metals && (
        <div
          onClick={() => onSelectTool('gold-silver')}
          className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 cursor-pointer hover:bg-amber-100/40 dark:hover:bg-amber-900/30 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-lg">
              💰
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {language === 'ne' ? 'छापावाल सुन' : 'Fine Gold (24K)'}
              </div>
              <div className="text-sm font-extrabold text-amber-800 dark:text-amber-400">
                {formatNepaliCurrency(metals.rates.fineGold.tolaPrice)}
                <span className="text-[10px] text-slate-500 font-normal ml-1">/ तोल</span>
              </div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-amber-600" />
        </div>
      )}

      {/* 3. Forex & Converter Section */}
      {homeSettings.forex && (
      <section className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none">
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
                  <div className="text-[10px] text-slate-500 font-medium">{t.buyRate}</div>
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
                  <div className="text-[10px] text-slate-500 font-medium">Fixed Rate</div>
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
                  <div className="text-[10px] text-slate-500 font-medium">{t.buyRate}</div>
                </div>
              </div>
            )}
          </div>
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
      )}
    </div>
  );
};
