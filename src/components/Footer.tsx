import { Link } from 'react-router-dom';

const P = '#A97DC0';

const FooterLink = ({ to, children, soon }: { to: string; children: React.ReactNode; soon?: boolean }) => (
  <li>
    {soon ? (
      <span className="flex items-center gap-2 font-body text-sm" style={{ color: 'rgba(255,255,255,0.35)', cursor: 'default' }}>
        {children}
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(169,125,192,0.2)', color: P }}>Soon</span>
      </span>
    ) : (
      <Link to={to} className="font-body text-sm no-underline transition-colors"
            style={{ color: 'rgba(255,255,255,0.55)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}>
        {children}
      </Link>
    )}
  </li>
);

const COLUMNS = [
  {
    heading: 'Platform',
    links: [
      { label: 'For Students',      to: '/student' },
      { label: 'For Parents',       to: '/parent' },
      { label: 'For Tutors',        to: '/tutor' },
      { label: 'Pricing',           to: '/pricing' },
    ],
  },
  {
    heading: 'Learning',
    links: [
      { label: 'Daily 5 Engine',    to: '/student' },
      { label: 'Topic Hub',         to: '/student' },
      { label: 'Spec Mapper',       to: '/student' },
      { label: 'Diagnostic Test',   to: '/student', soon: true },
    ],
  },
  {
    heading: 'Connect',
    links: [
      { label: 'Find a Tutor',      to: '/find-a-tutor' },
      { label: 'Success Stories',   to: '/student' },
      { label: 'Blog',              to: '/blog', soon: true },
      { label: 'Contact Us',        to: '/contact', soon: true },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy',    to: '/privacy' },
      { label: 'Terms of Service',  to: '/terms' },
      { label: 'Cookie Policy',     to: '/cookies' },
      { label: 'Safeguarding',      to: '/safeguarding' },
    ],
  },
];

const SOCIAL = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="2" y="5" width="20" height="14" rx="4" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M10 9l5 3-5 3V9z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer style={{ background: '#12111e', color: '#fff' }}>
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">

        {/* Top grid */}
        <div className="grid gap-12" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr' }}>

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <img src="/Logo-final.jpeg" alt="Achievers' Hub" className="h-8 w-auto object-contain rounded-lg" />
            </div>
            <p className="font-body text-sm leading-relaxed mb-6"
               style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 240 }}>
              The personalised GCSE revision engine. Helping Maths and Economics students build lasting habits and hit their target grade.
            </p>
            {/* Social icons */}
            <div className="flex gap-2.5">
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label}
                   className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                   style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
                   onMouseEnter={e => {
                     const el = e.currentTarget as HTMLElement;
                     el.style.borderColor = P; el.style.color = P;
                     el.style.background = 'rgba(169,125,192,0.1)';
                   }}
                   onMouseLeave={e => {
                     const el = e.currentTarget as HTMLElement;
                     el.style.borderColor = 'rgba(255,255,255,0.1)';
                     el.style.color = 'rgba(255,255,255,0.45)';
                     el.style.background = 'transparent';
                   }}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.heading}>
              <h3 className="font-body text-xs font-bold uppercase tracking-wider mb-5"
                  style={{ color: 'rgba(255,255,255,0.4)' }}>
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-3.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {col.links.map(l => (
                  <FooterLink key={l.label} to={l.to} soon={'soon' in l && l.soon}>
                    {l.label}
                  </FooterLink>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-12 mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Achievers' Hub. All rights reserved.
          </p>
          <p className="font-body text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Built with purpose · GCSE Maths & Economics
          </p>
        </div>
      </div>

      {/* Responsive: collapse to 2-col on tablet, 1-col on mobile */}
      <style>{`
        @media (max-width: 1024px) {
          footer .grid { grid-template-columns: 2fr 1fr 1fr !important; }
          footer .grid > div:nth-child(4),
          footer .grid > div:nth-child(5) { margin-top: 8px; }
        }
        @media (max-width: 640px) {
          footer .grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          footer .grid > div:first-child { grid-column: 1 / -1; }
        }
      `}</style>
    </footer>
  );
}
