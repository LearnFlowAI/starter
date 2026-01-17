import type React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentClassName?: string; // For custom styling of the modal content wrapper
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, contentClassName }) => {
  if (!isOpen) return null;

  const handleOverlayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <dialog
      open
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-6"
      aria-modal="true"
      data-testid="modal-container"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={handleOverlayKeyDown}
        data-testid="modal-overlay"
        aria-label="关闭弹窗"
      />

      <div
        className={`bg-white dark:bg-gray-900 shadow-2xl relative z-10 animate-fade-in-up ${contentClassName || ''}`}
        data-testid="modal-content-wrapper"
      >
        {children}
      </div>
    </dialog>
  );
};

export default Modal;
