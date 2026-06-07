import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useTutor } from '../TutorDashboardLayout';

interface Resource {
  id: string;
  title: string;
  subject: string;
  type: string;
  url: string;
  created_at: string;
  shared_with_students: boolean;
}

const AMBER = '#D97706';
const AMBER_FAINT = '#FEF3C7';
const AMBER_LIGHT = '#FDE68A';

const TYPE_ICON: Record<string, string> = {
  worksheet: '📄',
  video: '🎬',
  past_paper: '📋',
  notes: '📝',
  other: '📎',
};

export default function TutorResourcesTab() {
  const { tutorId } = useTutor();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<string>('all');

  useEffect(() => {
    async function load() {
      if (!supabase || !tutorId) { setLoading(false); return; }
      const { data } = await supabase
        .from('tutor_resources')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });
      setResources(data ?? []);
      setLoading(false);
    }
    load();
  }, [tutorId]);

  const types = ['all', ...Array.from(new Set(resources.map(r => r.type)))];
  const filtered = filter === 'all' ? resources : resources.filter(r => r.type === filter);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-gray-900">Resources</h1>
          <p className="font-body text-sm text-gray-500 mt-0.5">Worksheets, past papers and notes you've uploaded.</p>
        </div>
        <button className="font-body text-sm font-bold px-4 py-2.5 rounded-xl text-white flex items-center gap-2"
                style={{ background: AMBER }}>
          <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4"><path d="M8 2v10M3 7l5-5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          Upload resource
        </button>
      </div>

      {/* Type filters */}
      {types.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button key={t} onClick={() => setFilter(t)}
              className="font-body text-sm font-semibold px-3 py-1.5 rounded-lg capitalize transition-all"
              style={filter === t
                ? { background: AMBER_FAINT, color: '#92400E', border: `1.5px solid ${AMBER_LIGHT}` }
                : { background: '#f9fafb', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
              {t === 'all' ? 'All' : `${TYPE_ICON[t] ?? '📎'} ${t.replace('_', ' ')}`}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="font-body text-sm text-gray-400 text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-display font-semibold text-gray-700 mb-1">No resources yet</p>
          <p className="font-body text-sm text-gray-400">Upload worksheets, past papers or notes to share with students.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 border border-gray-100 flex items-start gap-4"
                 style={{ boxShadow: '0 2px 10px rgba(28,28,46,0.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: AMBER_FAINT }}>
                {TYPE_ICON[r.type] ?? '📎'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-gray-900 text-sm truncate">{r.title}</p>
                <p className="font-body text-xs text-gray-400 mt-0.5 capitalize">{r.subject} · {r.type.replace('_', ' ')}</p>
                <div className="flex items-center gap-2 mt-2">
                  {r.shared_with_students && (
                    <span className="font-body text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: '#EAF3DE', color: '#4A8A14' }}>
                      Shared
                    </span>
                  )}
                </div>
              </div>
              <a href={r.url} target="_blank" rel="noopener noreferrer"
                 className="font-body text-xs font-bold no-underline px-3 py-1.5 rounded-lg flex-shrink-0"
                 style={{ background: AMBER_FAINT, color: AMBER }}>
                Open
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
