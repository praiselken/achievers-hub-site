import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

type AdminTab = 'questions' | 'topics' | 'papers' | 'users' | 'mindset';

const TABS: { key: AdminTab; label: string; icon: string; path: string }[] = [
  { key: 'questions', label: 'Questions',    icon: '❓', path: '/admin/questions' },
  { key: 'topics',    label: 'Topics',       icon: '📚', path: '/admin/topics'    },
  { key: 'papers',    label: 'Past Papers',  icon: '📋', path: '/admin/papers'    },
  { key: 'mindset',   label: 'Mindset',      icon: '✨', path: '/admin/mindset'   },
  { key: 'users',     label: 'Users',        icon: '👥', path: '/admin/users'     },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen" style={{ background: '#0F0E1A' }}>

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r"
             style={{ borderColor: 'rgba(255,255,255,0.07)', position: 'sticky', top: 0, height: '100vh' }}>

        <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, #B57CC8, #9970A6)' }}>A</div>
            <div>
              <p className="font-body text-xs font-bold text-white">Achievers' Hub</p>
              <p className="font-body text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {TABS.map(t => {
            const active = pathname.startsWith(t.path);
            return (
              <Link key={t.key} to={t.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-body font-medium text-sm transition-all no-underline"
                style={active
                  ? { background: 'rgba(169,125,192,0.18)', color: '#D4A8E8' }
                  : { color: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}>
                <span>{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <button
            onClick={async () => { await supabase?.auth.signOut(); navigate('/login'); }}
            className="flex items-center gap-2 font-body text-sm transition-colors w-full"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}>
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M13 3h4v14h-4M9 14l4-4-4-4M13 10H4"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
