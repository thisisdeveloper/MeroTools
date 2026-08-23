import { VatResult } from '../types';

export const DEFAULT_VAT_RATE = 13;

/**
 * Calculate VAT in Nepal
 * @param amount Base or Gross amount in NPR
 * @param rate VAT percentage (default 13%)
 * @param isAddingVat true to Add VAT (Exclusive), false to Remove VAT (Inclusive)
 */
export function calculateVat(amount: number, rate: number = DEFAULT_VAT_RATE, isAddingVat: boolean = true): VatResult {
  const safeAmount = Math.max(0, isNaN(amount) ? 0 : amount);
  const safeRate = Math.max(0, isNaN(rate) ? DEFAULT_VAT_RATE : rate);

  if (isAddingVat) {
    const taxableAmount = safeAmount;
    const vatAmount = safeAmount * (safeRate / 100);
    const totalAmount = safeAmount + vatAmount;

    return {
      amount: safeAmount,
      rate: safeRate,
      isAddingVat: true,
      taxableAmount: Number(taxableAmount.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  } else {
    // Removing VAT from Gross Total
    const totalAmount = safeAmount;
    const taxableAmount = safeAmount / (1 + safeRate / 100);
    const vatAmount = totalAmount - taxableAmount;

    return {
      amount: safeAmount,
      rate: safeRate,
      isAddingVat: false,
      taxableAmount: Number(taxableAmount.toFixed(2)),
      vatAmount: Number(vatAmount.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
    };
  }
}
