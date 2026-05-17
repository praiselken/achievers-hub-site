import { Link } from 'react-router-dom';

const P = '#A97DC0';

const FooterLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <li>
    <Link
      to={to}
      style={{
        color: 'rgba(255,255,255,0.55)',
        textDecoration: 'none',
        fontSize: 14,
        lineHeight: 1,
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
    >
      {children}
    </Link>
  </li>
);

export default function Footer() {
  return (
    <footer style={{ background: '#1a1a2e', color: '#fff' }}>

      {/* ── Main footer body ── */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '64px 24px 48px',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr',
        gap: 48,
      }}
        className="footer-grid"
      >

        {/* Left — logo, tagline, social icons */}
        <div>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: `linear-gradient(135deg, ${P} 0%, #BF96D4 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, color: '#fff', flexShrink: 0,
            }}>
              A
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: '#fff', letterSpacing: '-0.01em' }}>
              Achiever's Hub
            </span>
          </div>

          {/* Tagline */}
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.50)',
            lineHeight: 1.65, maxWidth: 260, marginBottom: 28,
          }}>
            The personalised GCSE revision engine. Supporting Maths and Economics students through habit-based mastery.
          </p>

          {/* Social / action icons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {/* Community icon */}
            <a
              href="#"
              aria-label="Community"
              style={{
                width: 40, height: 40, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)',
                textDecoration: 'none',
                transition: 'border-color 0.15s, color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = P;
                el.style.color = P;
                el.style.background = 'rgba(169,125,192,0.08)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(255,255,255,0.12)';
                el.style.color = 'rgba(255,255,255,0.55)';
                el.style.background = 'transparent';
              }}
            >
              {/* People / community icon */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M1 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="13" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M13 12c1.933 0 3.5 1.567 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </a>

            {/* Book / resources icon */}
            <a
              href="#"
              aria-label="Resources"
              style={{
                width: 40, height: 40, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.55)',
                textDecoration: 'none',
                transition: 'border-color 0.15s, color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = P;
                el.style.color = P;
                el.style.background = 'rgba(169,125,192,0.08)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(255,255,255,0.12)';
                el.style.color = 'rgba(255,255,255,0.55)';
                el.style.background = 'transparent';
              }}
            >
              {/* Open book icon */}
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M9 4v11M9 4C9 4 6 3 3 3v11c3 0 6 1 6 1M9 4c0 0 3-1 6-1v11c-3 0-6 1-6 1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Product column */}
        <div>
          <h3 style={{
            fontSize: 13, fontWeight: 700, color: '#fff',
            letterSpacing: '0.01em', marginBottom: 20,
          }}>
            Product
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FooterLink to="/daily5">Daily 5 Engine</FooterLink>
            <FooterLink to="/pathways">Pathways</FooterLink>
            <FooterLink to="/diagnostic">Diagnostic Test</FooterLink>
            <FooterLink to="/for-parents">Parent Dashboard</FooterLink>
          </ul>
        </div>

        {/* Hub column */}
        <div>
          <h3 style={{
            fontSize: 13, fontWeight: 700, color: '#fff',
            letterSpacing: '0.01em', marginBottom: 20,
          }}>
            Hub
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <FooterLink to="/tutors">Tutors API</FooterLink>
            <FooterLink to="/success-stories">Success Stories</FooterLink>
            <FooterLink to="/examiners-tip">Examiners Tip</FooterLink>
            <FooterLink to="/pricing">Pricing</FooterLink>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        maxWidth: 1100,
        margin: '0 auto',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
          © 2026 Achiever's Hub. Built with passion by teachers.
        </p>
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
          ].map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)'; }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 36px !important;
          }
        }
      `}</style>
    </footer>
  );
}