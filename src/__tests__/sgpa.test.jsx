import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { buildSubjectBreakdownRows, calculateResults, getGradeInfo } from '../lib/sgpa';
import { parseQuickPaste } from '../lib/parser';
import App from '../App';

describe('grade boundaries', () => {
  it('maps percentages to the right grades', () => {
    expect(getGradeInfo(95)).toMatchObject({ grade: 'O', point: 10 });
    expect(getGradeInfo(89)).toMatchObject({ grade: 'A+', point: 9 });
    expect(getGradeInfo(70)).toMatchObject({ grade: 'A', point: 8 });
    expect(getGradeInfo(60)).toMatchObject({ grade: 'B+', point: 7 });
    expect(getGradeInfo(55)).toMatchObject({ grade: 'B', point: 6 });
    expect(getGradeInfo(50)).toMatchObject({ grade: 'C', point: 5 });
    expect(getGradeInfo(40)).toMatchObject({ grade: 'P', point: 4 });
    expect(getGradeInfo(39)).toMatchObject({ grade: 'F', point: 0 });
  });
});

describe('SGPA calculations', () => {
  it('computes totals using the credit system', () => {
    const marks = {
      'adc-theory': { theory: '60', internal: '40' },
      'adc-lab': { tw: '25', oral: '25' },
      'coa-theory': { theory: '60', internal: '40' },
      'coa-lab': { tw: '25', oral: '25' },
      'micro-theory': { theory: '60', internal: '40' },
      'micro-lab': { tw: '25', oral: '25' },
      nnfl: { theory: '60', internal: '40', tw: '25' },
      oe: { theory: '30', internal: '20' },
      ses: { tw: '50', oral: '25' },
      bdm: { tw: '50' },
      dt: { tw: '50' },
    };

    const result = calculateResults(marks);
    expect(result.totalCredits).toBe(23);
    expect(result.sgpa).toBe(10);
    expect(result.totalEarnedGradePoints).toBe(230);
  });

  it('maps every SES TW and oral combination to the correct grade', () => {
    const expectedGradeFromPercentage = (percentage) => {
      if (percentage >= 90) return { grade: 'O', point: 10 };
      if (percentage >= 80) return { grade: 'A+', point: 9 };
      if (percentage >= 70) return { grade: 'A', point: 8 };
      if (percentage >= 60) return { grade: 'B+', point: 7 };
      if (percentage >= 55) return { grade: 'B', point: 6 };
      if (percentage >= 50) return { grade: 'C', point: 5 };
      if (percentage >= 40) return { grade: 'P', point: 4 };
      return { grade: 'F', point: 0 };
    };

    for (let tw = 20; tw <= 50; tw += 1) {
      for (let oral = 10; oral <= 25; oral += 1) {
        const result = calculateResults({ ses: { tw: String(tw), oral: String(oral) } });
        const sesResult = result.subjectResults.find(({ subject }) => subject.id === 'ses').result;
        const expectedPercentage = ((tw + oral) / 75) * 100;
        const expected = expectedGradeFromPercentage(Math.floor(expectedPercentage));

        expect(sesResult.total).toBe(tw + oral);
        expect(sesResult.percentage).toBeCloseTo(expectedPercentage, 10);
        expect(sesResult.grade).toBe(expected.grade);
        expect(sesResult.gradePoint).toBe(expected.point);
      }
    }
  });

  it('builds a subject-wise breakdown from the existing calculation results', () => {
    const marks = {
      'adc-theory': { theory: '36', internal: '28' },
      'adc-lab': { tw: '20', oral: '19' },
      'coa-theory': { theory: '38', internal: '35' },
      'coa-lab': { tw: '19', oral: '18' },
      'micro-theory': { theory: '33', internal: '26' },
      'micro-lab': { tw: '23', oral: '22' },
      nnfl: { theory: '51', internal: '30', tw: '16' },
      oe: { theory: '24', internal: '18' },
      ses: { tw: '44', oral: '22' },
      bdm: { tw: '48' },
      dt: { tw: '45' },
    };

    const result = calculateResults(marks);
    const rows = buildSubjectBreakdownRows(result);

    expect(rows).toHaveLength(11);
    expect(rows[0]).toMatchObject({
      subject: 'ADC Theory',
      marks: '64/100',
      percentage: '64.00%',
      grade: 'B+',
      gradePoint: 7,
      credits: 3,
      creditPoints: 21,
    });
    expect(rows[1]).toMatchObject({
      subject: 'ADC Lab',
      marks: '39/50',
      percentage: '78.00%',
      grade: 'A',
      gradePoint: 8,
      credits: 1,
      creditPoints: 8,
    });
    expect(rows[0].creditPoints + rows[1].creditPoints).toBe(29);
    expect(result.totalCredits).toBe(23);
    expect(rows.reduce((sum, row) => sum + row.creditPoints, 0)).toBe(result.totalEarnedGradePoints);
    expect(result.sgpa).toBe(result.totalEarnedGradePoints / 23);
  });
});

describe('quick paste parser', () => {
  it('parses compact marks into subject fields', () => {
    const parsed = parseQuickPaste('ADC 36 28 20 19\nCOA 38 35 19 18\nMC 33 26 23 22\nNNFL 51 30 16\nOE 24 18\nSES 44 22\nBDM 48\nDT 45');
    expect(parsed.errors).toHaveLength(0);
    expect(parsed.marks['adc-theory']).toMatchObject({ theory: '36', internal: '28' });
    expect(parsed.marks['adc-lab']).toMatchObject({ tw: '20', oral: '19' });
    expect(parsed.marks['micro-lab']).toMatchObject({ tw: '23', oral: '22' });
    expect(parsed.marks.nnfl).toMatchObject({ theory: '51', internal: '30', tw: '16' });
  });

  it('rejects unknown subject codes', () => {
    const parsed = parseQuickPaste('XYZ 10 10');
    expect(parsed.errors[0]).toMatch(/Unknown subject code/i);
  });
});

describe('app smoke test', () => {
  it('renders the main dashboard', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Mumbai University SGPA Calculator/i })).toBeInTheDocument();
  });
});