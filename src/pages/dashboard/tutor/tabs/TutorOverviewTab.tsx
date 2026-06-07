import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { useTutor } from '../TutorDashboardLayout';

interface Stats {
  studentCount: number;
  sessionsThisMonth: number;
  nextSession: { student_name: string; scheduled_at: string } | null;
  recentActivity: { student_name: string; action: string; at: string }[];
}

const AMBER = '#D97706';
const AMBER_FAINT = '#FEF3C7';
const AMBER_LIGHT = '#FDE68A';

export default function TutorOverviewTab() {
  const { tutorId, displayName } = useTutor();
  const [stats, setStats] = useState<Stats>({
    studentCount: 0, sessionsThisMonth: 0, nextSession: null, recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase || !tutorId) { setLoading(false); return; }

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [studentsRes, sessionsRes, nextRes] = await Promise.all([
        supabase.from('tutor_students').select('id', { count: 'exact', head: true }).eq('tutor_id', tutorId),
        supabase.from('tutor_sessions').select('id', { count: 'exact', head: true })
          .eq('tutor_id', tutorId).gte('scheduled_at', monthStart).eq('status', 'completed'),
        supabase.from('tutor_sessions').select('student_name, scheduled_at')
          .eq('tutor_id', tutorId).eq('status', 'upcoming')
          .gte('scheduled_at', now.toISOString()).order('scheduled_at').limit(1).single(),
      ]);

      setStats({
        studentCount: studentsRes.count ?? 0,
        sessionsThisMonth: sessionsRes.count ?? 0,
        nextSession: nextRes.data ?? null,
        recentActivity: [],
      });
      setLoading(false);
    }
    load();
  }, [tutorId]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const QUICK_LINKS = [
    { to: '/tutor-dashboard/students',  icon: '👥', label: 'View students',   color: AMBER_FAINT,  border: AMBER_LIGHT },
    { to: '/tutor-dashboard/sessions',  icon: '📅', label: 'My sessions',     color: '#EAF3DE',    border: '#C8E49A' },
    { to: '/tutor-dashboard/resources', icon: '📚', label: 'Resources',       color: 'var(--purple-faint)', border: 'var(--purple-light)' },
    { to: '/tutor-dashboard/profile',   icon: '✏️', label: 'Edit profile',    color: '#F3F4F6',    border: '#E5E7EB' },
  ];

  if (loading) return <p className="font-body text-sm text-gray-400 py-8 text-center">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900">
          {greeting}{displayName ? `, ${displayName}` : ''} 👋
        </h1>
        <p className="font-body text-sm text-gray-500 mt-1">Here's your tutor overview for today.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Active students', value: stats.studentCount, icon: '👥', color: AMBER },
          { label: 'Sessions this month', value: stats.sessionsThisMonth, icon: '📅', color: '#4A8A14' },
          { label: 'Profile views', value: '—', icon: '👁️', color: '#6b7280' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100"
               style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className="font-body text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="font-display font-bold text-3xl" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Next session */}
      {stats.nextSession ? (
        <div className="rounded-2xl p-5 flex items-center gap-5"
             style={{ background: AMBER_FAINT, border: `1px solid ${AMBER_LIGHT}` }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-white flex-shrink-0">📅</div>
          <div className="flex-1">
            <p className="font-body text-xs font-bold uppercase tracking-wider mb-1" style={{ color: AMBER }}>
              Next session
            </p>
            <p className="font-display font-semibold text-gray-900">{stats.nextSession.student_name}</p>
            <p className="font-body text-sm text-gray-600">
              {new Date(stats.nextSession.scheduled_at).toLocaleString('en-GB', {
                weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <Link to="/tutor-dashboard/sessions"
            className="font-body text-sm font-bold no-underline px-4 py-2 rounded-xl"
            style={{ background: AMBER, color: '#fff' }}>
            View
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl p-5 flex items-center gap-4"
             style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
          <span className="text-2xl">📅</span>
          <div>
            <p className="font-body font-semibold text-gray-700 text-sm">No upcoming sessions</p>
            <p className="font-body text-xs text-gray-400 mt-0.5">Sessions booked by students will appear here.</p>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div>
        <h2 className="font-body font-bold text-gray-700 text-sm uppercase tracking-wider mb-3">Quick access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_LINKS.map(l => (
            <Link key={l.to} to={l.to}
              className="bg-white rounded-2xl p-4 border no-underline flex flex-col items-start gap-3 hover:opacity-90 transition-opacity"
              style={{ borderColor: l.border, boxShadow: '0 2px 8px rgba(28,28,46,0.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                   style={{ background: l.color }}>
                {l.icon}
              </div>
              <span className="font-body font-bold text-gray-900 text-sm">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting started checklist for new tutors */}
      {stats.studentCount === 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100"
             style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <h2 className="font-body font-bold text-gray-900 mb-1">Get set up</h2>
          <p className="font-body text-sm text-gray-500 mb-4">Complete these steps to start taking on students.</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Complete your tutor profile', link: '/tutor-dashboard/profile' },
              { label: 'Set your availability', link: '/tutor-dashboard/sessions' },
              { label: 'Upload your first resource', link: '/tutor-dashboard/resources' },
            ].map(item => (
              <Link key={item.label} to={item.link}
                className="flex items-center gap-3 no-underline group">
                <div className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                     style={{ borderColor: AMBER_LIGHT }} />
                <span className="font-body text-sm text-gray-700 group-hover:underline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
