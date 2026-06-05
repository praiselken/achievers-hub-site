const REVIEWS = [
  {
    name: 'Abdul Rafay',
    location: 'GB',
    stars: 5,
    title: 'AchieversHub = thumbs up',
    body: "It's a really easy way to revise for GCSEs with detailed videos and multiple past papers. I definitely recommend.",
    role: 'Student',
  },
  {
    name: 'Sarah M.',
    location: 'GB',
    stars: 5,
    title: "My daughter's grades improved fast",
    body: 'Within 3 weeks of using this platform her confidence shot up. The parent dashboard keeps me in the loop without hovering over her.',
    role: 'Parent',
  },
  {
    name: 'James T.',
    location: 'GB',
    stars: 5,
    title: 'Best revision tool I have used',
    body: 'The daily 5 questions keep me consistent. I went from a grade 4 to a grade 7 in Maths in one term.',
    role: 'Student',
  },
  {
    name: 'Mrs. Okafor',
    location: 'GB',
    stars: 5,
    title: 'Saves me hours of prep',
    body: 'The tutor data view is brilliant. I walk into every session knowing exactly what each student needs to work on.',
    role: 'Tutor',
  },
  {
    name: 'Priya K.',
    location: 'GB',
    stars: 5,
    title: 'Finally something that sticks',
    body: 'I tried loads of revision apps but none of them kept me going. The streak tracking on this one is genuinely motivating.',
    role: 'Student',
  },
  {
    name: 'David H.',
    location: 'GB',
    stars: 5,
    title: 'Real visibility as a parent',
    body: 'I can actually see what topics my son has covered and where the gaps are. No more guessing.',
    role: 'Parent',
  },
  {
    name: 'Amara J.',
    location: 'GB',
    stars: 5,
    title: 'Passed all my mocks',
    body: "The spec mapper helped me realise I'd barely touched half the topics. Sorted it out in time for mocks and passed everything.",
    role: 'Student',
  },
  {
    name: 'Mr. Singh',
    location: 'GB',
    stars: 5,
    title: 'Excellent for my tutoring practice',
    body: 'My students are more prepared and more confident when they arrive. The platform does a lot of the groundwork for me.',
    role: 'Tutor',
  },
];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  Student: { bg: '#EAF3DE', color: '#4A8A14' },
  Parent:  { bg: '#FAEEDA', color: '#BA7517' },
  Tutor:   { bg: '#EEEDFE', color: '#534AB7' },
};

function StarRow({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: typeof REVIEWS[0] }) {
  const c = ROLE_COLORS[r.role] ?? ROLE_COLORS['Student'];
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col gap-2"
         style={{ boxShadow: '0 2px 12px rgba(28,28,46,0.06)' }}>
      <div className="flex items-center justify-between">
        <span className="font-body font-semibold text-sm text-gray-900">{r.name}</span>
        <span className="text-xs text-gray-400">{r.location}</span>
      </div>
      <StarRow n={r.stars} />
      <p className="font-body font-semibold text-sm" style={{ color: c.color }}>{r.title}</p>
      <p className="font-body text-xs text-gray-500 leading-relaxed">{r.body}</p>
      <span className="self-start text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: c.bg, color: c.color }}>{r.role}</span>
    </div>
  );
}

const ALL = [...REVIEWS, ...REVIEWS];

export default function ReviewsCarousel() {
  return (
    <div className="overflow-hidden h-full w-full relative">
      {/* fade top */}
      <div className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none"
           style={{ background: 'linear-gradient(to bottom, #f0fdf4, transparent)' }} />
      {/* fade bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none"
           style={{ background: 'linear-gradient(to top, #f0fdf4, transparent)' }} />

      <div className="reviews-track flex flex-col gap-4 px-1">
        {ALL.map((r, i) => (
          <ReviewCard key={i} r={r} />
        ))}
      </div>
    </div>
  );
}
