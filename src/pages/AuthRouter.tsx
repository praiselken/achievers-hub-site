import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

/**
 * Landing point after login/signup.
 * Reads the user's profile and routes them to:
 *   - /onboarding   if they haven't completed onboarding
 *   - /dashboard          if student
 *   - /parent-dashboard   if parent
 *   - /dashboard          if tutor (until tutor dashboard is built)
 */
export default function AuthRouter() {
  const navigate = useNavigate();

  useEffect(() => {
    async function route() {
      if (!supabase) { navigate('/login'); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarded')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.onboarded) {
        // Save role hint for the onboarding page
        if (profile?.role) localStorage.setItem('signup_role', profile.role);
        navigate('/onboarding');
        return;
      }

      if (profile.role === 'parent') navigate('/parent-dashboard');
      else if (profile.role === 'tutor') navigate('/tutor-dashboard');
      else navigate('/dashboard');
    }
    route();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F5FD' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl"
             style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)' }}>A</div>
        <p className="font-body text-sm text-gray-400">Loading your dashboard…</p>
      </div>
    </div>
  );
}
