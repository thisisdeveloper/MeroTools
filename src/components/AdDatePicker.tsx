import React from 'react';
import { ADDate, Language } from '../types';
import { AD_MONTHS_EN, AD_MONTHS_NE, toNepaliDigits } from '../calendar/bsCalendar';

interface AdDatePickerProps {
  value: ADDate;
  onChange: (value: ADDate) => void;
  language: Language;
  idPrefix: string;
  yearRange?: [number, number]; // inclusive
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export const AdDatePicker: React.FC<AdDatePickerProps> = ({
  value,
  onChange,
  language,
  idPrefix,
  yearRange,
}) => {
  const isNe = language === 'ne';
  const currentYear = new Date().getFullYear();
  const [startYear, endYear] = yearRange || [currentYear - 80, currentYear + 20];
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  const maxDay = daysInMonth(value.year, value.month);

  const selectClass =
    'w-full px-2 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none';

  return (
    <div className="grid grid-cols-3 gap-2">
      <select
        id={`${idPrefix}-year`}
        value={value.year}
        onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
        className={selectClass}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {isNe ? toNepaliDigits(y) : y}
          </option>
        ))}
      </select>
      <select
        id={`${idPrefix}-month`}
        value={value.month}
        onChange={(e) => {
          const month = Number(e.target.value);
          const day = Math.min(value.day, daysInMonth(value.year, month));
          onChange({ ...value, month, day });
        }}
        className={selectClass}
      >
        {AD_MONTHS_EN.map((mName, idx) => (
          <option key={idx + 1} value={idx + 1}>
            {isNe ? AD_MONTHS_NE[idx] : mName}
          </option>
        ))}
      </select>
      <select
        id={`${idPrefix}-day`}
        value={value.day}
        onChange={(e) => onChange({ ...value, day: Number(e.target.value) })}
        className={selectClass}
      >
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>
            {isNe ? toNepaliDigits(d) : d}
          </option>
        ))}
      </select>
    </div>
  );
};
