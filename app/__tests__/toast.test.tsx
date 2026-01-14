import { act } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { ToastProvider, useToast } from "../components/Toast";

function ToastDemo() {
  const { showToast } = useToast();
  return (
    <button
      type="button"
      onClick={() => showToast("success", "保存成功")}
    >
      触发
    </button>
  );
}

describe("Toast", () => {
  it("展示并可关闭 toast", async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    );

    await user.click(screen.getByRole("button", { name: "触发" }));
    expect(screen.getByText("保存成功")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "关闭" }));
    expect(screen.queryByText("保存成功")).not.toBeInTheDocument();
  });

  it("自动关闭 toast", async () => {
    vi.useFakeTimers();

    render(
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "触发" }));
    expect(screen.getByText("保存成功")).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    expect(screen.queryByText("保存成功")).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
