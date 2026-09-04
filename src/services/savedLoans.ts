import {
  ADDate,
  CompoundInterestResult,
  SavedLoanClosedSnapshot,
  SavedLoanRecord,
} from '../types';
import { calculateCompoundInterest } from '../calculations/compoundInterest';
import { calculateDateDiffAd } from '../calculations/dateDifference';
import { getTodayDate } from '../calendar/bsCalendar';

const STORAGE_KEY = 'merotools_saved_loans_v1';

export function getSavedLoans(): SavedLoanRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupt storage — treat as empty
  }
  return [];
}

function persist(loans: SavedLoanRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  } catch {
    // ignore — e.g. storage full/unavailable
  }
}

export interface NewLoanInput {
  title: string;
  principal: number;
  rate: number;
  frequency: SavedLoanRecord['frequency'];
  regularDeposit: number;
  regularDepositFrequency: SavedLoanRecord['regularDepositFrequency'];
  startDateAd: ADDate;
  plannedMaturityAmount: number;
}

export function saveLoan(input: NewLoanInput): SavedLoanRecord {
  const record: SavedLoanRecord = {
    id: `loan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: input.title.trim() || 'Untitled Loan',
    createdAt: new Date().toISOString(),
    status: 'active',
    closedAt: null,
    principal: input.principal,
    rate: input.rate,
    frequency: input.frequency,
    regularDeposit: input.regularDeposit,
    regularDepositFrequency: input.regularDepositFrequency,
    startDateAd: input.startDateAd,
    plannedMaturityAmount: input.plannedMaturityAmount,
    closedSnapshot: null,
  };
  const loans = getSavedLoans();
  loans.unshift(record);
  persist(loans);
  return record;
}

export function deleteLoan(id: string): void {
  persist(getSavedLoans().filter((l) => l.id !== id));
}

// Recomputes the loan's compound interest as of today (start date -> today),
// using the same calendar-difference logic (and thus the same "count the
// span once" day convention) as the rest of the app.
export function computeLoanAsOfToday(loan: SavedLoanRecord): CompoundInterestResult {
  const today = getTodayDate().ad;
  const diff = calculateDateDiffAd(loan.startDateAd, today);
  return calculateCompoundInterest(
    loan.principal,
    loan.rate,
    diff.years,
    diff.months,
    loan.frequency,
    loan.regularDeposit,
    loan.regularDepositFrequency,
    diff.days
  );
}

export function closeLoan(id: string): SavedLoanRecord | null {
  const loans = getSavedLoans();
  const idx = loans.findIndex((l) => l.id === id);
  if (idx === -1) return null;

  const loan = loans[idx];
  const result = computeLoanAsOfToday(loan);
  const snapshot: SavedLoanClosedSnapshot = {
    years: result.years,
    months: result.months,
    days: result.days,
    totalInterest: result.totalInterest,
    maturityAmount: result.maturityAmount,
  };

  const updated: SavedLoanRecord = {
    ...loan,
    status: 'closed',
    closedAt: new Date().toISOString(),
    closedSnapshot: snapshot,
  };
  loans[idx] = updated;
  persist(loans);
  return updated;
}
