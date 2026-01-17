import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Progress from "./Progress"; // Assuming Progress.tsx is in the same directory

describe("Progress Component", () => {
  it("renders a progress bar with the correct value and style", () => {
    const value = 50;
    render(<Progress value={value} />);
    const progressBar = screen.getByRole("progressbar");

    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute("aria-valuenow", value.toString());
    expect(progressBar).toHaveClass("bg-gray-200"); // Track background
    expect(progressBar).toHaveClass("dark:bg-gray-700");

    const filledBar = screen.getByTestId("progress-filled-bar");
    expect(filledBar).toBeInTheDocument();
    expect(filledBar).toHaveClass("bg-primary"); // Filled color
    expect(filledBar).toHaveClass("h-full");
    expect(filledBar).toHaveStyle(`transform: scaleX(${value / 100})`);
    expect(filledBar).toHaveStyle("transform-origin: left");
  });

  it("handles value 0 correctly", () => {
    render(<Progress value={0} />);
    const filledBar = screen.getByTestId("progress-filled-bar");
    expect(filledBar).toHaveStyle("transform: scaleX(0)");
  });

  it("handles value 100 correctly", () => {
    render(<Progress value={100} />);
    const filledBar = screen.getByTestId("progress-filled-bar");
    expect(filledBar).toHaveStyle("transform: scaleX(1)");
  });

  it("applies custom className to the track", () => {
    render(<Progress value={25} className="custom-track-class" />);
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).toHaveClass("custom-track-class");
  });
});
