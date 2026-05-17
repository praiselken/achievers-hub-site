export interface CardData {
  id: number;
  topic: string;
  command: string;
  rule: string;
  steps: string[];
  workedExample: string[];
  finalAnswer: string;
  realWorld: string;
  tip: string;
}

export const STUDY_CARDS: CardData[] = [
  {
    id: 1,
    topic: 'Addition: column method',
    command: 'Calculate',
    rule: 'To add whole numbers, line up the digits by place value, add from right to left, and carry when a column totals 10 or more.',
    steps: [
      'Line up the ones, tens and hundreds.',
      'Add the ones first. If the total is 10 or more, write the ones digit and carry the tens digit.',
      'Move left one column at a time.',
      'Bring down any final carry.',
    ],
    workedExample: [
      'Calculate 378 + 256.',
      'Ones: 8 + 6 = 14 → write 4, carry 1',
      'Tens: 7 + 5 + 1 = 13 → write 3, carry 1',
      'Hundreds: 3 + 2 + 1 = 6',
    ],
    finalAnswer: '634',
    realWorld: 'Adding prices, scores, journey distances and totals on a receipt.',
    tip: 'Estimate first: 378 + 256 ≈ 400 + 300 = 700, so 634 is sensible.',
  },
  {
    id: 2,
    topic: 'Decimals: addition',
    command: 'Calculate',
    rule: 'To add decimals, line up the decimal points and add zeroes so each number has the same number of decimal places.',
    steps: [
      'Put the decimal points directly underneath each other.',
      'Add zeroes as placeholders if needed.',
      'Add from right to left, just like column addition.',
      'Bring the decimal point straight down into the answer.',
    ],
    workedExample: [
      'Calculate 12.7 + 3.45.',
      'Rewrite 12.7 as 12.70',
      'Hundredths: 0 + 5 = 5',
      'Tenths: 7 + 4 = 11 → write 1, carry 1',
      'Ones/tens: 12 + 3 + 1 = 16',
    ],
    finalAnswer: '16.15',
    realWorld: 'Adding prices, money balances, measurements and race times.',
    tip: 'The decimal point does not move — it comes straight down into the answer.',
  },
  {
    id: 3,
    topic: 'Decimals: subtraction',
    command: 'Calculate',
    rule: 'To subtract decimals, line up the decimal points, add zeroes if needed, then subtract from right to left.',
    steps: [
      'Line up the decimal points.',
      'Add zeroes so both numbers have the same decimal places.',
      'Subtract from right to left.',
      'Exchange from the next column if the top digit is too small.',
    ],
    workedExample: [
      'Calculate 8.4 − 2.76.',
      'Rewrite 8.4 as 8.40',
      'Hundredths: 0 − 6 → exchange → 10 − 6 = 4',
      'Tenths: 3 − 7 → exchange → 13 − 7 = 6',
      'Ones: 7 − 2 = 5',
    ],
    finalAnswer: '5.64',
    realWorld: 'Calculating change, comparing measurements and finding differences in times.',
    tip: 'Add zeroes before you start — 8.4 is the same value as 8.40.',
  },
  {
    id: 4,
    topic: 'Decimals: division by decimals',
    command: 'Calculate',
    rule: 'To divide by a decimal, multiply both numbers by 10, 100 or 1000 until the divisor becomes a whole number.',
    steps: [
      'Look at the number after the ÷ sign.',
      'Move its decimal point until it becomes a whole number.',
      'Move the other decimal point the same number of places.',
      'Divide using the new calculation.',
    ],
    workedExample: [
      'Calculate 4.68 ÷ 0.6.',
      'Make 0.6 into 6 (× 10)',
      'Also: 4.68 × 10 = 46.8',
      'Now calculate 46.8 ÷ 6 = 7.8',
    ],
    finalAnswer: '7.8',
    realWorld: 'Unit prices, recipes, sharing decimal measurements and scaling quantities.',
    tip: 'Whatever you do to the divisor, do the same to the dividend.',
  },
  {
    id: 5,
    topic: 'Division: short division',
    command: 'Calculate',
    rule: 'To use short division, divide each digit from left to right and carry any remainder to the next digit.',
    steps: [
      'Put the number being divided inside the bus stop.',
      'Divide the first digit.',
      'Carry any remainder to the next digit.',
      'Continue until every digit has been divided.',
    ],
    workedExample: [
      'Calculate 852 ÷ 4.',
      '8 ÷ 4 = 2',
      '5 ÷ 4 = 1 remainder 1 → carry the 1',
      '12 ÷ 4 = 3',
    ],
    finalAnswer: '213',
    realWorld: 'Sharing quantities, splitting costs and working out equal groups quickly.',
    tip: 'Check by multiplying: 213 × 4 = 852.',
  },
  {
    id: 6,
    topic: 'Decimals: multiplying',
    command: 'Calculate',
    rule: 'To multiply decimals, ignore the decimal points first, multiply as whole numbers, then place the decimal point using the total decimal places.',
    steps: [
      'Count the total decimal places in the question.',
      'Ignore the decimal points and multiply the whole numbers.',
      'Put the decimal point back using the same total number of decimal places.',
      'Estimate to check the answer is sensible.',
    ],
    workedExample: [
      'Calculate 2.4 × 3.6.',
      '2 decimal places in total',
      '24 × 36 = 864',
      'Put back 2 decimal places',
    ],
    finalAnswer: '8.64',
    realWorld: 'Finding costs, areas, recipes, exchange rates and repeated measurements.',
    tip: 'Estimate: 2.4 × 3.6 ≈ 2 × 4 = 8, so 8.64 is sensible.',
  },
];
