/**
 * Reporting a problem with a question.
 *
 * The client's list of reasons, and the reads and writes behind them. Needs
 * migration 0004; until that runs, submitting returns a not_ready result and
 * the caller should say so rather than pretending the report was filed.
 */

import { supabase } from './supabase';
import { isDemoMode } from './demoMode';

export type ReportReason =
  | 'incorrect_answer'
  | 'unclear_wording'
  | 'image_or_diagram'
  | 'mark_scheme'
  | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'incorrect_answer', label: 'The answer looks wrong' },
  { value: 'unclear_wording',  label: 'The wording is unclear' },
  { value: 'image_or_diagram', label: 'Something is wrong with an image or diagram' },
  { value: 'mark_scheme',      label: 'The marks or mark scheme look wrong' },
  { value: 'other',            label: 'Something else' },
];

export const REASON_LABELS: Record<ReportReason, string> = Object.fromEntries(
  REPORT_REASONS.map((r) => [r.value, r.label]),
) as Record<ReportReason, string>;

/** Short labels for the admin list, where the row is already narrow. */
export const REASON_SHORT: Record<ReportReason, string> = {
  incorrect_answer: 'Answer',
  unclear_wording:  'Wording',
  image_or_diagram: 'Image',
  mark_scheme:      'Marks',
  other:            'Other',
};

export interface QuestionReport {
  id: string;
  question_id: string;
  user_id: string;
  reason: ReportReason;
  note: string | null;
  resolved_at: string | null;
  created_at: string;
}

export type SubmitResult =
  | { ok: true }
  | { ok: 'demo' }
  | { ok: false; reason: 'not_ready' | 'duplicate' | 'signed_out' | 'failed'; message: string };

export const NOTE_MAX = 500;

/** Postgres error for "relation does not exist" — the migration has not run. */
const UNDEFINED_TABLE = '42P01';
const UNIQUE_VIOLATION = '23505';

export async function submitReport(
  questionId: string,
  reason: ReportReason,
  note?: string,
): Promise<SubmitResult> {
  if (isDemoMode()) return { ok: 'demo' };
  if (!supabase) return { ok: false, reason: 'failed', message: 'Not connected.' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'signed_out', message: 'You need to be signed in to report a question.' };

  const { error } = await supabase.from('question_reports').insert({
    question_id: questionId,
    user_id: user.id,
    reason,
    note: note?.trim() ? note.trim().slice(0, NOTE_MAX) : null,
  });

  if (!error) return { ok: true };
  if (error.code === UNDEFINED_TABLE) {
    return { ok: false, reason: 'not_ready', message: 'Reporting is not switched on yet. Nothing was sent.' };
  }
  if (error.code === UNIQUE_VIOLATION) {
    return { ok: false, reason: 'duplicate', message: 'You have already reported this question.' };
  }
  return { ok: false, reason: 'failed', message: error.message };
}

/** Open reports, newest first, for the admin queue. Returns an empty list
 *  rather than throwing when the table is not there yet. */
export async function fetchOpenReports(): Promise<QuestionReport[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('question_reports')
    .select('*')
    .is('resolved_at', null)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []) as QuestionReport[];
}

export async function resolveReport(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('question_reports')
    .update({ resolved_at: new Date().toISOString(), resolved_by: user?.id ?? null })
    .eq('id', id);
  return !error;
}
