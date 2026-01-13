import { render, screen } from "@testing-library/react";
import ProfilePage from "../profile/page";

describe("个人中心页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("渲染主视图入口", async () => {
    render(<ProfilePage />);

    expect(await screen.findByText("我的成长")).toBeInTheDocument();
    expect(screen.getByText("积分商店")).toBeInTheDocument();
    expect(screen.getByText("分享成就")).toBeInTheDocument();
  });
});
