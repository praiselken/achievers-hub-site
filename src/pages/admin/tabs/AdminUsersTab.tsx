import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

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
  student: { bg: 'rgba(169,125,192,0.15)', color: '#D4A8E8' },
  parent:  { bg: 'rgba(217,119,6,0.15)',   color: '#FCD34D' },
  tutor:   { bg: 'rgba(74,138,20,0.15)',   color: '#86efac' },
  admin:   { bg: 'rgba(239,68,68,0.15)',   color: '#FCA5A5' },
};

export default function AdminUsersTab() {
  const [users, setUsers]         = useState<UserRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  async function load() {
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
              <span key={role} className="font-body text-xs font-bold px-2.5 py-1 rounded-full capitalize"
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
            className="font-body text-sm font-semibold px-3 py-1.5 rounded-lg capitalize transition-all"
            style={roleFilter === r
              ? { background: 'rgba(169,125,192,0.2)', color: '#D4A8E8', border: '1px solid rgba(169,125,192,0.4)' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {r === 'all' ? 'All' : r}
          </button>
        ))}
        <input type="text" placeholder="Search by name or ID…" value={search} onChange={e => setSearch(e.target.value)}
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
                {['User', 'Role', 'Subjects', 'Onboarded', 'Joined', 'Change role'].map(h => (
                  <th key={h} className="font-body text-xs font-bold uppercase tracking-wider text-left px-4 py-3"
                      style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="font-body text-sm text-center py-10" style={{ color: 'rgba(255,255,255,0.25)' }}>No users found</td></tr>
              ) : filtered.map((u, i) => {
                const rs = ROLE_STYLE[u.role] ?? { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' };
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{u.avatar ?? '👤'}</span>
                        <div>
                          <p className="font-body text-sm font-semibold text-white">{u.display_name ?? 'No name'}</p>
                          <p className="font-body text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{u.id.slice(0, 8)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                            style={{ background: rs.bg, color: rs.color }}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs capitalize" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {(u.subjects ?? []).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-body text-xs" style={{ color: u.onboarded ? '#86efac' : '#FCA5A5' }}>
                        {u.onboarded ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <select value={u.role} onChange={e => setRole(u.id, e.target.value)}
                        className="font-body text-xs px-2 py-1 rounded-lg outline-none capitalize"
                        style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                        {['student', 'parent', 'tutor', 'admin'].map(r => (
                          <option key={r} value={r} style={{ background: '#1A1928' }}>{r}</option>
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
    </div>
  );
}
