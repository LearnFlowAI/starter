import type React from 'react';
import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  contentClassName?: string; // For custom styling of the modal content wrapper
  overlayClassName?: string;
  containerClassName?: string;
  fullBleed?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  contentClassName,
  overlayClassName,
  containerClassName,
  fullBleed
}) => {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <dialog
      open
      className={`fixed inset-0 z-[100] flex justify-center ${
        fullBleed
          ? 'w-full max-w-none m-0 p-0 min-h-screen'
          : 'items-center p-6'
      } ${containerClassName || ''}`}
      aria-modal="true"
      onKeyDown={handleDialogKeyDown}
      data-testid="modal-container"
    >
      <div
        className={`fixed inset-0 ${overlayClassName || 'bg-white/70 backdrop-blur-[2px]'}`}
        role="button"
        aria-label="关闭弹窗"
        tabIndex={0}
        data-testid="modal-overlay"
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClose();
          }
        }}
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
