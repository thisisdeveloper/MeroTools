import { ADDate, BSDate, AgeResult } from '../types';
import { bsToAd, DAYS_EN, DAYS_NE } from '../calendar/bsCalendar';

export function calculateAgeFromAd(dobAd: ADDate, targetDateAd?: ADDate): AgeResult {
  const birthDate = new Date(Date.UTC(dobAd.year, dobAd.month - 1, dobAd.day));
  
  let targetDate: Date;
  if (targetDateAd) {
    targetDate = new Date(Date.UTC(targetDateAd.year, targetDateAd.month - 1, targetDateAd.day));
  } else {
    const now = new Date();
    targetDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  const birthDayOfWeek = birthDate.getUTCDay();
  const dayBornEn = DAYS_EN[birthDayOfWeek];
  const dayBornNe = DAYS_NE[birthDayOfWeek];

  const diffMs = targetDate.getTime() - birthDate.getTime();
  const totalDays = Math.max(0, Math.floor(diffMs / (24 * 60 * 60 * 1000)));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  let birthYear = birthDate.getUTCFullYear();
  let birthMonth = birthDate.getUTCMonth();
  let birthDay = birthDate.getUTCDate();

  let targetYear = targetDate.getUTCFullYear();
  let targetMonth = targetDate.getUTCMonth();
  let targetDay = targetDate.getUTCDate();

  let years = targetYear - birthYear;
  let months = targetMonth - birthMonth;
  let days = targetDay - birthDay;

  if (days < 0) {
    // Days in previous month of target date
    const prevMonthDays = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
    days += prevMonthDays;
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  // Next birthday calculation
  let nextBirthdayYear = targetYear;
  let nextBirthday = new Date(Date.UTC(nextBirthdayYear, birthMonth, birthDay));
  
  if (nextBirthday.getTime() < targetDate.getTime()) {
    nextBirthdayYear++;
    nextBirthday = new Date(Date.UTC(nextBirthdayYear, birthMonth, birthDay));
  }

  const isTodayBirthday = targetMonth === birthMonth && targetDay === birthDay;

  const nextBirthdayDiffMs = nextBirthday.getTime() - targetDate.getTime();
  const nextBirthdayInDaysTotal = Math.max(0, Math.floor(nextBirthdayDiffMs / (24 * 60 * 60 * 1000)));
  
  const nextBirthdayMonths = Math.floor(nextBirthdayInDaysTotal / 30.4375);
  const nextBirthdayDays = Math.floor(nextBirthdayInDaysTotal % 30.4375);

  const nextBirthdayDayOfWeek = nextBirthday.getUTCDay();
  const nextBirthdayDayEn = DAYS_EN[nextBirthdayDayOfWeek];
  const nextBirthdayDayNe = DAYS_NE[nextBirthdayDayOfWeek];

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays,
    totalWeeks,
    totalHours,
    dayBornEn,
    dayBornNe,
    nextBirthdayInMonths: isTodayBirthday ? 0 : nextBirthdayMonths,
    nextBirthdayInDays: isTodayBirthday ? 0 : nextBirthdayDays,
    nextBirthdayDayEn,
    nextBirthdayDayNe,
    isTodayBirthday,
  };
}

export function calculateAgeFromBs(dobBs: BSDate, targetDateAd?: ADDate): AgeResult {
  const converted = bsToAd(dobBs);
  return calculateAgeFromAd(converted.ad, targetDateAd);
}
