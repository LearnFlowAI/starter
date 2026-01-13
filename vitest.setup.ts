// 扩展 Vitest 断言，提供 Testing Library 的 DOM 断言（如 toBeInTheDocument）。
import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// 用普通 <a> 替换 Next.js Link，避免测试中依赖运行时。
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    React.createElement("a", { href, ...props }, children)
}));

// 用最小桩替代 Recharts 组件，保证 JSDOM 下测试稳定。
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", {}, children),
  PieChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", {}, children),
  Pie: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", {}, children),
  Cell: () => React.createElement("div", {}),
  Tooltip: () => React.createElement("div", {}),
  AreaChart: ({ children }: { children: React.ReactNode }) =>
    React.createElement("div", {}, children),
  Area: () => React.createElement("div", {}),
  CartesianGrid: () => React.createElement("div", {}),
  XAxis: () => React.createElement("div", {}),
  YAxis: () => React.createElement("div", {})
}));
