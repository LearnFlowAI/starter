'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_TASKS } from '../../lib/constants';
import type { Task, AppView } from '../../types';
import Button from '../components/ui/Button';

// TODO: Implement Gemini TTS
const speak = async (text: string) => {
  console.log(`TTS (stubbed): ${text}`);
};

export default function TimerPage() {
  const router = useRouter();
  
  // For now, we'll use a hardcoded task and manage state locally
  // In a real app, this would come from a global state/context
  const [task, setTask] = useState<Task>(MOCK_TASKS[0]);
  const [remainingSeconds, setRemainingSeconds] = useState(task.duration * 60);
  const [isActive, setIsActive] = useState(true);
  const [interruptionCount, setInterruptionCount] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);

  const [isSoundOn, setIsSoundOn] = useState(false);
  const [pressProgress, setPressProgress] = useState(0); 
  const [currentPauseDuration, setCurrentPauseDuration] = useState(0);
  const pressTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseIntervalRef = useRef<number | null>(null);
  
  const PRESS_DURATION = 2000; 

  const totalSeconds = task.duration * 60;
  const isOvertime = remainingSeconds < 0;
  
  const formatTime = (totalSec: number) => {
    const absSec = Math.abs(totalSec);
    const mins = Math.floor(absSec / 60);
    const secs = absSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const onNavigate = (view: AppView) => {
    router.push(`/${view}`);
  };

  const onTogglePause = () => {
    setIsActive(!isActive);
    if (isActive) { // If it was active, now it's paused
      setPauseStartTime(Date.now());
      setInterruptionCount(prev => prev + 1);
    } else { // If it was paused, now it's active
      setPauseStartTime(null);
    }
  };

  const onFinish = () => {
    // Navigate to a summary page or back to dashboard
    router.push('/dashboard');
  };

  const handleToggleSound = () => {
    const newState = !isSoundOn;
    setIsSoundOn(newState);
    if (newState) speak("提示音已开启");
  };

  const handleFinishWithSound = () => {
    if (isSoundOn) speak("恭喜！你已完成本次专注任务。");
    onFinish();
  };

  useEffect(() => {
    if (!isActive && pauseStartTime) {
      pauseIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - pauseStartTime) / 1000);
        setCurrentPauseDuration(elapsed);
      }, 1000);
    } else {
      if (pauseIntervalRef.current) clearInterval(pauseIntervalRef.current);
      setCurrentPauseDuration(0);
    }
    return () => {
      if (pauseIntervalRef.current) clearInterval(pauseIntervalRef.current);
    };
  }, [isActive, pauseStartTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if(isActive) {
        timer = setInterval(() => {
            setRemainingSeconds(prev => prev - 1);
        }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive])

  const strokeDashoffset = isOvertime 
    ? 0 
    : 282.7 * (1 - remainingSeconds / totalSeconds);

  const startPress = () => {
    startTimeRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / PRESS_DURATION) * 100, 100);
      setPressProgress(progress);
      if (progress < 100) {
        pressTimerRef.current = requestAnimationFrame(tick);
      } else {
        cancelPress();
        handleFinishWithSound();
        if ('vibrate' in navigator) navigator.vibrate(200);
      }
    };
    pressTimerRef.current = requestAnimationFrame(tick);
  };

  const cancelPress = () => {
    if (pressTimerRef.current) cancelAnimationFrame(pressTimerRef.current);
    setPressProgress(0);
  };

  useEffect(() => {
    return () => { if (pressTimerRef.current) cancelAnimationFrame(pressTimerRef.current); };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center px-6 transition-colors duration-1000 ${isActive ? (isOvertime ? 'bg-orange-50/50 dark:bg-orange-950/20' : 'bg-teal-50/60 dark:bg-teal-950/20') : 'bg-gray-100 dark:bg-gray-900'}`}>
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`absolute top-1/4 -left-20 w-96 h-96 ${isOvertime ? 'bg-orange-400/5' : 'bg-primary/5'} rounded-full blur-[120px] animate-pulse`} />
        <div className={`absolute bottom-1/4 -right-20 w-96 h-96 ${isOvertime ? 'bg-yellow-400/5' : 'bg-secondary/5'} rounded-full blur-[120px] animate-pulse`} style={{ animationDelay: '2s' }} />
      </div>

      <header className="w-full pt-12 pb-4 flex items-center justify-between z-10">
        <Button variant="icon" icon="chevron_left" onClick={() => onNavigate('dashboard')} className="bg-white dark:bg-card-dark shadow-sm text-gray-400"/>
        
        <div className="flex flex-col items-center">
          <h1 className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 ml-1">专注模式</h1>
          <div className="flex items-center gap-1.5 mt-1 bg-white/40 dark:bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? (isOvertime ? 'bg-orange-500' : 'bg-primary') : 'bg-gray-400'}`} />
            <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? (isOvertime ? 'text-orange-500' : 'text-primary') : 'text-gray-400'}`}>
              {isActive ? (isOvertime ? '额外专注中' : '进行中') : '专注已暂停'}
            </span>
          </div>
        </div>

        <button 
          onClick={handleToggleSound}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm border ${
            isSoundOn 
            ? 'bg-primary text-white border-primary shadow-glow ring-4 ring-primary/10' 
            : 'bg-white dark:bg-card-dark text-gray-400 border-gray-100 dark:border-gray-800'
          }`}
          type="button"
        >
          <span className="material-icons-round text-xl">{isSoundOn ? 'volume_up' : 'volume_off'}</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        {!isActive && pauseStartTime && (
          <div className="absolute top-0 transform -translate-y-16 animate-fade-in-up">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-5 py-2.5 rounded-[2rem] shadow-xl border border-primary/10 flex flex-col items-center">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-60">当前暂停时长</span>
              <span className="text-xl font-black text-primary tabular-nums">{formatTime(currentPauseDuration)}</span>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white/80 dark:bg-card-dark/80 backdrop-blur-sm shadow-soft border border-gray-100 dark:border-gray-700">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">目标:</span>
            <span className="text-sm font-black text-gray-800 dark:text-white">{task.name}</span>
          </div>
        </div>

        <div className="relative mb-12">
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center -z-10 overflow-visible">
              <div className={`absolute w-72 h-72 rounded-full ${isOvertime ? 'bg-orange-400/10' : 'bg-primary/10'} animate-soft-ripple-1`} />
               <div className={`absolute w-72 h-72 rounded-full ${isOvertime ? 'bg-orange-400/8' : 'bg-primary/8'} animate-soft-ripple-2`} />
               <div className={`absolute w-72 h-72 rounded-full ${isOvertime ? 'bg-orange-400/5' : 'bg-primary/5'} animate-soft-ripple-3`} />
            </div>
          )}

          <div className={`relative w-72 h-72 flex items-center justify-center transition-transform duration-700 ${isActive ? 'scale-105' : 'scale-100 opacity-90'}`}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100" role="img" aria-label="专注计时进度">
              <title>专注计时进度</title>
              <circle 
                className="text-gray-100 dark:text-gray-800 stroke-current" 
                cx="50" cy="50" r="45" fill="transparent" strokeWidth="3"
              />
              <circle 
                className={`transition-all duration-1000 ease-linear ${isActive ? (isOvertime ? 'text-orange-400' : 'text-primary') : 'text-gray-400'}`} 
                cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" 
                strokeWidth="4" strokeLinecap="round"
                strokeDasharray="282.7" 
                strokeDashoffset={282.7 - strokeDashoffset}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <div className="flex items-center">
                {isOvertime && <span className="text-3xl font-bold text-orange-500 mr-1 mt-1 animate-pulse">+</span>}
                <span className={`text-6xl font-black tracking-tighter tabular-nums transition-colors ${isActive ? (isOvertime ? 'text-orange-500' : 'text-gray-800 dark:text-white') : 'text-gray-400'}`}>
                  {formatTime(remainingSeconds)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-4 bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-full border border-gray-100 dark:border-gray-700 shadow-card backdrop-blur-sm">
                <span className={`material-icons-round text-sm ${interruptionCount > 0 ? 'text-orange-400' : 'text-gray-300'}`}>warning_amber</span>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">打断次数: {interruptionCount}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-6 px-4">
          <button 
            onClick={onTogglePause}
            className={`group flex flex-col items-center py-6 px-6 rounded-[2.5rem] transition-all active:scale-95 shadow-soft border ${isActive ? 'bg-white dark:bg-gray-800 border-gray-100' : 'bg-primary/5 dark:bg-primary/10 border-primary/20'}`}
            type="button"
          >
            <div className={`p-4 rounded-3xl text-white shadow-lg mb-3 transition-all ${isActive ? 'bg-secondary' : 'bg-primary rotate-180'}`}>
              <span className="material-icons-round text-3xl">{isActive ? 'pause' : 'play_arrow'}</span>
            </div>
            <span className={`text-sm font-black tracking-wide ${isActive ? 'text-secondary' : 'text-primary'}`}>
              {isActive ? '休息一下' : '继续专注'}
            </span>
          </button>
          
          <button 
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            className={`group relative flex flex-col items-center py-6 px-6 rounded-[2.5rem] transition-all shadow-soft border select-none overflow-hidden ${isOvertime ? 'bg-moss/5 dark:bg-moss/10 border-moss/20' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100/50'} ${pressProgress > 0 ? 'scale-95' : 'active:scale-95'}`}
            type="button"
          >
            <div className={`relative p-4 rounded-3xl text-white shadow-lg mb-3 z-10 overflow-hidden ${isOvertime ? 'bg-moss' : 'bg-red-400'}`}>
              <div 
                className="absolute inset-0 bg-black/20 origin-left transition-transform duration-75 pointer-events-none" 
                style={{ transform: `scaleX(${pressProgress / 100})` }}
              />
              <span className="material-icons-round text-3xl relative z-10">stop</span>
            </div>
            <span className={`text-sm font-black tracking-wide relative z-10 ${isOvertime ? 'text-moss' : 'text-rose-600'}`}>
              {pressProgress > 0 ? '请按住...' : '完成任务'}
            </span>
          </button>
        </div>
      </main>

      <footer className="w-full pb-12 flex justify-center z-10 px-8 text-center">
        <p className="text-xs text-gray-400 font-bold leading-relaxed tracking-wide opacity-80">
          {pressProgress > 0 
            ? '继续按住以确认完成任务' 
            : (isOvertime ? '太棒了！你已经超越了预设目标 🚀' : (isActive ? '专注时请尽量保持手机屏幕常亮' : '休息好了吗？点击继续专注吧'))
          }
        </p>
      </footer>
    </div>
  );
};
