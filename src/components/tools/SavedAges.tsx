import React, { useState } from 'react';
import { ArrowLeft, Users, Cake, Pencil, Trash2, Check, X } from 'lucide-react';
import { Language, SavedAgeRecord } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { getSavedAges, renameAge, deleteAge } from '../../services/savedAges';
import { calculateAgeFromAd } from '../../calculations/age';
import { toNepaliDigits, AD_MONTHS_EN, AD_MONTHS_NE } from '../../calendar/bsCalendar';

interface SavedAgesProps {
  language: Language;
  onBack?: () => void;
}

function formatAdDate(d: { year: number; month: number; day: number }, isNe: boolean): string {
  const mName = isNe ? AD_MONTHS_NE[d.month - 1] : AD_MONTHS_EN[d.month - 1];
  return `${d.day} ${mName} ${d.year}`;
}

export const SavedAges: React.FC<SavedAgesProps> = ({ language, onBack }) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';

  const [ages, setAges] = useState<SavedAgeRecord[]>(() => getSavedAges());
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const handleStartRename = (age: SavedAgeRecord) => {
    setRenamingId(age.id);
    setRenameInput(age.name);
  };

  const handleConfirmRename = (id: string) => {
    const updated = renameAge(id, renameInput);
    if (updated) {
      setAges((prev) => prev.map((a) => (a.id === id ? updated : a)));
    }
    setRenamingId(null);
    setRenameInput('');
  };

  const handleDelete = (id: string) => {
    deleteAge(id);
    setAges((prev) => prev.filter((a) => a.id !== id));
    setConfirmDeleteId(null);
  };

  return (
    <div id="saved-ages-tool" className="space-y-5">
      {/* Header */}
      <div className="px-1 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {t.savedAges}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.savedAgesDesc}
          </p>
        </div>
        {onBack && (
          <button
            id="tool-back-btn"
            onClick={onBack}
            aria-label={language === 'ne' ? 'पछाडि' : 'Back'}
            title={language === 'ne' ? 'पछाडि (Back)' : 'Back'}
            className="flex-shrink-0 flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline">{language === 'ne' ? 'पछाडि (Back)' : 'Back'}</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {ages.length === 0 && (
        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-2">
          <Users className="w-8 h-8 mx-auto text-slate-500" />
          <div className="font-bold text-slate-800 dark:text-slate-100">{t.noSavedAges}</div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {t.noSavedAgesDesc}
          </p>
        </div>
      )}

      {/* Age Cards */}
      <div className="space-y-4">
        {ages.map((age) => {
          const result = calculateAgeFromAd(age.dobAd);

          return (
            <div
              key={age.id}
              id={`saved-age-${age.id}`}
              className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-red-600 to-blue-700 text-white">
                <div className="flex items-center justify-between gap-2">
                  {renamingId === age.id ? (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <input
                        id={`saved-age-rename-input-${age.id}`}
                        type="text"
                        autoFocus
                        value={renameInput}
                        onChange={(e) => setRenameInput(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/60 font-black text-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                      />
                      <button
                        onClick={() => handleConfirmRename(age.id)}
                        disabled={!renameInput.trim()}
                        className="shrink-0 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRenamingId(null)}
                        className="shrink-0 p-1.5 rounded-lg bg-white/20 hover:bg-white/30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <h3 className="font-black text-lg truncate">{age.name}</h3>
                  )}

                  {result.isTodayBirthday && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 bg-amber-400/90 text-amber-950">
                      🎉 {isNe ? 'आजै जन्मदिन!' : 'Birthday today!'}
                    </span>
                  )}
                </div>

                <div className="mt-3 text-[11px] text-red-100 flex items-center gap-1.5">
                  <Cake className="w-3.5 h-3.5" />
                  <span>
                    {t.bornOn}: {formatAdDate(age.dobAd, isNe)}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="text-xl font-black text-white">
                      {isNe ? toNepaliDigits(result.years) : result.years}
                    </div>
                    <div className="text-[10px] font-bold text-red-100 uppercase tracking-wider mt-0.5">
                      {t.years}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="text-xl font-black text-white">
                      {isNe ? toNepaliDigits(result.months) : result.months}
                    </div>
                    <div className="text-[10px] font-bold text-red-100 uppercase tracking-wider mt-0.5">
                      {t.months}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <div className="text-xl font-black text-white">
                      {isNe ? toNepaliDigits(result.days) : result.days}
                    </div>
                    <div className="text-[10px] font-bold text-red-100 uppercase tracking-wider mt-0.5">
                      {t.days}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 text-[11px] text-red-100">
                  {t.nextBirthday}:{' '}
                  <strong className="text-amber-200">
                    {result.isTodayBirthday
                      ? isNe
                        ? 'आजै हो!'
                        : 'Today!'
                      : isNe
                      ? `${toNepaliDigits(result.nextBirthdayInMonths)} महिना ${toNepaliDigits(result.nextBirthdayInDays)} दिन बाकी`
                      : `${result.nextBirthdayInMonths} Months ${result.nextBirthdayInDays} Days`}
                  </strong>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex items-center gap-2 flex-wrap">
                {renamingId !== age.id && (
                  <button
                    id={`saved-age-rename-btn-${age.id}`}
                    onClick={() => handleStartRename(age)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    {t.renameAge}
                  </button>
                )}

                {confirmDeleteId === age.id ? (
                  <div className="flex items-center gap-2 text-xs ml-auto">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {t.deleteAgeConfirm}
                    </span>
                    <button
                      onClick={() => handleDelete(age.id)}
                      className="px-3 py-1.5 rounded-full font-bold bg-red-600 text-white"
                    >
                      {t.confirm}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-3 py-1.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    id={`saved-age-delete-btn-${age.id}`}
                    onClick={() => setConfirmDeleteId(age.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
