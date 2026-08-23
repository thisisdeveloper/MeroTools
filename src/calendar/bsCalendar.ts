import { BSDate, ADDate, DateConversionResult } from '../types';

export const BS_MONTHS_EN = [
  'Baisakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra',
];

export const BS_MONTHS_NE = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कात्तिक',
  'मंसिर',
  'पुष',
  'माघ',
  'फागुन',
  'चैत',
];

export const DAYS_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const DAYS_NE = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहीबार',
  'शुक्रबार',
  'शनिबार',
];

export const DAYS_SHORT_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_SHORT_NE = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'];

export const AD_MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AD_MONTHS_NE = [
  'जनवरी',
  'फेब्रुअरी',
  'मार्च',
  'अप्रिल',
  'मे',
  'जुन',
  'जुलाई',
  'अगस्ट',
  'सेप्टेम्बर',
  'अक्टोबर',
  'नोभेम्बर',
  'डिसेम्बर',
];

// Exact days in each BS month from BS 2000 to BS 2095 (96 years of complete data)
// Base Date Reference: 2000 BS Baisakh 1 = 1943 AD April 14 (Wednesday)
export const BS_CALENDAR_DATA: Record<number, number[]> = {
  2000: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2001: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2002: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2003: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2004: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2005: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2006: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2007: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2008: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2009: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2010: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2011: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2012: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2013: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2014: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2015: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2016: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2017: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2018: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2019: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2020: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2021: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2022: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2023: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2024: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2025: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2026: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2027: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2028: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2029: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2030: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2031: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2032: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2033: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2034: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2035: [30, 32, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2036: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2037: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2038: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2039: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2040: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2041: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2042: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2043: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2044: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2045: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2046: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2047: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2048: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2049: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2050: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2051: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2052: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2053: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2054: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2055: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2056: [31, 31, 32, 31, 32, 30, 30, 29, 30, 29, 30, 30],
  2057: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2058: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2059: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2060: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2061: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2062: [30, 32, 31, 32, 31, 31, 29, 30, 29, 30, 29, 31],
  2063: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2064: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2065: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2066: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 29, 31],
  2067: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2068: [31, 31, 32, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2069: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2070: [31, 31, 31, 32, 31, 31, 29, 30, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 29, 30, 29, 30, 30],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 30],
  2081: [31, 31, 32, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2082: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2083: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2084: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2085: [31, 32, 31, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2086: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2087: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2088: [30, 31, 32, 32, 30, 31, 30, 30, 29, 30, 30, 30],
  2089: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2090: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2091: [31, 31, 32, 31, 31, 31, 30, 30, 29, 30, 30, 30],
  2092: [30, 31, 32, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2093: [30, 32, 31, 32, 31, 30, 30, 30, 29, 30, 30, 30],
  2094: [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30],
  2095: [31, 31, 32, 31, 31, 31, 30, 29, 30, 30, 30, 30],
};

const BASE_BS_YEAR = 2000;
const BASE_AD_DATE = new Date(Date.UTC(1943, 3, 14)); // 1943-04-14 UTC (BS 2000-01-01)
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function toNepaliDigits(num: number | string): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(num).replace(/[0-9]/g, (w) => nepaliDigits[+w]);
}

export function getDaysInBSMonth(year: number, month: number): number {
  if (!BS_CALENDAR_DATA[year] || month < 1 || month > 12) {
    return 30;
  }
  return BS_CALENDAR_DATA[year][month - 1];
}

export function isValidBSDate(year: number, month: number, day: number): boolean {
  if (year < 2000 || year > 2095) return false;
  if (month < 1 || month > 12) return false;
  const maxDays = getDaysInBSMonth(year, month);
  return day >= 1 && day <= maxDays;
}

/**
 * Convert Bikram Sambat Date (BS) to Gregorian Date (AD)
 */
export function bsToAd(bsDate: BSDate): DateConversionResult {
  const { year, month, day } = bsDate;
  const validYear = Math.max(2000, Math.min(2095, year));
  const validMonth = Math.max(1, Math.min(12, month));
  const maxDay = getDaysInBSMonth(validYear, validMonth);
  const validDay = Math.max(1, Math.min(maxDay, day));

  let totalDays = 0;

  // Add days for complete years from 2000
  for (let y = BASE_BS_YEAR; y < validYear; y++) {
    const yearDays = BS_CALENDAR_DATA[y] || [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
    totalDays += yearDays.reduce((a, b) => a + b, 0);
  }

  // Add days for complete months in the current year
  const currentYearMonths = BS_CALENDAR_DATA[validYear] || [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
  for (let m = 0; m < validMonth - 1; m++) {
    totalDays += currentYearMonths[m];
  }

  // Add days in current month (minus 1 because Baisakh 1 is index 0)
  totalDays += validDay - 1;

  const targetAdTime = BASE_AD_DATE.getTime() + totalDays * MS_PER_DAY;
  const adDateObj = new Date(targetAdTime);

  const adYear = adDateObj.getUTCFullYear();
  const adMonth = adDateObj.getUTCMonth() + 1;
  const adDay = adDateObj.getUTCDate();
  const dayOfWeek = adDateObj.getUTCDay();

  const ad: ADDate = { year: adYear, month: adMonth, day: adDay };
  const bs: BSDate = { year: validYear, month: validMonth, day: validDay };

  return formatResult(bs, ad, dayOfWeek);
}

/**
 * Convert Gregorian Date (AD) to Bikram Sambat Date (BS)
 */
export function adToBs(adDate: ADDate): DateConversionResult {
  const targetDate = new Date(Date.UTC(adDate.year, adDate.month - 1, adDate.day));
  const totalDays = Math.round((targetDate.getTime() - BASE_AD_DATE.getTime()) / MS_PER_DAY);

  let remainingDays = totalDays;
  let currentYear = BASE_BS_YEAR;
  let currentMonth = 1;
  let currentDay = 1;

  if (remainingDays < 0) {
    // Fallback to min supported
    return bsToAd({ year: 2000, month: 1, day: 1 });
  }

  while (currentYear <= 2095) {
    const yearDays = BS_CALENDAR_DATA[currentYear] || [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 30, 30];
    const totalYearDays = yearDays.reduce((a, b) => a + b, 0);

    if (remainingDays >= totalYearDays && currentYear < 2095) {
      remainingDays -= totalYearDays;
      currentYear++;
    } else {
      for (let m = 0; m < 12; m++) {
        const monthDays = yearDays[m];
        if (remainingDays >= monthDays) {
          remainingDays -= monthDays;
          currentMonth++;
        } else {
          currentDay += remainingDays;
          remainingDays = 0;
          break;
        }
      }
      break;
    }
  }

  const dayOfWeek = targetDate.getUTCDay();
  const bs: BSDate = { year: currentYear, month: currentMonth, day: currentDay };
  const ad: ADDate = { year: adDate.year, month: adDate.month, day: adDate.day };

  return formatResult(bs, ad, dayOfWeek);
}

function formatResult(bs: BSDate, ad: ADDate, dayOfWeek: number): DateConversionResult {
  const bsMonthIndex = bs.month - 1;
  const adMonthIndex = ad.month - 1;

  const bsMonthNameEn = BS_MONTHS_EN[bsMonthIndex] || '';
  const bsMonthNameNe = BS_MONTHS_NE[bsMonthIndex] || '';
  const adMonthNameEn = AD_MONTHS_EN[adMonthIndex] || '';
  const adMonthNameNe = AD_MONTHS_NE[adMonthIndex] || '';

  const dayNameEn = DAYS_EN[dayOfWeek] || '';
  const dayNameNe = DAYS_NE[dayOfWeek] || '';

  const formattedBsEn = `${bs.year} ${bsMonthNameEn} ${bs.day}`;
  const formattedBsNe = `${toNepaliDigits(bs.year)} ${bsMonthNameNe} ${toNepaliDigits(bs.day)}`;

  const formattedAdEn = `${adMonthNameEn} ${ad.day}, ${ad.year}`;
  const formattedAdNe = `${adMonthNameNe} ${toNepaliDigits(ad.day)}, ${toNepaliDigits(ad.year)}`;

  return {
    bs,
    ad,
    dayOfWeek,
    dayNameEn,
    dayNameNe,
    bsMonthNameEn,
    bsMonthNameNe,
    adMonthNameEn,
    adMonthNameNe,
    formattedBsEn,
    formattedBsNe,
    formattedAdEn,
    formattedAdNe,
  };
}

/**
 * Get Today's Date in both BS and AD
 */
export function getTodayDate(): DateConversionResult {
  const now = new Date();
  const adDate: ADDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  return adToBs(adDate);
}
