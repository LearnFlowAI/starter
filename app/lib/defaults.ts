import type { Task } from "./models";

export const defaultTasks: Task[] = [
  {
    id: "t1",
    title: "数学口算 20 分钟",
    subject: "数学",
    plannedMinutes: 20,
    status: "todo"
  },
  {
    id: "t2",
    title: "英语阅读 15 分钟",
    subject: "英语",
    plannedMinutes: 15,
    status: "todo"
  },
  {
    id: "t3",
    title: "语文默写 10 分钟",
    subject: "语文",
    plannedMinutes: 10,
    status: "todo"
  }
];

export const interruptOptions = [
  "喝水",
  "分心",
  "去洗手间",
  "家长打断",
  "找资料",
  "情绪波动"
];
