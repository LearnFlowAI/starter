import { render, screen } from "@testing-library/react";
import SettingsPage from "../settings/page";

describe("规则配置页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("渲染默认规则列表", async () => {
    render(<SettingsPage />);

    expect(await screen.findByText("规则配置")).toBeInTheDocument();
    expect(screen.getByText("专注奖励")).toBeInTheDocument();
    expect(screen.getByText("无错奖励")).toBeInTheDocument();
  });
});
