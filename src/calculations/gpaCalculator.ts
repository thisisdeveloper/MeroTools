export interface SubjectGrade {
  id: string;
  name: string;
  creditHours: number;
  gradePoint: number;
  letterGrade: string;
}

export interface GpaGradeScaleItem {
  letter: string;
  gradePoint: number;
  percentRange: string;
  descriptionEn: string;
  descriptionNe: string;
}

export const NEPAL_GPA_SCALES: GpaGradeScaleItem[] = [
  { letter: 'A+', gradePoint: 4.0, percentRange: '90% - 100%', descriptionEn: 'Outstanding', descriptionNe: 'विशिष्ट (Outstanding)' },
  { letter: 'A', gradePoint: 3.6, percentRange: '80% - 89.9%', descriptionEn: 'Excellent', descriptionNe: 'उत्कृष्ट (Excellent)' },
  { letter: 'B+', gradePoint: 3.2, percentRange: '70% - 79.9%', descriptionEn: 'Very Good', descriptionNe: 'धेरै राम्रो (Very Good)' },
  { letter: 'B', gradePoint: 2.8, percentRange: '60% - 69.9%', descriptionEn: 'Good', descriptionNe: 'राम्रो (Good)' },
  { letter: 'C+', gradePoint: 2.4, percentRange: '50% - 59.9%', descriptionEn: 'Satisfactory', descriptionNe: 'सन्तोषजनक (Satisfactory)' },
  { letter: 'C', gradePoint: 2.0, percentRange: '40% - 49.9%', descriptionEn: 'Acceptable', descriptionNe: 'स्वीकार्य (Acceptable)' },
  { letter: 'D', gradePoint: 1.6, percentRange: '35% - 39.9%', descriptionEn: 'Basic', descriptionNe: 'आधारभूत (Basic)' },
  { letter: 'NG', gradePoint: 0.0, percentRange: 'Below 35%', descriptionEn: 'Non-Graded (Fail)', descriptionNe: 'अवर्गीकृत (Non-Graded)' },
];

export function getGradePointFromPercentage(percent: number): { letter: string; gradePoint: number } {
  if (percent >= 90) return { letter: 'A+', gradePoint: 4.0 };
  if (percent >= 80) return { letter: 'A', gradePoint: 3.6 };
  if (percent >= 70) return { letter: 'B+', gradePoint: 3.2 };
  if (percent >= 60) return { letter: 'B', gradePoint: 2.8 };
  if (percent >= 50) return { letter: 'C+', gradePoint: 2.4 };
  if (percent >= 40) return { letter: 'C', gradePoint: 2.0 };
  if (percent >= 35) return { letter: 'D', gradePoint: 1.6 };
  return { letter: 'NG', gradePoint: 0.0 };
}

export function calculateOverallGpa(subjects: SubjectGrade[]): {
  finalGpa: number;
  totalCreditHours: number;
  totalGradePoints: number;
  overallLetter: string;
  hasNonGraded: boolean;
} {
  if (!subjects.length) {
    return {
      finalGpa: 0,
      totalCreditHours: 0,
      totalGradePoints: 0,
      overallLetter: 'NG',
      hasNonGraded: false,
    };
  }

  let totalWeightedGP = 0;
  let totalCredits = 0;
  let hasNG = false;

  for (const s of subjects) {
    const credits = Math.max(0.5, s.creditHours);
    totalWeightedGP += s.gradePoint * credits;
    totalCredits += credits;
    if (s.letterGrade === 'NG' || s.gradePoint === 0) {
      hasNG = true;
    }
  }

  const finalGpa = totalCredits > 0 ? totalWeightedGP / totalCredits : 0;
  const roundedGpa = Number(finalGpa.toFixed(2));

  let overallLetter = 'NG';
  if (!hasNG) {
    if (roundedGpa >= 3.6) overallLetter = 'A+';
    else if (roundedGpa >= 3.2) overallLetter = 'A';
    else if (roundedGpa >= 2.8) overallLetter = 'B+';
    else if (roundedGpa >= 2.4) overallLetter = 'B';
    else if (roundedGpa >= 2.0) overallLetter = 'C+';
    else if (roundedGpa >= 1.6) overallLetter = 'C';
    else if (roundedGpa >= 1.2) overallLetter = 'D';
    else overallLetter = 'NG';
  }

  return {
    finalGpa: roundedGpa,
    totalCreditHours: totalCredits,
    totalGradePoints: Number(totalWeightedGP.toFixed(2)),
    overallLetter,
    hasNonGraded: hasNG,
  };
}
