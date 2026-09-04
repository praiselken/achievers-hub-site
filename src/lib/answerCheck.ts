/**
 * Answer checking for Daily 5.
 *
 * Short answers are checked automatically, so a student is told whether they
 * are right and why rather than being shown the answer and asked to grade
 * themselves. Longer written answers — Economics extended responses — cannot
 * be judged by string comparison, so they fall back to marking against the
 * model answer. That gap is what the mark scheme is for, and it closes when
 * AI marking is switched on.
 */

/** Above this many words, a model answer is prose rather than a short answer. */
const MAX_AUTO_WORDS = 8;

export function isAutoCheckable(model: string | null | undefined): boolean {
  if (!model || !model.trim()) return false;
  return model.trim().split(/\s+/).length <= MAX_AUTO_WORDS;
}

/**
 * Characters that look identical on screen but are not the same codepoint.
 * Mark schemes are typed in Word and carry a real minus sign, curly quotes and
 * proper multiplication signs; students type from a keyboard and get hyphens
 * and apostrophes. Without this, "10x - 15" fails against "10x − 15" and a
 * correct answer is marked wrong.
 */
const LOOKALIKES: Record<string, string> = {
  '−': '-', // minus sign
  '–': '-', // en dash
  '—': '-', // em dash
  '×': '*', // multiplication sign
  '÷': '/', // division sign
  '‘': "'",
  '’': "'",
  '“': '"',
  '”': '"',
};

function foldLookalikes(value: string): string {
  return value.replace(/[−–—×÷‘’“”]/g, (c) => LOOKALIKES[c] ?? c);
}

/** Lowercase, fold lookalike characters, drop thousands separators and
 *  currency, collapse gaps, trim trailing punctuation. "£4,800." and "4800"
 *  both land on "4800". */
function normalise(value: string): string {
  return foldLookalikes(value)
    .toLowerCase()
    .replace(/[,£$]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.!]+$/, '')
    .trim();
}

/** Normalised with every space removed, so "(x + 3)(x + 4)" matches
 *  "(x+3)(x+4)" — students rarely space algebra the way a mark scheme does. */
function compact(value: string): string {
  return normalise(value).replace(/\s/g, '');
}

/** True when the text carries no letters, so a numeric comparison is safe.
 *  Guards against "(x+3)(x+4)" being read as the number 34. */
function isPurelyNumeric(value: string): boolean {
  const n = normalise(value);
  return n.length > 0 && !/[a-z]/.test(n) && /\d/.test(n);
}

function asNumber(value: string): number | null {
  const cleaned = normalise(value).replace(/[^0-9.-]/g, '');
  if (!cleaned || !/\d/.test(cleaned)) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Whether the student's entry matches the model answer. Deliberately forgiving
 * about spacing, case and formatting, and deliberately strict about anything
 * else — a wrong answer marked right teaches the wrong thing.
 */
export function checkAnswer(entry: string, model: string | null | undefined): boolean {
  if (!model || !entry.trim()) return false;

  if (normalise(entry) === normalise(model)) return true;
  if (compact(entry) === compact(model)) return true;

  if (isPurelyNumeric(entry) && isPurelyNumeric(model)) {
    const a = asNumber(entry);
    const b = asNumber(model);
    if (a !== null && b !== null) return a === b;
  }

  return false;
}
