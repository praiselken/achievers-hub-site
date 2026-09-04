/**
 * Daily 5 selection — domain types.
 *
 * The rules here are the client's, set out in her build decisions document
 * (section D). Nothing in this folder talks to Supabase: it takes a student's
 * history and a pool of candidate questions and returns five questions, so it
 * can be reasoned about and tested without a database.
 */

export type Subject = 'maths' | 'economics';

/** Foundation covers grades 1 to 5, Higher covers 5 to 9, so grade 5 sits in
 *  both. That overlap is the Crossover the client defined in A1. */
export type Tier = 'foundation' | 'crossover' | 'higher';

export type Difficulty = 'easy' | 'medium' | 'hard';

/** Where a topic stands for one student. The thresholds are the client's (E1). */
export type TopicStatus = 'not_started' | 'in_progress' | 'covered' | 'secure';

/** How a student is performing on a topic, or a topic and skill pair (D2). */
export type Band = 'weak' | 'developing' | 'secure';

/** The five Economics slots. The client wants the Daily 5 to rehearse the exam
 *  skills in order, rather than mirroring the Maths mix. */
export type EconSlot =
  | 'multiple_choice'
  | 'definition'
  | 'calculate'
  | 'data_or_diagram'
  | 'explain_chain';

/** What each Maths slot is for. Shuffled before display so the student cannot
 *  tell which question is the weak topic and which is the stretch. */
export type MathsSlot = 'at_level' | 'weak_topic' | 'retrieval' | 'stretch';

export type SlotKind = MathsSlot | EconSlot;

export interface Question {
  id: string;
  subject: Subject;
  topicId: string;
  topicTitle?: string | null;
  /** Retrieval, Fluency, Application… for Maths; AO-aligned skills for Economics. */
  skill?: string | null;
  gradeMin: number;
  gradeMax: number;
  difficulty?: Difficulty | null;
  /** Which Economics slot this question can fill. */
  econSlot?: EconSlot | null;
  /** True for the day-indexed questions the client already authored. These are
   *  what free and brand-new students get, and the last fallback for everyone. */
  isDefault?: boolean;
}

export interface Attempt {
  questionId: string;
  topicId: string;
  skill?: string | null;
  correct: boolean;
  /** ISO date, YYYY-MM-DD. */
  on: string;
  /** The grade the question was pitched at, when it is known. The working-grade
   *  estimate needs it, because "accuracy around their current level" means
   *  nothing if stretch questions are counted alongside. */
  grade?: number;
}

export interface Student {
  subject: Subject;
  /** What the platform believes they are working at, which drifts from the
   *  grade they entered as evidence accumulates (D4). */
  workingGrade: number;
  targetGrade: number;
  /** Economics only: the topics they have told the Spec Mapper they have
   *  covered. Undefined means no restriction. */
  coveredTopicIds?: string[];
}

export interface Selection {
  question: Question;
  slot: SlotKind;
  /** Which rung of the fallback chain produced this, so the admin panel can
   *  show why a student got an odd question and coverage gaps are visible. */
  via: FallbackRung;
}

/** D7's fallback order, from an ideal match down to the authored default. */
export type FallbackRung =
  | 'ideal'
  | 'same_topic_skill'
  | 'same_topic'
  | 'other_due_topic'
  | 'default_daily5';

export type Rng = () => number;
