import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import OverviewPage from "../overview/page";
import type { ScoreEntry, SessionEntry } from "../lib/models";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/overview"
}));

describe("总览页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("根据会话汇总今日数据", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const sessions: SessionEntry[] = [
      {
        id: "ses_1",
        taskId: "t1",
        seconds: 1200,
        pauseCount: 0,
        startedAt: yesterday.toISOString(),
        endedAt: yesterday.toISOString()
      },
      {
        id: "ses_2",
        taskId: "t1",
        seconds: 1200,
        pauseCount: 0,
        startedAt: today.toISOString(),
        endedAt: today.toISOString()
      }
    ];
    const scores: ScoreEntry[] = [
      {
        id: "scr_1",
        sessionId: "ses_1",
        taskId: "t1",
        points: 26,
        seconds: 1200,
        pauseCount: 0,
        createdAt: today.toISOString()
      }
    ];

    window.localStorage.setItem("lf_sessions", JSON.stringify(sessions));
    window.localStorage.setItem("lf_scores", JSON.stringify(scores));

    render(<OverviewPage />);

    expect(
      await screen.findByRole("heading", { name: "数据统计" })
    ).toBeInTheDocument();

    const detailSection = screen.getByText("数据明细").closest("section");
    expect(detailSection).toBeTruthy();

    const detail = within(detailSection as HTMLElement);
    expect(detail.getByText("数学口算 20 分钟")).toBeInTheDocument();
    expect(detail.getByText("20m")).toBeInTheDocument();
    expect(detail.getByText("+26")).toBeInTheDocument();
  });
});
