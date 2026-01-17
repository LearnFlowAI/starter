import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Button from "./Button"; // Assuming Button.tsx is in the same directory

describe("Button Component", () => {
  it("renders a primary button with text and correct styles", () => {
    render(<Button variant="primary">Click Me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click Me");
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("text-white");
    expect(button).toHaveClass("py-2");
    expect(button).toHaveClass("px-4");
    expect(button).toHaveClass("rounded"); // Default rounded class
  });

  it("renders an icon button with correct styles", () => {
    render(<Button variant="icon" icon="add" onClick={() => {}} />);
    const button = screen.getByRole("button"); // No accessible name if only icon

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("w-10");
    expect(button).toHaveClass("h-10");
    expect(button).toHaveClass("flex");
    expect(button).toHaveClass("items-center");
    expect(button).toHaveClass("justify-center");

    const iconSpan = screen.getByText("add");
    expect(iconSpan).toBeInTheDocument();
    expect(iconSpan).toHaveClass("material-icons-round");
  });

  it("renders a floating action button (FAB) with correct styles", () => {
    render(<Button variant="fab" icon="add" onClick={() => {}} />);
    const button = screen.getByRole("button");

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("w-14");
    expect(button).toHaveClass("h-14");
    expect(button).toHaveClass("rounded-full");
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("text-white");
    expect(button).toHaveClass("shadow-glow");

    const iconSpan = screen.getByText("add");
    expect(iconSpan).toBeInTheDocument();
    expect(iconSpan).toHaveClass("material-icons-round");
    expect(iconSpan).toHaveClass("text-3xl");
  });
});
