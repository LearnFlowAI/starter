"use client";

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MOCK_TASKS, TASK_CONFIG } from "../../lib/constants";
import type { Task, AppView } from "../../types";
import type { SessionEntry } from "../lib/models";
import { useLocalState, uid } from "../lib/storage";
import NavBar from "../components/NavBar";
import { GoogleGenAI, Modality } from "@google/genai";

const logTtsError = (message: string, error?: unknown) => {
  if (process.env.NODE_ENV === "production") {
    console.warn(message);
    return;
  }
  if (error) {
    console.error(message, error);
    return;
  }
  console.error(message);
};

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function TimerComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, , tasksReady] = useLocalState<Task[]>(
    "lf_all_tasks",
    MOCK_TASKS,
  );
  const [activeTaskId, , activeTaskReady] = useLocalState<string | null>(
    "lf_active_task_id",
    null,
  );
  const [, setSessions] = useLocalState<SessionEntry[]>("lf_sessions", []);

  const [task, setTask] = useState<Task | null>(null);
  const [sessionId] = useState(() => uid("sess"));
  const [sessionStartTime] = useState(() => new Date().toISOString());

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [interruptionCount, setInterruptionCount] = useState(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);

  const [isSoundOn, setIsSoundOn] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);
  const [currentPauseDuration, setCurrentPauseDuration] = useState(0);
  const pressTimerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const PRESS_DURATION = 2000;

  useEffect(() => {
    if (!tasksReady || !activeTaskReady) {
      return;
    }

    const activeTask = tasks.find((t) => t.id === activeTaskId);
    if (activeTask) {
      setTask(activeTask);
      const initialSeconds = searchParams.get("remaining");
      if (initialSeconds) {
        setRemainingSeconds(Number.parseInt(initialSeconds, 10));
      } else {
        setRemainingSeconds(activeTask.duration * 60);
      }
      return;
    }

    // If no active task, redirect or show an error
    router.replace("/dashboard");
  }, [activeTaskId, tasks, router, searchParams, tasksReady, activeTaskReady]);

  useEffect(() => {
    // This effect handles resuming from the pause-reason page
    if (searchParams.get("resume")) {
      setIsActive(true);
      // Clean up the URL
      router.replace("/timer", undefined);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (activeTaskId) {
      const status = { taskId: activeTaskId, isActive };
      localStorage.setItem("lf_timer_status", JSON.stringify(status));
    }
    // Cleanup on unmount
    return () => {
      localStorage.removeItem("lf_timer_status");
    };
  }, [isActive, activeTaskId]);

  const totalSeconds = useMemo(() => (task ? task.duration * 60 : 0), [task]);
  const isOvertime = remainingSeconds < 0;

  const formatTime = (totalSec: number) => {
    const absSec = Math.abs(totalSec);
    const mins = Math.floor(absSec / 60);
    const secs = absSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const speak = useCallback(async (text: string, force = false) => {
    if (!isSoundOn && !force) return;

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        logTtsError("TTS unavailable: missing API key.");
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Kore" },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          const AudioContextCtor =
            window.AudioContext ||
            (window as Window & { webkitAudioContext?: typeof AudioContext })
              .webkitAudioContext;
          if (!AudioContextCtor) {
            logTtsError("TTS unavailable: AudioContext is missing.");
            return;
          }
          audioContextRef.current = new AudioContextCtor({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(
          decodeBase64(base64Audio),
          ctx,
          24000,
          1,
        );
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (error) {
      logTtsError("TTS failed.", error);
    }
  }, [isSoundOn]);

  useEffect(() => {
    if (isSoundOn) {
      if (isActive) {
        speak("专注模式已开启，请保持专注。");
      } else {
        speak("专注已暂停，休息一下吧。");
      }
    }
  }, [isActive, isSoundOn, speak]);

  const onNavigate = (view: AppView) => {
    router.push(`/${view}`);
  };

  const onTogglePause = () => {
    if (isActive) {
      // Pause the timer and go to select a reason
      setIsActive(false);
      setPauseStartTime(Date.now());
      setInterruptionCount((prev) => prev + 1);
      router.push(
        `/pause-reason?sessionId=${sessionId}&taskId=${activeTaskId}&remaining=${remainingSeconds}`,
      );
    } else {
      // Resume timer
      setIsActive(true);
      setPauseStartTime(null);
    }
  };

  const onFinish = () => {
    if (!task) return;

    const session: SessionEntry = {
      id: sessionId,
      taskId: task.id,
      seconds: totalSeconds - remainingSeconds, // actual focused seconds
      pauseCount: interruptionCount,
      startedAt: sessionStartTime,
      endedAt: new Date().toISOString(),
    };

    setSessions((prev) => [session, ...prev]);
    router.push("/record");
  };

  const handleToggleSound = () => {
    const newState = !isSoundOn;
    setIsSoundOn(newState);
    if (newState) speak("提示音已开启", true);
  };

  const handleFinishWithSound = () => {
    if (isSoundOn) speak("恭喜！你已完成本次专注任务。");
    onFinish();
  };

  useEffect(() => {
    if (!isActive && pauseStartTime) {
      pauseIntervalRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - pauseStartTime) / 1000);
        setCurrentPauseDuration(elapsed);
      }, 1000);
    } else {
      if (pauseIntervalRef.current) clearInterval(pauseIntervalRef.current);
      setCurrentPauseDuration(0);
    }
    return () => {
      if (pauseIntervalRef.current) clearInterval(pauseIntervalRef.current);
    };
  }, [isActive, pauseStartTime]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setRemainingSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive]);

  const strokeDashoffset = isOvertime
    ? 0
    : 282.7 * (1 - remainingSeconds / totalSeconds);

  const startPress = () => {
    startTimeRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / PRESS_DURATION) * 100, 100);
      setPressProgress(progress);
      if (progress < 100) {
        pressTimerRef.current = requestAnimationFrame(tick);
      } else {
        cancelPress();
        handleFinishWithSound();
        if ("vibrate" in navigator) navigator.vibrate(200);
      }
    };
    pressTimerRef.current = requestAnimationFrame(tick);
  };

  const cancelPress = () => {
    if (pressTimerRef.current) {
      cancelAnimationFrame(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressProgress(0);
  };

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) cancelAnimationFrame(pressTimerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading task...</p>
      </div>
    );
  }

  const taskLabel = `${TASK_CONFIG[task.type].label}${task.name}`;
  const isPaused = !isActive;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-[#F6FBFF] via-white to-[#F7F9FB] px-6 pb-28 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-20 w-72 h-72 bg-[#B7F4EA]/40 rounded-full blur-[80px]" />
      <div className="pointer-events-none absolute top-40 -left-16 w-64 h-64 bg-[#FFECCB]/40 rounded-full blur-[90px]" />

      <header className="w-full pt-12 pb-4 flex items-center justify-between relative z-10">
        <button
          type="button"
          aria-label="返回"
          onClick={() => onNavigate("dashboard")}
          className="w-11 h-11 rounded-full bg-white shadow-sm border border-white text-gray-400 flex items-center justify-center active:scale-95 transition"
        >
          <span className="material-icons-round text-lg">chevron_left</span>
        </button>
        <h1 className="text-base font-semibold text-gray-800">专注计时</h1>
        <button
          type="button"
          aria-label="更多"
          onClick={handleToggleSound}
          className="w-11 h-11 rounded-full bg-white shadow-sm border border-white text-gray-400 flex items-center justify-center active:scale-95 transition"
        >
          <span className="material-icons-round text-lg">more_horiz</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center w-full relative z-10">
        <div className="mt-6 mb-10 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 shadow-sm border border-white">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs text-gray-400">当前任务：</span>
          <span className="text-xs font-semibold text-primary">
            {taskLabel}
          </span>
        </div>

        <div className="relative mb-10">
          <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/70 to-[#E6FBF6]/70 blur-[18px] -z-10" />
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg
              className="w-full h-full transform -rotate-90"
              viewBox="0 0 100 100"
              role="img"
              aria-label="专注计时进度"
            >
              <title>专注计时进度</title>
              <circle
                className="text-gray-200 stroke-current"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                strokeWidth="6"
              />
              <circle
                className="text-primary transition-all duration-1000 ease-linear"
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - strokeDashoffset}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-semibold text-gray-800 tabular-nums">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-xs text-gray-400 mt-2">剩余时间</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-10">"千里之行，始于足下。"</p>

        <div className="w-full grid grid-cols-2 gap-6 px-4">
          <button
            type="button"
            onClick={onTogglePause}
            className="flex flex-col items-center justify-center py-6 rounded-[28px] bg-[#FFF4C7] shadow-sm active:scale-95 transition"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#FFC94A] text-white flex items-center justify-center shadow-md mb-3">
              <span className="material-icons-round text-2xl">
                {isPaused ? "play_arrow" : "pause"}
              </span>
            </div>
            <span className="text-sm font-semibold text-[#E2A000]">
              {isPaused ? "继续" : "暂停"}
            </span>
          </button>

          <button
            type="button"
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            className="relative flex flex-col items-center justify-center py-6 rounded-[28px] bg-[#FFE1E5] shadow-sm active:scale-95 transition overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-black/5 origin-left transition-transform duration-75 pointer-events-none"
              style={{ transform: `scaleX(${pressProgress / 100})` }}
            />
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B7C] text-white flex items-center justify-center shadow-md mb-3 relative z-10">
              <span className="material-icons-round text-2xl">stop</span>
            </div>
            <span className="text-sm font-semibold text-[#FF4D64] relative z-10">
              结束
            </span>
          </button>
        </div>
      </main>

      <NavBar currentView="timer" onNavigate={onNavigate} />
    </div>
  );
}

export default function TimerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TimerComponent />
    </Suspense>
  );
}
