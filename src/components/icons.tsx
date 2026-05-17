interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}

const base = {
  viewBox: '0 0 20 20',
  fill: 'none' as const,
  stroke: 'currentColor' as const,
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconTarget({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <circle cx="10" cy="10" r="8"/>
      <circle cx="10" cy="10" r="4"/>
      <circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export function IconCalendar({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <rect x="2" y="3" width="16" height="15" rx="2"/>
      <path d="M14 1v4M6 1v4M2 8h16"/>
      <circle cx="7" cy="13" r=".75" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="13" r=".75" fill="currentColor" stroke="none"/>
      <circle cx="13" cy="13" r=".75" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export function IconBooks({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M3 2h6v16H3zM11 4h6v14h-6z"/>
      <path d="M3 6h6M3 10h6M3 14h6"/>
    </svg>
  );
}

export function IconDocument({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M12 2H5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V8z"/>
      <polyline points="12 2 12 8 18 8"/>
      <line x1="7" y1="13" x2="13" y2="13"/>
      <line x1="7" y1="16" x2="10" y2="16"/>
    </svg>
  );
}

export function IconMap({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <polygon points="1,5 1,17 7,14 13,17 19,14 19,2 13,5 7,2"/>
      <line x1="7" y1="2" x2="7" y2="14"/>
      <line x1="13" y1="5" x2="13" y2="17"/>
    </svg>
  );
}

export function IconSparkle({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M10 1l2.06 5.27L18 7.64l-4 3.9.94 5.5L10 14.6l-4.94 2.54.94-5.5-4-3.9 5.94-.37z"/>
    </svg>
  );
}

export function IconPeople({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M13 17v-1.5a3.5 3.5 0 00-3.5-3.5h-4A3.5 3.5 0 002 15.5V17"/>
      <circle cx="7.5" cy="7" r="3"/>
      <path d="M18 17v-1.5a3.5 3.5 0 00-2-3.18"/>
      <path d="M13 4a3 3 0 010 5.66"/>
    </svg>
  );
}

export function IconBarChart({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <line x1="2" y1="18" x2="18" y2="18"/>
      <rect x="3" y="10" width="3.5" height="8" rx="0.5"/>
      <rect x="8.25" y="5" width="3.5" height="13" rx="0.5"/>
      <rect x="13.5" y="8" width="3.5" height="10" rx="0.5"/>
    </svg>
  );
}

export function IconFlame({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M10 2c0 0-4 5-4 9a4 4 0 008 0c0-2-.8-3.5-1.8-5-.4 1.5-1.2 2.5-1.7 3C10 7 10 4.5 10 2z"/>
    </svg>
  );
}

export function IconLineChart({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <polyline points="2,15 6,9.5 10,12.5 14,6 18,9"/>
      <line x1="2" y1="18" x2="18" y2="18"/>
    </svg>
  );
}

export function IconAlertCircle({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <circle cx="10" cy="10" r="8"/>
      <line x1="10" y1="7" x2="10" y2="10.5"/>
      <circle cx="10" cy="13.5" r=".75" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export function IconLayers({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <polygon points="10,2 19,7 10,12 1,7"/>
      <polyline points="1,12 10,17 19,12"/>
      <polyline points="1,9.5 10,14.5 19,9.5"/>
    </svg>
  );
}

export function IconTrendDown({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <polyline points="2,5 8,11 11.5,7.5 18,15"/>
      <polyline points="13,15 18,15 18,10"/>
    </svg>
  );
}

export function IconEye({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M1 10S4 4 10 4s9 6 9 6-3 6-9 6-9-6-9-6z"/>
      <circle cx="10" cy="10" r="2.5"/>
    </svg>
  );
}

export function IconLink({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M8 12a4 4 0 006.57.87l2-2a4 4 0 00-5.66-5.66l-1.15 1.15"/>
      <path d="M12 8a4 4 0 00-6.57-.87l-2 2a4 4 0 005.66 5.66L10.24 13.7"/>
    </svg>
  );
}

export function IconNote({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M13 2H7a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2z"/>
      <path d="M7 8h6M7 11h6M7 14h4"/>
      <path d="M8 2v3h4V2"/>
    </svg>
  );
}

export function IconGift({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <rect x="2" y="8" width="16" height="10" rx="1"/>
      <path d="M18 8H2V5a1 1 0 011-1h14a1 1 0 011 1v3z"/>
      <path d="M10 4c0 0-2-3.5 0-3.5S12 4 10 4c0 0-2-3.5 0-3.5"/>
      <line x1="10" y1="4" x2="10" y2="18"/>
    </svg>
  );
}

export function IconGradCap({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <polygon points="10,3 19,8 10,13 1,8"/>
      <path d="M5.5 10.5V15a7.5 3.5 0 009 0v-4.5"/>
      <line x1="18.5" y1="8" x2="18.5" y2="12"/>
    </svg>
  );
}

export function IconLightbulb({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <path d="M8.5 17h3M9 14.5h2M10 3a5 5 0 015 5c0 2.5-1.5 3.8-2 5H7c-.5-1.2-2-2.5-2-5a5 5 0 015-5z"/>
    </svg>
  );
}

export function IconUser({ className = 'w-5 h-5', style }: IconProps) {
  return (
    <svg {...base} className={className} style={style}>
      <circle cx="10" cy="7" r="3.5"/>
      <path d="M2 18a8 8 0 0116 0"/>
    </svg>
  );
}
