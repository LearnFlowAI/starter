"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultTasks } from "../lib/defaults";
import { calculateSessionPoints } from "../lib/scoring";
import type { ScoreEntry, SessionEntry, Task } from "../lib/models";
import { uid, useLocalState } from "../lib/storage";
import { useTheme } from "../lib/theme";

type InterruptionLog = {
  id: string;
  reasonId: string;
  duration: number;
  createdAt: string;
  taskId: string;
};

export default function TimerPage() {
  const router = useRouter();
  const [tasks] = useLocalState<Task[]>("lf_tasks", defaultTasks);
  const [activeTaskId] = useLocalState<string>(
    "lf_active_task",
    defaultTasks[0]?.id ?? ""
  );
  const [seconds, setSeconds] = useLocalState<number>("lf_timer_seconds", 0);
  const [running, setRunning] = useLocalState<boolean>(
    "lf_timer_running",
    false
  );
  const [pauseCount, setPauseCount] = useLocalState<number>("lf_timer_pause", 0);
  const [startedAt, setStartedAt] = useLocalState<string>(
    "lf_timer_started_at",
    ""
  );
  const [pauseStartedAt, setPauseStartedAt] = useLocalState<number | null>(
    "lf_pause_started_at",
    null
  );
  const [pendingReason, setPendingReason] = useLocalState<string | null>(
    "lf_pause_reason_pending",
    null
  );
  const [, setInterruptions] = useLocalState<InterruptionLog[]>(
    "lf_interruptions",
    []
  );
  const [, setSessions] = useLocalState<SessionEntry[]>("lf_sessions", []);
  const [ready, setReady] = useState(false);
  const [, setScores] = useLocalState<ScoreEntry[]>("lf_scores", []);
  const { ready: themeReady } = useTheme();

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? tasks[0],
    [activeTaskId, tasks]
  );

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!running) {
      return;
    }

    const timer = window.setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, setSeconds]);

  if (!ready || !themeReady || !activeTask) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  const plannedSeconds = activeTask.plannedMinutes * 60;
  const progress =
    plannedSeconds > 0 ? Math.min(1, seconds / plannedSeconds) : 0;
  const strokeDashoffset = 282.6 * (1 - progress);

  return (
    <main className="relative flex min-h-screen flex-col items-center px-6 pt-10">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <header className="z-10 mb-10 flex w-full items-center justify-between">
        <button type="button"
          onClick={() => router.push("/dashboard")}
          className="rounded-full bg-white p-2 text-gray-400 shadow-sm transition-transform active:scale-90 dark:bg-card-dark"
        >
          <span className="material-icons-round">arrow_back</span>
        </button>
        <div className="text-sm font-black uppercase tracking-wide text-gray-700 dark:text-gray-200">
          {activeTask.subject}
        </div>
        <button type="button" className="rounded-full bg-white p-2 text-gray-400 shadow-sm transition-transform active:scale-90 dark:bg-card-dark">
          <span className="material-icons-round">more_horiz</span>
        </button>
      </header>

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center">
        <div className="relative mb-6 flex h-64 w-64 items-center justify-center">
          <svg className="h-full w-full" role="img" aria-label="计时进度">
            <title>计时进度</title>
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="rgba(229,231,235,0.7)"
              strokeWidth="10"
              fill="none"
            />
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              stroke="#30E3CA"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="282.6"
              strokeDashoffset={strokeDashoffset}
              className="progress-ring__circle"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
              {activeTask.title}
            </span>
            <div className="mt-4 text-5xl font-black tracking-tight text-gray-800 dark:text-white">
              {String(minutes).padStart(2, "0")}:
              {String(remainder).padStart(2, "0")}
            </div>
            <p className="mt-2 text-xs font-bold text-gray-400">
              暂停次数 {pauseCount}
            </p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={() => {
              if (running) {
                setPauseCount((prev) => prev + 1);
                setPauseStartedAt(Date.now());
                setRunning(false);
                router.push("/pause-reason");
                return;
              }
              if (!startedAt) {
                setStartedAt(new Date().toISOString());
              }
              if (pauseStartedAt) {
                const duration = Math.floor((Date.now() - pauseStartedAt) / 1000);
                const reason = pendingReason ?? "other";
                setInterruptions((prev) => [
                  {
                    id: uid("pause"),
                    reasonId: reason,
                    duration,
                    createdAt: new Date().toISOString(),
                    taskId: activeTask.id
                  },
                  ...prev
                ]);
                setPendingReason(null);
                setPauseStartedAt(null);
              }
              setRunning(true);
            }}
            className="w-full rounded-full border border-gray-200 bg-white py-4 text-base font-bold text-gray-700 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-card-dark dark:text-gray-200"
          >
            {running ? "暂停并记录" : "继续专注"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (seconds > 0) {
                const entry: SessionEntry = {
                  id: uid("ses"),
                  taskId: activeTask.id,
                  seconds,
                  pauseCount,
                  startedAt: startedAt || new Date().toISOString(),
                  endedAt: new Date().toISOString()
                };
                setSessions((prev) => [entry, ...prev]);

                const points = calculateSessionPoints({ seconds, pauseCount });
                const scoreEntry: ScoreEntry = {
                  id: uid("scr"),
                  sessionId: entry.id,
                  taskId: entry.taskId,
                  points,
                  seconds: entry.seconds,
                  pauseCount: entry.pauseCount,
                  createdAt: entry.endedAt
                };
                setScores((prev) => [scoreEntry, ...prev]);
              }
              setRunning(false);
              setSeconds(0);
              setPauseCount(0);
              setStartedAt("");
              setPauseStartedAt(null);
              setPendingReason(null);
              router.push("/record");
            }}
            className="w-full rounded-full border border-gray-200 bg-white py-4 text-base font-bold text-gray-400 transition hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-card-dark dark:text-gray-400"
          >
            完成并保存
          </button>
        </div>
      </div>
    </main>
  );
}
