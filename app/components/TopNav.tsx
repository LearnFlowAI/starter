import Link from "next/link";

const navItems = [
  { href: "/tasks", label: "今日任务" },
  { href: "/timer", label: "计时器" },
  { href: "/record", label: "结束记录" },
  { href: "/overview", label: "今日总览" }
];

export default function TopNav() {
  return (
    <nav
      className="card flex flex-col gap-4 rounded-[28px] px-5 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between"
      aria-label="顶部导航"
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-ink/10 bg-white/80">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-6 w-6 text-ink"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M4 7c0-1.1.9-2 2-2h10a4 4 0 0 1 0 8h-2" />
            <path d="M6 19h9a3 3 0 0 0 0-6H8a2 2 0 0 1 0-4h8" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-ink/50">
            LearnFlow Starter
          </p>
          <h1 className="font-display text-2xl text-ink sm:text-3xl">MVP 工作台</h1>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="btn-ghost justify-center"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
