export type UnitCategory =
  | 'length'
  | 'weight'
  | 'volume'
  | 'temperature'
  | 'speed'
  | 'digital'
  | 'pressure';

export interface UnitItem {
  id: string;
  nameEn: string;
  nameNe: string;
  symbol: string;
  factorToBase: number; // multiplier to base unit
  isTraditionalNepali?: boolean;
}

export interface UnitCategoryConfig {
  id: UnitCategory;
  nameEn: string;
  nameNe: string;
  iconName: string;
  baseUnit: string;
  units: UnitItem[];
}

export const UNIT_CATEGORIES: UnitCategoryConfig[] = [
  {
    id: 'length',
    nameEn: 'Length & Distance',
    nameNe: 'लम्बाइ र दूरी (Length)',
    iconName: 'Ruler',
    baseUnit: 'm',
    units: [
      { id: 'm', nameEn: 'Meter', nameNe: 'मिटर (Meter)', symbol: 'm', factorToBase: 1 },
      { id: 'km', nameEn: 'Kilometer', nameNe: 'किलोमिटर (Kilometer)', symbol: 'km', factorToBase: 1000 },
      { id: 'cm', nameEn: 'Centimeter', nameNe: 'सेन्टिमिटर (Centimeter)', symbol: 'cm', factorToBase: 0.01 },
      { id: 'mm', nameEn: 'Millimeter', nameNe: 'मिलिमिटर (Millimeter)', symbol: 'mm', factorToBase: 0.001 },
      { id: 'ft', nameEn: 'Foot', nameNe: 'फिट (Foot)', symbol: 'ft', factorToBase: 0.3048 },
      { id: 'in', nameEn: 'Inch', nameNe: 'इन्च (Inch)', symbol: 'in', factorToBase: 0.0254 },
      { id: 'yd', nameEn: 'Yard', nameNe: 'यार्ड / गज (Yard)', symbol: 'yd', factorToBase: 0.9144 },
      { id: 'mi', nameEn: 'Mile', nameNe: 'माइल (Mile)', symbol: 'mi', factorToBase: 1609.344 },
      // Nepali traditional length
      { id: 'haat', nameEn: 'Haat (हात)', nameNe: 'हात (Haat = 1.5 ft)', symbol: 'हात', factorToBase: 0.4572, isTraditionalNepali: true },
      { id: 'bitta', nameEn: 'Bitta (बित्ता)', nameNe: 'बित्ता (Bitta = 9 in)', symbol: 'बित्ता', factorToBase: 0.2286, isTraditionalNepali: true },
      { id: 'angul', nameEn: 'Angul (अंगुल)', nameNe: 'अंगुल (Angul = 0.75 in)', symbol: 'अंगुल', factorToBase: 0.01905, isTraditionalNepali: true },
      { id: 'kos', nameEn: 'Kos (कोस)', nameNe: 'कोस (Kos = 2 Miles)', symbol: 'कोस', factorToBase: 3218.688, isTraditionalNepali: true },
    ],
  },
  {
    id: 'weight',
    nameEn: 'Weight & Mass',
    nameNe: 'तौल तथा पिण्ड (Weight)',
    iconName: 'Scale',
    baseUnit: 'kg',
    units: [
      { id: 'kg', nameEn: 'Kilogram', nameNe: 'किलोग्राम (Kilogram)', symbol: 'kg', factorToBase: 1 },
      { id: 'g', nameEn: 'Gram', nameNe: 'ग्राम (Gram)', symbol: 'g', factorToBase: 0.001 },
      { id: 'mg', nameEn: 'Milligram', nameNe: 'मिलिग्राम (Milligram)', symbol: 'mg', factorToBase: 0.000001 },
      { id: 'lb', nameEn: 'Pound', nameNe: 'पाउन्ड (Pound)', symbol: 'lb', factorToBase: 0.45359237 },
      { id: 'oz', nameEn: 'Ounce', nameNe: 'औंस (Ounce)', symbol: 'oz', factorToBase: 0.02834952 },
      { id: 'ton', nameEn: 'Metric Ton', nameNe: 'मेट्रिक टन (Metric Ton)', symbol: 'ton', factorToBase: 1000 },
      // Nepali traditional weight
      { id: 'tola', nameEn: 'Tola (तोला)', nameNe: 'तोला (१ तोला = ११.६६४ ग्राम)', symbol: 'तोला', factorToBase: 0.011664, isTraditionalNepali: true },
      { id: 'dharni', nameEn: 'Dharni (धार्नी)', nameNe: 'धार्नी (१ धार्नी = २.३३२८ केजी)', symbol: 'धार्नी', factorToBase: 2.3328, isTraditionalNepali: true },
      { id: 'pau', nameEn: 'Pau (पाउ)', nameNe: 'पाउ (१ पाउ = १९४.४ ग्राम)', symbol: 'पाउ', factorToBase: 0.1944, isTraditionalNepali: true },
      { id: 'sher', nameEn: 'Sher (सेर)', nameNe: 'सेर (१ सेर = ९३३.१२ ग्राम)', symbol: 'सेर', factorToBase: 0.93312, isTraditionalNepali: true },
      { id: 'chatak', nameEn: 'Chatak (छटाक)', nameNe: 'छटाक (१ छटाक = ५८.३२ ग्राम)', symbol: 'छटाक', factorToBase: 0.05832, isTraditionalNepali: true },
      { id: 'mann', nameEn: 'Mann (मन)', nameNe: 'मन (१ मन = ३७.३२४ केजी)', symbol: 'मन', factorToBase: 37.3248, isTraditionalNepali: true },
    ],
  },
  {
    id: 'volume',
    nameEn: 'Volume & Liquids',
    nameNe: 'आयतन तथा तरल (Volume)',
    iconName: 'Droplets',
    baseUnit: 'l',
    units: [
      { id: 'l', nameEn: 'Liter', nameNe: 'लिटर (Liter)', symbol: 'L', factorToBase: 1 },
      { id: 'ml', nameEn: 'Milliliter', nameNe: 'मिलिलिटर (Milliliter)', symbol: 'mL', factorToBase: 0.001 },
      { id: 'm3', nameEn: 'Cubic Meter', nameNe: 'घन मिटर (m³)', symbol: 'm³', factorToBase: 1000 },
      { id: 'gal_us', nameEn: 'US Gallon', nameNe: 'ग्यालन (US Gallon)', symbol: 'gal', factorToBase: 3.78541 },
      { id: 'gal_uk', nameEn: 'UK Gallon', nameNe: 'इम्पेरियल ग्यालन (UK Gallon)', symbol: 'UK gal', factorToBase: 4.54609 },
      // Nepali traditional volume
      { id: 'mana', nameEn: 'Mana (माना)', nameNe: 'माना (१ माना = ०.५६८ लिटर)', symbol: 'माना', factorToBase: 0.56826, isTraditionalNepali: true },
      { id: 'pathi', nameEn: 'Pathi (पाथी)', nameNe: 'पाथी (१ पाथी = ८ माना = ४.५४६ लिटर)', symbol: 'पाथी', factorToBase: 4.54609, isTraditionalNepali: true },
      { id: 'muri', nameEn: 'Muri (मुरी)', nameNe: 'मुरी (१ मुरी = २० पाथी = ९०.९२ लिटर)', symbol: 'मुरी', factorToBase: 90.9218, isTraditionalNepali: true },
      { id: 'kuruwa', nameEn: 'Kuruwa (कुरुवा)', nameNe: 'कुरुवा (१ कुरुवा = २ माना)', symbol: 'कुरुवा', factorToBase: 1.13652, isTraditionalNepali: true },
      { id: 'chauthai', nameEn: 'Chauthai (चौथाई)', nameNe: 'चौथाई (१ चौथाई = ०.२५ माना)', symbol: 'चौथाई', factorToBase: 0.142065, isTraditionalNepali: true },
    ],
  },
  {
    id: 'temperature',
    nameEn: 'Temperature',
    nameNe: 'तापक्रम (Temperature)',
    iconName: 'Thermometer',
    baseUnit: 'c',
    units: [
      { id: 'c', nameEn: 'Celsius', nameNe: 'सेल्सियस (°C)', symbol: '°C', factorToBase: 1 },
      { id: 'f', nameEn: 'Fahrenheit', nameNe: 'फरेनहाइट (°F)', symbol: '°F', factorToBase: 1 },
      { id: 'k', nameEn: 'Kelvin', nameNe: 'केल्विन (K)', symbol: 'K', factorToBase: 1 },
    ],
  },
  {
    id: 'speed',
    nameEn: 'Speed',
    nameNe: 'गति (Speed)',
    iconName: 'Gauge',
    baseUnit: 'kmh',
    units: [
      { id: 'kmh', nameEn: 'Kilometers per hour', nameNe: 'कि.मी. प्रति घण्टा (km/h)', symbol: 'km/h', factorToBase: 1 },
      { id: 'mph', nameEn: 'Miles per hour', nameNe: 'माइल प्रति घण्टा (mph)', symbol: 'mph', factorToBase: 1.60934 },
      { id: 'ms', nameEn: 'Meters per second', nameNe: 'मिटर प्रति सेकेन्ड (m/s)', symbol: 'm/s', factorToBase: 3.6 },
      { id: 'knot', nameEn: 'Knot', nameNe: 'नट (Knot)', symbol: 'kn', factorToBase: 1.852 },
    ],
  },
  {
    id: 'digital',
    nameEn: 'Digital Storage & Data',
    nameNe: 'डिजिटल डेटा (Storage)',
    iconName: 'HardDrive',
    baseUnit: 'mb',
    units: [
      { id: 'b', nameEn: 'Byte', nameNe: 'बाइट (Byte)', symbol: 'B', factorToBase: 0.000001 },
      { id: 'kb', nameEn: 'Kilobyte', nameNe: 'किलोबाइट (KB)', symbol: 'KB', factorToBase: 0.001 },
      { id: 'mb', nameEn: 'Megabyte', nameNe: 'मेगाबाइट (MB)', symbol: 'MB', factorToBase: 1 },
      { id: 'gb', nameEn: 'Gigabyte', nameNe: 'गिगाबाइट (GB)', symbol: 'GB', factorToBase: 1000 },
      { id: 'tb', nameEn: 'Terabyte', nameNe: 'टेराबाइट (TB)', symbol: 'TB', factorToBase: 1000000 },
    ],
  },
];

export function convertUnits(
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string,
  value: number
): number {
  if (isNaN(value)) return 0;
  if (fromUnitId === toUnitId) return value;

  // Temperature special formulas
  if (category === 'temperature') {
    let celsius = value;
    if (fromUnitId === 'f') celsius = (value - 32) * (5 / 9);
    else if (fromUnitId === 'k') celsius = value - 273.15;

    if (toUnitId === 'c') return Number(celsius.toFixed(4));
    if (toUnitId === 'f') return Number((celsius * (9 / 5) + 32).toFixed(4));
    if (toUnitId === 'k') return Number((celsius + 273.15).toFixed(4));
    return celsius;
  }

  const catConfig = UNIT_CATEGORIES.find((c) => c.id === category);
  if (!catConfig) return value;

  const fromUnit = catConfig.units.find((u) => u.id === fromUnitId);
  const toUnit = catConfig.units.find((u) => u.id === toUnitId);

  if (!fromUnit || !toUnit) return value;

  // Convert to base, then to target
  const baseValue = value * fromUnit.factorToBase;
  const targetValue = baseValue / toUnit.factorToBase;

  return Number(targetValue.toPrecision(7)) / 1;
}
