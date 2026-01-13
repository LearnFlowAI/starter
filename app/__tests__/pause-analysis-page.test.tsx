import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import PauseAnalysisPage from "../pause-analysis/page";
import type { InterruptionLog } from "../lib/models";

const pushMock = vi.fn();
const backMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    back: backMock,
  }),
  useSearchParams: () => new URLSearchParams("?period=today"),
}));

vi.mock("../lib/theme", () => ({
  useTheme: () => ({
    ready: true,
  }),
}));

describe("中断分析页", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
    backMock.mockClear();
  });

  it("当无数据时，应渲染空状态", async () => {
    render(<PauseAnalysisPage />);
    expect(
      await screen.findByText("暂无中断数据")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("详细统计")
    ).not.toBeInTheDocument();
  });

  it("当有数据时，应渲染统计图表和详情", async () => {
    const mockInterruptions: InterruptionLog[] = [
      {
        id: "p1",
        reasonId: "distraction",
        duration: 60,
        createdAt: new Date().toISOString(),
        taskId: "t1",
        sessionId: "s1",
      },
    ];
    window.localStorage.setItem(
      "lf_interruptions",
      JSON.stringify(mockInterruptions)
    );

    render(<PauseAnalysisPage />);
    
    expect(
      await screen.findByText("详细统计")
    ).toBeInTheDocument();
    expect(
      screen.getByText("今日总计")
    ).toBeInTheDocument();
    // Check for the rendered interruption reason
    expect(screen.getAllByText("分心").length).toBeGreaterThan(0); 
    
    expect(
      screen.queryByText("暂无中断数据")
    ).not.toBeInTheDocument();
  });
});