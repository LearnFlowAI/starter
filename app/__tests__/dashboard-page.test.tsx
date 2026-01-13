import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import DashboardPage from "../dashboard/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/dashboard"
}));

describe("仪表盘页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("渲染今日专注概览与任务列表", async () => {
    render(<DashboardPage />);

    expect(await screen.findByText("今日专注概览")).toBeInTheDocument();
    expect(screen.getByText(/今日任务/)).toBeInTheDocument();
    expect(screen.getByText("数学口算 20 分钟")).toBeInTheDocument();
  });
});
