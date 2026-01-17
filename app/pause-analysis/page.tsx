'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { MOCK_PAUSE_DATA } from '../../lib/constants';
import Button from '../components/ui/Button';

export default function PauseAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = (searchParams.get('period') || 'today') as 'today' | 'yesterday' | 'week';

  const data = MOCK_PAUSE_DATA[period];
  const totalCount = data.reduce((sum, item) => sum + item.value, 0);
  const periodLabel = period === 'today' ? '今日' : period === 'yesterday' ? '昨日' : '本周';

  const onBack = () => router.back();

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] pb-20 dark:bg-background-dark">
        <header className="mb-4 flex items-center justify-between px-6 pt-10">
          <Button variant="icon" icon="arrow_back" onClick={onBack} className="bg-white dark:bg-card-dark text-gray-400 shadow-sm" />
          <h1 className="text-xl font-black text-gray-800 dark:text-white">{periodLabel}中断分析</h1>
          <div className="h-10 w-10" />
        </header>
        <main className="px-6 pt-4">
            <div className="flex flex-col items-center justify-center pt-20 text-center">
                <span className="material-icons-round text-6xl text-gray-300 dark:text-gray-600">analytics</span>
                <h2 className="mt-4 text-lg font-bold text-gray-700 dark:text-gray-300">暂无中断数据</h2>
                <p className="mt-1 text-sm text-gray-400">当前选择的时间范围内没有记录到任何中断。</p>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] dark:bg-background-dark pb-20">
      <header className="pt-10 px-6 flex items-center justify-between mb-4">
        <Button onClick={onBack} variant="icon" icon="arrow_back" className="bg-white dark:bg-card-dark shadow-sm text-gray-400"/>
        <h1 className="text-xl font-black text-gray-800 dark:text-white">{periodLabel}中断分析</h1>
        <div className="w-10 h-10" />
      </header>

      <main className="px-6 pt-4">
        <div className="bg-white dark:bg-card-dark rounded-[3rem] p-8 shadow-soft border border-gray-50 dark:border-gray-800 relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col items-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie data={data} innerRadius={70} outerRadius={95} paddingAngle={0} dataKey="value" animationDuration={1500}>
                  {data.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] font-black text-primary/60 tracking-widest uppercase mb-1">{periodLabel}总计</span>
                <div className="flex items-baseline">
                  <span className="text-5xl font-black text-gray-800 dark:text-white tabular-nums">{totalCount}</span>
                  <span className="text-sm font-bold text-gray-400 ml-1">次</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-10">
              {data.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-black text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-800 dark:text-white tracking-tight">详细统计</h2>
            <button type="button" className="text-primary text-xs font-black tracking-wide">查看历史</button>
          </div>

          <div className="space-y-4">
            {data.map((item) => {
              const percentage = totalCount > 0 ? Math.round((item.value / totalCount) * 100) : 0;
              return (
                <div key={item.name} className="bg-white dark:bg-card-dark rounded-[2.5rem] p-5 shadow-soft border border-gray-50 dark:border-gray-800 flex items-center gap-5 transition-all hover:scale-[1.02]">
                  <div className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center shadow-sm" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                    <span className="material-icons-round text-3xl">{item.icon}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2.5">
                      <div>
                        <h3 className="text-lg font-black text-gray-800 dark:text-white">{item.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 tracking-wide">{item.value} 次 · 共 {item.duration} 分钟</p>
                      </div>
                      <span className="text-sm font-black text-gray-400 tabular-nums">{percentage}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-gray-50 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000 delay-300" style={{ width: `${percentage}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {period === 'today' && totalCount > 0 && (
          <section className="bg-teal-50 dark:bg-teal-900/10 rounded-[2.5rem] p-6 border border-teal-100 dark:border-teal-900/30 flex items-start gap-4">
            <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white shadow-glow flex-shrink-0">
               <span className="material-icons-round text-3xl">lightbulb</span>
            </div>
            <div>
              <h3 className="text-lg font-black text-teal-800 dark:text-teal-400 mb-1">小贴士</h3>
              <p className="text-sm font-bold text-teal-600 dark:text-teal-600/70 leading-relaxed">
                今天分心了较多次哦。下次试试<span className="text-teal-800 dark:text-teal-300">把手机放远一点吧</span>！专心致志，你可以的！加油！🚀
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
