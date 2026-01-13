import type { Task } from "./models";

export type TaskType =
  | "math"
  | "chinese"
  | "english"
  | "science"
  | "art"
  | "sport";

export const TASK_CONFIG: Record<
  TaskType,
  { icon: string; color: string; hex: string; bgColor: string; label: string }
> = {
  math: {
    icon: "functions",
    color: "text-primary",
    hex: "#30E3CA",
    bgColor: "bg-teal-50",
    label: "数学"
  },
  chinese: {
    icon: "history_edu",
    color: "text-orange-500",
    hex: "#F97316",
    bgColor: "bg-orange-50",
    label: "语文"
  },
  english: {
    icon: "language",
    color: "text-secondary",
    hex: "#FFD54F",
    bgColor: "bg-yellow-50",
    label: "英语"
  },
  science: {
    icon: "science",
    color: "text-blue-400",
    hex: "#60A5FA",
    bgColor: "bg-blue-50",
    label: "科学"
  },
  art: {
    icon: "palette",
    color: "text-pink-400",
    hex: "#F472B6",
    bgColor: "bg-pink-50",
    label: "艺术"
  },
  sport: {
    icon: "emoji_events",
    color: "text-yellow-600",
    hex: "#CA8A04",
    bgColor: "bg-yellow-50",
    label: "体育"
  }
};

export function getTaskType(subject: string): TaskType {
  const value = subject.toLowerCase();
  if (value.includes("数") || value.includes("math")) {
    return "math";
  }
  if (value.includes("语") || value.includes("chinese")) {
    return "chinese";
  }
  if (value.includes("英") || value.includes("english")) {
    return "english";
  }
  if (
    value.includes("科") ||
    value.includes("理") ||
    value.includes("science")
  ) {
    return "science";
  }
  if (value.includes("艺") || value.includes("art")) {
    return "art";
  }
  if (value.includes("体") || value.includes("sport")) {
    return "sport";
  }
  return "math";
}

export function getTaskProgress(task: Task): number {
  switch (task.status) {
    case "done":
      return 100;
    case "doing":
      return 55;
    default:
      return 0;
  }
}
