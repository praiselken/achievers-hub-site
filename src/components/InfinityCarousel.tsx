interface CarouselItem {
  emoji: string;
  title: string;
  sub: string;
  color: string;
  bg: string;
}

const ITEMS: CarouselItem[] = [
  { emoji: '🎯', title: 'Personalised Diagnostic', sub: 'Know exactly where you stand', color: '#639922', bg: '#EAF3DE' },
  { emoji: '📅', title: 'Daily 5 Questions', sub: '15 minutes. Every day.', color: '#0F6E56', bg: '#E1F5EE' },
  { emoji: '📚', title: 'Topic Hub', sub: 'Videos, cards & practice', color: '#9970A6', bg: '#F5EFF8' },
  { emoji: '📄', title: 'Past Paper Hub', sub: 'Score, diagnose, improve', color: '#BA7517', bg: '#FAEEDA' },
  { emoji: '🗺️', title: 'Spec Mapper', sub: 'Track your full coverage', color: '#1D9E75', bg: '#E1F5EE' },
  { emoji: '🧠', title: 'Mindset Prompts', sub: 'Build belief alongside skills', color: '#534AB7', bg: '#EEEDFE' },
  { emoji: '👨‍👩‍👧', title: 'Parent Dashboard', sub: 'Real visibility, every week', color: '#D85A30', bg: '#FAECE7' },
  { emoji: '📊', title: 'Tutor Data', sub: 'Walk in prepared', color: '#3B6D11', bg: '#EAF3DE' },
  { emoji: '🔥', title: 'Streak Tracking', sub: 'Build the revision habit', color: '#BA7517', bg: '#FAEEDA' },
  { emoji: '📈', title: 'Progress Charts', sub: 'See improvement over time', color: '#639922', bg: '#EAF3DE' },
];

// Duplicate for seamless loop
const ALL = [...ITEMS, ...ITEMS];

export default function InfinityCarousel() {
  return (
    <div className="overflow-hidden w-full py-2">
      <div className="carousel-track gap-4" style={{ paddingLeft: '1rem' }}>
        {ALL.map((item, i) => (
          <div key={i}
            className="flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-2xl border border-white/60 hover-lift cursor-default"
            style={{ background: item.bg, minWidth: '220px' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                 style={{ background: 'white' }}>
              {item.emoji}
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
