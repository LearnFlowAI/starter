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

  it("calls onClose when the overlay is clicked", () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose}>
        <div>Modal Content</div>
      </Modal>
    );
    const overlay = screen.getByTestId("modal-overlay");
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
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
