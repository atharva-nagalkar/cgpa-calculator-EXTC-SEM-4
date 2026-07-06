export const gradeScale = [
  { min: 90, max: 100, grade: 'O', point: 10 },
  { min: 80, max: 89, grade: 'A+', point: 9 },
  { min: 70, max: 79, grade: 'A', point: 8 },
  { min: 60, max: 69, grade: 'B+', point: 7 },
  { min: 55, max: 59, grade: 'B', point: 6 },
  { min: 50, max: 54, grade: 'C', point: 5 },
  { min: 40, max: 49, grade: 'P', point: 4 },
  { min: 0, max: 39, grade: 'F', point: 0 },
];

export const totalCredits = 23;

export const subjects = [
  {
    id: 'adc-theory',
    code: 'ADC-T',
    name: 'Analog and Digital Communication',
    type: 'theory',
    credits: 3,
    components: [
      { key: 'theory', label: 'Theory', max: 60, required: true },
      { key: 'internal', label: 'Internal', max: 40, required: true },
    ],
  },
  {
    id: 'adc-lab',
    code: 'ADC-L',
    name: 'Analog and Digital Communication Lab',
    type: 'lab',
    credits: 1,
    components: [
      { key: 'tw', label: 'TW', max: 25, required: true },
      { key: 'oral', label: 'Oral', max: 25, required: true },
    ],
  },
  {
    id: 'coa-theory',
    code: 'COA-T',
    name: 'Computer Organization and Architecture',
    type: 'theory',
    credits: 3,
    components: [
      { key: 'theory', label: 'Theory', max: 60, required: true },
      { key: 'internal', label: 'Internal', max: 40, required: true },
    ],
  },
  {
    id: 'coa-lab',
    code: 'COA-L',
    name: 'Computer Organization and Architecture Lab',
    type: 'lab',
    credits: 1,
    components: [
      { key: 'tw', label: 'TW', max: 25, required: true },
      { key: 'oral', label: 'Oral', max: 25, required: true },
    ],
  },
  {
    id: 'micro-theory',
    code: 'MC-T',
    name: 'Microcontroller',
    type: 'theory',
    credits: 3,
    components: [
      { key: 'theory', label: 'Theory', max: 60, required: true },
      { key: 'internal', label: 'Internal', max: 40, required: true },
    ],
  },
  {
    id: 'micro-lab',
    code: 'MC-L',
    name: 'Microcontroller Lab',
    type: 'lab',
    credits: 1,
    components: [
      { key: 'tw', label: 'TW', max: 25, required: true },
      { key: 'oral', label: 'Oral', max: 25, required: true },
    ],
  },
  {
    id: 'nnfl',
    code: 'NNFL',
    name: 'Neural Network and Fuzzy Logic',
    type: 'theory',
    credits: 3,
    components: [
      { key: 'theory', label: 'Theory', max: 60, required: true },
      { key: 'internal', label: 'Internal', max: 40, required: true },
      { key: 'tw', label: 'TW', max: 25, required: true },
    ],
  },
  {
    id: 'oe',
    code: 'OE',
    name: 'Open Elective',
    type: 'theory',
    credits: 2,
    components: [
      { key: 'theory', label: 'Theory', max: 30, required: true },
      { key: 'internal', label: 'Internal', max: 20, required: true },
    ],
  },
  {
    id: 'ses',
    code: 'SES',
    name: 'Smart Embedded Systems',
    type: 'lab',
    credits: 2,
    components: [
      { key: 'tw', label: 'TW', max: 50, required: true },
      { key: 'oral', label: 'Oral', max: 25, required: true },
    ],
  },
  {
    id: 'bdm',
    code: 'BDM',
    name: 'Business Development',
    type: 'lab',
    credits: 2,
    components: [
      { key: 'tw', label: 'TW', max: 50, required: true },
    ],
  },
  {
    id: 'dt',
    code: 'DT',
    name: 'Design Thinking',
    type: 'lab',
    credits: 2,
    components: [
      { key: 'tw', label: 'TW', max: 50, required: true },
    ],
  },
];