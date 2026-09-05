import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNepaliCurrency } from '../services/forex';

interface TrendPoint {
  date: string; // "YYYY-MM-DD"
  value: number;
}

interface GoldRateTrendChartProps {
  points: TrendPoint[];
  colorClassName?: string; // Tailwind text-color class, used as SVG currentColor
  language: 'en' | 'ne';
}

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 120;
const PADDING_Y = 12;

export const GoldRateTrendChart: React.FC<GoldRateTrendChartProps> = ({
  points,
  colorClassName = 'text-amber-500 dark:text-amber-400',
  language,
}) => {
  const isNe = language === 'ne';

  const { linePath, areaPath, min, max, first, last, changePct } = useMemo(() => {
    if (points.length < 2) {
      return { linePath: '', areaPath: '', min: 0, max: 0, first: null, last: null, changePct: 0 };
    }
    const values = points.map((p) => p.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;
    const stepX = VIEW_WIDTH / (points.length - 1);

    const coords = points.map((p, i) => {
      const x = i * stepX;
      const y =
        VIEW_HEIGHT -
        PADDING_Y -
        ((p.value - minVal) / range) * (VIEW_HEIGHT - PADDING_Y * 2);
      return [x, y];
    });

    const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = `${line} L${VIEW_WIDTH},${VIEW_HEIGHT} L0,${VIEW_HEIGHT} Z`;

    const firstVal = points[0].value;
    const lastVal = points[points.length - 1].value;
    const pct = firstVal !== 0 ? ((lastVal - firstVal) / firstVal) * 100 : 0;

    return {
      linePath: line,
      areaPath: area,
      min: minVal,
      max: maxVal,
      first: points[0],
      last: points[points.length - 1],
      changePct: pct,
    };
  }, [points]);

  if (points.length < 2 || !last || !first) {
    return (
      <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm text-center space-y-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isNe
            ? 'ग्राफ देखाउन पर्याप्त ऐतिहासिक डेटा छैन।'
            : 'Not enough history yet to show a trend graph.'}
        </p>
      </div>
    );
  }

  const isUp = changePct > 0.001;
  const isDown = changePct < -0.001;
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const trendColor = isUp
    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
    : isDown
      ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
      : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';

  return (
    <div className="p-5 sm:p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isNe ? 'हालको दर' : 'Latest'}
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
            {formatNepaliCurrency(last.value)}
          </div>
        </div>
        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          {Math.abs(changePct).toFixed(1)}%
        </span>
      </div>

      <svg viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`} className={`w-full h-28 ${colorClassName}`} preserveAspectRatio="none">
        <path d={areaPath} fill="currentColor" opacity="0.12" stroke="none" />
        <path d={linePath} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1">
        <span>{first.date}</span>
        <span className="text-slate-400 dark:text-slate-500">
          {isNe ? 'न्यून' : 'Low'} {formatNepaliCurrency(min)} · {isNe ? 'उच्च' : 'High'} {formatNepaliCurrency(max)}
        </span>
        <span>{last.date}</span>
      </div>
    </div>
  );
};
