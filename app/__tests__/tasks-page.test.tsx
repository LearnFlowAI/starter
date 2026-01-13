import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import TasksPage from "../tasks/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams()
}));

describe("任务页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("渲染新增任务界面", async () => {
    render(<TasksPage />);

    expect(
      await screen.findByRole("heading", { name: "添加新任务" })
    ).toBeInTheDocument();
  });

  it("新增任务写入本地存储", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await screen.findByRole("heading", { name: "添加新任务" });

    await user.type(
      screen.getByPlaceholderText("例如：完成第10页习题"),
      "阅读理解"
    );
    const rangeInput = screen.getByRole("slider");
    fireEvent.change(rangeInput, { target: { value: "30" } });

    await user.click(screen.getByRole("button", { name: /确认添加/ }));

    await waitFor(() => {
      const stored = JSON.parse(
        window.localStorage.getItem("lf_tasks") ?? "[]"
      ) as Array<{ title: string }>;
      expect(stored.some((task) => task.title === "阅读理解")).toBe(true);
    });
  });
});
