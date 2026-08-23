export type AmpereCapacity = '5A' | '15A' | '30A' | '60A' | '3phase';

export interface NeaSlabDetail {
  slabRange: string;
  slabRangeNe: string;
  unitsInSlab: number;
  ratePerUnit: number;
  cost: number;
}

export interface ElectricityBillInput {
  unitsConsumed: number; // monthly units (kWh)
  capacity: AmpereCapacity;
  paymentTiming: 'within_7_days' | '8_to_15_days' | '16_to_22_days' | '23_to_30_days' | 'after_30_days';
}

export interface ElectricityBillResult {
  unitsConsumed: number;
  capacity: AmpereCapacity;
  minimumCharge: number;
  energyCharge: number;
  totalBeforeAdjustments: number;
  discountOrPenaltyAmount: number; // negative for discount, positive for penalty
  discountOrPenaltyPercent: number;
  finalPayableAmount: number;
  slabs: NeaSlabDetail[];
}

/**
 * NEA Domestic Consumer Tariff Rates (Approved by Electricity Regulatory Commission)
 * 5 Ampere (Low income / standard):
 * - 0 to 20 units: Minimum charge Rs. 30, Energy charge Rs. 0 (Rs 3.0/unit for >20)
 * - 21 to 30 units: Min Rs. 50, Energy Rs. 6.50
 * - 31 to 50 units: Min Rs. 50, Energy Rs. 8.00
 * - 51 to 100 units: Min Rs. 75, Energy Rs. 9.50
 * - 101 to 250 units: Min Rs. 100, Energy Rs. 9.50 - 10.00
 * - 251 to 400 units: Min Rs. 125, Energy Rs. 11.00
 * - 400+ units: Min Rs. 150, Energy Rs. 12.00
 */
export function calculateNeaElectricityBill(input: ElectricityBillInput): ElectricityBillResult {
  const { unitsConsumed, capacity, paymentTiming } = input;
  const units = Math.max(0, unitsConsumed);

  let minimumCharge = 30;
  if (capacity === '15A') minimumCharge = 50;
  if (capacity === '30A') minimumCharge = 100;
  if (capacity === '60A') minimumCharge = 200;
  if (capacity === '3phase') minimumCharge = 1000;

  const slabs: NeaSlabDetail[] = [];
  let energyCharge = 0;

  if (units <= 20) {
    if (capacity === '5A') {
      minimumCharge = 30;
      energyCharge = 0; // free energy for lifeline 0-20 units under 5A
      slabs.push({
        slabRange: '0 - 20 Units (Lifeline)',
        slabRangeNe: '० - २० युनिट (न्यूनतम)',
        unitsInSlab: units,
        ratePerUnit: 0,
        cost: 0,
      });
    } else {
      energyCharge = units * 4.0;
      slabs.push({
        slabRange: '0 - 20 Units',
        slabRangeNe: '० - २० युनिट',
        unitsInSlab: units,
        ratePerUnit: 4.0,
        cost: energyCharge,
      });
    }
  } else {
    // Progressive tiers for units > 20
    const tiers = [
      { range: '0 - 20 Units', rangeNe: '० - २० युनिट', max: 20, rate: capacity === '5A' ? 3.0 : 4.0 },
      { range: '21 - 30 Units', rangeNe: '२१ - ३० युनिट', max: 10, rate: 6.5 },
      { range: '31 - 50 Units', rangeNe: '३१ - ५० युनिट', max: 20, rate: 8.0 },
      { range: '51 - 100 Units', rangeNe: '५१ - १०० युनिट', max: 50, rate: 9.5 },
      { range: '101 - 250 Units', rangeNe: '१०१ - २५० युनिट', max: 150, rate: 10.0 },
      { range: '251 - 400 Units', rangeNe: '२५१ - ४०० युनिट', max: 150, rate: 11.0 },
      { range: 'Above 400 Units', rangeNe: '४०० युनिट भन्दा माथि', max: Infinity, rate: 12.0 },
    ];

    // Determine base minimum charge based on total units consumed
    if (units <= 30) minimumCharge = capacity === '5A' ? 50 : minimumCharge;
    else if (units <= 50) minimumCharge = capacity === '5A' ? 50 : minimumCharge;
    else if (units <= 100) minimumCharge = capacity === '5A' ? 75 : Math.max(minimumCharge, 100);
    else if (units <= 250) minimumCharge = capacity === '5A' ? 100 : Math.max(minimumCharge, 125);
    else if (units <= 400) minimumCharge = capacity === '5A' ? 125 : Math.max(minimumCharge, 150);
    else minimumCharge = capacity === '5A' ? 150 : Math.max(minimumCharge, 200);

    let remaining = units;
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const count = Math.min(remaining, tier.max);
      const cost = count * tier.rate;
      energyCharge += cost;
      slabs.push({
        slabRange: tier.range,
        slabRangeNe: tier.rangeNe,
        unitsInSlab: count,
        ratePerUnit: tier.rate,
        cost,
      });
      remaining -= count;
    }
  }

  const totalBeforeAdjustments = minimumCharge + energyCharge;

  // NEA Prompt Payment Rebate & Late Penalty Rules:
  // - Within 7 days of bill generation: 3% rebate (discount)
  // - 8 to 15 days: 0% (regular bill)
  // - 16 to 22 days: 5% penalty
  // - 23 to 30 days: 10% penalty
  // - After 30 days: 25% penalty
  let discountOrPenaltyPercent = 0;
  if (paymentTiming === 'within_7_days') discountOrPenaltyPercent = -3;
  else if (paymentTiming === '8_to_15_days') discountOrPenaltyPercent = 0;
  else if (paymentTiming === '16_to_22_days') discountOrPenaltyPercent = 5;
  else if (paymentTiming === '23_to_30_days') discountOrPenaltyPercent = 10;
  else if (paymentTiming === 'after_30_days') discountOrPenaltyPercent = 25;

  const discountOrPenaltyAmount = (totalBeforeAdjustments * discountOrPenaltyPercent) / 100;
  const finalPayableAmount = Math.max(0, Math.round(totalBeforeAdjustments + discountOrPenaltyAmount));

  return {
    unitsConsumed: units,
    capacity,
    minimumCharge,
    energyCharge: Math.round(energyCharge * 100) / 100,
    totalBeforeAdjustments: Math.round(totalBeforeAdjustments),
    discountOrPenaltyAmount: Math.round(discountOrPenaltyAmount * 100) / 100,
    discountOrPenaltyPercent,
    finalPayableAmount,
    slabs,
  };
}
