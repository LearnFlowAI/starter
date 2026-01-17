'use client';

import type React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../components/ui/Button';

export default function PauseReasonPage() {
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const reasons = [
    { id: 'water', icon: 'water_drop', label: '喝水/如厕', color: 'bg-sky-100 text-sky-500' },
    { id: 'distraction', icon: 'cloud', label: '分心走神', color: 'bg-gray-100 text-gray-500' },
    { id: 'problem', icon: 'psychology', label: '遇到难题', color: 'bg-orange-100 text-orange-500' },
    { id: 'noise', icon: 'graphic_eq', label: '环境干扰', color: 'bg-rose-100 text-rose-500' },
    { id: 'phone', icon: 'smartphone', label: '电子产品', color: 'bg-purple-100 text-purple-500' },
    { id: 'other', icon: 'more_horiz', label: '其他', color: 'bg-emerald-100 text-emerald-500' },
  ];

  const onConfirm = (reasonId: string) => {
    // In a real app, this would update a global state with the pause reason
    console.log('Pausing with reason:', reasonId);
    router.push('/timer'); // Navigate back to the timer
  };

  const onCancel = () => {
    router.back();
  };

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onCancel}
        onKeyDown={handleOverlayKeyDown}
        aria-label="关闭"
      />
      
      <div className="bg-white dark:bg-card-dark w-full max-w-md rounded-t-[3.5rem] p-8 pb-12 shadow-2xl relative z-10 animate-fade-in-up border-t border-white/20 dark:border-gray-800">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
        </div>

        <div className="mb-10 text-center">
          <h2 className="text-[24px] leading-tight font-black text-gray-800 dark:text-white tracking-tight">
            是什么打断了专注呢？
          </h2>
          <p className="text-sm font-bold text-gray-400 mt-2">点击选择原因并确认暂停</p>
        </div>
        
        <div className="grid grid-cols-3 gap-y-10 gap-x-4 mb-14">
          {reasons.map(reason => {
            const isSelected = selectedReason === reason.id;
            return (
              <button 
                key={reason.id} 
                onClick={() => setSelectedReason(reason.id)} 
                type="button"
                className="flex flex-col items-center gap-3 group outline-none"
              >
                <div className={`w-[78px] h-[78px] rounded-[28px] ${reason.color} flex items-center justify-center transition-all transform group-active:scale-90 shadow-sm border-2 ${isSelected ? 'border-primary ring-4 ring-primary/20 scale-105 shadow-md' : 'border-transparent'}`}>
                  <span className="material-icons-round text-[38px]">{reason.icon}</span>
                </div>
                <span className={`text-[13px] font-black tracking-wide transition-colors ${isSelected ? 'text-primary' : 'text-gray-500'}`}>
                  {reason.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 px-2">
          <Button 
            onClick={onCancel}
            className="flex-1 py-4.5 rounded-[2rem] bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-black text-[15px] border border-gray-100 dark:border-gray-700"
          >
            取消
          </Button>
          <Button 
            onClick={() => selectedReason && onConfirm(selectedReason)}
            disabled={!selectedReason}
            className={`flex-[1.8] py-4.5 rounded-[2rem] font-black text-[16px] shadow-lg ${
              selectedReason ? 'bg-primary text-white shadow-glow' : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed shadow-none'
            }`}
          >
            确认暂停
          </Button>
        </div>
      </div>
    </div>
  );
};
