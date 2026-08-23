import { EmiResult, EmiYearlyBreakdown } from '../types';

export function calculateEmi(principal: number, annualRate: number, tenureYears: number, tenureMonths: number = 0): EmiResult {
  const p = Math.max(0, isNaN(principal) ? 0 : principal);
  const rate = Math.max(0, isNaN(annualRate) ? 0 : annualRate);
  const totalMonths = Math.max(1, (isNaN(tenureYears) ? 0 : tenureYears) * 12 + (isNaN(tenureMonths) ? 0 : tenureMonths));

  if (p === 0 || totalMonths === 0) {
    return {
      monthlyEmi: 0,
      principalAmount: 0,
      interestRate: rate,
      tenureMonths: totalMonths,
      totalInterest: 0,
      totalPayment: 0,
      yearlyBreakdown: [],
    };
  }

  // Handle 0% interest rate edge case
  if (rate === 0) {
    const emi = p / totalMonths;
    return {
      monthlyEmi: Math.round(emi),
      principalAmount: p,
      interestRate: 0,
      tenureMonths: totalMonths,
      totalInterest: 0,
      totalPayment: p,
      yearlyBreakdown: [],
    };
  }

  const monthlyRate = rate / 12 / 100;
  const emi = (p * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - p;

  // Generate yearly amortization breakdown
  let balance = p;
  const yearlyBreakdown: EmiYearlyBreakdown[] = [];
  const totalYears = Math.ceil(totalMonths / 12);

  for (let y = 1; y <= totalYears; y++) {
    let yearPrincipal = 0;
    let yearInterest = 0;
    const monthsInThisYear = Math.min(12, totalMonths - (y - 1) * 12);

    for (let m = 1; m <= monthsInThisYear; m++) {
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = emi - interestForMonth;

      yearInterest += interestForMonth;
      yearPrincipal += principalForMonth;
      balance = Math.max(0, balance - principalForMonth);
    }

    yearlyBreakdown.push({
      year: y,
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      totalPayment: Math.round(yearPrincipal + yearInterest),
      remainingBalance: Math.round(balance),
    });
  }

  return {
    monthlyEmi: Math.round(emi),
    principalAmount: p,
    interestRate: rate,
    tenureMonths: totalMonths,
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    yearlyBreakdown,
  };
}
