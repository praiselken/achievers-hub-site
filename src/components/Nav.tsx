import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'For Students', path: '/student' },
  { label: 'For Parents', path: '/parent' },
  { label: 'For Tutors', path: '/tutor' },
];

export default function Nav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDFCF8]/92 backdrop-blur-md border-b border-green-100"
         style={{ height: 'var(--nav-h)' }}>
      <div className="max-w-6xl mx-auto px-5 h-full flex items-center gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mr-auto no-underline">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-lg text-white"
               style={{ background: 'linear-gradient(135deg, #639922, #1D9E75)' }}>
            A
          </div>
          <span className="font-body font-semibold text-[17px] text-[#1C1C2E]">
            The Achievers<span className="text-green-600">Hub</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.path} to={l.path}
              className={`font-body text-sm font-medium px-4 py-2 rounded-lg transition-all no-underline
                ${pathname === l.path
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-green-50'}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link to="/signup"
          className="hidden md:inline-flex btn-glow-green text-sm py-2.5 px-5 no-underline">
          Take free diagnostic
        </Link>

        {/* Burger */}
        <button onClick={() => setOpen((o) => !o)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu">
          <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform duration-200 ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-transform duration-200 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`mobile-menu ${open ? 'open' : ''} bg-white border-t border-green-100 px-5`}>
        <div className="py-3 flex flex-col gap-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.path} to={l.path}
              onClick={() => setOpen(false)}
              className="font-body text-base font-medium text-gray-700 py-3 border-b border-gray-100 no-underline">
              {l.label}
            </Link>
          ))}
          <Link to="/signup" onClick={() => setOpen(false)}
            className="btn-glow-green mt-3 text-center text-[15px] no-underline">
            Take free diagnostic
          </Link>
        </div>
      </div>
    </nav>
  );
}
