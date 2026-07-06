import { subjects } from '../data/subjects';

const parserAliases = new Map([
  ['adc', ['adc-theory', 'adc-lab']],
  ['coa', ['coa-theory', 'coa-lab']],
  ['mc', ['micro-theory', 'micro-lab']],
  ['microcontroller', ['micro-theory', 'micro-lab']],
  ['nnfl', ['nnfl']],
  ['oe', ['oe']],
  ['ses', ['ses']],
  ['bdm', ['bdm']],
  ['dt', ['dt']],
]);

const tokenize = (line) => line.trim().split(/[\s,]+/).filter(Boolean);

export const parseQuickPaste = (input) => {
  const normalized = input.replace(/\r\n/g, '\n').trim();
  const marks = {};
  const errors = [];

  if (!normalized) {
    return { marks, errors: ['Paste text is empty'] };
  }

  normalized.split('\n').forEach((line) => {
    const tokens = tokenize(line);
    if (tokens.length === 0) {
      return;
    }

    const rawCode = tokens.shift().toLowerCase();
    const subjectGroup = parserAliases.get(rawCode);
    if (!subjectGroup) {
      errors.push(`Unknown subject code: ${rawCode}`);
      return;
    }

    const values = tokens.map((token) => Number(token));

    if (values.some((value) => Number.isNaN(value))) {
      errors.push(`Invalid mark value for ${rawCode.toUpperCase()}`);
      return;
    }

    const requiredValues = subjectGroup.reduce((sum, subjectId) => {
      const subject = subjects.find((entry) => entry.id === subjectId);
      return sum + (subject?.components.length ?? 0);
    }, 0);

    if (values.length < requiredValues) {
      errors.push(`Missing values for ${rawCode.toUpperCase()}`);
      return;
    }

    let offset = 0;
    subjectGroup.forEach((subjectId) => {
      const subject = subjects.find((entry) => entry.id === subjectId);
      if (!subject) {
        return;
      }

      marks[subject.id] = subject.components.reduce((accumulator, component) => {
        accumulator[component.key] = String(values[offset] ?? '');
        offset += 1;
        return accumulator;
      }, {});
    });
  });

  return { marks, errors };
};