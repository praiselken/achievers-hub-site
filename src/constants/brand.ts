export const BRAND = {
  // Core palette — brightened brand colours
  g400: '#78B828',
  g600: '#4A8A14',
  t400: '#22B885',
  t600: '#138563',
  coral400: '#D85A30',
  charcoal: '#1C1C2E',
  offWhite: '#FDFCF8',
} as const;

export const ROLES = [
  {
    key: 'student',
    label: 'Student',
    tagline: 'Know exactly what to revise, every single day.',
    color: '#78B828',
    faint: '#EDF5E2',
    path: '/student',
  },
  {
    key: 'parent',
    label: 'Parent',
    tagline: 'See exactly how your child is progressing.',
    color: '#22B885',
    faint: '#E0F6EE',
    path: '/parent',
  },
  {
    key: 'tutor',
    label: 'Tutor',
    tagline: 'Walk into every session knowing exactly where to focus.',
    color: '#4A8A14',
    faint: '#EDF5E2',
    path: '/tutor',
  },
] as const;

export const PATHWAYS = [
  { name: 'Numeracy', grades: '1–3',  color: '#C4A8D0', bg: '#F5EFF8' },
  { name: 'Foundation', grades: '3–5',  color: '#9970A6', bg: '#EDE0F4' },
  { name: 'Foundation Plus', grades: '4–6', color: '#BA7517', bg: '#FAEEDA' },
  { name: 'Higher', grades: '6–7',  color: '#639922', bg: '#EAF3DE' },
  { name: 'Higher Plus', grades: '8–9', color: '#0F6E56', bg: '#E1F5EE' },
] as const;
