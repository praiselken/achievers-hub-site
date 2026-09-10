# Moving Supabase onto the client's account

Written 7 September 2026. Supersedes section 1 of `HANDOFF.md`.

The short version: there is nothing left to migrate *from*. The old free-tier
project no longer exists, so this is a rebuild onto the client's paid project,
not a copy. Everything needed for that rebuild is in this repository or on the
development machine, and the steps are below.

---

## 1. What happened to the old project

On 29 August the project was restricted but alive — it answered requests with
HTTP 402 and the message `exceed_storage_size_quota`. It is now gone entirely:

```
tylqvznkuoywcouyiadc.supabase.co  →  NXDOMAIN
```

Checked against the local resolver, 8.8.8.8 and 1.1.1.1 — all three agree the
hostname no longer exists. A merely restricted or paused project still resolves
and returns an error; DNS being withdrawn means the project has been
decommissioned. Free-tier projects that sit over quota are paused and eventually
deleted, which is consistent with the timeline.

**Consequence: no `pg_dump`, no data export, no storage download.** Anything that
existed only inside that project is not recoverable, by us or by Supabase
support, on a free plan.

### What was actually lost

| Thing | Lost? | Why it doesn't matter much |
|---|---|---|
| Schema (tables, RLS, policies) | No | All of it is in this repo — see section 3 |
| Topics, questions, mindset prompts | Recoverable | Re-seeded from the client's Excel files, still on disk |
| Past paper PDFs | Recoverable | 614 PDFs, 612 MB, still in `~/Downloads` |
| Auth users | **Yes, gone** | All were test accounts — the platform never launched |
| Student progress, streaks, XP | **Yes, gone** | Test data belonging to those same test accounts |

Nothing belonging to a real student was lost, because no real student ever had an
account. This is the cheapest possible moment for this to have happened.

### Worth saying to the client plainly

The storage quota is what killed it: 612 MB of past papers against a 1 GB free
limit, with mark schemes still to come. That was always going to happen on a free
plan, and it is the reason the account needed to be theirs and paid. It is now
both. On Supabase Pro the same content uses well under 1% of the included
storage, so the failure mode does not recur.

---

## 2. Before you start

Two things are the client's to do, and both should be theirs in name:

- **The project must live in the client's own Supabase organisation**, not in a
  developer account with the client added. They are the data controller for
  information about under-18s; the account holder should be the controller.
- **Choose the London region** (`eu-west-2`) when creating the project. UK
  student data, UK company. Region cannot be changed after creation without
  rebuilding, so it is worth getting right on the first go.

You will need, from **Project Settings → API**:

- Project URL
- `anon` public key
- `service_role` key — treat as a password, never commit it, never prefix `VITE_`

---

## 3. Create the schema

One file does the whole thing:

```
supabase/bootstrap.sql
```

Paste it into **SQL Editor → New query → Run**. It is idempotent, so a re-run is
harmless if something needs repeating.

It replaces running the five `supabase-*-setup.sql` files and the four
`supabase/migrations/*.sql` files by hand, in dependency order, and corrects
three things that the old file-by-file order got wrong. Each is marked `FIX` in
the file:

**FIX 1 — the first admin could never have been created.** `supabase-setup.sql`
gave `profiles.role` an inline check allowing only student/parent/tutor.
Migration `0001` added a second constraint that also allows `admin` — but adding
a constraint does not remove the first one, and a row must satisfy both. The
documented step "promote the first admin in SQL" would have failed with a
constraint violation. The legacy constraint is now dropped before the new one is
added.

**FIX 2 — the role-security migration would not have secured anything.** This is
the important one. `supabase-setup.sql` created three permissive policies
(`Users can view / insert / update own profile`). Migration `0001` added tighter
replacements but never dropped the originals. PostgreSQL combines permissive
policies with **OR**, so a row passes if *any* policy allows it. The old insert
policy checked only `auth.uid() = id` with no constraint on `role`, and the old
update policy had no `WITH CHECK` at all. Both would have survived `0001` and
continued to permit exactly the self-promotion to `admin` that `0001` was written
to stop. The originals are now dropped before the tight policies are created.

Worth being clear about what this means: had the migration been run as originally
written, it would have reported success and closed nothing. The vulnerability
described in `HANDOFF.md` — sign up, then set your own role to `admin` via the
REST API — would still have been open on launch day.

**FIX 3 — `tutor_bookings` never existed.** `ParentBookingsTab.tsx` queries it,
but no setup file or migration ever created it. The component discards the query
error, so the Parent → Bookings tab silently showed "no bookings" forever instead
of failing. The table is now defined to match the `Booking` interface that
component reads, with RLS letting a linked parent read their child's bookings.

### Not carried over

`scripts/seed-spec-mappings.mjs` writes to a `spec_mappings` table that has never
been defined in any SQL file, and nothing in `src/` or `netlify/` reads it. It is
an orphan from an abandoned approach. It is deliberately **not** in
`bootstrap.sql` — running that script will fail, and that is the correct outcome
until someone decides whether the feature is wanted. Don't add the table just to
make the script run.

---

## 4. Re-seed the content

All source files are still on the development machine. Point the scripts at the
new project with environment variables — the hardcoded project URL has been
removed from all five of them, so they now refuse to run rather than silently
targeting the wrong database.

```bash
export VITE_SUPABASE_URL="https://<new-project-ref>.supabase.co"
export SUPABASE_SERVICE_KEY="<the service_role key>"
```

Note the name: the seed scripts read `SUPABASE_SERVICE_KEY`, while the Netlify
functions read `SUPABASE_SERVICE_ROLE_KEY`. Same secret, two names, because they
were written months apart. Set both when in doubt.

`seed-topics`, `seed-questions` and `upload-papers` all take `--dryrun`, which
parses and reports without writing. Use it first each time. `seed-mindset` does
not — it writes on the only run it has.

```bash
# Topics — the study cards
node scripts/seed-topics.mjs --dir "$HOME/Downloads/Study Card Maths"     --subject maths
node scripts/seed-topics.mjs --dir "$HOME/Downloads/Study Card Economics" --subject economics

# Questions — the Daily 5 (60 Maths workbooks, 22 Economics)
node scripts/seed-questions.mjs --dir "$HOME/Downloads/Daily 5 Maths"     --subject maths
node scripts/seed-questions.mjs --dir "$HOME/Downloads/Daily 5 Economics" --subject economics

# Mindset prompts — Think, Speak & Grow
node scripts/seed-mindset.mjs
```

`seed-mindset.mjs` still has the path to `Think, Speak & Grow.xlsx` hardcoded at
line 35. It works on this machine and nowhere else; worth a `--dir` flag if
anyone else ever needs to run it.

Past papers last, because it is 612 MB over the network and the slowest step by
far:

```bash
# Maths — AQA, Edexcel and OCR, 591 PDFs
node scripts/upload-papers.mjs --dir "$HOME/Downloads/Past Papers"   --subject maths

# Economics — AQA only, 23 PDFs, in a separate folder despite the name
node scripts/upload-papers.mjs --dir "$HOME/Downloads/Past Papers 2" --subject economics
```

`Past Papers 2` is not a duplicate or a second attempt — it is the Economics
papers, 2020–2024. `Study Card` and `Study Card Maths`, on the other hand, are
byte-identical duplicates of each other; use either, and seeding both is
harmless because every script upserts.

`upload-papers.mjs` puts question papers, mark schemes and examiner reports all
into the single `past-papers` bucket, pathed by type. `bootstrap.sql` creates
that bucket, plus `mark-schemes` and `examiner-reports`, which nothing currently
writes to.

---

## 5. Point the app at the new project

**Local** — `.env`:

```
VITE_SUPABASE_URL=https://<new-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<the anon key>
```

**Netlify** — Site configuration → Environment variables:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | the project URL |
| `VITE_SUPABASE_ANON_KEY` | the anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | the service_role key — **secret** |

The functions reuse `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` when the
unprefixed forms are absent, so those two need setting only once.

Leave the Stripe variables alone for now. Payments stay dark until the client's
Stripe account exists and the Subscription Terms have had a legal read — see
`docs/PAYMENTS.md`.

---

## 6. Auth settings on the new project

None of this carries over from a bootstrap file; it is dashboard configuration.

- **Authentication → URL Configuration** — set Site URL to the Netlify address
  and add `http://localhost:5173` plus `http://localhost:8888` (for
  `npx netlify dev`) as redirect URLs. Sign-in fails in a way that looks like a
  code bug if this is missed.
- **Authentication → Providers** — Google needs reconfiguring against the new
  project's callback URL. Microsoft needs a free Azure app registration. Apple
  needs the paid Apple Developer Program membership, $99/year, which is the
  client's call and not a blocker for testing.
- **Email confirmations** — decide deliberately. On is right for real students;
  off makes the test round much faster. If left on, the default Supabase SMTP is
  rate-limited to a handful of emails an hour, which is easy to mistake for a
  broken signup flow.

---

## 7. First admin

Chicken and egg: the admin panel can promote people, but only an admin can reach
it. Sign up through the app as a student, find the row in
**Authentication → Users**, then:

```sql
update public.profiles set role = 'admin' where id = '<the user uuid>';
```

The SQL editor runs as the service role and is not subject to the policies, so
this works where a browser deliberately cannot. After this, the admin panel's
Users tab handles everyone else.

This is also the step that FIX 1 above unblocks — worth confirming it succeeds
rather than assuming.

---

## 8. Check it actually works

In rough order, stopping at the first failure:

1. `npm run dev`, load the site — no `[Supabase] Missing env vars` in the console.
2. Sign up as a student. A row appears in `profiles` with `role = 'student'`.
3. **Try to sign up as an admin.** In devtools, set
   `localStorage.pending_role = 'admin'` before submitting. The insert must be
   rejected. If it succeeds, stop — FIX 2 has not taken effect and nothing else
   matters.
4. Promote yourself to admin via SQL (section 7). `/admin` becomes reachable.
5. Daily 5 loads questions; the Topic Hub loads topics; Past Papers lists papers
   and a PDF opens.
6. Sign up a second account as a parent, link it to the student with an invite
   code, and confirm the parent sees the child's grades — and **cannot** see any
   other student's.
7. Report a question from Daily 5; it appears in the admin panel's queue.
8. `/demo` still works end to end, including the payment walkthrough.

Step 3 and step 6 are the two that matter. The rest is feature testing; those two
are whether the database is safe to put real children's data in.

---

## 9. Still outstanding after this

- **RLS beyond `profiles` is asserted, not proven.** The policies read correctly
  and step 6 spot-checks the parent path, but nobody has systematically tried to
  read another account's rows on every table. Worth an hour before launch.
- **The mark schemes Drive folder** still has not been loaded. Storage headroom
  is no longer a reason to delay it.
- **Delivery date was 31 August** and has passed. The database being gone rather
  than merely switched off is a material change to what was blocking, and is
  worth putting in writing to the client alongside a new date.
