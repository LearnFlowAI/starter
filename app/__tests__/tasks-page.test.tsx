import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TasksPage from "../tasks/page";

describe("TasksPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("renders default tasks after hydration", async () => {
    render(<TasksPage />);

    expect(
      await screen.findByRole("heading", { name: "今日任务" })
    ).toBeInTheDocument();
    expect(screen.getByText("数学口算 20 分钟")).toBeInTheDocument();
    expect(screen.getByText(/当前专注：数学口算 20 分钟/)).toBeInTheDocument();
  });

  it("adds a new task and sets it as active", async () => {
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

  it("edits an existing task", async () => {
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

  it("deletes a task", async () => {
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
