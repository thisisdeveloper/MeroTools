import { ForexCurrency, ForexData } from '../types';

const STORAGE_KEY = 'merotools_forex_cache_v1';

export const DEFAULT_FOREX_DATA: ForexData = {
  date: '2026-08-24',
  lastUpdated: '24 Aug 2026',
  isLive: true,
  rates: [
    {
      iso3: 'USD',
      name: 'U.S. Dollar',
      nameNe: 'अमेरिकी डलर',
      unit: 1,
      buy: 135.48,
      sell: 136.08,
      flag: '🇺🇸',
    },
    {
      iso3: 'EUR',
      name: 'European Euro',
      nameNe: 'युरोपियन युरो',
      unit: 1,
      buy: 147.25,
      sell: 147.90,
      flag: '🇪🇺',
    },
    {
      iso3: 'GBP',
      name: 'UK Pound Sterling',
      nameNe: 'युके पाउन्ड स्टर्लिङ',
      unit: 1,
      buy: 172.60,
      sell: 173.36,
      flag: '🇬🇧',
    },
    {
      iso3: 'INR',
      name: 'Indian Rupee',
      nameNe: 'भारतीय रुपैयाँ',
      unit: 100,
      buy: 160.00,
      sell: 160.15,
      flag: '🇮🇳',
    },
    {
      iso3: 'AUD',
      name: 'Australian Dollar',
      nameNe: 'अस्ट्रेलियन डलर',
      unit: 1,
      buy: 89.15,
      sell: 89.54,
      flag: '🇦🇺',
    },
    {
      iso3: 'CAD',
      name: 'Canadian Dollar',
      nameNe: 'क्यानेडियन डलर',
      unit: 1,
      buy: 98.40,
      sell: 98.84,
      flag: '🇨🇦',
    },
    {
      iso3: 'QAR',
      name: 'Qatari Riyal',
      nameNe: 'कतारी रियाल',
      unit: 1,
      buy: 37.16,
      sell: 37.33,
      flag: '🇶🇦',
    },
    {
      iso3: 'AED',
      name: 'UAE Dirham',
      nameNe: 'युएई दिर्हाम',
      unit: 1,
      buy: 36.88,
      sell: 37.04,
      flag: '🇦🇪',
    },
    {
      iso3: 'SAR',
      name: 'Saudi Arabian Riyal',
      nameNe: 'साउदी रियाल',
      unit: 1,
      buy: 36.12,
      sell: 36.28,
      flag: '🇸🇦',
    },
    {
      iso3: 'MYR',
      name: 'Malaysian Ringgit',
      nameNe: 'मलेसियन रिङ्गेट',
      unit: 1,
      buy: 30.65,
      sell: 30.79,
      flag: '🇲🇾',
    },
    {
      iso3: 'JPY',
      name: 'Japanese Yen',
      nameNe: 'जापानी येन',
      unit: 10,
      buy: 9.14,
      sell: 9.18,
      flag: '🇯🇵',
    },
    {
      iso3: 'SGD',
      name: 'Singapore Dollar',
      nameNe: 'सिङ्गापुर डलर',
      unit: 1,
      buy: 102.40,
      sell: 102.85,
      flag: '🇸🇬',
    },
    {
      iso3: 'CNY',
      name: 'Chinese Yuan',
      nameNe: 'चिनियाँ युआन',
      unit: 1,
      buy: 18.72,
      sell: 18.80,
      flag: '🇨🇳',
    },
    {
      iso3: 'KRW',
      name: 'South Korean Won',
      nameNe: 'दक्षिण कोरियाली वन',
      unit: 100,
      buy: 9.85,
      sell: 9.89,
      flag: '🇰🇷',
    },
    {
      iso3: 'KWD',
      name: 'Kuwaiti Dinar',
      nameNe: 'कुवेती दिनार',
      unit: 1,
      buy: 441.80,
      sell: 443.76,
      flag: '🇰🇼',
    },
    {
      iso3: 'BHD',
      name: 'Bahrain Dinar',
      nameNe: 'बहराइन दिनार',
      unit: 1,
      buy: 359.35,
      sell: 360.94,
      flag: '🇧🇭',
    },
    {
      iso3: 'CHF',
      name: 'Swiss Franc',
      nameNe: 'स्विस फ्रान्क',
      unit: 1,
      buy: 154.20,
      sell: 154.88,
      flag: '🇨🇭',
    },
  ],
};

export function getCachedForexData(): ForexData {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...DEFAULT_FOREX_DATA, ...parsed };
    }
  } catch {
    // ignore
  }
  return DEFAULT_FOREX_DATA;
}

export function saveCachedForexData(data: ForexData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export async function fetchLiveForexData(): Promise<ForexData> {
  try {
    // NRB's API requires an explicit from/to date range (Y-m-d); omitting
    // it returns a 400 with no rates. Requesting just today's date returns
    // the latest published rates.
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(
      `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1&from=${today}&to=${today}`,
      { headers: { Accept: 'application/json' } }
    );
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.payload?.[0]?.rates) {
        const payload = json.data.payload[0];
        const apiRates = payload.rates;
        const mapped: ForexCurrency[] = DEFAULT_FOREX_DATA.rates.map((curr) => {
          const found = apiRates.find(
            (r: { currency: { iso3: string } }) => r.currency?.iso3 === curr.iso3
          );
          if (found) {
            return {
              ...curr,
              unit: Number(found.currency.unit) || curr.unit,
              buy: Number(found.buy) || curr.buy,
              sell: Number(found.sell) || curr.sell,
            };
          }
          return curr;
        });

        const liveData: ForexData = {
          date: payload.date || DEFAULT_FOREX_DATA.date,
          lastUpdated: payload.date || 'Today',
          isLive: true,
          rates: mapped,
        };
        saveCachedForexData(liveData);
        return liveData;
      }
    }
  } catch {
    // Fallback to cache
  }
  return getCachedForexData();
}

/**
 * Convert between foreign currency and NPR
 */
export function convertCurrency(
  amount: number,
  currency: ForexCurrency,
  direction: 'toNPR' | 'fromNPR',
  rateType: 'buy' | 'sell' = 'buy'
): number {
  const rate = rateType === 'buy' ? currency.buy : currency.sell;
  if (!rate || rate <= 0 || !currency.unit) return 0;

  if (direction === 'toNPR') {
    // Foreign Currency to NPR
    return (amount * rate) / currency.unit;
  } else {
    // NPR to Foreign Currency
    return (amount / rate) * currency.unit;
  }
}

/**
 * Format numbers with comma grouping (South Asian style: 1,00,000 or Standard: 100,000)
 */
export function formatNepaliCurrency(num: number, includeRs: boolean = true): string {
  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return includeRs ? `Rs ${formatted}` : formatted;
}
