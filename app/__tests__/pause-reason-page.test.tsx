import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import PauseReasonPage from "../pause-reason/page";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock })
}));

describe("暂停原因页", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushMock.mockClear();
  });

  it("选择原因后写入待定原因并返回计时页", async () => {
    const user = userEvent.setup();
    render(<PauseReasonPage />);

    await user.click(screen.getByRole("button", { name: /分心走神/ }));
    await user.click(screen.getByRole("button", { name: "确认暂停" }));

    expect(window.localStorage.getItem("lf_pause_reason_pending")).toBe(
      JSON.stringify("distraction")
    );
    expect(pushMock).toHaveBeenCalledWith("/timer");
  });
});
