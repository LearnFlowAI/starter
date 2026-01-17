'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '../../types';
import { MOCK_TASKS } from '../../lib/constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Progress from '../components/ui/Progress';

const REASON_MAP: Record<string, { label: string; icon: string; color: string; bgColor: string; iconColor: string }> = {
  distraction: { label: '分心', icon: 'notifications_off', color: '#FF9EAA', bgColor: 'bg-rose-50', iconColor: 'text-rose-400' },
  problem: { label: '遇到难题', icon: 'psychology', color: '#30E3CA', bgColor: 'bg-teal-50', iconColor: 'text-teal-400' },
  water: { label: '喝水', icon: 'water_drop', color: '#81C3FD', bgColor: 'bg-blue-50', iconColor: 'text-blue-400' },
  noise: { label: '噪音', icon: 'graphic_eq', color: '#C0A3F2', bgColor: 'bg-purple-50', iconColor: 'text-purple-400' },
  phone: { label: '电子产品', icon: 'smartphone', color: '#A78BFA', bgColor: 'bg-indigo-50', iconColor: 'text-indigo-400' },
  other: { label: '其他', icon: 'more_horiz', color: '#FFD54F', bgColor: 'bg-yellow-50', iconColor: 'text-yellow-400' },
};

// Mock session data for now, in a real app this would come from a global state/context
const mockSession: Session = {
  id: 'session-1',
  taskId: MOCK_TASKS[0].id,
  taskName: MOCK_TASKS[0].name,
  duration: 2400, // 40 mins
  targetDuration: 2700, // 45 mins
  startTime: Date.now(),
  interruptionCount: 1,
  interruptions: [{ reasonId: 'distraction', startTime: Date.now(), duration: 60 }],
  completionLevel: 'most',
  rating: 4,
};


export default function SummaryPage() {
  const router = useRouter();
  const session = mockSession; // Use mocked session

  const onDone = () => {
    router.push('/dashboard');
  };

  const actualMins = Math.floor(session.duration / 60);
  const actualSecs = session.duration % 60;
  
  const targetMins = Math.floor(session.targetDuration / 60);
  const targetSecs = session.targetDuration % 60;

  const reasonStats = session.interruptions.reduce((acc, curr) => {
    if (!acc[curr.reasonId]) {
      acc[curr.reasonId] = { count: 0, duration: 0 };
    }
    acc[curr.reasonId].count += 1;
    acc[curr.reasonId].duration += curr.duration;
    return acc;
  }, {} as Record<string, { count: number; duration: number }>);

  const totalInterruptions = session.interruptionCount;

  const formatInterruptionDuration = (seconds: number) => {
    if (seconds === 0) return '0秒';
    if (seconds < 60) return `${seconds}秒`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}分${s}秒` : `${m}分`;
  };

  return (
      <div className="min-h-screen flex flex-col items-center px-6 py-8 relative overflow-hidden bg-background-light dark:bg-background-dark">
        <div className="absolute top-[-10%] right-[-20%] w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      
      <header className="w-full flex items-center justify-between mb-8 z-10">
        <Button variant="icon" icon="arrow_back" onClick={onDone} className="bg-white dark:bg-card-dark shadow-sm text-slate-400"/>
        <div className="text-sm font-black tracking-wide text-gray-700 dark:text-gray-200 uppercase">{session.taskName}</div>
        <Button variant="icon" icon="share" className="bg-white dark:bg-card-dark shadow-sm text-slate-400"/>
      </header>

      <section className="flex flex-col items-center mb-8 z-10 w-full">
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full border-8 border-white dark:border-slate-800 shadow-soft flex items-center justify-center bg-gradient-to-tr from-teal-50 to-teal-100 dark:from-slate-800 dark:to-slate-700 relative">
              <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />
            <span className="material-icons-round text-5xl text-primary drop-shadow-sm">emoji_events</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-secondary text-gray-800 text-[10px] font-black px-3 py-1 rounded-full shadow-md border-2 border-white dark:border-slate-800">+50 EXP</div>
        </div>

        <div className="flex gap-4 w-full max-w-sm">
           <Card className="flex-1 p-5 flex flex-col items-center">
             <span className="text-[11px] font-black text-gray-400 uppercase mb-2">预计用时</span>
             <span className="text-lg font-black text-gray-600 dark:text-gray-300 tabular-nums">
               {targetMins}<span className="text-xs font-bold ml-0.5">分</span>
               {targetSecs > 0 ? <>{targetSecs}<span className="text-xs font-bold ml-0.5">秒</span></> : ''}
             </span>
           </Card>
           <Card className="flex-1 p-5 flex flex-col items-center bg-teal-50/60 dark:bg-teal-900/10 border-primary/20">
             <span className="text-[11px] font-black text-primary/80 uppercase mb-2">实际用时</span>
             <span className="text-lg font-black text-primary tabular-nums">
               {actualMins}<span className="text-xs font-bold ml-0.5 text-primary/60">分</span>
               {actualSecs}<span className="text-xs font-bold ml-0.5 text-primary/60">秒</span>
             </span>
           </Card>
        </div>
      </section>

      <div className="w-full space-y-4 mb-8 z-10">
        <Card className="p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="material-icons-round text-orange-400">warning_amber</span>
              <h3 className="text-base font-black text-gray-800 dark:text-white">中断记录</h3>
            </div>
            <div className="flex items-baseline">
                <span className="text-xl font-black text-orange-500 tabular-nums">{totalInterruptions}</span>
                <span className="text-[10px] text-gray-400 font-black ml-1 uppercase">次</span>
            </div>
          </div>
          
          {totalInterruptions > 0 ? (
            <div className="space-y-6">
              {Object.entries(reasonStats).map(([rid, stats]) => {
                const info = REASON_MAP[rid] || REASON_MAP.other;
                const percentage = Math.round((stats.count / totalInterruptions) * 100);
                return (
                  <div key={rid} className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full ${info.bgColor} dark:bg-opacity-10 flex items-center justify-center shadow-sm`} style={{ color: info.color }}>
                      <span className="material-icons-round text-2xl">{info.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h4 className="text-[15px] font-black text-gray-800 dark:text-white leading-tight">{info.label}</h4>
                          <p className="text-[11px] font-bold text-gray-400 mt-0.5">{stats.count}次 · 共{formatInterruptionDuration(stats.duration)}</p>
                        </div>
                        <span className="text-[11px] font-black text-gray-400 tabular-nums">{percentage}%</span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-5 text-center text-xs font-bold text-teal-500 bg-teal-50 dark:bg-teal-900/20 rounded-[1.8rem] flex items-center justify-center gap-2">
              <span className="material-icons-round text-lg">rocket_launch</span>
              真棒！全程专注，无任何中断
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-5 w-full z-10 mb-10">
        <Card className="p-7">
          <div className="flex items-center mb-6 px-2">
            <span className="material-icons-round text-primary mr-3 bg-teal-50 dark:bg-teal-900/30 p-2 rounded-xl text-lg">stars</span>
            <h2 className="text-base font-black text-gray-800 dark:text-white">完成质量</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ emoji: '💯', label: '极好', id: 'best' }, { emoji: '👍', label: '不错', id: 'good' }, { emoji: '🤔', label: '一般', id: 'meh' }].map((item, idx) => (
              <label key={item.id} className="cursor-pointer group">
                <input type="radio" name="completion" className="sr-only peer" defaultChecked={idx === 0} />
                <div className="flex flex-col items-center justify-center p-4 rounded-[2rem] bg-gray-50 dark:bg-gray-800 border-2 border-transparent peer-checked:border-primary peer-checked:bg-teal-50 dark:peer-checked:bg-teal-900/20 transition-all shadow-sm">
                  <span className="text-3xl mb-2">{item.emoji}</span>
                  <span className="text-[12px] font-black text-gray-400 peer-checked:text-primary tracking-wide">{item.label}</span>
                </div>
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-auto pt-4 w-full z-10">
        <Button onClick={onDone} className="w-full bg-primary hover:bg-teal-500 text-white font-black py-4.5 px-6 rounded-[2.2rem] shadow-glow flex items-center justify-center transition-all active:scale-95 text-lg tracking-wider">
          保存并退出
          <span className="material-icons-round ml-2">check_circle</span>
        </Button>
      </div>
    </div>
  );
};
