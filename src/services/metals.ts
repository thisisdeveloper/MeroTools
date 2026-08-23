import { GoldSilverData, MetalRateItem } from '../types';

const STORAGE_KEY = 'merotools_metals_cache_v1';
// Proxies FENEGOSIDA's dashboard feed server-side (the FENEGOSIDA API itself
// only allows CORS from fenegosida.org, so it can't be called directly from
// the browser/WebView).
const API_URL = 'https://kumarsunil.com.np/api/helperapi/gold-silver/today/';

export const DATA_SOURCE_NAME = 'FENEGOSIDA';
export const DATA_SOURCE_FULL_NAME =
  "Federation of Nepal Gold and Silver Dealers' Associations (FENEGOSIDA)";

// Standard Nepal Gold & Silver Benchmark Rates
// 1 Tola = 11.6638 grams (standard 11.66g in Nepal bullion market)
export const TOLA_IN_GRAMS = 11.6638;

// FENEGOSIDA's public feed only publishes Fine Gold (24K, "छापावाल सुन") and
// Silver ("असली चाँदी") rates — there is no separate Tejabi (22K) entry. We
// derive Tejabi from the Fine Gold rate using the purity ratio already shown
// in the UI, rather than fabricate an independent figure.
const FINE_GOLD_PURITY_PCT = 99.99;
const TEJABI_PURITY_PCT = 91.6;

interface FenegosidaRate {
  rateType: string;
  todayBaseRatePerGram: number;
  yestardayBaseRatePerGram: number;
}

interface MetalsProxyResponse {
  available: boolean;
  stale: boolean;
  fetched_at: string;
  source: string;
  data: FenegosidaRate[];
}

function findRate(rows: FenegosidaRate[], metalKeyword: string, unitKeyword: string) {
  return rows.find(
    (r) => r.rateType.includes(metalKeyword) && r.rateType.includes(unitKeyword)
  );
}

function buildMetalsData(rows: FenegosidaRate[], fetchedAtIso?: string): GoldSilverData | null {
  const silverTola = findRate(rows, 'चाँदी', 'तोला');
  const silverTenGram = findRate(rows, 'चाँदी', 'ग्राम');
  const goldTola = findRate(rows, 'सुन', 'तोला');
  const goldTenGram = findRate(rows, 'सुन', 'ग्राम');

  if (!silverTola || !silverTenGram || !goldTola || !goldTenGram) {
    return null;
  }

  const tejabiRatio = TEJABI_PURITY_PCT / FINE_GOLD_PURITY_PCT;
  const tejabiTolaPrice = Math.round(goldTola.todayBaseRatePerGram * tejabiRatio);
  const tejabiTenGramPrice = Math.round(goldTenGram.todayBaseRatePerGram * tejabiRatio);
  const tejabiYesterdayTolaPrice = goldTola.yestardayBaseRatePerGram * tejabiRatio;

  const fineGold: MetalRateItem = {
    name: 'Fine Gold (24K)',
    nameNe: 'छापावाल सुन (२४ क्यारेट)',
    tolaPrice: goldTola.todayBaseRatePerGram,
    tenGramPrice: goldTenGram.todayBaseRatePerGram,
    gramPrice: Number((goldTenGram.todayBaseRatePerGram / 10).toFixed(2)),
    change: Math.round(goldTola.todayBaseRatePerGram - goldTola.yestardayBaseRatePerGram),
    purity: `${FINE_GOLD_PURITY_PCT}%`,
  };

  const tejabiGold: MetalRateItem = {
    name: 'Tejabi Gold (22K)',
    nameNe: 'तेजाबी सुन (२२ क्यारेट)',
    tolaPrice: tejabiTolaPrice,
    tenGramPrice: tejabiTenGramPrice,
    gramPrice: Number((tejabiTenGramPrice / 10).toFixed(2)),
    change: Math.round(tejabiTolaPrice - tejabiYesterdayTolaPrice),
    purity: `${TEJABI_PURITY_PCT}%`,
  };

  const silver: MetalRateItem = {
    name: 'Silver',
    nameNe: 'चाँदी',
    tolaPrice: silverTola.todayBaseRatePerGram,
    tenGramPrice: silverTenGram.todayBaseRatePerGram,
    gramPrice: Number((silverTenGram.todayBaseRatePerGram / 10).toFixed(2)),
    change: Math.round(silverTola.todayBaseRatePerGram - silverTola.yestardayBaseRatePerGram),
    purity: '99.90%',
  };

  const fetchedAt = fetchedAtIso ? new Date(fetchedAtIso) : new Date();
  const timeSource = isNaN(fetchedAt.getTime()) ? new Date() : fetchedAt;
  const lastUpdated = `Today, ${timeSource.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  return {
    lastUpdated,
    isLive: true,
    rates: { fineGold, tejabiGold, silver },
  };
}

export type MetalUnit = 'tola' | 'gram' | '10gram' | 'anna' | 'ratti' | 'lal' | 'pao' | 'dharni';

export interface UnitDefinition {
  id: MetalUnit;
  nameEn: string;
  nameNe: string;
  inTolas: number; // multiplier to convert to tolas
}

export const METAL_UNITS: UnitDefinition[] = [
  { id: 'tola', nameEn: 'Tola (तोला)', nameNe: 'तोला', inTolas: 1 },
  { id: 'gram', nameEn: 'Gram (ग्राम)', nameNe: 'ग्राम', inTolas: 1 / TOLA_IN_GRAMS },
  { id: '10gram', nameEn: '10 Grams (१० ग्राम)', nameNe: '१० ग्राम', inTolas: 10 / TOLA_IN_GRAMS },
  { id: 'anna', nameEn: 'Anna (आना)', nameNe: 'आना', inTolas: 1 / 16 },
  { id: 'ratti', nameEn: 'Ratti (रत्ती)', nameNe: 'रत्ती', inTolas: 1 / 96 },
  { id: 'lal', nameEn: 'Lal (लाल)', nameNe: 'लाल', inTolas: 1 / 100 },
  { id: 'pao', nameEn: 'Pao (पाउ - 20 Tola)', nameNe: 'पाउ', inTolas: 20 },
  { id: 'dharni', nameEn: 'Dharni (धार्नी - 200 Tola)', nameNe: 'धार्नी', inTolas: 200 },
];

// Returns the last cached rate, or null if nothing has ever been fetched
// successfully on this device.
export function getCachedMetalsData(): GoldSilverData | null {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // corrupt cache — treat as absent
  }
  return null;
}

export function saveCachedMetalsData(data: GoldSilverData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export interface MetalsFetchResult {
  // null only when there is no live data AND no cached fallback available.
  data: GoldSilverData | null;
  isLive: boolean;
}

export async function fetchLiveMetalsData(): Promise<MetalsFetchResult> {
  try {
    const res = await fetch(API_URL, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Rate API returned ${res.status}`);
    const payload: MetalsProxyResponse = await res.json();
    if (!payload.available || !Array.isArray(payload.data)) {
      throw new Error('Rate API reported no data available');
    }
    const data = buildMetalsData(payload.data, payload.fetched_at);
    if (!data) throw new Error('Unexpected rate API response shape');
    saveCachedMetalsData(data);
    // `stale` means the proxy itself is serving its own last-known-good
    // rates (its FENEGOSIDA fetch failed), not a fresh pull — surface that
    // as non-live even though we did get a successful response.
    return { data, isLive: !payload.stale };
  } catch {
    return { data: getCachedMetalsData(), isLive: false };
  }
}

export function calculateMetalPrice(
  ratePerTola: number,
  weight: number,
  unit: MetalUnit
): { estimatedPrice: number; weightInGrams: number; weightInTolas: number } {
  const safeWeight = Math.max(0, isNaN(weight) ? 0 : weight);
  const unitDef = METAL_UNITS.find((u) => u.id === unit) || METAL_UNITS[0];
  
  const weightInTolas = safeWeight * unitDef.inTolas;
  const weightInGrams = weightInTolas * TOLA_IN_GRAMS;
  const estimatedPrice = Math.round(weightInTolas * ratePerTola);

  return {
    estimatedPrice,
    weightInGrams: Number(weightInGrams.toFixed(2)),
    weightInTolas: Number(weightInTolas.toFixed(3)),
  };
}
