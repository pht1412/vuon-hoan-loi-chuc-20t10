import React, { useState, useEffect, useRef } from 'react';
import { verifyPasscodeAndLoadJourney, getRemainingLockSeconds } from '../../services/privateJourneyApi';
import { PrivateJourneyData } from '../../types/journey';
import { X, Mail, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import './PasscodeDialog.css';

interface PasscodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: PrivateJourneyData) => void;
  triggerElement: HTMLElement | null;
}

export const PasscodeDialog: React.FC<PasscodeDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  triggerElement,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [remainingLock, setRemainingLock] = useState(0);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Check rate limit timer
  useEffect(() => {
    if (!isOpen) return;

    const checkLock = () => {
      const remaining = getRemainingLockSeconds();
      setRemainingLock(remaining);
    };

    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Focus management & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('body-locked');

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isVerifying) return;
        e.preventDefault();
        handleClose();
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
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
        }, 15);
      }
    };
  }, [isOpen, isVerifying, triggerElement]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isVerifying) return;
    setPasscode('');
    setErrorMessage('');
    onClose();
  };

  const handleVerify = async () => {
    if (!passcode.trim() || isVerifying || remainingLock > 0) return;

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const data = await verifyPasscodeAndLoadJourney(passcode);
      setPasscode('');
      setIsVerifying(false);
      onSuccess(data);
    } catch (err: unknown) {
      setIsVerifying(false);
      const msg = err instanceof Error ? err.message : 'Mật khẩu chưa chính xác.';
      setErrorMessage(msg);
      setRemainingLock(getRemainingLockSeconds());
    }
  };

  return (
    <div
      className="passcode-dialog-overlay"
      id="passcode-dialog-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isVerifying) {
          handleClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="passcode-dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="passcode-dialog-title"
        aria-describedby="passcode-dialog-subtitle"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close-btn"
          id="passcode-dialog-close-btn"
          onClick={handleClose}
          disabled={isVerifying}
          aria-label="Đóng hộp thoại mở phong bì"
        >
          <X size={18} />
        </button>

        <div className="passcode-wax-seal" aria-hidden="true">
          <Mail size={26} />
        </div>

        <h2 className="passcode-title" id="passcode-dialog-title">
          Mở phong bì riêng
        </h2>
        <p className="passcode-subtitle" id="passcode-dialog-subtitle">
          Nhập mã mở thư để bước vào không gian nhỏ dành riêng cho cậu nhé.
        </p>

        <div className="passcode-input-wrapper">
          <input
            ref={inputRef}
            id="input-passcode"
            type={showPassword ? 'text' : 'password'}
            className={`passcode-input ${errorMessage ? 'input-error' : ''}`}
            placeholder="Nhập mã mở thư..."
            value={passcode}
            disabled={isVerifying || remainingLock > 0}
            onChange={(e) => {
              setPasscode(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleVerify();
              }
            }}
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? 'passcode-error-msg' : undefined}
          />
          <button
            type="button"
            className="passcode-eye-btn"
            id="btn-toggle-passcode-visibility"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Ẩn mật mã' : 'Hiện mật mã'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {errorMessage && (
          <div
            id="passcode-error-msg"
            className="passcode-error-msg"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="passcode-actions">
          <button
            type="button"
            className="passcode-submit-btn"
            id="btn-submit-passcode"
            onClick={handleVerify}
            disabled={!passcode.trim() || isVerifying || remainingLock > 0}
          >
            {isVerifying ? (
              <>
                <span className="passcode-spinner" aria-hidden="true" />
                <span>Đang kiểm tra…</span>
              </>
            ) : (
              <>
                <span>Mở phong bì</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>

          <button
            type="button"
            className="passcode-back-btn"
            id="btn-cancel-passcode"
            onClick={handleClose}
            disabled={isVerifying}
          >
            Quay về khu vườn
          </button>
        </div>
      </div>
    </div>
  );
};
