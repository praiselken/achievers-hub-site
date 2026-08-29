import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { isDemoMode } from '../../lib/demoMode';

interface Props { children: React.ReactNode; }

export default function AdminGuard({ children }: Props) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'ok' | 'denied'>('loading');

  useEffect(() => {
    async function check() {
      // Demo mode shows the panel with sample data and writes nothing, so the
      // admin tools can be walked through without a database.
      if (isDemoMode()) { setStatus('ok'); return; }
      if (!supabase) { setStatus('denied'); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') setStatus('ok');
      else setStatus('denied');
    }
    check();
  }, [navigate]);

  if (status === 'loading') {
    return (
      <div className="mkt min-h-screen flex items-center justify-center" style={{ background: '#170831' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
             style={{ background: 'linear-gradient(135deg, var(--color-primary-300), var(--color-primary-400))' }}>A</div>
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="mkt min-h-screen flex items-center justify-center" style={{ background: '#170831' }}>
        <div className="text-center">
          <p className="text-4xl mb-4">🔒</p>
          <p className="font-display font-bold text-white text-xl mb-2">Access denied</p>
          <p className="text-sm text-gray-400">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
