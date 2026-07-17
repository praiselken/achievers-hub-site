import { supabase } from './supabase';

export interface UserStats {
  xpTotal: number;
  level: number;
}

export interface Achievement {
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  xp_reward: number;
  criteria_type: string;
  criteria_value: number;
  subject: string | null;
  sort_order: number;
}

export function levelForXp(xpTotal: number): number {
  return Math.floor(Math.sqrt(xpTotal / 50)) + 1;
}

export function xpThresholdForLevel(level: number): number {
  return 50 * (level - 1) ** 2;
}

export function levelProgress(xpTotal: number, level: number) {
  const floor = xpThresholdForLevel(level);
  const ceil = xpThresholdForLevel(level + 1);
  const pct = ceil > floor ? Math.round(((xpTotal - floor) / (ceil - floor)) * 100) : 100;
  return { floor, ceil, pct: Math.min(100, Math.max(0, pct)) };
}

/** Insert an XP event (idempotent per user/source/sourceRefId) and roll it into user_stats. */
export async function awardXp(userId: string, source: string, sourceRefId: string | null, amount: number) {
  if (!supabase || amount <= 0) return;

  const { data: inserted } = await supabase
    .from('xp_events')
    .upsert(
      { user_id: userId, source, source_ref_id: sourceRefId, amount },
      { onConflict: 'user_id,source,source_ref_id', ignoreDuplicates: true }
    )
    .select();

  if (!inserted || inserted.length === 0) return; // already awarded for this source/ref

  const { data: stats } = await supabase.from('user_stats').select('xp_total').eq('user_id', userId).single();
  const newTotal = (stats?.xp_total ?? 0) + amount;
  const newLevel = levelForXp(newTotal);
  await supabase.from('user_stats').upsert({
    user_id: userId, xp_total: newTotal, level: newLevel, updated_at: new Date().toISOString(),
  });
}

export async function getUserStats(userId: string): Promise<UserStats> {
  if (!supabase) return { xpTotal: 0, level: 1 };
  const { data } = await supabase.from('user_stats').select('xp_total, level').eq('user_id', userId).single();
  return { xpTotal: data?.xp_total ?? 0, level: data?.level ?? 1 };
}

/** Evaluate the achievement catalog against a user's current stats and unlock+award any newly-met ones. */
export async function checkAndAwardAchievements(userId: string) {
  if (!supabase) return;

  const [catalogRes, unlockedRes, streakRes, daily5Res, topicsRes, papersRes] = await Promise.all([
    supabase.from('achievements').select('*'),
    supabase.from('user_achievements').select('achievement_slug').eq('user_id', userId),
    supabase.from('streaks').select('current_streak').eq('user_id', userId).single(),
    supabase.from('daily_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('topic_progress').select('status').eq('user_id', userId).eq('status', 'covered'),
    supabase.from('past_paper_logs').select('score, max_score').eq('user_id', userId),
  ]);

  const unlockedSlugs = new Set((unlockedRes.data ?? []).map(r => r.achievement_slug));
  const currentStreak = streakRes.data?.current_streak ?? 0;
  const daily5Count = daily5Res.count ?? 0;
  const topicsCovered = topicsRes.data?.length ?? 0;
  const paperScores = papersRes.data ?? [];
  const papersLogged = paperScores.length;
  const paperAvgScore = papersLogged > 0
    ? Math.round(paperScores.reduce((a, s) => a + (s.score / s.max_score) * 100, 0) / papersLogged)
    : 0;

  const metrics: Record<string, number> = {
    streak_days: currentStreak,
    daily5_count: daily5Count,
    topics_covered: topicsCovered,
    papers_logged: papersLogged,
    paper_avg_score: paperAvgScore,
  };

  for (const achievement of (catalogRes.data ?? []) as Achievement[]) {
    if (unlockedSlugs.has(achievement.slug)) continue;
    const metric = metrics[achievement.criteria_type];
    if (metric === undefined || metric < achievement.criteria_value) continue;
    if (achievement.criteria_type === 'paper_avg_score' && papersLogged === 0) continue;

    const { data: unlocked } = await supabase
      .from('user_achievements')
      .upsert(
        { user_id: userId, achievement_slug: achievement.slug },
        { onConflict: 'user_id,achievement_slug', ignoreDuplicates: true }
      )
      .select();

    if (unlocked && unlocked.length > 0 && achievement.xp_reward > 0) {
      await awardXp(userId, 'achievement', achievement.slug, achievement.xp_reward);
    }
  }
}
