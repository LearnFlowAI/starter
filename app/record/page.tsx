"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  InterruptionLog,
  RecordEntry,
  ScoreEntry,
  SessionEntry,
  Task
} from "../lib/models";
import { defaultTasks } from "../lib/defaults";
import { calculateSessionPoints } from "../lib/scoring";
import { uid, useLocalState } from "../lib/storage";
import EmptyState from "../components/EmptyState";

const REASON_MAP: Record<
  string,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  distraction: {
    label: "分心",
    icon: "notifications_off",
    color: "#FF9EAA",
    bgColor: "bg-rose-50"
  },
  problem: {
    label: "遇到难题",
    icon: "psychology",
    color: "#30E3CA",
    bgColor: "bg-teal-50"
  },
  water: {
    label: "喝水",
    icon: "water_drop",
    color: "#81C3FD",
    bgColor: "bg-blue-50"
  },
  noise: {
    label: "噪音",
    icon: "graphic_eq",
    color: "#C0A3F2",
    bgColor: "bg-purple-50"
  },
  phone: {
    label: "电子产品",
    icon: "smartphone",
    color: "#A78BFA",
    bgColor: "bg-indigo-50"
  },
  other: {
    label: "其他",
    icon: "more_horiz",
    color: "#FFD54F",
    bgColor: "bg-yellow-50"
  }
};

export default function RecordPage() {
  const router = useRouter();
  const [tasks, setTasks, tasksReady] = useLocalState<Task[]>(
    "lf_tasks",
    defaultTasks
  );
  const [sessions, , sessionsReady] = useLocalState<SessionEntry[]>(
    "lf_sessions",
    []
  );
  const [, setScores, scoresReady] = useLocalState<ScoreEntry[]>(
    "lf_scores",
    []
  );
  const [interruptions, , interruptionsReady] = useLocalState<
    InterruptionLog[]
  >(
    "lf_interruptions",
    []
  );
  const [, setRecords, recordsReady] = useLocalState<RecordEntry[]>(
    "lf_records",
    []
  );
  const [completionLevel, setCompletionLevel] = useState<"best" | "good" | "meh">(
    "best"
  );
  const [note, setNote] = useState("");
  const [reviewChecked, setReviewChecked] = useState(false);
  const [fixChecked, setFixChecked] = useState(false);
  const [previewChecked, setPreviewChecked] = useState(false);

  const latestSession = sessions[0];
  const activeTask = useMemo(() => {
    if (!latestSession) {
      return tasks[0];
    }
    return tasks.find((task) => task.id === latestSession.taskId) ?? tasks[0];
  }, [latestSession, tasks]);

  if (
    !tasksReady ||
    !sessionsReady ||
    !scoresReady ||
    !interruptionsReady ||
    !recordsReady
  ) {
    return null;
  }

  if (!activeTask || !latestSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background-light px-6 text-center dark:bg-background-dark">
        <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-soft dark:bg-card-dark">
          <EmptyState
            icon="hourglass_empty"
            title="暂无可结算的专注记录"
            description="完成一次计时后，这里会出现专注总结。"
            actionLabel="返回首页"
            onAction={() => router.push("/dashboard")}
          />
        </div>
      </main>
    );
  }

  const sessionInterruptions = interruptions.filter(
    (entry) => entry.sessionId === latestSession.id
  );

  const reasonStats = sessionInterruptions.reduce<
    Record<string, { count: number; duration: number }>
  >((acc, curr) => {
    if (!acc[curr.reasonId]) {
      acc[curr.reasonId] = { count: 0, duration: 0 };
    }
    acc[curr.reasonId].count += 1;
    acc[curr.reasonId].duration += curr.duration;
    return acc;
  }, {});

  const totalInterruptions = sessionInterruptions.length;
  const actualMins = Math.floor(latestSession.seconds / 60);
  const actualSecs = latestSession.seconds % 60;
  const targetMins = Math.floor(activeTask.plannedMinutes);

  const rating = completionLevel === "best" ? 5 : completionLevel === "good" ? 4 : 3;
  const writingStars =
    completionLevel === "best" ? 3 : completionLevel === "good" ? 2 : 1;

  const calculatedPoints = calculateSessionPoints({
    seconds: latestSession.seconds,
    pauseCount: latestSession.pauseCount,
    rating,
    mistakeCount: 0,
    writingStars,
    reviewChecked,
    fixChecked,
    previewChecked
  });

  const saveRecord = () => {
    setScores((prev) => {
      const next = [...prev];
      const existingIndex = next.findIndex(
        (score) => score.sessionId === latestSession.id
      );
      const updatedScore: ScoreEntry = {
        id: existingIndex >= 0 ? next[existingIndex].id : uid("scr"),
        sessionId: latestSession.id,
        taskId: latestSession.taskId,
        points: calculatedPoints,
        seconds: latestSession.seconds,
        pauseCount: latestSession.pauseCount,
        createdAt: latestSession.endedAt
      };
      if (existingIndex >= 0) {
        next[existingIndex] = updatedScore;
      } else {
        next.unshift(updatedScore);
      }
      return next;
    });
    const entry: RecordEntry = {
      id: uid("rec"),
      taskId: activeTask.id,
      title: `${activeTask.title} ${activeTask.plannedMinutes} 分钟`,
      subject: activeTask.subject,
      minutes: Math.max(1, Math.round(latestSession.seconds / 60)),
      rating,
      mistakeCount: 0,
      writingStars,
      reviewChecked,
      fixChecked,
      previewChecked,
      note,
      createdAt: new Date().toISOString(),
      points: calculatedPoints
    };
    setRecords((prev) => [entry, ...prev]);
    setTasks((prev) =>
      prev.map((task) =>
        task.id === activeTask.id ? { ...task, status: "done" } : task
      )
    );
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background-light px-6 py-8 dark:bg-background-dark">
      <div className="pointer-events-none absolute right-[-20%] top-[-10%] h-72 w-72 rounded-full bg-primary/20 blur-3xl" />

      <header className="mb-8 flex w-full items-center justify-between">
        <button type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-full bg-white p-2 text-slate-400 shadow-sm transition-transform active:scale-90 dark:bg-card-dark"
        >
          <span className="material-icons-round">arrow_back</span>
        </button>
        <div className="text-sm font-black uppercase tracking-wide text-gray-700 dark:text-gray-200">
          {activeTask.title}
        </div>
        <div className="rounded-full bg-white p-2 text-slate-400 shadow-sm dark:bg-card-dark">
          <span className="material-icons-round">share</span>
        </div>
      </header>

      <section className="mb-8 flex flex-col items-center">
        <div className="relative mb-8">
          <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-8 border-white bg-gradient-to-tr from-teal-50 to-teal-100 shadow-soft dark:border-slate-800 dark:from-slate-800 dark:to-slate-700">
            <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />
            <span className="material-icons-round text-5xl text-primary drop-shadow-sm">
              emoji_events
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 rounded-full border-2 border-white bg-secondary px-3 py-1 text-[10px] font-black text-gray-800 shadow-md dark:border-slate-800">
            +{calculatedPoints} EXP
          </div>
        </div>

        <div className="flex w-full max-w-sm gap-4">
          <div className="flex-1 rounded-[2.5rem] border border-gray-100 bg-white p-5 text-center shadow-sm dark:border-gray-800 dark:bg-card-dark">
            <span className="mb-2 block text-[11px] font-black uppercase text-gray-400">
              预计用时
            </span>
            <span className="text-lg font-black text-gray-600 dark:text-gray-300">
              {targetMins}
              <span className="ml-0.5 text-xs font-bold">分</span>
            </span>
          </div>
          <div className="flex-1 rounded-[2.5rem] border border-primary/20 bg-teal-50/60 p-5 text-center shadow-sm dark:bg-teal-900/10">
            <span className="mb-2 block text-[11px] font-black uppercase text-primary/80">
              实际用时
            </span>
            <span className="text-lg font-black text-primary">
              {actualMins}
              <span className="ml-0.5 text-xs font-bold text-primary/60">分</span>
              {actualSecs}
              <span className="ml-0.5 text-xs font-bold text-primary/60">秒</span>
            </span>
          </div>
        </div>
      </section>

      <div className="mb-8 space-y-4">
        <div className="rounded-[2.8rem] border border-gray-50 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-card-dark">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-orange-400">
                warning_amber
              </span>
              <h3 className="text-base font-black text-gray-800 dark:text-white">
                中断记录
              </h3>
            </div>
            <div className="flex items-baseline">
              <span className="text-xl font-black text-orange-500 tabular-nums">
                {totalInterruptions}
              </span>
              <span className="ml-1 text-[10px] font-black uppercase text-gray-400">
                次
              </span>
            </div>
          </div>

          {totalInterruptions > 0 ? (
            <div className="mt-6 space-y-6">
              {Object.entries(reasonStats).map(([rid, stats]) => {
                const info = REASON_MAP[rid] || REASON_MAP.other;
                const percentage = Math.round(
                  (stats.count / totalInterruptions) * 100
                );
                return (
                  <div key={rid} className="flex items-center gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-full ${info.bgColor} shadow-sm dark:bg-opacity-10`}
                      style={{ color: info.color }}
                    >
                      <span className="material-icons-round text-2xl">
                        {info.icon}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-end justify-between">
                        <div>
                          <h4 className="text-[15px] font-black text-gray-800 dark:text-white">
                            {info.label}
                          </h4>
                          <p className="mt-0.5 text-[11px] font-bold text-gray-400">
                            {stats.count} 次
                          </p>
                        </div>
                        <span className="text-[11px] font-black text-gray-400 tabular-nums">
                          {percentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-50 dark:bg-gray-800">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: info.color
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-[1.8rem] bg-teal-50 py-5 text-xs font-bold text-teal-500 dark:bg-teal-900/20">
              <span className="material-icons-round text-lg">rocket_launch</span>
              真棒！全程专注，无任何中断
            </div>
          )}
        </div>
      </div>

      <div className="mb-10 space-y-5">
        <div className="rounded-[2.8rem] border border-gray-50 bg-white p-7 shadow-soft dark:border-gray-800 dark:bg-card-dark">
          <div className="mb-6 flex items-center px-2">
            <span className="material-icons-round mr-3 rounded-xl bg-teal-50 p-2 text-lg text-primary dark:bg-teal-900/30">
              stars
            </span>
            <h2 className="text-base font-black text-gray-800 dark:text-white">
              完成质量
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "极好", id: "best" as const },
              { label: "不错", id: "good" as const },
              { label: "一般", id: "meh" as const }
            ].map((item) => (
              <label key={item.id} className="cursor-pointer group">
                <input
                  type="radio"
                  name="completion"
                  className="peer sr-only"
                  checked={completionLevel === item.id}
                  onChange={() => setCompletionLevel(item.id)}
                />
                <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-transparent bg-gray-50 p-4 shadow-sm transition-all peer-checked:border-primary peer-checked:bg-teal-50 dark:bg-gray-800 dark:peer-checked:bg-teal-900/20">
                  <span className="mb-2 text-2xl font-black text-gray-500">
                    {item.label}
                  </span>
                  <span className="text-[12px] font-black tracking-wide text-gray-400 peer-checked:text-primary">
                    {item.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setFixChecked((prev) => !prev)}
              className={`rounded-full border px-4 py-2 text-xs font-bold ${
                fixChecked
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              改错
            </button>
            <button
              type="button"
              onClick={() => setReviewChecked((prev) => !prev)}
              className={`rounded-full border px-4 py-2 text-xs font-bold ${
                reviewChecked
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              复习
            </button>
            <button
              type="button"
              onClick={() => setPreviewChecked((prev) => !prev)}
              className={`rounded-full border px-4 py-2 text-xs font-bold ${
                previewChecked
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 text-gray-400"
              }`}
            >
              预习
            </button>
          </div>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="记录一句复盘感受"
            className="mt-6 w-full resize-none rounded-[2rem] border border-gray-100 bg-gray-50 px-5 py-4 text-sm font-medium text-gray-600 focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800"
            rows={3}
          />
        </div>
      </div>

      <div className="mt-auto pt-4">
        <button type="button"
          onClick={saveRecord}
          className="flex w-full items-center justify-center gap-2 rounded-[2.2rem] bg-primary px-6 py-4.5 text-lg font-black tracking-wider text-white shadow-glow transition-all active:scale-95"
        >
          保存并退出
          <span className="material-icons-round">check_circle</span>
        </button>
      </div>
    </div>
  );
}
