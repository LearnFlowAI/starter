import Link from "next/link";

const navItems = [
  { href: "/tasks", label: "今日任务" },
  { href: "/timer", label: "计时器" },
  { href: "/record", label: "结束记录" },
  { href: "/overview", label: "今日总览" }
];

export default function TopNav() {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-ink/50">
          LearnFlow Starter
        </p>
        <h1 className="font-display text-3xl text-ink">MVP 工作台</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-ink/20 bg-chalk px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink/70 transition hover:-translate-y-0.5 hover:bg-ink/10"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
