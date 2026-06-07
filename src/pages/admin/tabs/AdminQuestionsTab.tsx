import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Question {
  id: string;
  subject: string;
  topic_title: string | null;
  question: string;
  answer: string;
  solution_steps: string | null;
  hints: string | null;
  marks: number | null;
  month: number | null;
  day: number | null;
  difficulty: string | null;
}

const EMPTY: Omit<Question, 'id'> = {
  subject: 'maths', topic_title: '', question: '', answer: '',
  solution_steps: '', hints: '', marks: null, month: null, day: null, difficulty: 'medium',
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

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from('questions').select('*').order('subject').order('topic_title').order('day');
    setQuestions(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
  }

  function openEdit(q: Question) {
    setEditing(q);
    const { id: _id, ...rest } = q;
    setForm(rest);
  }

  async function save() {
    if (!supabase) return;
    setSaving(true);
    if (editing) {
      await supabase.from('questions').update(form).eq('id', editing.id);
    } else {
      await supabase.from('questions').insert(form);
    }
    setSaving(false);
    setEditing(null);
    setForm(EMPTY);
    load();
  }

  async function deleteQuestion(id: string) {
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
    return matchSubject && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Questions</h1>
          <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {questions.length} total · Daily 5 question bank
          </p>
        </div>
        <button onClick={openNew}
          className="font-body text-sm font-bold px-4 py-2.5 rounded-xl text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)' }}>
          + Add question
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {['all', 'maths', 'economics'].map(s => (
          <button key={s} onClick={() => setSubjectFilter(s)}
            className="font-body text-sm font-semibold px-3 py-1.5 rounded-lg capitalize transition-all"
            style={subjectFilter === s
              ? { background: 'rgba(169,125,192,0.2)', color: '#D4A8E8', border: '1px solid rgba(169,125,192,0.4)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
        <input type="text" placeholder="Search questions…" value={search} onChange={e => setSearch(e.target.value)}
          className="font-body text-sm px-4 py-1.5 rounded-lg outline-none ml-auto"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minWidth: 200 }} />
      </div>

      {/* Table */}
      {loading ? (
        <p className="font-body text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Subject', 'Topic', 'Question', 'Marks', 'Day', 'Actions'].map(h => (
                  <th key={h} className="font-body text-xs font-bold uppercase tracking-wider text-left px-4 py-3"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="font-body text-sm text-center py-10"
                        style={{ color: 'rgba(255,255,255,0.25)' }}>No questions found</td></tr>
              ) : filtered.map((q, i) => (
                <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td className="px-4 py-3">
                    <span className="font-body text-xs font-bold px-2 py-1 rounded capitalize"
                          style={{ background: 'rgba(169,125,192,0.15)', color: '#D4A8E8' }}>{q.subject}</span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm max-w-32 truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{q.topic_title ?? '—'}</td>
                  <td className="px-4 py-3 font-body text-sm max-w-xs truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{q.question}</td>
                  <td className="px-4 py-3 font-body text-sm text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>{q.marks ?? '—'}</td>
                  <td className="px-4 py-3 font-body text-sm text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {q.month != null && q.day != null ? `${q.day}/${q.month}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(q)}
                        className="font-body text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(q.id)}
                        className="font-body text-xs font-semibold px-3 py-1 rounded-lg transition-all"
                        style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Add drawer */}
      {(editing !== null || form.question !== '' || form === EMPTY && editing === null && false) && (
        <QuestionForm form={form} setForm={setForm} editing={editing}
          onSave={save} onCancel={() => { setEditing(null); setForm(EMPTY); }} saving={saving} />
      )}

      {/* Confirm delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full"
               style={{ background: '#1A1928', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-display font-bold text-white text-lg mb-2">Delete question?</p>
            <p className="font-body text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                Cancel
              </button>
              <button onClick={() => deleteQuestion(deleteId)}
                className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm"
                style={{ background: '#EF4444', color: '#fff' }}>
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
            style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)', boxShadow: '0 8px 32px rgba(153,112,166,0.4)' }}>
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
}

function QuestionForm({ form, setForm, editing, onSave, onCancel, saving }: FormProps) {
  const f = <K extends keyof Omit<Question, 'id'>>(key: K) => (
    (val: string | number | null) => setForm(p => ({ ...p, [key]: val }))
  );

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end p-4"
         style={{ background: 'rgba(0,0,0,0.6)' }}
         onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="h-full max-h-screen overflow-y-auto rounded-2xl w-full max-w-lg flex flex-col gap-4 p-6"
           style={{ background: '#1A1928', border: '1px solid rgba(255,255,255,0.1)' }}>
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
              className="flex-1 py-2 rounded-xl font-body font-semibold text-sm capitalize transition-all"
              style={form.subject === s
                ? { background: 'rgba(169,125,192,0.25)', color: '#D4A8E8', border: '1px solid rgba(169,125,192,0.4)' }
                : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {s}
            </button>
          ))}
        </div>

        {[
          { label: 'Topic title', key: 'topic_title' as const, placeholder: 'e.g. Algebra — solving equations' },
          { label: 'Difficulty', key: 'difficulty' as const, placeholder: 'easy | medium | hard' },
        ].map(({ label, key, placeholder }) => (
          <Field key={key} label={label}>
            <input value={(form[key] as string) ?? ''} onChange={e => f(key)(e.target.value)}
              placeholder={placeholder}
              className="admin-input" />
          </Field>
        ))}

        <div className="flex gap-3">
          <Field label="Marks">
            <input type="number" value={form.marks ?? ''} onChange={e => f('marks')(e.target.value ? Number(e.target.value) : null)}
              placeholder="e.g. 3" className="admin-input" />
          </Field>
          <Field label="Month">
            <input type="number" min={1} max={12} value={form.month ?? ''} onChange={e => f('month')(e.target.value ? Number(e.target.value) : null)}
              placeholder="1–12" className="admin-input" />
          </Field>
          <Field label="Day">
            <input type="number" min={1} max={31} value={form.day ?? ''} onChange={e => f('day')(e.target.value ? Number(e.target.value) : null)}
              placeholder="1–31" className="admin-input" />
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

        <div className="flex gap-3 pt-2">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-body font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving || !form.question || !form.answer}
            className="flex-1 py-3 rounded-xl font-body font-bold text-sm text-white transition-opacity"
            style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)', opacity: saving ? 0.7 : 1 }}>
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
      <label className="font-body text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      {children}
    </div>
  );
}
