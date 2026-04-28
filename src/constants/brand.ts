export const BRAND = {
  purple: '#9970A6',
  purpleDark: '#7A5489',
  purpleLight: '#C4A8D0',
  purpleFaint: '#F5EFF8',
  orange: '#EA8F4F',
  orangeLight: '#F5C49A',
  orangeFaint: '#FEF6EE',
  green: '#7E9045',
  greenLight: '#B5C47A',
  greenFaint: '#F2F5E8',
  // Client palette
  g400: '#639922',
  g600: '#3B6D11',
  t400: '#1D9E75',
  t600: '#0F6E56',
  amber400: '#BA7517',
  coral400: '#D85A30',
  charcoal: '#1C1C2E',
  offWhite: '#FDFCF8',
} as const;

export const ROLES = [
  {
    key: 'student',
    label: 'Student',
    emoji: '🎓',
    tagline: 'Know exactly what to revise, every single day.',
    color: '#639922',
    faint: '#EAF3DE',
    path: '/student',
  },
  {
    key: 'parent',
    label: 'Parent',
    emoji: '👨‍👩‍👧',
    tagline: 'See exactly how your child is progressing.',
    color: '#BA7517',
    faint: '#FAEEDA',
    path: '/parent',
  },
  {
    key: 'tutor',
    label: 'Tutor',
    emoji: '📚',
    tagline: 'Walk into every session knowing exactly where to focus.',
    color: '#9970A6',
    faint: '#F5EFF8',
    path: '/tutor',
  },
] as const;

export const PATHWAYS = [
  { name: 'Entry', grades: '1–3',  color: '#C4A8D0', bg: '#F5EFF8' },
  { name: 'Foundation', grades: '3–5',  color: '#9970A6', bg: '#EDE0F4' },
  { name: 'Foundation Plus', grades: '4–6', color: '#BA7517', bg: '#FAEEDA' },
  { name: 'Higher', grades: '6–7',  color: '#639922', bg: '#EAF3DE' },
  { name: 'Higher Plus', grades: '8–9', color: '#0F6E56', bg: '#E1F5EE' },
] as const;
