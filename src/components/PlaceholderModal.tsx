import React, { useEffect, useRef } from 'react';
import { X, Sparkles, Lock } from 'lucide-react';
import './PlaceholderModal.css';

export interface PlaceholderModalInfo {
  type: 'send-message' | 'private-envelope';
  title: string;
  milestone: string;
  description: string;
}

interface PlaceholderModalProps {
  info: PlaceholderModalInfo | null;
  isOpen: boolean;
  onClose: () => void;
  triggerElement: HTMLElement | null;
}

export const PlaceholderModal: React.FC<PlaceholderModalProps> = ({
  info,
  isOpen,
  onClose,
  triggerElement,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('body-locked');

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

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

      if (triggerElement) {
        setTimeout(() => {
          triggerElement.focus();
        }, 10);
      }
    };
  }, [isOpen, onClose, triggerElement]);

  if (!isOpen || !info) {
    return null;
  }

  return (
    <div
      className="placeholder-modal-overlay"
      id="placeholder-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="placeholder-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="placeholder-modal-title"
        aria-describedby="placeholder-modal-desc"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close-btn"
          id="placeholder-close-btn"
          onClick={onClose}
          aria-label="Đóng thông báo"
        >
          <X size={18} />
        </button>

        <div className="placeholder-icon-badge" aria-hidden="true">
          {info.type === 'send-message' ? <Sparkles size={26} /> : <Lock size={26} />}
        </div>

        <span className="placeholder-milestone-tag">{info.milestone}</span>
        <h2 className="placeholder-title" id="placeholder-modal-title">
          {info.title}
        </h2>
        <p className="placeholder-desc" id="placeholder-modal-desc">
          {info.description}
        </p>

        <button
          type="button"
          className="placeholder-primary-btn"
          id="placeholder-confirm-btn"
          onClick={onClose}
        >
          Đã hiểu, quay lại khu vườn
        </button>
      </div>
    </div>
  );
};
