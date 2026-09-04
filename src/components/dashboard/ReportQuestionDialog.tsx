import { useState } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { NOTE_MAX, REPORT_REASONS, submitReport, type ReportReason } from '../../lib/reports';

/**
 * Reporting a problem with a question, from the student's side.
 *
 * The reasons are a fixed list rather than a text box: it keeps the reports
 * sortable in the admin panel, and it means nothing arrives that needs reading
 * before it can be triaged. The optional note is the only free text, and it is
 * capped.
 */
export function ReportQuestionDialog({ questionId, questionText, onClose, onReported }: {
  questionId: string;
  questionText: string;
  onClose: () => void;
  onReported: () => void;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function send() {
    if (!reason) return;
    setSending(true);
    setProblem(null);
    const result = await submitReport(questionId, reason, note);
    setSending(false);

    if (result.ok === true || result.ok === 'demo') {
      setSent(true);
      onReported();
      return;
    }
    setProblem(result.message);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
         style={{ background: 'rgba(28,28,46,0.55)' }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Report a problem with this question"
           className="w-full max-w-md rounded-[1.5rem] bg-white p-6 shadow-[var(--shadow-soft-lg)]">

        {sent ? (
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-success-50)] text-[var(--color-success-600)]">
              <Check size={24} strokeWidth={3} />
            </span>
            <h2 className="mt-4 font-display text-xl font-extrabold text-[var(--color-ink-900)]">Thanks, that's been sent</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink-500)]">
              Someone will check this question. Carry on with your Daily 5 in the meantime.
            </p>
            <button type="button" onClick={onClose}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--color-primary-600)] px-6 font-bold text-white">
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold text-[var(--color-ink-900)]">Report a problem</h2>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--color-ink-500)]">{questionText}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[var(--color-ink-500)] hover:bg-slate-50">
                <X size={18} />
              </button>
            </div>

            <fieldset className="mt-5">
              <legend className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-ink-500)]">
                What's wrong with it?
              </legend>
              <div className="mt-3 flex flex-col gap-2">
                {REPORT_REASONS.map((r) => (
                  <label key={r.value}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition"
                    style={reason === r.value
                      ? { borderColor: 'var(--color-primary-500)', background: 'var(--color-primary-50)' }
                      : { borderColor: 'var(--color-border)', background: 'white' }}>
                    <input type="radio" name="report-reason" value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="h-4 w-4 accent-[var(--color-primary-600)]" />
                    <span className="text-sm font-semibold text-[var(--color-ink-700)]">{r.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4">
              <label htmlFor="report-note" className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-ink-500)]">
                Anything else? Optional
              </label>
              <textarea id="report-note" rows={2} value={note} maxLength={NOTE_MAX}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Tell us a bit more if it helps"
                className="mt-2 w-full resize-y rounded-xl border-2 px-4 py-2.5 text-sm leading-6 text-[var(--color-ink-900)] outline-none focus:border-[var(--color-primary-400)]"
                style={{ borderColor: 'var(--color-border)' }} />
            </div>

            {problem && (
              <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {problem}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={onClose}
                className="min-h-12 flex-1 rounded-xl border border-slate-200 font-bold text-[var(--color-ink-500)] hover:bg-slate-50">
                Cancel
              </button>
              <button type="button" onClick={send} disabled={!reason || sending}
                className="min-h-12 flex-1 rounded-xl bg-[var(--color-primary-600)] font-bold text-white transition hover:bg-[var(--color-primary-700)] disabled:cursor-not-allowed disabled:opacity-40">
                {sending ? 'Sending…' : 'Send report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
