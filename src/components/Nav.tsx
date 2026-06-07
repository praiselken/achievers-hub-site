import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const NAV_LINKS = [
  { label: 'Students',     path: '/student' },
  { label: 'Parents',      path: '/parent' },
  { label: 'Tutors',       path: '/tutor' },
  { label: 'Pricing',      path: '/pricing'                  },
  { label: 'Find a Tutor', path: '/find-a-tutor' },
  { label: 'Shop',         path: '/shop',         soon: true },
];

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="10" cy="7" r="3.5"/>
      <path d="M2 18a8 8 0 0116 0"/>
    </svg>
  );
}

export default function Nav() {
  const { pathname } = useLocation();
  const [open, setOpen]           = useState(false);
  const [dashPath, setDashPath]   = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    async function resolveRole(userId: string) {
      const { data } = await supabase!.from('profiles').select('role').eq('id', userId).single();
      const role = data?.role ?? 'student';
      setDashPath(role === 'parent' ? '/parent-dashboard' : role === 'tutor' ? '/tutor-dashboard' : '/dashboard');
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) resolveRole(session.user.id);
      else setDashPath(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loggedIn = dashPath !== null;

  const isActive = (path: string) =>
    pathname === path || (pathname === '/' && path === '/student');

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center px-4 pt-3">
      <nav className="w-full max-w-6xl rounded-2xl"
           style={{
             background: 'rgba(255,255,255,0.62)',
             backdropFilter: 'blur(28px)',
             WebkitBackdropFilter: 'blur(28px)',
             border: '1px solid rgba(255,255,255,0.75)',
             boxShadow: '0 4px 32px rgba(28,28,46,0.10), 0 1px 0 rgba(255,255,255,0.6) inset',
           }}>

        <div className="px-4 h-[52px] flex items-center gap-1">

          {/* Logo */}
          <Link to="/" className="flex items-center mr-3 no-underline shrink-0">
            <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-0 flex-1">
            {NAV_LINKS.map((l) => (
              l.soon ? (
                <span key={l.label}
                  className="font-body text-sm font-medium px-3 py-1.5 rounded-xl text-gray-400 cursor-default select-none flex items-center gap-1 whitespace-nowrap">
                  {l.label}
                  <span className="text-[8px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    Soon
                  </span>
                </span>
              ) : (
                <Link key={l.path} to={l.path}
                  className="font-body text-sm font-medium px-3 py-1.5 rounded-xl transition-all no-underline whitespace-nowrap"
                  style={isActive(l.path)
                    ? { background: 'var(--purple-faint)', color: 'var(--purple-dark)' }
                    : { color: '#4b5563' }}
                  onMouseEnter={e => {
                    if (!isActive(l.path)) {
                      (e.currentTarget as HTMLElement).style.background = 'var(--purple-faint)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--purple-dark)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive(l.path)) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = '#4b5563';
                    }
                  }}>
                  {l.label}
                </Link>
              )
            ))}
          </div>

          {/* Desktop right — auth buttons */}
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            {loggedIn ? (
              <Link to={dashPath ?? '/dashboard'}
                className="btn-glow-purple text-sm py-1.5 px-4 no-underline">
                My Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login"
                  className="flex items-center gap-1.5 font-body text-sm font-medium px-3.5 py-1.5 rounded-xl border transition-all no-underline"
                  style={{ borderColor: '#e5e7eb', color: '#4b5563' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--purple-light)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--purple-dark)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
                    (e.currentTarget as HTMLElement).style.color = '#4b5563';
                  }}>
                  <UserIcon /> Login
                </Link>
                <Link to="/signup"
                  className="btn-glow-purple text-sm py-1.5 px-4 no-underline whitespace-nowrap">
                  Start Free
                </Link>
              </>
            )}
          </div>

          {/* Burger */}
          <button onClick={() => setOpen(o => !o)}
            className="lg:hidden flex flex-col gap-1.5 p-2 ml-auto"
            aria-label="Toggle menu">
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${open ? 'open' : ''} px-4`}>
          <div className="py-3 flex flex-col gap-1 border-t border-gray-100/80">
            {NAV_LINKS.map((l) => (
              l.soon ? (
                <span key={l.label}
                  className="flex items-center gap-2 font-body text-base font-medium text-gray-400 py-2.5 border-b border-gray-100 cursor-default">
                  {l.label}
                  <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-wide">Soon</span>
                </span>
              ) : (
                <Link key={l.path} to={l.path} onClick={() => setOpen(false)}
                  className="font-body text-base font-medium text-gray-700 py-2.5 border-b border-gray-100 no-underline"
                  style={isActive(l.path) ? { color: 'var(--purple-dark)' } : {}}>
                  {l.label}
                </Link>
              )
            ))}
            <div className="flex flex-col gap-2 mt-3">
              {loggedIn ? (
                <Link to={dashPath ?? '/dashboard'} onClick={() => setOpen(false)}
                  className="btn-glow-purple text-center text-[15px] no-underline">
                  My Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/signup" onClick={() => setOpen(false)}
                    className="btn-glow-purple text-center text-[15px] no-underline">
                    Start Free
                  </Link>
                  <Link to="/login" onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-600 no-underline">
                    <UserIcon /> Log in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
