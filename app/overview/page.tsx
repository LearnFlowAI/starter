"use client";

import { useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import type { ScoreEntry, SessionEntry, Task } from "../lib/models";
import { useLocalState } from "../lib/storage";
import { defaultTasks } from "../lib/defaults";
import { getTaskType, TASK_CONFIG } from "../lib/ui";
import { MOCK_STATS_DETAILS, MOCK_STATS_SUMMARY } from "../lib/stats";
import { useRouter } from "next/navigation";

type Period = "today" | "yesterday" | "week";

type InterruptionLog = {
  id: string;
  reasonId: string;
  duration: number;
  createdAt: string;
  taskId: string;
  sessionId: string;
};

export default function OverviewPage() {
  const router = useRouter();
  const [tasks, , tasksReady] = useLocalState<Task[]>(
    "lf_tasks",
    defaultTasks
  );
  const [sessions, , sessionsReady] = useLocalState<SessionEntry[]>(
    "lf_sessions",
    []
  );
  const [scores, , scoresReady] = useLocalState<ScoreEntry[]>("lf_scores", []);
  const [interruptions, , interruptionsReady] = useLocalState<
    InterruptionLog[]
  >("lf_interruptions", []);
  const [period, setPeriod] = useState<Period>("today");
  const [showAllDetails, setShowAllDetails] = useState(false);

  const ready =
    tasksReady && sessionsReady && scoresReady && interruptionsReady;

  const todayKey = new Date().toDateString();

  const todaySessions = sessions.filter(
    (session) => new Date(session.endedAt).toDateString() === todayKey
  );

  const todayScores = scores.filter(
    (score) => new Date(score.createdAt).toDateString() === todayKey
  );

  const todayInterruptions = interruptions.filter(
    (entry) => new Date(entry.createdAt).toDateString() === todayKey
  );

  const todayTotalMins = Math.round(
    todaySessions.reduce((sum, session) => sum + session.seconds, 0) / 60
  );

  const todaySummary = {
    hours: Math.floor(todayTotalMins / 60),
    mins: todayTotalMins % 60,
    label: "今日专注"
  };

  const todayDetails = useMemo(() => {
    const minutesByTask = todaySessions.reduce<Record<string, number>>(
      (acc, session) => {
        acc[session.taskId] = (acc[session.taskId] ?? 0) + session.seconds / 60;
        return acc;
      },
      {}
    );
    const pointsByTask = todayScores.reduce<Record<string, number>>(
      (acc, score) => {
        acc[score.taskId] = (acc[score.taskId] ?? 0) + score.points;
        return acc;
      },
      {}
    );
    const interruptionsByTask = todayInterruptions.reduce<Record<string, number>>(
      (acc, entry) => {
        acc[entry.taskId] = (acc[entry.taskId] ?? 0) + 1;
        return acc;
      },
      {}
    );
    return tasks.map((task) => ({
      id: task.id,
      type: getTaskType(task.subject),
      name: task.title,
      duration: `${Math.round(minutesByTask[task.id] ?? 0)}m`,
      interruptions: interruptionsByTask[task.id] ?? 0,
      points: `+${pointsByTask[task.id] ?? 0}`
    }));
  }, [tasks, todaySessions, todayScores, todayInterruptions]);

  if (!ready) {
    return null;
  }

  const currentSummary =
    period === "today" ? todaySummary : MOCK_STATS_SUMMARY[period];
  const rawDetails =
    period === "today" ? todayDetails : MOCK_STATS_DETAILS[period];
  const currentDetails = showAllDetails ? rawDetails : rawDetails.slice(0, 3);
  const totalInterruptions = rawDetails.reduce(
    (sum, item) => sum + item.interruptions,
    0
  );

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-36 dark:bg-background-dark">
      <header className="mb-2 px-6 pt-8">
        <h1 className="text-2xl font-black text-gray-800 dark:text-white">
          数据统计
        </h1>
        <p className="text-sm font-medium text-gray-500">
          查看你的每一次进步与努力。
        </p>
      </header>

      <div className="mb-6 flex justify-center px-6">
        <div className="flex items-center rounded-full border border-gray-50 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-card-dark">
          {(["today", "yesterday", "week"] as const).map((value) => (
            <button type="button"
              key={value}
              onClick={() => {
                setPeriod(value);
                setShowAllDetails(false);
              }}
              className={`rounded-full px-8 py-2.5 text-sm font-bold transition-all ${
                period === value
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-500"
              }`}
            >
              {value === "today" ? "今天" : value === "yesterday" ? "昨天" : "本周"}
            </button>
          ))}
        </div>
      </div>

      <section className="mb-6 flex flex-col items-center px-6">
        <div className="relative flex h-56 w-56 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[14px] border-gray-50 dark:border-gray-800/50" />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "conic-gradient(#FFD54F 0% 30%, #A7F3D0 30% 60%, #30E3CA 60% 100%)",
              mask: "radial-gradient(transparent 65%, black 66%)",
              WebkitMask: "radial-gradient(transparent 65%, black 66%)"
            }}
          />

          <div className="z-10 flex flex-col items-center">
            <div className="flex items-baseline">
              <span className="text-3xl font-black tabular-nums tracking-tighter text-gray-800 dark:text-white">
                {currentSummary.hours}
              </span>
              <span className="ml-0.5 mr-1.5 text-sm font-bold text-gray-400">
                h
              </span>
              <span className="text-3xl font-black tabular-nums tracking-tighter text-gray-800 dark:text-white">
                {currentSummary.mins}
              </span>
              <span className="ml-0.5 text-sm font-bold text-gray-400">m</span>
            </div>
            <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              总时长
            </span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {period === "today"
              ? "今日专注分布"
              : period === "yesterday"
              ? "昨日专注分布"
              : "本周专注分布"}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-gray-400">
            你做得非常棒！
          </p>
        </div>
      </section>

      <section className="mb-8 px-6">
        <button type="button"
          onClick={() => router.push(`/pause-analysis?period=${period}`)}
          className="group flex w-full items-center rounded-[2.2rem] border border-rose-100 bg-rose-50 p-5 shadow-sm transition-all active:scale-[0.98] dark:border-rose-900/20 dark:bg-rose-950/10"
        >
          <div className="flex w-full items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-card dark:bg-gray-800">
              <span className="material-icons-round text-3xl">
                notifications_paused
              </span>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-base font-black text-gray-800 dark:text-white">
                {period === "today"
                  ? "今日"
                  : period === "yesterday"
                  ? "昨日"
                  : "本周"}
                中断分析
              </h3>
              <p className="mt-0.5 text-[11px] font-bold text-gray-400">
                查看影响专注效率的因素
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-2xl font-black tabular-nums text-rose-500">
                  {totalInterruptions}
                </span>
                <span className="ml-1 text-xs font-bold text-gray-400">次</span>
              </div>
              <span className="material-icons-round text-gray-300 transition-colors group-hover:text-primary">
                chevron_right
              </span>
            </div>
          </div>
        </button>
      </section>

      <section className="mb-10 px-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-black tracking-tight text-gray-800 dark:text-white">
            数据明细
          </h3>
          <button type="button"
            onClick={() => setShowAllDetails(!showAllDetails)}
            className="flex items-center text-xs font-bold text-primary"
          >
            {showAllDetails ? "收起明细" : "查看全部"}
            <span
              className={`material-icons-round ml-0.5 text-sm transition-transform duration-300 ${
                showAllDetails ? "rotate-90" : ""
              }`}
            >
              chevron_right
            </span>
          </button>
        </div>

        <div className="rounded-[2.5rem] border border-gray-50 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-card-dark">
          <div className="mb-4 grid grid-cols-4 pl-2 text-[11px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-500">
            <span className="col-span-1">任务</span>
            <span className="text-center">时长</span>
            <span className="text-center">中断</span>
            <span className="pr-4 text-right">积分</span>
          </div>

          <div className="space-y-4">
            {currentDetails.map((item) => {
              const config = TASK_CONFIG[item.type];
              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-4 items-center rounded-2xl p-3 transition-all active:scale-[0.98] ${config.bgColor} cursor-pointer dark:bg-opacity-10`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm dark:bg-gray-800 ${config.color}`}
                    >
                      <span className="material-icons-round text-lg">
                        {config.icon}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-center text-sm font-bold tabular-nums text-gray-400">
                    {item.duration}
                  </div>
                  <div className="text-center text-sm font-bold tabular-nums text-gray-400">
                    {item.interruptions}
                  </div>
                  <div className="pr-2 text-right text-sm font-black tabular-nums text-secondary">
                    {item.points}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <BottomNav />
    </div>
  );
}
