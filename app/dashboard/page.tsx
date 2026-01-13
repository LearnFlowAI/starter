"use client";

import { useMemo, useState, useEffect } from "react";
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts";
import BottomNav from "../components/BottomNav";
import { defaultTasks } from "../lib/defaults";
import type { SessionEntry, Task } from "../lib/models";
import { useLocalState } from "../lib/storage";
import { getTaskProgress, getTaskType, TASK_CONFIG } from "../lib/ui";
import { useTheme } from "../lib/theme";
import { useRouter } from "next/navigation";

type FocusView = "planned" | "actual";

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks, tasksReady] = useLocalState<Task[]>(
    "lf_tasks",
    defaultTasks
  );
  const [activeTaskId, setActiveTaskId, activeReady] = useLocalState<string>(
    "lf_active_task",
    defaultTasks[0]?.id ?? ""
  );
  const [sessions, , sessionsReady] = useLocalState<SessionEntry[]>(
    "lf_sessions",
    []
  );
  const [timerRunning] = useLocalState<boolean>("lf_timer_running", false);
  const { toggleTheme, ready: themeReady } = useTheme();
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [focusView, setFocusView] = useState<FocusView>("planned");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const ready = tasksReady && activeReady && sessionsReady && themeReady;

  const actualMinutesByTask = useMemo(() => {
    return sessions.reduce<Record<string, number>>((acc, session) => {
      const minutes = Math.floor(session.seconds / 60);
      acc[session.taskId] = (acc[session.taskId] ?? 0) + minutes;
      return acc;
    }, {});
  }, [sessions]);

  const uiTasks = useMemo(() => {
    return tasks.map((task) => {
      const type = getTaskType(task.subject);
      const progress = getTaskProgress(task);
      const actualMinutes = actualMinutesByTask[task.id] ?? 0;
      const adjustedProgress =
        task.plannedMinutes > 0
          ? Math.min(100, Math.round((actualMinutes / task.plannedMinutes) * 100))
          : progress;
      return {
        id: task.id,
        name: task.title,
        type,
        duration: task.plannedMinutes,
        progress: task.status === "done" ? 100 : adjustedProgress,
        isCompleted: task.status === "done",
        actualMinutes
      };
    });
  }, [tasks, actualMinutesByTask]);

  const completedTasksCount = uiTasks.filter((t) => t.isCompleted).length;
  const allTasksCompleted = uiTasks.length > 0 && uiTasks.every((t) => t.isCompleted);

  const plannedChartData = uiTasks
    .map((task) => ({
      name: task.name,
      value: task.duration,
      color: TASK_CONFIG[task.type].hex
    }))
    .filter((data) => data.value > 0);

  const actualChartData = uiTasks
    .map((task) => ({
      name: task.name,
      value: task.actualMinutes,
      color: TASK_CONFIG[task.type].hex
    }))
    .filter((data) => data.value > 0);

  const formatMinsToHms = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0) {
      return { h, m, display: `${h}h${m.toString().padStart(2, "0")}m` };
    }
    return { h: 0, m, display: `${m}m` };
  };

  const actualMinutes = actualChartData.reduce((acc, d) => acc + d.value, 0);
  const plannedMinutes = uiTasks.reduce((acc, t) => acc + t.duration, 0);

  const currentChartData = focusView === "actual" ? actualChartData : plannedChartData;
  const currentTime =
    focusView === "actual"
      ? formatMinsToHms(actualMinutes)
      : formatMinsToHms(plannedMinutes);

  const hasData = currentChartData.length > 0;
  const displayData = hasData
    ? currentChartData
    : [{ name: "无数据", value: 1, color: "#e5e7eb" }];

  const centralLabel =
    activeIndex !== null && hasData ? displayData[activeIndex].name : "今日专注";
  const centralValueMins =
    activeIndex !== null && hasData ? displayData[activeIndex].value : null;
  const formattedCentralValue =
    centralValueMins !== null
      ? formatMinsToHms(centralValueMins)
      : currentTime;

  const displayedTasks = showAllTasks ? uiTasks : uiTasks.slice(0, 3);

  if (!ready) {
    return null;
  }

  return (
    <div className="pb-32">
      <header className="flex items-center justify-between px-6 pb-4 pt-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="h-12 w-12 overflow-hidden rounded-full border-2 border-white shadow-sm dark:border-gray-700"
          >
            <img
              alt="用户头像"
              className="h-full w-full object-cover"
              src="https://picsum.photos/seed/user/100/100"
            />
          </button>
          <div>
            <h1 className="text-xl font-bold leading-tight">你好, 小明!</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              我们来学点新东西吧。
            </p>
          </div>
        </div>
        <button type="button" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-colors hover:bg-gray-50 dark:bg-card-dark dark:hover:bg-gray-700">
          <span className="material-icons-round">notifications</span>
          <span className="absolute right-2.5 top-2 h-2 w-2 rounded-full border border-white bg-red-500 dark:border-gray-800" />
        </button>
      </header>

      {activeTaskId && (
        <div className="mb-4 px-6 animate-fade-in">
          <button type="button"
            onClick={() => router.push("/timer")}
            className={`group flex w-full items-center justify-between rounded-2xl border p-4 transition-all active:scale-95 ${
              timerRunning
                ? "border-primary/20 bg-primary/10"
                : "border-secondary/20 bg-secondary/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                {timerRunning && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                )}
                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${
                    timerRunning ? "bg-primary" : "bg-secondary"
                  }`}
                />
              </span>
              <span
                className={`text-sm font-bold ${
                  timerRunning ? "text-primary" : "text-orange-600"
                }`}
              >
                {timerRunning ? "正在进行专注任务..." : "专注任务已暂停"}
              </span>
            </div>
            <span
              className={`material-icons-round ${
                timerRunning ? "text-primary" : "text-secondary"
              }`}
            >
              {timerRunning ? "arrow_forward_ios" : "pause_circle_filled"}
            </span>
          </button>
        </div>
      )}

      <div className="mb-2 px-6">
        <div className="flex items-center justify-between border-b border-gray-100 py-2 dark:border-gray-800">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
            今日专注概览
          </h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
            LIVE
          </span>
        </div>
      </div>

      <div className="relative z-0 mb-6 flex flex-col items-center px-6">
        <div className="relative flex h-72 w-72 items-center justify-center">
          <div className="absolute inset-8 rounded-full bg-primary/10 blur-[80px]" />

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                  fontWeight: "700",
                  fontSize: "12px"
                }}
                formatter={(value: number) => [
                  `${value} 分钟`,
                  focusView === "actual" ? "实际用时" : "预计时长"
                ]}
              />
              <Pie
                data={displayData}
                cx="50%"
                cy="50%"
                innerRadius={78}
                outerRadius={108}
                paddingAngle={hasData ? 4 : 0}
                dataKey="value"
                stroke="none"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(_, index) =>
                  setActiveIndex(activeIndex === index ? null : index)
                }
                animationDuration={800}
                animationBegin={0}
              >
                {displayData.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={entry.color}
                    opacity={
                      activeIndex === null || activeIndex === index ? 1 : 0.6
                    }
                    stroke={activeIndex === index ? "#fff" : "none"}
                    strokeWidth={2}
                    style={{
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      filter:
                        activeIndex === index
                          ? "drop-shadow(0 0 8px rgba(0,0,0,0.1))"
                          : "none"
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div
              key={activeIndex === null ? "total" : "slice"}
              className="flex items-baseline animate-fade-in"
            >
              <span
                className={`text-4xl font-black tabular-nums tracking-tighter ${
                  activeIndex !== null
                    ? "text-primary"
                    : "text-gray-800 dark:text-white"
                }`}
              >
                {formattedCentralValue.h > 0 && (
                  <>
                    {formattedCentralValue.h}
                    <span className="ml-0.5 text-lg font-bold text-gray-400">
                      h
                    </span>
                  </>
                )}
                {formattedCentralValue.m}
                <span className="ml-0.5 text-lg font-bold text-gray-400">
                  m
                </span>
              </span>
            </div>
            <span
              className={`mt-1 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                activeIndex !== null ? "text-primary" : "text-secondary"
              }`}
            >
              {centralLabel}
            </span>
          </div>
        </div>

        <div className="mb-4 mt-[-10px] text-center">
          <div className="inline-flex items-center overflow-hidden rounded-full border border-gray-100 bg-white p-1.5 shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800">
            <button type="button"
              onClick={() => setFocusView("planned")}
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition-all ${
                focusView === "planned"
                  ? "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white"
                  : "text-gray-400"
              }`}
            >
              预计{" "}
              <span
                className={
                  focusView === "planned"
                    ? "text-gray-800 dark:text-white"
                    : "text-gray-400"
                }
              >
                {formatMinsToHms(plannedMinutes).display}
              </span>
            </button>
            {allTasksCompleted && (
              <>
                <span className="mx-1 h-3 w-px bg-gray-100 dark:bg-gray-700" />
                <button type="button"
                  onClick={() => setFocusView("actual")}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-bold transition-all ${
                    focusView === "actual"
                      ? "bg-teal-50 text-primary dark:bg-teal-900/30"
                      : "text-gray-400"
                  }`}
                >
                  实际{" "}
                  <span
                    className={
                      focusView === "actual" ? "text-primary" : "text-gray-400"
                    }
                  >
                    {formatMinsToHms(actualMinutes).display}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {hasData && (
          <div
            key={`legend-${focusView}`}
            className="flex max-w-sm flex-wrap justify-center gap-x-5 gap-y-2 animate-fade-in"
          >
            {currentChartData.map((item, idx) => (
              <div
                key={item.name}
                className={`flex cursor-pointer items-center gap-1.5 transition-opacity ${
                  activeIndex !== null && activeIndex !== idx
                    ? "opacity-40"
                    : "opacity-100"
                }`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="max-w-[80px] truncate text-[11px] font-bold text-gray-400">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            今日任务 ({completedTasksCount}/{uiTasks.length})
          </h2>
          <button type="button"
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-teal-600"
          >
            {showAllTasks ? "收起" : "查看全部"}
            <span
              className="material-icons-round text-xs transition-transform"
              style={{ transform: showAllTasks ? "rotate(180deg)" : "none" }}
            >
              expand_more
            </span>
          </button>
        </div>
        <div className="space-y-4">
          {displayedTasks.map((task) => {
            const config = TASK_CONFIG[task.type];
            const isActive = activeTaskId === task.id;
            const actualMins = task.actualMinutes;
            return (
              <div
                key={task.id}
                className={`group relative flex flex-col gap-4 rounded-3xl border border-gray-50 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-soft dark:border-gray-800 dark:bg-card-dark ${
                  task.isCompleted ? "opacity-80" : ""
                } ${
                  isActive
                    ? "ring-2 ring-primary ring-offset-2 shadow-glow dark:ring-offset-gray-900"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <button
                    type="button"
                    className="flex flex-1 cursor-pointer items-center gap-4 text-left"
                    onClick={() => {
                      setActiveTaskId(task.id);
                      if (!task.isCompleted) {
                        router.push("/timer");
                      }
                    }}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${config.bgColor} ${config.color} dark:bg-opacity-10`}
                    >
                      <span className="material-icons-round text-2xl">
                        {config.icon}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-bold text-gray-800 dark:text-white">
                          {config.label} - {task.name}
                        </h3>
                        {isActive && (
                          <span
                            className={`shrink-0 rounded px-2 py-0.5 text-[8px] font-bold uppercase transition-colors ${
                              timerRunning
                                ? "animate-pulse bg-primary text-white"
                                : "bg-secondary text-gray-800"
                            }`}
                          >
                            {timerRunning ? "进行中" : "已暂停"}
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-gray-400">
                          预计 {task.duration}m
                        </span>
                        {task.isCompleted && (
                          <>
                            <span className="h-2.5 w-px bg-gray-100 dark:bg-gray-800" />
                            <span className="text-[11px] font-bold text-primary">
                              实际 {actualMins}m
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/tasks?edit=${task.id}`)}
                      className="rounded-full p-1.5 text-gray-200 transition-colors hover:bg-teal-50 hover:text-primary dark:hover:bg-gray-800"
                    >
                      <span className="material-icons-round text-lg">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTasks((prev) => {
                          const next = prev.filter((t) => t.id !== task.id);
                          if (activeTaskId === task.id) {
                            setActiveTaskId(next[0]?.id ?? "");
                          }
                          return next;
                        });
                      }}
                      className="rounded-full p-1.5 text-gray-200 transition-colors hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-gray-800"
                    >
                      <span className="material-icons-round text-lg">
                        delete_outline
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-50 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${config.color.replace(
                        "text-",
                        "bg-"
                      )}`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-black tabular-nums text-gray-800 dark:text-gray-200">
                    {task.isCompleted ? "完成" : `${task.progress}%`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
