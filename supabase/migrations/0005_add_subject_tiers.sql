-- Not every GCSE is tiered.
--
-- Maths is: a student sits Foundation (grades 1-5) or Higher (4-9), so the tier
-- on a past paper tells them which one is theirs. Economics is not tiered at
-- all - there is one paper and everyone sits it.
--
-- The uploader assumes a tier for every paper. scripts/upload-papers.mjs reads
-- it from the folder name and falls back to 'foundation' when the name does not
-- say 'higher', so all ten economics papers were stored as 'foundation'. The
-- dashboard then renders anything that is not 'higher' as a "Foundation" badge,
-- so every economics paper carried a label that asserts something untrue about
-- the qualification - and a student could reasonably read it as being put on a
-- lower tier, or as a Higher paper being withheld.
--
-- `past_papers.paper_type` is deliberately NOT changed here. It is part of that
-- table's unique key and it is embedded in the storage path of every uploaded
-- PDF (paper-1-foundation-qp.pdf), so rewriting it would orphan 614 files. What
-- changes is whether a tier is shown, and the titles that spell it out.

alter table public.subjects
  add column if not exists tiered boolean not null default false;

comment on column public.subjects.tiered is
  'Whether this GCSE is split into Foundation and Higher tiers. Controls whether a tier is shown against a past paper.';

update public.subjects set tiered = true  where slug = 'maths';
update public.subjects set tiered = false where slug = 'economics';

-- "AQA Economics 2020 November — Paper 1 Foundation" -> "… — Paper 1".
-- Anchored to the end so a subject that legitimately contains the word
-- somewhere in its title is left alone.
update public.past_papers p
   set title = regexp_replace(p.title, '\s+(Foundation|Higher)$', '')
  from public.subjects s
 where s.slug = p.subject
   and s.tiered = false
   and p.title ~ '\s+(Foundation|Higher)$';
