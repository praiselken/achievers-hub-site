import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { isDemoMode } from './demoMode';

export interface SubjectRow {
  slug: string;
  name: string;
  icon: string | null;
  color: string | null;
  exam_boards: string[] | null;
  active: boolean;
  coming_soon: boolean;
  sort_order: number;
  /** Split into Foundation and Higher tiers. Maths is; Economics is not. */
  tiered: boolean;
}

const FALLBACK_SUBJECTS: SubjectRow[] = [
  { slug: 'maths', name: 'GCSE Maths', icon: '📐', color: '#9970A6', exam_boards: null, active: true, coming_soon: false, sort_order: 1, tiered: true },
  { slug: 'economics', name: 'GCSE Economics', icon: '📊', color: '#639922', exam_boards: null, active: true, coming_soon: false, sort_order: 2, tiered: false },
];

export function useSubjects() {
  const [subjects, setSubjects] = useState<SubjectRow[]>(FALLBACK_SUBJECTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!supabase || isDemoMode()) { setLoading(false); return; }
      const { data } = await supabase
        .from('subjects')
        .select('slug, name, icon, color, exam_boards, active, coming_soon, sort_order, tiered')
        .order('sort_order', { ascending: true });
      if (!cancelled && data && data.length > 0) setSubjects(data as SubjectRow[]);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return {
    subjects,
    activeSubjects: subjects.filter(s => s.active),
    loading,
  };
}
