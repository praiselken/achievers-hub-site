# Client Feedback — Round 2 (received 9 Aug 2026)

The client replied point-by-point to [CLIENT_FEEDBACK_REVIEW.md](CLIENT_FEEDBACK_REVIEW.md). This doc records what's now decided, what to build, what's still open, and the draft reply.

---

## 1. Decisions now locked (no further client input needed)

### Think. Speak. Grow. — full spec delivered ✅
The biggest item. The client rejected free-text journaling on safeguarding grounds (no monitoring/auditing burden) and supplied a complete developer spec:

- **No free-text input anywhere.** Structured, pre-set options only.
- **Flow:** Daily 5 completed → results → optional TSG card ("Take one minute to reflect" / "Not now") → Think → Speak → Grow → completion screen.
- **Frequency:** max once per day, always optional, never streak/pressure-based, re-accessible from dashboard if dismissed, no penalty for skipping.
- **Think:** one prompt (personalised variants based on session data: improved score, repeated error, hint used, stretch question), 5 standard single-select responses (kept trying / used a hint or asked for help / became frustrated / stopped and came back / not sure what to do).
- **Speak:** fixed constructive statement mapped 1:1 to the Think choice. "Say it aloud, whisper it or read it silently." Buttons: "Take this thought with me" / Back.
- **Grow:** 8 action options (worked example, ask Archi, accessible question, retry incorrect, add to revision plan, Quick Lesson, ask tutor, come back tomorrow), one system-recommended with a **Suggested** label, each routing to a real destination in the app. Button: "Save my next step."
- **Completion:** "Reflection complete… Your next step: [action]" → "Do this now" / "Return to dashboard". After the action is done: "You followed through on today's next step."
- **Dashboard card states:** before Daily 5 → "Complete today's Daily 5"; after Daily 5 → TSG prompt; after reflection → "Today's growth action"; after action → "You followed through."
- **My Growth Journey:** private student view of reflections completed, actions selected/completed, topics revisited, retries after feedback, useful-help asks, strategy changes, past Speak statements.
- **Privacy:** student sees everything of theirs; parent sees usage/broad insights/common actions/completion only (never exact Think choices or statements); tutor sees academic signals, support-relevant topics, tutor-related actions only. Required copy: "Your exact choices stay private…" and "Think. Speak. Grow. is a learning reflection. It is not monitored as a support or emergency service."
- Client will still refine the Speak prompt wording/mappings — build with the spec's copy as v1.

### AI tutor name standardised: **Archi** ✅
Note the spelling — the spec uses both "Archi" and one "Archie" in the sidebar screenshot; the client explicitly standardises on **Archi**. Rename everywhere (nav, TSG routing, homepage copy).

### Diagnostic removal / grading ✅
- Progress must **not** shift on a single wrong answer — it's pattern-based over time (accuracy, repeated errors, hint use, independent retries, performance across similar questions).
- A single wrong answer **may** influence the next Daily 5 (same-skill question or more accessible variant) but never the displayed progress/working level.
- **Student-facing UI shows only:** current working grade, target grade, topic-level progress, recommended next steps.
- The five pathway tiers (Numeracy / Foundation / Foundation Plus / Higher / Higher Plus) stay **internal only** for question selection — never shown alongside GCSE grades.

### Homepage direction ✅
- Follow **Maths Genie** (mathsgenie.co.uk): hero that names the visitor's problem and how Achievers Hub solves it; short, clear, direct language; product shown in use (live demo) rather than described.
- Illustration style from **Dr Frost** (drfrost.org) — illustration-led, but with Achievers Hub's own brand identity. The client already made Archi in this style.
- Demo videos: real ones wait until the platform's built, but we can build the demo *slots* now with placeholder/screen-recorded content of current features. (Confirm this in the reply — they asked.)

### QLA / marking assets ✅
- Google Drive folder shared: mark schemes, examiners' reports, past papers, grade boundaries — https://drive.google.com/drive/folders/15ZfPj4EJarwZPtlHM3VzjaJ74_b8yAPr
- Maths QLA done; Economics QLA not yet done.

---

## 2. Still open — needs our reply (draft in §4)

| Item | Client's question | Our answer |
|---|---|---|
| Logo | Are the Canva files enough? Should they make a white-text version? | Yes to both — Canva files work; ask them to export a transparent PNG/SVG of the current logo **and** a white-text variant for dark backgrounds. Two-variant switching is the standard solution; no third option needed. |
| AI marking cost | "How much will the ongoing AI usage cost?" | Answered with estimate below (§3). |
| Lesson-style format | Can it use existing content? Do they need to write lesson scripts? What format? | Existing content covers the *explanation* layer; we need a light per-lesson structure from them (see reply for the exact template). No video scripts needed. |
| Topic walkthroughs | "Not sure what you mean here?" | This was our label for one of *their* earlier asks (workbook-style topics with real-life illustrations). Clarify it's the same build as the lesson format — fold the two items together and drop the separate line. |

Still outstanding from round 1 (not addressed in this reply): Stripe account, Terms of Service / Privacy Policy content, trust-section stats, testimonials, founder bios, FAQ content, study-card reference design.

## 3. AI marking — running cost estimate (for the reply)

Assumptions: model = Claude Sonnet-tier (right quality/cost balance for marking against a mark scheme); per marked question ≈ 3–4K input tokens (question + mark scheme extract + student answer) and ~500 output tokens (marks + per-point feedback).

- **Per question:** ~1.5–2p
- **Per full past paper** (~25 questions): ~£0.30–£0.50
- **Per student per month** (2 full papers + daily practice marking): roughly **£1.50–£3**
- **100 active students:** roughly **£150–£300/month**, scaling linearly with usage

Levers that cut this 50–80% if needed: batch (non-instant) marking is half price; a smaller model for short/numeric answers with the bigger model reserved for extended writing (mainly Economics); caching the mark scheme across students marking the same paper. Maths auto-marking of numeric answers needs no AI at all — AI spend concentrates on method marks and written answers.

Recommendation to client: usage-based cost, so tie it to pricing — at £9.99–£17.99/month per student, even the upper estimate is ~15–20% of revenue per active student, and realistically much less.

## 4. Draft reply to client

> **Logo** — The Canva files are perfect, thanks. Yes please to a second version with white text — that's exactly the right solution. If you can export both versions as transparent PNGs (and SVG if Canva offers it for your plan), we'll switch between them automatically depending on the background.
>
> **AI marking cost** — It's usage-based. Rough numbers: about 1.5–2p per marked question, so ~30–50p for a full past paper, or roughly £1.50–£3 per active student per month with regular use. At 100 active students that's in the £150–£300/month range, and there are several ways we can roughly halve that (overnight batch marking, cheaper handling of short numeric answers — most Maths marking doesn't need AI at all, it's the written/method answers where it earns its keep). Thanks for the Drive folder — that's exactly what we need to start scoping.
>
> **Lesson-style format** — We can build it from existing content plus a light structure from you per lesson. No video scripts needed. For each lesson we'd want: (1) learning objective, (2) the explanation broken into 3–6 short steps, (3) 1–2 worked examples with the working shown step by step, (4) 2–3 practice questions from easiest to hardest, (5) the common mistake students make. A Google Doc or spreadsheet per topic in that shape is all we need — we'll handle turning it into the interactive lesson.
>
> **Topic walkthroughs** — Apologies for the confusion, that was our shorthand for something you'd mentioned earlier (structuring topics like a workbook page with real-life illustrations). It's the same build as the lesson-style format above, so we've merged the two — nothing extra needed from you beyond the illustration style, which you've already answered with the Dr Frost reference.
>
> **Think. Speak. Grow.** — This spec is excellent and we agree completely on avoiding free text — structured options remove the safeguarding burden entirely. We'll build v1 to this spec, and slot in your refined Speak prompts/mappings whenever they're ready (they're isolated copy, so swapping them later is trivial). One name check: we'll standardise on **Archi** everywhere as you said.
>
> **Homepage** — Understood: Maths Genie's directness and in-use demos, Dr Frost's illustration style, Achievers Hub's own brand. On demo videos: yes, final videos need the finished platform, but we don't have to wait — we'll build the demo sections now using screen recordings of the features as they're completed, and swap in polished versions at the end. So the homepage can go ahead.
>
> **Diagnostic/grades** — Agreed on all points: pattern-based progress (never a single-answer shift), single wrong answers only influencing the next Daily 5's question selection, and students seeing only working grade / target grade / topic progress / next steps. The five tiers stay behind the scenes for question selection.

## 5. Build backlog (priority order)

1. ~~**Homepage rebuild**~~ — **done 2026-08-18.** The client sent their own redesign as two GitHub zips rather than references, so it was ported rather than designed from scratch (see §6).
2. ~~**Archi rename**~~ — **done** across the marketing site as part of the port.
3. **Grade selector + tier hiding** — smallest remaining item, fully specified. Replace visible pathway tiers with working grade / target grade; keep tiers internal; make progress pattern-based. *(Dashboard-side; the redesign only covers the public site.)*
4. **Think. Speak. Grow. v1** — fully specified. Needs: TSG tables (reflections, selected actions, completion), post-Daily-5 trigger, 3-step flow, dashboard card states, Growth Journey view, parent/tutor filtered views, action routing into existing tabs.
5. **Lesson-style format / walkthroughs** — build the lesson renderer once the client sends the first structured lesson doc (template given in reply).
6. **AI marking (Phase 1: typed answers)** — scope after client confirms cost is acceptable; assets are in the Drive folder; start with Maths (QLA done).

## 6. Redesign port — what landed (2026-08-18)

The client supplied the redesign as two zip exports of a **Next.js** project. Our app is **Vite + React Router**, so it was ported by hand, not merged.

**Ported:** design tokens (purple `#5e3a6e` / amber `#f2861a` / olive palette, Inter type scale, feature tints, shadows, motion), the full homepage (hero with Archi, problem statement, how-it-works, Assessment Planner + Spec Mapper, learning loop, dark feature band, subjects, role tabs, credibility, pricing, FAQ, final CTA), the new nav with dropdown menus, the four-column dark footer, the pricing page with the tutor comparison table, and ~30 content-driven pages (features, subjects, students/parents/tutors, how-it-works, about, contact, FAQ, and the legal/trust set).

**Deliberate deviations from the zips:**
- `Archie` → `Archi` throughout, per the client's own instruction (the zips are inconsistent).
- Dropped two `hidden aria-hidden` dead blocks the zips carried in the homepage and pricing page.
- Dashboards were left untouched — the new tokens are scoped to a `.mkt` class so the two design languages coexist.
- Old `/student`, `/parent`, `/tutor` pages now redirect to the redesign's `/students`, `/parents`, `/tutors`. Their source files are still on disk, unreferenced — say the word and they can be deleted.

**Still blocked on the client:** logo exports (transparent + white-text variant) for the header and footer, Stripe, Terms/Privacy copy, real trust stats, testimonials, founder bios.

## 7. Dashboard port — what landed (2026-08-18)

The client sent a 22-second screen recording (WhatsApp, 26 July) of their dashboard prototype. It turned out to be a recording of the **same prototype the site zips came from**, so the dashboard was ported from that source rather than rebuilt from video frames.

**Ported:** the shell — dark gradient sidebar with the client's nav order and labels, the user card with level and progress, and the topbar (welcome line, search, notifications, help, avatar) — plus the Daily 5 screen: "Today's focus" header with timer, five question chips that tick off as you go, question card with skill/topic/marks badges and Flag for review, the Question tools rail (hint, working space, calculator, formula sheet), the dark "Why this question?" panel, green/amber feedback cards, and the dark results screen with per-topic evidence.

**Key decision — design ported, data kept.** The client's prototype Daily 5 is a self-contained demo: five hardcoded questions with client-side answer checking. Ours loads real questions from Supabase and writes sessions, XP, streaks and achievements. Swapping in their component would have traded working functionality for a mock, so the layout was applied to our existing data flow instead. Our reveal-then-self-mark flow is preserved; the only behavioural change is that self-marking no longer auto-advances — it shows the feedback card first, then "Next question", matching the prototype's rhythm.

**Two places where the video contradicts the client's own written spec.** The video is from 26 July; the written feedback arrived 9 August, so the newer instruction was followed in both cases:
1. **"Numeracy pathway" badge.** The prototype shows the pathway tier to the student. The written spec says the five tiers stay internal and must never appear alongside GCSE grades. Our badges use the selection reason instead — "At your level", "Weak topic focus", "Stretch" — which conveys the same intent without exposing the tier. **Worth confirming with the client.**
2. **"Ask Archie" in the sidebar.** The written feedback standardises on **Archi**. Ours says "Ask Archi" throughout.

**Other deviations, all flagged:**
- Three nav items in the client's design have no page built yet — Think. Speak. Grow., Ask Archi, and Resources. They appear in the sidebar dimmed and non-clickable rather than linking to a 404.
- **Achievements** was added to the nav. It isn't in the client's design, but it's a built feature and the level shown in their own user card depends on it.
- The subject toggle (Maths/Economics) sits in the topbar rather than the Daily 5 header. Our Practice, Progress and Past Papers tabs all read the same global subject, so it needs to be reachable everywhere; on mobile it drops to its own row.
- Routes stay at `/dashboard/*` rather than the prototype's top-level `/daily-5`, `/practice` etc., so existing auth and links keep working.

**Not ported — no design supplied.** The video only covers Daily 5. Dashboard home, Practice, Progress, Past papers, Think. Speak. Grow., Ask Archi and Resources still use our existing designs. If the client wants those matched too, the prototype source for several of them is in the zips (`TopicHubExperience`, `ThinkSpeakGrowExperience`, `LearningToolPages`) and can be ported the same way.
