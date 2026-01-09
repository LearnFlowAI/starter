"use client";

import TopNav from "../components/TopNav";
import type { RecordEntry } from "../lib/models";
import { useLocalState } from "../lib/storage";

export default function OverviewPage() {
  const [records, , ready] = useLocalState<RecordEntry[]>("lf_records", []);

  if (!ready) {
    return null;
  }

  const totalMinutes = records.reduce((sum, item) => sum + item.minutes, 0);
  const totalPoints = records.reduce((sum, item) => sum + item.points, 0);
  const completedCount = records.length;

  const trend = [36, 42, 28, 55, 46, 61, 52];

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
            <h2 className="font-display text-2xl text-ink">7 日趋势</h2>
            <span className="text-xs text-ink/60">基础趋势图</span>
          </div>
          <div className="mt-6 space-y-4">
            {trend.map((value, index) => (
              <div key={`${value}-${index}`} className="space-y-2">
                <div className="flex items-center justify-between text-xs text-ink/60">
                  <span>周{index + 1}</span>
                  <span>{value} 分钟</span>
                </div>
                <div className="h-2 rounded-full bg-ink/10">
                  <div
                    className="h-2 rounded-full bg-moss"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-ink/10 bg-ink/5 px-4 py-3 text-sm">
            <p className="text-ink/70">建议：周三与周五表现最佳，可复用同样的学习节奏。</p>
          </div>
        </section>
      </div>
    </main>
  );
}
