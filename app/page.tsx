import Link from "next/link";
import TopNav from "./components/TopNav";

export default function Home() {
  return (
    <main className="grid-overlay min-h-screen px-6 py-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <TopNav />
        <section className="card rounded-3xl p-8 shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="badge text-ink">PWA Ready</p>
              <h2 className="mt-4 font-display text-4xl text-ink">
                计时 → 记录 → 积分 → 总览
              </h2>
              <p className="mt-3 max-w-xl text-sm text-ink/70">
                使用最少步骤完成一次学习记录，并形成可复盘的积分反馈。适合家庭与校园
                场景的 MVP 演示。
              </p>
            </div>
            <div className="rounded-3xl border border-ink/10 bg-ink/5 px-6 py-5 text-sm text-ink/70">
              <p className="text-xs uppercase tracking-[0.3em] text-ink/50">入口</p>
              <div className="mt-4 flex flex-col gap-2">
                <Link className="text-ink hover:text-moss" href="/tasks">
                  进入今日任务 →
                </Link>
                <Link className="text-ink hover:text-moss" href="/timer">
                  进入计时器 →
                </Link>
                <Link className="text-ink hover:text-moss" href="/record">
                  进入结束记录 →
                </Link>
                <Link className="text-ink hover:text-moss" href="/overview">
                  进入今日总览 →
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "低摩擦",
              desc: "核心收尾 30 秒内完成，避免复杂表单。"
            },
            {
              title: "本地优先",
              desc: "离线可记，联网可同步，适配家庭学习节奏。"
            },
            {
              title: "可视复盘",
              desc: "趋势与积分同时呈现，给出下一步建议。"
            }
          ].map((item) => (
            <div key={item.title} className="card rounded-3xl p-5 shadow-soft">
              <h3 className="font-display text-xl text-ink">{item.title}</h3>
              <p className="mt-3 text-sm text-ink/70">{item.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
