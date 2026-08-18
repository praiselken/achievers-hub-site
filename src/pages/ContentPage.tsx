import { useLocation } from 'react-router-dom';
import { PublicContentPage } from '../components/marketing/PublicContentPage';
import { allPublicPages } from '../lib/publicContent';
import NotFoundPage from './NotFoundPage';

// Catch-all for the redesign's content-driven public pages (features/*, subjects/*,
// students/parents/tutors, how-it-works, about, contact, faq, legal pages, …).
// Mirrors the redesign's [...slug] route: unknown paths fall through to the 404.
export default function ContentPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+|\/+$/g, '');
  const content = allPublicPages[slug];

  if (!content) return <NotFoundPage />;
  return <PublicContentPage content={content} />;
}
