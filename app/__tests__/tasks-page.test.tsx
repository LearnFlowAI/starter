import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TasksPage from "../tasks/page";

describe("任务页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("水合后渲染默认任务", async () => {
    render(<TasksPage />);

    expect(
      await screen.findByRole("heading", { name: "今日任务" })
    ).toBeInTheDocument();
    expect(screen.getByText("数学口算 20 分钟")).toBeInTheDocument();
    expect(screen.getByText(/当前专注：数学口算 20 分钟/)).toBeInTheDocument();
  });

  it("新增任务并设为当前任务", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await screen.findByRole("heading", { name: "今日任务" });

    await user.type(screen.getByPlaceholderText("任务标题"), "阅读理解");
    await user.type(screen.getByPlaceholderText("科目/领域"), "语文");
    const minutesInput = screen.getByRole("spinbutton");
    await user.clear(minutesInput);
    await user.type(minutesInput, "30");

    await user.click(screen.getByRole("button", { name: "新增任务" }));

    expect(screen.getByText("阅读理解")).toBeInTheDocument();
    expect(screen.getByText("计划 30 分钟")).toBeInTheDocument();
    expect(screen.getByText(/当前专注：阅读理解/)).toBeInTheDocument();
  });

  it("编辑已有任务", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await screen.findByRole("heading", { name: "今日任务" });

    const taskCard = screen
      .getByText("英语阅读 15 分钟")
      .closest("div")?.parentElement;
    expect(taskCard).toBeTruthy();
    const editButton = within(taskCard as HTMLElement).getByRole("button", {
      name: "编辑"
    });

    await user.click(editButton);
    const titleInput = screen.getByPlaceholderText("任务标题");
    await user.clear(titleInput);
    await user.type(titleInput, "英语精读");

    await user.click(screen.getByRole("button", { name: "保存修改" }));

    expect(screen.getByText("英语精读")).toBeInTheDocument();
  });

  it("删除任务", async () => {
    const user = userEvent.setup();
    render(<TasksPage />);

    await screen.findByRole("heading", { name: "今日任务" });

    const taskCard = screen
      .getByText("语文默写 10 分钟")
      .closest("div")?.parentElement;
    expect(taskCard).toBeTruthy();
    const deleteButton = within(taskCard as HTMLElement).getByRole("button", {
      name: "删除"
    });

    await user.click(deleteButton);

    expect(screen.queryByText("语文默写 10 分钟")).not.toBeInTheDocument();
  });
});
