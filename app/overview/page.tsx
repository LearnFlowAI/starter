"use client";

import TopNav from "../components/TopNav";
import type {
  RecordEntry,
  ScoreEntry,
  SessionEntry
} from "../lib/models";
import { buildWeeklyTrend, createDailySummaries } from "../lib/daily";
import { useLocalState } from "../lib/storage";

export default function OverviewPage() {
  const [records, , recordsReady] = useLocalState<RecordEntry[]>(
    "lf_records",
    []
  );
  const [sessions, , sessionsReady] = useLocalState<SessionEntry[]>(
    "lf_sessions",
    []
  );
  const [scores, , scoresReady] = useLocalState<ScoreEntry[]>("lf_scores", []);

  if (!recordsReady || !sessionsReady || !scoresReady) {
    return null;
  }

  const totalMinutes = records.reduce((sum, item) => sum + item.minutes, 0);
  const totalPoints = records.reduce((sum, item) => sum + item.points, 0);
  const completedCount = records.length;

  const dailySummaries = createDailySummaries(sessions, scores);
  const trend = buildWeeklyTrend(dailySummaries);
  const labelFormatter = new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric"
  });

  return (
    <main className="grid-overlay min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <TopNav />
        <section className="card rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">今日总览</h2>
            <span className="text-xs text-ink/60">基础汇总</span>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-2xl border border-ink/10 bg-chalk px-3 py-4">
              <p className="text-2xl font-semibold text-moss">{totalMinutes}</p>
              <p className="text-xs text-ink/60">分钟</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-chalk px-3 py-4">
              <p className="text-2xl font-semibold text-plum">{completedCount}</p>
              <p className="text-xs text-ink/60">完成</p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-chalk px-3 py-4">
              <p className="text-2xl font-semibold text-cider">{totalPoints}</p>
              <p className="text-xs text-ink/60">积分</p>
            </div>
          </div>
        </section>
        <section className="card rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">日报</h2>
            <span className="text-xs text-ink/60">近 3 天</span>
          </div>
          {dailySummaries.length === 0 ? (
            <p className="mt-4 text-sm text-ink/60">
              暂无日报数据，完成一次计时后会在这里沉淀。
            </p>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {dailySummaries.slice(0, 3).map((day) => (
                <div
                  key={day.date}
                  className="rounded-2xl border border-ink/10 bg-chalk px-4 py-3 text-sm text-ink/70"
                >
                  <p className="text-base font-semibold text-ink">{day.date}</p>
                  <p className="text-xs text-ink/50">
                    {day.sessionCount} 次计时
                  </p>
                  <p className="mt-2 text-lg font-semibold text-ink">
                    {Math.round(day.totalSeconds / 60)} 分钟
                  </p>
                  <p className="text-xs text-ink/50">{day.totalPoints} 积分</p>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="card rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">7 日趋势</h2>
            <span className="text-xs text-ink/60">基础趋势图</span>
          </div>
          <div className="mt-6 space-y-4">
            {trend.map((point) => {
              const label = labelFormatter.format(new Date(point.date));
              const widthPercent = Math.min(point.minutes * 2, 100);
              return (
                <div
                  key={point.date}
                  className="space-y-2"
                  data-testid={`trend-item-${point.date}`}
                >
                  <div className="flex items-center justify-between text-xs text-ink/60">
                    <span>{label}</span>
                    <span data-testid={`trend-minutes-${point.date}`}>
                      {point.minutes} 分钟
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-ink/10">
                    <div
                      className="h-2 rounded-full bg-moss"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 rounded-2xl border border-ink/10 bg-ink/5 px-4 py-3 text-sm">
            <p className="text-ink/70">
              建议：周三与周五表现最佳，可复用同样的学习节奏。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
