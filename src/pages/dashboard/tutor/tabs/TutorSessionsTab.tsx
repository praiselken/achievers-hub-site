import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useTutor } from '../TutorDashboardLayout';

type SessionStatus = 'upcoming' | 'completed' | 'cancelled';

interface Session {
  id: string;
  student_name: string;
  subject: string;
  scheduled_at: string;
  duration_mins: number;
  status: SessionStatus;
  join_url: string | null;
  notes: string | null;
}

const AMBER = '#D97706';
const AMBER_FAINT = '#FEF3C7';
const AMBER_LIGHT = '#FDE68A';

const STATUS_CONFIG: Record<SessionStatus, { label: string; bg: string; color: string }> = {
  upcoming:  { label: 'Upcoming',  bg: AMBER_FAINT,  color: AMBER },
  completed: { label: 'Completed', bg: '#EAF3DE',     color: '#4A8A14' },
  cancelled: { label: 'Cancelled', bg: '#FEF2F2',     color: '#991B1B' },
};

export default function TutorSessionsTab() {
  const { tutorId } = useTutor();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<SessionStatus | 'all'>('upcoming');

  useEffect(() => {
    async function load() {
      if (!supabase || !tutorId) { setLoading(false); return; }
      const q = supabase
        .from('tutor_sessions')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('scheduled_at', { ascending: false });
      const { data } = await q;
      setSessions(data ?? []);
      setLoading(false);
    }
    load();
  }, [tutorId]);

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);

  const upcoming = sessions.filter(s => s.status === 'upcoming').length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Sessions</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5">
          {upcoming} upcoming · {sessions.length} total
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['upcoming', 'completed', 'cancelled', 'all'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="font-body text-sm font-semibold px-4 py-2 rounded-xl capitalize transition-all"
            style={filter === f
              ? { background: AMBER_FAINT, color: '#92400E', border: `1.5px solid ${AMBER_LIGHT}` }
              : { background: '#f9fafb', color: '#6b7280', border: '1.5px solid #e5e7eb' }}>
            {f === 'all' ? 'All sessions' : f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="font-body text-sm text-gray-400 text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📅</p>
          <p className="font-display font-semibold text-gray-700 mb-1">No {filter === 'all' ? '' : filter} sessions</p>
          <p className="font-body text-sm text-gray-400">Sessions booked by students will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(s => {
            const cfg = STATUS_CONFIG[s.status];
            const dt = new Date(s.scheduled_at);
            return (
              <div key={s.id} className="bg-white rounded-2xl p-5 border border-gray-100"
                   style={{ boxShadow: '0 2px 10px rgba(28,28,46,0.05)' }}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Date block */}
                  <div className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                       style={{ background: AMBER_FAINT, border: `1px solid ${AMBER_LIGHT}` }}>
                    <span className="font-body text-xs font-bold uppercase" style={{ color: AMBER }}>
                      {dt.toLocaleString('en-GB', { month: 'short' })}
                    </span>
                    <span className="font-display font-bold text-xl" style={{ color: '#92400E' }}>
                      {dt.getDate()}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-body font-semibold text-gray-900">{s.student_name}</p>
                      <span className="font-body text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{ background: cfg.bg, color: cfg.color }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="font-body text-sm text-gray-500 mt-0.5">
                      {dt.toLocaleString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                      {' · '}{s.duration_mins} min{' · '}{s.subject}
                    </p>
                    {s.notes && (
                      <p className="font-body text-xs text-gray-400 mt-1 truncate">{s.notes}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    {s.status === 'upcoming' && s.join_url && (
                      <a href={s.join_url} target="_blank" rel="noopener noreferrer"
                        className="font-body text-sm font-bold no-underline px-4 py-2 rounded-xl text-white"
                        style={{ background: AMBER }}>
                        Join
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
