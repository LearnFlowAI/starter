import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Progress from "./Progress";

describe("Progress Component", () => {
  it("renders a progress bar with the correct value and classes", () => {
    const value = 50;
    render(<Progress value={value} />);
    const progressBar = screen.getByRole("progressbar");

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("value", value.toString());
    expect(progressBar).toHaveAttribute("max", "100");
    expect(progressBar).toHaveAttribute("aria-valuenow", value.toString());
    expect(progressBar).toHaveClass("bg-gray-200"); // Track background
    expect(progressBar).toHaveClass("dark:bg-gray-700");
  });

  it("handles value 0 correctly", () => {
    render(<Progress value={0} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("value", "0");
  });

  it("handles value 100 correctly", () => {
    render(<Progress value={100} />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveAttribute("value", "100");
  });

  it("applies custom className to the track", () => {
    render(<Progress value={25} className="custom-track-class" />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("custom-track-class");
  });
});
