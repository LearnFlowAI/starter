import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RecordPage from "../record/page";

describe("记录页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("无记录时展示空状态", async () => {
    render(<RecordPage />);

    expect(await screen.findByText("记录列表")).toBeInTheDocument();
    expect(
      screen.getByText("暂无记录，完成一次学习后会自动沉淀到这里。")
    ).toBeInTheDocument();
  });

  it("创建记录并选中", async () => {
    const user = userEvent.setup();
    render(<RecordPage />);

    await screen.findByText("记录列表");

    await user.click(screen.getByRole("button", { name: "完成记录并结算" }));

    expect(await screen.findByText("1 条记录")).toBeInTheDocument();
    expect(screen.getAllByText("数学口算 20 分钟")).toHaveLength(2);
    expect(screen.getByText("+26 积分")).toBeInTheDocument();
    expect(screen.getByText("当前详情")).toBeInTheDocument();
  });
});
