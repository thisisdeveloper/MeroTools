import { ADDate, RepeatMode, ReminderRecord, ReminderType } from '../types';
import { getNextOccurrence, getDaysUntil } from '../calculations/reminderOccurrence';

const STORAGE_KEY = 'merotools_reminders_v1';

export function getReminders(): ReminderRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt storage — treat as empty
  }
  return [];
}

function persist(reminders: ReminderRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

export interface NewReminderInput {
  type: ReminderType;
  title: string;
  notes?: string;
  dateAd: ADDate;
  time?: string | null;
  repeat: RepeatMode;
  amount?: number | null;
  notificationEnabled?: boolean;
}

export function saveReminder(input: NewReminderInput): ReminderRecord {
  const now = new Date().toISOString();
  const record: ReminderRecord = {
    id: `reminder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: input.type,
    title: input.title.trim() || 'Untitled Reminder',
    notes: input.notes?.trim() || '',
    dateAd: input.dateAd,
    time: input.time || null,
    repeat: input.repeat,
    amount: input.amount ?? null,
    notificationEnabled: input.notificationEnabled ?? false,
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };
  const reminders = getReminders();
  reminders.unshift(record);
  persist(reminders);
  return record;
}

export function updateReminder(id: string, patch: Partial<NewReminderInput>): void {
  const reminders = getReminders();
  const idx = reminders.findIndex((r) => r.id === id);
  if (idx === -1) return;
  reminders[idx] = {
    ...reminders[idx],
    ...patch,
    notes: patch.notes !== undefined ? patch.notes.trim() : reminders[idx].notes,
    updatedAt: new Date().toISOString(),
  };
  persist(reminders);
}

export function deleteReminder(id: string): void {
  persist(getReminders().filter((r) => r.id !== id));
}

export function toggleReminderCompleted(id: string): void {
  const reminders = getReminders();
  const idx = reminders.findIndex((r) => r.id === id);
  if (idx === -1) return;
  reminders[idx] = {
    ...reminders[idx],
    isCompleted: !reminders[idx].isCompleted,
    updatedAt: new Date().toISOString(),
  };
  persist(reminders);
}

export function getTodayReminders(reminders: ReminderRecord[], today: ADDate): ReminderRecord[] {
  return reminders.filter((r) => {
    if (r.repeat === 'none' && r.isCompleted) return false;
    const days = getDaysUntil(r, today);
    return days === 0;
  });
}

export function getUpcomingReminders(
  reminders: ReminderRecord[],
  today: ADDate,
  withinDays: number = 30
): ReminderRecord[] {
  return reminders
    .filter((r) => {
      if (r.repeat === 'none' && r.isCompleted) return false;
      const days = getDaysUntil(r, today);
      return days !== null && days > 0 && days <= withinDays;
    })
    .sort((a, b) => (getDaysUntil(a, today) ?? Infinity) - (getDaysUntil(b, today) ?? Infinity));
}

export { getNextOccurrence, getDaysUntil };
