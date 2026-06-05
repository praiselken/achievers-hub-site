import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'For Students', path: '/student' },
  { label: 'For Parents', path: '/parent' },
  { label: 'For Tutors', path: '/tutor' },
];

const PLACEHOLDER_LINKS = [
  { label: 'Shop' },
  { label: 'Find a Tutor' },
];

function UserIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
         strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="10" cy="7" r="3.5"/>
      <path d="M2 18a8 8 0 0116 0"/>
    </svg>
  );
}

export default function Nav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center px-4 pt-3">

      {/* Floating pill */}
      <nav
        className="w-full max-w-5xl rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.62)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.75)',
          boxShadow: '0 4px 32px rgba(28,28,46,0.10), 0 1px 0 rgba(255,255,255,0.6) inset',
        }}
      >
        <div className="px-4 h-[52px] flex items-center gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center mr-auto no-underline shrink-0">
            <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-8 w-auto object-contain" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map((l) => (
              <Link key={l.path} to={l.path}
                className={`font-body text-sm font-medium px-3.5 py-1.5 rounded-xl transition-all no-underline
                  ${pathname === l.path || (pathname === '/' && l.path === '/student')
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:text-green-700 hover:bg-green-50/70'}`}>
                {l.label}
              </Link>
            ))}

            {PLACEHOLDER_LINKS.map((l) => (
              <span key={l.label}
                className="font-body text-sm font-medium px-3.5 py-1.5 rounded-xl text-gray-400 cursor-default select-none flex items-center gap-1.5 whitespace-nowrap">
                {l.label}
                <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Soon
                </span>
              </span>
            ))}
          </div>

          {/* Login icon */}
          <Link to="/login"
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-xl border border-gray-200/80 text-gray-500 hover:border-green-400 hover:text-green-700 transition-all no-underline"
            aria-label="Log in">
            <UserIcon />
          </Link>

          {/* CTA */}
          <Link to="/signup"
            className="nav-cta hidden btn-glow-green text-sm py-2 px-4 no-underline">
            Take free diagnostic
          </Link>

          {/* Burger */}
          <button onClick={() => setOpen((o) => !o)}
            className="md:hidden flex flex-col gap-1.5 p-2 ml-1"
            aria-label="Toggle menu">
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>

        {/* Mobile menu — drops inside the pill */}
        <div className={`mobile-menu ${open ? 'open' : ''} px-4`}>
          <div className="py-3 flex flex-col gap-1 border-t border-gray-100/80">
            {NAV_LINKS.map((l) => (
              <Link key={l.path} to={l.path}
                onClick={() => setOpen(false)}
                className="font-body text-base font-medium text-gray-700 py-2.5 border-b border-gray-100 no-underline">
                {l.label}
              </Link>
            ))}
            {PLACEHOLDER_LINKS.map((l) => (
              <span key={l.label}
                className="flex items-center gap-2 font-body text-base font-medium text-gray-400 py-2.5 border-b border-gray-100 cursor-default">
                {l.label}
                <span className="text-[9px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase tracking-wide">
                  Soon
                </span>
              </span>
            ))}
            <Link to="/signup" onClick={() => setOpen(false)}
              className="btn-glow-green mt-3 text-center text-[15px] no-underline">
              Take free diagnostic
            </Link>
            <Link to="/login" onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl py-3 mt-2 text-sm font-medium text-gray-600 no-underline hover:border-green-300">
              <UserIcon /> Log in
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
