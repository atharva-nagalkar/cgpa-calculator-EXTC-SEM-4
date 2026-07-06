import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Copy, Download, MoonStar, Printer, Share2, SunMedium, Upload, RefreshCcw, Sparkles } from 'lucide-react';
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { subjects, totalCredits } from './data/subjects';
import {
  calculateResults,
  buildSubjectBreakdownRows,
  createEmptyMarks,
  formatPercentage,
  formatSGPA,
  validateMarks,
  serializeMarks,
} from './lib/sgpa';
import { loadRecentCalculations, loadStoredState, saveRecentCalculation, saveStoredState } from './lib/storage';
import { parseQuickPaste } from './lib/parser';

const initialState = loadStoredState();

const defaultMeta = {
  studentName: '',
  rollNumber: '',
  college: '',
};

function App() {
  const [theme, setTheme] = useState(() => initialState?.theme ?? 'dark');
  const [meta, setMeta] = useState(() => initialState?.meta ?? defaultMeta);
  const [marks, setMarks] = useState(() => initialState?.marks ?? createEmptyMarks());
  const [quickPaste, setQuickPaste] = useState('');
  const [toast, setToast] = useState('');
  const [recentCalculations, setRecentCalculations] = useState(() => loadRecentCalculations());

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    saveStoredState({ theme, meta, marks });
  }, [theme, meta, marks]);

  const validationErrors = useMemo(() => validateMarks(marks), [marks]);
  const isValid = Object.keys(validationErrors).length === 0;
  const results = useMemo(() => calculateResults(marks), [marks]);
  const breakdownRows = useMemo(() => buildSubjectBreakdownRows(results), [results]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(''), 2200);
  };

  const updateMeta = (field, value) => {
    setMeta((current) => ({ ...current, [field]: value }));
  };

  const updateMark = (subjectId, componentKey, value) => {
    if (value !== '' && !/^\d*$/.test(value)) {
      return;
    }
    setMarks((current) => ({
      ...current,
      [subjectId]: {
        ...current[subjectId],
        [componentKey]: value,
      },
    }));
  };

  const handleReset = () => {
    setMarks(createEmptyMarks());
    setMeta(defaultMeta);
    setQuickPaste('');
    showToast('Form reset');
  };

  const handleParse = () => {
    const parsed = parseQuickPaste(quickPaste);
    if (parsed.errors.length > 0) {
      showToast(parsed.errors[0]);
      return;
    }
    setMarks((current) => ({ ...current, ...parsed.marks }));
    showToast('Quick paste applied');
  };

  const handleCopy = async () => {
    try {
      const text = buildSummary(results, meta);
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(text);
      showToast('Result copied');
    } catch {
      showToast('Copy is unavailable in this browser');
    }
  };

  const handleShare = async () => {
    try {
      const text = buildSummary(results, meta);
      if (navigator.share) {
        await navigator.share({ title: 'SGPA Result', text });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        showToast('Share text copied');
        return;
      }
      throw new Error('Share unavailable');
    } catch {
      showToast('Share is unavailable in this browser');
    }
  };

  const handleSaveCalculation = () => {
    const entry = {
      id: globalThis.crypto?.randomUUID?.() ?? `calc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      savedAt: new Date().toISOString(),
      meta,
      results,
    };
    saveRecentCalculation(entry);
    setRecentCalculations(loadRecentCalculations());
    showToast('Saved locally');
  };

  const handlePrint = () => window.print();

  const handleExportPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF();
    let y = 18;
    pdf.setFontSize(16);
    pdf.text('Mumbai University SGPA Calculator', 14, y);
    y += 10;
    pdf.setFontSize(11);
    pdf.text(buildSummary(results, meta).split('\n'), 14, y);
    pdf.save('sgpa-result.pdf');
    showToast('PDF exported');
  };

  const filledCount = Object.values(marks).flatMap((subject) => Object.values(subject)).filter((value) => value !== '').length;
  const totalInputs = subjects.reduce((sum, subject) => sum + subject.components.length, 0);
  const completion = Math.round((filledCount / totalInputs) * 100);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="glass-card flex flex-col gap-6 rounded-[2rem] p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200 dark:text-slate-100">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Mumbai University Engineering EXTC NEP 2020 Semester 4
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">Mumbai University SGPA Calculator</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Calculate grades, credits, and SGPA with validation, quick paste parsing, local save, and export tools.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="action-button" onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}>
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <button className="action-button" onClick={handleReset}>
              <RefreshCcw className="h-4 w-4" />
              Reset
            </button>
            <button className="action-button" onClick={handleSaveCalculation} disabled={!isValid}>
              <Upload className="h-4 w-4" />
              Save result
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,480px)] lg:items-start">
          <div className="space-y-6">
            <div className="glass-card rounded-[1.75rem] p-6">
              <div className="grid gap-4 md:grid-cols-3">
                <InputField label="Student Name" value={meta.studentName} onChange={(value) => updateMeta('studentName', value)} placeholder="Enter name" />
                <InputField label="Roll Number" value={meta.rollNumber} onChange={(value) => updateMeta('rollNumber', value)} placeholder="Enter roll number" />
                <InputField label="College" value={meta.college} onChange={(value) => updateMeta('college', value)} placeholder="Enter college" />
              </div>
            </div>

            <div className="glass-card rounded-[1.75rem] p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Marks Entry</h2>
                  <p className="text-sm text-slate-300">Enter marks for every component. The calculator updates while you type.</p>
                </div>
                <div className="text-sm text-slate-300">Completion {completion}%</div>
              </div>
              <div className="space-y-4">
                {subjects.map((subject, index) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    marks={marks[subject.id]}
                    errors={validationErrors[subject.id]}
                    onChange={updateMark}
                    result={results.subjectResults[index]?.result}
                  />
                ))}
              </div>
            </div>

            <div className="glass-card rounded-[1.75rem] p-6">
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Quick Paste</h2>
                  <p className="text-sm text-slate-300">Paste compact subject marks, then parse to fill the form instantly.</p>
                </div>
                <button className="action-button" onClick={handleParse}>
                  Parse
                </button>
              </div>
              <textarea
                value={quickPaste}
                onChange={(event) => setQuickPaste(event.target.value)}
                placeholder={
                  'ADC 36 28 20 19\nCOA 38 35 19 18\nMC 33 26 23 22\nNNFL 51 30 16\nOE 24 18\nSES 44 22\nBDM 48\nDT 45'
                }
                className="min-h-44 w-full rounded-3xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20 dark:bg-slate-900/70"
              />
            </div>
          </div>

          <aside className="w-full space-y-6 lg:max-w-[480px] lg:justify-self-end">
            <div className="glass-card rounded-[1.75rem] p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">SGPA Dashboard</h2>
                <Calculator className="h-5 w-5 text-cyan-300" />
              </div>
              <div className="space-y-4">
                <Metric label="Total Credits" value={results.totalCredits} />
                <Metric label="Earned Grade Points" value={results.totalEarnedGradePoints.toFixed(2)} />
                <Metric label="SGPA" value={formatSGPA(results.sgpa)} accent />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button className="action-button w-full" onClick={handleCopy} disabled={!isValid}>
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
                <button className="action-button w-full" onClick={handleShare} disabled={!isValid}>
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button className="action-button w-full" onClick={handleExportPdf} disabled={!isValid}>
                  <Download className="h-4 w-4" />
                  PDF
                </button>
                <button className="action-button w-full" onClick={handlePrint} disabled={!isValid}>
                  <Printer className="h-4 w-4" />
                  Print
                </button>
              </div>
            </div>

            {isValid ? (
              <section className="glass-card animate-fadeUp w-full rounded-[1.75rem] p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold tracking-tight">📊 Subject-wise Breakdown</h3>
                    <p className="mt-1 text-sm text-slate-300">Calculated directly from the current SGPA result set.</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    Finalized
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/25">
                  <div className="max-h-[34rem] overflow-auto">
                    <table className="min-w-full border-separate border-spacing-0 text-sm">
                      <thead className="sticky top-0 z-10 bg-slate-950/95 text-slate-200 backdrop-blur-xl">
                        <tr>
                          <th className="border-b border-white/10 px-4 py-3 text-left font-semibold">Subject</th>
                          <th className="border-b border-white/10 px-4 py-3 text-right font-semibold">Marks</th>
                          <th className="border-b border-white/10 px-4 py-3 text-right font-semibold">Percentage</th>
                          <th className="border-b border-white/10 px-4 py-3 text-center font-semibold">Grade</th>
                          <th className="border-b border-white/10 px-4 py-3 text-right font-semibold">Grade Point (GP)</th>
                          <th className="border-b border-white/10 px-4 py-3 text-right font-semibold">Credits</th>
                          <th className="border-b border-white/10 px-4 py-3 text-right font-semibold">Credit Points (Credits × GP)</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-100">
                        {breakdownRows.map((row, index) => (
                          <tr
                            key={row.id}
                            className={`animate-fadeUp opacity-0 transition hover:bg-white/6 ${index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'}`}
                            style={{ animationDelay: `${index * 70}ms` }}
                          >
                            <td className="px-4 py-3 font-medium text-slate-100">{row.subject}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-200">{row.marks}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-200">{row.percentage}</td>
                            <td className="px-4 py-3 text-center">
                              <GradeBadge grade={row.grade} />
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-200">{row.gradePoint}</td>
                            <td className="px-4 py-3 text-right tabular-nums text-slate-200">{row.credits}</td>
                            <td className="px-4 py-3 text-right tabular-nums font-semibold text-white">{row.creditPoints}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="animate-fadeUp border-t border-white/10 bg-white/5 text-slate-100 opacity-0" style={{ animationDelay: '850ms' }}>
                          <td className="px-4 py-4 font-semibold">Summary</td>
                          <td className="px-4 py-4 text-right text-slate-300">Total Credits</td>
                          <td className="px-4 py-4 text-right font-semibold tabular-nums">{results.totalCredits}</td>
                          <td className="px-4 py-4 text-right text-slate-300">Total EGP</td>
                          <td className="px-4 py-4 text-right font-semibold tabular-nums">{results.totalEarnedGradePoints.toFixed(2)}</td>
                          <td className="px-4 py-4 text-right text-slate-300">Final SGPA</td>
                          <td className="px-4 py-4 text-right font-semibold tabular-nums text-cyan-200">{formatSGPA(results.sgpa)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="glass-card rounded-[1.75rem] p-6 sm:p-8">
              <div className="mb-6 space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Mumbai University NEP 2020 Grading System</h2>
                <p className="text-sm leading-6 text-slate-300">
                  Reference table for the Mumbai University NEP 2020 10-point grading scale used in this calculator.
                </p>
              </div>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/30">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-white/10 text-left text-sm">
                    <thead className="bg-white/5 text-slate-200">
                      <tr>
                        <th scope="col" className="px-5 py-4 font-semibold tracking-wide">
                          Percentage
                        </th>
                        <th scope="col" className="px-5 py-4 font-semibold tracking-wide">
                          Grade
                        </th>
                        <th scope="col" className="px-5 py-4 font-semibold tracking-wide">
                          Grade Point
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-slate-100">
                      {gradingRows.map((row) => (
                        <tr key={row.percentage} className="transition hover:bg-white/6">
                          <td className="px-5 py-4 font-medium">{row.percentage}</td>
                          <td className="px-5 py-4">{row.grade}</td>
                          <td className="px-5 py-4">{row.gradePoint}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="mt-5 rounded-3xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-4 text-sm leading-6 text-cyan-50">
                Grades are assigned according to the Mumbai University NEP 2020 10-point grading scale. Final SGPA is calculated using the credit-weighted average of grade points.
              </p>
            </section>

            <div className="glass-card rounded-[1.75rem] p-6">
              <h3 className="mb-4 text-lg font-semibold">Recent Calculations</h3>
              <div className="space-y-3">
                {recentCalculations.length === 0 ? (
                  <p className="text-sm text-slate-300">Saved calculations will appear here.</p>
                ) : (
                  recentCalculations.map((entry) => (
                    <button
                      key={entry.id}
                      className="recent-item"
                      onClick={() => {
                        if (entry.results?.sourceMarks) {
                          setMarks(serializeMarks(entry.results.sourceMarks));
                          setMeta(entry.meta ?? defaultMeta);
                          showToast('Recent calculation loaded');
                        }
                      }}
                    >
                      <div className="text-left">
                        <div className="font-medium">{entry.meta?.studentName || 'Unnamed student'}</div>
                        <div className="text-xs text-slate-300">SGPA {entry.results?.sgpa?.toFixed?.(2) ?? '0.00'}</div>
                      </div>
                      <div className="text-xs text-slate-400">{new Date(entry.savedAt).toLocaleString()}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>
        </section>

        <footer className="glass-card overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/20 backdrop-blur-xl sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-cyan-100">
                Made with <span className="text-rose-300">❤️</span> by
              </div>

              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Atharva Sanjay Nagalkar</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Full Stack Developer | Data Analytics Enthusiast | Engineering Student
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <SocialLink href="https://www.linkedin.com/in/atharva-nagalkar-55796a357/" label="LinkedIn" icon={<FiLinkedin className="h-4 w-4" />} />
                <SocialLink href="https://github.com/atharva-nagalkar" label="GitHub" icon={<FiGithub className="h-4 w-4" />} />
                <SocialLink href="mailto:hithisisnagalkaratharva@gmail.com" label="Email" icon={<FiMail className="h-4 w-4" />} />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5 sm:p-6 lg:justify-self-end lg:max-w-md">
              <div className="space-y-3 text-sm text-slate-300">
                <p className="font-medium text-white">© 2026 Mumbai University SGPA Calculator</p>
                <p>Designed &amp; Developed by Atharva Sanjay Nagalkar</p>
                <p className="pt-2 text-xs leading-6 text-slate-400">
                  Total credits in scheme: {totalCredits}. SGPA is calculated as total earned grade points divided by total credits.
                </p>
                <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-6 text-slate-300">
                  Disclaimer: This calculator is an independent student-built tool developed for educational purposes. While every effort has been made to match the Mumbai University NEP 2020 grading scheme, students should verify their final SGPA with the official university results.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {toast ? <Toast message={toast} /> : null}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20 dark:bg-slate-900/70"
      />
    </label>
  );
}

function SubjectCard({ subject, marks, errors, onChange, result }) {
  return (
    <div className="subject-card grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/7 md:grid-cols-[1.2fr_0.8fr]">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{subject.code}</h3>
          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">Credits {subject.credits}</span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{subject.name}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {subject.components.map((component) => (
            <label key={component.key} className="space-y-2">
              <span className="text-sm text-slate-300">
                {component.label} <span className="text-slate-500">/ {component.max}</span>
              </span>
              <input
                value={marks?.[component.key] ?? ''}
                onChange={(event) => onChange(subject.id, component.key, event.target.value)}
                inputMode="numeric"
                className={`w-full rounded-2xl border bg-slate-950/40 px-4 py-3 outline-none transition placeholder:text-slate-500 focus:ring-2 dark:bg-slate-900/70 ${
                  errors?.[component.key] ? 'border-rose-400/80 focus:border-rose-400 focus:ring-rose-400/20' : 'border-white/10 focus:border-cyan-400/70 focus:ring-cyan-400/20'
                }`}
                placeholder="0"
              />
              {errors?.[component.key] ? <span className="text-xs text-rose-300">{errors[component.key]}</span> : null}
            </label>
          ))}
        </div>
      </div>
      <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/25 p-4 text-sm">
        <ResultRow label="Subject Total" value={`${result?.total ?? 0}`} />
        <ResultRow label="Percentage" value={formatPercentage(result?.percentage ?? 0)} />
        <ResultRow label="Grade" value={result?.grade ?? 'F'} />
        <ResultRow label="Grade Point" value={`${result?.gradePoint ?? 0}`} />
        <ResultRow label="Credits" value={`${result?.credits ?? subject.credits}`} />
        <ResultRow label="Credit Points" value={`${result?.earnedGradePoints ?? 0}`} />
      </div>
    </div>
  );
}

function Metric({ label, value, accent = false }) {
  return (
    <div className={`rounded-3xl border border-white/10 p-4 ${accent ? 'bg-cyan-400/10' : 'bg-white/5'}`}>
      <div className="text-sm text-slate-300">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${accent ? 'text-cyan-200' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}

function Toast({ message }) {
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-slate-950/90 px-5 py-3 text-sm text-white shadow-2xl shadow-black/30 backdrop-blur-xl">
      {message}
    </div>
  );
}

function SocialLink({ href, label, icon }) {
  const isMail = href.startsWith('mailto:');

  return (
    <a
      href={href}
      target={isMail ? undefined : '_blank'}
      rel={isMail ? undefined : 'noreferrer'}
      aria-label={label}
      className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-slate-100 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white hover:shadow-glow"
    >
      <span className="text-slate-300 transition group-hover:text-cyan-200">{icon}</span>
      <span>{label}</span>
    </a>
  );
}

function GradeBadge({ grade }) {
  const styles = {
    O: 'bg-emerald-400/15 text-emerald-200 ring-emerald-400/20',
    'A+': 'bg-green-400/15 text-green-200 ring-green-400/20',
    A: 'bg-lime-400/15 text-lime-200 ring-lime-400/20',
    'B+': 'bg-yellow-400/15 text-yellow-200 ring-yellow-400/20',
    B: 'bg-orange-400/15 text-orange-200 ring-orange-400/20',
    C: 'bg-orange-600/15 text-orange-100 ring-orange-500/20',
    P: 'bg-sky-400/15 text-sky-200 ring-sky-400/20',
    F: 'bg-rose-400/15 text-rose-200 ring-rose-400/20',
  };

  return <span className={`inline-flex min-w-12 items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[grade] ?? styles.F}`}>{grade}</span>;
}

const gradingRows = [
  { percentage: '90–100', grade: 'O', gradePoint: 10 },
  { percentage: '80–89', grade: 'A+', gradePoint: 9 },
  { percentage: '70–79', grade: 'A', gradePoint: 8 },
  { percentage: '60–69', grade: 'B+', gradePoint: 7 },
  { percentage: '55–59', grade: 'B', gradePoint: 6 },
  { percentage: '50–54', grade: 'C', gradePoint: 5 },
  { percentage: '40–49', grade: 'P', gradePoint: 4 },
  { percentage: 'Below 40', grade: 'F', gradePoint: 0 },
];

function buildSummary(results, meta) {
  const lines = [
    'Mumbai University SGPA Calculator',
    `Student: ${meta.studentName || 'N/A'}`,
    `Roll Number: ${meta.rollNumber || 'N/A'}`,
    `College: ${meta.college || 'N/A'}`,
    `Total Credits: ${results.totalCredits}`,
    `Total Earned Grade Points: ${results.totalEarnedGradePoints.toFixed(2)}`,
    `SGPA: ${formatSGPA(results.sgpa)}`,
  ];
  return lines.join('\n');
}

export default App;