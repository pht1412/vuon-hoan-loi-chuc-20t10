import React, { useEffect, useRef } from 'react';
import { PublicMessage, getSenderDisplayName } from '../types/message';
import { X, Feather } from 'lucide-react';
import './MessageDetailDialog.css';

interface MessageDetailDialogProps {
  message: PublicMessage | null;
  isOpen: boolean;
  onClose: () => void;
  triggerElement: HTMLElement | null;
}

export const MessageDetailDialog: React.FC<MessageDetailDialogProps> = ({
  message,
  isOpen,
  onClose,
  triggerElement,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Manage body scroll lock & auto focus
  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    document.body.classList.add('body-locked');

    // Auto-focus the close button or first interactive element
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    // Escape key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Simple focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove('body-locked');
      window.removeEventListener('keydown', handleKeyDown);

      // Return focus to trigger element
      if (triggerElement) {
        // Small delay to ensure modal unmounted/hidden
        setTimeout(() => {
          triggerElement.focus();
        }, 10);
      }
    };
  }, [isOpen, onClose, triggerElement]);

  if (!isOpen || !message) {
    return null;
  }

  const senderName = getSenderDisplayName(message);

  return (
    <div
      className="modal-overlay"
      id="message-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-sender-name"
        aria-describedby="dialog-message-content"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close-btn"
          id="dialog-close-top-btn"
          onClick={onClose}
          aria-label="Đóng hộp thoại đọc lời chúc"
        >
          <X size={18} />
        </button>

        <header className="modal-header">
          <div className="modal-tag">
            <Feather size={12} aria-hidden="true" />
            <span>Lời nhắn gửi</span>
          </div>
          <h2 className="modal-title" id="dialog-sender-name">
            {senderName}
          </h2>
        </header>

        <div className="modal-content-quote" id="dialog-message-content">
          {message.content}
        </div>

        <footer className="modal-footer">
          <span className="modal-date">
            Dịp 20/10 • Ngày Phụ Nữ Việt Nam
          </span>
          <button
            type="button"
            className="modal-action-close"
            id="dialog-close-bottom-btn"
            onClick={onClose}
          >
            Đã đọc xong
          </button>
        </footer>
      </div>
    </div>
  );
};
