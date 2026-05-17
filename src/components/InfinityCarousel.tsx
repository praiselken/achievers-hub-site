import {
  IconTarget,
  IconCalendar,
  IconBooks,
  IconDocument,
  IconMap,
  IconSparkle,
  IconPeople,
  IconBarChart,
  IconFlame,
  IconLineChart,
} from './icons';

interface CarouselItem {
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  sub: string;
  color: string;
  bg: string;
}

const ITEMS: CarouselItem[] = [
  { Icon: IconTarget,    title: 'Personalised Diagnostic', sub: 'Know exactly where you stand',  color: '#78B828', bg: '#EDF5E2' },
  { Icon: IconCalendar,  title: 'Daily 5 Questions',       sub: '15 minutes. Every day.',         color: '#138563', bg: '#E0F6EE' },
  { Icon: IconBooks,     title: 'Topic Hub',               sub: 'Videos, cards & practice',      color: '#4A8A14', bg: '#EDF5E2' },
  { Icon: IconDocument,  title: 'Past Paper Hub',          sub: 'Score, diagnose, improve',       color: '#138563', bg: '#E0F6EE' },
  { Icon: IconMap,       title: 'Spec Mapper',             sub: 'Track your full coverage',       color: '#22B885', bg: '#E0F6EE' },
  { Icon: IconSparkle,   title: 'Mindset Prompts',         sub: 'Build belief alongside skills',  color: '#4A8A14', bg: '#EDF5E2' },
  { Icon: IconPeople,    title: 'Parent Dashboard',        sub: 'Real visibility, every week',    color: '#D85A30', bg: '#FAECE7' },
  { Icon: IconBarChart,  title: 'Tutor Data',              sub: 'Walk in prepared',               color: '#4A8A14', bg: '#EDF5E2' },
  { Icon: IconFlame,     title: 'Streak Tracking',         sub: 'Build the revision habit',       color: '#138563', bg: '#E0F6EE' },
  { Icon: IconLineChart, title: 'Progress Charts',         sub: 'See improvement over time',      color: '#78B828', bg: '#EDF5E2' },
];

const ALL = [...ITEMS, ...ITEMS];

export default function InfinityCarousel() {
  return (
    <div className="overflow-hidden w-full py-2">
      <div className="carousel-track gap-4" style={{ paddingLeft: '1rem' }}>
        {ALL.map((item, i) => (
          <div key={i}
            className="flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/60 hover-lift cursor-default"
            style={{ background: item.bg, minWidth: '220px' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: 'white', color: item.color }}>
              <item.Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="font-body font-semibold text-sm text-gray-900">{item.title}</div>
              <div className="font-body text-xs text-gray-500 mt-0.5">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
