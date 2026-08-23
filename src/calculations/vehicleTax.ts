export type VehicleCategory = '2wheeler' | '2wheeler_ev' | '4wheeler_car' | '4wheeler_ev';

export interface VehicleTaxOption {
  id: string;
  labelEn: string;
  labelNe: string;
  annualTax: number;
  renewalFee: number;
}

export interface VehicleTaxInput {
  category: VehicleCategory;
  engineCapacityId: string;
  overdueYears: number; // Late renewal penalties
  includeThirdPartyInsurance: boolean;
  includePollutionRenewal: boolean;
}

export interface VehicleTaxResult {
  category: VehicleCategory;
  annualTax: number;
  renewalFee: number;
  latePenaltyFee: number;
  insuranceFee: number;
  pollutionFee: number;
  totalPayable: number;
  selectedOptionLabelEn: string;
  selectedOptionLabelNe: string;
}

// Bagmati & Province Vehicle Tax Schedules (Standard Nepal Rates)
export const VEHICLE_TAX_SCHEDULES: Record<VehicleCategory, VehicleTaxOption[]> = {
  '2wheeler': [
    { id: '2w_125', labelEn: 'Up to 125 CC', labelNe: '१२५ सीसी सम्म', annualTax: 3000, renewalFee: 500 },
    { id: '2w_150', labelEn: '126 CC to 150 CC', labelNe: '१२६ देखि १५० सीसी', annualTax: 5000, renewalFee: 500 },
    { id: '2w_225', labelEn: '151 CC to 225 CC', labelNe: '१५१ देखि २२५ सीसी', annualTax: 6500, renewalFee: 500 },
    { id: '2w_400', labelEn: '226 CC to 400 CC', labelNe: '२२६ देखि ४०० सीसी', annualTax: 11500, renewalFee: 500 },
    { id: '2w_650', labelEn: '401 CC to 650 CC', labelNe: '४०१ देखि ६५० सीसी', annualTax: 20000, renewalFee: 500 },
    { id: '2w_above', labelEn: 'Above 650 CC', labelNe: '६५० सीसी भन्दा माथि', annualTax: 30000, renewalFee: 500 },
  ],
  '2wheeler_ev': [
    { id: '2wev_1000w', labelEn: 'Up to 1,000 Watt', labelNe: '१००० वाट सम्म', annualTax: 1500, renewalFee: 500 },
    { id: '2wev_1500w', labelEn: '1,001W to 1,500 Watt', labelNe: '१००१ देखि १५०० वाट', annualTax: 2000, renewalFee: 500 },
    { id: '2wev_above', labelEn: 'Above 1,500 Watt', labelNe: '१५०० वाट भन्दा माथि', annualTax: 3000, renewalFee: 500 },
  ],
  '4wheeler_car': [
    { id: '4w_1000', labelEn: 'Up to 1,000 CC', labelNe: '१००० सीसी सम्म', annualTax: 22000, renewalFee: 1000 },
    { id: '4w_1500', labelEn: '1,001 CC to 1,500 CC', labelNe: '१००१ देखि १५०० सीसी', annualTax: 25000, renewalFee: 1000 },
    { id: '4w_2000', labelEn: '1,501 CC to 2,000 CC', labelNe: '१५०१ देखि २००० सीसी', annualTax: 30000, renewalFee: 1000 },
    { id: '4w_2500', labelEn: '2,001 CC to 2,500 CC', labelNe: '२००१ देखि २५०० सीसी', annualTax: 37000, renewalFee: 1000 },
    { id: '4w_3000', labelEn: '2,501 CC to 3,000 CC', labelNe: '२५०१ देखि ३००० सीसी', annualTax: 45000, renewalFee: 1000 },
    { id: '4w_above', labelEn: 'Above 3,000 CC', labelNe: '३००० सीसी भन्दा माथि', annualTax: 58000, renewalFee: 1000 },
  ],
  '4wheeler_ev': [
    { id: '4wev_50kw', labelEn: 'Up to 50 kW', labelNe: '५० किलोवाट सम्म', annualTax: 10000, renewalFee: 1000 },
    { id: '4wev_100kw', labelEn: '51 kW to 100 kW', labelNe: '५१ देखि १०० किलोवाट', annualTax: 15000, renewalFee: 1000 },
    { id: '4wev_200kw', labelEn: '101 kW to 200 kW', labelNe: '१०१ देखि २०० किलोवाट', annualTax: 30000, renewalFee: 1000 },
    { id: '4wev_above', labelEn: 'Above 200 kW', labelNe: '२०० किलोवाट भन्दा माथि', annualTax: 45000, renewalFee: 1000 },
  ],
};

export function calculateVehicleTax(input: VehicleTaxInput): VehicleTaxResult {
  const {
    category,
    engineCapacityId,
    overdueYears,
    includeThirdPartyInsurance,
    includePollutionRenewal,
  } = input;

  const scheduleList = VEHICLE_TAX_SCHEDULES[category] || VEHICLE_TAX_SCHEDULES['2wheeler'];
  const matched = scheduleList.find((s) => s.id === engineCapacityId) || scheduleList[0];

  const annualTax = matched.annualTax;
  const renewalFee = matched.renewalFee;

  // Late renewal penalty:
  // After 90 days of fiscal year end: 100% fine on renewal and 20% on tax per year
  const latePenaltyFee = overdueYears > 0 ? (annualTax * 0.20 + renewalFee) * overdueYears : 0;

  // Third Party Insurance (approx standard tariff in Nepal):
  // 2-wheeler: ~NPR 1,500 - 1,800
  // 4-wheeler: ~NPR 6,000 - 8,000
  const is2Wheeler = category === '2wheeler' || category === '2wheeler_ev';
  const insuranceFee = includeThirdPartyInsurance ? (is2Wheeler ? 1750 : 7500) : 0;

  // Pollution Test / Green Sticker (हरियो स्टिकर):
  // NPR 100 for bikes, NPR 200 for cars
  const pollutionFee = includePollutionRenewal ? (is2Wheeler ? 100 : 200) : 0;

  const totalPayable = Math.round(
    annualTax + renewalFee + latePenaltyFee + insuranceFee + pollutionFee
  );

  return {
    category,
    annualTax,
    renewalFee,
    latePenaltyFee: Math.round(latePenaltyFee),
    insuranceFee,
    pollutionFee,
    totalPayable,
    selectedOptionLabelEn: matched.labelEn,
    selectedOptionLabelNe: matched.labelNe,
  };
}
