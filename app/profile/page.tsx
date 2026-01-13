"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";

type ProfileSubView = "main" | "edit" | "shop" | "share";

export default function ProfilePage() {
  const [subView, setSubView] = useState<ProfileSubView>("main");
  const [userName, setUserName] = useState("小明");
  const [userAvatar, setUserAvatar] = useState(
    "https://picsum.photos/seed/user/200/200"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (feedbackMsg) {
      const timer = setTimeout(() => setFeedbackMsg(null), 3000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [feedbackMsg]);

  const handleSavePoster = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setFeedbackMsg("海报已保存至相册");
    }, 1500);
  };

  const handleShare = async () => {
    setIsSharing(true);
    const shareData = {
      title: "LearnFlow 专注成就",
      text: "我在 LearnFlow 已经累计专注了 120 小时，获得了 42 枚勋章！",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `LearnFlow - 专注每一刻：${window.location.href}`
        );
        setFeedbackMsg("分享链接已复制到剪贴板");
      }
    } catch {
      setFeedbackMsg("分享未完成");
    } finally {
      setIsSharing(false);
    }
  };

  const EditProfileView = () => (
    <div className="animate-fade-in-up px-6">
      <div className="mb-10 flex items-center gap-4">
        <button type="button"
          onClick={() => setSubView("main")}
          className="rounded-full bg-gray-100 p-2 dark:bg-gray-800"
        >
          <span className="material-icons-round">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">编辑个人信息</h2>
      </div>

      <div className="mb-10 flex flex-col items-center gap-6">
        <div className="relative">
          <img
            src={userAvatar}
            className="h-24 w-24 rounded-full border-4 border-white shadow-soft"
            alt="Avatar"
          />
          <button type="button"
            onClick={() =>
              setUserAvatar(`https://picsum.photos/seed/${Math.random()}/200/200`)
            }
            className="absolute bottom-0 right-0 rounded-full bg-primary p-2 text-white shadow-md"
          >
            <span className="material-icons-round text-sm">photo_camera</span>
          </button>
        </div>

        <div className="w-full space-y-4">
          <div>
            <label
              className="mb-2 ml-1 block text-xs font-black uppercase tracking-widest text-gray-400"
              htmlFor="profile-name"
            >
              昵称
            </label>
            <input
              id="profile-name"
              type="text"
              value={userName}
              onChange={(event) => setUserName(event.target.value)}
              className="w-full rounded-2xl border-none bg-white px-6 py-4 font-bold shadow-sm focus:ring-2 focus:ring-primary/20 dark:bg-gray-800"
            />
          </div>
          <div>
            <label
              className="mb-2 ml-1 block text-xs font-black uppercase tracking-widest text-gray-400"
              htmlFor="profile-bio"
            >
              自我介绍
            </label>
            <textarea
              id="profile-bio"
              placeholder="写点什么鼓励自己吧..."
              className="w-full resize-none rounded-2xl border-none bg-white px-6 py-4 font-bold shadow-sm focus:ring-2 focus:ring-primary/20 dark:bg-gray-800"
              rows={3}
            />
          </div>
        </div>
      </div>

      <button type="button"
        onClick={() => setSubView("main")}
        className="w-full rounded-full bg-primary py-4 font-black text-white shadow-glow transition-all active:scale-95"
      >
        保存修改
      </button>
    </div>
  );

  const PointsShopView = () => {
    const items = [
      { id: 1, name: "专注之光皮肤", cost: 100, icon: "auto_awesome", color: "text-yellow-400" },
      { id: 2, name: "专属成就勋章", cost: 50, icon: "verified", color: "text-blue-400" },
      { id: 3, name: "可爱头像框", cost: 80, icon: "face", color: "text-pink-400" },
      { id: 4, name: "高级统计报表", cost: 200, icon: "analytics", color: "text-primary" }
    ];

    return (
      <div className="animate-fade-in-up px-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button type="button"
              onClick={() => setSubView("main")}
              className="rounded-full bg-gray-100 p-2 dark:bg-gray-800"
            >
              <span className="material-icons-round">arrow_back</span>
            </button>
            <h2 className="text-xl font-black">积分商店</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 shadow-sm dark:bg-gray-800">
            <span className="material-symbols-outlined text-secondary text-lg">
              star
            </span>
            <span className="text-sm font-black">256</span>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col items-center gap-3 rounded-[2rem] border border-gray-50 bg-white p-5 text-center shadow-sm transition-all active:scale-95 dark:border-gray-800 dark:bg-card-dark"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50 text-3xl transition-transform group-hover:scale-110 dark:bg-gray-800">
                <span className={`material-icons-round ${item.color}`}>
                  {item.icon}
                </span>
              </div>
              <div className="text-sm font-bold text-gray-800 dark:text-white">
                {item.name}
              </div>
              <button type="button"
                onClick={() => alert("兑换成功")}
                className="w-full rounded-xl bg-gray-100 py-2 text-xs font-black text-primary transition-colors hover:bg-primary hover:text-white dark:bg-gray-700"
              >
                {item.cost} 积分
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const ShareProgressView = () => (
    <div className="animate-fade-in-up px-6 pb-10">
      <div className="mb-8 flex items-center gap-4">
        <button type="button"
          onClick={() => setSubView("main")}
          className="rounded-full bg-gray-100 p-2 dark:bg-gray-800"
        >
          <span className="material-icons-round">arrow_back</span>
        </button>
        <h2 className="text-xl font-black">分享我的进步</h2>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-[3rem] border border-gray-50 bg-white p-8 shadow-2xl dark:border-gray-800 dark:bg-card-dark">
        <div className="absolute right-0 top-0 flex flex-col items-center p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-teal-600 text-white shadow-lg transition-transform duration-500 group-hover:rotate-0">
            <span className="material-icons-round text-3xl">qr_code_2</span>
          </div>
          <span className="mt-1 text-[8px] font-black uppercase tracking-tighter text-primary opacity-60">
            扫码加入
          </span>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <img
            src={userAvatar}
            className="h-14 w-14 rounded-full border-2 border-primary shadow-sm"
            alt="User"
          />
          <div>
            <h3 className="text-xl font-black text-gray-800 dark:text-white">
              {userName}
            </h3>
            <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
              专注时长已累计 120 小时
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative rounded-[2.5rem] border border-primary/10 bg-teal-50/50 p-7 text-center dark:bg-teal-900/10">
            <div className="text-5xl font-black tracking-tighter text-primary tabular-nums">
              256
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              总积分达成
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-[2.5rem] border border-secondary/10 bg-yellow-50/50 p-6 text-center dark:bg-yellow-900/10">
              <div className="text-3xl font-black text-secondary tabular-nums">
                15
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                坚持天数
              </div>
            </div>
            <div className="rounded-[2.5rem] border border-purple-500/10 bg-purple-50/50 p-6 text-center dark:bg-purple-900/10">
              <div className="text-3xl font-black text-purple-500 tabular-nums">
                42
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                勋章总数
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-50 pt-6 text-center dark:border-gray-800">
          <p className="text-xs font-bold text-gray-400">
            用专注让成长更有迹可循
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <button type="button"
          onClick={handleSavePoster}
          className="w-full rounded-full bg-primary py-4 text-base font-black text-white shadow-glow transition-all active:scale-95"
        >
          {isSaving ? "保存中..." : "保存海报"}
        </button>
        <button type="button"
          onClick={handleShare}
          className="w-full rounded-full border border-gray-100 bg-white py-4 text-base font-black text-gray-500 transition-all active:scale-95 dark:border-gray-700 dark:bg-gray-800"
        >
          {isSharing ? "分享中..." : "立即分享"}
        </button>
      </div>
    </div>
  );

  const MainView = () => (
    <div className="px-6 pb-36 pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800 dark:text-white">
          我的成长
        </h1>
        <button type="button"
          onClick={() => setSubView("edit")}
          className="rounded-full bg-white p-2 text-gray-400 shadow-sm dark:bg-card-dark"
        >
          <span className="material-icons-round">edit</span>
        </button>
      </div>

      <div className="mb-8 rounded-[2.5rem] border border-gray-50 bg-white p-6 shadow-soft dark:border-gray-800 dark:bg-card-dark">
        <div className="flex items-center gap-4">
          <img
            src={userAvatar}
            className="h-16 w-16 rounded-full border-2 border-primary shadow-sm"
            alt="Avatar"
          />
          <div>
            <h2 className="text-lg font-black text-gray-800 dark:text-white">
              {userName}
            </h2>
            <p className="text-xs font-bold text-gray-400">
              坚持学习 15 天
            </p>
          </div>
        </div>
        {feedbackMsg && (
          <div className="mt-4 rounded-2xl bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
            {feedbackMsg}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button type="button"
          onClick={() => setSubView("shop")}
          className="flex flex-col items-center gap-3 rounded-[2rem] border border-gray-50 bg-white p-5 text-center shadow-sm transition-all active:scale-95 dark:border-gray-800 dark:bg-card-dark"
        >
          <span className="material-icons-round text-3xl text-secondary">
            shopping_bag
          </span>
          <span className="text-sm font-black text-gray-800 dark:text-white">
            积分商店
          </span>
        </button>
        <button type="button"
          onClick={() => setSubView("share")}
          className="flex flex-col items-center gap-3 rounded-[2rem] border border-gray-50 bg-white p-5 text-center shadow-sm transition-all active:scale-95 dark:border-gray-800 dark:bg-card-dark"
        >
          <span className="material-icons-round text-3xl text-primary">
            share
          </span>
          <span className="text-sm font-black text-gray-800 dark:text-white">
            分享成就
          </span>
        </button>
      </div>

      <BottomNav />
    </div>
  );

  if (subView === "edit") {
    return <EditProfileView />;
  }

  if (subView === "shop") {
    return <PointsShopView />;
  }

  if (subView === "share") {
    return <ShareProgressView />;
  }

  return <MainView />;
}
