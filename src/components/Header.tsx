import React from 'react';
import { Sparkles, Globe, Sun, Moon, LayoutGrid, List } from 'lucide-react';
import { Language, ThemeMode, TabId } from '../types';
import { getTranslation } from '../i18n/translations';
import { NepalFlagWave } from './NepalFlagWave';

interface HeaderProps {
  currentTab?: TabId;
  setCurrentTab: (tab: TabId) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  showToolsViewToggle?: boolean;
  toolsViewMode?: 'list' | 'card';
  onToggleToolsViewMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  setCurrentTab,
  language,
  setLanguage,
  theme,
  setTheme,
  showToolsViewToggle,
  toolsViewMode,
  onToggleToolsViewMode,
}) => {
  const t = getTranslation(language);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ne' : 'en');
  };

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3.5 sm:px-8 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-[calc(env(safe-area-inset-top)+1rem)] pb-3 sm:pb-4 transition-colors">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-2">
        {/* Brand logo & title */}
        <button
          id="brand-header-btn"
          onClick={() => setCurrentTab('home')}
          className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none min-w-0"
        >
          <div className="bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/80 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 p-1">
            <NepalFlagWave className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-extrabold tracking-tight text-slate-800 dark:text-white truncate">
              {t.appName}
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block truncate">
              {t.tagline}
            </p>
          </div>
        </button>

        {/* Quick controls */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Language Toggle Pill */}
          <button
            id="lang-toggle-btn"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
            <span className="whitespace-nowrap">{language === 'en' ? 'नेपाली' : 'English'}</span>
          </button>

          {/* Tools View Mode Toggle — single icon showing the mode you'd switch to */}
          {showToolsViewToggle && onToggleToolsViewMode && (
            <button
              id="header-tools-view-toggle-btn"
              onClick={onToggleToolsViewMode}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors flex-shrink-0"
              aria-label={
                toolsViewMode === 'list'
                  ? language === 'ne' ? 'कार्ड दृश्यमा जानुहोस्' : 'Switch to card view'
                  : language === 'ne' ? 'सूची दृश्यमा जानुहोस्' : 'Switch to list view'
              }
              title={
                toolsViewMode === 'list'
                  ? language === 'ne' ? 'कार्ड दृश्य' : 'Card view'
                  : language === 'ne' ? 'सूची दृश्य' : 'List view'
              }
            >
              {toolsViewMode === 'list' ? (
                <LayoutGrid className="w-4 h-4" />
              ) : (
                <List className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Theme Quick Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition-colors flex-shrink-0"
            title={`Theme: ${theme}`}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Sparkles className="w-4 h-4 text-red-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
