import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type Role = 'student' | 'parent' | 'tutor' | 'admin';

/**
 * Sends a signed-in person to their own dashboard if they open someone else's.
 *
 * This is a routing correctness guard, not a security boundary — the data in
 * each dashboard is already scoped by user id, and row-level security is what
 * actually protects it. Without this, a student who lands on /parent-dashboard
 * just sees a confusing empty shell.
 */
export default function RequireRole({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<'checking' | 'ok'>('checking');

  useEffect(() => {
    let cancelled = false;
    if (!supabase) { navigate('/login'); return; }

    async function check() {
      const { data: { user } } = await supabase!.auth.getUser();
      if (cancelled) return;
      if (!user) { navigate('/login'); return; }

      const { data: profile } = await supabase!
        .from('profiles').select('role').eq('id', user.id).single();
      if (cancelled) return;

      const role = (profile?.role ?? 'student') as Role;
      if (allow.includes(role)) { setState('ok'); return; }

      navigate(
        role === 'parent' ? '/parent-dashboard'
        : role === 'tutor' ? '/tutor-dashboard'
        : '/dashboard',
        { replace: true },
      );
    }

    check();
    return () => { cancelled = true; };
    // `allow` is a literal array at each call site, so compare by value.
  }, [navigate, allow.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  if (state === 'checking') {
    return (
      <div className="mkt flex min-h-screen items-center justify-center bg-[#f8f8fb]">
        <p className="text-sm text-[var(--color-ink-500)]">Checking your account…</p>
      </div>
    );
  }

  return <>{children}</>;
}
