export type Subject = 'maths' | 'economics';
export type Pathway = 'numeracy' | 'foundation' | 'foundation_plus' | 'higher' | 'higher_plus';

export interface SpecTopic {
  id: string;
  area: string;
  name: string;
  pathway_min: Pathway;
  description?: string;
}

export const PATHWAYS: { key: Pathway; label: string; grades: string; color: string; bg: string }[] = [
  { key: 'numeracy',       label: 'Numeracy',       grades: '1–3', color: '#C4A8D0', bg: '#F5EFF8' },
  { key: 'foundation',     label: 'Foundation',     grades: '3–5', color: '#9970A6', bg: '#EDE0F4' },
  { key: 'foundation_plus',label: 'Foundation Plus',grades: '4–6', color: '#BA7517', bg: '#FAEEDA' },
  { key: 'higher',         label: 'Higher',         grades: '6–7', color: '#639922', bg: '#EAF3DE' },
  { key: 'higher_plus',    label: 'Higher Plus',    grades: '8–9', color: '#0F6E56', bg: '#E1F5EE' },
];

export const MATHS_TOPICS: SpecTopic[] = [
  // Number
  { id: 'm-n-01', area: 'Number', name: 'Place Value & Rounding',        pathway_min: 'numeracy' },
  { id: 'm-n-02', area: 'Number', name: 'Fractions',                      pathway_min: 'numeracy' },
  { id: 'm-n-03', area: 'Number', name: 'Decimals & Percentages',         pathway_min: 'numeracy' },
  { id: 'm-n-04', area: 'Number', name: 'Ratio & Proportion',             pathway_min: 'foundation' },
  { id: 'm-n-05', area: 'Number', name: 'Powers & Roots',                 pathway_min: 'foundation' },
  { id: 'm-n-06', area: 'Number', name: 'Standard Form',                  pathway_min: 'higher' },
  { id: 'm-n-07', area: 'Number', name: 'Surds',                          pathway_min: 'higher_plus' },
  // Algebra
  { id: 'm-a-01', area: 'Algebra', name: 'Expressions & Simplifying',     pathway_min: 'numeracy' },
  { id: 'm-a-02', area: 'Algebra', name: 'Expanding & Factorising',       pathway_min: 'foundation' },
  { id: 'm-a-03', area: 'Algebra', name: 'Linear Equations',              pathway_min: 'foundation' },
  { id: 'm-a-04', area: 'Algebra', name: 'Quadratic Equations',           pathway_min: 'foundation_plus' },
  { id: 'm-a-05', area: 'Algebra', name: 'Simultaneous Equations',        pathway_min: 'foundation_plus' },
  { id: 'm-a-06', area: 'Algebra', name: 'Inequalities',                  pathway_min: 'foundation_plus' },
  { id: 'm-a-07', area: 'Algebra', name: 'Sequences & nth Term',          pathway_min: 'foundation' },
  { id: 'm-a-08', area: 'Algebra', name: 'Linear Graphs',                 pathway_min: 'foundation' },
  { id: 'm-a-09', area: 'Algebra', name: 'Quadratic Graphs',              pathway_min: 'higher' },
  { id: 'm-a-10', area: 'Algebra', name: 'Functions',                     pathway_min: 'higher_plus' },
  // Ratio, Proportion & Rates of Change
  { id: 'm-r-01', area: 'Ratio & Rates', name: 'Percentage Change',       pathway_min: 'foundation' },
  { id: 'm-r-02', area: 'Ratio & Rates', name: 'Speed, Distance, Time',   pathway_min: 'foundation' },
  { id: 'm-r-03', area: 'Ratio & Rates', name: 'Direct & Inverse Proportion', pathway_min: 'higher' },
  { id: 'm-r-04', area: 'Ratio & Rates', name: 'Growth & Decay',          pathway_min: 'higher' },
  // Geometry & Measures
  { id: 'm-g-01', area: 'Geometry', name: 'Angles & Parallel Lines',      pathway_min: 'numeracy' },
  { id: 'm-g-02', area: 'Geometry', name: 'Properties of 2D Shapes',      pathway_min: 'numeracy' },
  { id: 'm-g-03', area: 'Geometry', name: 'Perimeter & Area',             pathway_min: 'numeracy' },
  { id: 'm-g-04', area: 'Geometry', name: 'Volume & Surface Area',        pathway_min: 'foundation' },
  { id: 'm-g-05', area: 'Geometry', name: 'Transformations',              pathway_min: 'foundation' },
  { id: 'm-g-06', area: 'Geometry', name: "Pythagoras' Theorem",          pathway_min: 'foundation_plus' },
  { id: 'm-g-07', area: 'Geometry', name: 'Trigonometry (SOH CAH TOA)',   pathway_min: 'foundation_plus' },
  { id: 'm-g-08', area: 'Geometry', name: 'Circle Theorems',              pathway_min: 'higher' },
  { id: 'm-g-09', area: 'Geometry', name: 'Vectors',                      pathway_min: 'higher_plus' },
  // Probability
  { id: 'm-p-01', area: 'Probability', name: 'Basic Probability',         pathway_min: 'numeracy' },
  { id: 'm-p-02', area: 'Probability', name: 'Combined Events',           pathway_min: 'foundation' },
  { id: 'm-p-03', area: 'Probability', name: 'Tree Diagrams',             pathway_min: 'foundation_plus' },
  { id: 'm-p-04', area: 'Probability', name: 'Conditional Probability',   pathway_min: 'higher' },
  // Statistics
  { id: 'm-s-01', area: 'Statistics', name: 'Averages & Spread',          pathway_min: 'numeracy' },
  { id: 'm-s-02', area: 'Statistics', name: 'Charts & Graphs',            pathway_min: 'numeracy' },
  { id: 'm-s-03', area: 'Statistics', name: 'Scatter Graphs & Correlation', pathway_min: 'foundation' },
  { id: 'm-s-04', area: 'Statistics', name: 'Cumulative Frequency',       pathway_min: 'higher' },
  { id: 'm-s-05', area: 'Statistics', name: 'Histograms',                 pathway_min: 'higher' },
];

export const ECONOMICS_TOPICS: SpecTopic[] = [
  // Basic Economic Problem
  { id: 'e-b-01', area: 'Basic Economic Problem', name: 'Scarcity & Choice',          pathway_min: 'numeracy' },
  { id: 'e-b-02', area: 'Basic Economic Problem', name: 'Opportunity Cost',            pathway_min: 'numeracy' },
  { id: 'e-b-03', area: 'Basic Economic Problem', name: 'Factors of Production',       pathway_min: 'foundation' },
  { id: 'e-b-04', area: 'Basic Economic Problem', name: 'Production Possibility Curves', pathway_min: 'foundation' },
  // Allocation of Resources
  { id: 'e-a-01', area: 'Allocation of Resources', name: 'Supply & Demand',            pathway_min: 'numeracy' },
  { id: 'e-a-02', area: 'Allocation of Resources', name: 'Price Mechanism',             pathway_min: 'foundation' },
  { id: 'e-a-03', area: 'Allocation of Resources', name: 'Price Elasticity of Demand', pathway_min: 'foundation_plus' },
  { id: 'e-a-04', area: 'Allocation of Resources', name: 'Price Elasticity of Supply', pathway_min: 'higher' },
  { id: 'e-a-05', area: 'Allocation of Resources', name: 'Market Failure',              pathway_min: 'foundation_plus' },
  { id: 'e-a-06', area: 'Allocation of Resources', name: 'Externalities',               pathway_min: 'higher' },
  { id: 'e-a-07', area: 'Allocation of Resources', name: 'Public Goods',                pathway_min: 'higher' },
  // Business Economics
  { id: 'e-c-01', area: 'Business Economics', name: 'Business Objectives',              pathway_min: 'numeracy' },
  { id: 'e-c-02', area: 'Business Economics', name: 'Revenue, Costs & Profit',          pathway_min: 'foundation' },
  { id: 'e-c-03', area: 'Business Economics', name: 'Economies of Scale',               pathway_min: 'foundation_plus' },
  { id: 'e-c-04', area: 'Business Economics', name: 'Competitive Markets',              pathway_min: 'foundation_plus' },
  { id: 'e-c-05', area: 'Business Economics', name: 'Monopoly',                         pathway_min: 'higher' },
  // Labour Market
  { id: 'e-l-01', area: 'Labour Market', name: 'Demand & Supply of Labour',             pathway_min: 'foundation' },
  { id: 'e-l-02', area: 'Labour Market', name: 'Wages & Wage Differentials',            pathway_min: 'foundation_plus' },
  { id: 'e-l-03', area: 'Labour Market', name: 'Trade Unions',                          pathway_min: 'higher' },
  { id: 'e-l-04', area: 'Labour Market', name: 'Minimum Wage',                          pathway_min: 'foundation' },
  // Role of Government
  { id: 'e-g-01', area: 'Role of Government', name: 'Government Objectives',            pathway_min: 'foundation' },
  { id: 'e-g-02', area: 'Role of Government', name: 'Fiscal Policy',                    pathway_min: 'foundation_plus' },
  { id: 'e-g-03', area: 'Role of Government', name: 'Monetary Policy',                  pathway_min: 'higher' },
  { id: 'e-g-04', area: 'Role of Government', name: 'Supply-Side Policies',             pathway_min: 'higher' },
  { id: 'e-g-05', area: 'Role of Government', name: 'Taxation & Government Spending',   pathway_min: 'foundation_plus' },
  { id: 'e-g-06', area: 'Role of Government', name: 'Redistribution of Income',         pathway_min: 'higher' },
  // International Economics
  { id: 'e-i-01', area: 'International Economics', name: 'Absolute & Comparative Advantage', pathway_min: 'higher' },
  { id: 'e-i-02', area: 'International Economics', name: 'Free Trade & Protectionism',  pathway_min: 'higher' },
  { id: 'e-i-03', area: 'International Economics', name: 'Exchange Rates',              pathway_min: 'higher' },
  { id: 'e-i-04', area: 'International Economics', name: 'Balance of Payments',         pathway_min: 'higher_plus' },
  { id: 'e-i-05', area: 'International Economics', name: 'Globalisation',               pathway_min: 'foundation_plus' },
  // Economic Indicators
  { id: 'e-d-01', area: 'Economic Indicators', name: 'GDP & Economic Growth',           pathway_min: 'foundation' },
  { id: 'e-d-02', area: 'Economic Indicators', name: 'Inflation',                       pathway_min: 'foundation' },
  { id: 'e-d-03', area: 'Economic Indicators', name: 'Unemployment',                    pathway_min: 'foundation' },
  { id: 'e-d-04', area: 'Economic Indicators', name: 'Economic Cycles',                 pathway_min: 'higher' },
];

export const TOPICS_BY_SUBJECT: Record<Subject, SpecTopic[]> = {
  maths: MATHS_TOPICS,
  economics: ECONOMICS_TOPICS,
};
