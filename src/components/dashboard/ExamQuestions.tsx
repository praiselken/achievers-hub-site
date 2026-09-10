import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Workbook } from '../workbook/Workbook';
import { calculatorLabel, loadExamQuestions, type ExamQuestion } from '../../lib/questionBank';

/**
 * The Topic Hub's "Exam Questions" resource — the client's fourth topic action,
 * "Test it". Reads the topic-organised question bank.
 *
 * Shaped as one question at a time rather than a list, so a student commits to
 * an answer before the next one is in view. Hint, answer and worked steps are
 * each revealed separately: the hint is there to keep someone moving without
 * handing them the answer, which is the same bargain the Daily 5 makes.
 */
export function ExamQuestions({ subject, topicName }: { subject: string; topicName: string }) {
  // The topic the questions belong to is stored with them, so a change of topic
  // reads as "loading" by derivation rather than needing a reset on the way in.
  const [loaded, setLoaded] = useState<{ key: string; questions: ExamQuestion[] } | null>(null);
  const [index, setIndex] = useState(0);

  const key = `${subject}::${topicName}`;

  useEffect(() => {
    let cancelled = false;
    loadExamQuestions(subject, topicName).then(rows => {
      if (cancelled) return;
      setLoaded({ key, questions: rows });
      setIndex(0);
    });
    return () => { cancelled = true; };
  }, [subject, topicName, key]);

  const questions = loaded?.key === key ? loaded.questions : null;

  if (questions === null) {
    return <p className="px-5 py-6 text-sm text-[var(--color-ink-300)]">Loading exam questions…</p>;
  }

  if (questions.length === 0) {
    return (
      <p className="px-5 py-6 text-sm text-[var(--color-ink-300)]">
        No exam questions have been added for this topic yet.
      </p>
    );
  }

  // Clamped rather than trusted: the index resets in the same batch as a new
  // topic's questions, but a shorter set must never index past the end.
  const safeIndex = Math.min(index, questions.length - 1);
  const q = questions[safeIndex];

  return (
    <div className="px-5 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-300)]">
          Question {safeIndex + 1} of {questions.length}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIndex(Math.max(0, safeIndex - 1))}
            disabled={safeIndex === 0}
            aria-label="Previous question"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-500)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-200 disabled:hover:bg-transparent"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setIndex(Math.min(questions.length - 1, safeIndex + 1))}
            disabled={safeIndex === questions.length - 1}
            aria-label="Next question"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-ink-500)] transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-200 disabled:hover:bg-transparent"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Keyed so every reveal closes when the student moves on. */}
      <QuestionCard key={q.id} q={q} topicTitle={topicName} />
    </div>
  );
}

function QuestionCard({ q, topicTitle }: { q: ExamQuestion; topicTitle: string }) {
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [workbookOpen, setWorkbookOpen] = useState(false);

  const calc = calculatorLabel(q);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="bg-slate-50 px-4 py-3">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {q.estimatedGrade !== null && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{
                background: 'var(--color-primary-50)',
                color: 'var(--color-primary-700)',
                border: '1px solid var(--color-primary-200)',
              }}
            >
              Grade {q.estimatedGrade}
            </span>
          )}
          {calc && (
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-[var(--color-ink-500)]">
              {calc}
            </span>
          )}
        </div>
        <p className="whitespace-pre-line text-sm text-[var(--color-ink-700)]">{q.question}</p>
        {q.skill && (
          <p className="mt-2 text-xs text-[var(--color-ink-300)]">Tests: {q.skill}</p>
        )}
      </div>

      <button
        onClick={() => setWorkbookOpen(true)}
        className="w-full border-t border-slate-200 px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-slate-50"
        style={{ color: 'var(--color-primary-500)' }}
      >
        ✏️ Open workbook — ruler, protractor &amp; compass
      </button>
      <Workbook
        open={workbookOpen}
        onClose={() => setWorkbookOpen(false)}
        storageKey={`exam:${q.id}`}
        title={`Exam question — ${topicTitle}`}
        height={440}
      />

      {/* Hint first, and only if the source wrote one. */}
      {q.hint && (
        showHint ? (
          <div className="border-t border-slate-100 px-4 py-3" style={{ background: 'var(--color-primary-50)' }}>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-primary-500)' }}>
              Hint
            </p>
            <p className="text-sm" style={{ color: 'var(--color-primary-700)' }}>{q.hint}</p>
          </div>
        ) : (
          <button
            onClick={() => setShowHint(true)}
            className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-slate-50"
            style={{ color: 'var(--color-primary-500)' }}
          >
            Show a hint →
          </button>
        )
      )}

      {q.answer && (
        showAnswer ? (
          <div className="border-t border-slate-100 px-4 py-3" style={{ background: 'var(--color-success-50)' }}>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-success-600)' }}>
              Answer
            </p>
            <p className="whitespace-pre-line text-sm" style={{ color: 'var(--color-success-600)' }}>{q.answer}</p>
          </div>
        ) : (
          <button
            onClick={() => setShowAnswer(true)}
            className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-slate-50"
            style={{ color: 'var(--color-primary-500)' }}
          >
            Show answer →
          </button>
        )
      )}

      {/* Worked steps stay behind the answer — they are the explanation of it. */}
      {showAnswer && q.solutionSteps && (
        showSteps ? (
          <div className="border-t border-slate-100 px-4 py-3">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-ink-300)]">
              Worked solution
            </p>
            <p className="whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink-700)]">
              {q.solutionSteps}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setShowSteps(true)}
            className="w-full border-t border-slate-100 px-4 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-slate-50"
            style={{ color: 'var(--color-primary-500)' }}
          >
            Show the working →
          </button>
        )
      )}
    </div>
  );
}
