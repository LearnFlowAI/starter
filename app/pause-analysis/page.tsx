"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { useLocalState } from "../lib/storage";

type InterruptionLog = {
  id: string;
  reasonId: string;
  duration: number;
  createdAt: string;
  taskId: string;
  sessionId: string;
};

const REASON_META: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  distraction: { name: "分心", icon: "notifications_off", color: "#FF9EAA" },
  problem: { name: "难题", icon: "psychology", color: "#30E3CA" },
  water: { name: "喝水", icon: "water_drop", color: "#81C3FD" },
  noise: { name: "噪音", icon: "graphic_eq", color: "#C0A3F2" },
  phone: { name: "手机", icon: "smartphone", color: "#A78BFA" },
  other: { name: "其他", icon: "more_horiz", color: "#FFD54F" }
};

const DAY_MS = 24 * 60 * 60 * 1000;

function withinPeriod(date: Date, period: string) {
  const now = new Date();
  if (period === "today") {
    return date.toDateString() === now.toDateString();
  }
  if (period === "yesterday") {
    const yesterday = new Date(now.getTime() - DAY_MS);
    return date.toDateString() === yesterday.toDateString();
  }
  if (period === "week") {
    return now.getTime() - date.getTime() <= 6 * DAY_MS;
  }
  return false;
}

export default function PauseAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = (searchParams.get("period") as
    | "today"
    | "yesterday"
    | "week") ?? "today";
  const [interruptions] = useLocalState<InterruptionLog[]>(
    "lf_interruptions",
    []
  );

  const data = useMemo(() => {
    const summary = interruptions.reduce<
      Record<
        string,
        {
          id: string;
          name: string;
          value: number;
          duration: number;
          icon: string;
          color: string;
        }
      >
    >((acc, entry) => {
      const date = new Date(entry.createdAt);
      if (!withinPeriod(date, period)) {
        return acc;
      }
      const meta = REASON_META[entry.reasonId] ?? REASON_META.other;
      const current = acc[entry.reasonId] ?? {
        id: entry.reasonId,
        name: meta.name,
        value: 0,
        duration: 0,
        icon: meta.icon,
        color: meta.color
      };
      current.value += 1;
      current.duration += Math.max(1, Math.round(entry.duration / 60));
      acc[entry.reasonId] = current;
      return acc;
    }, {});
    return Object.values(summary);
  }, [interruptions, period]);

  const totalCount = data.reduce((sum, item) => sum + item.value, 0);
  const periodLabel = period === "today" ? "今日" : period === "yesterday" ? "昨日" : "本周";

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-20 dark:bg-background-dark">
      <header className="mb-4 flex items-center justify-between px-6 pt-10">
        <button type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all active:scale-90 dark:bg-card-dark"
        >
          <span className="material-icons-round">arrow_back</span>
        </button>
        <h1 className="text-xl font-black text-gray-800 dark:text-white">
          {periodLabel}中断分析
        </h1>
        <div className="h-10 w-10" />
      </header>

      <main className="px-6 pt-4">
        {data.length > 0 ? (
          <>
            <div className="relative mb-10 overflow-hidden rounded-[3rem] border border-gray-50 bg-white p-8 shadow-soft dark:border-gray-800 dark:bg-card-dark">
              <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />
              <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-secondary/5 blur-3xl" />

              <div className="relative flex flex-col items-center">
                <div className="relative flex h-64 w-64 items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        innerRadius={70}
                        outerRadius={95}
                        paddingAngle={0}
                        dataKey="value"
                        animationDuration={1500}
                      >
                        {data.map((entry) => (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={entry.color}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center">
                    <span className="mb-1 text-[10px] font-black uppercase tracking-widest text-primary/60">
                      {periodLabel}总计
                    </span>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-black tabular-nums text-gray-800 dark:text-white">
                        {totalCount}
                      </span>
                      <span className="ml-1 text-sm font-bold text-gray-400">
                        次
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3">
                  {data.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-black text-gray-400">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-10">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight text-gray-800 dark:text-white">
                  详细统计
                </h2>
                <button
                  type="button"
                  className="text-xs font-black tracking-wide text-primary"
                >
                  查看历史
                </button>
              </div>

              <div className="space-y-4">
                {data.map((item) => {
                  const percentage =
                    totalCount > 0
                      ? Math.round((item.value / totalCount) * 100)
                      : 0;
                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-5 rounded-[2.5rem] border border-gray-50 bg-white p-5 shadow-soft transition-all hover:scale-[1.02] dark:border-gray-800 dark:bg-card-dark"
                    >
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-[1.8rem] shadow-sm"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color
                        }}
                      >
                        <span className="material-icons-round text-3xl">
                          {item.icon}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="mb-2.5 flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-black text-gray-800 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="text-[10px] font-bold tracking-wide text-gray-400">
                              {item.value} 次 · 共 {item.duration} 分钟
                            </p>
                          </div>
                          <span className="text-sm font-black tabular-nums text-gray-400">
                            {percentage}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-50 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full transition-all duration-1000 delay-300"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {period === "today" && totalCount > 0 && (
              <section className="flex items-start gap-4 rounded-[2.5rem] border border-teal-100 bg-teal-50 p-6 dark:border-teal-900/30 dark:bg-teal-900/10">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-glow">
                  <span className="material-icons-round text-3xl">
                    lightbulb
                  </span>
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-black text-teal-800 dark:text-teal-400">
                    小贴士
                  </h3>
                  <p className="text-sm font-bold leading-relaxed text-teal-600 dark:text-teal-600/70">
                    今天分心次数偏多，试试把手机放远一点，让注意力更集中。
                  </p>
                </div>
              </section>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-20 text-center">
            <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600">
              analytics
            </span>
            <h2 className="mt-4 text-lg font-bold text-gray-700 dark:text-gray-300">
              暂无中断数据
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              当前选择的时间范围内没有记录到任何中断。
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
