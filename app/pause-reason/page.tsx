"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalState } from "../lib/storage";

const reasons = [
  {
    id: "water",
    icon: "water_drop",
    label: "喝水/如厕",
    color: "bg-sky-100 text-sky-500"
  },
  {
    id: "distraction",
    icon: "cloud",
    label: "分心走神",
    color: "bg-gray-100 text-gray-500"
  },
  {
    id: "problem",
    icon: "psychology",
    label: "卡在难题",
    color: "bg-orange-100 text-orange-500"
  },
  {
    id: "noise",
    icon: "graphic_eq",
    label: "环境干扰",
    color: "bg-rose-100 text-rose-500"
  },
  {
    id: "phone",
    icon: "smartphone",
    label: "电子产品",
    color: "bg-purple-100 text-purple-500"
  },
  {
    id: "other",
    icon: "more_horiz",
    label: "其他",
    color: "bg-emerald-100 text-emerald-500"
  }
];

export default function PauseReasonPage() {
  const router = useRouter();
  const [, setPendingReason] = useLocalState<string | null>(
    "lf_pause_reason_pending",
    null
  );
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm"
        onClick={() => router.push("/timer")}
        aria-label="关闭"
      />

      <div className="relative z-10 w-full max-w-md animate-fade-in-up rounded-t-[3.5rem] border-t border-white/20 bg-white p-8 pb-12 shadow-2xl dark:border-gray-800 dark:bg-card-dark">
        <div className="mb-8 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        </div>

        <div className="mb-10 text-center">
          <h2 className="text-[24px] font-black tracking-tight text-gray-800 dark:text-white">
            是什么打断了专注呢？
          </h2>
          <p className="mt-2 text-sm font-bold text-gray-400">
            点击选择原因并确认暂停
          </p>
        </div>

        <div className="mb-14 grid grid-cols-3 gap-x-4 gap-y-10">
          {reasons.map((reason) => {
            const isSelected = selectedReason === reason.id;
            return (
              <button type="button"
                key={reason.id}
                onClick={() => setSelectedReason(reason.id)}
                className="group flex flex-col items-center gap-3 outline-none"
              >
                <div
                  className={`flex h-[78px] w-[78px] items-center justify-center rounded-[28px] ${reason.color} shadow-sm transition-all group-active:scale-90 ${
                    isSelected
                      ? "scale-105 border-2 border-primary shadow-md ring-4 ring-primary/20"
                      : "border-2 border-transparent"
                  }`}
                >
                  <span className="material-icons-round text-[38px]">
                    {reason.icon}
                  </span>
                </div>
                <span
                  className={`text-[13px] font-black tracking-wide transition-colors ${
                    isSelected ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {reason.label}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-4 px-2">
          <button type="button"
            onClick={() => router.push("/timer")}
            className="flex-1 rounded-[2rem] border border-gray-100 bg-gray-50 py-4.5 text-[15px] font-black text-gray-500 transition-all active:scale-95 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            取消
          </button>
          <button type="button"
            onClick={() => {
              if (!selectedReason) {
                return;
              }
              setPendingReason(selectedReason);
              router.push("/timer");
            }}
            disabled={!selectedReason}
            className={`flex-[1.8] rounded-[2rem] py-4.5 text-[16px] font-black transition-all ${
              selectedReason
                ? "bg-primary text-white shadow-glow active:scale-95"
                : "cursor-not-allowed bg-gray-100 text-gray-300 shadow-none dark:bg-gray-800 dark:text-gray-600"
            }`}
          >
            确认暂停
          </button>
        </div>
      </div>
    </div>
  );
}
