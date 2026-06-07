import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabase';
import { useTutor } from '../TutorDashboardLayout';

interface SubjectBreakdown {
  subject: string;
  count: number;
  color: string;
}

interface MonthlySession {
  month: string;
  count: number;
}

const AMBER = '#D97706';
const AMBER_FAINT = '#FEF3C7';

export default function TutorAnalyticsTab() {
  const { tutorId } = useTutor();
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [completionRate, setCompletionRate] = useState<number | null>(null);
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectBreakdown[]>([]);
  const [monthlySessions, setMonthlySessions] = useState<MonthlySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase || !tutorId) { setLoading(false); return; }

      const [studentsRes, sessionsRes] = await Promise.all([
        supabase.from('tutor_students').select('subject').eq('tutor_id', tutorId),
        supabase.from('tutor_sessions').select('status, scheduled_at, subject').eq('tutor_id', tutorId),
      ]);

      const students = studentsRes.data ?? [];
      const sessions = sessionsRes.data ?? [];

      setTotalStudents(students.length);
      setTotalSessions(sessions.length);

      const completed = sessions.filter(s => s.status === 'completed').length;
      const booked    = sessions.filter(s => s.status !== 'cancelled').length;
      setCompletionRate(booked > 0 ? Math.round((completed / booked) * 100) : null);

      // Subject breakdown
      const subjectMap: Record<string, number> = {};
      for (const s of students) {
        subjectMap[s.subject] = (subjectMap[s.subject] ?? 0) + 1;
      }
      const COLORS = ['var(--purple)', AMBER, '#4A8A14', '#2563EB'];
      setSubjectBreakdown(
        Object.entries(subjectMap).map(([subject, count], i) => ({
          subject, count, color: COLORS[i % COLORS.length]
        }))
      );

      // Monthly sessions (last 6 months)
      const monthCounts: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' });
        monthCounts[key] = 0;
      }
      for (const s of sessions) {
        const d = new Date(s.scheduled_at);
        const key = d.toLocaleString('en-GB', { month: 'short', year: '2-digit' });
        if (key in monthCounts) monthCounts[key]++;
      }
      setMonthlySessions(Object.entries(monthCounts).map(([month, count]) => ({ month, count })));

      setLoading(false);
    }
    load();
  }, [tutorId]);

  const maxMonthly = Math.max(...monthlySessions.map(m => m.count), 1);

  if (loading) return <p className="font-body text-sm text-gray-400 text-center py-8">Loading…</p>;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Analytics</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5">Track your impact and session performance.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Total students',    value: totalStudents,                        icon: '👥', color: AMBER },
          { label: 'Total sessions',    value: totalSessions,                        icon: '📅', color: '#4A8A14' },
          { label: 'Completion rate',   value: completionRate != null ? `${completionRate}%` : '—', icon: '✅', color: 'var(--purple)' },
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

      {/* Sessions per month bar chart */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100"
           style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
        <h2 className="font-body font-bold text-gray-900 mb-5">Sessions per month</h2>
        {monthlySessions.every(m => m.count === 0) ? (
          <p className="font-body text-sm text-gray-400 text-center py-6">No session data yet.</p>
        ) : (
          <div className="flex items-end gap-3 h-40">
            {monthlySessions.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="font-body text-xs font-bold" style={{ color: AMBER }}>{m.count || ''}</span>
                <div className="w-full rounded-t-lg transition-all"
                     style={{
                       height: `${(m.count / maxMonthly) * 120}px`,
                       minHeight: m.count > 0 ? 8 : 2,
                       background: m.count > 0 ? `linear-gradient(180deg, ${AMBER_FAINT}, ${AMBER})` : '#F3F4F6',
                     }} />
                <span className="font-body text-[10px] text-gray-400">{m.month}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subject breakdown */}
      {subjectBreakdown.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100"
             style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
          <h2 className="font-body font-bold text-gray-900 mb-5">Students by subject</h2>
          <div className="flex flex-col gap-3">
            {subjectBreakdown.map(s => (
              <div key={s.subject} className="flex items-center gap-3">
                <span className="font-body text-sm text-gray-700 capitalize w-28">{s.subject}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                       style={{ width: `${(s.count / totalStudents) * 100}%`, background: s.color }} />
                </div>
                <span className="font-body text-sm font-bold text-gray-700 w-6 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
