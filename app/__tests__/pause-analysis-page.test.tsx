import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import PauseAnalysisPage from "../pause-analysis/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn() }),
  useSearchParams: () => new URLSearchParams("period=week")
}));

describe("中断分析页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("渲染本周中断分析", async () => {
    render(<PauseAnalysisPage />);

    expect(await screen.findByText("本周中断分析")).toBeInTheDocument();
    expect(screen.getByText("详细统计")).toBeInTheDocument();
  });
});
