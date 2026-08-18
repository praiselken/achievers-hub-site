import { Link } from 'react-router-dom';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'accent' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold cursor-pointer transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--color-primary-400)] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl';

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] shadow-[var(--shadow-soft)]',
  accent:
    'bg-[var(--color-accent-400)] text-[var(--color-ink-900)] hover:bg-[var(--color-accent-500)] shadow-[var(--shadow-soft)]',
  outline:
    'border border-[var(--color-ink-900)]/15 text-[var(--color-ink-900)] hover:bg-[var(--color-primary-50)] hover:border-[var(--color-primary-200)]',
  ghost: 'text-[var(--color-ink-700)] hover:bg-[var(--color-primary-50)]',
};

const sizes: Record<Size, string> = {
  sm: 'text-sm px-4 py-2 min-h-[40px]',
  md: 'text-[15px] px-5 py-2.5 min-h-[44px]',
  lg: 'text-base px-7 py-3.5 min-h-[52px]',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
};

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'primary', size = 'md', children, className = '' } = props;
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if ('href' in props && props.href) {
    return (
      <Link to={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { variant: _variant, size: _size, children: _children, className: _className, href: _href, ...rest } =
    props as ButtonAsButton;
  void _variant; void _size; void _children; void _className; void _href;

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
