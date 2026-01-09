"use client";

import TopNav from "../components/TopNav";
import { defaultTasks } from "../lib/defaults";
import type { Task } from "../lib/models";
import { useLocalState } from "../lib/storage";

export default function TasksPage() {
  const [tasks, setTasks] = useLocalState<Task[]>("lf_tasks", defaultTasks);
  const [activeTaskId, setActiveTaskId, ready] = useLocalState<string>(
    "lf_active_task",
    defaultTasks[0]?.id ?? ""
  );

  if (!ready) {
    return null;
  }

  return (
    <main className="grid-overlay min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <TopNav />
        <section className="card rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">今日任务</h2>
            <span className="text-xs text-ink/60">按科目分组</span>
          </div>
          <div className="mt-6 space-y-4">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => {
                  setActiveTaskId(task.id);
                  setTasks((prev) =>
                    prev.map((item) =>
                      item.id === task.id
                        ? { ...item, status: "doing" }
                        : item
                    )
                  );
                }}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-crisp ${
                  activeTaskId === task.id
                    ? "border-moss bg-moss/10"
                    : "border-ink/10 bg-chalk"
                }`}
              >
                <div>
                  <p className="text-sm text-ink/60">{task.subject}</p>
                  <p className="text-lg font-semibold text-ink">{task.title}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] text-ink/50">
                  {task.status === "done" ? "完成" : "开始"}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
