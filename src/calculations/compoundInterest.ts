import {
  CompoundingFrequency,
  CompoundInterestResult,
  CompoundInterestYearlySchedule,
} from '../types';

export function getCompoundingFrequencyCount(freq: CompoundingFrequency): number {
  switch (freq) {
    case 'annual':
      return 1;
    case 'semi-annual':
      return 2;
    case 'quarterly':
      return 4;
    case 'monthly':
      return 12;
    case 'daily':
      return 365;
    default:
      return 1;
  }
}

export function calculateCompoundInterest(
  principal: number,
  annualRatePct: number,
  years: number,
  months: number = 0,
  frequency: CompoundingFrequency = 'annual',
  regularDeposit: number = 0,
  regularDepositFrequency: 'monthly' | 'yearly' = 'monthly',
  days: number = 0,
  // Exact elapsed days between two real calendar dates, when the tenure
  // came from a date range (e.g. a loan's start date to today) rather
  // than freeform manual entry. years+months/12+days/365 treats every
  // month as a fixed 30.44 days, which doesn't match the real number of
  // days actually spanned (28-31 depending which months) — over a
  // several-month span that mismatch is a few days' worth of extra or
  // missing interest. Pass this whenever a real totalDays is available
  // (see calculateDateDiffAd's totalDays) to compute the year-fraction
  // precisely instead. Manual duration entry has no calendar anchor to
  // be exact about, so it's left on the approximate calculation.
  exactTotalDays?: number
): CompoundInterestResult {
  const safeP = Math.max(0, principal || 0);
  const safeRate = Math.max(0, annualRatePct || 0);
  const safeYears = Math.max(0, years || 0);
  const safeMonths = Math.max(0, months || 0);
  const safeDays = Math.max(0, days || 0);
  const totalYears =
    exactTotalDays !== undefined && exactTotalDays >= 0
      ? exactTotalDays / 365
      : safeYears + safeMonths / 12 + safeDays / 365;
  const safeDeposit = Math.max(0, regularDeposit || 0);

  const n = getCompoundingFrequencyCount(frequency);
  const r = safeRate / 100;

  if (totalYears <= 0) {
    return {
      principalAmount: safeP,
      annualRate: safeRate,
      years: safeYears,
      months: safeMonths,
      days: safeDays,
      frequency,
      regularDeposit: safeDeposit,
      regularDepositFrequency,
      totalDeposit: safeP,
      totalInterest: 0,
      maturityAmount: safeP,
      simpleInterestComparison: 0,
      compoundInterestAdvantage: 0,
      yearlySchedule: [],
    };
  }

  // Generate Year-by-Year Schedule
  const yearlySchedule: CompoundInterestYearlySchedule[] = [];
  const totalRoundedYears = Math.max(1, Math.ceil(totalYears));

  // Monthly breakdown simulation for accuracy. totalMonthsExact is almost
  // never a whole number (e.g. 6.77 for "6 months 25 days") — rounding it
  // to the nearest integer month (the old behavior) silently snaps any
  // period to the nearest whole month, which for a period like 15 days
  // rounds DOWN to 0 months and reports zero interest, and elsewhere
  // makes the "interest till today" figure stay frozen for 2-3 weeks at a
  // stretch since many different day-counts round to the same month
  // count. Instead, simulate whileMonths full months as before, then
  // apply one final partial-period growth step (no deposit — a deposit
  // schedule doesn't get a pro-rated contribution for a partial period)
  // for whatever fraction of a month is left over, so every extra day
  // actually moves the number.
  const totalMonthsExact = totalYears * 12;
  const EPSILON = 1e-9;
  const wholeMonths = Math.floor(totalMonthsExact + EPSILON);
  const fractionalMonth = Math.max(0, totalMonthsExact - wholeMonths);
  let totalDeposited = safeP;

  // Track monthly balances
  let runningBal = safeP;
  const monthlyRatePerPeriod = r / n;
  const monthlyCompoundingFactor = Math.pow(1 + monthlyRatePerPeriod, n / 12);

  // Calculate yearly schedule milestones
  let yearOpening = safeP;
  let yearContribution = 0;
  let yearInterest = 0;

  for (let m = 1; m <= wholeMonths; m++) {
    // Add deposit at start/during month
    if (safeDeposit > 0) {
      if (regularDepositFrequency === 'monthly') {
        runningBal += safeDeposit;
        totalDeposited += safeDeposit;
        yearContribution += safeDeposit;
      } else if (regularDepositFrequency === 'yearly' && m % 12 === 1) {
        runningBal += safeDeposit;
        totalDeposited += safeDeposit;
        yearContribution += safeDeposit;
      }
    }

    // Apply compounding for 1 month (1/12th of year)
    const balanceAfterGrowth = runningBal * monthlyCompoundingFactor;
    const interestThisMonth = balanceAfterGrowth - runningBal;
    yearInterest += interestThisMonth;
    runningBal = balanceAfterGrowth;

    // At end of each full year — the very last whole month only closes
    // the schedule here if there's no partial period left to fold in.
    const isLastWholeMonth = m === wholeMonths && fractionalMonth <= EPSILON;
    if (m % 12 === 0 || isLastWholeMonth) {
      yearlySchedule.push({
        year: Math.ceil(m / 12),
        openingBalance: yearOpening,
        annualContribution: yearContribution,
        interestEarned: yearInterest,
        closingBalance: runningBal,
        totalInvested: totalDeposited,
      });

      yearOpening = runningBal;
      yearContribution = 0;
      yearInterest = 0;
    }
  }

  // Partial final period — the leftover days that don't add up to a full
  // month (e.g. the 25 days after 6 whole months, or the entirety of a
  // brand-new 15-day-old loan where wholeMonths is 0).
  if (fractionalMonth > EPSILON) {
    const partialCompoundingFactor = Math.pow(1 + monthlyRatePerPeriod, (n / 12) * fractionalMonth);
    const balanceAfterGrowth = runningBal * partialCompoundingFactor;
    const interestThisPeriod = balanceAfterGrowth - runningBal;
    yearInterest += interestThisPeriod;
    runningBal = balanceAfterGrowth;

    yearlySchedule.push({
      year: Math.ceil((wholeMonths + 1) / 12),
      openingBalance: yearOpening,
      annualContribution: yearContribution,
      interestEarned: yearInterest,
      closingBalance: runningBal,
      totalInvested: totalDeposited,
    });
  }

  const maturityAmount = runningBal;
  const totalInterest = Math.max(0, maturityAmount - totalDeposited);

  // Simple Interest Comparison on the initial principal + contributions
  const simpleInterestPrincipal = safeP * r * totalYears;
  const simpleInterestDeposits =
    safeDeposit > 0
      ? (regularDepositFrequency === 'monthly'
          ? (safeDeposit * Math.round(totalMonthsExact) * r * totalYears) / 2
          : (safeDeposit * totalRoundedYears * r * totalYears) / 2)
      : 0;
  const simpleInterestComparison = simpleInterestPrincipal + simpleInterestDeposits;
  const compoundInterestAdvantage = Math.max(0, totalInterest - simpleInterestComparison);

  return {
    principalAmount: safeP,
    annualRate: safeRate,
    years: safeYears,
    months: safeMonths,
    days: safeDays,
    frequency,
    regularDeposit: safeDeposit,
    regularDepositFrequency,
    totalDeposit: totalDeposited,
    totalInterest,
    maturityAmount,
    simpleInterestComparison,
    compoundInterestAdvantage,
    yearlySchedule,
  };
}
