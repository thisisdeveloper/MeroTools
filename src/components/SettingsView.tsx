import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Globe,
  ShieldCheck,
  Building,
  Check,
  FileText,
  CalendarDays,
  Landmark,
  Coins,
  CalendarClock,
  Bell,
  ListChecks,
  RotateCcw,
  Cake,
  MapPin,
  Star,
} from 'lucide-react';
import { HomeCardId, Language, ThemeMode } from '../types';
import { getTranslation } from '../i18n/translations';
import { getHomeSettings, setHomeCardEnabled, resetHomeSettings } from '../services/homeSettings';
import {
  getLocationNotificationStyle,
  setLocationNotificationStyle,
  LocationNotificationStyle,
} from '../services/locationNotificationSettings';
import { getReminders } from '../services/reminders';
import { ToggleSwitch } from './ToggleSwitch';

interface SettingsViewProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  setLanguage,
  theme,
  setTheme,
}) => {
  const t = getTranslation(language);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [homeSettings, setHomeSettingsState] = useState(() => getHomeSettings());
  const [locationAlertStyle, setLocationAlertStyleState] = useState<LocationNotificationStyle>(() =>
    getLocationNotificationStyle()
  );

  const homeCards: { id: HomeCardId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'date', label: t.homeCardDate, icon: CalendarDays },
    { id: 'forex', label: t.homeCardForex, icon: Landmark },
    { id: 'gold', label: t.homeCardGold, icon: Coins },
    { id: 'upcomingEvent', label: t.homeCardUpcomingEvent, icon: CalendarClock },
    { id: 'reminders', label: t.homeCardReminders, icon: Bell },
    { id: 'shoppingList', label: t.homeCardShoppingList, icon: ListChecks },
    { id: 'savedAges', label: t.homeCardSavedAges, icon: Cake },
  ];

  const handleToggleHomeCard = (id: HomeCardId, enabled: boolean) => {
    setHomeSettingsState(setHomeCardEnabled(id, enabled));
  };

  const handleResetHomeSettings = () => {
    setHomeSettingsState(resetHomeSettings());
  };

  const handleChangeLocationAlertStyle = (style: LocationNotificationStyle) => {
    setLocationAlertStyleState(style);
    setLocationNotificationStyle(style);
    // Dynamically imported — this is the only place in Settings that
    // needs the native geofencing plugin bridge, and only when the user
    // actually changes this setting, so it doesn't get pulled into
    // Settings' own eagerly-loaded bundle otherwise.
    import('../services/geofences').then(({ reapplyLocationNotificationStyle }) =>
      reapplyLocationNotificationStyle(getReminders()).catch(() => {})
    );
  };

  const openPrivacyPolicy = () => {
    window.location.hash = 'privacy';
    window.location.reload();
  };

  const handleRateUs = () => {
    // Dynamically imported — pulls in the native review plugin + Browser
    // plugin only when the user actually taps this, not as part of
    // Settings' own eager bundle.
    import('../services/appReview').then(({ rateApp }) => rateApp().catch(() => {}));
  };

  return (
    <div id="settings-view" className="space-y-6 max-w-xl mx-auto pb-8">
      {/* Page Title */}
      <div className="px-1">
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          {t.settings}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {language === 'ne'
            ? 'एपको रङ्ग, भाषा तथा जानकारी सेटिङ्स'
            : 'Preferences, appearance, and legal information'}
        </p>
      </div>

      {/* Appearance Section */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {t.appearance}
        </h3>

        <div className="grid grid-cols-3 gap-2.5">
          {/* System */}
          <button
            id="theme-system-btn"
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
              theme === 'system'
                ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-2 ring-red-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span>{t.themeSystem}</span>
          </button>

          {/* Light */}
          <button
            id="theme-light-btn"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
              theme === 'light'
                ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-2 ring-red-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span>{t.themeLight}</span>
          </button>

          {/* Dark */}
          <button
            id="theme-dark-btn"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-bold transition-all ${
              theme === 'dark'
                ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-2 ring-red-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span>{t.themeDark}</span>
          </button>
        </div>
      </div>

      {/* Language Section */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {t.language}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            id="lang-en-btn"
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-bold transition-all ${
              language === 'en'
                ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-2 ring-red-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <span>English</span>
            </div>
            {language === 'en' && <Check className="w-4 h-4 text-red-600" />}
          </button>

          <button
            id="lang-ne-btn"
            onClick={() => setLanguage('ne')}
            className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm font-bold transition-all ${
              language === 'ne'
                ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300 ring-2 ring-red-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-red-500" />
              <span>नेपाली</span>
            </div>
            {language === 'ne' && <Check className="w-4 h-4 text-red-600" />}
          </button>
        </div>
      </div>

      {/* Home Page Items Section */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t.homePageItems}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.homePageItemsDesc}</p>
          </div>
          <button
            id="reset-home-settings-btn"
            onClick={handleResetHomeSettings}
            className="flex items-center gap-1 text-[11px] font-bold text-red-600 dark:text-red-400 shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            {t.resetToDefault}
          </button>
        </div>

        <div className="space-y-1">
          {homeCards.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>
              </div>
              <ToggleSwitch
                id={`home-toggle-${id}`}
                checked={homeSettings[id]}
                onChange={(checked) => handleToggleHomeCard(id, checked)}
                ariaLabel={label}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Location Reminder Alert Style */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {t.locationAlertStyle}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.locationAlertStyleDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            id="location-alert-style-alarm-btn"
            onClick={() => handleChangeLocationAlertStyle('alarm')}
            className={`p-3.5 rounded-2xl border flex flex-col items-start gap-1 text-left transition-all ${
              locationAlertStyle === 'alarm'
                ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 ring-2 ring-red-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span
              className={`text-xs sm:text-sm font-bold ${
                locationAlertStyle === 'alarm'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.locationAlertStyleAlarm}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.locationAlertStyleAlarmDesc}
            </span>
          </button>

          <button
            id="location-alert-style-alert-btn"
            onClick={() => handleChangeLocationAlertStyle('alert')}
            className={`p-3.5 rounded-2xl border flex flex-col items-start gap-1 text-left transition-all ${
              locationAlertStyle === 'alert'
                ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 ring-2 ring-red-500/20 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span
              className={`text-xs sm:text-sm font-bold ${
                locationAlertStyle === 'alert'
                  ? 'text-red-700 dark:text-red-300'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {t.locationAlertStyleAlert}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.locationAlertStyleAlertDesc}
            </span>
          </button>
        </div>
      </div>

      {/* Rate Us Section */}
      <div className="p-6 rounded-[2rem] bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-900/40 shadow-sm">
        <button id="rate-us-btn" onClick={handleRateUs} className="w-full flex items-center gap-3.5 text-left">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{t.rateUs}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{t.rateUsDesc}</div>
          </div>
        </button>
      </div>

      {/* Legal & Policy Section */}
      <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {t.about}
        </h3>

        <div className="space-y-2.5">
          {/* Privacy Policy */}
          <button
            id="privacy-policy-btn"
            onClick={openPrivacyPolicy}
            className="w-full p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs sm:text-sm text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold">{t.privacyPolicy}</span>
            </div>
            <FileText className="w-4 h-4 text-slate-500" />
          </button>

          {/* Terms & Data Disclaimers */}
          <button
            id="terms-btn"
            onClick={() => setShowTermsModal(true)}
            className="w-full p-3.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-xs sm:text-sm text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Building className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="font-semibold">{t.dataSources}</span>
            </div>
            <FileText className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* App Version Info Card */}
      <div className="text-center pt-3 text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div className="font-bold text-slate-700 dark:text-slate-300">
          🇳🇵 Mero Tools / Nepal Tools
        </div>
        <div>
          {t.version} 1.0.0 • {language === 'ne' ? 'अफलाइन गणना समर्थन' : 'Offline Engine Supported'}
        </div>
        <div className="text-[11px] text-slate-500">
          Designed for everyday productivity in Nepal.
        </div>
      </div>

      {/* Terms & Disclaimers Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building className="w-5 h-5 text-red-600" />
                <span>{t.dataSources}</span>
              </h3>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2.5 leading-relaxed">
              <p>
                <strong>1. Foreign Exchange Rates:</strong> Foreign exchange rates are referenced from official public publications of <strong>Nepal Rastra Bank (NRB)</strong>. Foreign currency rates fluctuate regularly in open markets.
              </p>
              <p>
                <strong>2. Gold and Silver Bullion Rates:</strong> Precious metal prices are referenced from the indicative market guidelines published by <strong>Federation of Nepal Gold and Silver Dealers’ Association (FENEGOSIDA)</strong>.
              </p>
              <p className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 font-medium">
                <strong>Disclaimer:</strong> All calculations, loan amortization figures, bullion rates, and exchange rates provided in Mero Tools are for informational and general utility purposes only. Please confirm final rates and terms with your bank, tax advisor, or authorized bullion merchant before completing official commercial transactions.
              </p>
            </div>

            <button
              onClick={() => setShowTermsModal(false)}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-md"
            >
              {language === 'ne' ? 'बुझें (Close)' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
