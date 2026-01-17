'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AppView, Task } from '../../types';
import NavBar from '../components/NavBar';
import { TASK_CONFIG, MOCK_STATS_DETAILS, MOCK_STATS_SUMMARY } from '../../lib/constants';
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Area, AreaChart } from 'recharts';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const WEEKLY_TREND_DATA = [
  { day: '一', mins: 120 }, { day: '二', mins: 150 }, { day: '三', mins: 90 },
  { day: '四', mins: 210 }, { day: '五', mins: 180 }, { day: '六', mins: 240 },
  { day: '日', mins: 195 },
];

export default function StatsPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]); // In a real app, this would come from a global state
  const [period, setPeriod] = useState<'today' | 'yesterday' | 'week'>('today');
  const [showAllDetails, setShowAllDetails] = useState(false);

  // Derive Today's stats from tasks for real-time linkage
  const baseFocusMinutes = 61;
  const listFocusMinutes = tasks.reduce((acc, t) => acc + Math.round(t.duration * (t.progress / 100)), 0);
  const todayTotalMins = baseFocusMinutes + listFocusMinutes;
  
  const todaySummary = {
    hours: Math.floor(todayTotalMins / 60),
    mins: todayTotalMins % 60,
    label: '今日专注'
  };

  const todayDetails = tasks.map(t => ({
    id: t.id, type: t.type, name: t.name,
    duration: `${Math.round(t.duration * (t.progress / 100))}m`,
    interruptions: 0, points: `+${Math.round(t.progress / 2)}`
  }));

  const currentSummary = period === 'today' ? todaySummary : MOCK_STATS_SUMMARY[period];
  const rawDetails = period === 'today' ? todayDetails : MOCK_STATS_DETAILS[period];
  const currentDetails = showAllDetails ? rawDetails : rawDetails.slice(0, 3);
  
  const totalInterruptions = rawDetails.reduce((sum, item) => sum + item.interruptions, 0);
  
  const onNavigate = (view: AppView) => router.push(`/${view}`);

  return (
    <div className="pb-36 bg-[#F8FAFB] dark:bg-background-dark min-h-screen">
      <header className="pt-8 px-6 mb-2">
        <h1 className="text-2xl font-black text-gray-800 dark:text-white">数据统计</h1>
        <p className="text-sm text-gray-500 font-medium">查看你的每一次进步与努力。</p>
      </header>

      <div className="px-6 flex justify-center mb-6">
        <div className="bg-white dark:bg-card-dark rounded-full p-1 shadow-sm flex items-center border border-gray-50 dark:border-gray-800">
          {(['today', 'yesterday', 'week'] as const).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => { setPeriod(p); setShowAllDetails(false); }}
              className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${period === p ? 'bg-primary text-white shadow-md' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600'}`}
            >
              {p === 'today' ? '今天' : p === 'yesterday' ? '昨天' : '本周'}
            </button>
          ))}
        </div>
      </div>

      <section className="px-6 flex flex-col items-center mb-6">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[14px] border-gray-50 dark:border-gray-800/50" />
            <div className="absolute inset-0 rounded-full overflow-hidden" style={{ background: 'conic-gradient(#FFD54F 0% 30%, #A7F3D0 30% 60%, #30E3CA 60% 100%)', WebkitMask: 'radial-gradient(transparent 65%, black 66%)' }} />
          <div className="flex flex-col items-center z-10" data-testid="donut-chart-summary">
            <div className="flex items-baseline">
              <span className="text-3xl font-black text-gray-800 dark:text-white tabular-nums tracking-tighter">{currentSummary.hours}</span>
              <span className="text-sm font-bold text-gray-400 ml-0.5 mr-1.5">h</span>
              <span className="text-3xl font-black text-gray-800 dark:text-white tabular-nums tracking-tighter">{currentSummary.mins}</span>
              <span className="text-sm font-bold text-gray-400 ml-0.5">m</span>
            </div>
            <span className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-widest uppercase">总时长</span>
          </div>
        </div>
        <div className="mt-6 text-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">{period === 'today' ? '今日专注分布' : period === 'yesterday' ? '昨日专注分布' : '本周专注分布'}</h2>
          <p className="text-xs text-gray-400 font-medium mt-0.5">你做得非常棒！</p>
        </div>
      </section>

      <section className="px-6 mb-8">
        <button type="button" onClick={() => onNavigate('pause-analysis')} className="w-full bg-rose-50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/20 rounded-[2.2rem] p-5 flex items-center group active:scale-[0.98] transition-all shadow-sm">
          <div className="flex items-center gap-5 w-full">
            <div className="w-14 h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-rose-500 shadow-card"><span className="material-icons-round text-3xl">notifications_paused</span></div>
            <div className="text-left flex-1">
              <h3 className="text-base font-black text-gray-800 dark:text-white leading-tight">{period === 'today' ? '今日' : period === 'yesterday' ? '昨日' : '本周'}中断分析</h3>
              <p className="text-[11px] font-bold text-gray-400 mt-0.5">查看影响专注效率的因素</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right"><span className="text-2xl font-black text-rose-500 tabular-nums">{totalInterruptions}</span><span className="text-xs font-bold text-gray-400 ml-1">次</span></div>
              <span className="material-icons-round text-gray-300 group-hover:text-primary transition-colors">chevron_right</span>
            </div>
          </div>
        </button>
      </section>

      <section className="px-6 mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-gray-800 dark:text-white tracking-tight">数据明细</h3>
          <Button onClick={() => setShowAllDetails(!showAllDetails)} className="text-primary text-xs font-bold flex items-center hover:opacity-80 transition-opacity">
            {showAllDetails ? '收起明细' : '查看全部'}
            <span className={`material-icons-round text-sm ml-0.5 transition-transform duration-300 ${showAllDetails ? 'rotate-90' : ''}`}>chevron_right</span>
          </Button>
        </div>
        <Card className="p-6">
          <div className="grid grid-cols-4 mb-4 text-[11px] font-black text-gray-300 dark:text-gray-500 uppercase tracking-widest pl-2">
            <span className="col-span-1">任务</span><span className="text-center">时长</span><span className="text-center">中断</span><span className="text-right pr-4">积分</span>
          </div>
          <div className="space-y-4">
            {currentDetails.map((item) => {
              const config = TASK_CONFIG[item.type as keyof typeof TASK_CONFIG] || TASK_CONFIG.math;
              return (
                <div key={item.id} className={`grid grid-cols-4 items-center p-3 rounded-2xl ${config.bgColor} dark:bg-opacity-10 transition-all active:scale-[0.98] cursor-pointer`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white dark:bg-gray-800 shadow-sm ${config.color}`}><span className="material-icons-round text-lg">{config.icon}</span></div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{item.name}</span>
                  </div>
                  <div className="text-center text-sm font-bold text-gray-400 tabular-nums">{item.duration}</div>
                  <div className="text-center text-sm font-bold text-gray-400 tabular-nums">{item.interruptions}</div>
                  <div className="text-right pr-2 text-sm font-black text-secondary tabular-nums">{item.points}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>

      <section className="px-6 pb-4">
        <h3 className="text-lg font-black text-gray-800 dark:text-white tracking-tight mb-4">本周学习趋势</h3>
        <Card className="p-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={WEEKLY_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs><linearGradient id="colorMins" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#30E3CA" stopOpacity={0.3}/><stop offset="95%" stopColor="#30E3CA" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9ca3af' }} dy={10}/>
              <YAxis hide domain={[0, 'dataMax + 50']}/>
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '12px' }} itemStyle={{ color: '#30E3CA' }} cursor={{ stroke: '#30E3CA', strokeWidth: 2, strokeDasharray: '5 5' }}/>
              <Area type="monotone" dataKey="mins" stroke="#30E3CA" strokeWidth={4} fillOpacity={1} fill="url(#colorMins)" animationDuration={1500} activeDot={{ r: 6, strokeWidth: 0, fill: '#30E3CA' }}/>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </section>

      <NavBar currentView="stats" onNavigate={onNavigate} />
    </div>
  );
};
