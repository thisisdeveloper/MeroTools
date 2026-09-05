import { ADDate, ReminderRecord } from '../types';

const MS_PER_DAY = 86400000;

function toEpochDayCount(ad: ADDate): number {
  return Date.UTC(ad.year, ad.month - 1, ad.day) / MS_PER_DAY;
}

function fromEpochDayCount(days: number): ADDate {
  const d = new Date(days * MS_PER_DAY);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// Returns the next relevant date for a reminder as of `today`, or null if
// it's a completed one-time reminder with nothing left to show.
export function getNextOccurrence(reminder: ReminderRecord, today: ADDate): ADDate | null {
  const { dateAd, repeat, isCompleted } = reminder;

  if (repeat === 'none') {
    return isCompleted ? null : dateAd;
  }

  const todayEpoch = toEpochDayCount(today);
  const anchorEpoch = toEpochDayCount(dateAd);

  // Anchor date itself hasn't happened yet — that's the next occurrence.
  if (anchorEpoch >= todayEpoch) {
    return dateAd;
  }

  if (repeat === 'daily' || repeat === 'weekly') {
    const stepDays = repeat === 'weekly' ? 7 : 1;
    const elapsed = todayEpoch - anchorEpoch;
    const steps = Math.ceil(elapsed / stepDays);
    return fromEpochDayCount(anchorEpoch + steps * stepDays);
  }

  if (repeat === 'monthly') {
    const todayMonthIndex = today.year * 12 + (today.month - 1);
    let monthIndex = Math.max(dateAd.year * 12 + (dateAd.month - 1), todayMonthIndex - 1);
    let candidate: ADDate;
    do {
      monthIndex += 1;
      const year = Math.floor(monthIndex / 12);
      const month = (monthIndex % 12) + 1;
      const day = Math.min(dateAd.day, daysInMonth(year, month));
      candidate = { year, month, day };
    } while (toEpochDayCount(candidate) < todayEpoch);
    return candidate;
  }

  // yearly — project the anchor's month/day onto the current or next year,
  // same technique as calculations/upcomingHoliday.ts.
  for (const year of [today.year, today.year + 1]) {
    const day = Math.min(dateAd.day, daysInMonth(year, dateAd.month));
    const candidate: ADDate = { year, month: dateAd.month, day };
    if (toEpochDayCount(candidate) >= todayEpoch) return candidate;
  }

  return null;
}

// Signed day count to the next occurrence — negative means overdue (only
// possible for one-time reminders; recurring ones always resolve to a
// future-or-today date). Plain epoch-day subtraction is used rather than
// calculations/dateDifference.ts's calculateDateDiffAd because that
// function always returns an absolute value, which would hide overdue
// status entirely.
export function getDaysUntil(reminder: ReminderRecord, today: ADDate): number | null {
  const next = getNextOccurrence(reminder, today);
  if (!next) return null;
  return toEpochDayCount(next) - toEpochDayCount(today);
}
