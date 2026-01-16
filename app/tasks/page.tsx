"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EmptyState from "../components/EmptyState";
import { defaultTasks } from "../lib/defaults";
import type { Task } from "../lib/models";
import { uid, useLocalState } from "../lib/storage";
import { getTaskType, TASK_CONFIG, type TaskType } from "../lib/ui";

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tasks, setTasks, ready] = useLocalState<Task[]>("lf_tasks", defaultTasks);
  const [activeTaskId, setActiveTaskId] = useLocalState<string>(
    "lf_active_task",
    defaultTasks[0]?.id ?? ""
  );
  const editingId = searchParams.get("edit");
  const editingTask = tasks.find((task) => task.id === editingId);
  const [name, setName] = useState("");
  const [type, setType] = useState<TaskType>("math");
  const [duration, setDuration] = useState(40);

  useEffect(() => {
    if (!editingTask) {
      setName("");
      setType("math");
      setDuration(40);
      return;
    }
    setName(editingTask.title);
    setType(getTaskType(editingTask.subject));
    setDuration(editingTask.plannedMinutes);
  }, [editingTask]);

  if (!ready) {
    return null;
  }

  const handleSubmit = () => {
    if (!name.trim()) {
      return;
    }

    if (editingTask) {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === editingTask.id
            ? {
                ...item,
                title: name.trim(),
                subject: TASK_CONFIG[type].label,
                plannedMinutes: duration
              }
            : item
        )
      );
      router.push("/dashboard");
      return;
    }

    const newTask: Task = {
      id: uid("task"),
      title: name.trim(),
      subject: TASK_CONFIG[type].label,
      plannedMinutes: duration,
      status: "todo"
    };
    setTasks((prev) => [newTask, ...prev]);
    setActiveTaskId(newTask.id);
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-end justify-center bg-gray-50/50 p-0 font-sans transition-all sm:items-center sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-md flex-col overflow-hidden rounded-t-[40px] bg-white shadow-2xl dark:bg-card-dark sm:rounded-[40px]">
        <div className="flex justify-center pb-3 pt-5">
          <div className="h-1.5 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto px-8 pb-32 pt-2">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-wide">
              {editingTask ? "编辑任务" : "添加新任务"}
            </h2>
            <button type="button"
              onClick={() => router.push("/dashboard")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-gray-700"
            >
              <span className="material-icons-round">close</span>
            </button>
          </div>

          {tasks.length === 0 && !editingTask && (
            <div className="mb-8">
              <EmptyState
                icon="playlist_add"
                title="创建你的第一个学习任务"
                description="点击 + 创建新任务"
              />
            </div>
          )}

          <div className="mb-8 grid grid-cols-3 gap-x-4 gap-y-8">
            {(Object.keys(TASK_CONFIG) as TaskType[]).map((key) => {
              const conf = TASK_CONFIG[key];
              const isSelected = type === key;
              return (
                <button type="button"
                  key={key}
                  onClick={() => setType(key)}
                  className={`relative flex flex-col items-center gap-3 transition-all ${
                    isSelected ? "scale-110" : "opacity-60"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute inset-0 scale-110 rounded-3xl bg-primary/20 blur-xl" />
                  )}
                  <div
                    className={`relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.2rem] ${conf.bgColor} shadow-clay ring-2 dark:bg-gray-800 ${
                      isSelected ? "ring-primary" : "ring-transparent"
                    }`}
                  >
                    <span className={`material-icons-round text-[36px] ${conf.color}`}>
                      {conf.icon}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      isSelected ? "text-primary" : "text-gray-400"
                    }`}
                  >
                    {conf.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-3 ml-2 block text-sm font-bold" htmlFor="task-name">
                任务名称
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6 text-gray-300">
                  <span className="material-icons-round">edit</span>
                </div>
                <input
                  id="task-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="block w-full rounded-full border-none bg-gray-50 py-4 pl-14 pr-6 text-lg font-medium placeholder-gray-300 transition-all focus:ring-2 focus:ring-primary/20 dark:bg-gray-800"
                  placeholder="例如：完成第10页习题"
                  type="text"
                />
              </div>
            </div>

            <div>
              <div className="mb-5 ml-2 flex items-end justify-between">
                <h3 className="text-lg font-bold">预计时长</h3>
                <span className="text-3xl font-black tracking-tight text-primary">
                  {duration}
                  <span className="ml-1 text-sm font-bold text-gray-400">
                    min
                  </span>
                </span>
              </div>
              <div className="rounded-[2rem] border border-white bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <input
                  type="range"
                  min="5"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(event) => setDuration(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-primary"
                />
                <div className="mt-2 flex justify-between px-1 text-xs font-bold text-gray-300">
                  <span>5min</span>
                  <span>60min</span>
                  <span>120min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white p-8 dark:bg-card-dark">
          <button type="button"
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-moss py-4 text-lg font-bold text-white shadow-lg transition-all active:scale-95"
          >
            <span className="material-icons-round">
              {editingTask ? "save" : "add_task"}
            </span>
            {editingTask ? "保存修改" : "确认添加"}
          </button>
        </div>
      </div>
    </main>
  );
}
