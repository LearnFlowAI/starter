'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { TASK_CONFIG, MOCK_TASKS } from '../../lib/constants';
import NavBar from '../components/NavBar';
import type { Task, AppView, TaskType } from '../../types';
import { useLocalState } from '../lib/storage';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Progress from '../components/ui/Progress';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { useToast } from '../components/Toast';

export default function DashboardPage() {
  const [tasks, setTasks] = useLocalState<Task[]>('lf_all_tasks', MOCK_TASKS);
  const [activeTaskId, setActiveTaskId] = useLocalState<string | null>('lf_active_task_id', null);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [focusView, setFocusView] = useState<'planned' | 'actual'>('planned');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftType, setDraftType] = useState<TaskType>('math');
  const [draftDuration, setDraftDuration] = useState(30);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const router = useRouter();
  const { showToast } = useToast();

  const onNavigate = (view: AppView) => {
    router.push(`/${view}`);
  };

  const handleTaskClick = (task: Task) => {
    if (!task.isCompleted) {
      setActiveTaskId(task.id);
      router.push('/timer');
    }
  };

  const onToggleTheme = () => {
    // Implement theme toggle if needed, or leave as a placeholder
  };

  const completedTasksCount = tasks.filter(t => t.isCompleted).length;
  const allTasksCompleted = tasks.length > 0 && tasks.every(t => t.isCompleted);

  useEffect(() => {
    if (focusView === 'actual' && !allTasksCompleted) {
      setFocusView('planned');
    }
  }, [focusView, allTasksCompleted]);

  // This effect polls localStorage to check if the timer is active elsewhere
  useEffect(() => {
    const interval = setInterval(() => {
      const timerStatus = localStorage.getItem('lf_timer_status');
      if (timerStatus) {
        const { taskId, isActive } = JSON.parse(timerStatus);
        setActiveTaskId(taskId);
        setIsTimerActive(isActive);
      } else {
        if(activeTaskId) setActiveTaskId(null);
        setIsTimerActive(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTaskId, setActiveTaskId]);


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

  const notifications = [
    {
      id: 'note-1',
      title: '今日目标已更新',
      detail: '新增 1 个任务，预计专注 95 分钟。',
      time: '刚刚',
      tone: 'bg-primary/10 text-primary'
    },
    {
      id: 'note-2',
      title: '专注建议',
      detail: '番茄钟 25 分钟后记得拉伸 2 分钟。',
      time: '10 分钟前',
      tone: 'bg-amber-100 text-amber-600'
    },
    {
      id: 'note-3',
      title: '进度反馈',
      detail: '英语任务已完成 100%，做得很好。',
      time: '1 小时前',
      tone: 'bg-emerald-100 text-emerald-600'
    }
  ];
  const hasNotifications = notifications.length > 0;

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setDraftName(task.name);
    setDraftType(task.type);
    setDraftDuration(task.duration);
    setIsEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((item) =>
        item.id === editingTask.id
          ? {
              ...item,
              name: draftName.trim() || item.name,
              type: draftType,
              duration: Math.max(1, Number.isFinite(draftDuration) ? draftDuration : item.duration)
            }
          : item
      )
    );
    setIsEditOpen(false);
    setEditingTask(null);
    showToast('success', '任务已更新');
  };

  const handleDeleteRequest = (task: Task) => {
    setDeleteTarget(task);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setTasks((prev) => prev.filter((task) => task.id !== deleteTarget.id));
    if (activeTaskId === deleteTarget.id) {
      setActiveTaskId(null);
      setIsTimerActive(false);
      localStorage.removeItem('lf_timer_status');
    }
    setIsDeleteOpen(false);
    setDeleteTarget(null);
    showToast('warning', '任务已删除');
  };

  const canToggleTasks = tasks.length > 3;
  const displayedTasks = showAllTasks || !canToggleTasks ? tasks : tasks.slice(0, 3);

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
        <Button
          variant="icon"
          icon="notifications"
          aria-label="打开通知"
          onClick={() => setIsNotificationsOpen(true)}
          className="relative text-primary bg-white dark:bg-card-dark rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700"
        >
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
            className={`text-sm font-medium transition-colors flex items-center gap-1 ${
              canToggleTasks
                ? 'text-primary hover:text-teal-600'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            type="button"
            disabled={!canToggleTasks}
          >
            {canToggleTasks ? (showAllTasks ? '收起' : '查看全部') : '已全部展示'}
            {canToggleTasks && (
              <span
                className="material-icons-round text-xs transition-transform"
                style={{ transform: showAllTasks ? 'rotate(180deg)' : 'none' }}
              >
                expand_more
              </span>
            )}
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
                    onClick={() => handleTaskClick(task)}
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
                    <Button
                      variant="icon"
                      icon="edit"
                      aria-label="编辑任务"
                      onClick={() => handleOpenEdit(task)}
                      className="text-gray-200 hover:text-primary"
                    />
                    <Button
                      variant="icon"
                      icon="delete_outline"
                      aria-label="删除任务"
                      onClick={() => handleDeleteRequest(task)}
                      className="text-gray-200 hover:text-rose-500"
                    />
                  </div>
                </div>
                <Progress value={task.progress} />
              </Card>
            );
          })}
        </div>
      </div>

      <NavBar currentView="dashboard" onNavigate={onNavigate} />

      <Modal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        contentClassName="w-full sm:w-[380px] sm:ml-auto h-[85vh] sm:h-[calc(100vh-3rem)] rounded-t-3xl sm:rounded-3xl overflow-hidden"
      >
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
          <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">通知中心</h3>
              <p className="text-xs text-gray-400 mt-1">关注你的专注动态</p>
            </div>
            <Button
              variant="ghost"
              aria-label="关闭通知"
              onClick={() => setIsNotificationsOpen(false)}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              关闭
            </Button>
          </div>

          <div className="flex-1 overflow-auto px-5 py-4 space-y-3">
            {hasNotifications ? (
              notifications.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60"
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${note.tone}`}>
                      提醒
                    </span>
                    <span className="text-[10px] text-gray-400">{note.time}</span>
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-gray-800 dark:text-white">{note.title}</h4>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{note.detail}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <span className="material-icons-round text-2xl">notifications_off</span>
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-700 dark:text-gray-200">暂无新通知</p>
                <p className="mt-1 text-xs text-gray-400">完成任务后会提醒你。</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        contentClassName="w-full sm:w-[420px] rounded-3xl overflow-hidden"
      >
        <div className="bg-white dark:bg-gray-900 p-6 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">编辑任务</h3>
            <p className="text-xs text-gray-400 mt-1">调整任务信息并保存到今日计划。</p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-500" htmlFor="edit-task-name">
              任务名称
            </label>
            <Input
              id="edit-task-name"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="请输入任务名称"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-500" htmlFor="edit-task-type">
              科目
            </label>
            <select
              id="edit-task-type"
              value={draftType}
              onChange={(event) => setDraftType(event.target.value as TaskType)}
              className="w-full border border-gray-300 rounded py-2 px-3 text-text-main-light dark:text-text-main-dark bg-card-light dark:bg-card-dark focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
            >
              {Object.entries(TASK_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-gray-500" htmlFor="edit-task-duration">
              预计时长(分钟)
            </label>
            <Input
              id="edit-task-duration"
              type="number"
              min={1}
              value={draftDuration}
              onChange={(event) => setDraftDuration(Number(event.target.value))}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
              取消
            </Button>
            <Button onClick={handleEditSave}>
              保存修改
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        contentClassName="w-full sm:w-[360px] rounded-3xl overflow-hidden"
      >
        <div className="bg-white dark:bg-gray-900 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center">
              <span className="material-icons-round">delete_outline</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">确认删除</h3>
              <p className="text-xs text-gray-400">该操作无法撤销</p>
            </div>
          </div>
          <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-500">
            任务 “{deleteTarget?.name ?? ''}” 将从今日清单中移除。
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
              取消
            </Button>
            <Button onClick={handleDeleteConfirm}>
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
