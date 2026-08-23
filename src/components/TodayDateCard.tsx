import React, { useState } from 'react';
import { Calendar, Copy, Check, ArrowRight } from 'lucide-react';
import { getTodayDate } from '../calendar/bsCalendar';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';

interface TodayDateCardProps {
  language: Language;
  onOpenDateConverter: () => void;
}

export const TodayDateCard: React.FC<TodayDateCardProps> = ({
  language,
  onOpenDateConverter,
}) => {
  const [copied, setCopied] = useState(false);
  const today = getTodayDate();
  const t = getTranslation(language);

  const copyTodayDate = () => {
    const text =
      language === 'ne'
        ? `आजको मिति: ${today.formattedBsNe} (${today.dayNameNe}) / सन् ${today.formattedAdNe}`
        : `Today: ${today.formattedBsEn} (${today.dayNameEn}) / ${today.formattedAdEn}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="today-date-card"
      className="bg-gradient-to-r from-red-600 to-blue-700 rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none"
    >
      {/* Sleek Design Ambient Glows & BS Watermark */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-3 right-6 sm:right-10 text-white/20 text-6xl sm:text-8xl font-black select-none pointer-events-none">
        BS
      </div>

      <div className="relative z-10">
        {/* Top meta & action pills */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
          <p className="text-red-100 text-[11px] sm:text-sm font-semibold uppercase tracking-wider">
            {t.todayDate}
          </p>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="copy-today-btn"
              onClick={copyTodayDate}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-md transition-all active:scale-95"
              title={t.copy}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-300" />
                  <span className="text-emerald-200">{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>

            <button
              id="goto-converter-btn"
              onClick={onOpenDateConverter}
              className="flex items-center gap-1 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 shadow-md transition-all active:scale-95"
              title={t.dateConverter}
            >
              <span>{t.convert}</span>
              <ArrowRight className="w-3 h-3 text-red-600" />
            </button>
          </div>
        </div>

        {/* Big BS Date */}
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-1.5 sm:mb-3 text-white tracking-tight leading-snug">
          {language === 'ne' ? today.formattedBsNe : today.formattedBsEn}
        </h2>

        {/* AD Date & Day Subtitle */}
        <p className="text-sm sm:text-lg md:text-xl text-blue-50 opacity-90 font-medium">
          {language === 'ne'
            ? `${today.dayNameNe}, सन् ${today.formattedAdNe}`
            : `${today.dayNameEn}, ${today.formattedAdEn}`}
        </p>
      </div>
    </section>
  );
};
