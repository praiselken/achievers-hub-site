# Client Feedback — Round 3 (31 Aug to 4 Sept 2026)

The client reviewed the admin panel, raised six points, and the round ran on
for four days through her build decisions document (received 3 Sept). This
records what was raised, what turned out to be true, what she decided, and what
is still open.

Previous rounds: [round 1](CLIENT_FEEDBACK_REVIEW.md) · [round 2](CLIENT_FEEDBACK_ROUND2.md) · [handoff](HANDOFF.md)

---

## 0. Corrections to the first version of this document

Two claims in the original round-3 analysis were wrong and were sent to the
client before being checked. Both are corrected below and in the client-facing
document. Recording them here so the mistake is not repeated.

**"The marks were written to demonstrate the product."** True of the five demo
questions in `src/lib/demoData.ts`. Wrong about the question bank. The
Economics marks came from the *Marks available* column in the client's own
files. The Maths marks are missing because the importer discarded them, not
because nobody wrote them.

**"The questions on the platform are samples, so replace them."** They are not
samples. They came from the client's Daily 5 workbooks. The decision that asked
whether to replace them was withdrawn.

**The cause of both:** the seed scripts in `scripts/` were never read before
making a claim about where the content came from. `demoData.ts` and the admin
form were taken as evidence of the whole bank.

---

## 1. What actually happened to the question bank

This was the client's sharpest challenge and she was substantially right.

**Her Daily 5 workbooks were imported.** `scripts/seed-questions.mjs` reads them
and is what populates `questions`. Not invented content.

**The Maths importer discards most of the tagging.** It hardcodes
`marks: null`, `difficulty: null`, `skill_type: null`, and reads only day,
question number, QID, topic, question, answer, step-by-step solution, hints,
calculator flag and asset notes. Any grade, grade-range, difficulty or subtopic
columns in her Maths workbooks were read straight past.

**Tier survived, into a dead column.** Maths `pathway` is parsed from her folder
names (Numeracy, Foundation, Foundation Plus, Higher, Higher Plus) into
`questions.pathway`, which nothing in the app reads.

**Economics is different.** That importer does read `Difficulty`, `Skill type`,
`Marks available` and `Exam board alignment`.

**There is a second corpus that was never imported at all.** The Drive holds
`Maths / Question Bank` with ten topic folders (Algebra, Algebra 2, Geometry and
Measure, ×2, Number ×2, Probability and Statistics ×2, Ratio and Proportion ×2),
uploaded 1 Sept, containing one `.xlsx` per subtopic with sheets *Question Bank*,
*Assets Needed* and *Mapping Notes*. This is a completely different shape from
the monthly Daily 5 workbooks the importer understands, so it needs a new
importer. **Economics / Question Bank is still empty** as of 4 Sept, though the
client believes AQA Paper 1 is in it. Economics QLA shows activity on 2 Sept.

**The client has never seen her own question bank.** `/demo` runs on five
hardcoded questions, and the real bank is behind a suspended database. Every
review she has done was of demo content. That single fact explains most of the
round.

**The Drive folder is link-shared, not shared to the developer's account,** so
it is not in their Drive and cannot be searched. She has agreed to share it by
email.

---

## 2. Her decisions

Answered and settled:

| Ref | Decision |
|---|---|
| A1 | Foundation, Higher, Crossover. Crossover is for questions suitable for either tier. |
| **B1** | **Tier is derived from grade, not tagged.** Grades 1–5 Foundation, 5 and above Higher, so grade 5 is the overlap. Questions are ranked by difficulty within grade. |
| A4 | Command words: Analyse, Apply, Assess, Calculate, Define, Describe, Discuss, Draw, Evaluate, Explain. |
| A5 | Economics skills: Retrieval → Understanding → Application → Analysis → Evaluation. AO1 = Retrieval/Understanding, AO2 = Application, AO3 = Analysis/Evaluation. |
| C2, C4 | Practice questions are recorded correct or incorrect with methods and hints. Only exam-style questions carry marks, taken from the paper and QLA, with the mark scheme explaining how they are awarded. **No per-question marking points are authored.** |
| D1 | Default Daily 5 stays, for free users and for new users until there is enough evidence. Maths: 2 at level, 1 weak topic, 1 retrieval, 1 stretch, shuffled. Economics: multiple choice → definition → calculate → data or diagram → explain the chain. Economics content gated by Spec Mapper coverage. |
| D2 | Weak is below 60% over the most recent 5, with at least 3 attempts. Early warning on 2 of the last 3. Bands: 80%+ secure, 60–79 developing, below 60 weak. Measured at topic plus skill. |
| D3 | Incorrect → 1 day → 3 → 7 → 14 → 30. Shorten on a further mistake. Prefer a different question on the same skill. |
| D4 | Stretch one grade above, capped at target. Foundation stays in Foundation until secure around grade 5 with a Higher target. Student-reported, estimated and target grades kept separate. |
| D6 | Correct → 7 days → 14 → 30 → 45–60. |
| D7 | Never relaxed: subject, covered content, tier. Then ideal → same topic and skill → same topic → another due topic → default Daily 5. |
| D8 | Remove the on-screen labels; keep the categories in the selection rules. |
| F1, F3 | Agreed as proposed. |
| F2 | Yes to searching users by email. |

She also answered E1 with the **student** topic statuses — Not Started 0,
In Progress 1–4, Covered 5+ at 60%, Secure 80% recent with successful spaced
retrieval — which is a different question from the one asked but is a decision
worth having, and is implemented.

Content decisions: no fake testimonials, use real founder credentials (5+ years
teaching, 9+ tutoring, 3+ examining). Logo resolved. Study cards are generated
from her spreadsheet, so correcting their output is a content change on her side.

---

## 3. New scope she introduced

None of this was in the decisions document. It is good scope, and it is scope.

- Topic Hub redesign, Maths Genie meets Dr Frost, four icons per topic row
  (Mini Lesson, Knowledge Card, Practice, Exam Questions)
- Report a Question, with admin flagging and five reason codes
- Topic status model with colours across Spec Mapper, topic list and progress
- **Adaptive estimated working grade**, recalculated from performance
- Spec Mapper gating which content a student can be served
- Full spaced-retrieval scheduling
- Quick Lesson structures for both subjects, with end-of-lesson actions
- **Build the Chain** as an interactive fill-the-gap with fading scaffolding

The adaptive working grade and the retrieval engine are each a real piece of
work. Both need the database.

---

## 4. Still open

- **Worked Example and Your Turn:** merge into one stepped example, or keep
  separate? Left blank in her document.
- **C1:** whether the bank holds adapted and original questions alongside board
  ones, each labelled. She answered a different question under that number.
- **E1 as asked:** how many questions per topic, tier and grade band before the
  bank counts as stocked. She has twice answered with student progress instead.
- **E2:** which gaps to fill first. She asked for a voice note; one was sent.
- **The difficulty column:** she says questions are "ranked in order of
  difficulty", which may mean Easy/Medium/Hard or a positional rank. Resolvable
  by opening one workbook once the Drive is shared by email.
- **Economics Question Bank:** still empty.
- **FAQ questions:** owed to her, not by her.

---

## 5. Blockers

**Supabase is still suspended (HTTP 402, storage quota) as of 4 Sept.** The
client has created an account in her name and sent an invite, but the project
has not moved and the suspension is unlifted. Until it does: no migrations, no
import, no real data, nothing testable beyond demo mode.

Migrations `0001` (privilege escalation — must run before signups open), `0002`
(grades out of localStorage) and `0003` (subscriptions) all remain unrun.

**Still outstanding in code:** the admin form writes `month` as a number while
the schema stores a month name and Daily 5 queries by name, so questions added
through the admin panel never reach a student.

---

## 6. Built during this round

- `04b7644` — Daily 5 checks answers instead of revealing them. Student enters
  an answer; right gets the reasoning, wrong gets a hint and a second attempt,
  wrong twice opens the working. Long written answers fall back to marking
  against the model answer. Also removes the D8 labels. Answer checking lives in
  `src/lib/answerCheck.ts` and folds lookalike characters, because mark schemes
  carry a real minus sign and `10x - 15` was failing against `10x − 15`.
- `6a7ff7a` — the Daily 5 selection engine in `src/lib/daily5/`, implementing
  section D as pure logic with no database dependency, plus vitest and 28 tests.

---

## 7. What to do next

1. **Chase the Supabase transfer.** Nothing else unlocks without it.
2. Build what needs no data: Topic Hub four-icon layout, topic status colours,
   admin user detail view, Report a Question.
3. Write the migrations now so they run the moment the database moves.
4. Write the Question Bank importer once the workbook columns can be seen.
5. Fix the month bug.
6. Settle the four open items in §4.

**Two constants in the engine need her confirmation:** how many attempts before
personalisation takes over (currently 20), and whether the working-grade
estimate should count attempts pitched away from the student's level (currently
within one grade).
