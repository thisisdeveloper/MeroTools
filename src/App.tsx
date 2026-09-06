import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { ToolsListView } from './components/ToolsListView';
import { SettingsView } from './components/SettingsView';
import { RateAppModal } from './components/RateAppModal';
import { TabId, ToolId, Language, ThemeMode } from './types';
import { getTranslation } from './i18n/translations';
import { recordToolUsage } from './services/toolUsage';
import { recordAppLaunch, shouldShowRatePrompt } from './services/rateAppPrompt';
import { useHorizontalSwipe } from './hooks/useHorizontalSwipe';
import { ArrowLeft, Sparkles, Share2 } from 'lucide-react';

const TAB_ORDER: TabId[] = ['home', 'tools', 'settings'];

// Tools that already render their own page title + subtitle at the top
// of their own body — the generic tool-bar title above the chips would
// just duplicate it, so it's suppressed for these.
const SELF_TITLED_TOOLS = new Set<ToolId>(['saved-loans', 'saved-ages', 'reminders', 'shopping-list']);

const DateConverter = lazy(() => import('./components/tools/DateConverter').then((m) => ({ default: m.DateConverter })));
const AgeCalculator = lazy(() => import('./components/tools/AgeCalculator').then((m) => ({ default: m.AgeCalculator })));
const DateDifference = lazy(() => import('./components/tools/DateDifference').then((m) => ({ default: m.DateDifference })));
const NepaliCalendar = lazy(() => import('./components/tools/NepaliCalendar').then((m) => ({ default: m.NepaliCalendar })));
const PublicHolidays = lazy(() => import('./components/tools/PublicHolidays').then((m) => ({ default: m.PublicHolidays })));
const GoldSilverCalculator = lazy(() => import('./components/tools/GoldSilverCalculator').then((m) => ({ default: m.GoldSilverCalculator })));
const ForexTool = lazy(() => import('./components/tools/ForexTool').then((m) => ({ default: m.ForexTool })));
const SalaryTaxCalculator = lazy(() => import('./components/tools/SalaryTaxCalculator').then((m) => ({ default: m.SalaryTaxCalculator })));
const GpaCalculator = lazy(() => import('./components/tools/GpaCalculator').then((m) => ({ default: m.GpaCalculator })));
const ElectricityBillCalculator = lazy(() => import('./components/tools/ElectricityBillCalculator').then((m) => ({ default: m.ElectricityBillCalculator })));
const VehicleTaxCalculator = lazy(() => import('./components/tools/VehicleTaxCalculator').then((m) => ({ default: m.VehicleTaxCalculator })));
const LandConverter = lazy(() => import('./components/tools/LandConverter').then((m) => ({ default: m.LandConverter })));
const UnitConverter = lazy(() => import('./components/tools/UnitConverter').then((m) => ({ default: m.UnitConverter })));
const VatCalculator = lazy(() => import('./components/tools/VatCalculator').then((m) => ({ default: m.VatCalculator })));
const EmiCalculator = lazy(() => import('./components/tools/EmiCalculator').then((m) => ({ default: m.EmiCalculator })));
const CompoundInterestCalculator = lazy(() => import('./components/tools/CompoundInterestCalculator').then((m) => ({ default: m.CompoundInterestCalculator })));
const SavedLoans = lazy(() => import('./components/tools/SavedLoans').then((m) => ({ default: m.SavedLoans })));
const SavedAges = lazy(() => import('./components/tools/SavedAges').then((m) => ({ default: m.SavedAges })));
const Reminders = lazy(() => import('./components/tools/Reminders').then((m) => ({ default: m.Reminders })));
const ShoppingLists = lazy(() => import('./components/tools/ShoppingLists').then((m) => ({ default: m.ShoppingLists })));

const ToolLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-red-600 animate-spin" />
  </div>
);

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabId>('home');
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  // Settings State with LocalStorage persistence
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('merotools_lang');
      if (saved === 'en' || saved === 'ne') return saved;
    } catch {}
    return 'en';
  });

  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('merotools_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {}
    return 'dark';
  });

  const [toolsViewMode, setToolsViewMode] = useState<'list' | 'card'>(() => {
    try {
      return localStorage.getItem('merotools_tools_view_mode') === 'card' ? 'card' : 'list';
    } catch {
      return 'list';
    }
  });

  const toggleToolsViewMode = () => {
    setToolsViewMode((prev) => {
      const next = prev === 'list' ? 'card' : 'list';
      try {
        localStorage.setItem('merotools_tools_view_mode', next);
      } catch {}
      return next;
    });
  };

  // Save Settings
  useEffect(() => {
    try {
      localStorage.setItem('merotools_lang', language);
    } catch {}
  }, [language]);

  useEffect(() => {
    try {
      localStorage.setItem('merotools_theme', theme);
    } catch {}

    // Apply dark class to documentElement
    const isDark =
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const [showRatePrompt, setShowRatePrompt] = useState<boolean>(false);
  useEffect(() => {
    recordAppLaunch();
    if (shouldShowRatePrompt()) {
      // Slight delay so it doesn't compete with the app's own initial
      // render/paint.
      const timer = setTimeout(() => setShowRatePrompt(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const t = getTranslation(language);

  const handleOpenTool = (toolId: ToolId) => {
    setActiveTool(toolId);
    recordToolUsage(toolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToOverview = () => {
    setActiveTool(null);
  };

  // Swipe left/right cycles Home <-> Tools <-> Settings (clamped at the
  // ends, no wraparound), matching BottomNav's left-to-right order.
  const goToAdjacentTab = (direction: 1 | -1) => {
    const nextIndex = TAB_ORDER.indexOf(currentTab) + direction;
    if (nextIndex < 0 || nextIndex >= TAB_ORDER.length) return;
    setActiveTool(null);
    setCurrentTab(TAB_ORDER[nextIndex]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // On a tool page, swipe right acts like the Back button. On the main
  // tabs, swipe left/right moves between tabs instead.
  const swipeHandlers = useHorizontalSwipe(
    activeTool
      ? { onSwipeRight: handleBackToOverview }
      : { onSwipeLeft: () => goToAdjacentTab(1), onSwipeRight: () => goToAdjacentTab(-1) }
  );

  const toolTitles: Record<ToolId, string> = {
    'nepali-calendar': t.nepaliCalendar,
    'public-holidays': t.publicHolidays,
    'date-converter': t.dateConverter,
    'age-calculator': t.ageCalculator,
    'salary-tax': t.salaryTax,
    'gpa-calculator': t.gpaCalculator,
    'electricity-bill': t.electricityBill,
    'vehicle-tax': t.vehicleTax,
    'gold-silver': t.goldSilver,
    'forex': t.forex,
    'land-converter': t.landConverter,
    'unit-converter': t.unitConverter,
    'date-difference': t.dateDifference,
    'vat-calculator': t.vatCalculator,
    'emi-calculator': t.emiCalculator,
    'compound-interest': t.compoundInterest,
    'saved-loans': t.savedLoans,
    'saved-ages': t.savedAges,
    'reminders': t.reminders,
    'shopping-list': t.shoppingList,
  };

  const allToolsList: ToolId[] = [
    'nepali-calendar',
    'public-holidays',
    'date-converter',
    'age-calculator',
    'salary-tax',
    'gpa-calculator',
    'electricity-bill',
    'vehicle-tax',
    'gold-silver',
    'forex',
    'land-converter',
    'unit-converter',
    'vat-calculator',
    'emi-calculator',
    'compound-interest',
    'saved-loans',
    'saved-ages',
    'date-difference',
    'reminders',
    'shopping-list',
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveTool(null);
          setCurrentTab(tab);
        }}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        showToolsViewToggle={currentTab === 'tools' && !activeTool}
        toolsViewMode={toolsViewMode}
        onToggleToolsViewMode={toggleToolsViewMode}
      />

      {/* Main Content Area */}
      <main
        className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-6 pb-[calc(7rem+env(safe-area-inset-bottom))]"
        {...swipeHandlers}
      >
        {/* If a tool is active, display the tool wrapper */}
        {activeTool ? (
          <div className="space-y-4 max-w-3xl mx-auto">
            {/* Quick Horizontal Tool Switcher Chips */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {allToolsList.map((tId) => {
                const isActive = activeTool === tId;
                let shortName: string = tId;
                if (tId === 'nepali-calendar') shortName = t.nepaliCalendarShort;
                if (tId === 'public-holidays') shortName = t.publicHolidaysShort;
                if (tId === 'date-converter') shortName = t.dateConverterShort;
                if (tId === 'age-calculator') shortName = t.ageCalculatorShort;
                if (tId === 'salary-tax') shortName = t.salaryTaxShort;
                if (tId === 'gpa-calculator') shortName = t.gpaCalculatorShort;
                if (tId === 'electricity-bill') shortName = t.electricityBillShort;
                if (tId === 'vehicle-tax') shortName = t.vehicleTaxShort;
                if (tId === 'gold-silver') shortName = t.goldSilverShort;
                if (tId === 'forex') shortName = t.forexShort;
                if (tId === 'land-converter') shortName = t.landConverterShort;
                if (tId === 'unit-converter') shortName = t.unitConverterShort;
                if (tId === 'vat-calculator') shortName = t.vatCalculatorShort;
                if (tId === 'emi-calculator') shortName = t.emiCalculatorShort;
                if (tId === 'compound-interest') shortName = t.compoundInterestShort;
                if (tId === 'saved-loans') shortName = t.savedLoansShort;
                if (tId === 'saved-ages') shortName = t.savedAgesShort;
                if (tId === 'date-difference') shortName = t.dateDifferenceShort;
                if (tId === 'reminders') shortName = t.remindersShort;
                if (tId === 'shopping-list') shortName = t.shoppingListShort;

                return (
                  <button
                    key={tId}
                    id={`chip-tool-${tId}`}
                    onClick={() => handleOpenTool(tId)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-md shadow-red-200 dark:shadow-none'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    {shortName}
                  </button>
                );
              })}
            </div>

            {/* Tool Top Bar with Title and Back Button — omitted entirely
                for tools that render their own title + back button inline
                in their own header (see SELF_TITLED_TOOLS below). */}
            {!SELF_TITLED_TOOLS.has(activeTool) && (
              <div className="flex items-center justify-between gap-2 pb-1">
                <h2 className="flex-1 min-w-0 truncate text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                  {toolTitles[activeTool]}
                </h2>

                <button
                  id="tool-back-btn"
                  onClick={handleBackToOverview}
                  aria-label={language === 'ne' ? 'पछाडि' : 'Back'}
                  title={language === 'ne' ? 'पछाडि (Back)' : 'Back'}
                  className="flex-shrink-0 flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-red-600" />
                  <span className="hidden sm:inline">{language === 'ne' ? 'पछाडि (Back)' : 'Back'}</span>
                </button>
              </div>
            )}

            {/* Active Tool Body */}
            <div className="pt-2">
              <Suspense fallback={<ToolLoadingFallback />}>
                {activeTool === 'nepali-calendar' && <NepaliCalendar language={language} />}
                {activeTool === 'public-holidays' && <PublicHolidays language={language} />}
                {activeTool === 'date-converter' && <DateConverter language={language} />}
                {activeTool === 'age-calculator' && (
                  <AgeCalculator
                    language={language}
                    onViewSavedAges={() => handleOpenTool('saved-ages')}
                  />
                )}
                {activeTool === 'salary-tax' && <SalaryTaxCalculator language={language} />}
                {activeTool === 'gpa-calculator' && <GpaCalculator language={language} />}
                {activeTool === 'electricity-bill' && <ElectricityBillCalculator language={language} />}
                {activeTool === 'vehicle-tax' && <VehicleTaxCalculator language={language} />}
                {activeTool === 'gold-silver' && <GoldSilverCalculator language={language} />}
                {activeTool === 'forex' && <ForexTool language={language} />}
                {activeTool === 'land-converter' && <LandConverter language={language} />}
                {activeTool === 'unit-converter' && <UnitConverter language={language} />}
                {activeTool === 'date-difference' && <DateDifference language={language} />}
                {activeTool === 'vat-calculator' && <VatCalculator language={language} />}
                {activeTool === 'emi-calculator' && <EmiCalculator language={language} />}
                {activeTool === 'compound-interest' && (
                  <CompoundInterestCalculator
                    language={language}
                    onViewSavedLoans={() => handleOpenTool('saved-loans')}
                  />
                )}
                {activeTool === 'saved-loans' && <SavedLoans language={language} onBack={handleBackToOverview} />}
                {activeTool === 'saved-ages' && <SavedAges language={language} onBack={handleBackToOverview} />}
                {activeTool === 'reminders' && <Reminders language={language} onBack={handleBackToOverview} />}
                {activeTool === 'shopping-list' && <ShoppingLists language={language} onBack={handleBackToOverview} />}
              </Suspense>
            </div>
          </div>
        ) : (
          /* Primary Tabs View */
          <div>
            {currentTab === 'home' && (
              <HomeView language={language} onSelectTool={handleOpenTool} />
            )}

            {currentTab === 'tools' && (
              <ToolsListView
                language={language}
                onSelectTool={handleOpenTool}
                viewMode={toolsViewMode}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsView
                language={language}
                setLanguage={setLanguage}
                theme={theme}
                setTheme={setTheme}
              />
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveTool(null);
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
      />

      {showRatePrompt && (
        <RateAppModal language={language} onClose={() => setShowRatePrompt(false)} />
      )}
    </div>
  );
}
