import React from 'react';
import { Home, Wrench, Settings } from 'lucide-react';
import { TabId, Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface BottomNavProps {
  currentTab: TabId;
  setCurrentTab: (tab: TabId) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  language,
}) => {
  const t = getTranslation(language);

  const navItems: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: t.home, icon: Home },
    { id: 'tools', label: t.tools, icon: Wrench },
    { id: 'settings', label: t.settings, icon: Settings },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] transition-colors"
    >
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 w-20 py-1.5 rounded-2xl transition-all ${
                isActive
                  ? 'text-red-600 dark:text-red-500 font-bold'
                  : 'text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
