import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import TopNav from "../components/TopNav";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

describe("TopNav", () => {
  it("渲染顶部导航并设置可访问标签", () => {
    render(<TopNav />);

    expect(screen.getByRole("navigation", { name: "顶部导航" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "今日任务" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "计时器" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "结束记录" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "今日总览" })).toBeInTheDocument();
  });
});
