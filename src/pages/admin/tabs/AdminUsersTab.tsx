import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { isDemoMode } from '../../../lib/demoMode';
import { DEMO_ADMIN_USERS, DEMO_USER_DETAIL } from '../../../lib/demoData';

/** What sits behind a user row once it is opened. */
interface UserDetail {
  email: string | null;
  current_grade: number | null;
  target_grade: number | null;
  streak: number;
  longest_streak: number;
  sessions: { subject: string; score: number; total: number; completed_at: string }[];
  topics: { covered: number; secure: number; in_progress: number; total: number };
  links: { role: string; name: string }[];
  subscription: string | null;
}

/** Foundation covers grades 1 to 5 and Higher 5 to 9, so grade 5 is the
 *  crossover. Tier is never stored, it falls out of the grade. */
function tierFor(grade: number | null): string | null {
  if (grade == null) return null;
  if (grade < 5) return 'Foundation';
  if (grade > 5) return 'Higher';
  return 'Crossover';
}

interface UserRow {
  id: string;
  display_name: string | null;
  avatar: string | null;
  role: string;
  subjects: string[] | null;
  year_group: number | null;
  exam_board: string | null;
  onboarded: boolean;
  created_at: string;
}

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  student: { bg: 'rgba(169,125,192,0.15)', color: 'var(--color-primary-200)' },
  parent:  { bg: 'rgba(217,119,6,0.15)',   color: 'var(--color-accent-300)' },
  tutor:   { bg: 'rgba(74,138,20,0.15)',   color: 'var(--color-success-300)' },
  admin:   { bg: 'rgba(239,68,68,0.15)',   color: 'var(--color-accent-300)' },
};

export default function AdminUsersTab() {
  const [users, setUsers]         = useState<UserRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selected, setSelected]   = useState<UserRow | null>(null);
  const [detail, setDetail]       = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /**
   * Pull the rest of a user's picture on demand rather than for every row.
   * Grades, email and subscription are not here yet: grades still live in the
   * browser until migration 0002 runs, email sits in the auth table the panel
   * cannot read until it is copied onto the profile, and subscriptions arrive
   * with migration 0003.
   */
  async function openUser(user: UserRow) {
    setSelected(user);
    setDetail(null);

    if (isDemoMode()) {
      setDetail(DEMO_USER_DETAIL[user.id] ?? null);
      return;
    }
    if (!supabase) return;

    setDetailLoading(true);
    const [sessionsRes, progressRes, streakRes] = await Promise.all([
      supabase.from('daily_sessions').select('subject, score, total, completed_at')
        .eq('user_id', user.id).order('completed_at', { ascending: false }).limit(5),
      supabase.from('topic_progress').select('status').eq('user_id', user.id),
      supabase.from('streaks').select('current_streak, longest_streak').eq('user_id', user.id).maybeSingle(),
    ]);

    const progress = progressRes.data ?? [];
    setDetail({
      email: null,
      current_grade: null,
      target_grade: null,
      streak: streakRes.data?.current_streak ?? 0,
      longest_streak: streakRes.data?.longest_streak ?? 0,
      sessions: sessionsRes.data ?? [],
      topics: {
        covered:     progress.filter((p) => p.status === 'covered').length,
        secure:      progress.filter((p) => p.status === 'secure').length,
        in_progress: progress.filter((p) => p.status === 'in_progress').length,
        total:       progress.length,
      },
      // parent_child_links is readable only by the parent on it under the
      // current policy, so an admin sees nothing until a policy is added.
      links: [],
      subscription: null,
    });
    setDetailLoading(false);
  }

  async function load() {
    if (isDemoMode()) { setUsers(DEMO_ADMIN_USERS as never); setLoading(false); return; }
    if (!supabase) return;
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, avatar, role, subjects, year_group, exam_board, onboarded, created_at')
      .order('created_at', { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function setRole(id: string, role: string) {
    if (isDemoMode()) {
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
      return;
    }
    if (!supabase) return;
    await supabase.from('profiles').update({ role }).eq('id', id);
    setUsers(u => u.map(r => r.id === id ? { ...r, role } : r));
  }

  const filtered = users.filter(u => {
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search ||
      (u.display_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const counts = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Users</h1>
        <div className="flex gap-4 mt-2 flex-wrap">
          {Object.entries(counts).map(([role, count]) => {
            const s = ROLE_STYLE[role] ?? { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' };
            return (
              <span key={role} className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                    style={{ background: s.bg, color: s.color }}>
                {count} {role}{count !== 1 ? 's' : ''}
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {['all', 'student', 'parent', 'tutor', 'admin'].map(r => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className="text-sm font-semibold px-3 py-1.5 rounded-lg capitalize transition-all"
            style={roleFilter === r
              ? { background: 'rgba(169,125,192,0.2)', color: 'var(--color-primary-200)', border: '1px solid rgba(169,125,192,0.4)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {r === 'all' ? 'All' : r}
          </button>
        ))}
        <input type="text" placeholder="Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)}
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
                {['User', 'Role', 'Subjects', 'Onboarded', 'Joined', 'Change role'].map(h => (
                  <th key={h} className="text-xs font-bold uppercase tracking-wider text-left px-4 py-3"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-sm text-center py-10" style={{ color: 'rgba(255,255,255,0.25)' }}>No users found</td></tr>
              ) : filtered.map((u, i) => {
                const rs = ROLE_STYLE[u.role] ?? { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' };
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td className="px-4 py-3">
                      <button onClick={() => openUser(u)}
                        className="flex items-center gap-2 text-left rounded-lg -mx-1 px-1 py-0.5 transition-colors hover:bg-white/5">
                        <span className="text-xl">{u.avatar ?? '👤'}</span>
                        <div>
                          <p className="text-sm font-semibold text-white underline decoration-white/20 underline-offset-2">
                            {u.display_name ?? 'No name'}
                          </p>
                          <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{u.id.slice(0, 8)}…</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                            style={{ background: rs.bg, color: rs.color }}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {(u.subjects ?? []).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: u.onboarded ? 'var(--color-success-300)' : 'var(--color-accent-300)' }}>
                        {u.onboarded ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={e => setRole(u.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-lg outline-none capitalize"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                        {['student', 'parent', 'tutor', 'admin'].map(r => (
                          <option key={r} value={r} style={{ background: '#241041' }}>{r}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <UserDrawer
          user={selected}
          detail={detail}
          loading={detailLoading}
          onClose={() => { setSelected(null); setDetail(null); }}
          onRoleChange={(role) => { setRole(selected.id, role); setSelected({ ...selected, role }); }}
        />
      )}
    </div>
  );
}

/** A labelled value. Anything the platform cannot answer yet says why, rather
 *  than showing a blank an admin would read as "none". */
function Row({ label, value, pending }: { label: string; value?: React.ReactNode; pending?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2"
         style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-xs font-semibold flex-shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      {pending
        ? <span className="text-xs italic text-right" style={{ color: 'rgba(255,255,255,0.25)' }}>{pending}</span>
        : <span className="text-sm text-right text-white">{value ?? '—'}</span>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] font-bold uppercase tracking-[.14em] mb-1"
          style={{ color: 'var(--color-primary-200)' }}>{title}</h3>
      {children}
    </section>
  );
}

function UserDrawer({ user, detail, loading, onClose, onRoleChange }: {
  user: UserRow;
  detail: UserDetail | null;
  loading: boolean;
  onClose: () => void;
  onRoleChange: (role: string) => void;
}) {
  const rs = ROLE_STYLE[user.role] ?? { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' };
  const isStudent = user.role === 'student';
  const tier = tierFor(detail?.current_grade ?? null);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-end p-4"
         style={{ background: 'rgba(0,0,0,0.6)' }}
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="h-full max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl p-6 flex flex-col gap-5"
           style={{ background: '#241041', border: '1px solid rgba(255,255,255,0.1)' }}>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl">{user.avatar ?? '👤'}</span>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-white text-lg truncate">{user.display_name ?? 'No name'}</h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: rs.bg, color: rs.color }}>{user.role}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-sm px-3 py-1.5 rounded-lg flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>Close</button>
        </div>

        <Section title="Account">
          <Row label="Email" value={detail?.email}
               pending={detail?.email ? undefined : 'Captured at signup once the profile carries it'} />
          <Row label="User ID" value={<span className="font-mono text-xs">{user.id}</span>} />
          <Row label="Joined" value={new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
          <Row label="Onboarding" value={user.onboarded ? 'Complete' : 'Not finished'} />
          <Row label="Subscription" value={detail?.subscription}
               pending={detail?.subscription ? undefined : 'Needs the subscriptions migration'} />
        </Section>

        {isStudent && (
          <Section title="Studying">
            <Row label="Subjects" value={<span className="capitalize">{(user.subjects ?? []).join(', ') || '—'}</span>} />
            <Row label="Exam board" value={user.exam_board} />
            <Row label="Year group" value={user.year_group ? `Year ${user.year_group}` : null} />
            <Row label="Working grade" value={detail?.current_grade}
                 pending={detail?.current_grade == null ? 'Still in the browser until the grades migration runs' : undefined} />
            <Row label="Target grade" value={detail?.target_grade}
                 pending={detail?.target_grade == null ? 'Same as above' : undefined} />
            <Row label="Tier" value={tier} pending={tier ? undefined : 'Follows from the working grade'} />
          </Section>
        )}

        {isStudent && (
          <Section title="Activity">
            {loading ? (
              <p className="text-sm py-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
            ) : (
              <>
                <Row label="Current streak" value={`${detail?.streak ?? 0} days`} />
                <Row label="Longest streak" value={`${detail?.longest_streak ?? 0} days`} />
                <Row label="Topics" value={detail
                  ? `${detail.topics.secure} secure · ${detail.topics.covered} covered · ${detail.topics.in_progress} in progress`
                  : null} />
                <div className="pt-3">
                  <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Recent Daily 5</p>
                  {detail && detail.sessions.length > 0 ? (
                    <ul className="flex flex-col gap-1.5">
                      {detail.sessions.map((s, i) => (
                        <li key={i} className="flex items-center justify-between text-sm rounded-lg px-3 py-2"
                            style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <span className="capitalize text-white">{s.subject}</span>
                          <span style={{ color: 'rgba(255,255,255,0.5)' }}>
                            {s.score}/{s.total} · {new Date(s.completed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs italic" style={{ color: 'rgba(255,255,255,0.25)' }}>No sessions completed yet.</p>
                  )}
                </div>
              </>
            )}
          </Section>
        )}

        <Section title="Linked accounts">
          {detail && detail.links.length > 0 ? (
            <ul className="flex flex-col gap-1.5 pt-1">
              {detail.links.map((l, i) => (
                <li key={i} className="flex items-center justify-between text-sm rounded-lg px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-white">{l.name}</span>
                  <span className="capitalize text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{l.role}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs italic pt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
              None readable. Links are visible only to the parent on them until an admin policy is added.
            </p>
          )}
        </Section>

        <Section title="Role">
          <div className="pt-2">
            <select value={user.role} onChange={(e) => onRoleChange(e.target.value)}
              className="w-full text-sm px-3 py-2.5 rounded-xl outline-none capitalize"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              {['student', 'parent', 'tutor', 'admin'].map(r => (
                <option key={r} value={r} style={{ background: '#241041' }}>{r}</option>
              ))}
            </select>
            <p className="text-[11px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Think. Speak. Grow. reflections are deliberately not shown here. They stay private to the student.
            </p>
          </div>
        </Section>
      </div>
    </div>
  );
}
