import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import EmptyState from "../components/EmptyState";

describe("EmptyState", () => {
  it("渲染文案并触发操作按钮", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <EmptyState
        icon="insights"
        title="暂无数据"
        description="先创建一个任务"
        actionLabel="去创建"
        onAction={onAction}
      />
    );

    expect(screen.getByText("暂无数据")).toBeInTheDocument();
    expect(screen.getByText("先创建一个任务")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "去创建" }));
    expect(onAction).toHaveBeenCalled();
  });
});
