import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Cake,
  Heart,
  Receipt,
  ListTodo,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { ADDate, Language, ReminderRecord, ReminderType, RepeatMode } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { getTodayDate, toNepaliDigits } from '../../calendar/bsCalendar';
import { formatNepaliCurrency } from '../../services/forex';
import {
  getReminders,
  saveReminder,
  deleteReminder,
  toggleReminderCompleted,
  getDaysUntil,
} from '../../services/reminders';
import { AdDatePicker } from '../AdDatePicker';

interface RemindersProps {
  language: Language;
}

type FilterType = 'today' | 'upcoming' | 'completed' | 'all';

const TYPE_META: Record<
  Extract<ReminderType, 'task' | 'birthday' | 'anniversary' | 'bill'>,
  {
    icon: React.FC<{ className?: string }>;
    iconBg: string;
    defaultRepeat: RepeatMode;
    labelEn: string;
    labelNe: string;
    placeholderEn: string;
    placeholderNe: string;
  }
> = {
  task: {
    icon: ListTodo,
    iconBg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    defaultRepeat: 'none',
    labelEn: 'Task',
    labelNe: 'कार्य',
    placeholderEn: 'e.g. Pay electricity bill',
    placeholderNe: 'जस्तै: बिजुली बिल तिर्ने',
  },
  birthday: {
    icon: Cake,
    iconBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400',
    defaultRepeat: 'yearly',
    labelEn: 'Birthday',
    labelNe: 'जन्मदिन',
    placeholderEn: "e.g. Rahul's Birthday",
    placeholderNe: 'जस्तै: राहुलको जन्मदिन',
  },
  anniversary: {
    icon: Heart,
    iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    defaultRepeat: 'yearly',
    labelEn: 'Anniversary',
    labelNe: 'वार्षिकोत्सव',
    placeholderEn: 'e.g. Wedding Anniversary',
    placeholderNe: 'जस्तै: विवाह वार्षिकोत्सव',
  },
  bill: {
    icon: Receipt,
    iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    defaultRepeat: 'monthly',
    labelEn: 'Bill',
    labelNe: 'बिल',
    placeholderEn: 'e.g. Internet Bill',
    placeholderNe: 'जस्तै: इन्टरनेट बिल',
  },
};

function todayAd(): ADDate {
  return getTodayDate().ad;
}

export const Reminders: React.FC<RemindersProps> = ({ language }) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';
  const today = todayAd();

  const [reminders, setReminders] = useState<ReminderRecord[]>(() => getReminders());
  const [filter, setFilter] = useState<FilterType>('today');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add-reminder modal state
  const [showModal, setShowModal] = useState(false);
  const [formType, setFormType] = useState<keyof typeof TYPE_META>('task');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState<ADDate>(today);
  const [formRepeat, setFormRepeat] = useState<RepeatMode>('none');
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const openModal = (type: keyof typeof TYPE_META) => {
    setFormType(type);
    setFormTitle('');
    setFormDate(today);
    setFormRepeat(TYPE_META[type].defaultRepeat);
    setFormAmount('');
    setFormNotes('');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formTitle.trim()) return;
    saveReminder({
      type: formType,
      title: formTitle,
      notes: formNotes,
      dateAd: formDate,
      repeat: formRepeat,
      amount: formType === 'bill' && formAmount ? Number(formAmount) : null,
    });
    setReminders(getReminders());
    setShowModal(false);
  };

  const handleToggleComplete = (id: string) => {
    toggleReminderCompleted(id);
    setReminders(getReminders());
  };

  const handleDelete = (id: string) => {
    deleteReminder(id);
    setReminders(getReminders());
    setConfirmDeleteId(null);
  };

  const withDays = useMemo(
    () =>
      reminders
        .map((r) => ({ reminder: r, days: getDaysUntil(r, today) }))
        .filter((x): x is { reminder: ReminderRecord; days: number } => x.days !== null || (x.reminder.repeat === 'none' && x.reminder.isCompleted)),
    [reminders, today]
  );

  const filteredList = useMemo(() => {
    if (filter === 'completed') {
      return reminders
        .filter((r) => r.repeat === 'none' && r.isCompleted)
        .map((r) => ({ reminder: r, days: null as number | null }));
    }
    if (filter === 'all') {
      return reminders.map((r) => ({ reminder: r, days: getDaysUntil(r, today) }));
    }
    if (filter === 'today') {
      return withDays.filter((x) => x.days === 0);
    }
    // upcoming
    return withDays.filter((x) => x.days !== null && x.days > 0).sort((a, b) => a.days! - b.days!);
  }, [filter, reminders, withDays, today]);

  const statusLabel = (type: ReminderType, days: number | null): string => {
    if (days === null) return isNe ? 'सम्पन्न' : 'Completed';
    if (days < 0) return isNe ? `${toNepaliDigits(Math.abs(days))} दिन ढिलो भयो` : `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
    if (days === 0) return isNe ? 'आज' : 'Today';
    return isNe ? `${toNepaliDigits(days)} दिनमा` : `In ${days} day${days === 1 ? '' : 's'}`;
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'today', label: isNe ? 'आज' : 'Today' },
    { id: 'upcoming', label: isNe ? 'आगामी' : 'Upcoming' },
    { id: 'completed', label: isNe ? 'सम्पन्न' : 'Completed' },
    { id: 'all', label: isNe ? 'सबै' : 'All' },
  ];

  const emptyMessage: Record<FilterType, string> = {
    today: isNe ? 'आजको लागि कुनै रिमाइन्डर छैन।' : 'No reminders for today.',
    upcoming: isNe ? 'कुनै आगामी रिमाइन्डर छैन।' : 'No upcoming reminders.',
    completed: isNe ? 'कुनै सम्पन्न कार्य छैन।' : 'No completed reminders yet.',
    all: isNe ? 'अहिलेसम्म कुनै रिमाइन्डर छैन।' : 'No reminders yet.',
  };

  return (
    <div id="reminders-tool" className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {isNe ? 'रिमाइन्डरहरू' : 'Reminders'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isNe ? 'कार्य, जन्मदिन, बिल र थप' : 'Tasks, birthdays, bills and more'}
          </p>
        </div>
      </div>

      {/* Quick add row */}
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(TYPE_META) as (keyof typeof TYPE_META)[]).map((key) => {
          const meta = TYPE_META[key];
          const Icon = meta.icon;
          return (
            <button
              key={key}
              id={`reminders-add-${key}-btn`}
              onClick={() => openModal(key)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                {isNe ? meta.labelNe : meta.labelEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {filters.map((f) => (
          <button
            key={f.id}
            id={`reminders-filter-${f.id}`}
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

      {/* List */}
      {filteredList.length === 0 ? (
        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-2">
          <Bell className="w-8 h-8 mx-auto text-slate-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{emptyMessage[filter]}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredList.map(({ reminder, days }) => {
            const meta = TYPE_META[reminder.type as keyof typeof TYPE_META] || TYPE_META.task;
            const Icon = meta.icon;
            const canComplete = reminder.repeat === 'none';
            return (
              <div
                key={reminder.id}
                id={`reminder-item-${reminder.id}`}
                className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-start gap-3"
              >
                {canComplete ? (
                  <button
                    id={`reminder-complete-btn-${reminder.id}`}
                    onClick={() => handleToggleComplete(reminder.id)}
                    className="mt-0.5 shrink-0"
                    aria-label={isNe ? 'सम्पन्न चिन्ह लगाउनुहोस्' : 'Mark complete'}
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        reminder.isCompleted ? 'fill-emerald-500 text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ) : (
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3
                      className={`font-bold text-sm text-slate-800 dark:text-slate-100 ${
                        reminder.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {reminder.title}
                    </h3>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {isNe ? meta.labelNe : meta.labelEn}
                    </span>
                  </div>
                  {reminder.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{reminder.notes}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`text-[11px] font-bold ${
                        days !== null && days < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {statusLabel(reminder.type, filter === 'completed' ? null : days)}
                    </span>
                    {reminder.amount != null && (
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {formatNepaliCurrency(reminder.amount)}
                      </span>
                    )}
                  </div>
                </div>

                {confirmDeleteId === reminder.id ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white"
                    >
                      {t.confirm}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      {t.cancel}
                    </button>
                  </div>
                ) : (
                  <button
                    id={`reminder-delete-btn-${reminder.id}`}
                    onClick={() => setConfirmDeleteId(reminder.id)}
                    className="shrink-0 p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        id="reminders-fab"
        onClick={() => openModal('task')}
        className="fixed bottom-24 right-5 z-30 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl flex items-center justify-center transition-all active:scale-95"
        aria-label={isNe ? 'रिमाइन्डर थप्नुहोस्' : 'Add reminder'}
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Reminder Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-[2rem] sm:rounded-[2rem] max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                {isNe ? 'नयाँ रिमाइन्डर' : 'New Reminder'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type picker */}
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(TYPE_META) as (keyof typeof TYPE_META)[]).map((key) => {
                const meta = TYPE_META[key];
                const Icon = meta.icon;
                const isActive = formType === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setFormType(key);
                      setFormRepeat(meta.defaultRepeat);
                    }}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                      isActive
                        ? 'border-red-600 bg-red-50/70 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {isNe ? meta.labelNe : meta.labelEn}
                  </button>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'शीर्षक' : 'Title'}
              </label>
              <input
                id="reminder-title-input"
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder={isNe ? TYPE_META[formType].placeholderNe : TYPE_META[formType].placeholderEn}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {formType === 'birthday'
                  ? isNe ? 'जन्म मिति' : 'Birth Date'
                  : formType === 'anniversary'
                    ? isNe ? 'वार्षिकोत्सव मिति' : 'Anniversary Date'
                    : isNe ? 'मिति' : 'Date'}
              </label>
              <AdDatePicker idPrefix="reminder-date" value={formDate} onChange={setFormDate} language={language} />
            </div>

            {formType === 'bill' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.amount} ({isNe ? 'ऐच्छिक' : 'optional'})
                </label>
                <input
                  type="number"
                  min="0"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            )}

            {(formType === 'task' || formType === 'bill') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isNe ? 'दोहोरिने' : 'Repeat'}
                </label>
                <select
                  value={formRepeat}
                  onChange={(e) => setFormRepeat(e.target.value as RepeatMode)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="none">{isNe ? 'एकपटक मात्र' : 'One-time'}</option>
                  <option value="daily">{isNe ? 'दैनिक' : 'Daily'}</option>
                  <option value="weekly">{isNe ? 'साप्ताहिक' : 'Weekly'}</option>
                  <option value="monthly">{isNe ? 'मासिक' : 'Monthly'}</option>
                  <option value="yearly">{isNe ? 'वार्षिक' : 'Yearly'}</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {isNe ? 'टिप्पणी (ऐच्छिक)' : 'Notes (optional)'}
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                id="reminder-save-btn"
                onClick={handleSave}
                disabled={!formTitle.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
