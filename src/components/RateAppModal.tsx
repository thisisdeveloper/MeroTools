import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../i18n/translations';
import { markRated, markDismissedPermanently, markPromptDeferred } from '../services/rateAppPrompt';

const FEEDBACK_EMAIL = 'ysunilkumar2030@gmail.com';

interface RateAppModalProps {
  language: Language;
  onClose: () => void;
}

export const RateAppModal: React.FC<RateAppModalProps> = ({ language, onClose }) => {
  const t = getTranslation(language);
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);

  const handleYes = () => {
    markRated();
    // Dynamically imported — the native review plugin only needs to
    // load for this one action, not as part of App's own eager bundle.
    import('../services/appReview').then(({ requestNativeReview }) =>
      requestNativeReview().catch(() => {})
    );
    onClose();
  };

  const handleNo = () => {
    markDismissedPermanently();
    setShowFeedbackPrompt(true);
  };

  const handleLater = () => {
    markPromptDeferred();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] max-w-sm w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-end -mt-1 -mr-1">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label={t.rateAppClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!showFeedbackPrompt ? (
          <>
            <div className="flex justify-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="w-7 h-7 text-amber-400 fill-amber-400" />
              ))}
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {t.rateAppTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.rateAppDesc}</p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                id="rate-app-yes-btn"
                onClick={handleYes}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t.rateAppYes}
              </button>
              <button
                id="rate-app-no-btn"
                onClick={handleNo}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t.rateAppNo}
              </button>
              <button
                id="rate-app-later-btn"
                onClick={handleLater}
                className="w-full text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 pt-1"
              >
                {t.rateAppLater}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {t.rateAppFeedbackPrompt}
            </p>
            <a
              href={`mailto:${FEEDBACK_EMAIL}`}
              onClick={onClose}
              className="block w-full px-4 py-3 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              {t.rateAppSendFeedback}
            </a>
            <button
              onClick={onClose}
              className="w-full text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              {t.rateAppClose}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
