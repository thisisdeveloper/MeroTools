import { ADDate, DateConversionResult } from '../types';
import { NepalHoliday } from '../data/holidaysData';
import { bsToAd, getDaysInBSMonth } from '../calendar/bsCalendar';
import { calculateDateDiffAd } from './dateDifference';

export interface UpcomingHolidayResult {
  holiday: NepalHoliday;
  daysUntil: number;
  adDate: ADDate;
}

function toEpochDay(ad: ADDate): number {
  return Date.UTC(ad.year, ad.month - 1, ad.day);
}

// The holidays dataset only has real dates for one BS year, so a holiday's
// next occurrence is projected by reusing its BS month/day against the
// current (and next) BS year — exact for fixed-date holidays, approximate
// by a few days for lunar-timed festivals whose BS date shifts yearly.
function projectNextOccurrence(holiday: NepalHoliday, today: DateConversionResult): ADDate {
  const todayEpoch = toEpochDay(today.ad);

  for (const bsYear of [today.bs.year, today.bs.year + 1]) {
    const maxDay = getDaysInBSMonth(bsYear, holiday.bsMonth);
    const day = Math.min(holiday.bsDay, maxDay);
    const candidateAd = bsToAd({ year: bsYear, month: holiday.bsMonth, day }).ad;
    if (toEpochDay(candidateAd) >= todayEpoch) {
      return candidateAd;
    }
  }

  // Should be unreachable (the next-BS-year candidate is always in the
  // future), but fall back to the next-year projection regardless.
  const maxDay = getDaysInBSMonth(today.bs.year + 1, holiday.bsMonth);
  return bsToAd({ year: today.bs.year + 1, month: holiday.bsMonth, day: Math.min(holiday.bsDay, maxDay) }).ad;
}

export function getNextUpcomingHoliday(
  holidays: NepalHoliday[],
  today: DateConversionResult
): UpcomingHolidayResult | null {
  let best: UpcomingHolidayResult | null = null;

  for (const holiday of holidays) {
    if (!holiday.isPublicHoliday) continue;

    const adDate = projectNextOccurrence(holiday, today);
    const daysUntil = calculateDateDiffAd(today.ad, adDate).totalDays;

    if (!best || daysUntil < best.daysUntil) {
      best = { holiday, daysUntil, adDate };
    }
  }

  return best;
}
