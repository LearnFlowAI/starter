import { render, screen } from "@testing-library/react";
import SettingsPage from "../settings/page";
import { ToastProvider } from "../components/Toast";

describe("规则配置页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("渲染默认规则列表", async () => {
    render(
      <ToastProvider>
        <SettingsPage />
      </ToastProvider>
    );

    expect(await screen.findByText("设置")).toBeInTheDocument();
    expect(screen.getByText("专注奖励")).toBeInTheDocument();
    expect(screen.getByText("无错奖励")).toBeInTheDocument();
  });
});
