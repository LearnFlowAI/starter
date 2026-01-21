import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "./Modal"; // Assuming Modal.tsx is in the same directory

describe("Modal Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true and displays children", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content Here</div>
      </Modal>
    );
    const modal = screen.getByRole("dialog");
    expect(modal).toBeInTheDocument();
    expect(screen.getByText("Modal Content Here")).toBeInTheDocument();
    expect(modal).toHaveClass("fixed"); // Check for basic modal container styles
    expect(modal).toHaveClass("inset-0");
    expect(modal).toHaveClass("z-[100]");
  });

  it("renders the translucent overlay", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(screen.getByTestId("modal-overlay")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "关闭弹窗" })
    ).toBeInTheDocument();
  });

  it("closes when clicking the overlay", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    fireEvent.click(screen.getByRole("button", { name: "关闭弹窗" }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("restores body scroll when closed", () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal isOpen={false} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("");
  });

  it("does not force full-bleed dialog container styles by default", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    const modal = screen.getByRole("dialog");
    expect(modal).not.toHaveClass("max-w-none");
    expect(modal).toHaveClass("items-center");
  });

  it("uses full-bleed dialog container styles when requested", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} fullBleed>
        <div>Modal Content</div>
      </Modal>
    );
    const modal = screen.getByRole("dialog");
    expect(modal).toHaveClass("w-full");
    expect(modal).toHaveClass("max-w-none");
    expect(modal).toHaveClass("m-0");
    expect(modal).toHaveClass("p-0");
    expect(modal).toHaveClass("min-h-screen");
  });

  it("applies custom className to the modal content wrapper", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} contentClassName="custom-modal-class">
        <div>Custom Content</div>
      </Modal>
    );
    const modalContent = screen.getByTestId("modal-content-wrapper");
    expect(modalContent).toHaveClass("custom-modal-class");
  });
});
