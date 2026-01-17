'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Task, TaskType } from '../../types';
import { TASK_CONFIG, MOCK_TASKS } from '../../lib/constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function AddTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get('taskId');
  
  const existingTask = taskId ? MOCK_TASKS.find(t => t.id === taskId) : null;

  const [name, setName] = useState(existingTask?.name || '');
  const [type, setType] = useState<TaskType>(existingTask?.type || 'math');
  const [duration, setDuration] = useState(existingTask?.duration || 40);

  const isEditing = !!existingTask;

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    if (isEditing) {
      console.log('Updating task:', { ...existingTask, name, type, duration });
    } else {
      console.log('Adding new task:', { id: Math.random().toString(36).substr(2, 9), name, type, duration, progress: 0, rating: 0, isCompleted: false });
    }
    router.push('/dashboard');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-colors duration-200">
      <div className="w-full max-w-md bg-white dark:bg-card-dark rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] relative">
          <div className="flex justify-center pt-5 pb-3 sm:hidden">
            <div className="h-1.5 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
          </div>
        
        <div className="flex-1 overflow-y-auto px-8 pt-2 pb-32 no-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-wide text-gray-800 dark:text-white">{isEditing ? '编辑任务' : '添加新任务'}</h2>
            <Button variant="icon" icon="close" onClick={handleCancel} className="bg-gray-100 dark:bg-gray-700 text-gray-400"/>
          </div>

          <div className="grid grid-cols-3 gap-x-4 gap-y-8 mb-8">
            {(Object.keys(TASK_CONFIG) as TaskType[]).map(key => {
              const conf = TASK_CONFIG[key];
              const isSelected = type === key;
              return (
                <button 
                  key={key} 
                  onClick={() => setType(key)}
                  type="button"
                  className={`flex flex-col items-center gap-3 relative transition-all duration-220 ease-out ${isSelected ? 'scale-110' : 'opacity-60'}`}
                >
                  {isSelected && <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl scale-110" />}
                  <div className={`relative w-[4.5rem] h-[4.5rem] rounded-[1.2rem] ${conf.bgColor.replace('bg-', 'bg-')} dark:bg-gray-800 flex items-center justify-center shadow-clay ring-2 ${isSelected ? 'ring-primary' : 'ring-transparent'}`}>
                    <span className={`material-icons-round text-[36px] ${conf.color}`}>{conf.icon}</span>
                  </div>
                  <span className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-gray-400'}`}>{conf.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="task-name" className="block text-sm font-bold mb-3 ml-2 text-gray-800 dark:text-white">任务名称</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-300">
                  <span className="material-icons-round">edit</span>
                </div>
                <Input 
                  id="task-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-full placeholder-gray-300 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-lg text-gray-800 dark:text-white" 
                  placeholder="例如：完成第10页习题" 
                  type="text"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-end mb-5 ml-2">
                <label htmlFor="task-duration" className="text-lg font-bold text-gray-800 dark:text-white">预计时长</label>
                <span className="text-3xl font-black text-primary tracking-tight" data-testid="displayed-duration">{duration}<span className="text-sm font-bold text-gray-400 ml-1">min</span></span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-[2rem] border border-white dark:border-gray-700">
                                  <input 
                                    type="range" 
                                    min="5" max="120" step="5" 
                                    value={duration} 
                                    id="task-duration"
                                    onChange={(e) => setDuration(Number.parseInt(e.target.value))}
                                    className="w-full accent-primary h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    aria-label="预计时长"
                                  />                <div className="flex justify-between text-xs font-bold text-gray-300 mt-2 px-1">
                  <span>5min</span>
                  <span>60min</span>
                  <span>120min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-card-dark p-8 flex justify-center z-30">
          <Button 
            onClick={handleSubmit}
            className={`w-full bg-moss text-white text-lg font-bold py-4 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${!name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!name.trim()}
          >
            <span className="material-icons-round">{isEditing ? 'save' : 'add_task'}</span>
            {isEditing ? '确认修改' : '确认添加'}
          </Button>
        </div>
      </div>
    </div>
  );
};
