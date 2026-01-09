"use client";

import { useMemo, useState } from "react";
import TopNav from "../components/TopNav";
import { defaultTasks, interruptOptions } from "../lib/defaults";
import type { RecordEntry, Task } from "../lib/models";
import { uid, useLocalState } from "../lib/storage";

export default function RecordPage() {
  const [tasks, setTasks] = useLocalState<Task[]>("lf_tasks", defaultTasks);
  const [activeTaskId] = useLocalState<string>(
    "lf_active_task",
    defaultTasks[0]?.id ?? ""
  );
  const [records, setRecords, ready] = useLocalState<RecordEntry[]>(
    "lf_records",
    []
  );
  const [rating, setRating] = useState(4);
  const [mistakeCount, setMistakeCount] = useState(1);
  const [writingStars, setWritingStars] = useState(4);
  const [interruptReason, setInterruptReason] = useState("");
  const [note, setNote] = useState("");
  const [reviewChecked, setReviewChecked] = useState(false);
  const [fixChecked, setFixChecked] = useState(false);
  const [previewChecked, setPreviewChecked] = useState(false);

  const activeTask = useMemo(
    () => tasks.find((task) => task.id === activeTaskId) ?? tasks[0],
    [activeTaskId, tasks]
  );

  if (!ready || !activeTask) {
    return null;
  }

  const points = Math.max(0, rating * 5 - mistakeCount * 2 + writingStars * 2);

  return (
    <main className="grid-overlay min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <TopNav />
        <section className="card rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">结束记录</h2>
            <span className="text-xs text-ink/60">30 秒内完成</span>
          </div>
          <p className="mt-3 text-sm text-ink/70">
            当前任务：{activeTask.title}
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="rounded-2xl border border-ink/10 bg-chalk px-4 py-3">
              <span className="text-xs text-ink/60">完成度</span>
              <input
                type="range"
                min="1"
                max="5"
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="mt-2 w-full"
              />
            </label>
            <label className="rounded-2xl border border-ink/10 bg-chalk px-4 py-3">
              <span className="text-xs text-ink/60">低级错数量</span>
              <input
                type="number"
                min="0"
                value={mistakeCount}
                onChange={(event) => setMistakeCount(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="rounded-2xl border border-ink/10 bg-chalk px-4 py-3">
              <span className="text-xs text-ink/60">书写星级</span>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setWritingStars(star)}
                    className={`h-8 w-8 rounded-full border text-sm ${
                      star <= writingStars
                        ? "border-cider bg-cider/20 text-cider"
                        : "border-ink/20 text-ink/50"
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </label>
            <label className="rounded-2xl border border-ink/10 bg-chalk px-4 py-3">
              <span className="text-xs text-ink/60">中断原因</span>
              <select
                value={interruptReason}
                onChange={(event) => setInterruptReason(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              >
                <option value="">未发生</option>
                {interruptOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setFixChecked((prev) => !prev)}
              className={`rounded-full border px-4 py-2 text-sm ${
                fixChecked
                  ? "border-moss bg-moss/20 text-moss"
                  : "border-ink/20 text-ink/70"
              }`}
            >
              改错
            </button>
            <button
              type="button"
              onClick={() => setReviewChecked((prev) => !prev)}
              className={`rounded-full border px-4 py-2 text-sm ${
                reviewChecked
                  ? "border-moss bg-moss/20 text-moss"
                  : "border-ink/20 text-ink/70"
              }`}
            >
              复习
            </button>
            <button
              type="button"
              onClick={() => setPreviewChecked((prev) => !prev)}
              className={`rounded-full border px-4 py-2 text-sm ${
                previewChecked
                  ? "border-moss bg-moss/20 text-moss"
                  : "border-ink/20 text-ink/70"
              }`}
            >
              预习
            </button>
          </div>
          <label className="mt-4 block rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/60">
            <span className="text-xs text-ink/60">备注</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="mt-2 w-full resize-none rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm"
              rows={3}
            />
          </label>
          <div className="mt-5 rounded-2xl border border-ink/10 bg-ink/5 px-4 py-3 text-sm">
            <p className="text-ink/70">自动结算：预计获得 {points} 积分</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const entry: RecordEntry = {
                id: uid("rec"),
                taskId: activeTask.id,
                title: activeTask.title,
                subject: activeTask.subject,
                minutes: activeTask.plannedMinutes,
                rating,
                mistakeCount,
                writingStars,
                reviewChecked,
                fixChecked,
                previewChecked,
                note,
                createdAt: new Date().toISOString(),
                points
              };
              setRecords([entry, ...records]);
              setTasks((prev) =>
                prev.map((item) =>
                  item.id === activeTask.id ? { ...item, status: "done" } : item
                )
              );
              setNote("");
            }}
            className="mt-5 w-full rounded-2xl bg-moss px-4 py-3 text-sm font-semibold text-chalk shadow-crisp transition hover:-translate-y-0.5"
          >
            完成记录并结算
          </button>
        </section>
      </div>
    </main>
  );
}
