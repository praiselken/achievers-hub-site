export interface Question {
  id: string;
  subject: 'maths' | 'economics';
  topic_id: string;
  pathway: string;
  type: 'level' | 'weak' | 'stretch';
  question: string;
  options: string[];
  answer: number; // index into options
  explanation: string;
}

export const SAMPLE_QUESTIONS: Question[] = [
  // Maths — Foundation
  {
    id: 'q-m-001', subject: 'maths', topic_id: 'm-n-03', pathway: 'foundation', type: 'level',
    question: 'Calculate 15% of £240.',
    options: ['£24', '£36', '£48', '£60'],
    answer: 1,
    explanation: '10% of £240 = £24. 5% = £12. 10% + 5% = £36.',
  },
  {
    id: 'q-m-002', subject: 'maths', topic_id: 'm-a-03', pathway: 'foundation', type: 'level',
    question: 'Solve: 3x + 7 = 22',
    options: ['x = 3', 'x = 4', 'x = 5', 'x = 6'],
    answer: 2,
    explanation: '3x = 22 − 7 = 15, so x = 15 ÷ 3 = 5.',
  },
  {
    id: 'q-m-003', subject: 'maths', topic_id: 'm-g-03', pathway: 'foundation', type: 'level',
    question: 'Find the area of a rectangle with length 12 cm and width 7 cm.',
    options: ['38 cm²', '72 cm²', '84 cm²', '96 cm²'],
    answer: 2,
    explanation: 'Area = length × width = 12 × 7 = 84 cm².',
  },
  {
    id: 'q-m-004', subject: 'maths', topic_id: 'm-n-04', pathway: 'foundation', type: 'weak',
    question: 'Divide £120 in the ratio 3:5.',
    options: ['£36 and £84', '£45 and £75', '£48 and £72', '£60 and £60'],
    answer: 1,
    explanation: 'Total parts = 8. Each part = £120 ÷ 8 = £15. So: 3 × £15 = £45 and 5 × £15 = £75.',
  },
  {
    id: 'q-m-005', subject: 'maths', topic_id: 'm-a-04', pathway: 'higher', type: 'stretch',
    question: 'Solve x² + 5x + 6 = 0',
    options: ['x = 2, x = 3', 'x = −2, x = −3', 'x = −1, x = −6', 'x = 1, x = 6'],
    answer: 1,
    explanation: 'Factorise: (x + 2)(x + 3) = 0. Therefore x = −2 or x = −3.',
  },
  // Economics — Foundation Plus
  {
    id: 'q-e-001', subject: 'economics', topic_id: 'e-a-01', pathway: 'foundation', type: 'level',
    question: 'What happens to quantity demanded when price increases, assuming normal demand?',
    options: ['It increases', 'It stays the same', 'It decreases', 'It becomes zero'],
    answer: 2,
    explanation: 'The law of demand: as price rises, quantity demanded falls — an inverse relationship.',
  },
  {
    id: 'q-e-002', subject: 'economics', topic_id: 'e-b-02', pathway: 'foundation', type: 'level',
    question: 'What is opportunity cost?',
    options: [
      'The total cost of a good',
      'The value of the next best alternative foregone',
      'The price paid for a resource',
      'A government tax on production',
    ],
    answer: 1,
    explanation: 'Opportunity cost = the value of the best alternative you give up when making a choice.',
  },
  {
    id: 'q-e-003', subject: 'economics', topic_id: 'e-a-03', pathway: 'foundation_plus', type: 'level',
    question: 'PED = −2.5. A firm raises its price by 10%. By how much does quantity demanded change?',
    options: ['Falls by 2.5%', 'Falls by 25%', 'Rises by 25%', 'Falls by 10%'],
    answer: 1,
    explanation: '% change in Qd = PED × % change in P = −2.5 × 10% = −25%. Demand falls by 25%.',
  },
  {
    id: 'q-e-004', subject: 'economics', topic_id: 'e-g-02', pathway: 'foundation_plus', type: 'weak',
    question: 'A government cuts income tax. This is an example of:',
    options: ['Monetary policy', 'Contractionary fiscal policy', 'Expansionary fiscal policy', 'Supply-side policy'],
    answer: 2,
    explanation: 'Cutting income tax increases disposable income — this stimulates demand, making it expansionary fiscal policy.',
  },
  {
    id: 'q-e-005', subject: 'economics', topic_id: 'e-i-03', pathway: 'higher', type: 'stretch',
    question: 'If the UK pound depreciates against the dollar, what happens to UK exports?',
    options: [
      'They become more expensive for foreign buyers',
      'They become cheaper for foreign buyers, so demand rises',
      'They become cheaper for UK consumers',
      'They are unaffected by exchange rates',
    ],
    answer: 1,
    explanation: 'A weaker pound means foreign buyers need less of their currency to buy UK goods — exports become more price competitive.',
  },
];
