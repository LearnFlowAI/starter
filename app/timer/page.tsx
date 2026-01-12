"use client";

import { useEffect, useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import { defaultTasks } from "../lib/defaults";
import { calculateSessionPoints } from "../lib/scoring";
import type { ScoreEntry, SessionEntry, Task } from "../lib/models";
import { uid, useLocalState } from "../lib/storage";

export default function TimerPage() {
  const [tasks] = useLocalState<Task[]>("lf_tasks", defaultTasks);
  const [activeTaskId] = useLocalState<string>(
    "lf_active_task",
    defaultTasks[0]?.id ?? ""
  );
  const [seconds, setSeconds] = useLocalState<number>("lf_timer_seconds", 0);
  const [running, setRunning] = useLocalState<boolean>("lf_timer_running", false);
  const [pauseCount, setPauseCount] = useLocalState<number>(
    "lf_timer_pause",
    0
  );
  const [startedAt, setStartedAt] = useLocalState<string>(
    "lf_timer_started_at",
    ""
  );
  const [, setSessions] = useLocalState<SessionEntry[]>("lf_sessions", []);
  const [ready, setReady] = useState(false);
  const [, setScores] = useLocalState<ScoreEntry[]>("lf_scores", []);

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

  if (!ready || !activeTask) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;

  return (
    <main className="grid-overlay min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <TopNav />
        <section className="card rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">计时器</h2>
            <span className="badge border-ink/40 text-ink/70">
              {activeTask.subject}
            </span>
          </div>
          <div className="mt-6 rounded-3xl border border-ink/10 bg-ink/5 p-6 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-ink/60">
              {activeTask.title}
            </p>
            <div className="mt-4 text-5xl font-semibold text-ink">
              {String(minutes).padStart(2, "0")}:
              {String(remainder).padStart(2, "0")}
            </div>
            <p className="mt-2 text-xs text-ink/50">暂停次数 {pauseCount}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (running) {
                    setPauseCount((prev) => prev + 1);
                  } else if (!startedAt) {
                    setStartedAt(new Date().toISOString());
                  }
                  setRunning((prev) => !prev);
                }}
                className="rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink transition hover:-translate-y-0.5 hover:bg-ink/10"
              >
                {running ? "暂停" : "开始"}
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
                }}
                className="rounded-full border border-ink/20 px-5 py-2 text-sm font-medium text-ink/70 transition hover:-translate-y-0.5 hover:bg-ink/10"
              >
                结束并重置
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
