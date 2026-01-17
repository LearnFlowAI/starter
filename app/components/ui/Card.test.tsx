import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Card from "./Card"; // Assuming Card.tsx is in the same directory

describe("Card Component", () => {
  it("renders a card with children and correct basic styles", () => {
    const { container } = render(<Card><div>Card Content</div></Card>);
    const card = container.firstChild;

    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("bg-card-light");
    expect(card).toHaveClass("dark:bg-card-dark");
    expect(card).toHaveClass("rounded-xl"); // Corrected to match implementation
    expect(card).toHaveClass("shadow-card");
    expect(card).toHaveClass("p-4"); // Default padding
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="custom-card-class"><div>Another Content</div></Card>);
    const card = container.firstChild;
    expect(card).toHaveClass("custom-card-class");
  });
});
