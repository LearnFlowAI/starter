'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    // In a real app, this would involve actual authentication
    // For now, simulate success and navigate
    router.push('/dashboard');
  };

  return (
    <div className="relative h-screen flex flex-col justify-center px-8 overflow-hidden bg-[#FDFCF8] dark:bg-background-dark">
      {/* Background blur elements */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-yellow-200/40 rounded-full blur-[80px]" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/30 rounded-full blur-[80px]" />

      <div className="relative z-10 w-full bg-white/90 dark:bg-card-dark/90 backdrop-blur-xl rounded-[2.5rem] shadow-card p-8 border border-white dark:border-gray-800">
        <div className="flex flex-col items-center mb-10">
          <div className="w-32 h-32 mb-6 relative">
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-yellow-100 to-white shadow-soft flex items-center justify-center border-4 border-white overflow-hidden">
              <img alt="Mascot" className="w-full h-full object-cover" src="https://picsum.photos/seed/learnflow/200/200"/>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-sm">
              <span className="material-icons-round text-secondary text-xl">waving_hand</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 dark:text-white">欢迎来到 LearnFlow</h1>
          <p className="text-sm text-gray-400 mt-2 font-medium">每天进步一点点</p>
        </div>

        <div className="space-y-4">
          {/* Username/Phone Input Group */}
          <div className="h-14 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl px-4 flex items-center">
            <span className="material-icons-round text-gray-400">smartphone</span>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-3" />
            <Input 
              type="text" 
              placeholder="账号/手机号" 
              className="bg-transparent border-none w-full p-0 text-sm focus:ring-0" 
            />
          </div>
          {/* Password Input Group */}
          <div className="h-14 bg-gray-50 dark:bg-gray-800 border border-transparent rounded-2xl px-4 flex items-center">
            <span className="material-icons-round text-gray-400">lock_open</span>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-3" />
            <Input 
              type="password" 
              placeholder="密码" 
              className="bg-transparent border-none w-full p-0 text-sm focus:ring-0" 
            />
          </div>
          <Button 
            onClick={handleLogin}
            className="w-full h-14 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 text-white font-bold text-lg shadow-lg shadow-lime-500/30 flex items-center justify-center gap-2 mt-4"
          >
            立即登录 <span className="material-icons-round text-sm">arrow_forward</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
