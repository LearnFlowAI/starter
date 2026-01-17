import { render, screen } from "@testing-library/react";
import RootLayout from "./layout"; // Assuming layout.tsx is in the same directory
import "@testing-library/jest-dom";

// Mock the next/font/google imports
vi.mock("next/font/google", () => ({
  Poppins: () => ({ variable: "--font-sans" }),
  Noto_Sans_SC: () => ({ variable: "--font-noto" }),
  Nunito: () => ({ variable: "--font-display" }),
  Plus_Jakarta_Sans: () => ({ variable: "--font-jakarta" }),
}));

describe("RootLayout", () => {
  it("applies the correct Tailwind classes to the main content container", () => {
    render(<RootLayout><div>Test Child</div></RootLayout>);

    const mainContainer = screen.getByTestId("mobile-view-container");

    // Expect the div to have the new set of Tailwind classes
    expect(mainContainer).toHaveClass("max-w-md");
    expect(mainContainer).toHaveClass("mx-auto");
    expect(mainContainer).toHaveClass("min-h-screen");
    expect(mainContainer).toHaveClass("relative");
    expect(mainContainer).toHaveClass("overflow-hidden");
    expect(mainContainer).toHaveClass("bg-background-light");
    expect(mainContainer).toHaveClass("dark:bg-background-dark");
    expect(mainContainer).toHaveClass("transition-colors");
    expect(mainContainer).toHaveClass("duration-300");

    // Ensure the old 'mobile-view-container' class is NOT present,
    // though this will be removed from globals.css not the element directly
    // This assertion is more about the final state after both steps
    expect(mainContainer).not.toHaveClass("mobile-view-container"); 
  });
});
