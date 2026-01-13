export type Task = {
  id: string;
  title: string;
  subject: string;
  plannedMinutes: number;
  status: "todo" | "doing" | "done";
};

export type RecordEntry = {
  id: string;
  taskId: string;
  title: string;
  subject: string;
  minutes: number;
  rating: number;
  mistakeCount: number;
  writingStars: number;
  reviewChecked: boolean;
  fixChecked: boolean;
  previewChecked: boolean;
  note: string;
  createdAt: string;
  points: number;
};

export type SessionEntry = {
  id: string;
  taskId: string;
  seconds: number;
  pauseCount: number;
  startedAt: string;
  endedAt: string;
};

export type ScoreEntry = {
  id: string;
  sessionId: string;
  taskId: string;
  points: number;
  seconds?: number;
  pauseCount: number;
  createdAt: string;
};

export type InterruptionLog = {
  id: string;
  reasonId: string;
  duration: number;
  createdAt: string;
  taskId: string;
  sessionId?: string;
};
