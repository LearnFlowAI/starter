export type AppView = 'login' | 'dashboard' | 'timer' | 'stats' | 'settings' | 'add-task' | 'summary' | 'pause-reason' | 'profile' | 'pause-analysis';

export type TaskType = 'math' | 'chinese' | 'english' | 'science' | 'art' | 'sport';

export interface Interruption {
  reasonId: string;
  startTime: number;
  duration: number; // seconds
}

export interface Task {
  id: string;
  name: string;
  type: TaskType;
  duration: number; // minutes
  progress: number; // percentage
  rating: number; // 1-5
  isCompleted: boolean;
}

export interface Session {
  id: string;
  taskId: string;
  taskName: string;
  duration: number; // actual focus seconds
  targetDuration: number; // planned focus seconds (task.duration * 60)
  startTime: number;
  interruptionCount: number;
  interruptions: Interruption[];
  completionLevel: 'all' | 'most' | 'half';
  rating: number;
}