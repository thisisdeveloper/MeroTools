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
  regularDepositFrequency: 'monthly' | 'yearly' = 'monthly'
): CompoundInterestResult {
  const safeP = Math.max(0, principal || 0);
  const safeRate = Math.max(0, annualRatePct || 0);
  const safeYears = Math.max(0, years || 0);
  const safeMonths = Math.max(0, months || 0);
  const totalYears = safeYears + safeMonths / 12;
  const safeDeposit = Math.max(0, regularDeposit || 0);

  const n = getCompoundingFrequencyCount(frequency);
  const r = safeRate / 100;

  if (totalYears <= 0) {
    return {
      principalAmount: safeP,
      annualRate: safeRate,
      years: safeYears,
      months: safeMonths,
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
  let currentBalance = safeP;
  let cumulativePrincipal = safeP;
  const totalRoundedYears = Math.max(1, Math.ceil(totalYears));

  // Monthly breakdown simulation for accuracy
  const totalMonths = Math.round(totalYears * 12);
  let totalDeposited = safeP;

  // Track monthly balances
  let runningBal = safeP;
  const monthlyRatePerPeriod = r / n;
  
  // Calculate yearly schedule milestones
  let yearOpening = safeP;
  let yearContribution = 0;
  let yearInterest = 0;

  for (let m = 1; m <= totalMonths; m++) {
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
    // Monthly effective factor
    const monthlyCompoundingFactor = Math.pow(1 + monthlyRatePerPeriod, n / 12);
    const balanceAfterGrowth = runningBal * monthlyCompoundingFactor;
    const interestThisMonth = balanceAfterGrowth - runningBal;
    yearInterest += interestThisMonth;
    runningBal = balanceAfterGrowth;

    // At end of each full year or final month
    if (m % 12 === 0 || m === totalMonths) {
      const yearIndex = Math.ceil(m / 12);
      yearlySchedule.push({
        year: yearIndex,
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

  const maturityAmount = runningBal;
  const totalInterest = Math.max(0, maturityAmount - totalDeposited);

  // Simple Interest Comparison on the initial principal + contributions
  const simpleInterestPrincipal = safeP * r * totalYears;
  const simpleInterestDeposits =
    safeDeposit > 0
      ? (regularDepositFrequency === 'monthly'
          ? (safeDeposit * totalMonths * r * totalYears) / 2
          : (safeDeposit * totalRoundedYears * r * totalYears) / 2)
      : 0;
  const simpleInterestComparison = simpleInterestPrincipal + simpleInterestDeposits;
  const compoundInterestAdvantage = Math.max(0, totalInterest - simpleInterestComparison);

  return {
    principalAmount: safeP,
    annualRate: safeRate,
    years: safeYears,
    months: safeMonths,
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
