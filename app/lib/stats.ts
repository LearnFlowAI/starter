import type { TaskType } from "./ui";

export const MOCK_STATS_SUMMARY = {
  today: { hours: 2, mins: 15, label: "今日专注" },
  yesterday: { hours: 3, mins: 45, label: "昨日专注" },
  week: { hours: 18, mins: 30, label: "本周专注" }
};

export const MOCK_STATS_DETAILS: Record<
  "today" | "yesterday" | "week",
  Array<{
    id: string;
    type: TaskType;
    name: string;
    duration: string;
    interruptions: number;
    points: string;
  }>
> = {
  today: [
    { id: "d1", type: "math", name: "数学", duration: "45m", interruptions: 0, points: "+50" },
    { id: "d2", type: "english", name: "英语", duration: "30m", interruptions: 5, points: "+30" },
    { id: "d3", type: "science", name: "科学", duration: "20m", interruptions: 4, points: "+20" },
    { id: "d4", type: "art", name: "艺术", duration: "15m", interruptions: 3, points: "+15" }
  ],
  yesterday: [
    { id: "y1", type: "math", name: "数学", duration: "60m", interruptions: 1, points: "+65" },
    { id: "y2", type: "chinese", name: "语文", duration: "40m", interruptions: 0, points: "+45" },
    { id: "y3", type: "sport", name: "体育", duration: "30m", interruptions: 2, points: "+40" }
  ],
  week: [
    { id: "w1", type: "math", name: "数学", duration: "5h", interruptions: 4, points: "+450" },
    { id: "w2", type: "english", name: "英语", duration: "3h", interruptions: 2, points: "+320" },
    { id: "w3", type: "science", name: "科学", duration: "2h", interruptions: 5, points: "+180" },
    { id: "w4", type: "chinese", name: "语文", duration: "2h", interruptions: 1, points: "+210" }
  ]
};
