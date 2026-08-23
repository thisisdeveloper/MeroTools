export interface TaxBracket {
  slabName: string;
  slabNameNe: string;
  limit: number; // max amount in this slab or Infinity
  taxableInSlab: number;
  ratePercent: number;
  taxAmount: number;
}

export interface SalaryTaxInput {
  status: 'single' | 'married'; // Individual vs Couple
  monthlySalary: number; // Monthly gross base salary
  bonusMonths: number; // Dashain bonus / festivals (e.g. 1 month)
  otherAllowancesMonthly: number;
  isSsfEnrolled: boolean; // 1% social security tax is exempt if enrolled in Social Security Fund (SSF)
  epfMonthly: number; // Employee Provident Fund (कर्मचारी सञ्चय कोष)
  citMonthly: number; // Citizen Investment Trust (नागरिक लगानी कोष)
  lifeInsuranceAnnual: number; // Max deduction limit NPR 40,000
  healthInsuranceAnnual: number; // Max deduction limit NPR 20,000
  remoteAreaDeductionAnnual: number; // Category A (50k), B (40k), C (30k), D (20k), E (10k)
}

export interface SalaryTaxResult {
  grossMonthlyIncome: number;
  grossAnnualIncome: number;
  totalAnnualDeductions: number;
  netTaxableIncome: number;
  brackets: TaxBracket[];
  totalAnnualTax: number;
  totalMonthlyTax: number;
  netAnnualTakeHome: number;
  netMonthlyTakeHome: number;
  effectiveTaxRate: number;
  ssfDeductionAnnual: number;
  ssfDeductionMonthly: number;
  epfDeductionAnnual: number;
  citDeductionAnnual: number;
  insuranceDeductionAnnual: number;
}

/**
 * Calculate Nepal Income Tax as per Finance Act (Inland Revenue Department / IRD)
 * Single Slabs:
 * 1. First 5,00,000 @ 1% (or 0% if SSF)
 * 2. Next 2,00,000 (5L - 7L) @ 10%
 * 3. Next 3,00,000 (7L - 10L) @ 20%
 * 4. Next 10,00,000 (10L - 20L) @ 30%
 * 5. Next 30,00,000 (20L - 50L) @ 36%
 * 6. Above 50,00,000 @ 39%
 * 
 * Married / Couple Slabs:
 * 1. First 6,00,000 @ 1% (or 0% if SSF)
 * 2. Next 2,00,000 (6L - 8L) @ 10%
 * 3. Next 3,00,000 (8L - 11L) @ 20%
 * 4. Next 9,00,000 (11L - 20L) @ 30%
 * 5. Next 30,00,000 (20L - 50L) @ 36%
 * 6. Above 50,00,000 @ 39%
 */
export function calculateSalaryTax(input: SalaryTaxInput): SalaryTaxResult {
  const {
    status,
    monthlySalary,
    bonusMonths,
    otherAllowancesMonthly,
    isSsfEnrolled,
    epfMonthly,
    citMonthly,
    lifeInsuranceAnnual,
    healthInsuranceAnnual,
    remoteAreaDeductionAnnual,
  } = input;

  const grossMonthlyIncome = monthlySalary + otherAllowancesMonthly;
  const annualBaseSalary = monthlySalary * 12;
  const annualAllowances = otherAllowancesMonthly * 12;
  const annualBonus = monthlySalary * Math.max(0, bonusMonths);
  const grossAnnualIncome = annualBaseSalary + annualAllowances + annualBonus;

  // Social Security Fund (SSF: 11% employee contribution)
  const ssfDeductionMonthly = isSsfEnrolled ? monthlySalary * 0.11 : 0;
  const ssfDeductionAnnual = ssfDeductionMonthly * (12 + Math.max(0, bonusMonths));

  // EPF & CIT deductions
  const epfDeductionAnnual = epfMonthly * 12;
  const citDeductionAnnual = citMonthly * 12;

  // Retirement contribution cap: 1/3 of gross income or NPR 300,000 (whichever is lower)
  const totalRetirementContribution = ssfDeductionAnnual + epfDeductionAnnual + citDeductionAnnual;
  const allowableRetirementDeduction = Math.min(
    totalRetirementContribution,
    grossAnnualIncome / 3,
    500000 // In recent Finance Act, increased allowance for SSF/CIT
  );

  // Insurance allowances
  const allowableLifeInsurance = Math.min(Math.max(0, lifeInsuranceAnnual), 40000); // max 40k
  const allowableHealthInsurance = Math.min(Math.max(0, healthInsuranceAnnual), 20000); // max 20k
  const allowableRemoteArea = Math.max(0, remoteAreaDeductionAnnual);

  const totalAnnualDeductions =
    allowableRetirementDeduction +
    allowableLifeInsurance +
    allowableHealthInsurance +
    allowableRemoteArea;

  const netTaxableIncome = Math.max(0, grossAnnualIncome - totalAnnualDeductions);

  // Tax Slabs definitions based on status
  type SlabDef = { name: string; nameNe: string; size: number; rate: number };

  const isCouple = status === 'married';
  const baseSlabSize = isCouple ? 600000 : 500000;
  const firstSlabRate = isSsfEnrolled ? 0 : 1; // SSF registered employees do not pay 1% SST

  const slabDefs: SlabDef[] = [
    {
      name: isCouple ? 'First Rs. 6,00,000' : 'First Rs. 5,00,000',
      nameNe: isCouple ? 'पहिलो रु. ६,००,०००' : 'पहिलो रु. ५,००,०००',
      size: baseSlabSize,
      rate: firstSlabRate,
    },
    {
      name: 'Next Rs. 2,00,000',
      nameNe: 'थप रु. २,००,०००',
      size: 200000,
      rate: 10,
    },
    {
      name: 'Next Rs. 3,00,000',
      nameNe: 'थप रु. ३,००,०००',
      size: 300000,
      rate: 20,
    },
    {
      name: isCouple ? 'Next Rs. 9,00,000' : 'Next Rs. 10,00,000',
      nameNe: isCouple ? 'थप रु. ९,००,०००' : 'थप रु. १०,००,०००',
      size: isCouple ? 900000 : 1000000,
      rate: 30,
    },
    {
      name: 'Next Rs. 30,00,000 (20L to 50L)',
      nameNe: 'थप रु. ३०,००,००० (२० देखि ५० लाख)',
      size: 3000000,
      rate: 36,
    },
    {
      name: 'Above Rs. 50,00,000 (Super Rich)',
      nameNe: 'रु. ५०,००,००० भन्दा माथि',
      size: Infinity,
      rate: 39,
    },
  ];

  let remainingTaxable = netTaxableIncome;
  let totalAnnualTax = 0;
  const brackets: TaxBracket[] = [];

  for (const slab of slabDefs) {
    if (remainingTaxable <= 0) {
      brackets.push({
        slabName: slab.name,
        slabNameNe: slab.nameNe,
        limit: slab.size,
        taxableInSlab: 0,
        ratePercent: slab.rate,
        taxAmount: 0,
      });
      continue;
    }

    const taxableInSlab = Math.min(remainingTaxable, slab.size);
    const taxAmount = (taxableInSlab * slab.rate) / 100;

    brackets.push({
      slabName: slab.name,
      slabNameNe: slab.nameNe,
      limit: slab.size,
      taxableInSlab,
      ratePercent: slab.rate,
      taxAmount,
    });

    totalAnnualTax += taxAmount;
    remainingTaxable -= taxableInSlab;
  }

  // Round results
  totalAnnualTax = Math.round(totalAnnualTax);
  const totalMonthlyTax = Math.round(totalAnnualTax / 12);
  const netAnnualTakeHome = Math.round(grossAnnualIncome - totalAnnualTax - (totalRetirementContribution));
  const netMonthlyTakeHome = Math.round(netAnnualTakeHome / 12);
  const effectiveTaxRate = grossAnnualIncome > 0 ? (totalAnnualTax / grossAnnualIncome) * 100 : 0;

  return {
    grossMonthlyIncome,
    grossAnnualIncome,
    totalAnnualDeductions,
    netTaxableIncome,
    brackets,
    totalAnnualTax,
    totalMonthlyTax,
    netAnnualTakeHome,
    netMonthlyTakeHome,
    effectiveTaxRate: Number(effectiveTaxRate.toFixed(2)),
    ssfDeductionAnnual,
    ssfDeductionMonthly,
    epfDeductionAnnual,
    citDeductionAnnual,
    insuranceDeductionAnnual: allowableLifeInsurance + allowableHealthInsurance,
  };
}
