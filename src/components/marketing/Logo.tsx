type LogoProps = {
  variant?: 'dark' | 'light';
  markTone?: 'primary' | 'accent';
  showTagline?: boolean;
  tagline?: string;
  taglineClassName?: string;
  className?: string;
};

export function LogoMark({
  className = '',
  tone = 'primary',
}: {
  className?: string;
  tone?: 'primary' | 'accent';
}) {
  const fill =
    tone === 'accent' ? 'var(--color-accent-500)' : 'var(--color-primary-500)';

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon
        points="91.65,50 70.8,86.6 29.2,86.6 8.35,50 29.2,13.4 70.8,13.4"
        fill={fill}
      />
      <path
        d="M50 27 C51.5 38, 62 48.5, 73 50 C62 51.5, 51.5 62, 50 73 C48.5 62, 38 51.5, 27 50 C38 48.5, 48.5 38, 50 27 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function Logo({
  variant = 'dark',
  markTone = 'primary',
  showTagline = true,
  tagline = 'LEARN. ACHIEVE. GROW.',
  taglineClassName = '',
  className = '',
}: LogoProps) {
  const textColor = variant === 'dark' ? 'text-[var(--color-ink-900)]' : 'text-white';
  const taglineColor = variant === 'dark' ? 'text-[var(--color-ink-500)]' : 'text-white/70';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0" tone={markTone} />
      <div className="flex flex-col leading-none">
        <span className={`font-display text-[15px] font-extrabold tracking-tight ${textColor}`}>
          ACHIEVERS HUB
        </span>
        {showTagline && (
          <span className={`text-[9px] font-semibold tracking-[0.16em] ${taglineColor} ${taglineClassName}`}>
            {tagline}
          </span>
        )}
      </div>
    </div>
  );
}
