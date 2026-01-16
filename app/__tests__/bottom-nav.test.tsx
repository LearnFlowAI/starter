import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import BottomNav from "../components/BottomNav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/overview"
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

describe("BottomNav", () => {
  it("高亮当前路由并标记 aria-current", () => {
    render(<BottomNav />);

    const activeLink = screen.getByRole("link", { name: "统计" });
    expect(activeLink).toHaveClass("text-primary");
    expect(activeLink).toHaveAttribute("aria-current", "page");
  });
});
