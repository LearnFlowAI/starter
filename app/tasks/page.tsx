"use client";

import TopNav from "../components/TopNav";
import { useState } from "react";
import { defaultTasks } from "../lib/defaults";
import type { Task } from "../lib/models";
import { uid, useLocalState } from "../lib/storage";

export default function TasksPage() {
  const [tasks, setTasks] = useLocalState<Task[]>("lf_tasks", defaultTasks);
  const [activeTaskId, setActiveTaskId, ready] = useLocalState<string>(
    "lf_active_task",
    defaultTasks[0]?.id ?? ""
  );
  const [editingId, setEditingId] = useState("");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [plannedMinutes, setPlannedMinutes] = useState(20);

  const normalizeMinutes = (value: number) => {
    if (!Number.isFinite(value)) {
      return 5;
    }
    return Math.max(5, Math.round(value));
  };

  if (!ready) {
    return null;
  }

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? tasks[0];
  const isEditing = Boolean(editingId);

  const resetForm = () => {
    setEditingId("");
    setTitle("");
    setSubject("");
    setPlannedMinutes(20);
  };

  return (
    <main className="grid-overlay min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <TopNav />
        <section className="card rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-ink">今日任务</h2>
            <span className="text-xs text-ink/60">按科目分组</span>
          </div>
          <div className="mt-5 rounded-2xl border border-ink/10 bg-chalk p-4">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="任务标题"
                className="flex-1 rounded-2xl border border-ink/10 bg-white px-4 py-2 text-sm text-ink"
              />
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                placeholder="科目/领域"
                className="w-36 rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
              />
              <input
                type="number"
                min="5"
                value={plannedMinutes}
                onChange={(event) =>
                  setPlannedMinutes(Number(event.target.value))
                }
                className="w-24 rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink"
              />
              <button
                type="button"
                onClick={() => {
                  if (!title.trim()) {
                    return;
                  }
                  const safeMinutes = normalizeMinutes(plannedMinutes);
                  if (isEditing) {
                    setTasks((prev) =>
                      prev.map((item) =>
                        item.id === editingId
                          ? {
                              ...item,
                              title: title.trim(),
                              subject: subject.trim() || item.subject,
                              plannedMinutes: safeMinutes
                            }
                          : item
                      )
                    );
                    resetForm();
                    return;
                  }
                  const newTask: Task = {
                    id: uid("task"),
                    title: title.trim(),
                    subject: subject.trim() || "通用",
                    plannedMinutes: safeMinutes,
                    status: "todo"
                  };
                  setTasks((prev) => [newTask, ...prev]);
                  setActiveTaskId(newTask.id);
                  resetForm();
                }}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-chalk shadow-crisp transition hover:-translate-y-0.5"
              >
                {isEditing ? "保存修改" : "新增任务"}
              </button>
              {isEditing ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm text-ink/70 transition hover:-translate-y-0.5"
                >
                  取消编辑
                </button>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-ink/50">
              当前专注：{activeTask ? activeTask.title : "未选择"}
            </p>
          </div>
          <div className="mt-6 space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-crisp ${
                  activeTaskId === task.id
                    ? "border-moss bg-moss/10"
                    : "border-ink/10 bg-chalk"
                }`}
              >
                <div>
                  <p className="text-sm text-ink/60">{task.subject}</p>
                  <p className="text-lg font-semibold text-ink">{task.title}</p>
                  <p className="text-xs text-ink/40">
                    计划 {task.plannedMinutes} 分钟
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTaskId(task.id)}
                    className="rounded-full border border-ink/20 px-3 py-1 text-xs text-ink/70 transition hover:-translate-y-0.5"
                  >
                    设为当前
                  </button>
                  <select
                    value={task.status}
                    onChange={(event) => {
                      const value = event.target.value as Task["status"];
                      setTasks((prev) =>
                        prev.map((item) =>
                          item.id === task.id ? { ...item, status: value } : item
                        )
                      );
                    }}
                    className="rounded-full border border-ink/20 bg-white px-3 py-1 text-xs text-ink/70"
                  >
                    <option value="todo">待开始</option>
                    <option value="doing">进行中</option>
                    <option value="done">已完成</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(task.id);
                      setTitle(task.title);
                      setSubject(task.subject);
                      setPlannedMinutes(task.plannedMinutes);
                    }}
                    className="rounded-full border border-ink/20 px-3 py-1 text-xs text-ink/70 transition hover:-translate-y-0.5"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTasks((prev) => {
                        const next = prev.filter((item) => item.id !== task.id);
                        if (activeTaskId === task.id) {
                          setActiveTaskId(next[0]?.id ?? "");
                        }
                        return next;
                      });
                      if (editingId === task.id) {
                        resetForm();
                      }
                    }}
                    className="rounded-full border border-ink/20 px-3 py-1 text-xs text-ink/50 transition hover:-translate-y-0.5"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
