import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Wallet,
  Calendar,
  CheckCircle2,
  Trash2,
  Share2,
  Lock,
  TrendingUp,
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Language, SavedLoanRecord } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { formatNepaliCurrency } from '../../services/forex';
import {
  getSavedLoans,
  closeLoan,
  deleteLoan,
  computeLoanAsOfToday,
} from '../../services/savedLoans';
import { AD_MONTHS_EN, AD_MONTHS_NE } from '../../calendar/bsCalendar';

interface SavedLoansProps {
  language: Language;
  onBack?: () => void;
}

type FilterType = 'all' | 'active' | 'closed';

function formatAdDate(d: { year: number; month: number; day: number }, isNe: boolean): string {
  const mName = isNe ? AD_MONTHS_NE[d.month - 1] : AD_MONTHS_EN[d.month - 1];
  return `${d.day} ${mName} ${d.year}`;
}

export const SavedLoans: React.FC<SavedLoansProps> = ({ language, onBack }) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';

  const [loans, setLoans] = useState<SavedLoanRecord[]>(() => getSavedLoans());
  const [filter, setFilter] = useState<FilterType>('all');
  const [confirmCloseId, setConfirmCloseId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  const filteredLoans = useMemo(() => {
    if (filter === 'all') return loans;
    return loans.filter((l) => l.status === filter);
  }, [loans, filter]);

  const handleClose = (id: string) => {
    const updated = closeLoan(id);
    if (updated) {
      setLoans((prev) => prev.map((l) => (l.id === id ? updated : l)));
    }
    setConfirmCloseId(null);
  };

  const handleDelete = (id: string) => {
    deleteLoan(id);
    setLoans((prev) => prev.filter((l) => l.id !== id));
    setConfirmDeleteId(null);
  };

  const handleShare = async (loan: SavedLoanRecord) => {
    setSharingId(loan.id);
    setShareError(null);
    try {
      const node = document.getElementById(`loan-share-card-${loan.id}`);
      if (!node) return;

      const fileName = `${loan.title.replace(/\s+/g, '-')}.png`;
      const { domToDataUrl, domToBlob } = await import('modern-screenshot');

      if (Capacitor.isNativePlatform()) {
        // Native apps: write the PNG to the app cache and hand it to the
        // OS share sheet directly via the native bridge. This sidesteps
        // the WebView's Web Share API entirely, which is unreliable (and
        // often unavailable outside a secure/HTTPS context).
        const dataUrl = await domToDataUrl(node, { scale: 2 });
        const base64Data = dataUrl.split(',')[1];
        const written = await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Cache,
        });
        await Share.share({
          title: loan.title,
          url: written.uri,
          dialogTitle: loan.title,
        });
      } else {
        // Browser / dev-preview fallback only — not used in the shipped app.
        const blob = await domToBlob(node, { scale: 2 });
        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: loan.title });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Share as Image failed:', err);
      // The user cancelling the native share sheet also lands here (as a
      // rejection) — don't show an error for that.
      const message = err instanceof Error ? err.message : String(err);
      if (!/cancel/i.test(message)) {
        setShareError(loan.id);
      }
    } finally {
      setSharingId(null);
    }
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: t.filterAll },
    { id: 'active', label: t.filterActive },
    { id: 'closed', label: t.filterClosed },
  ];

  return (
    <div id="saved-loans-tool" className="space-y-5">
      {/* Header & Filter Pills */}
      <div className="px-1 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {t.savedLoans}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.savedLoansDesc}
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

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {filters.map((f) => (
          <button
            key={f.id}
            id={`saved-loans-filter-${f.id}`}
            onClick={() => setFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredLoans.length === 0 && (
        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-2">
          <Wallet className="w-8 h-8 mx-auto text-slate-500" />
          <div className="font-bold text-slate-800 dark:text-slate-100">{t.noSavedLoans}</div>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {t.noSavedLoansDesc}
          </p>
        </div>
      )}

      {/* Loan Cards */}
      <div className="space-y-4">
        {filteredLoans.map((loan) => {
          const live = loan.status === 'active' ? computeLoanAsOfToday(loan) : null;
          const years = loan.status === 'closed' ? loan.closedSnapshot!.years : live!.years;
          const months = loan.status === 'closed' ? loan.closedSnapshot!.months : live!.months;
          const days = loan.status === 'closed' ? loan.closedSnapshot!.days : live!.days;
          const interest =
            loan.status === 'closed' ? loan.closedSnapshot!.totalInterest : live!.totalInterest;
          const value =
            loan.status === 'closed' ? loan.closedSnapshot!.maturityAmount : live!.maturityAmount;

          return (
            <div
              key={loan.id}
              id={`saved-loan-${loan.id}`}
              className="rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
            >
              {/* Shareable summary block */}
              <div
                id={`loan-share-card-${loan.id}`}
                className="p-6 bg-gradient-to-r from-red-600 to-blue-700 text-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-black text-lg truncate">{loan.title}</h3>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                      loan.status === 'active'
                        ? 'bg-emerald-400/90 text-emerald-950'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {loan.status === 'closed' && <Lock className="w-3 h-3" />}
                    {loan.status === 'active' ? t.statusActive : t.statusClosed}
                  </span>
                </div>

                <div className="mt-3 text-[11px] text-red-100 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {t.startedOn}: {formatAdDate(loan.startDateAd, isNe)}
                  </span>
                </div>
                {loan.status === 'closed' && loan.closedAt && (
                  <div className="mt-1 text-[11px] text-red-100 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {t.closedOn}: {new Date(loan.closedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-[11px] text-red-100 font-medium flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {loan.status === 'closed' ? t.interestTillToday : t.interestTillToday}
                    </span>
                    <div className="text-lg font-extrabold text-emerald-300 mt-0.5">
                      {formatNepaliCurrency(interest)}
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-[11px] text-red-100 font-medium">{t.valueTillToday}</span>
                    <div className="text-lg font-extrabold text-white mt-0.5">
                      {formatNepaliCurrency(value)}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 text-[11px] text-red-100">
                  {years}
                  {isNe ? 'वर्ष' : 'y'} {months}
                  {isNe ? 'महिना' : 'm'} {days}
                  {isNe ? 'दिन' : 'd'} · {t.plannedMaturity}: {formatNepaliCurrency(loan.plannedMaturityAmount)}
                </div>

                <div className="mt-1 text-[10px] text-red-100/80">
                  {isNe ? 'मूल रकम' : 'Principal'}: {formatNepaliCurrency(loan.principal)} ·{' '}
                  {isNe ? 'दर' : 'Rate'}: {loan.rate}%
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex items-center gap-2 flex-wrap">
                {loan.status === 'active' &&
                  (confirmCloseId === loan.id ? (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {t.closeLoanConfirm}
                      </span>
                      <button
                        onClick={() => handleClose(loan.id)}
                        className="px-3 py-1.5 rounded-full font-bold bg-red-600 text-white"
                      >
                        {t.confirm}
                      </button>
                      <button
                        onClick={() => setConfirmCloseId(null)}
                        className="px-3 py-1.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {t.cancel}
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`saved-loan-close-btn-${loan.id}`}
                      onClick={() => setConfirmCloseId(loan.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {t.closeLoan}
                    </button>
                  ))}

                <button
                  id={`saved-loan-share-btn-${loan.id}`}
                  onClick={() => handleShare(loan)}
                  disabled={sharingId === loan.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {sharingId === loan.id ? `${t.shareAsImage}...` : t.shareAsImage}
                </button>

                {shareError === loan.id && (
                  <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                    {t.shareFailed}
                  </span>
                )}

                {confirmDeleteId === loan.id ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {t.deleteLoanConfirm}
                    </span>
                    <button
                      onClick={() => handleDelete(loan.id)}
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
                    id={`saved-loan-delete-btn-${loan.id}`}
                    onClick={() => setConfirmDeleteId(loan.id)}
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
