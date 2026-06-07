import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Topic {
  id: string;
  subject: string;
  area: string;
  name: string;
  exam_board: string | null;
  description: string | null;
  command_word: string | null;
  steps: string | null;
  exam_tip: string | null;
  practice_question: string | null;
  practice_answer: string | null;
  video_url: string | null;
}

const EMPTY: Omit<Topic, 'id'> = {
  subject: 'maths', area: '', name: '', exam_board: null,
  description: null, command_word: null, steps: null,
  exam_tip: null, practice_question: null, practice_answer: null, video_url: null,
};

export default function AdminTopicsTab() {
  const [topics, setTopics]       = useState<Topic[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<Topic | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<Omit<Topic, 'id'>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [search, setSearch]       = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from('topics').select('*').order('subject').order('area').order('name');
    setTopics(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(t: Topic) {
    setEditing(t);
    const { id: _id, ...rest } = t;
    setForm(rest);
    setShowForm(true);
  }

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  async function save() {
    if (!supabase) return;
    setSaving(true);
    if (editing) {
      await supabase.from('topics').update(form).eq('id', editing.id);
    } else {
      await supabase.from('topics').insert(form);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function deleteTopic(id: string) {
    if (!supabase) return;
    await supabase.from('topics').delete().eq('id', id);
    setDeleteId(null);
    load();
  }

  const filtered = topics.filter(t => {
    const matchSubject = subjectFilter === 'all' || t.subject === subjectFilter;
    const matchSearch  = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.area.toLowerCase().includes(search.toLowerCase());
    return matchSubject && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Topics</h1>
          <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {topics.length} total · study cards and spec mapper
          </p>
        </div>
        <button onClick={openNew}
          className="font-body text-sm font-bold px-4 py-2.5 rounded-xl text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)' }}>
          + Add topic
        </button>
      </div>

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
        <input type="text" placeholder="Search topics…" value={search} onChange={e => setSearch(e.target.value)}
          className="font-body text-sm px-4 py-1.5 rounded-lg outline-none ml-auto"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minWidth: 200 }} />
      </div>

      {loading ? (
        <p className="font-body text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Subject', 'Area / Strand', 'Topic name', 'Board', 'Content', 'Actions'].map(h => (
                  <th key={h} className="font-body text-xs font-bold uppercase tracking-wider text-left px-4 py-3"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="font-body text-sm text-center py-10" style={{ color: 'rgba(255,255,255,0.25)' }}>No topics found</td></tr>
              ) : filtered.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td className="px-4 py-3">
                    <span className="font-body text-xs font-bold px-2 py-1 rounded capitalize"
                          style={{ background: 'rgba(169,125,192,0.15)', color: '#D4A8E8' }}>{t.subject}</span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm max-w-32 truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.area}</td>
                  <td className="px-4 py-3 font-body text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{t.name}</td>
                  <td className="px-4 py-3 font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.exam_board ?? 'All'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {t.description && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(74,138,20,0.2)', color: '#86efac' }}>desc</span>}
                      {t.steps && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(74,138,20,0.2)', color: '#86efac' }}>steps</span>}
                      {t.video_url && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(74,138,20,0.2)', color: '#86efac' }}>video</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)}
                        className="font-body text-xs font-semibold px-3 py-1 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(t.id)}
                        className="font-body text-xs font-semibold px-3 py-1 rounded-lg"
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

      {/* Form panel */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-start justify-end p-4"
             style={{ background: 'rgba(0,0,0,0.6)' }}
             onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="h-full max-h-screen overflow-y-auto rounded-2xl w-full max-w-lg flex flex-col gap-4 p-6"
               style={{ background: '#1A1928', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-lg">{editing ? 'Edit topic' : 'New topic'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>

            {/* Subject */}
            <div className="flex gap-2">
              {['maths', 'economics'].map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, subject: s }))}
                  className="flex-1 py-2 rounded-xl font-body font-semibold text-sm capitalize transition-all"
                  style={form.subject === s
                    ? { background: 'rgba(169,125,192,0.25)', color: '#D4A8E8', border: '1px solid rgba(169,125,192,0.4)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {s}
                </button>
              ))}
            </div>

            {[
              { label: 'Area / Strand *', key: 'area', placeholder: 'e.g. Algebra' },
              { label: 'Topic name *', key: 'name', placeholder: 'e.g. Solving linear equations' },
              { label: 'Exam board (leave blank for all)', key: 'exam_board', placeholder: 'AQA | Edexcel | OCR' },
              { label: 'Command word', key: 'command_word', placeholder: 'e.g. Solve, Calculate, Show that…' },
              { label: 'Video URL', key: 'video_url', placeholder: 'https://…' },
            ].map(({ label, key, placeholder }) => (
              <AdminField key={key} label={label}>
                <input value={(form[key as keyof typeof form] as string) ?? ''} placeholder={placeholder}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value || null }))}
                  className="admin-inp" />
              </AdminField>
            ))}

            {[
              { label: 'Description', key: 'description', placeholder: 'Explain what this topic covers…', rows: 3 },
              { label: 'Steps (one per line)', key: 'steps', placeholder: 'Step 1: …\nStep 2: …', rows: 4 },
              { label: 'Exam tip', key: 'exam_tip', placeholder: 'Common mistake or examiner tip…', rows: 2 },
              { label: 'Practice question', key: 'practice_question', placeholder: 'A short practice question…', rows: 2 },
              { label: 'Practice answer', key: 'practice_answer', placeholder: 'Model answer…', rows: 2 },
            ].map(({ label, key, placeholder, rows }) => (
              <AdminField key={key} label={label}>
                <textarea value={(form[key as keyof typeof form] as string) ?? ''} placeholder={placeholder} rows={rows}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value || null }))}
                  className="admin-inp resize-none" />
              </AdminField>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl font-body font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving || !form.area || !form.name}
                className="flex-1 py-3 rounded-xl font-body font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add topic'}
              </button>
            </div>
          </div>
          <style>{`.admin-inp { width:100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; font-family: inherit; font-size: 14px; color: white; outline: none; } .admin-inp::placeholder { color: rgba(255,255,255,0.25); } .admin-inp:focus { border-color: rgba(169,125,192,0.5); }`}</style>
        </div>
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: '#1A1928', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-display font-bold text-white text-lg mb-2">Delete topic?</p>
            <p className="font-body text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>This will remove all associated student progress for this topic.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
              <button onClick={() => deleteTopic(deleteId)} className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm" style={{ background: '#EF4444', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8">
        <button onClick={openNew}
          className="w-14 h-14 rounded-full text-white text-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)', boxShadow: '0 8px 32px rgba(153,112,166,0.4)' }}>+</button>
      </div>
    </div>
  );
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      {children}
    </div>
  );
}
