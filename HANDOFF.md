# Handoff — Achievers Hub, 11 Sep 2026

Context for picking this up in a new session. Everything below is pushed to
`main` on `github.com/praiselken/achievers-hub-site` and deploying to Netlify
(`achievers-hub-live.netlify.app`). **`main` is the only branch** —
`payments-walkthrough` was fully merged and deleted on 11 Sep.

This replaces the 29 Aug handoff, which described a database that no longer
exists. The old version is in git history.

---

## 0. Orientation

- **What it is:** a GCSE revision platform for students, parents and tutors —
  Maths and Economics. Each role has a marketing page and a dashboard, plus an
  admin panel at `/admin`, gated on `role = 'admin'`.
- **Stack:** React 19, TypeScript, Vite, Tailwind v3, React Router v7, Supabase
  (auth, database, storage), Netlify Functions for payments. `npm run dev` on
  port 5173. Routes live in `src/App.tsx` — treat that as the source of truth.
- **Student sidebar today:** Dashboard, Daily 5, Practice (the Topic Hub),
  Progress, Think. Speak. Grow., Past papers, Achievements. Ask Archi and
  Resources appear greyed out because they are not built.
- **Brand:** `src/constants/brand.ts`. Dashboards use Fraunces and DM Sans; the
  marketing redesign uses Inter under `.mkt` (see §5).
- **GCSE pathways** (Numeracy 1–3, Foundation 3–5, Foundation Plus 4–6, Higher
  6–7, Higher Plus 8–9) drive question selection and are never shown to students.
- **Where the rest lives:** `docs/SUPABASE_MIGRATION.md` is the database and auth
  runbook; `docs/PAYMENTS.md` covers Stripe; `CLIENT_FEEDBACK_*.md` holds the
  client's feedback rounds.
- **Earlier prototypes** (Stage 1, Stage 2, stage 3) are in
  `Projects/Teaching Platform/`. They are history, not the live app.

### Where everything lives

| What | Where | Whose account |
|---|---|---|
| Code | GitHub `praiselken/achievers-hub-site`, branch `main` | Developer |
| Live site | Netlify, `achievers-hub-live.netlify.app`. Builds from `main`, 30–150 s after a push | Developer |
| Database | Supabase project `fkpjoubmmxajbeibrodq` ("My Project"), organisation "Achievers Hub", Pro plan, daily backups | Owner `theachievershubuk@gmail.com`; `praiselken@gmail.com` is Administrator |
| Past paper PDFs | Supabase Storage, bucket `past-papers`, folders `maths/` and `economics/` — 614 files, ~612 MB. The `mark-schemes` and `examiner-reports` buckets exist but are empty; the uploader puts everything in `past-papers` | Client |
| Content sources | This Mac, `~/Downloads` — table below. **Not backed up anywhere else** | — |
| Client's working files | Google Drive, "The Achievers Hub UK". Maths and Economics folders, each with Question Bank, QLA, Past Papers, Study Cards, Daily 5, Spec Tracker and Topic List | Client |
| Payments | Built but switched off — `docs/PAYMENTS.md` | Client's Stripe, not yet opened |

GitHub and Netlify are still in the developer's name. The reasoning that moved
Supabase to the client — she is the data controller and the costs are hers —
applies to both before the project is handed over for good.

**Content sources on this Mac:**

| Folder in `~/Downloads` | Loads into | With |
|---|---|---|
| `Study Card Maths`, `Study Card Economics` | `topics` | `scripts/seed-topics.mjs` |
| `Daily 5 Maths`, `Daily 5 Economics` | `questions` (the Daily 5) | `scripts/seed-questions.mjs` |
| `Question Bank` (maths only) | `question_bank` | `scripts/seed-question-bank.mjs` |
| `Think, Speak & Grow.xlsx` | `mindset_prompts` | `scripts/seed-mindset.mjs` — path hardcoded |
| `Past Papers` (maths), `Past Papers 2` (economics, despite the name) | `past_papers` + Storage | `scripts/upload-papers.mjs` — needs migration 0005 |

The scripts read the target project from the environment and refuse to run
without it. `seed-spec-mappings.mjs` writes to a table that has never existed —
don't run it.

**Environment variables** — names only; never commit a value (§3):

| Variable | Set in | Notes |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Local `.env`, and Netlify for all deploy contexts | Public by design. Baked into the JavaScript at build time, so a change needs a redeploy. The anon key is the one starting `sb_publishable_` |
| `SUPABASE_SERVICE_ROLE_KEY` | Nowhere yet, deliberately | Only the Stripe functions use it, and it bypasses row-level security. Set it on Netlify the day payments go live |
| `SUPABASE_SERVICE_KEY` | Your terminal, only while seeding | The same `sb_secret_…` key under the name the seed scripts read |
| Stripe variables | Not set | `docs/PAYMENTS.md` |

Keys are in Supabase → Project Settings → API Keys.

**Schema:** `supabase/bootstrap.sql` is the source of truth, and
`supabase/migrations/0001`–`0005` are the history — all applied to the live
project. The five `supabase-*-setup.sql` files in the repo root are superseded.
**Don't run them:** run in order, they reopen the role-escalation hole that
`bootstrap.sql` closes.

---

## 1. Where the database stands

**The old Supabase project is gone, not paused.** It was on the developer's own
free account and was suspended on 29 Aug for exceeding the storage quota. By 7 Sep
its hostname returned NXDOMAIN, which means decommissioned. A restricted project
still resolves and returns 402. Nothing real was lost — every account was a test
account, because the platform never launched.

**The rebuild is on the client's own project**, `fkpjoubmmxajbeibrodq`, on the
Pro plan. The region still needs confirming as London.

- **`supabase/bootstrap.sql` is the whole schema** in one idempotent pass. It
  replaces the five `supabase-*-setup.sql` files and migrations 0001–0004. It ran
  on 9 Sep and was verified: 25 tables, 38 policies, 3 storage buckets. The SQL
  editor warns about "destructive operations" on it; that warning comes only from
  the `drop … if exists` lines that make it re-runnable.
- **New schema changes go in two places:** a numbered migration for the live
  database, and `bootstrap.sql` for a fresh rebuild. For a new column,
  `bootstrap.sql` needs an explicit `alter table … add column if not exists`,
  because `create table if not exists` leaves an existing table untouched.
  Migration `0005` (`subjects.tiered`) was applied on 11 Sep.
- **Content was re-seeded on 10 Sep:** 546 topics, 9,135 Daily 5 questions, 366
  mindset prompts, 136 past papers (614 PDFs, ~612 MB), 2 subjects, 7
  achievements. Also 29,136 maths questions from 903 spreadsheets went into
  `question_bank` (see §5).
- **Keys:** the project issues the newer format. The anon key is
  `sb_publishable_…` and the service key is `sb_secret_…`. Both work unchanged in
  `VITE_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`.
- **The content is not backed up.** The client's Excel files and PDF folders
  live in `~/Downloads` and nowhere else. The schema is in the repo; the data is
  not.
- **"0 errors" from a seed script means nothing on its own.** The client's
  workbooks use four column layouts, and the Sep–Dec economics files number
  questions "Q1".."Q5". The original seeder read a single heading, so those rows
  landed on question 0 and overwrote each other. A fifth of the bank was lost
  while the script reported success. It is fixed in `b06b0cc`. **Always reconcile
  row counts against the source.**

---

## 2. Before real students — blocking

The platform holds data about under-18s, so the first two items matter most.

- **Verify the role-escalation fix by trying it.** Signup writes the role from
  `localStorage.pending_role`, which the browser controls. Migration `0001` as
  written would not have closed the hole. PostgreSQL ORs permissive policies
  together, and `0001` never dropped the old unrestricted insert policy. That
  means `role = 'admin'` would still have been accepted while the migration
  appeared to succeed. It is fixed in `bootstrap.sql`. **Don't trust that it
  ran.** Set `localStorage.pending_role = 'admin'`, sign up, and confirm the
  insert is rejected (runbook §8, step 3).
- **Row-level security beyond `profiles` is asserted, not proven.** Before launch,
  try reading another account's rows on every table, especially
  `daily_sessions`, `topic_progress`, `parent_child_links` and `student_grades`.
- **Nobody has signed in to the new project yet.** Checked on 11 Sep: 0 auth
  users, 0 profiles. Sign-up, onboarding and the first admin have never run
  against the live database, so none of the checks above has been possible yet.
  The first admin must be set in SQL (runbook §7). After that, the admin panel's
  Users tab promotes everyone else.
- **Auth settings.** Praise was raised to Administrator on the client's Supabase
  org on 10 Sep, so auth settings are no longer blocked. (A Developer cannot save
  them.)
  - It is **unconfirmed whether Authentication → URL Configuration was saved**.
    If the Site URL is still `http://localhost:3000`, every confirmation link
    points there.
  - **As of 11 Sep, email and Google sign-in are enabled.** Microsoft (`azure`)
    and Apple are still off, although the app shows both buttons. Email
    confirmation is on and signups are open. The default Supabase SMTP sends only
    a handful of emails an hour, which is easy to mistake for a broken signup.
  - **Google — set up 11 Sep, not yet proven end to end.** The OAuth client is
    in the client's own Google Cloud: project "Achievers Hub"
    (`achievers-hub-508217`, organisation `theachievershubuk-org`, signed in as
    `theachievershubuk@gmail.com`). The old client in `papraisel@gmail.com`'s
    Google Cloud points at the dead project and can be deleted. Consent screen
    is External; the Google Auth Platform pages are under `console.cloud.google.com/auth`.
    - **Checked from outside:** Google is on in Supabase; Supabase sends users
      to Google with a Client ID from that project (it starts `514492478755`, the
      project number) and the callback
      `https://fkpjoubmmxajbeibrodq.supabase.co/auth/v1/callback`; and Google
      accepts both and shows its account chooser.
    - **Not yet checked:** the client secret, the return to the live site, and
      the profile being created. All three happen only after a real sign-in, so
      do one with a spare Google account. Landing on `localhost:3000` means URL
      Configuration did not save; a Supabase error about exchanging a code means
      the secret is wrong.
    - **Confirm the app is published.** A new consent screen starts in
      **Testing**, which blocks everyone not on its test-user list. **Publish
      app** stays greyed out until Branding has an app name, support email, home
      page and privacy policy link (`/privacy` on the live site). Audience should
      read "In production".
    - **The client secret is shown once.** It now lives only in Supabase
      (Authentication → Sign In / Providers → Google). If it is lost, use **Add
      secret** on the client in Google Cloud and paste the new one into Supabase.
    - **Google's screen says "to continue to fkpjoubmmxajbeibrodq.supabase.co",**
      not the app's name. That is a decision for the client, parked — see §7.
  - **Microsoft:** needs a free Entra (Azure) app registration. Its client
    secrets expire after at most 24 months, so **record the expiry date**.
  - **Apple:** needs the $99/year Apple Developer Program. It is optional for a
    website, and the decision is the client's.
- **The parent's view of grades is built but has never shown real data.** The
  Progress tab shows the linked child's working and target grade for each
  subject (`ChildGradesCard`, loaded through `loadGradesFor`). The parent
  dashboard has no demo mode, so it could not be viewed without a real parent
  account. Its states are covered only by `ParentProgressTab.test.tsx`. Runbook
  §8 step 6 checks it for real, including the console check that proves a parent
  cannot read any *other* child's grades. The screen alone cannot prove that,
  because it only ever asks for the linked child.

---

## 3. The live site

- **The site has read the client's database since 10 Sep.** The first redeploy
  baked in `b_publishable_…`: the key lost its leading "s" on the way into the
  Netlify field, so every request returned 401 while the site otherwise looked
  fine.
- **Verify a deploy by reading the built bundle**, not the masked values in the
  Netlify UI. Fetch `/assets/index-*.js` and grep it for the project ref and the
  key prefix. The 11 Sep deploy was checked this way, including the tier fix.
- Netlify builds from `main`, so every push to `main` is a production deploy.
- **Never put a real key in `.env.example` or any committed file.** Netlify's
  secrets scanning fails the whole build when it finds one. It did once:
  `0ad097a` removed the real anon key that had been failing every deploy.

---

## 4. What was built since 29 Aug

| Commit | What |
|---|---|
| `b6cb224` | Subscriptions, plus a demo walkthrough of the payment journey (built, switched off — `docs/PAYMENTS.md`) |
| `04b7644` `6a7ff7a` | Daily 5 checks answers instead of revealing them; the selection engine |
| `3c017f9` `0bf2c71` | Admin panel can add a question and open a user |
| `394a6eb` | Students can report a question; reports land in the admin panel |
| `1b2114f` | Topic Hub rebuilt around the client's four resources |
| `c53e0d5` | 3.9 MB of illustrations cut to 188 KB (webp) |
| `ebc9079` | Client feedback round 3 recorded |
| `966e23a` | Database rebuilt onto the client's Supabase account (`bootstrap.sql`) |
| `b06b0cc` | Question seeder stopped silently dropping a fifth of the bank |
| `3b09e15` | `question_bank` — 29,136 maths questions |
| `84efcc9` | Grades moved from `localStorage` to `student_grades` |
| `9048423` `6c47898` | Topic Hub "Exam Questions" wired to the question bank; matcher fixed for punctuation lost from file names |
| `7231c7d` | No tier badge or tier in the title for subjects without tiers (migration `0005`) |

**Built by 29 Aug** (from the previous handoff):

| Commit | What |
|---|---|
| `e5b2951` | Remaining dashboard tabs onto the client's palette |
| `0ad097a` | Removed the real anon key from `.env.example` (see §3) |
| `4c30cea` | Role hardening, error boundary, `RequireRole` on parent/tutor dashboards |
| `8e69ee2` | Missing-profile users go to onboarding rather than being locked out |
| `1389fde` | Login/signup page onto the redesign |
| `b215dcf` | GCSE grade selector + grades on the dashboard |
| `efd8c74` | Microsoft and Apple sign-in buttons alongside Google (Google on since 11 Sep; Microsoft and Apple still off — §2) |
| `292333c` `a82f397` | Admin panel link in the sidebar, incl. demo mode |
| `5d7f644` | Admin panel demo-able and on the brand palette |
| `2097370` `3574039` | One Archi character everywhere; illustrations given real transparency |

Also before 29 Aug: marketing site redesign ported, inline workbook with
ruler/protractor/compass, Think. Speak. Grow. built to the client's spec,
dashboard home rebuilt.

---

## 5. Conventions worth knowing

- **`.mkt` scopes the redesign.** Brand tokens and Inter live under `.mkt` in
  `src/index.css`. Any surface outside `MarketingLayout` must opt in explicitly —
  this is why the login page and admin panel didn't match until they were wrapped.
  Two rules are easy to get wrong:
  - Surface colours are declared as `:where(.mkt)` (zero specificity), so a
    Tailwind `bg-`/`text-` utility on the same element still wins. A plain `.mkt`
    rule silently overrode the dark footer.
  - A marketing page's root element must carry `mkt`, or its `font-display`
    headings fall back to the dashboard's Fraunces.
- **New public pages:** add an entry to `src/lib/publicContent.ts` rather than a
  new component. A catch-all route renders any entry.
- **Demo mode** is a `sessionStorage` flag (`src/lib/demoMode.ts`). `/demo` enters
  it. Every student tab, the admin panel, and the whole payment journey read demo
  data and **write nothing** to Supabase in demo. **The parent dashboard has no
  demo mode.** It needs a real session, so it cannot be shown through `/demo`.
  - The payment journey lives in `src/lib/demoBilling.ts`. `exitDemoMode()`
    clears it so a real sign-in cannot inherit a pretend membership.
  - Grades are the one thing demo keeps in `localStorage`, seeded by
    `enterDemoMode()` and cleared on exit. Nothing lifts a local value into a real
    account on sign-in, because that would import the demo's pretend grades.
  - Demo mode is also the only thing that opens the paid buttons while
    `VITE_PAYMENTS_ENABLED` is unset.
- **Archi** is the AI tutor's name everywhere. The client standardised on it; the
  original zips say "Archie" in places. It has one canonical depiction,
  `archie-book-avatar-v3`. The sprite sheet's `ai` cell is a different robot and
  is deliberately unreachable — `FeatureIllustration` returns the real art before
  the sprite lookup.
- **`netlify.toml` is the source of truth** for the build command, publish
  directory and functions directory. `npm run dev` alone does not serve `/api/*`;
  use `npx netlify dev` when working on payments.
- **Pathway tiers stay internal.** Never show Numeracy/Foundation/… next to a GCSE
  grade. Show the selection reason instead: "At your level", "Weak topic focus"
  or "Stretch". `PATHWAYS` renders only in `StudentPage.tsx`, which is no longer
  routed.
- **GCSE tiers are a separate thing** — Maths has Foundation/Higher, Economics
  has none. `subjects.tiered` decides whether a paper shows a tier.
  `past_papers.paper_type` still reads `foundation` for economics **on purpose**:
  it is part of the unique key and of every PDF's storage path
  (`paper-1-foundation-qp.pdf`), so changing it would orphan the files.
- **`question_bank` is not `questions`.** `questions` is the Daily 5, keyed on
  month, day and number. The bank is organised by topic and has no dates. Filter
  it on `estimated_grade`; its `difficulty` column mixes four vocabularies and is
  unconstrained for that reason.
- **Matching Topic Hub topics to the bank** (`src/lib/questionBank.ts`): the two
  tables spell topics differently. `topics.name` writes "Algebra: changing the
  subject" where the bank writes "Algebra changing the subject". The bank's names
  come from file names, which cannot hold `:` or `/`, so "1:n" became "1n".
  - An ILIKE pattern is a server-side prefilter (a guaranteed superset). A
    punctuation-stripped exact comparison on the client decides.
  - The pattern alone over-matches — it pulls cosine questions into a sine topic
    — and wrong questions are worse than none.
  - Result: 478 of 489 topics show questions, none wrong. The 11 empty topics are
    empty because every one of their questions needs a diagram.
  - **When verifying a matcher, check the reverse direction too** — bank content
    that no topic claims. A ground truth that shares the code's rules shares its
    blind spots; that is how the first check missed 77 questions.
- **Rows flagged `needs_image` / `needs_table` are excluded** from Exam
  Questions, because those diagrams do not exist.
- **The client's prototype screens are demos; ours are wired.** Their Daily 5
  used five hardcoded questions. Ours reads Supabase and writes sessions, XP,
  streaks and achievements. Port a layout onto our data; never swap their
  component in.
- **When the client's video and written feedback disagree, the writing wins.**
  The written feedback is dated 9 Aug; the dashboard video is from 26 Jul.
- **supabase-js column lists must be one unbroken string literal.** A
  concatenation defeats its type-level parser, and rows come back typed as
  `GenericStringError[]`.
- **When asking a non-specialist to run SQL, paste the SQL itself**, not a file
  name. Migration `0005` was "run" twice before it actually ran.

---

## 6. Not built, and why

- **Subscriptions / payments** — **built, switched off.** Stripe hosted Checkout
  and billing portal via Netlify Functions, with the webhook as the only writer of
  entitlement. It stays dark until `VITE_PAYMENTS_ENABLED=true` and the Stripe
  keys are set, because the account is the client's to open. The whole journey is
  walkable today via `/demo`. The seven-day trial is deliberately *not* a Stripe
  trial: the copy promises no card and no automatic charge, so the trial is
  handled in the app and needs no Stripe account. Setup steps and open commercial
  questions are in `docs/PAYMENTS.md`.
- **Mini Lesson** (the Topic Hub's fourth action) — blocked on the client sending
  structured lesson content.
- **447 bank questions in 24 files match no topic**, because the names differ in
  wording ("expanding two bracket" against "expanding two brackets"). This needs
  an alias list that a person approves, not a looser rule: the nearest name to
  "percentages to decimals" is "decimals to percentages", the opposite skill.
- **Economics question bank** — the client hasn't supplied it in usable shape.
  Its Drive folders are board-then-paper rather than topic-area, so `topic_area`
  will need rethinking.
- **Tutor dashboard is orphaned.** `/tutor-dashboard` and its tabs exist, but
  `OnboardingPage.tsx` sends tutors to the student `/dashboard`.
- **Archi (AI tutor), revision plan, Quick Lessons, tutor requests** — four Grow
  actions in Think. Speak. Grow. record the student's intention but have nowhere
  to navigate (`src/lib/tsg.ts`).
- **Parent/tutor filtered views** for Think. Speak. Grow. — the database now
  exists, so these are simply not built.
- **AI marking** — blocked on cost sign-off. Estimate given: ~1.5–2p per marked
  question, £150–£300/month at 100 active students.
- **The mark schemes Drive folder** has not been loaded. Storage is no longer a
  reason to wait.

---

## 7. Client situation

- **The delivery date was 31 August and has passed.** The database being deleted
  rather than switched off changed what was blocking. Put that in writing to the
  client alongside a new date, and pin down what "delivery" covers.
- **Costs are the client's**, and third-party accounts belong in *their* name —
  particularly Supabase, since the client is the data controller for under-18s'
  data under UK GDPR. Hosting their project on a developer-owned plan is not free
  either: each project is billed its own compute. When a new cost appears, flag
  it before it is incurred, and put it to the client as a decision rather than a
  bill. Bundle it with the other running-cost conversations.
- **Admin panel** — the client asked for it specifically. It covers
  add/edit/delete for questions, topics, past papers and mindset prompts, user
  role changes, and the question-report queue.
- **Decision for the client — the name on Google's sign-in screen.** It reads
  "to continue to fkpjoubmmxajbeibrodq.supabase.co". The client would rather it
  said "The Achievers Hub UK". **No setting changes this:** Google shows an
  app's name only after brand verification, and until then shows the domain
  users return to. Getting there takes four steps, each depending on the last:
  1. **A domain of her own**, e.g. `theachievershub.co.uk`, if she has none
     (about £10 a year).
  2. **Supabase's custom domain add-on**, e.g. `auth.theachievershub.co.uk`,
     about $10 a month on her Pro plan. This one can't be skipped: Google
     verifies a brand only if every authorised domain is one you can prove you
     own, and nobody but Supabase can prove `supabase.co`.
  3. **Verify the domain** in Google Search Console, signed in as her.
  4. **Brand verification** in Google Auth Platform → Verification Center, after
     Branding is updated to the new name, links and domain. A few working days
     for email-and-profile access. The logo goes on here — adding one earlier
     triggers verification and blocks publishing.

  Then the Google redirect URI, the Supabase Site URL and redirect URLs, and the
  Netlify site all move to the new domain. The site itself should move too, so
  families see one name in the address bar and on Google. **Parked on 11 Sep** —
  sign-in works as it is. Put it to her alongside the other running costs: does
  she already own a domain, and is she happy to add about $10 a month?
- **Still waiting on the client:**
  - a Stripe account in their name
  - legal review of the drafts (Privacy, Terms, Subscription Terms, Safeguarding,
    AI Use, Accessibility), which are routed and carry a "needs legal review"
    notice
  - real trust stats, testimonials and founder bios
  - lesson content
- **Demo videos:** the agreed plan is to ship the demo slots now with screen
  recordings, and swap in polished versions once the platform is built.
- **Content questions to put to the client:**
  - 10,648 bank questions — over a third — need an image or table that doesn't
    exist. Some are unanswerable without it. This is the largest content gap on
    the project.
  - Bank question text carries the sheet's own numbering ("SF1. Make y the
    subject…"). It reads oddly next to "Question 1 of 40" but was left untouched.
  - Higher Plus June days 7 and 9 each have two Q4s and no Q5 — the same
    standard-form question on both days. The seeder moved the second one to Q5.
  - AQA Maths 2020 November has no mark schemes in the source folder, so six
    papers carry only the question paper and examiner report.
- **Re-confirm with the client** before building either: the prototype shows a
  "Numeracy pathway" badge, which the written spec forbids; and its sidebar says
  "Ask Archie".
- **The two redesign zips are gone** (WhatsApp cleared its cache). If the client
  wants their own layouts for Practice, Progress, Past Papers or Ask Archi, the
  files need re-sending. Their layouts were signed off as "fine" as they are.
- **Two Google identities:** the Drive connector signs in as
  `papraisel@gmail.com`, but Supabase and the browser use `praiselken@gmail.com`.
  Folders the client shares stay invisible to the connector until a shortcut is
  added to My Drive while signed in as papraisel. This keeps costing time and is
  worth settling.

---

## 8. Known rough edges

- The JS bundle is ~935 KB — slow first load on a phone.
- The admin panel is dark by design. It uses the brand palette but does not match
  the light dashboards. That is deliberate, but confirm the client is happy.
- `PastPapersTab.tsx` has a lint error: the subject-filter `useEffect` calls
  `setState` in the effect body. Fixing it changes filter behaviour, so it was
  left alone.
- Git on this machine uses an auto-configured identity
  (`praiselken@Praisels-MacBook-Pro.local`). Set `user.email` if commits should
  carry a real address.
