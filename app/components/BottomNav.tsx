"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", icon: "home", label: "首页" },
  { href: "/overview", icon: "bar_chart", label: "统计" },
  { href: "/tasks", icon: "add", label: "新增", isAction: true },
  { href: "/settings", icon: "settings_suggest", label: "设置" },
  { href: "/profile", icon: "person", label: "我的" }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-6">
      <div className="mx-auto flex h-16 max-w-md items-center justify-between rounded-[2.5rem] border border-gray-100 bg-white px-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        {navItems.map((item) => {
          if (item.isAction) {
            return (
              <div key={item.href} className="relative -top-8">
                <Link
                  href={item.href}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-glow transition-transform hover:scale-105 active:scale-95"
                  aria-label={item.label}
                >
                  <span className="material-icons-round text-3xl">
                    {item.icon}
                  </span>
                </Link>
              </div>
            );
          }

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center transition-colors active:scale-90 ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
            >
              <span className="material-icons-round text-2xl">
                {item.icon}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
