import React, { Suspense, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Map,
  MapPin,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { ADDate, Language, ReminderLocation, ReminderRecord, ReminderType, RepeatMode } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { getTodayDate, toNepaliDigits } from '../../calendar/bsCalendar';
import { formatNepaliCurrency } from '../../services/forex';
import {
  getReminders,
  saveReminder,
  updateReminder,
  deleteReminder,
  toggleReminderCompleted,
  getDaysUntil,
} from '../../services/reminders';
import { formatTime12h } from '../../calculations/reminderOccurrence';
import { AdDatePicker } from '../AdDatePicker';
import { TYPE_META } from '../../data/reminderTypeMeta';
import { searchPlaces, PlaceSearchResult } from '../../services/places';
import {
  registerGeofence,
  unregisterGeofence,
  reconcileGeofences,
  requestLocationPermission,
} from '../../services/geofences';

const LocationMapPicker = React.lazy(() =>
  import('./LocationMapPicker').then((m) => ({ default: m.LocationMapPicker }))
);

const RADIUS_PRESETS = [100, 200, 500, 1000];

interface RemindersProps {
  language: Language;
  onBack?: () => void;
}

type FilterType = 'today' | 'missed' | 'upcoming' | 'completed' | 'all';

const TITLE_MAX_LENGTH = 30;

function todayAd(): ADDate {
  return getTodayDate().ad;
}

export const Reminders: React.FC<RemindersProps> = ({ language, onBack }) => {
  const t = getTranslation(language);
  const isNe = language === 'ne';
  const today = todayAd();

  const [reminders, setReminders] = useState<ReminderRecord[]>(() => getReminders());
  const [filter, setFilter] = useState<FilterType>('today');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Add/Edit reminder modal state — editingId is null when creating a new
  // reminder, or the reminder's id when the modal was opened via Edit.
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<keyof typeof TYPE_META>('task');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState<ADDate>(today);
  const [formTime, setFormTime] = useState('');
  const [formRepeat, setFormRepeat] = useState<RepeatMode>('none');
  const [formAmount, setFormAmount] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Location-reminder-only form state.
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState<PlaceSearchResult[]>([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(null);
  const [locationRadius, setLocationRadius] = useState(200);
  const [locationTrigger, setLocationTrigger] = useState<'enter' | 'exit'>('enter');
  const [locationError, setLocationError] = useState<string | null>(null);
  const [savingLocation, setSavingLocation] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  // Reconcile native geofences against saved reminders once on mount —
  // covers the OS having dropped a region (e.g. after a device restart).
  useEffect(() => {
    reconcileGeofences(reminders).catch(() => {
      // Best-effort — a failed reconcile shouldn't block using the tool.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formType !== 'location' || locationQuery.trim().length < 2) {
      setLocationResults([]);
      return;
    }
    setLocationSearching(true);
    const handle = setTimeout(() => {
      searchPlaces(locationQuery).then((results) => {
        setLocationResults(results);
        setLocationSearching(false);
      });
    }, 400);
    return () => clearTimeout(handle);
  }, [locationQuery, formType]);

  const openModal = (type: keyof typeof TYPE_META) => {
    setEditingId(null);
    setFormType(type);
    setFormTitle('');
    setFormDate(today);
    setFormTime('');
    setFormRepeat(TYPE_META[type].defaultRepeat);
    setFormAmount('');
    setFormNotes('');
    setLocationQuery('');
    setLocationResults([]);
    setSelectedPlace(null);
    setLocationRadius(200);
    setLocationTrigger('enter');
    setLocationError(null);
    setShowModal(true);
  };

  const openEditModal = (reminder: ReminderRecord) => {
    setEditingId(reminder.id);
    setFormType((reminder.type as keyof typeof TYPE_META) || 'task');
    setFormTitle(reminder.title);
    setFormDate(reminder.dateAd);
    setFormTime(reminder.time || '');
    setFormRepeat(reminder.repeat);
    setFormAmount(reminder.amount != null ? String(reminder.amount) : '');
    setFormNotes(reminder.notes || '');
    if (reminder.location) {
      setLocationQuery(reminder.location.name);
      setSelectedPlace({ name: reminder.location.name, lat: reminder.location.lat, lng: reminder.location.lng });
      setLocationRadius(reminder.location.radiusMeters);
      setLocationTrigger(reminder.location.trigger);
    } else {
      setLocationQuery('');
      setSelectedPlace(null);
      setLocationRadius(200);
      setLocationTrigger('enter');
    }
    setLocationResults([]);
    setLocationError(null);
    setShowModal(true);
  };

  const handleSelectPlace = (place: PlaceSearchResult) => {
    setSelectedPlace(place);
    setLocationQuery(place.name);
    setLocationResults([]);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) return;

    if (formType === 'location') {
      if (!selectedPlace) {
        setLocationError(isNe ? 'कृपया सूचीबाट स्थान छान्नुहोस्।' : 'Please pick a location from the search results.');
        return;
      }
      setLocationError(null);
      setSavingLocation(true);
      try {
        const permission = await requestLocationPermission();
        if (!permission.foregroundGranted) {
          setLocationError(
            isNe
              ? 'स्थान अनुमति अस्वीकृत भयो। सेटिङ्समा गई अनुमति दिनुहोस्।'
              : 'Location permission was denied. Enable it in Settings to use location reminders.'
          );
          setSavingLocation(false);
          return;
        }

        const location: ReminderLocation = {
          name: selectedPlace.name,
          lat: selectedPlace.lat,
          lng: selectedPlace.lng,
          radiusMeters: locationRadius,
          trigger: locationTrigger,
          nativeGeofenceId: null,
        };
        const payload = {
          type: formType,
          title: formTitle,
          notes: formNotes,
          dateAd: today,
          time: null,
          repeat: 'none' as RepeatMode,
          amount: null,
          location,
        };

        // Unregister first when editing, in case coordinates/radius/trigger
        // changed — always re-register fresh rather than trying to diff.
        if (editingId) {
          await unregisterGeofence(editingId);
          updateReminder(editingId, payload);
        } else {
          saveReminder(payload);
        }

        const allReminders = getReminders();
        const savedRecord = editingId
          ? allReminders.find((r) => r.id === editingId)
          : allReminders[0]; // saveReminder() unshifts the new record to the front
        if (savedRecord) await registerGeofence(savedRecord);

        setReminders(allReminders);
        setShowModal(false);
      } catch {
        setLocationError(isNe ? 'स्थान रिमाइन्डर सेट गर्न सकिएन।' : 'Could not set up the location reminder.');
      } finally {
        setSavingLocation(false);
      }
      return;
    }

    const payload = {
      type: formType,
      title: formTitle,
      notes: formNotes,
      dateAd: formDate,
      time: formTime || null,
      repeat: formRepeat,
      amount: formType === 'bill' && formAmount ? Number(formAmount) : null,
      location: null,
    };
    if (editingId) {
      updateReminder(editingId, payload);
    } else {
      saveReminder(payload);
    }
    setReminders(getReminders());
    setShowModal(false);
  };

  const handleToggleComplete = (id: string) => {
    toggleReminderCompleted(id);
    setReminders(getReminders());
  };

  const handleDelete = (id: string) => {
    unregisterGeofence(id).catch(() => {});
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
      // Chronological: overdue/today/tomorrow/later by day-count ascending,
      // with completed one-time reminders (no date left to sort by) at the end.
      return reminders
        .map((r) => ({ reminder: r, days: getDaysUntil(r, today) }))
        .sort((a, b) => {
          if (a.days === null && b.days === null) return 0;
          if (a.days === null) return 1;
          if (b.days === null) return -1;
          return a.days - b.days;
        });
    }
    if (filter === 'today') {
      return withDays.filter((x) => x.days === 0);
    }
    if (filter === 'missed') {
      // Only one-time reminders can be "missed" — recurring ones (birthday,
      // anniversary, monthly bill) auto-advance to their next occurrence
      // instead of going negative, so there's nothing to catch up on.
      return withDays
        .filter((x) => x.reminder.repeat === 'none' && !x.reminder.isCompleted && x.days < 0)
        .sort((a, b) => a.days - b.days);
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

  const missedCount = useMemo(
    () => withDays.filter((x) => x.reminder.repeat === 'none' && !x.reminder.isCompleted && x.days < 0).length,
    [withDays]
  );

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: isNe ? 'सबै' : 'All' },
    { id: 'today', label: isNe ? 'आज' : 'Today' },
    {
      id: 'missed',
      label:
        missedCount > 0
          ? isNe
            ? `छुटेको (${toNepaliDigits(missedCount)})`
            : `Missed (${missedCount})`
          : isNe
            ? 'छुटेको'
            : 'Missed',
    },
    { id: 'upcoming', label: isNe ? 'आगामी' : 'Upcoming' },
    { id: 'completed', label: isNe ? 'सम्पन्न' : 'Completed' },
  ];

  const emptyMessage: Record<FilterType, string> = {
    today: isNe ? 'आजको लागि कुनै रिमाइन्डर छैन।' : 'No reminders for today.',
    missed: isNe ? 'कुनै छुटेको रिमाइन्डर छैन।' : 'No missed reminders — you\'re all caught up.',
    upcoming: isNe ? 'कुनै आगामी रिमाइन्डर छैन।' : 'No upcoming reminders.',
    completed: isNe ? 'कुनै सम्पन्न कार्य छैन।' : 'No completed reminders yet.',
    all: isNe ? 'अहिलेसम्म कुनै रिमाइन्डर छैन।' : 'No reminders yet.',
  };

  return (
    <div id="reminders-tool" className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            {isNe ? 'रिमाइन्डरहरू' : 'Reminders'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isNe ? 'कार्य, जन्मदिन, बिल र थप' : 'Tasks, birthdays, bills and more'}
          </p>
        </div>
        {onBack && (
          <button
            id="tool-back-btn"
            onClick={onBack}
            aria-label={isNe ? 'पछाडि' : 'Back'}
            title={isNe ? 'पछाडि (Back)' : 'Back'}
            className="flex-shrink-0 flex items-center justify-center gap-2 w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline">{isNe ? 'पछाडि (Back)' : 'Back'}</span>
          </button>
        )}
      </div>

      {/* Quick add row */}
      <div className="grid grid-cols-5 gap-1.5">
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
            const canComplete = reminder.repeat === 'none' && reminder.type !== 'location';
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
                        reminder.isCompleted ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
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
                    {reminder.type === 'location' && reminder.location ? (
                      <>
                        <span className="text-[11px] font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {reminder.location.trigger === 'enter'
                            ? isNe ? 'आइपुग्दा' : 'On arrival'
                            : isNe ? 'छोड्दा' : 'On leaving'}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                          {reminder.location.name} · {reminder.location.radiusMeters}m
                        </span>
                      </>
                    ) : (
                      <>
                        <span
                          className={`text-[11px] font-bold ${
                            days !== null && days < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {statusLabel(reminder.type, filter === 'completed' ? null : days)}
                        </span>
                        {reminder.time && (
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {formatTime12h(reminder.time, isNe)}
                          </span>
                        )}
                        {reminder.amount != null && (
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            {formatNepaliCurrency(reminder.amount)}
                          </span>
                        )}
                      </>
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
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      id={`reminder-edit-btn-${reminder.id}`}
                      onClick={() => openEditModal(reminder)}
                      aria-label={t.edit}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      id={`reminder-delete-btn-${reminder.id}`}
                      onClick={() => setConfirmDeleteId(reminder.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-5 z-30 w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl flex items-center justify-center transition-all active:scale-95"
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
                {editingId
                  ? isNe ? 'रिमाइन्डर सम्पादन गर्नुहोस्' : 'Edit Reminder'
                  : isNe ? 'नयाँ रिमाइन्डर' : 'New Reminder'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type picker */}
            <div className="grid grid-cols-5 gap-1.5">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isNe ? 'शीर्षक' : 'Title'}
                </label>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  {formTitle.length}/{TITLE_MAX_LENGTH}
                </span>
              </div>
              <input
                id="reminder-title-input"
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                maxLength={TITLE_MAX_LENGTH}
                placeholder={isNe ? TYPE_META[formType].placeholderNe : TYPE_META[formType].placeholderEn}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            {formType === 'location' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isNe ? 'स्थान खोज्नुहोस्' : 'Search location'}
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={locationQuery}
                      onChange={(e) => {
                        setLocationQuery(e.target.value);
                        setSelectedPlace(null);
                      }}
                      placeholder={isNe ? 'ठाउँको नाम टाइप गर्नुहोस्...' : 'Type a place name...'}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                  </div>
                  {locationSearching && (
                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                      {isNe ? 'खोज्दै...' : 'Searching...'}
                    </p>
                  )}
                  {!locationSearching && locationResults.length > 0 && (
                    <div className="mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                      {locationResults.map((place, idx) => (
                        <button
                          key={`${place.lat}-${place.lng}-${idx}`}
                          type="button"
                          onClick={() => handleSelectPlace(place)}
                          className="w-full text-left px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          {place.name}
                        </button>
                      ))}
                    </div>
                  )}
                  {!locationSearching && !selectedPlace && locationQuery.trim().length >= 2 && locationResults.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setShowMapPicker(true)}
                      className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400"
                    >
                      <Map className="w-3.5 h-3.5" />
                      {isNe ? "फेला परेन? नक्सामा छान्नुहोस्" : "Can't find it? Pick on map"}
                    </button>
                  )}
                  {selectedPlace && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedPlace.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isNe ? 'दायरा' : 'Radius'}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {RADIUS_PRESETS.map((radius) => (
                      <button
                        key={radius}
                        type="button"
                        onClick={() => setLocationRadius(radius)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          locationRadius === radius
                            ? 'bg-violet-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isNe ? 'कहिले सूचित गर्ने' : 'Notify me when I'}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setLocationTrigger('enter')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        locationTrigger === 'enter'
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isNe ? 'आइपुग्दा' : 'Arrive'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationTrigger('exit')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        locationTrigger === 'exit'
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isNe ? 'छोड्दा' : 'Leave'}
                    </button>
                  </div>
                </div>

                {locationError && (
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">{locationError}</p>
                )}
              </div>
            ) : (
              <>
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isNe ? 'समय (ऐच्छिक)' : 'Time (optional)'}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="reminder-time-input"
                      type="time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    {formTime && (
                      <button
                        type="button"
                        onClick={() => setFormTime('')}
                        className="shrink-0 px-3 py-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        {isNe ? 'हटाउनुहोस्' : 'Clear'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

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
                disabled={!formTitle.trim() || savingLocation}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingLocation ? (isNe ? 'बचत गर्दै...' : 'Saving...') : t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {showMapPicker && (
        <Suspense fallback={null}>
          <LocationMapPicker
            language={language}
            initialCenter={selectedPlace ? { lat: selectedPlace.lat, lng: selectedPlace.lng } : null}
            onCancel={() => setShowMapPicker(false)}
            onConfirm={(place) => {
              handleSelectPlace(place);
              setShowMapPicker(false);
            }}
          />
        </Suspense>
      )}
    </div>
  );
};
