import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Paper {
  id: string;
  subject: string;
  title: string;
  year: number | null;
  exam_board: string | null;
  tier: string | null;
  paper_number: string | null;
  download_url: string | null;
  mark_scheme_url: string | null;
  examiner_report_url: string | null;
}

const EMPTY: Omit<Paper, 'id'> = {
  subject: 'maths', title: '', year: null, exam_board: null,
  tier: null, paper_number: null, download_url: null,
  mark_scheme_url: null, examiner_report_url: null,
};

export default function AdminPapersTab() {
  const [papers, setPapers]       = useState<Paper[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Paper | null>(null);
  const [form, setForm]           = useState<Omit<Paper, 'id'>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from('past_papers').select('*').order('subject').order('year', { ascending: false });
    setPapers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(p: Paper) {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setShowForm(true);
  }

  async function save() {
    if (!supabase) return;
    setSaving(true);
    if (editing) {
      await supabase.from('past_papers').update(form).eq('id', editing.id);
    } else {
      await supabase.from('past_papers').insert(form);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function deletePaper(id: string) {
    if (!supabase) return;
    await supabase.from('past_papers').delete().eq('id', id);
    setDeleteId(null);
    load();
  }

  const filtered = subjectFilter === 'all' ? papers : papers.filter(p => p.subject === subjectFilter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Past Papers</h1>
          <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{papers.length} papers</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }}
          className="font-body text-sm font-bold px-4 py-2.5 rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)' }}>
          + Add paper
        </button>
      </div>

      <div className="flex gap-3">
        {['all', 'maths', 'economics'].map(s => (
          <button key={s} onClick={() => setSubjectFilter(s)}
            className="font-body text-sm font-semibold px-3 py-1.5 rounded-lg capitalize transition-all"
            style={subjectFilter === s
              ? { background: 'rgba(169,125,192,0.2)', color: '#D4A8E8', border: '1px solid rgba(169,125,192,0.4)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-body text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Subject', 'Title', 'Year', 'Board', 'Tier', 'Links', 'Actions'].map(h => (
                  <th key={h} className="font-body text-xs font-bold uppercase tracking-wider text-left px-4 py-3"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="font-body text-sm text-center py-10" style={{ color: 'rgba(255,255,255,0.25)' }}>No papers found</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td className="px-4 py-3">
                    <span className="font-body text-xs font-bold px-2 py-1 rounded capitalize"
                          style={{ background: 'rgba(169,125,192,0.15)', color: '#D4A8E8' }}>{p.subject}</span>
                  </td>
                  <td className="px-4 py-3 font-body text-sm max-w-xs truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{p.title}</td>
                  <td className="px-4 py-3 font-body text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.year ?? '—'}</td>
                  <td className="px-4 py-3 font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.exam_board ?? '—'}</td>
                  <td className="px-4 py-3 font-body text-xs capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{p.tier ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {p.download_url && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(74,138,20,0.2)', color: '#86efac' }}>paper</span>}
                      {p.mark_scheme_url && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(74,138,20,0.2)', color: '#86efac' }}>ms</span>}
                      {p.examiner_report_url && <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(74,138,20,0.2)', color: '#86efac' }}>er</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)}
                        className="font-body text-xs font-semibold px-3 py-1 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                        Edit
                      </button>
                      <button onClick={() => setDeleteId(p.id)}
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

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-start justify-end p-4" style={{ background: 'rgba(0,0,0,0.6)' }}
             onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="h-full max-h-screen overflow-y-auto rounded-2xl w-full max-w-lg flex flex-col gap-4 p-6"
               style={{ background: '#1A1928', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-lg">{editing ? 'Edit paper' : 'Add paper'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>
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
              { label: 'Title *', key: 'title', placeholder: 'e.g. AQA Maths Paper 1 Higher 2023' },
              { label: 'Exam board', key: 'exam_board', placeholder: 'AQA | Edexcel | OCR' },
              { label: 'Tier', key: 'tier', placeholder: 'Higher | Foundation' },
              { label: 'Paper number', key: 'paper_number', placeholder: '1 | 2 | 3' },
              { label: 'Paper download URL', key: 'download_url', placeholder: 'https://…' },
              { label: 'Mark scheme URL', key: 'mark_scheme_url', placeholder: 'https://…' },
              { label: 'Examiner report URL', key: 'examiner_report_url', placeholder: 'https://…' },
            ].map(({ label, key, placeholder }) => (
              <PaperField key={key} label={label}>
                <input value={(form[key as keyof typeof form] as string) ?? ''}
                  placeholder={placeholder}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value || null }))}
                  className="pap-inp" />
              </PaperField>
            ))}
            <PaperField label="Year">
              <input type="number" value={form.year ?? ''} placeholder="e.g. 2023"
                onChange={e => setForm(p => ({ ...p, year: e.target.value ? Number(e.target.value) : null }))}
                className="pap-inp" />
            </PaperField>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-body font-bold text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
              <button onClick={save} disabled={saving || !form.title} className="flex-1 py-3 rounded-xl font-body font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add paper'}
              </button>
            </div>
          </div>
          <style>{`.pap-inp { width:100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; font-family: inherit; font-size: 14px; color: white; outline: none; } .pap-inp::placeholder { color: rgba(255,255,255,0.25); } .pap-inp:focus { border-color: rgba(169,125,192,0.5); }`}</style>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: '#1A1928', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-display font-bold text-white text-lg mb-2">Delete paper?</p>
            <p className="font-body text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
              <button onClick={() => deletePaper(deleteId)} className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm" style={{ background: '#EF4444', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaperField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      {children}
    </div>
  );
}
