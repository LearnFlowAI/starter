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
