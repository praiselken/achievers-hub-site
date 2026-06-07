import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { useTutor } from '../TutorDashboardLayout';

interface Student {
  id: string;
  student_name: string;
  student_email: string;
  subject: string;
  year_group: number | null;
  exam_board: string | null;
  joined_at: string;
  last_active: string | null;
  streak: number;
  topics_covered: number;
}

const AMBER = '#D97706';
const AMBER_FAINT = '#FEF3C7';

export default function TutorStudentsTab() {
  const { tutorId } = useTutor();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    async function load() {
      if (!supabase || !tutorId) { setLoading(false); return; }
      const { data } = await supabase
        .from('tutor_students')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('joined_at', { ascending: false });
      setStudents(data ?? []);
      setLoading(false);
    }
    load();
  }, [tutorId]);

  const filtered = students.filter(s =>
    s.student_name.toLowerCase().includes(search.toLowerCase()) ||
    s.student_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="font-display font-bold text-2xl text-gray-900">My Students</h1>
          <p className="font-body text-sm text-gray-500 mt-0.5">{students.length} student{students.length !== 1 ? 's' : ''} linked to your account</p>
        </div>
        <input
          type="text"
          placeholder="Search students…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="font-body text-sm px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-amber-300"
          style={{ minWidth: 200 }}
        />
      </div>

      {loading ? (
        <p className="font-body text-sm text-gray-400 text-center py-8">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-display font-semibold text-gray-700 mb-1">
            {students.length === 0 ? 'No students yet' : 'No results'}
          </p>
          <p className="font-body text-sm text-gray-400">
            {students.length === 0
              ? 'Students who book sessions with you will appear here.'
              : 'Try a different search term.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(s => (
            <div key={s.id} className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4"
                 style={{ boxShadow: '0 2px 10px rgba(28,28,46,0.05)' }}>
              {/* Avatar + name */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                     style={{ background: AMBER_FAINT, color: AMBER }}>
                  {s.student_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-body font-semibold text-gray-900 text-sm truncate">{s.student_name}</p>
                  <p className="font-body text-xs text-gray-400 truncate">{s.student_email}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {s.year_group && (
                  <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: '#F3F4F6', color: '#6B7280' }}>
                    Year {s.year_group}
                  </span>
                )}
                {s.exam_board && (
                  <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-lg"
                        style={{ background: '#F3F4F6', color: '#6B7280' }}>
                    {s.exam_board}
                  </span>
                )}
                <span className="font-body text-xs font-semibold px-2.5 py-1 rounded-lg capitalize"
                      style={{ background: 'var(--purple-faint)', color: 'var(--purple-dark)' }}>
                  {s.subject}
                </span>
              </div>

              {/* Stats */}
              <div className="flex gap-5 shrink-0">
                <div className="text-center">
                  <div className="font-display font-bold text-lg text-gray-900">🔥 {s.streak}</div>
                  <div className="font-body text-[10px] text-gray-400">streak</div>
                </div>
                <div className="text-center">
                  <div className="font-display font-bold text-lg" style={{ color: '#4A8A14' }}>{s.topics_covered}</div>
                  <div className="font-body text-[10px] text-gray-400">topics</div>
                </div>
              </div>

              <Link to={`/tutor-dashboard/students/${s.id}`}
                className="font-body text-sm font-bold no-underline px-4 py-2 rounded-xl shrink-0"
                style={{ background: AMBER_FAINT, color: AMBER, border: `1px solid #FDE68A` }}>
                View →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
