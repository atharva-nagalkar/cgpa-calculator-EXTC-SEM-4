import { gradeScale, subjects as subjectCatalog, totalCredits } from '../data/subjects';

export const createEmptyMarks = () =>
  Object.fromEntries(
    subjectCatalog.map((subject) => [
      subject.id,
      Object.fromEntries(subject.components.map((component) => [component.key, ''])),
    ]),
  );

export const getGradeInfo = (percentage) => {
  const match = gradeScale.find((entry) => percentage >= entry.min && percentage <= entry.max);
  return match ?? gradeScale[gradeScale.length - 1];
};

const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

export const validateMarks = (marks) => {
  const errors = {};

  subjectCatalog.forEach((subject) => {
    const subjectErrors = {};
    subject.components.forEach((component) => {
      const value = toNumber(marks[subject.id]?.[component.key]);
      if (value === null) {
        subjectErrors[component.key] = 'Required';
        return;
      }
      if (value < 0) {
        subjectErrors[component.key] = 'Cannot be negative';
        return;
      }
      if (value > component.max) {
        subjectErrors[component.key] = `Max ${component.max}`;
      }
    });
    if (Object.keys(subjectErrors).length > 0) {
      errors[subject.id] = subjectErrors;
    }
  });

  return errors;
};

export const calculateSubjectResult = (subject, markValues) => {
  const components = subject.components.map((component) => ({
    ...component,
    value: toNumber(markValues[component.key]) ?? 0,
  }));

  const total = components.reduce((sum, component) => sum + component.value, 0);
  const denominator = components.reduce((sum, component) => sum + component.max, 0);
  const percentage = denominator === 0 ? 0 : (total / denominator) * 100;
  const gradeInfo = getGradeInfo(percentage);
  const gradePoint = gradeInfo.point;
  const earnedGradePoints = gradePoint * subject.credits;

  return {
    total,
    percentage,
    grade: gradeInfo.grade,
    gradePoint,
    credits: subject.credits,
    earnedGradePoints,
    components,
  };
};

export const calculateResults = (marks) => {
  const subjectResults = subjectCatalog.map((subject) => ({
    subject,
    result: calculateSubjectResult(subject, marks[subject.id] ?? {}),
  }));

  const totalCreditsUsed = subjectResults.reduce((sum, entry) => sum + entry.result.credits, 0);
  const totalEarnedGradePoints = subjectResults.reduce((sum, entry) => sum + entry.result.earnedGradePoints, 0);
  const sgpa = totalCreditsUsed === 0 ? 0 : totalEarnedGradePoints / totalCreditsUsed;

  return {
    subjectResults,
    totalCredits: totalCreditsUsed || totalCredits,
    totalEarnedGradePoints,
    sgpa,
    sourceMarks: serializeMarks(marks),
  };
};

const subjectLabels = {
  'adc-theory': 'ADC Theory',
  'adc-lab': 'ADC Lab',
  'coa-theory': 'COA Theory',
  'coa-lab': 'COA Lab',
  'micro-theory': 'Microcontroller Theory',
  'micro-lab': 'Microcontroller Lab',
  nnfl: 'Neural Network & Fuzzy Logic',
  oe: 'Open Elective',
  ses: 'Smart Embedded Systems',
  bdm: 'Business Development',
  dt: 'Design Thinking',
};

export const buildSubjectBreakdownRows = (results) =>
  results.subjectResults.map(({ subject, result }) => {
    const totalMarks = result.components.reduce((sum, component) => sum + component.max, 0);

    return {
      id: subject.id,
      subject: subjectLabels[subject.id] ?? subject.name,
      marks: `${result.total}/${totalMarks}`,
      percentage: formatPercentage(result.percentage),
      grade: result.grade,
      gradePoint: result.gradePoint,
      credits: result.credits,
      creditPoints: result.earnedGradePoints,
    };
  });

export const formatPercentage = (value) => `${value.toFixed(2)}%`;
export const formatSGPA = (value) => value.toFixed(2);

export const serializeMarks = (marks) => JSON.parse(JSON.stringify(marks));