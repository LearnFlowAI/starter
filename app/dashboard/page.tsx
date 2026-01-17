'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { TASK_CONFIG, MOCK_TASKS } from '../../lib/constants';
import NavBar from '../components/NavBar';
import type { Task, AppView } from '../../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Progress from '../components/ui/Progress';
import Badge from '../components/ui/Badge';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | undefined>(undefined);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [focusView, setFocusView] = useState<'planned' | 'actual'>('planned');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    const savedTasks = localStorage.getItem('lf_all_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(MOCK_TASKS);
    }
  }, []);

  const onNavigate = (view: AppView) => {
    router.push(`/${view}`);
  };

  const onToggleTheme = () => {
    // Implement theme toggle if needed, or leave as a placeholder
  };

  const completedTasksCount = tasks.filter(t => t.isCompleted).length;
  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.isCompleted);

  if (focusView === 'actual' && !allTasksCompleted) {
    setFocusView('planned');
  }

  const plannedChartData = tasks.map(t => ({
    name: t.name,
    value: t.duration,
    color: TASK_CONFIG[t.type].hex,
  })).filter(d => d.value > 0);

  const actualChartData = tasks
    .filter(t => t.isCompleted)
    .map(t => ({
      name: t.name,
      value: t.duration,
      color: TASK_CONFIG[t.type].hex,
    })).filter(d => d.value > 0);

  const actualMinutes = actualChartData.reduce((acc, d) => acc + d.value, 0);
  const plannedMinutes = tasks.reduce((acc, t) => acc + t.duration, 0);

  const formatMinsToHms = (totalMins: number) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0) return { h, m, display: `${h}h${m.toString().padStart(2, '0')}m` };
    return { h: 0, m, display: `${m}m` };
  };

  const actualTime = formatMinsToHms(actualMinutes);
  const plannedTime = formatMinsToHms(plannedMinutes);

  const currentChartData = focusView === 'actual' ? actualChartData : plannedChartData;
  const currentTime = focusView === 'actual' ? actualTime : plannedTime;

  const hasData = currentChartData.length > 0;
  const displayData = hasData ? currentChartData : [{ name: '无数据', value: 1, color: '#e5e7eb' }];

  const centralLabel = activeIndex !== null && hasData ? displayData[activeIndex].name : '今日专注';
  const centralValueMins = activeIndex !== null && hasData ? displayData[activeIndex].value : null;
  const formattedCentralValue = centralValueMins !== null ? formatMinsToHms(centralValueMins) : currentTime;

  const onPieEnter = (_: unknown, index: number) => setActiveIndex(index);
  const onPieLeave = () => setActiveIndex(null);
  const onPieClick = (_: unknown, index: number) => setActiveIndex(activeIndex === index ? null : index);

  const displayedTasks = showAllTasks ? tasks : tasks.slice(0, 3);

  return (
    <div className="pb-32">
      <header className="pt-8 pb-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm cursor-pointer"
            onClick={onToggleTheme}
            type="button"
          >
            <img alt="用户头像" className="w-full h-full object-cover" src="https://picsum.photos/seed/user/100/100"/>
          </button>
          <div>
            <h1 className="text-xl font-bold leading-tight text-gray-800 dark:text-white">你好, 小明!</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">我们来学点新东西吧。</p>
          </div>
        </div>
        <Button variant="icon" icon="notifications" className="relative text-primary bg-white dark:bg-card-dark rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700">
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800" />
        </Button>
      </header>

      {activeTaskId && (
        <div className="px-6 mb-4 animate-fade-in">
          <button 
            onClick={() => onNavigate('timer')}
            className={`w-full border p-4 rounded-2xl flex items-center justify-between group active:scale-95 transition-all ${
              isTimerActive 
              ? 'bg-primary/10 border-primary/20' 
              : 'bg-secondary/10 border-secondary/20'
            }`}
            type="button"
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                {isTimerActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isTimerActive ? 'bg-primary' : 'bg-secondary'}`} />
              </span>
              <span className={`text-sm font-bold ${isTimerActive ? 'text-primary' : 'text-orange-600'}`}>
                {isTimerActive ? '正在进行专注任务...' : '专注任务已暂停'}
              </span>
            </div>
            <span className={`material-icons-round ${isTimerActive ? 'text-primary' : 'text-secondary'}`}>
              {isTimerActive ? 'arrow_forward_ios' : 'pause_circle_filled'}
            </span>
          </button>
        </div>
      )}

      <div className="px-6 mb-2">
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
           <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">今日专注概览</h2>
           <Badge>LIVE</Badge>
        </div>
      </div>

      <div className="px-6 mb-6 flex flex-col items-center relative z-0">
          <div className="relative w-72 h-72 flex items-center justify-center">
            <div className="absolute inset-8 bg-primary/10 blur-[80px] rounded-full" />
          
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.05)', fontWeight: '700', fontSize: '12px' }}
                formatter={(value: number) => [`${value} 分钟`, focusView === 'actual' ? '实际用时' : '预计时长']}
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
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                onClick={onPieClick}
                animationDuration={800}
                animationBegin={0}
              >
                {displayData.map((entry, index) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={entry.color} 
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.6}
                    stroke={activeIndex === index ? '#fff' : 'none'}
                    strokeWidth={2}
                    style={{ transition: 'all 0.3s ease', cursor: 'pointer', filter: activeIndex === index ? 'drop-shadow(0 0 8px rgba(0,0,0,0.1))' : 'none' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="flex items-baseline animate-fade-in" key={activeIndex === null ? 'total' : 'slice'}>
              <span className={`text-4xl font-black tabular-nums tracking-tighter ${activeIndex !== null ? 'text-primary' : 'text-gray-800 dark:text-white'}`}>
                {formattedCentralValue.h > 0 && <>{formattedCentralValue.h}<span className="text-lg ml-0.5 font-bold text-gray-400">h</span></>}
                {formattedCentralValue.m}<span className="text-lg ml-0.5 font-bold text-gray-400">m</span>
              </span>
            </div>
            <span className={`text-[10px] tracking-[0.2em] font-black uppercase mt-1 transition-colors ${activeIndex !== null ? 'text-primary' : 'text-secondary'}`}>
              {centralLabel}
            </span>
          </div>
        </div>
        
        <div className="mt-[-10px] mb-4 text-center">
          <div className="inline-flex bg-white dark:bg-gray-800 p-1.5 rounded-full border border-gray-100 dark:border-gray-700 shadow-sm items-center transition-all overflow-hidden">
            <button 
              onClick={() => setFocusView('planned')}
              className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${focusView === 'planned' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white' : 'text-gray-400'}`}
              type="button"
            >
              预计 <span className={focusView === 'planned' ? 'text-gray-800 dark:text-white' : 'text-gray-400'}>{plannedTime.display}</span>
            </button>
            {allTasksCompleted && (
              <>
                <span className="w-px h-3 bg-gray-100 dark:bg-gray-700 mx-1" />
                <button 
                  onClick={() => setFocusView('actual')}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${focusView === 'actual' ? 'bg-teal-50 dark:bg-teal-900/30 text-primary' : 'text-gray-400'}`}
                  type="button"
                >
                  实际 <span className={focusView === 'actual' ? 'text-primary' : 'text-gray-400'}>{actualTime.display}</span>
                </button>
              </>
            )}
          </div>
        </div>

          {hasData && (
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 max-w-sm animate-fade-in" key={`legend-${focusView}`}>
            {currentChartData.map((item, idx) => (
              <div 
                key={`${item.name}-${idx}`} 
                className={`flex items-center gap-1.5 transition-opacity cursor-pointer ${activeIndex !== null && activeIndex !== idx ? 'opacity-40' : 'opacity-100'}`}
                onMouseEnter={() => setActiveIndex(idx)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] font-bold text-gray-400 truncate max-w-[80px]">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">今日任务 ({completedTasksCount}/{tasks.length})</h2>
          <button 
            onClick={() => setShowAllTasks(!showAllTasks)}
            className="text-sm font-medium text-primary hover:text-teal-600 transition-colors flex items-center gap-1"
            type="button"
          >
            {showAllTasks ? '收起' : '查看全部'}
            <span className="material-icons-round text-xs transition-transform" style={{ transform: showAllTasks ? 'rotate(180deg)' : 'none' }}>expand_more</span>
          </button>
        </div>
        <div className="space-y-4">
          {displayedTasks.map(task => {
            const config = TASK_CONFIG[task.type];
            return (
              <Card 
                key={task.id} 
                className={`flex flex-col gap-4 group hover:shadow-soft transition-all duration-300 relative animate-fade-in ${task.isCompleted ? 'opacity-80' : ''} ${activeTaskId === task.id ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 shadow-glow' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <button
                    type="button"
                    className="flex items-center gap-4 cursor-pointer flex-1 text-left"
                    onClick={() => { if (!task.isCompleted) router.push('/timer'); }}
                  >
                    <div className={`w-12 h-12 rounded-2xl ${config.bgColor} dark:bg-opacity-10 flex items-center justify-center ${config.color}`}>
                      <span className="material-icons-round text-2xl">{config.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800 dark:text-white leading-tight truncate">{config.label} - {task.name}</h3>
                        {activeTaskId === task.id && (
                          <Badge className={`px-2 py-0.5 text-[8px] font-bold uppercase shrink-0 transition-colors ${isTimerActive ? 'bg-primary text-white animate-pulse' : 'bg-secondary text-gray-800'}`}>
                            {isTimerActive ? '进行中' : '已暂停'}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="text-[11px] font-bold text-gray-400">预计 {task.duration}m</span>
                        {task.isCompleted && (
                          <>
                            <span className="w-px h-2.5 bg-gray-100 dark:bg-gray-800" />
                            <span className="text-[11px] font-bold text-primary">实际 {Math.round(task.duration * (task.progress / 100))}m</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                  
                  <div className="flex gap-2 items-center">
                    <Button variant="icon" icon="edit" className="text-gray-200 hover:text-primary" />
                    <Button variant="icon" icon="delete_outline" className="text-gray-200 hover:text-rose-500" />
                  </div>
                </div>
                <Progress value={task.progress} />
              </Card>
            );
          })}
        </div>
      </div>

      <NavBar currentView="dashboard" onNavigate={onNavigate} />
    </div>
  );
};
