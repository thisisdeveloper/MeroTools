import { ADDate, BSDate, DateDiffResult } from '../types';
import { bsToAd } from '../calendar/bsCalendar';

export function calculateDateDiffAd(startDate: ADDate, endDate: ADDate): DateDiffResult {
  const d1 = new Date(Date.UTC(startDate.year, startDate.month - 1, startDate.day));
  const d2 = new Date(Date.UTC(endDate.year, endDate.month - 1, endDate.day));

  const earlier = d1.getTime() <= d2.getTime() ? d1 : d2;
  const later = d1.getTime() <= d2.getTime() ? d2 : d1;

  const diffMs = later.getTime() - earlier.getTime();
  const totalDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const totalWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;
  const totalHours = totalDays * 24;

  let y1 = earlier.getUTCFullYear();
  let m1 = earlier.getUTCMonth();
  let day1 = earlier.getUTCDate();

  let y2 = later.getUTCFullYear();
  let m2 = later.getUTCMonth();
  let day2 = later.getUTCDate();

  let years = y2 - y1;
  let months = m2 - m1;
  let days = day2 - day1;

  if (days < 0) {
    const prevMonthDays = new Date(Date.UTC(y2, m2, 0)).getUTCDate();
    days += prevMonthDays;
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays,
    totalWeeks,
    remainingDays,
    totalHours,
  };
}

export function calculateDateDiffBs(startDateBs: BSDate, endDateBs: BSDate): DateDiffResult {
  const ad1 = bsToAd(startDateBs).ad;
  const ad2 = bsToAd(endDateBs).ad;
  return calculateDateDiffAd(ad1, ad2);
}
