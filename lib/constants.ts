import type { TaskType, Task } from '../types';

export const TASK_CONFIG: Record<TaskType, { icon: string; color: string; hex: string; bgColor: string; label: string }> = {
  math: { icon: 'functions', color: 'text-primary', hex: '#30E3CA', bgColor: 'bg-teal-50', label: '数学' },
  chinese: { icon: 'history_edu', color: 'text-orange-500', hex: '#f97316', bgColor: 'bg-orange-50', label: '语文' },
  english: { icon: 'language', color: 'text-secondary', hex: '#FFD54F', bgColor: 'bg-yellow-50', label: '英语' },
  science: { icon: 'science', color: 'text-blue-400', hex: '#60a5fa', bgColor: 'bg-blue-50', label: '科学' },
  art: { icon: 'palette', color: 'text-pink-400', hex: '#f472b6', bgColor: 'bg-pink-50', label: '艺术' },
  sport: { icon: 'emoji_events', color: 'text-yellow-600', hex: '#ca8a04', bgColor: 'bg-yellow-50', label: '体育' },
};

export const MOCK_TASKS: Task[] = [
  { id: '1', name: '课后练习', type: 'math', duration: 45, progress: 80, rating: 3, isCompleted: false },
  { id: '2', name: '背诵单词', type: 'english', duration: 30, progress: 100, rating: 5, isCompleted: true },
  { id: '3', name: '科学实验', type: 'science', duration: 20, progress: 40, rating: 2, isCompleted: false },
];

export const MOCK_STATS_SUMMARY = {
  today: { hours: 2, mins: 15, label: '今日专注' },
  yesterday: { hours: 3, mins: 45, label: '昨日专注' },
  week: { hours: 18, mins: 30, label: '本周专注' }
};

export const MOCK_STATS_DETAILS = {
  today: [
    { id: 'd1', type: 'math', name: '数学', duration: '45m', interruptions: 0, points: '+50' },
    { id: 'd2', type: 'english', name: '英语', duration: '30m', interruptions: 5, points: '+30' },
    { id: 'd3', type: 'science', name: '科学', duration: '20m', interruptions: 4, points: '+20' },
    { id: 'd4', type: 'art', name: '艺术', duration: '15m', interruptions: 3, points: '+15' },
  ],
  yesterday: [
    { id: 'y1', type: 'math', name: '数学', duration: '60m', interruptions: 1, points: '+65' },
    { id: 'y2', type: 'chinese', name: '语文', duration: '40m', interruptions: 0, points: '+45' },
    { id: 'y3', type: 'sport', name: '体育', duration: '30m', interruptions: 2, points: '+40' },
  ],
  week: [
    { id: 'w1', type: 'math', name: '数学', duration: '5h', interruptions: 4, points: '+450' },
    { id: 'w2', type: 'english', name: '英语', duration: '3h', interruptions: 2, points: '+320' },
    { id: 'w3', type: 'science', name: '科学', duration: '2h', interruptions: 5, points: '+180' },
    { id: 'w4', type: 'chinese', name: '语文', duration: '2h', interruptions: 1, points: '+210' },
  ]
};

export const MOCK_PAUSE_DATA = {
  today: [
    { name: '分心', value: 5, duration: 25, color: '#FF9EAA', icon: 'notifications_off' },
    { name: '难题', value: 3, duration: 45, color: '#30E3CA', icon: 'psychology' },
    { name: '喝水', value: 2, duration: 10, color: '#81C3FD', icon: 'water_drop' },
    { name: '噪音', value: 1, duration: 5, color: '#C0A3F2', icon: 'graphic_eq' },
    { name: '其他', value: 1, duration: 2, color: '#FFD54F', icon: 'more_horiz' },
  ],
  yesterday: [
    { name: '分心', value: 1, duration: 10, color: '#FF9EAA', icon: 'notifications_off' },
    { name: '难题', value: 1, duration: 15, color: '#30E3CA', icon: 'psychology' },
    { name: '其他', value: 1, duration: 5, color: '#FFD54F', icon: 'more_horiz' },
  ],
  week: [
    { name: '分心', value: 12, duration: 95, color: '#FF9EAA', icon: 'notifications_off' },
    { name: '难题', value: 8, duration: 120, color: '#30E3CA', icon: 'psychology' },
    { name: '喝水', value: 6, duration: 30, color: '#81C3FD', icon: 'water_drop' },
    { name: '噪音', value: 4, duration: 20, color: '#C0A3F2', icon: 'graphic_eq' },
    { name: '其他', value: 3, duration: 15, color: '#FFD54F', icon: 'more_horiz' },
  ]
};
