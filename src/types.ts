export type ToolId =
  | 'date-converter'
  | 'age-calculator'
  | 'date-difference'
  | 'nepali-calendar'
  | 'public-holidays'
  | 'gold-silver'
  | 'forex'
  | 'salary-tax'
  | 'gpa-calculator'
  | 'electricity-bill'
  | 'vehicle-tax'
  | 'land-converter'
  | 'unit-converter'
  | 'vat-calculator'
  | 'emi-calculator'
  | 'compound-interest'
  | 'saved-loans'
  | 'reminders'
  | 'shopping-list';

export type TabId = 'home' | 'tools' | 'settings';

export interface BSDate {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to 32
}

export interface ADDate {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to 31
}

export interface DateConversionResult {
  bs: BSDate;
  ad: ADDate;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  dayNameEn: string;
  dayNameNe: string;
  bsMonthNameEn: string;
  bsMonthNameNe: string;
  adMonthNameEn: string;
  adMonthNameNe: string;
  formattedBsEn: string;
  formattedBsNe: string;
  formattedAdEn: string;
  formattedAdNe: string;
}

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  dayBornEn: string;
  dayBornNe: string;
  nextBirthdayInMonths: number;
  nextBirthdayInDays: number;
  nextBirthdayDayEn: string;
  nextBirthdayDayNe: string;
  isTodayBirthday: boolean;
}

export interface DateDiffResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  remainingDays: number;
  totalHours: number;
}

export interface VatResult {
  amount: number;
  rate: number;
  isAddingVat: boolean;
  taxableAmount: number;
  vatAmount: number;
  totalAmount: number;
}

export interface EmiYearlyBreakdown {
  year: number;
  principalPaid: number;
  interestPaid: number;
  totalPayment: number;
  remainingBalance: number;
}

export interface EmiResult {
  monthlyEmi: number;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  totalInterest: number;
  totalPayment: number;
  yearlyBreakdown: EmiYearlyBreakdown[];
}

export interface LandRopaniSystem {
  ropani: number;
  aana: number;
  paisa: number;
  daam: number;
  formatted: string;
  formattedNe: string;
}

export interface LandBighaSystem {
  bigha: number;
  kattha: number;
  dhur: number;
  kanwa: number;
  formatted: string;
  formattedNe: string;
}

export interface LandConversionResult {
  sqFeet: number;
  sqMeters: number;
  sqYards: number;
  acres: number;
  hectares: number;
  sqHaat: number;
  ropaniSystem: LandRopaniSystem;
  bighaSystem: LandBighaSystem;
}

export type CompoundingFrequency = 'annual' | 'semi-annual' | 'quarterly' | 'monthly' | 'daily';

export interface CompoundInterestYearlySchedule {
  year: number;
  openingBalance: number;
  annualContribution: number;
  interestEarned: number;
  closingBalance: number;
  totalInvested: number;
}

export interface CompoundInterestResult {
  principalAmount: number;
  annualRate: number;
  years: number;
  months: number;
  days: number;
  frequency: CompoundingFrequency;
  regularDeposit: number;
  regularDepositFrequency: 'monthly' | 'yearly';
  totalDeposit: number;
  totalInterest: number;
  maturityAmount: number;
  simpleInterestComparison: number;
  compoundInterestAdvantage: number;
  yearlySchedule: CompoundInterestYearlySchedule[];
}

export interface SavedLoanClosedSnapshot {
  years: number;
  months: number;
  days: number;
  totalInterest: number;
  maturityAmount: number;
}

export interface SavedLoanRecord {
  id: string;
  title: string;
  createdAt: string;
  status: 'active' | 'closed';
  closedAt: string | null;

  // Original loan parameters, needed to recompute interest as of "today"
  principal: number;
  rate: number;
  frequency: CompoundingFrequency;
  regularDeposit: number;
  regularDepositFrequency: 'monthly' | 'yearly';

  // Canonical AD start date (converted from BS at save time if needed)
  startDateAd: ADDate;

  plannedMaturityAmount: number;

  // Frozen result as of the moment the loan was closed; present only when closed
  closedSnapshot: SavedLoanClosedSnapshot | null;
}

export interface MetalRateItem {
  name: string;
  nameNe: string;
  tolaPrice: number;
  tenGramPrice: number;
  gramPrice: number;
  change: number; // e.g. +500, -200
  purity: string;
}

export interface GoldSilverData {
  lastUpdated: string;
  isLive: boolean;
  rates: {
    fineGold: MetalRateItem;
    tejabiGold: MetalRateItem;
    silver: MetalRateItem;
  };
}

export interface ForexCurrency {
  iso3: string;
  name: string;
  nameNe: string;
  unit: number;
  buy: number;
  sell: number;
  flag: string;
}

export interface ForexData {
  date: string;
  lastUpdated: string;
  isLive: boolean;
  rates: ForexCurrency[];
}

export type Language = 'en' | 'ne';
export type ThemeMode = 'system' | 'light' | 'dark';

export interface AppSettings {
  language: Language;
  theme: ThemeMode;
}

// ---- Home page customization ----

export type HomeCardId = 'date' | 'forex' | 'gold' | 'upcomingEvent' | 'reminders' | 'shoppingList';

export type HomeSettings = Record<HomeCardId, boolean>;

// ---- Unified Reminders ----

export type ReminderType =
  | 'task'
  | 'birthday'
  | 'anniversary'
  | 'bill'
  | 'loan'
  | 'sip'
  | 'location'
  | 'custom';

export type RepeatMode = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ReminderLocation {
  name: string; // what the user searched/picked, e.g. "Bhatbhateni, Koteshwor"
  lat: number;
  lng: number;
  radiusMeters: number; // preset 100/200/500/1000 or a custom value
  trigger: 'enter' | 'exit';
  nativeGeofenceId: string | null; // set once registered with the OS; null until then
}

export interface ReminderRecord {
  id: string;
  type: ReminderType;
  title: string;
  notes: string;
  dateAd: ADDate; // anchor date: due date, birthdate, first bill date, etc. — unused for type === 'location'
  time: string | null; // "HH:MM", optional
  repeat: RepeatMode;
  amount: number | null; // bill / loan / sip
  location: ReminderLocation | null; // only set when type === 'location'
  notificationEnabled: boolean;
  isCompleted: boolean; // only meaningful when repeat === 'none'
  createdAt: string;
  updatedAt: string;
}

// ---- Shopping Lists ----

export interface ShoppingListRecord {
  id: string;
  title: string;
  notes: string | null;
  purchaseByDate: ADDate | null;
  // A palette key (see LIST_COLOR_PALETTE in services/shoppingLists.ts),
  // assigned randomly once at creation so each list keeps a stable but
  // distinct icon color. Optional so lists created before this field
  // existed still load fine (they fall back to a default color).
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItemRecord {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string | null;
  price: number | null;
  isPurchased: boolean;
  createdAt: string;
  updatedAt: string;
}
