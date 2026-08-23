import { LandConversionResult, LandRopaniSystem, LandBighaSystem } from '../types';
import { toNepaliDigits } from '../calendar/bsCalendar';

export const SQ_FT_PER_ROPANI = 5476;
export const SQ_FT_PER_AANA = 342.25;
export const SQ_FT_PER_PAISA = 85.5625;
export const SQ_FT_PER_DAAM = 21.390625;

export const SQ_FT_PER_BIGHA = 72900;
export const SQ_FT_PER_KATTHA = 3645;
export const SQ_FT_PER_DHUR = 182.25;
export const SQ_FT_PER_KANWA = 11.390625;

export const SQ_FT_PER_SQ_METER = 10.7639104;
export const SQ_FT_PER_SQ_YARD = 9;
export const SQ_FT_PER_ACRE = 43560;
export const SQ_FT_PER_HECTARE = 107639.104;
export const SQ_FT_PER_SQ_HAAT = 2.25;

export function decomposeToRopani(sqFeet: number): LandRopaniSystem {
  if (sqFeet <= 0 || isNaN(sqFeet)) {
    return {
      ropani: 0,
      aana: 0,
      paisa: 0,
      daam: 0,
      formatted: '0-0-0-0',
      formattedNe: '०-०-०-०',
    };
  }

  let remaining = sqFeet;
  let ropani = Math.floor(remaining / SQ_FT_PER_ROPANI);
  remaining -= ropani * SQ_FT_PER_ROPANI;

  let aana = Math.floor(remaining / SQ_FT_PER_AANA);
  remaining -= aana * SQ_FT_PER_AANA;

  let paisa = Math.floor(remaining / SQ_FT_PER_PAISA);
  remaining -= paisa * SQ_FT_PER_PAISA;

  let daam = parseFloat((remaining / SQ_FT_PER_DAAM).toFixed(2));

  // Handle rounding overflows
  if (daam >= 4) {
    paisa += Math.floor(daam / 4);
    daam = parseFloat((daam % 4).toFixed(2));
  }
  if (paisa >= 4) {
    aana += Math.floor(paisa / 4);
    paisa = paisa % 4;
  }
  if (aana >= 16) {
    ropani += Math.floor(aana / 16);
    aana = aana % 16;
  }

  const daamStr = daam % 1 === 0 ? daam.toString() : daam.toFixed(2);
  const formatted = `${ropani}-${aana}-${paisa}-${daamStr}`;
  const formattedNe = `${toNepaliDigits(ropani)}-${toNepaliDigits(aana)}-${toNepaliDigits(paisa)}-${toNepaliDigits(daamStr)}`;

  return {
    ropani,
    aana,
    paisa,
    daam,
    formatted,
    formattedNe,
  };
}

export function decomposeToBigha(sqFeet: number): LandBighaSystem {
  if (sqFeet <= 0 || isNaN(sqFeet)) {
    return {
      bigha: 0,
      kattha: 0,
      dhur: 0,
      kanwa: 0,
      formatted: '0-0-0-0',
      formattedNe: '०-०-०-०',
    };
  }

  let remaining = sqFeet;
  let bigha = Math.floor(remaining / SQ_FT_PER_BIGHA);
  remaining -= bigha * SQ_FT_PER_BIGHA;

  let kattha = Math.floor(remaining / SQ_FT_PER_KATTHA);
  remaining -= kattha * SQ_FT_PER_KATTHA;

  let dhur = Math.floor(remaining / SQ_FT_PER_DHUR);
  remaining -= dhur * SQ_FT_PER_DHUR;

  let kanwa = parseFloat((remaining / SQ_FT_PER_KANWA).toFixed(2));

  // Handle rounding overflows
  if (kanwa >= 16) {
    dhur += Math.floor(kanwa / 16);
    kanwa = parseFloat((kanwa % 16).toFixed(2));
  }
  if (dhur >= 20) {
    kattha += Math.floor(dhur / 20);
    dhur = dhur % 20;
  }
  if (kattha >= 20) {
    bigha += Math.floor(kattha / 20);
    kattha = kattha % 20;
  }

  const kanwaStr = kanwa % 1 === 0 ? kanwa.toString() : kanwa.toFixed(2);
  const formatted = `${bigha}-${kattha}-${dhur}-${kanwaStr}`;
  const formattedNe = `${toNepaliDigits(bigha)}-${toNepaliDigits(kattha)}-${toNepaliDigits(dhur)}-${toNepaliDigits(kanwaStr)}`;

  return {
    bigha,
    kattha,
    dhur,
    kanwa,
    formatted,
    formattedNe,
  };
}

export function convertFromSqFeet(sqFeet: number): LandConversionResult {
  const safeSqFt = Math.max(0, sqFeet);
  return {
    sqFeet: safeSqFt,
    sqMeters: safeSqFt / SQ_FT_PER_SQ_METER,
    sqYards: safeSqFt / SQ_FT_PER_SQ_YARD,
    acres: safeSqFt / SQ_FT_PER_ACRE,
    hectares: safeSqFt / SQ_FT_PER_HECTARE,
    sqHaat: safeSqFt / SQ_FT_PER_SQ_HAAT,
    ropaniSystem: decomposeToRopani(safeSqFt),
    bighaSystem: decomposeToBigha(safeSqFt),
  };
}

export function ropaniToSqFeet(ropani: number, aana: number, paisa: number, daam: number): number {
  return (
    (ropani || 0) * SQ_FT_PER_ROPANI +
    (aana || 0) * SQ_FT_PER_AANA +
    (paisa || 0) * SQ_FT_PER_PAISA +
    (daam || 0) * SQ_FT_PER_DAAM
  );
}

export function bighaToSqFeet(bigha: number, kattha: number, dhur: number, kanwa: number): number {
  return (
    (bigha || 0) * SQ_FT_PER_BIGHA +
    (kattha || 0) * SQ_FT_PER_KATTHA +
    (dhur || 0) * SQ_FT_PER_DHUR +
    (kanwa || 0) * SQ_FT_PER_KANWA
  );
}
