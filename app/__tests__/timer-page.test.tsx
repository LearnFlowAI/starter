import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import TimerPage from "../timer/page";
import { calculateSessionPoints } from "../lib/scoring";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock })
}));

describe("计时页", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
  });

  it("计时可开始、暂停并重置", async () => {
    const { unmount } = render(<TimerPage />);
    expect(await screen.findByText("继续专注")).toBeInTheDocument();

    vi.useFakeTimers();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "继续专注" }));
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.getByText((_, element) => element?.textContent === "00:02")
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "暂停并记录" }));
    });
    expect(screen.getByText("暂停次数 1")).toBeInTheDocument();
    expect(pushMock).toHaveBeenCalledWith("/pause-reason");

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "完成并保存" }));
    });
    expect(
      screen.getByText((_, element) => element?.textContent === "00:00")
    ).toBeInTheDocument();
    expect(screen.getByText("暂停次数 0")).toBeInTheDocument();

    act(() => {
      unmount();
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
  });

  it("结束计时后保存会话记录", async () => {
    render(<TimerPage />);
    expect(await screen.findByText("继续专注")).toBeInTheDocument();

    vi.useFakeTimers();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "继续专注" }));
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "完成并保存" }));
    });

    expect(window.localStorage.getItem("lf_sessions")).not.toBeNull();

    const stored = window.localStorage.getItem("lf_sessions");

    const sessions = JSON.parse(stored ?? "[]") as Array<{
      id: string;
      taskId: string;
      seconds: number;
      pauseCount: number;
    }>;

    expect(sessions).toHaveLength(1);
    expect(sessions[0].taskId).toBe("t1");
    expect(sessions[0].seconds).toBeGreaterThanOrEqual(3);
    expect(sessions[0].pauseCount).toBe(0);

    const scoreString = window.localStorage.getItem("lf_scores");
    const scores = JSON.parse(scoreString ?? "[]") as Array<{
      sessionId: string;
      taskId: string;
      points: number;
    }>;

    expect(scores).toHaveLength(1);
    expect(scores[0].taskId).toBe("t1");
    expect(scores[0].sessionId).toBe(sessions[0].id);
    expect(scores[0].points).toBe(
      calculateSessionPoints({
        seconds: sessions[0].seconds,
        pauseCount: sessions[0].pauseCount
      })
    );

    vi.useRealTimers();
  });

  it("结束时秒数为 0 不应保存会话", async () => {
    render(<TimerPage />);
    expect(await screen.findByText("继续专注")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "完成并保存" }));
    });

    const sessions = JSON.parse(
      window.localStorage.getItem("lf_sessions") ?? "[]"
    ) as Array<unknown>;
    const scores = JSON.parse(
      window.localStorage.getItem("lf_scores") ?? "[]"
    ) as Array<unknown>;

    expect(sessions).toHaveLength(0);
    expect(scores).toHaveLength(0);
  });
});
