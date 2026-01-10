import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import TimerPage from "../timer/page";

describe("TimerPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("runs, pauses, and resets the timer", async () => {
    const { unmount } = render(<TimerPage />);
    expect(
      await screen.findByRole("heading", { name: "计时器" })
    ).toBeInTheDocument();

    vi.useFakeTimers();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "开始" }));
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.getByText((_, element) => element?.textContent === "00:02")
    ).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "暂停" }));
    });
    expect(screen.getByText("暂停次数 1")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "结束并重置" }));
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
});
