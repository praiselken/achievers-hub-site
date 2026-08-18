// Static content shown when the app is running in demo mode (see demoMode.ts).
// Lets anyone preview the student dashboard without a real Supabase account.

export type DemoStatus = 'not_started' | 'in_progress' | 'covered';

export const DEMO_PROFILE = {
  display_name: 'Alex',
  avatar: '🚀',
  subjects: ['maths', 'economics'] as const,
  exam_board: 'AQA',
  year_group: 10,
};

export const DEMO_STATS = { xpTotal: 1200, level: 5 };

export const DEMO_STREAK = { current_streak: 12, longest_streak: 18 };

export const DEMO_DAILY5_COUNT = 27;

export interface DemoTopic {
  id: string;
  subject: 'maths' | 'economics';
  area: string;
  name: string;
  description: string;
  key_points: string[];
  exam_tip: string;
  practice_q: string;
  practice_a: string;
  video_url: string | null;
  command: string;
  card_format: 'worked_example' | 'rule' | 'definition';
  pathway_min: string;
  exam_board: string | null;
  status: DemoStatus;
  score_avg: number;
  attempts: number;
}

export const DEMO_TOPICS: DemoTopic[] = [
  // ── Maths ──────────────────────────────────────────────────────────
  {
    id: 'm1', subject: 'maths', area: 'Number', name: 'Fractions, Decimals & Percentages',
    description: 'Convert fluently between fractions, decimals and percentages, and apply percentage change to real-world problems.',
    key_points: [
      'To convert a fraction to a decimal, divide the numerator by the denominator.',
      'Percentage change = (change ÷ original) × 100.',
      'Reverse percentage problems: work backwards from the final amount.',
    ],
    exam_tip: 'Always check if a question wants percentage increase/decrease or just percentage of — read carefully.',
    practice_q: 'A jacket costs £60 after a 20% discount. What was the original price?',
    practice_a: '£75 — divide £60 by 0.8 (100% − 20%) to find the original price.',
    video_url: null, command: 'Calculate', card_format: 'worked_example', pathway_min: '4', exam_board: null,
    status: 'covered', score_avg: 88, attempts: 5,
  },
  {
    id: 'm2', subject: 'maths', area: 'Number', name: 'Standard Form',
    description: 'Write very large or very small numbers using standard form, a × 10ⁿ.',
    key_points: [
      'a must be between 1 and 10.',
      'Positive powers of 10 for large numbers, negative for small numbers.',
      'Line up powers of 10 before adding or subtracting.',
    ],
    exam_tip: "Don't forget to convert your answer back to standard form after calculating.",
    practice_q: 'Write 0.00047 in standard form.',
    practice_a: '4.7 × 10⁻⁴',
    video_url: null, command: 'Write', card_format: 'rule', pathway_min: '3', exam_board: null,
    status: 'in_progress', score_avg: 64, attempts: 3,
  },
  {
    id: 'm3', subject: 'maths', area: 'Algebra', name: 'Solving Linear Equations',
    description: 'Solve equations with an unknown on one or both sides, including those with brackets and fractions.',
    key_points: [
      'Do the same operation to both sides to keep the equation balanced.',
      'Expand brackets first, then collect like terms.',
      'Check your answer by substituting it back in.',
    ],
    exam_tip: "Show every step — method marks are awarded even if your final answer is wrong.",
    practice_q: 'Solve: 3(x + 2) = 5x − 4',
    practice_a: 'x = 5',
    video_url: null, command: 'Solve', card_format: 'worked_example', pathway_min: '4', exam_board: null,
    status: 'covered', score_avg: 91, attempts: 6,
  },
  {
    id: 'm4', subject: 'maths', area: 'Algebra', name: 'Quadratic Equations',
    description: 'Solve quadratic equations by factorising, completing the square, or using the formula.',
    key_points: [
      'Rearrange to ax² + bx + c = 0 first.',
      'Try factorising before using the quadratic formula.',
      'The formula: x = (−b ± √(b²−4ac)) / 2a',
    ],
    exam_tip: "Learn the quadratic formula by heart — it isn't always given.",
    practice_q: 'Solve: x² − 5x + 6 = 0',
    practice_a: 'x = 2 or x = 3',
    video_url: null, command: 'Solve', card_format: 'worked_example', pathway_min: '6', exam_board: null,
    status: 'in_progress', score_avg: 58, attempts: 2,
  },
  {
    id: 'm5', subject: 'maths', area: 'Ratio, proportion and rates of change', name: 'Ratio & Proportion',
    description: 'Share amounts in a given ratio and solve direct/inverse proportion problems.',
    key_points: [
      'Add the parts of the ratio to find the total number of shares.',
      'Direct proportion: y = kx.',
      'Inverse proportion: y = k/x.',
    ],
    exam_tip: 'Write the ratio in its simplest form before sharing an amount.',
    practice_q: 'Share £360 in the ratio 4:5.',
    practice_a: '£160 : £200',
    video_url: null, command: 'Share', card_format: 'worked_example', pathway_min: '4', exam_board: null,
    status: 'covered', score_avg: 85, attempts: 4,
  },
  {
    id: 'm6', subject: 'maths', area: 'Ratio, proportion and rates of change', name: 'Compound Interest',
    description: 'Calculate compound interest and growth/decay using multipliers raised to a power.',
    key_points: [
      'Amount = P × (1 + r/100)ⁿ',
      'n is the number of time periods.',
      'Depreciation uses (1 − r/100)ⁿ instead.',
    ],
    exam_tip: "Use the multiplier method — it's faster than calculating interest year by year.",
    practice_q: '£2000 is invested at 3% compound interest for 4 years. Find the total.',
    practice_a: '£2251.02 (2000 × 1.03⁴)',
    video_url: null, command: 'Calculate', card_format: 'rule', pathway_min: '5', exam_board: null,
    status: 'not_started', score_avg: 0, attempts: 0,
  },
  {
    id: 'm7', subject: 'maths', area: 'Geometry and measures', name: "Pythagoras' Theorem",
    description: 'Find missing sides in right-angled triangles using a² + b² = c².',
    key_points: [
      'c is always the hypotenuse — the longest side, opposite the right angle.',
      'To find a shorter side, rearrange to a² = c² − b².',
      'Always sketch the triangle first.',
    ],
    exam_tip: 'Check your answer is sensible — the hypotenuse must be the longest side.',
    practice_q: 'A right triangle has shorter sides 6cm and 8cm. Find the hypotenuse.',
    practice_a: '10cm (√(6²+8²) = √100)',
    video_url: null, command: 'Calculate', card_format: 'worked_example', pathway_min: '4', exam_board: null,
    status: 'covered', score_avg: 93, attempts: 5,
  },
  {
    id: 'm8', subject: 'maths', area: 'Geometry and measures', name: 'Circle Theorems',
    description: 'Apply angle facts and theorems relating to circles, chords, tangents and arcs.',
    key_points: [
      'The angle in a semicircle is always 90°.',
      'A tangent meets a radius at 90°.',
      'Angles in the same segment are equal.',
    ],
    exam_tip: "Name the theorem you're using — reasoning marks matter.",
    practice_q: 'A tangent touches a circle at point A. What is the angle between the tangent and the radius at A?',
    practice_a: '90°',
    video_url: null, command: 'State', card_format: 'rule', pathway_min: '5', exam_board: null,
    status: 'covered', score_avg: 76, attempts: 3,
  },
  {
    id: 'm9', subject: 'maths', area: 'Probability', name: 'Probability Trees',
    description: 'Use tree diagrams to calculate probabilities of combined and conditional events.',
    key_points: [
      'Multiply along the branches.',
      "Add between separate branches for 'or'.",
      'Probabilities on each set of branches sum to 1.',
    ],
    exam_tip: 'Label every branch clearly with its probability before multiplying.',
    practice_q: 'A bag has 3 red and 2 blue balls. Find P(both red) when picking twice without replacement.',
    practice_a: '3/10 (3/5 × 2/4)',
    video_url: null, command: 'Calculate', card_format: 'worked_example', pathway_min: '5', exam_board: null,
    status: 'covered', score_avg: 82, attempts: 4,
  },
  {
    id: 'm10', subject: 'maths', area: 'Probability', name: 'Venn Diagrams',
    description: 'Represent sets and calculate probabilities using Venn diagrams and set notation.',
    key_points: [
      'The overlap is the intersection, written A ∩ B.',
      "'Or' means union, written A ∪ B.",
      "P(A') means 'not A'.",
    ],
    exam_tip: 'Fill in the overlap region first, then work outwards.',
    practice_q: 'In a class of 30, 18 like Maths, 15 like Science, 8 like both. How many like neither?',
    practice_a: '5 students',
    video_url: null, command: 'Find', card_format: 'rule', pathway_min: '4', exam_board: null,
    status: 'in_progress', score_avg: 70, attempts: 2,
  },
  {
    id: 'm11', subject: 'maths', area: 'Statistics', name: 'Averages from Grouped Data',
    description: 'Estimate the mean, and find the median and modal class from grouped frequency tables.',
    key_points: [
      'Use the midpoint of each class to estimate the mean.',
      'The modal class has the highest frequency.',
      'The median class is found using cumulative frequency.',
    ],
    exam_tip: 'Remember: with grouped data, you can only estimate the mean, not calculate it exactly.',
    practice_q: 'Estimate the mean height from a table with 10 people in class 150–160cm and 5 in 160–170cm.',
    practice_a: '≈156.7cm (using midpoints 155 and 165)',
    video_url: null, command: 'Estimate', card_format: 'worked_example', pathway_min: '5', exam_board: null,
    status: 'covered', score_avg: 79, attempts: 3,
  },
  {
    id: 'm12', subject: 'maths', area: 'Statistics', name: 'Cumulative Frequency & Box Plots',
    description: 'Draw and interpret cumulative frequency graphs and box plots to compare distributions.',
    key_points: [
      'Plot cumulative frequency against the upper class boundary.',
      'The median is the middle value on the curve.',
      'Box plots show the minimum, Q1, median, Q3 and maximum.',
    ],
    exam_tip: 'When comparing two box plots, always compare both the median and the spread (IQR).',
    practice_q: 'What does a smaller interquartile range tell you about a data set?',
    practice_a: 'The middle 50% of the data is more consistent / less spread out.',
    video_url: null, command: 'Interpret', card_format: 'rule', pathway_min: '5', exam_board: null,
    status: 'not_started', score_avg: 0, attempts: 0,
  },

  // ── Economics ──────────────────────────────────────────────────────
  {
    id: 'e1', subject: 'economics', area: 'Microeconomics', name: 'Supply and Demand',
    description: 'Understand how price is determined by the interaction of supply and demand curves.',
    key_points: [
      'A shift in demand moves the whole curve; a movement is caused by a price change.',
      'Equilibrium is where supply equals demand.',
      'Key shifters: income, tastes, price of substitutes/complements.',
    ],
    exam_tip: 'Always specify whether you mean a shift OR a movement along the curve.',
    practice_q: 'What happens to the equilibrium price if demand increases and supply stays the same?',
    practice_a: 'The equilibrium price rises (and quantity increases).',
    video_url: null, command: 'Explain', card_format: 'rule', pathway_min: '4', exam_board: null,
    status: 'covered', score_avg: 87, attempts: 5,
  },
  {
    id: 'e2', subject: 'economics', area: 'Microeconomics', name: 'Elasticity of Demand',
    description: 'Calculate and interpret price elasticity of demand (PED) and what it means for revenue.',
    key_points: [
      'PED = % change in quantity demanded ÷ % change in price.',
      'PED > 1 = elastic; PED < 1 = inelastic.',
      'If demand is inelastic, raising price increases total revenue.',
    ],
    exam_tip: 'Ignore the negative sign in PED — focus on the size of the number.',
    practice_q: 'Price rises 10% and demand falls 20%. Is demand elastic or inelastic?',
    practice_a: 'Elastic (PED = 2, which is greater than 1).',
    video_url: null, command: 'Calculate', card_format: 'worked_example', pathway_min: '5', exam_board: null,
    status: 'in_progress', score_avg: 61, attempts: 2,
  },
  {
    id: 'e3', subject: 'economics', area: 'Macroeconomics', name: 'Inflation & Interest Rates',
    description: 'Explain the causes of inflation and how the Bank of England uses interest rates to control it.',
    key_points: [
      'Demand-pull inflation: too much spending chasing too few goods.',
      'Cost-push inflation: rising costs of production.',
      'Higher interest rates encourage saving and discourage borrowing, reducing spending.',
    ],
    exam_tip: 'Link your answer back to the effect on consumer/business spending — examiners reward chains of reasoning.',
    practice_q: 'How might raising interest rates help control inflation?',
    practice_a: 'It makes borrowing more expensive and saving more attractive, reducing spending and demand-pull inflation.',
    video_url: null, command: 'Explain', card_format: 'rule', pathway_min: '5', exam_board: null,
    status: 'covered', score_avg: 84, attempts: 4,
  },
  {
    id: 'e4', subject: 'economics', area: 'Macroeconomics', name: 'Unemployment',
    description: 'Identify the types and causes of unemployment and government policies to reduce it.',
    key_points: [
      'Cyclical unemployment is caused by a fall in demand during a recession.',
      'Structural unemployment happens when industries decline.',
      'Frictional unemployment is short-term, between jobs.',
    ],
    exam_tip: 'Match the type of unemployment to the correct cause — this is a common exam trap.',
    practice_q: 'What type of unemployment occurs when coal mining jobs disappear due to industry decline?',
    practice_a: 'Structural unemployment.',
    video_url: null, command: 'Identify', card_format: 'rule', pathway_min: '4', exam_board: null,
    status: 'not_started', score_avg: 0, attempts: 0,
  },
  {
    id: 'e5', subject: 'economics', area: 'International economics', name: 'Exchange Rates',
    description: 'Explain how exchange rates are determined and their impact on imports and exports.',
    key_points: [
      'A stronger pound makes exports more expensive and imports cheaper.',
      'A weaker pound makes exports cheaper and imports more expensive.',
      'Exchange rates are affected by interest rates and demand for currency.',
    ],
    exam_tip: 'Use a clear chain: exchange rate change → price of exports/imports → demand → trade balance.',
    practice_q: 'If the pound weakens against the dollar, what happens to UK exports to the US?',
    practice_a: 'They become cheaper for US buyers, so demand for UK exports is likely to rise.',
    video_url: null, command: 'Explain', card_format: 'rule', pathway_min: '5', exam_board: null,
    status: 'covered', score_avg: 80, attempts: 3,
  },
  {
    id: 'e6', subject: 'economics', area: 'International economics', name: 'Trade & Globalisation',
    description: 'Understand the benefits and costs of international trade and globalisation for the UK economy.',
    key_points: [
      'Comparative advantage: countries specialise in what they produce most efficiently.',
      'Benefits include lower prices and greater choice for consumers.',
      "Costs include job losses in uncompetitive domestic industries.",
    ],
    exam_tip: 'Always weigh up both a benefit and a drawback for evaluation marks.',
    practice_q: 'Give one benefit and one drawback of increased international trade for the UK.',
    practice_a: "Benefit: lower prices/wider choice for consumers. Drawback: job losses in industries that can't compete.",
    video_url: null, command: 'Discuss', card_format: 'rule', pathway_min: '6', exam_board: null,
    status: 'in_progress', score_avg: 55, attempts: 2,
  },
  {
    id: 'e7', subject: 'economics', area: 'The national and global economy', name: 'Economic Growth & the Business Cycle',
    description: 'Describe the stages of the business cycle and how economic growth is measured.',
    key_points: [
      'The business cycle has four stages: boom, downturn, recession, recovery.',
      'Growth is measured by change in real GDP.',
      'A recession is two consecutive quarters of negative growth.',
    ],
    exam_tip: 'Sketch the business cycle diagram from memory — labelling it correctly picks up easy marks.',
    practice_q: 'What defines a recession?',
    practice_a: 'Two consecutive quarters of negative GDP growth.',
    video_url: null, command: 'Define', card_format: 'rule', pathway_min: '4', exam_board: null,
    status: 'covered', score_avg: 89, attempts: 4,
  },
  {
    id: 'e8', subject: 'economics', area: 'The national and global economy', name: 'Government Fiscal Policy',
    description: 'Explain how government spending and taxation are used to manage the economy.',
    key_points: [
      'Expansionary fiscal policy: increase spending/cut taxes to boost demand.',
      'Contractionary fiscal policy: cut spending/raise taxes to reduce demand.',
      'A budget deficit occurs when spending exceeds tax revenue.',
    ],
    exam_tip: 'State whether a policy is expansionary or contractionary before explaining its effect.',
    practice_q: 'Name one tool of expansionary fiscal policy.',
    practice_a: 'Cutting income tax (or increasing government spending).',
    video_url: null, command: 'Explain', card_format: 'rule', pathway_min: '5', exam_board: null,
    status: 'not_started', score_avg: 0, attempts: 0,
  },
];

export interface DemoPaper {
  id: string;
  subject: string;
  exam_board: string;
  year: number;
  paper_number: number;
  paper_type: string;
  title: string;
  pdf_url: string | null;
  mark_scheme_url: string | null;
  examiner_url: string | null;
}

export const DEMO_PAST_PAPERS: DemoPaper[] = [
  { id: 'p1', subject: 'maths', exam_board: 'AQA', year: 2024, paper_number: 1, paper_type: 'higher', title: 'AQA Maths Paper 1 (Non-Calculator)', pdf_url: null, mark_scheme_url: null, examiner_url: null },
  { id: 'p2', subject: 'maths', exam_board: 'AQA', year: 2024, paper_number: 2, paper_type: 'higher', title: 'AQA Maths Paper 2 (Calculator)', pdf_url: null, mark_scheme_url: null, examiner_url: null },
  { id: 'p3', subject: 'maths', exam_board: 'Edexcel', year: 2023, paper_number: 1, paper_type: 'foundation', title: 'Edexcel Maths Paper 1 (Non-Calculator)', pdf_url: null, mark_scheme_url: null, examiner_url: null },
  { id: 'p4', subject: 'economics', exam_board: 'AQA', year: 2024, paper_number: 1, paper_type: 'higher', title: 'AQA Economics Paper 1', pdf_url: null, mark_scheme_url: null, examiner_url: null },
  { id: 'p5', subject: 'economics', exam_board: 'AQA', year: 2023, paper_number: 2, paper_type: 'higher', title: 'AQA Economics Paper 2', pdf_url: null, mark_scheme_url: null, examiner_url: null },
  { id: 'p6', subject: 'economics', exam_board: 'OCR', year: 2022, paper_number: 1, paper_type: 'higher', title: 'OCR Economics Paper 1', pdf_url: null, mark_scheme_url: null, examiner_url: null },
];

export interface DemoPaperLog {
  paper_id: string;
  score: number;
  max_score: number;
  logged_at: string;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

export const DEMO_PAPER_LOGS: Record<string, DemoPaperLog> = {
  p1: { paper_id: 'p1', score: 68, max_score: 80, logged_at: daysAgo(9) },
  p2: { paper_id: 'p2', score: 71, max_score: 80, logged_at: daysAgo(4) },
  p4: { paper_id: 'p4', score: 58, max_score: 75, logged_at: daysAgo(6) },
  p5: { paper_id: 'p5', score: 60, max_score: 75, logged_at: daysAgo(2) },
};

export interface DemoAchievement {
  slug: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  criteria_type: 'streak_days' | 'daily5_count' | 'topics_covered' | 'papers_logged' | 'paper_avg_score';
  criteria_value: number;
  subject: string | null;
  sort_order: number;
}

export const DEMO_ACHIEVEMENTS: DemoAchievement[] = [
  { slug: 'first_steps', name: 'First Steps', description: 'Complete your first Daily 5', icon: '⚡', xp_reward: 10, criteria_type: 'daily5_count', criteria_value: 1, subject: null, sort_order: 1 },
  { slug: 'week_streak', name: 'Week Warrior', description: 'Reach a 7-day streak', icon: '🔥', xp_reward: 30, criteria_type: 'streak_days', criteria_value: 7, subject: null, sort_order: 2 },
  { slug: 'streak_master', name: 'Streak Master', description: 'Reach a 30-day streak', icon: '🏆', xp_reward: 100, criteria_type: 'streak_days', criteria_value: 30, subject: null, sort_order: 3 },
  { slug: 'topic_explorer', name: 'Topic Explorer', description: 'Cover 5 topics', icon: '🗺️', xp_reward: 25, criteria_type: 'topics_covered', criteria_value: 5, subject: null, sort_order: 4 },
  { slug: 'topic_master', name: 'Topic Master', description: 'Cover 15 topics', icon: '📚', xp_reward: 60, criteria_type: 'topics_covered', criteria_value: 15, subject: null, sort_order: 5 },
  { slug: 'paper_starter', name: 'Paper Pro', description: 'Log 3 past papers', icon: '📄', xp_reward: 20, criteria_type: 'papers_logged', criteria_value: 3, subject: null, sort_order: 6 },
  { slug: 'high_scorer', name: 'High Scorer', description: 'Average 80%+ across logged papers', icon: '🌟', xp_reward: 50, criteria_type: 'paper_avg_score', criteria_value: 80, subject: null, sort_order: 7 },
  { slug: 'dedicated', name: 'Dedicated', description: 'Complete 20 Daily 5 sessions', icon: '💎', xp_reward: 40, criteria_type: 'daily5_count', criteria_value: 20, subject: null, sort_order: 8 },
];

export interface DemoQuestion {
  id: string;
  question_number: number;
  question: string;
  answer: string;
  marks: number | null;
  topic_title: string | null;
  difficulty: string | null;
  skill_type: string | null;
  solution_steps: string | null;
  hints: string | null;
}

export const DEMO_DAILY_QUESTIONS: Record<'maths' | 'economics', DemoQuestion[]> = {
  maths: [
    {
      id: 'dq-m1', question_number: 1, question: 'Simplify: 3(2x − 5) + 4x', answer: '10x − 15', marks: 2,
      topic_title: 'Solving Linear Equations', difficulty: 'foundation', skill_type: 'fluency',
      hints: 'Expand the bracket first, then collect like terms.',
      solution_steps: 'Step 1: Expand 3(2x−5) = 6x−15\nStep 2: Add 4x: 6x−15+4x\nStep 3: Combine like terms: 10x−15',
    },
    {
      id: 'dq-m2', question_number: 2, question: 'Work out 35% of 240.', answer: '84', marks: 2,
      topic_title: 'Fractions, Decimals & Percentages', difficulty: 'foundation', skill_type: 'fluency',
      hints: 'Find 10% first, then scale up.',
      solution_steps: 'Step 1: 10% of 240 = 24\nStep 2: 35% = (3 × 10%) + 5% = 72 + 12 = 84',
    },
    {
      id: 'dq-m3', question_number: 3, question: 'Find the hypotenuse of a right triangle with shorter sides 9cm and 12cm.', answer: '15cm', marks: 3,
      topic_title: "Pythagoras' Theorem", difficulty: 'foundation', skill_type: 'application',
      hints: 'Use a² + b² = c².',
      solution_steps: 'Step 1: 9² + 12² = 81 + 144 = 225\nStep 2: √225 = 15cm',
    },
    {
      id: 'dq-m4', question_number: 4, question: 'Solve: x² − x − 12 = 0', answer: 'x = 4 or x = −3', marks: 3,
      topic_title: 'Quadratic Equations', difficulty: 'higher', skill_type: 'problem-solving',
      hints: 'Find two numbers that multiply to −12 and add to −1.',
      solution_steps: 'Step 1: Factorise: (x−4)(x+3) = 0\nStep 2: x = 4 or x = −3',
    },
    {
      id: 'dq-m5', question_number: 5, question: 'A bag contains 5 red and 3 blue counters. Two are picked without replacement. Find P(both blue).', answer: '3/28', marks: 3,
      topic_title: 'Probability Trees', difficulty: 'higher', skill_type: 'problem-solving',
      hints: 'Multiply the two probabilities along the branch.',
      solution_steps: 'Step 1: P(first blue) = 3/8\nStep 2: P(second blue) = 2/7\nStep 3: 3/8 × 2/7 = 6/56 = 3/28',
    },
  ],
  economics: [
    {
      id: 'dq-e1', question_number: 1, question: "Define 'opportunity cost'.", answer: 'The value of the next best alternative given up when a choice is made.', marks: 2,
      topic_title: 'Supply and Demand', difficulty: 'foundation', skill_type: 'knowledge',
      hints: "Think about what's given up, not what's gained.", solution_steps: null,
    },
    {
      id: 'dq-e2', question_number: 2, question: 'Demand for a good falls from 200 to 150 units when price rises from £4 to £5. Calculate the PED.', answer: 'PED = −1 (unit elastic)', marks: 3,
      topic_title: 'Elasticity of Demand', difficulty: 'higher', skill_type: 'application',
      hints: '%ΔQd ÷ %ΔP.',
      solution_steps: 'Step 1: %ΔQd = −50/200 = −25%\nStep 2: %ΔP = 1/4 = +25%\nStep 3: PED = −25% ÷ 25% = −1',
    },
    {
      id: 'dq-e3', question_number: 3, question: 'Explain one cause of demand-pull inflation.', answer: "Consumer spending rises faster than the economy's ability to produce goods, pulling prices up.", marks: 4,
      topic_title: 'Inflation & Interest Rates', difficulty: 'higher', skill_type: 'explanation',
      hints: 'Link spending to demand exceeding supply.', solution_steps: null,
    },
    {
      id: 'dq-e4', question_number: 4, question: 'State one policy the Bank of England could use to reduce inflation.', answer: 'Raise interest rates to reduce borrowing and spending.', marks: 2,
      topic_title: 'Inflation & Interest Rates', difficulty: 'foundation', skill_type: 'knowledge',
      hints: 'Think about the cost of borrowing.', solution_steps: null,
    },
    {
      id: 'dq-e5', question_number: 5, question: 'Evaluate whether globalisation benefits the UK economy.',
      answer: 'Globalisation can lower prices and widen consumer choice through trade, but may cause job losses in uncompetitive industries — the overall impact depends on how well the economy adapts.', marks: 6,
      topic_title: 'Trade & Globalisation', difficulty: 'higher', skill_type: 'evaluation',
      hints: 'Give a benefit, a drawback, and a judgement.', solution_steps: null,
    },
  ],
};

// ── Derived metrics — mirrors the logic in lib/xp.ts checkAndAwardAchievements ──

export function getDemoMetrics() {
  const coveredTopics = DEMO_TOPICS.filter(t => t.status === 'covered');
  const attemptedTopics = DEMO_TOPICS.filter(t => t.attempts > 0);
  const avgMastery = attemptedTopics.length
    ? Math.round(attemptedTopics.reduce((a, t) => a + t.score_avg, 0) / attemptedTopics.length)
    : null;

  const logs = Object.values(DEMO_PAPER_LOGS);
  const papersLogged = logs.length;
  const paperAvgScore = papersLogged
    ? Math.round(logs.reduce((a, l) => a + (l.score / l.max_score) * 100, 0) / papersLogged)
    : 0;

  const metrics: Record<string, number> = {
    streak_days: DEMO_STREAK.current_streak,
    daily5_count: DEMO_DAILY5_COUNT,
    topics_covered: coveredTopics.length,
    papers_logged: papersLogged,
    paper_avg_score: paperAvgScore,
  };

  const unlocked: Record<string, string> = {};
  for (const a of DEMO_ACHIEVEMENTS) {
    if (a.criteria_type === 'paper_avg_score' && papersLogged === 0) continue;
    const value = metrics[a.criteria_type];
    if (value >= a.criteria_value) unlocked[a.slug] = daysAgo(1);
  }

  return {
    streakDays: DEMO_STREAK.current_streak,
    longestStreak: DEMO_STREAK.longest_streak,
    avgMastery,
    papersLogged,
    paperAvgScore,
    topicsCovered: coveredTopics.length,
    unlocked,
    unlockedCount: Object.keys(unlocked).length,
  };
}

export function getDemoSubjectProgress(subjectSlug: string) {
  const topics = DEMO_TOPICS.filter(t => t.subject === subjectSlug);
  const covered = topics.filter(t => t.status === 'covered');
  const lastPracticed = topics.reduce<string | null>((latest, t) => {
    if (t.attempts === 0) return latest;
    return latest;
  }, topics.some(t => t.attempts > 0) ? daysAgo(1) : null);
  return {
    totalTopics: topics.length,
    coveredTopics: covered.length,
    pct: topics.length ? Math.round((covered.length / topics.length) * 100) : 0,
    lastPracticed,
  };
}
