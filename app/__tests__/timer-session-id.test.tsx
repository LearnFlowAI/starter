import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import TimerPage from "../timer/page";
import { defaultTasks } from "../lib/defaults";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("../lib/theme", () => ({
  useTheme: () => ({
    ready: true,
  }),
}));

describe("TimerPage sessionId 兜底", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
  });

  it("续跑写入中断时应补齐 sessionId", async () => {
    const now = new Date().toISOString();
    const taskId = defaultTasks[0].id;

    window.localStorage.setItem("lf_tasks", JSON.stringify(defaultTasks));
    window.localStorage.setItem("lf_active_task", JSON.stringify(taskId));
    window.localStorage.setItem("lf_timer_running", JSON.stringify(false));
    window.localStorage.setItem("lf_timer_started_at", JSON.stringify(now));
    window.localStorage.setItem("lf_current_session_id", JSON.stringify(""));
    window.localStorage.setItem(
      "lf_pause_started_at",
      JSON.stringify(Date.now() - 5000)
    );
    window.localStorage.setItem(
      "lf_pause_reason_pending",
      JSON.stringify("other")
    );
    window.localStorage.setItem("lf_interruptions", JSON.stringify([]));

    render(<TimerPage />);

    fireEvent.click(screen.getByRole("button", { name: "继续专注" }));

    await waitFor(() => {
      const interruptions = JSON.parse(
        window.localStorage.getItem("lf_interruptions") ?? "[]"
      );
      expect(interruptions[0]?.sessionId).toBeTruthy();
    }, { timeout: 1000 });
  });
});
