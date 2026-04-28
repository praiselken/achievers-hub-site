# The Achievers Hub UK — Stage 3 v2

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS v3 + React Router v6 + Supabase (ready)

## Setup

```bash
npm install
cp .env.example .env   # add Supabase creds (optional for demo)
npm run dev            # http://localhost:5173
```

## Routes
| Path | Page |
|---|---|
| `/` | Home — role selector + pricing |
| `/student` | Student landing + Daily 5 demo + study card |
| `/parent` | Parent landing + dashboard mock |
| `/tutor` | Tutor landing + student data card |
| `/signup` | Sign-up placeholder |

## Structure
```
src/
├── index.css              # Tailwind + CSS variables + scroll reveal + flip card + carousel
├── constants/brand.ts     # Brand colours, roles, pathways
├── lib/
│   ├── supabase.ts        # Supabase client (graceful no-op without env)
│   └── useScrollReveal.ts # IntersectionObserver hook
├── components/
│   ├── Nav.tsx            # Sticky nav with mobile burger
│   ├── Footer.tsx
│   ├── InfinityCarousel.tsx  # Auto-scrolling feature cards
│   └── StudyCard.tsx      # Flip card — front (study) + back (practice Q)
└── pages/
    ├── HomePage.tsx
    ├── StudentPage.tsx    # Includes Daily 5 demo + StudyCard
    ├── ParentPage.tsx
    ├── TutorPage.tsx
    └── SignUpPage.tsx
```

## Key features in this build
- **Fraunces + DM Sans** typography (matching client HTML reference)
- **Infinity carousel** — auto-scrolling feature cards, pauses on hover
- **StudyCard** — flip animation, front = key concepts + exam tip, back = practice question + reveal answer
- **Daily 5 demo** — live interactive section on student page
- **Scroll reveal** — all sections animate in on scroll via IntersectionObserver
- **Gradient mesh** backgrounds — per role (green/student, amber/parent, purple/tutor)
- **Role-specific colour** themes throughout
- **Mobile-first** — responsive at all breakpoints, mobile burger nav
- **Supabase ready** — client wired, just needs .env

*Praisel.dev · April 2026*
