import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Info } from 'lucide-react';
import { Container } from './Container';
import { FeatureIllustration, type FeatureIllustrationTone } from './FeatureIllustration';
import { StudyBackdrop } from './StudyBackdrop';
import type { PublicPageContent } from '../../lib/publicContent';

// Nav and Footer come from MarketingLayout in App.tsx, so this renders main content only.
export function PublicContentPage({ content }: { content: PublicPageContent }) {
  const toneClass = content.featureTone ? `feature-${content.featureTone}` : '';
  const illustrationTone = content.featureTone && ['daily', 'topic', 'past', 'ai', 'progress', 'grow'].includes(content.featureTone)
    ? content.featureTone as FeatureIllustrationTone
    : null;

  return (
    <main className={`mkt flex-1 ${toneClass}`}>
      <section className={`relative overflow-hidden py-20 lg:py-28 ${content.featureTone ? 'feature-tinted-surface text-[var(--color-ink-900)]' : 'bg-[var(--color-primary-900)] text-white'}`}>
        <StudyBackdrop variant={content.featureTone ? 'feature' : 'dark'} />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_center,rgba(255,159,63,.18),transparent_68%)]" aria-hidden="true" />
        <Container className={`relative ${illustrationTone ? 'grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_.68fr]' : 'max-w-4xl'}`}>
          <div>
            <p className={`text-sm font-extrabold uppercase tracking-[0.18em] ${content.featureTone ? 'feature-accent-text' : 'text-[var(--color-accent-300)]'}`}>{content.eyebrow}</p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{content.title}</h1>
            <p className={`mt-6 max-w-2xl text-lg leading-8 ${content.featureTone ? 'text-[var(--color-ink-500)]' : 'text-white/75'}`}>{content.intro}</p>
            {content.primaryCta && (
              <Link to={content.primaryCta.href} className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-accent-400)] px-6 py-3 font-bold text-[var(--color-ink-900)] transition hover:bg-[var(--color-accent-300)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                {content.primaryCta.label}<ArrowRight size={18} aria-hidden="true" />
              </Link>
            )}
          </div>
          {illustrationTone && (
            <div className="mx-auto w-full max-w-sm rounded-[2rem] border border-white bg-white p-5 shadow-[0_24px_70px_rgba(38,24,72,.16)] sm:p-7">
              <FeatureIllustration feature={illustrationTone} className="w-full" />
            </div>
          )}
        </Container>
      </section>

      {content.notice && (
        <Container className="pt-10">
          <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950" role="note">
            <Info className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
            <p><strong>Important:</strong> {content.notice}</p>
          </div>
        </Container>
      )}

      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {content.sections.map((section, index) => (
              <article key={section.title} className={`rounded-3xl border p-7 shadow-[var(--shadow-soft)] sm:p-9 ${content.featureTone ? 'feature-accent-border bg-white' : 'border-slate-200 bg-white'}`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${content.featureTone ? 'feature-accent-bg' : 'bg-[var(--color-primary-50)] text-[var(--color-primary-600)]'}`}>
                  <span className="font-display font-extrabold">{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h2 className="mt-5 font-display text-2xl font-extrabold text-[var(--color-ink-900)]">{section.title}</h2>
                <p className="mt-3 leading-7 text-[var(--color-ink-500)]">{section.body}</p>
                {section.bullets && <ul className="mt-5 space-y-3">{section.bullets.map((item) => <li key={item} className="flex gap-2 text-sm text-[var(--color-ink-700)]"><CheckCircle2 className="mt-0.5 shrink-0 text-[var(--color-success-500)]" size={18} aria-hidden="true" />{item}</li>)}</ul>}
              </article>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
