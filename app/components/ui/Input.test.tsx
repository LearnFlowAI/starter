import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Input from "./Input"; // Assuming Input.tsx is in the same directory

describe("Input Component", () => {
  it("renders an input field with a placeholder", () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText("Enter text");

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text"); // Default type
    expect(input).toHaveClass("border");
    expect(input).toHaveClass("border-gray-300");
    expect(input).toHaveClass("rounded");
    expect(input).toHaveClass("py-2");
    expect(input).toHaveClass("px-3");
    expect(input).toHaveClass("focus:outline-none");
    expect(input).toHaveClass("focus:ring-2");
    expect(input).toHaveClass("focus:ring-primary");
    expect(input).toHaveClass("focus:border-transparent");
  });

  it("renders an input field with a custom type", () => {
    render(<Input type="password" placeholder="Enter password" />);
    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("applies custom className", () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-class");
  });
});
