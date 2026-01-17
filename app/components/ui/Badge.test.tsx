import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Badge from "./Badge"; // Assuming Badge.tsx is in the same directory

describe("Badge Component", () => {
  it("renders a badge with children and correct basic styles", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");

    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("inline-flex");
    expect(badge).toHaveClass("items-center");
    expect(badge).toHaveClass("justify-center");
    expect(badge).toHaveClass("px-2.5");
    expect(badge).toHaveClass("py-0.5");
    expect(badge).toHaveClass("rounded-full");
    expect(badge).toHaveClass("text-xs");
    expect(badge).toHaveClass("font-medium");
    expect(badge).toHaveClass("bg-primary/10");
    expect(badge).toHaveClass("text-primary");
  });

  it("applies custom className", () => {
    render(<Badge className="custom-badge-class">Custom</Badge>);
    const badge = screen.getByText("Custom");
    expect(badge).toHaveClass("custom-badge-class");
  });
});
