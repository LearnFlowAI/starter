'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AppView } from '../../types';
import NavBar from '../components/NavBar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

type ProfileSubView = 'main' | 'edit' | 'shop' | 'share';

export default function ProfilePage() {
  const router = useRouter();
  const [subView, setSubView] = useState<ProfileSubView>('main');
  const [userName, setUserName] = useState('小明');
  const [userAvatar, setUserAvatar] = useState('https://picsum.photos/seed/user/200/200');
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  const onNavigate = (view: AppView) => router.push(`/${view}`);

  const handleSavePoster = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setFeedbackMsg('✨ 海报已保存至相册');
    }, 1500);
  };

  const handleShare = async () => {
    setIsSharing(true);
      const shareData = {
        title: 'LearnFlow 专注成就',
        text: "我在 LearnFlow 已经累计专注了 120 小时，获得了 42 枚勋章！快来和我一起挑战吧。",
        url: window.location.href,
      };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`LearnFlow - 专注每一刻：${window.location.href}`);
        setFeedbackMsg('📋 分享链接已复制到剪贴板');
      }
    } catch (err) {
      console.error('Share failed:', err);
    } finally {
      setIsSharing(false);
    }
  };


  const EditProfileView = () => (
    <div className="px-6 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-10">
        <Button variant="icon" icon="arrow_back" onClick={() => setSubView('main')} />
        <h2 className="text-xl font-black">编辑个人信息</h2>
      </div>

      <div className="flex flex-col items-center gap-6 mb-10">
        <div className="relative">
          <img src={userAvatar} className="w-24 h-24 rounded-full border-4 border-white shadow-soft" alt="Avatar" />
          <Button 
            onClick={() => setUserAvatar(`https://picsum.photos/seed/${Math.random()}/200/200`)}
            className="absolute bottom-0 right-0 p-2 rounded-full shadow-md bg-primary text-white"
            icon="photo_camera"
            variant="icon"
          />
        </div>
        
        <div className="w-full space-y-4">
          <div>
            <label htmlFor="profile-nickname" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">昵称</label>
            <input 
              id="profile-nickname"
              aria-label="昵称"
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="profile-bio" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">自我介绍</label>
            <textarea 
              id="profile-bio"
              placeholder="写点什么鼓励自己吧..."
              className="w-full bg-white dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-primary/20 shadow-sm resize-none"
              rows={3}
            />
          </div>
        </div>
      </div>

      <Button 
        onClick={() => setSubView('main')}
        className="w-full bg-primary text-white py-4 rounded-full font-black shadow-glow"
      >
        保存修改
      </Button>
    </div>
  );

  const PointsShopView = () => {
    const items = [
      { id: 1, name: '专注之光皮肤', cost: 100, icon: 'auto_awesome', color: 'text-yellow-400' },
      { id: 2, name: '专属成就勋章', cost: 50, icon: 'verified', color: 'text-blue-400' },
      { id: 3, name: '可爱头像框', cost: 80, icon: 'face', color: 'text-pink-400' },
      { id: 4, name: '高级统计报表', cost: 200, icon: 'analytics', color: 'text-primary' },
    ];

    return (
      <div className="px-6 animate-fade-in-up">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="icon" icon="arrow_back" onClick={() => setSubView('main')} />
            <h2 className="text-xl font-black">积分商店</h2>
          </div>
          <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary fill-1 text-lg">star</span>
            <span className="font-black text-sm">256</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-10">
          {items.map(item => (
            <Card key={item.id} className="p-5 flex flex-col items-center text-center gap-3 active:scale-95 group">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                <span className={`material-icons-round ${item.color}`}>{item.icon}</span>
              </div>
              <div className="font-bold text-sm text-gray-800 dark:text-white">{item.name}</div>
              <Button 
                onClick={() => alert('兑换成功！')}
                className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-primary text-xs font-black rounded-xl hover:bg-primary hover:text-white"
              >
                {item.cost} 积分
              </Button>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const ShareProgressView = () => (
    <div className="px-6 animate-fade-in-up pb-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="icon" icon="arrow_back" onClick={() => setSubView('main')} />
        <h2 className="text-xl font-black">分享我的进步</h2>
      </div>

      <Card className="p-8 shadow-2xl relative overflow-hidden mb-8 group">
        <div className="absolute top-0 right-0 p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
             <span className="material-icons-round text-3xl">qr_code_2</span>
          </div>
          <span className="text-[8px] font-black text-primary uppercase tracking-tighter mt-1 opacity-60">扫码加入</span>
        </div>
        
        <div className="flex items-center gap-4 mb-8">
          <img src={userAvatar} className="w-14 h-14 rounded-full border-2 border-primary shadow-sm" alt="User" />
          <div>
            <h3 className="font-black text-xl text-gray-800 dark:text-white">{userName}</h3>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">专注时长已累计 120 小时</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-teal-50/50 dark:bg-teal-900/10 p-7 rounded-[2.5rem] text-center border border-primary/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            <div className="text-5xl font-black text-primary mb-2 tracking-tighter tabular-nums">256</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">总积分达成</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-yellow-50/50 dark:bg-yellow-900/10 p-6 text-center border-secondary/10">
              <div className="text-3xl font-black text-secondary mb-1 tabular-nums">15</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">坚持天数</div>
            </Card>
            <Card className="bg-purple-50/50 dark:bg-purple-900/10 p-6 text-center border-purple-500/10">
              <div className="text-3xl font-black text-purple-500 mb-1 tabular-nums">42</div>
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">达成勋章</div>
            </Card>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-50 dark:border-gray-800 text-center">
          <p className="text-sm font-bold text-gray-400 italic">" 专注当下的每一秒，终会汇聚成星辰大海 "</p>
             <div className="mt-4 flex items-center justify-center gap-1">
                <span className="w-1 h-1 bg-primary rounded-full" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Powered by LearnFlow</span>
                <span className="w-1 h-1 bg-primary rounded-full" />
             </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 relative">
        {feedbackMsg && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center animate-fade-in-up">
            <div className="bg-gray-800 text-white text-xs font-bold py-2 px-4 rounded-full shadow-lg">
              {feedbackMsg}
            </div>
          </div>
        )}

        <Button 
          onClick={handleSavePoster}
          disabled={isSaving}
          className={`py-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-black rounded-full shadow-sm border border-gray-100 dark:border-gray-700 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
          icon={isSaving ? '' : 'download'}
        >
            {isSaving ? (
            <span className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          ) : (
            <span>保存海报</span>
          )}
        </Button>

        <Button 
          onClick={handleShare}
          disabled={isSharing}
          className={`py-4 bg-primary text-white font-black rounded-full shadow-glow ${isSharing ? 'opacity-70 cursor-wait' : ''}`}
          icon={isSharing ? '' : 'send'}
        >
            {isSharing ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <span>发送给好友</span>
          )}
        </Button>
      </div>
    </div>
  );

  if (subView === 'edit') return <div className="pb-32 pt-8 min-h-screen bg-[#F8FAFB] dark:bg-background-dark"><EditProfileView /></div>;
  if (subView === 'shop') return <div className="pb-32 pt-8 min-h-screen bg-[#F8FAFB] dark:bg-background-dark"><PointsShopView /></div>;
  if (subView === 'share') return <div className="pb-32 pt-8 min-h-screen bg-[#F8FAFB] dark:bg-background-dark"><ShareProgressView /></div>;

  const menuItems = [
    { 
      id: 'history',
      icon: 'history', 
      label: '专注历史', 
      desc: '查看过去30天的记录',
      action: () => onNavigate('stats')
    },
    { 
      id: 'shop',
      icon: 'shopping_bag', 
      label: '积分商店', 
      desc: '使用积分兑换精美奖品',
      action: () => setSubView('shop')
    },
    { 
      id: 'share',
      icon: 'share', 
      label: '分享进步', 
      desc: '让小伙伴见证你的成长',
      action: () => setSubView('share')
    },
  ];

  return (
      <div className="pb-32 pt-8 relative min-h-screen bg-[#F8FAFB] dark:bg-background-dark">
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      
      <header className="px-6 flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-gray-800 dark:text-white">个人中心</h1>
        <Button 
          onClick={() => setSubView('edit')}
          className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-700 dark:text-gray-300"
          variant="icon"
          icon="edit"
        />
      </header>

      <section className="px-6 flex flex-col items-center mb-10">
        <div className="relative mb-4">
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-soft overflow-hidden">
            <img 
              alt="User Avatar" 
              className="w-full h-full object-cover" 
              src={userAvatar}
            />
          </div>
          <div className="absolute bottom-1.5 right-1.5 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-gray-800 shadow-md">
            <span className="material-icons-round text-xs">check</span>
          </div>
        </div>
        <h2 className="text-xl font-black text-gray-800 dark:text-white">{userName}</h2>
        <p className="text-xs font-bold text-gray-400 mt-0.5 tracking-wide uppercase">LV.8 专注达人</p>
        
        <Card className="mt-8 w-full p-6 flex justify-around items-center">
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-primary tabular-nums">256</div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">总积分</div>
          </div>
          <div className="w-px h-8 bg-gray-50 dark:bg-gray-800" />
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-secondary tabular-nums">15</div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">专注天数</div>
          </div>
          <div className="w-px h-8 bg-gray-50 dark:bg-gray-800" />
          <div className="text-center flex-1">
            <div className="text-2xl font-black text-moss tabular-nums">42</div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">达成勋章</div>
          </div>
        </Card>
      </section>

      <section className="px-6 mb-10">
        <h3 className="text-base font-black text-gray-800 dark:text-white mb-5 tracking-tight">我的成就</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: 'military_tech', color: 'text-yellow-500', bg: 'bg-yellow-50', label: '初级' },
            { icon: 'workspace_premium', color: 'text-primary', bg: 'bg-teal-50', label: '高手' },
            { icon: 'verified', color: 'text-blue-500', bg: 'bg-blue-50', label: '认证' },
            { icon: 'star', color: 'text-purple-500', bg: 'bg-purple-50', label: '星耀' },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className={`w-14 h-14 rounded-[1.5rem] ${item.bg} dark:bg-opacity-10 flex items-center justify-center ${item.color} shadow-sm group-active:scale-95 transition-all`}>
                <span className="material-icons-round text-2xl">{item.icon}</span>
              </div>
              <span className="text-[11px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6">
        <h3 className="text-base font-black text-gray-800 dark:text-white mb-5 tracking-tight">常用功能</h3>
        <div className="space-y-4">
          {menuItems.map((item) => (
            <Button 
              key={item.id} 
              onClick={item.action}
              className="w-full flex items-center gap-5 bg-white dark:bg-card-dark p-5 rounded-[2rem] shadow-sm border border-gray-50 dark:border-gray-800 hover:shadow-soft hover:bg-gray-50/50 dark:hover:bg-gray-800/80 transition-all active:scale-[0.98] group"
              variant="ghost" // Use ghost variant to match styling without explicit background
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F4F6F9] dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                <span className="material-icons-round text-2xl">{item.icon}</span>
              </div>
              <div className="text-left flex-1">
                <div className="font-black text-base text-gray-800 dark:text-white">{item.label}</div>
                <div className="text-[11px] font-bold text-gray-400 mt-0.5">{item.desc}</div>
              </div>
              <span className="material-icons-round text-gray-200 group-hover:text-primary group-hover:translate-x-1 transition-all">chevron_right</span>
            </Button>
          ))}
        </div>
      </section>

      <NavBar currentView="profile" onNavigate={onNavigate} />
    </div>
  );
};
