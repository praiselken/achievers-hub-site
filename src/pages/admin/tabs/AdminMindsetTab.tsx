import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

interface Prompt {
  id: string;
  month: string;
  month_theme: string;
  day: number;
  confession: string;
  reflection: string | null;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const EMPTY: Omit<Prompt, 'id'> = {
  month: 'January', month_theme: '', day: 1, confession: '', reflection: '',
};

export default function AdminMindsetTab() {
  const [prompts, setPrompts]     = useState<Prompt[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<Prompt | null>(null);
  const [form, setForm]           = useState<Omit<Prompt, 'id'>>(EMPTY);
  const [saving, setSaving]       = useState(false);
  const [monthFilter, setMonthFilter] = useState('all');
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  async function load() {
    if (!supabase) return;
    const { data } = await supabase.from('mindset_prompts').select('*')
      .order('month').order('day');
    setPrompts(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(p: Prompt) {
    setEditing(p);
    const { id: _id, ...rest } = p;
    setForm(rest);
    setShowForm(true);
  }

  async function save() {
    if (!supabase) return;
    setSaving(true);
    if (editing) {
      await supabase.from('mindset_prompts').update(form).eq('id', editing.id);
    } else {
      await supabase.from('mindset_prompts').insert(form);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function deletePrompt(id: string) {
    if (!supabase) return;
    await supabase.from('mindset_prompts').delete().eq('id', id);
    setDeleteId(null);
    load();
  }

  const filtered = monthFilter === 'all' ? prompts : prompts.filter(p => p.month === monthFilter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Mindset Prompts</h1>
          <p className="font-body text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {prompts.length} prompts · shown daily on login
          </p>
        </div>
        <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true); }}
          className="font-body text-sm font-bold px-4 py-2.5 rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)' }}>
          + Add prompt
        </button>
      </div>

      {/* Month filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setMonthFilter('all')}
          className="font-body text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={monthFilter === 'all'
            ? { background: 'rgba(169,125,192,0.2)', color: '#D4A8E8', border: '1px solid rgba(169,125,192,0.4)' }
            : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          All
        </button>
        {MONTHS.map(m => (
          <button key={m} onClick={() => setMonthFilter(m)}
            className="font-body text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
            style={monthFilter === m
              ? { background: 'rgba(169,125,192,0.2)', color: '#D4A8E8', border: '1px solid rgba(169,125,192,0.4)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {m.slice(0, 3)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-body text-sm text-center py-8" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <p className="font-body text-sm text-center py-10" style={{ color: 'rgba(255,255,255,0.25)' }}>No prompts for this month</p>
          ) : filtered.map(p => (
            <div key={p.id} className="rounded-2xl p-5 flex flex-col gap-2"
                 style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                       style={{ background: 'rgba(169,125,192,0.2)', color: '#D4A8E8' }}>
                    {p.day}
                  </div>
                  <div>
                    <p className="font-body text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {p.month} · {p.month_theme}
                    </p>
                    <p className="font-body text-sm text-white mt-0.5 leading-snug">"{p.confession}"</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(p)}
                    className="font-body text-xs font-semibold px-3 py-1 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'; }}>
                    Edit
                  </button>
                  <button onClick={() => setDeleteId(p.id)}
                    className="font-body text-xs font-semibold px-3 py-1 rounded-lg"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5' }}>
                    Delete
                  </button>
                </div>
              </div>
              {p.reflection && (
                <p className="font-body text-xs leading-relaxed ml-13 pl-1" style={{ color: 'rgba(255,255,255,0.4)', marginLeft: '52px' }}>
                  {p.reflection}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-start justify-end p-4" style={{ background: 'rgba(0,0,0,0.6)' }}
             onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div className="h-full max-h-screen overflow-y-auto rounded-2xl w-full max-w-lg flex flex-col gap-4 p-6"
               style={{ background: '#1A1928', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-white text-lg">{editing ? 'Edit prompt' : 'New prompt'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MF label="Month">
                <select value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))}
                  className="mind-inp">
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </MF>
              <MF label="Day">
                <input type="number" min={1} max={31} value={form.day}
                  onChange={e => setForm(p => ({ ...p, day: Number(e.target.value) }))}
                  className="mind-inp" />
              </MF>
            </div>
            <MF label="Month theme">
              <input value={form.month_theme} placeholder="e.g. Growth mindset"
                onChange={e => setForm(p => ({ ...p, month_theme: e.target.value }))}
                className="mind-inp" />
            </MF>
            <MF label="Confession / quote *">
              <textarea value={form.confession} placeholder={"The mindset statement shown to students…"} rows={3}
                onChange={e => setForm(p => ({ ...p, confession: e.target.value }))}
                className="mind-inp resize-none" />
            </MF>
            <MF label="Reflection (optional)">
              <textarea value={form.reflection ?? ''} placeholder="A follow-up reflection or question…" rows={3}
                onChange={e => setForm(p => ({ ...p, reflection: e.target.value || null }))}
                className="mind-inp resize-none" />
            </MF>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl font-body font-bold text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Cancel</button>
              <button onClick={save} disabled={saving || !form.confession} className="flex-1 py-3 rounded-xl font-body font-bold text-sm text-white" style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add prompt'}
              </button>
            </div>
          </div>
          <style>{`.mind-inp { width:100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; font-family: inherit; font-size: 14px; color: white; outline: none; } .mind-inp::placeholder { color: rgba(255,255,255,0.25); } .mind-inp:focus { border-color: rgba(169,125,192,0.5); } .mind-inp option { background: #1A1928; }`}</style>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-2xl p-6 max-w-sm w-full" style={{ background: '#1A1928', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="font-display font-bold text-white text-lg mb-2">Delete prompt?</p>
            <p className="font-body text-sm mb-5" style={{ color: 'rgba(255,255,255,0.5)' }}>This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>Cancel</button>
              <button onClick={() => deletePrompt(deleteId)} className="flex-1 py-2.5 rounded-xl font-body font-bold text-sm" style={{ background: '#EF4444', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MF({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</label>
      {children}
    </div>
  );
}
