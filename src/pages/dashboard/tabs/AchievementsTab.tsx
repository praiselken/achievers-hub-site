import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { checkAndAwardAchievements, type Achievement } from '../../../lib/xp';

interface Metrics {
  streak_days: number;
  daily5_count: number;
  topics_covered: number;
  papers_logged: number;
  paper_avg_score: number;
}

const DEFAULT_METRICS: Metrics = {
  streak_days: 0, daily5_count: 0, topics_covered: 0, papers_logged: 0, paper_avg_score: 0,
};

export default function AchievementsTab() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<Record<string, string>>({});
  const [metrics, setMetrics] = useState<Metrics>(DEFAULT_METRICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) { setLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      await checkAndAwardAchievements(user.id);

      const [catalogRes, unlockedRes, streakRes, daily5Res, topicsRes, papersRes] = await Promise.all([
        supabase.from('achievements').select('*').order('sort_order'),
        supabase.from('user_achievements').select('achievement_slug, unlocked_at').eq('user_id', user.id),
        supabase.from('streaks').select('current_streak').eq('user_id', user.id).single(),
        supabase.from('daily_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('topic_progress').select('status').eq('user_id', user.id).eq('status', 'covered'),
        supabase.from('past_paper_logs').select('score, max_score').eq('user_id', user.id),
      ]);

      setAchievements((catalogRes.data ?? []) as Achievement[]);
      const unlockedMap: Record<string, string> = {};
      for (const row of unlockedRes.data ?? []) unlockedMap[row.achievement_slug] = row.unlocked_at;
      setUnlocked(unlockedMap);

      const paperScores = papersRes.data ?? [];
      setMetrics({
        streak_days: streakRes.data?.current_streak ?? 0,
        daily5_count: daily5Res.count ?? 0,
        topics_covered: topicsRes.data?.length ?? 0,
        papers_logged: paperScores.length,
        paper_avg_score: paperScores.length
          ? Math.round(paperScores.reduce((a, s) => a + (s.score / s.max_score) * 100, 0) / paperScores.length)
          : 0,
      });
      setLoading(false);
    }
    load();
  }, []);

  const unlockedCount = Object.keys(unlocked).length;

  if (loading) {
    return <p className="font-body text-sm text-gray-400 text-center py-12">Loading achievements…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Achievements</h1>
        <p className="font-body text-sm text-gray-500 mt-0.5">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {achievements.map(a => {
          const isUnlocked = !!unlocked[a.slug];
          const current = metrics[a.criteria_type as keyof Metrics] ?? 0;
          const pct = Math.min(100, Math.round((current / a.criteria_value) * 100));

          return (
            <div key={a.slug}
              className="bg-white rounded-2xl p-5 border flex items-start gap-4"
              style={{
                borderColor: isUnlocked ? '#C8E49A' : '#e5e7eb',
                boxShadow: '0 2px 8px rgba(28,28,46,0.05)',
                opacity: isUnlocked ? 1 : 0.7,
              }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                   style={{ background: isUnlocked ? '#EAF3DE' : '#f3f4f6', filter: isUnlocked ? 'none' : 'grayscale(1)' }}>
                {a.icon ?? '🏅'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-body font-bold text-gray-900 text-sm">{a.name}</span>
                  {isUnlocked && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#EAF3DE', color: '#4A8A14' }}>
                      Unlocked
                    </span>
                  )}
                  {a.xp_reward > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--purple-faint)', color: 'var(--purple-dark)' }}>
                      +{a.xp_reward} XP
                    </span>
                  )}
                </div>
                <p className="font-body text-xs text-gray-400 mb-2">{a.description}</p>
                {!isUnlocked && (
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--purple)' }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
