import React, { useState, useMemo } from 'react';
import { Language } from '../../types';
import {
  SubjectGrade,
  calculateOverallGpa,
  NEPAL_GPA_SCALES,
} from '../../calculations/gpaCalculator';
import { GraduationCap, Plus, Trash2, RotateCcw, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';

interface GpaCalculatorProps {
  language: Language;
}

const DEFAULT_SUBJECTS: SubjectGrade[] = [
  { id: '1', name: 'Compulsory English', creditHours: 4, gradePoint: 3.6, letterGrade: 'A' },
  { id: '2', name: 'Compulsory Nepali', creditHours: 3, gradePoint: 3.2, letterGrade: 'B+' },
  { id: '3', name: 'Compulsory Mathematics', creditHours: 4, gradePoint: 4.0, letterGrade: 'A+' },
  { id: '4', name: 'Compulsory Science', creditHours: 4, gradePoint: 3.6, letterGrade: 'A' },
  { id: '5', name: 'Social Studies & Life Skills', creditHours: 4, gradePoint: 3.2, letterGrade: 'B+' },
  { id: '6', name: 'Optional I (Account / Computer)', creditHours: 4, gradePoint: 4.0, letterGrade: 'A+' },
];

export const GpaCalculator: React.FC<GpaCalculatorProps> = ({ language }) => {
  const isNe = language === 'ne';

  const [subjects, setSubjects] = useState<SubjectGrade[]>(DEFAULT_SUBJECTS);
  const [copied, setCopied] = useState<boolean>(false);

  const gpaResult = useMemo(() => {
    return calculateOverallGpa(subjects);
  }, [subjects]);

  const handleGradeChange = (id: string, letter: string) => {
    const scale = NEPAL_GPA_SCALES.find((s) => s.letter === letter);
    const gp = scale ? scale.gradePoint : 0;
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, letterGrade: letter, gradePoint: gp } : s))
    );
  };

  const handleCreditChange = (id: string, credits: number) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, creditHours: Math.max(0.5, credits) } : s))
    );
  };

  const handleNameChange = (id: string, name: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const handleAddSubject = () => {
    const newId = String(Date.now());
    setSubjects((prev) => [
      ...prev,
      {
        id: newId,
        name: `Subject ${prev.length + 1}`,
        creditHours: 4,
        gradePoint: 3.6,
        letterGrade: 'A',
      },
    ]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleReset = () => {
    setSubjects(DEFAULT_SUBJECTS);
  };

  const handleCopy = () => {
    const text = `[MeroTools GPA Calculation Result]
Overall GPA: ${gpaResult.finalGpa.toFixed(2)} (${gpaResult.overallLetter})
Total Credit Hours: ${gpaResult.totalCreditHours}
Total Grade Points: ${gpaResult.totalGradePoints}
Subjects:
${subjects.map((s) => `- ${s.name}: ${s.letterGrade} (${s.gradePoint} GP, ${s.creditHours} CH)`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="gpa-calculator-tool" className="space-y-6">
      {/* Result Card Top Banner */}
      <div
        id="gpa-result-card"
        className="p-5 sm:p-7 rounded-[2rem] bg-gradient-to-r from-red-600 to-blue-700 text-white shadow-xl space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isNe ? 'अन्तिम नतिजा (Cumulative GPA)' : 'Cumulative Grade Point Average (GPA)'}
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <div className="text-4xl sm:text-5xl font-black text-white leading-tight">
                {gpaResult.finalGpa.toFixed(2)}
              </div>
              <span className="text-xl sm:text-2xl font-black px-3 py-0.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-amber-300">
                Grade: {gpaResult.overallLetter}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold transition-all"
              title="Reset subjects"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isNe ? 'रिसेट' : 'Reset'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-xs font-bold transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5 text-white" />}
              <span>{copied ? (isNe ? 'कपी भयो!' : 'Copied!') : isNe ? 'कपी' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {gpaResult.hasNonGraded && (
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-300" />
            <span>
              {isNe
                ? 'चेतावनी: एक वा बढी विषयमा NG (Non-Graded) रहेकोले ग्रेडवृद्धि परीक्षा दिनुपर्ने हुन्छ।'
                : 'Note: Contains Non-Graded (NG) subject(s). Grade increment examination required.'}
            </span>
          </div>
        )}

        {/* Secondary metric chips */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/15">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-red-100 font-medium">
              {isNe ? 'कुल क्रेडिट घण्टा (Total Credits):' : 'Total Credit Hours:'}
            </span>
            <div className="text-base font-extrabold text-white mt-0.5">
              {gpaResult.totalCreditHours} hrs
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
            <span className="text-[11px] text-red-100 font-medium">
              {isNe ? 'कुल वेटेड ग्रेड पोइन्ट:' : 'Total Weighted GP:'}
            </span>
            <div className="text-base font-extrabold text-white mt-0.5">
              {gpaResult.totalGradePoints}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Rows Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-red-600" />
            <h2 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-white">
              {isNe ? 'विषय तथा प्राप्त ग्रेड सूची' : 'Subjects & Grade Points (SEE / NEB / TU)'}
            </h2>
          </div>

          <button
            onClick={handleAddSubject}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/60 dark:border-red-900 hover:bg-red-100 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isNe ? 'विषय थप्नुहोस्' : 'Add Subject'}</span>
          </button>
        </div>

        {/* Subjects List */}
        <div className="space-y-3">
          {subjects.map((sub, index) => (
            <div
              key={sub.id}
              className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
            >
              {/* Subject Title Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={sub.name}
                  onChange={(e) => handleNameChange(sub.id, e.target.value)}
                  placeholder={`Subject ${index + 1}`}
                  className="w-full bg-transparent font-bold text-xs sm:text-sm text-slate-800 dark:text-white focus:outline-none border-b border-transparent focus:border-red-500 py-1"
                />
              </div>

              {/* Credit Hours & Grade Letter */}
              <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Credits:</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={sub.creditHours}
                    onChange={(e) => handleCreditChange(sub.id, Number(e.target.value))}
                    className="w-14 px-2 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-center focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-medium">Grade:</span>
                  <select
                    value={sub.letterGrade}
                    onChange={(e) => handleGradeChange(sub.id, e.target.value)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-red-600 dark:text-red-400 focus:outline-none"
                  >
                    {NEPAL_GPA_SCALES.map((sc) => (
                      <option key={sc.letter} value={sc.letter}>
                        {sc.letter} ({sc.gradePoint})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleRemoveSubject(sub.id)}
                  disabled={subjects.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                  title="Remove subject"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nepal Grading Reference Scale Table */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          {isNe ? 'नेपाल परीक्षा बोर्ड (NEB / SEE) अक्षराङ्कन ग्रेडिङ तालिका' : 'NEB Letter Grading Scale Reference'}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {NEPAL_GPA_SCALES.map((sc) => (
            <div
              key={sc.letter}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-red-600 dark:text-red-400 text-sm">{sc.letter}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">{sc.gradePoint} GP</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{sc.percentRange}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">
                {isNe ? sc.descriptionNe : sc.descriptionEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
