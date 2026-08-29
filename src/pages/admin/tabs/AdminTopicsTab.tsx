import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { isDemoMode } from '../../../lib/demoMode';
import { DEMO_ADMIN_TOPICS } from '../../../lib/demoData';

interface Topic {
  id: string;
  subject: string;
  area: string;
  name: string;
  exam_board: string | null;
  description: string | null;
  command: string | null;
  key_points: string | null;   // stored as newline-separated text, converted to array on save
  exam_tip: string | null;
  practice_q: string | null;
  practice_a: string | null;
  video_url: string | null;
}

const EMPTY: Omit<Topic, 'id'> = {
  subject: 'maths', area: '', name: '', exam_board: null,
  description: null, command: null, key_points: null,
  exam_tip: null, practice_q: null, practice_a: null, video_url: null,
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
    if (isDemoMode()) { setTopics(DEMO_ADMIN_TOPICS as never); setLoading(false); return; }
    if (!supabase) return;
    const { data } = await supabase.from('topics').select('*').order('subject').order('area').order('name');
    setTopics(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(t: Topic) {
    setEditing(t);
    const { id: _id, ...rest } = t;
    // Convert array back to newline text for the textarea
    const kp = (t as unknown as { key_points: string[] | string | null }).key_points;
    setForm({
      ...rest,
      key_points: Array.isArray(kp) ? kp.join('\n') : (kp ?? null),
    });
    setShowForm(true);
  }

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  async function save() {
    if (isDemoMode()) {
      // Demo writes stay in memory so the tools can be demonstrated safely.
      setTopics((prev) => editing
        ? prev.map((row) => (row.id === editing.id ? { ...row, ...form } : row))
        : [...prev, { ...form, id: `demo-${Date.now()}` } as never]);
      setEditing(null);
      setForm(EMPTY);
      return;
    }
    if (!supabase) return;
    setSaving(true);
    // Convert newline-separated key_points text → string array for the DB
    const payload = {
      ...form,
      key_points: form.key_points
        ? form.key_points.split('\n').map(s => s.replace(/^[-•\d.]+\s*/, '').trim()).filter(Boolean)
        : null,
    };
    if (editing) {
      await supabase.from('topics').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('topics').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function deleteTopic(id: string) {
    if (isDemoMode()) {
      setTopics((prev) => prev.filter((row) => row.id !== id));
      setDeleteId(null);
      return;
    }
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
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {topics.length} total · study cards and spec mapper
          </p>
        </div>
        <button onClick={openNew}
          className="text-sm font-bold px-4 py-2.5 rounded-xl text-white flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-300), var(--color-primary-400))' }}>
          + Add topic
        </button>
      </div>

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
        <input type="text" placeholder="Search topics…" value={search} onChange={e => setSearch(e.target.value)}
          className="text-sm px-4 py-1.5 rounded-lg outline-none ml-auto"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minWidth: 200 }} />
      </div>

      {loading ? (
        <p className="text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Subject', 'Area / Strand', 'Topic name', 'Board', 'Content', 'Actions'].map(h => (
                  <th key={h} className="text-xs font-bold uppercase tracking-wider text-left px-4 py-3"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-sm text-center py-10" style={{ color: 'rgba(255,255,255,0.25)' }}>No topics found</td></tr>
              ) : filtered.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded capitalize"
                          style={{ background: 'rgba(169,125,192,0.15)', color: 'var(--color-primary-200)' }}>{t.subject}</span>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-32 truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{t.area}</td>
                  <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>{t.name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.exam_board ?? 'All'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {t.description && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(74,138,20,0.2)', color: 'var(--color-success-300)' }}>desc</span>}
                      {t.key_points && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(74,138,20,0.2)', color: 'var(--color-success-300)' }}>steps</span>}
                      {t.video_url && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(74,138,20,0.2)', color: 'var(--color-success-300)' }}>video</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(t.id)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-accent-300)' }}
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
               style={{ background: '#241041', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-lg">{editing ? 'Edit topic' : 'New topic'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>

            {/* Subject */}
            <div className="flex gap-2">
              {['maths', 'economics'].map(s => (
                <button key={s} onClick={() => setForm(p => ({ ...p, subject: s }))}
                  className="flex-1 py-2 rounded-xl font-semibold text-sm capitalize transition-all"
                  style={form.subject === s
                    ? { background: 'rgba(169,125,192,0.25)', color: 'var(--color-primary-200)', border: '1px solid rgba(169,125,192,0.4)' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {s}
                </button>
              ))}
            </div>

            {[
              { label: 'Area / Strand *', key: 'area', placeholder: 'e.g. Algebra' },
              { label: 'Topic name *', key: 'name', placeholder: 'e.g. Solving linear equations' },
              { label: 'Exam board (leave blank for all)', key: 'exam_board', placeholder: 'AQA | Edexcel | OCR' },
              { label: 'Command word', key: 'command', placeholder: 'e.g. Solve, Calculate, Show that…' },
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
              { label: 'Steps (one per line)', key: 'key_points', placeholder: 'Step 1: …\nStep 2: …', rows: 4 },
              { label: 'Exam tip', key: 'exam_tip', placeholder: 'Common mistake or examiner tip…', rows: 2 },
              { label: 'Practice question', key: 'practice_q', placeholder: 'A short practice question…', rows: 2 },
              { label: 'Practice answer', key: 'practice_a', placeholder: 'Model answer…', rows: 2 },
            ].map(({ label, key, placeholder, rows }) => (
              <AdminField key={key} label={label}>
                <textarea value={(form[key as keyof typeof form] as string) ?? ''} placeholder={placeholder} rows={rows}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value || null }))}
                  className="admin-inp resize-none" />
              </AdminField>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving || !form.area || !form.name}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(135deg, var(--color-primary-300), var(--color-primary-400))', opacity: saving ? 0.7 : 1 }}>
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
          <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: '#241041', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-display font-bold text-white text-lg mb-2">Delete topic?</p>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>This will remove all associated student progress for this topic.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
              <button onClick={() => deleteTopic(deleteId)} className="flex-1 py-2.5 rounded-xl font-bold text-sm" style={{ background: 'var(--color-accent-600)', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8">
        <button onClick={openNew}
          className="w-14 h-14 rounded-full text-white text-2xl shadow-lg flex items-center justify-center transition-transform hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-300), var(--color-primary-400))', boxShadow: '0 8px 32px rgba(153,112,166,0.4)' }}>+</button>
      </div>
    </div>
  );
}

function AdminField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      {children}
    </div>
  );
}
