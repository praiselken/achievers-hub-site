import { Link } from 'react-router-dom';
import { Logo } from './marketing/Logo';
import { Container } from './marketing/Container';

const columns = [
  { title: 'Learn', links: [['GCSE Maths', '/subjects/gcse-maths'], ['GCSE Economics', '/subjects/gcse-economics'], ['Daily 5', '/features/daily-5'], ['Topic Hub', '/features/topic-hub'], ['Past Paper Hub', '/features/past-paper-hub'], ['Archi: AI Tutor', '/features/ai-tutor']] },
  { title: 'Accounts', links: [['For Students', '/students'], ['For Parents', '/parents'], ['For Tutors', '/tutors'], ['Sign in', '/login'], ['Start Free Trial', '/start-free-trial']] },
  { title: 'Shop & support', links: [['Shop', '/shop'], ['How It Works', '/how-it-works'], ['FAQ', '/faq'], ['Contact', '/contact'], ['Technical Support', '/support']] },
  { title: 'Legal & trust', links: [['Privacy Policy', '/privacy'], ['Terms and Conditions', '/terms'], ['Subscription Terms', '/subscription-terms'], ['Safeguarding', '/safeguarding'], ['AI Use and Accuracy', '/ai-use-and-accuracy'], ['Accessibility', '/accessibility']] },
];

export default function Footer() {
  return (
    <footer className="mkt bg-[var(--color-primary-900)] text-white">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div><Logo variant="light" /><p className="mt-5 max-w-sm text-sm leading-7 text-white/65">Achievers Hub is a GCSE Maths and Economics revision platform shaped by classroom, tutoring and examiner experience. It helps students know what to revise next.</p></div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">{columns.map((column) => <div key={column.title}><h2 className="text-sm font-extrabold text-white">{column.title}</h2><ul className="mt-4 space-y-3">{column.links.map(([label, href]) => <li key={label}><Link to={href} className="text-sm text-white/65 hover:text-[var(--color-accent-300)] hover:underline">{label}</Link></li>)}</ul></div>)}</div>
        </div>
        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Achievers Hub. All rights reserved.</p><p>Legal entity details pending confirmation.</p></div>
      </Container>
    </footer>
  );
}
