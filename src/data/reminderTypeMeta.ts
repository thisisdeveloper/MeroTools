import React from 'react';
import { Cake, Heart, ListTodo, MapPin, Receipt } from 'lucide-react';
import { ReminderType, RepeatMode } from '../types';

// Lives outside components/tools/Reminders.tsx (a lazy-loaded route chunk)
// so that other eagerly-bundled pieces — like the Home dashboard's
// RemindersSummaryCard — can reuse this metadata without dragging the
// entire Reminders tool page (its modal, list, filters, etc.) into the
// main bundle. A static import from a lazy chunk defeats React.lazy's
// code-splitting for that chunk.
export const TYPE_META: Record<
  Extract<ReminderType, 'task' | 'birthday' | 'anniversary' | 'bill' | 'location'>,
  {
    icon: React.FC<{ className?: string }>;
    iconBg: string;
    accentText: string;
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
    accentText: 'text-blue-700 dark:text-blue-400',
    defaultRepeat: 'none',
    labelEn: 'Task',
    labelNe: 'कार्य',
    placeholderEn: 'e.g. Pay electricity bill',
    placeholderNe: 'जस्तै: बिजुली बिल तिर्ने',
  },
  birthday: {
    icon: Cake,
    iconBg: 'bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400',
    accentText: 'text-pink-700 dark:text-pink-400',
    defaultRepeat: 'yearly',
    labelEn: 'Birthday',
    labelNe: 'जन्मदिन',
    placeholderEn: "e.g. Rahul's Birthday",
    placeholderNe: 'जस्तै: राहुलको जन्मदिन',
  },
  anniversary: {
    icon: Heart,
    iconBg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    accentText: 'text-rose-700 dark:text-rose-400',
    defaultRepeat: 'yearly',
    labelEn: 'Anniversary',
    labelNe: 'वार्षिकोत्सव',
    placeholderEn: 'e.g. Wedding Anniversary',
    placeholderNe: 'जस्तै: विवाह वार्षिकोत्सव',
  },
  bill: {
    icon: Receipt,
    iconBg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    accentText: 'text-amber-700 dark:text-amber-400',
    defaultRepeat: 'monthly',
    labelEn: 'Bill',
    labelNe: 'बिल',
    placeholderEn: 'e.g. Internet Bill',
    placeholderNe: 'जस्तै: इन्टरनेट बिल',
  },
  location: {
    icon: MapPin,
    iconBg: 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
    accentText: 'text-violet-700 dark:text-violet-400',
    defaultRepeat: 'none',
    labelEn: 'Location',
    labelNe: 'स्थान',
    placeholderEn: 'e.g. Buy vegetables',
    placeholderNe: 'जस्तै: तरकारी किन्ने',
  },
};
