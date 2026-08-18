import {
  BookOpen,
  Calculator,
  NotebookTabs,
  Pencil,
  Ruler,
} from 'lucide-react';

type StudyBackdropProps = {
  variant?: 'brand' | 'feature' | 'dark';
  className?: string;
};

const variantClasses = {
  brand: 'text-[var(--color-primary-500)] opacity-[0.075]',
  feature: 'text-[var(--feature-strong)] opacity-[0.09]',
  dark: 'text-white opacity-[0.055]',
};

export function StudyBackdrop({
  variant = 'brand',
  className = '',
}: StudyBackdropProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    >
      <BookOpen className="absolute -left-5 top-[14%] h-20 w-20 -rotate-12 sm:left-[4%] sm:h-24 sm:w-24" strokeWidth={1.35} />
      <Pencil className="absolute left-[22%] top-[7%] hidden h-14 w-14 rotate-[24deg] sm:block" strokeWidth={1.4} />
      <Calculator className="absolute -right-4 top-[11%] h-20 w-20 rotate-12 sm:right-[5%] sm:h-24 sm:w-24" strokeWidth={1.3} />
      <Ruler className="absolute bottom-[9%] left-[9%] h-20 w-20 rotate-[18deg] sm:h-24 sm:w-24" strokeWidth={1.3} />
      <NotebookTabs className="absolute bottom-[6%] right-[12%] h-20 w-20 -rotate-12 sm:h-24 sm:w-24" strokeWidth={1.3} />
      <Pencil className="absolute bottom-[28%] right-[35%] hidden h-12 w-12 -rotate-[28deg] lg:block" strokeWidth={1.4} />
    </div>
  );
}
