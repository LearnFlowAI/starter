import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import RecordPage from "../record/page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock })
}));

describe("记录页", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
  });

  it("无会话时展示空状态", async () => {
    render(<RecordPage />);

    expect(
      await screen.findByText("暂无可结算的专注记录")
    ).toBeInTheDocument();
    expect(
      screen.getByText("完成一次计时后，这里会出现专注总结。")
    ).toBeInTheDocument();
  });

  it("保存记录写入本地存储", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "lf_sessions",
      JSON.stringify([
        {
          id: "ses_1",
          taskId: "t1",
          seconds: 1200,
          pauseCount: 0,
          startedAt: new Date().toISOString(),
          endedAt: new Date().toISOString()
        }
      ])
    );
    window.localStorage.setItem(
      "lf_scores",
      JSON.stringify([
        {
          id: "scr_1",
          sessionId: "ses_1",
          taskId: "t1",
          points: 26,
          seconds: 1200,
          pauseCount: 0,
          createdAt: new Date().toISOString()
        }
      ])
    );
    render(<RecordPage />);

    await screen.findByText("保存并退出");

    await user.click(screen.getByRole("button", { name: /保存并退出/ }));

    const stored = JSON.parse(
      window.localStorage.getItem("lf_records") ?? "[]"
    ) as Array<{ taskId: string; points: number }>;
    expect(stored).toHaveLength(1);
    expect(stored[0].taskId).toBe("t1");
    expect(stored[0].points).toBe(170);
  });
});
