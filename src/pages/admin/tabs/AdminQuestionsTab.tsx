import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { isDemoMode } from '../../../lib/demoMode';
import { DEMO_ADMIN_QUESTIONS, DEMO_QUESTION_REPORTS } from '../../../lib/demoData';
import { fetchOpenReports, resolveReport, REASON_SHORT, type QuestionReport } from '../../../lib/reports';

interface Question {
  id: string;
  subject: string;
  topic_title: string | null;
  question: string;
  answer: string;
  solution_steps: string | null;
  hints: string | null;
  marks: number | null;
  /** Stored as a month name, not a number. Daily 5 looks the day up by name. */
  month: string | null;
  day: number | null;
  /** Part of the table's unique key and NOT NULL, so a question cannot be
   *  saved without one. */
  question_number: number | null;
  difficulty: string | null;
  skill_type: string | null;
  exam_board: string | null;
  calculator: string | null;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Fixed so the column cannot drift again. It had been holding three different
 *  vocabularies at once: easy/medium/hard, Core/Extension and foundation/higher.
 *  Tier is not stored here — the client's rule is that it falls out of grade. */
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const SKILL_TYPES = [
  'retrieval', 'fluency', 'application', 'reasoning', 'problem-solving', 'evaluation',
];

const EXAM_BOARDS = ['all', 'AQA', 'Edexcel', 'OCR'];

const EMPTY: Omit<Question, 'id'> = {
  subject: 'maths', topic_title: '', question: '', answer: '',
  solution_steps: '', hints: '', marks: null, month: null, day: null,
  question_number: null, difficulty: 'medium', skill_type: null,
  exam_board: 'all', calculator: null,
};

export default function AdminQuestionsTab() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<Question | null>(null);
  const [form, setForm]           = useState<Omit<Question, 'id'>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [deleteId, setDeleteId]   = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);
  // Was inferred from the form contents, which meant "Add question" opened
  // nothing at all: a new question starts empty, so the condition never held.
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Students' reports, so a question that is wrong can be found and corrected
  // rather than waiting for somebody to notice it.
  const [reports, setReports]     = useState<QuestionReport[]>([]);
  const [onlyReported, setOnlyReported] = useState(false);

  async function load() {
    if (isDemoMode()) { setQuestions(DEMO_ADMIN_QUESTIONS as never); setLoading(false); return; }
    if (!supabase) return;
    const { data } = await supabase.from('questions').select('*').order('subject').order('topic_title').order('day');
    setQuestions(data ?? []);
    setLoading(false);
  }

  async function loadReports() {
    if (isDemoMode()) { setReports(DEMO_QUESTION_REPORTS as QuestionReport[]); return; }
    setReports(await fetchOpenReports());
  }

  useEffect(() => { load(); loadReports(); }, []);

  async function clearReport(id: string) {
    if (!isDemoMode()) await resolveReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  const reportsByQuestion = reports.reduce<Record<string, QuestionReport[]>>((acc, r) => {
    (acc[r.question_id] ??= []).push(r);
    return acc;
  }, {});

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setDrawerOpen(true);
  }

  function openEdit(q: Question) {
    setEditing(q);
    const { id: _id, ...rest } = q;
    setForm(rest);
    setError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditing(null);
    setForm(EMPTY);
    setError(null);
  }

  /** Everything the table needs before it will accept a row. Checked here so
   *  the admin is told what is missing rather than the insert failing silently
   *  against a NOT NULL constraint. */
  function validate(f: Omit<Question, 'id'>): string | null {
    if (!f.question.trim()) return 'The question text is required.';
    if (!f.month) return 'Pick a month. Daily 5 looks questions up by month and day.';
    if (!f.day) return 'Pick a day.';
    if (!f.question_number) return 'Set the question number, 1 to 5.';
    return null;
  }

  async function save() {
    const problem = validate(form);
    if (problem) { setError(problem); return; }
    setError(null);

    if (isDemoMode()) {
      // Demo writes stay in memory so the tools can be demonstrated safely.
      setQuestions((prev) => editing
        ? prev.map((row) => (row.id === editing.id ? { ...row, ...form } : row))
        : [...prev, { ...form, id: `demo-${Date.now()}` } as never]);
      closeDrawer();
      return;
    }
    if (!supabase) return;
    setSaving(true);
    const { error: writeError } = editing
      ? await supabase.from('questions').update(form).eq('id', editing.id)
      : await supabase.from('questions').insert(form);
    setSaving(false);

    if (writeError) {
      // Was swallowed before, so a failed save looked exactly like a successful
      // one: the form closed and nothing appeared in the list.
      setError(
        writeError.code === '23505'
          ? 'A question already exists for that subject, month, day and number.'
          : `Could not save: ${writeError.message}`,
      );
      return;
    }

    closeDrawer();
    load();
  }

  async function deleteQuestion(id: string) {
    if (isDemoMode()) {
      setQuestions((prev) => prev.filter((row) => row.id !== id));
      setDeleteId(null);
      return;
    }
    if (!supabase) return;
    await supabase.from('questions').delete().eq('id', id);
    setDeleteId(null);
    load();
  }

  const filtered = questions.filter(q => {
    const matchSubject = subjectFilter === 'all' || q.subject === subjectFilter;
    const matchSearch  = !search ||
      q.question.toLowerCase().includes(search.toLowerCase()) ||
      (q.topic_title ?? '').toLowerCase().includes(search.toLowerCase());
    const matchReported = !onlyReported || (reportsByQuestion[q.id]?.length ?? 0) > 0;
    return matchSubject && matchSearch && matchReported;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Questions</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {questions.length} total · Daily 5 question bank
          </p>
        </div>
        <button onClick={openNew}
          className="text-sm font-bold px-4 py-2.5 rounded-xl text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-300), var(--color-primary-400))' }}>
          + Add question
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'maths', 'economics'].map(s => (
          <button key={s} onClick={() => setSubjectFilter(s)}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg capitalize transition-all"
            style={subjectFilter === s
              ? { background: 'rgba(169,125,192,0.2)', color: 'var(--color-primary-200)', border: '1px solid rgba(169,125,192,0.4)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
        <button onClick={() => setOnlyReported(v => !v)}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-2"
          style={onlyReported
            ? { background: 'rgba(239,68,68,0.18)', color: 'var(--color-accent-300)', border: '1px solid rgba(239,68,68,0.4)' }
            : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Reported
          {reports.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.25)', color: '#fca5a5' }}>{reports.length}</span>
          )}
        </button>
        <input type="text" placeholder="Search questions…" value={search} onChange={e => setSearch(e.target.value)}
          className="text-sm px-4 py-1.5 rounded-lg outline-none ml-auto"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minWidth: 200 }} />
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Subject', 'Topic', 'Question', 'Marks', 'Day', 'Actions'].map(h => (
                  <th key={h} className="text-xs font-bold uppercase tracking-wider text-left px-4 py-3"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-sm text-center py-10"
                        style={{ color: 'rgba(255,255,255,0.25)' }}>No questions found</td></tr>
              ) : filtered.flatMap((q, i) => [
                <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded capitalize"
                          style={{ background: 'rgba(169,125,192,0.15)', color: 'var(--color-primary-200)' }}>{q.subject}</span>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-32 truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{q.topic_title ?? '—'}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {(reportsByQuestion[q.id]?.length ?? 0) > 0 && (
                      <span className="mr-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full align-middle"
                            style={{ background: 'rgba(239,68,68,0.22)', color: '#fca5a5' }}>
                        {reportsByQuestion[q.id].length} report{reportsByQuestion[q.id].length > 1 ? 's' : ''}
                      </span>
                    )}
                    {q.question}
                  </td>
                  <td className="px-4 py-3 text-sm text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{q.marks ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {q.month && q.day != null
                      ? `${q.day} ${q.month.slice(0, 3)}${q.question_number != null ? ` · Q${q.question_number}` : ''}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(q)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(q.id)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                        style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-accent-300)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>,
                ...(reportsByQuestion[q.id] ?? []).map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(239,68,68,0.07)' }}>
                    <td colSpan={6} className="px-4 py-2.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded"
                              style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                          {REASON_SHORT[r.reason]}
                        </span>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                          {r.note ?? 'Reported by a student, no note left.'}
                        </span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                        <button onClick={() => clearReport(r.id)}
                          className="ml-auto text-xs font-semibold px-3 py-1 rounded-lg"
                          style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)' }}>
                          Mark resolved
                        </button>
                      </div>
                    </td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Add drawer */}
      {drawerOpen && (
        <QuestionForm form={form} setForm={setForm} editing={editing} error={error}
          onSave={save} onCancel={closeDrawer} saving={saving} />
      )}

      {/* Confirm delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full"
               style={{ background: '#241041', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-display font-bold text-white text-lg mb-2">Delete question?</p>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                Cancel
              </button>
              <button onClick={() => deleteQuestion(deleteId)}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: 'var(--color-accent-600)', color: '#fff' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating add button — always visible */}
      {editing === null && (
        <div className="fixed bottom-8 right-8">
          <button onClick={openNew}
            className="w-14 h-14 rounded-full text-white text-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-300), var(--color-primary-400))', boxShadow: '0 8px 32px rgba(153,112,166,0.4)' }}>
            +
          </button>
        </div>
      )}
    </div>
  );
}

interface FormProps {
  form: Omit<Question, 'id'>;
  setForm: React.Dispatch<React.SetStateAction<Omit<Question, 'id'>>>;
  editing: Question | null;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  error: string | null;
}

function QuestionForm({ form, setForm, editing, onSave, onCancel, saving, error }: FormProps) {
  const f = <K extends keyof Omit<Question, 'id'>>(key: K) => (
    (val: string | number | null) => setForm(p => ({ ...p, [key]: val }))
  );

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end p-4"
         style={{ background: 'rgba(0,0,0,0.6)' }}
         onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="h-full max-h-screen overflow-y-auto rounded-2xl w-full max-w-lg flex flex-col gap-4 p-6"
           style={{ background: '#241041', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-white text-lg">
            {editing ? 'Edit question' : 'New question'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors text-xl">×</button>
        </div>

        {/* Subject */}
        <div className="flex gap-2">
          {['maths', 'economics'].map(s => (
            <button key={s} onClick={() => f('subject')(s)}
              className="flex-1 py-2 rounded-xl font-semibold text-sm capitalize transition-all"
              style={form.subject === s
                ? { background: 'rgba(169,125,192,0.25)', color: 'var(--color-primary-200)', border: '1px solid rgba(169,125,192,0.4)' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {s}
            </button>
          ))}
        </div>

        <Field label="Topic title">
          <input value={form.topic_title ?? ''} onChange={e => f('topic_title')(e.target.value)}
            placeholder="e.g. Algebra — solving equations" className="admin-input" />
        </Field>

        <div className="flex gap-3">
          <Field label="Difficulty">
            <select value={form.difficulty ?? 'medium'} onChange={e => f('difficulty')(e.target.value)}
              className="admin-input capitalize">
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Skill type">
            <select value={form.skill_type ?? ''} onChange={e => f('skill_type')(e.target.value || null)}
              className="admin-input capitalize">
              <option value="">Not set</option>
              {SKILL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>

        <div className="flex gap-3">
          <Field label="Exam board">
            <select value={form.exam_board ?? 'all'} onChange={e => f('exam_board')(e.target.value)}
              className="admin-input">
              {EXAM_BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Calculator">
            <select value={form.calculator ?? ''} onChange={e => f('calculator')(e.target.value || null)}
              className="admin-input">
              <option value="">Not set</option>
              <option value="Calc">Calc</option>
              <option value="Non-Calc">Non-Calc</option>
            </select>
          </Field>
          <Field label="Marks">
            <input type="number" min={1} value={form.marks ?? ''} onChange={e => f('marks')(e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 3" className="admin-input" />
          </Field>
        </div>

        {/* Subject, month, day and question number together are the table's
            unique key, and all four are required. Getting the month wrong is
            what previously made a saved question invisible to Daily 5. */}
        <div className="flex gap-3">
          <Field label="Month *">
            <select value={form.month ?? ''} onChange={e => f('month')(e.target.value || null)}
              className="admin-input">
              <option value="">Pick a month</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Day *">
            <input type="number" min={1} max={31} value={form.day ?? ''} onChange={e => f('day')(e.target.value ? Number(e.target.value) : null)}
              placeholder="1–31" className="admin-input" />
          </Field>
          <Field label="Question no. *">
            <select value={form.question_number ?? ''} onChange={e => f('question_number')(e.target.value ? Number(e.target.value) : null)}
              className="admin-input">
              <option value="">1–5</option>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Question *">
          <textarea value={form.question} onChange={e => f('question')(e.target.value)}
            rows={3} placeholder="The question text…" className="admin-input resize-none" />
        </Field>

        <Field label="Model answer *">
          <textarea value={form.answer} onChange={e => f('answer')(e.target.value)}
            rows={3} placeholder="The model answer…" className="admin-input resize-none" />
        </Field>

        <Field label="Solution steps (one per line or 'Step 1: …')">
          <textarea value={form.solution_steps ?? ''} onChange={e => f('solution_steps')(e.target.value)}
            rows={4} placeholder={"Step 1: …\nStep 2: …\nStep 3: …"} className="admin-input resize-none" />
        </Field>

        <Field label="Hint">
          <textarea value={form.hints ?? ''} onChange={e => f('hints')(e.target.value)}
            rows={2} placeholder="Optional hint shown before the answer…" className="admin-input resize-none" />
        </Field>

        {error && (
          <p role="alert" className="rounded-xl px-4 py-3 text-sm font-semibold"
             style={{ background: 'rgba(239,68,68,0.14)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.35)' }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving || !form.question || !form.answer}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, var(--color-primary-300), var(--color-primary-400))', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : editing ? 'Save changes' : 'Add question'}
          </button>
        </div>
      </div>
      <style>{`.admin-input { width:100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; font-family: inherit; font-size: 14px; color: white; outline: none; } .admin-input::placeholder { color: rgba(255,255,255,0.25); } .admin-input:focus { border-color: rgba(169,125,192,0.5); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      {children}
    </div>
  );
}
