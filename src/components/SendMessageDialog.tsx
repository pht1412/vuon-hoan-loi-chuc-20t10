import React, { useState, useEffect, useRef } from 'react';
import { PublicMessage } from '../types/message';
import { createPublicMessage, generateIdempotencyKey, ApiError } from '../services/messageApi';
import {
  X,
  Sparkles,
  Heart,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Info,
  Feather,
} from 'lucide-react';
import './SendMessageDialog.css';

export type SendMessageState =
  | 'idle'
  | 'preview'
  | 'submitting'
  | 'success'
  | 'error'
  | 'uncertain';

interface SendMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent: (newMessage: PublicMessage) => void;
  triggerElement: HTMLElement | null;
}

export const SendMessageDialog: React.FC<SendMessageDialogProps> = ({
  isOpen,
  onClose,
  onMessageSent,
  triggerElement,
}) => {
  // State Machine
  const [state, setState] = useState<SendMessageState>('idle');

  // Form Fields Draft
  const [displayName, setDisplayName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [content, setContent] = useState('');

  // Field Validation Errors
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);

  // Result & Error info
  const [serverErrorMsg, setServerErrorMsg] = useState<string>('');
  const [createdMessage, setCreatedMessage] = useState<PublicMessage | null>(null);

  // Idempotency Key (preserved across direct retries, regenerated whenever draft fields change)
  const idempotencyKeyRef = useRef<string>(generateIdempotencyKey());

  // Refs for Focus Management
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const primaryActionRef = useRef<HTMLButtonElement | null>(null);
  const contentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  // Focus management & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('body-locked');

    // Auto-focus appropriate element on open or state change
    const timer = setTimeout(() => {
      if (state === 'idle') {
        if (!isAnonymous && nameInputRef.current) {
          nameInputRef.current.focus();
        } else {
          contentInputRef.current?.focus();
        }
      } else if (
        state === 'preview' ||
        state === 'success' ||
        state === 'error' ||
        state === 'uncertain'
      ) {
        primaryActionRef.current?.focus();
      }
    }, 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Khóa phím Escape khi đang gửi request
        if (state === 'submitting') {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        handleDismiss();
      }

      // Focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [isOpen, state, isAnonymous, triggerElement]);

  if (!isOpen) return null;

  // Khi người dùng thay đổi dữ liệu trong form, tự động sinh lại Idempotency Key mới
  const handleFieldChange = () => {
    idempotencyKeyRef.current = generateIdempotencyKey();
  };

  // Đóng dialog và reset form nếu đã thành công
  const handleDismiss = () => {
    if (state === 'submitting') return;

    if (state === 'success') {
      resetDraft();
    }
    onClose();
  };

  const resetDraft = () => {
    setState('idle');
    setDisplayName('');
    setIsAnonymous(false);
    setContent('');
    setDisplayNameError(null);
    setContentError(null);
    setServerErrorMsg('');
    setCreatedMessage(null);
    idempotencyKeyRef.current = generateIdempotencyKey();
  };

  // Client Validation
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate Content (giữ nguyên \n, chỉ trim 2 đầu)
    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent.length < 3) {
      setContentError('Lời chúc cần tối thiểu 3 ký tự (không tính khoảng trắng thừa).');
      isValid = false;
    } else if (trimmedContent.length > 500) {
      setContentError('Lời chúc tối đa 500 ký tự.');
      isValid = false;
    } else {
      setContentError(null);
    }

    // Validate Name
    if (!isAnonymous && displayName.trim().length > 40) {
      setDisplayNameError('Tên hiển thị không được vượt quá 40 ký tự.');
      isValid = false;
    } else {
      setDisplayNameError(null);
    }

    return isValid;
  };

  // Bước 1: Từ Idle -> Preview
  const handleProceedToPreview = () => {
    if (validateForm()) {
      setState('preview');
    }
  };

  // Bước 2: Gọi API Submitting (giữ nguyên idempotencyKey khi retry trực tiếp)
  const executeSubmit = async () => {
    setState('submitting');
    setServerErrorMsg('');

    try {
      const response = await createPublicMessage({
        content: content.trim(),
        displayName: isAnonymous ? null : displayName.trim() || null,
        isAnonymous,
        idempotencyKey: idempotencyKeyRef.current,
      });

      setCreatedMessage(response);
      // GỌI CALLBACK THÊM VÀO VƯỜN NGAY KHI API THÀNH CÔNG (Fix Bug #1)
      onMessageSent(response);
      setState('success');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.code === 'TIMEOUT_ERROR') {
        setState('uncertain');
      } else {
        const message =
          err instanceof Error
            ? err.message
            : 'Đã có sự cố xảy ra trong lúc gửi lời chúc.';
        setServerErrorMsg(message);
        setState('error');
      }
    }
  };

  // Hoàn tất và quay lại khu vườn (chỉ reset draft và đóng modal)
  const handleFinishSuccess = () => {
    resetDraft();
    onClose();
  };

  // Tên hiển thị xem trước
  const previewSenderName = isAnonymous || !displayName.trim()
    ? 'Một người bạn'
    : displayName.trim();

  // Helper cho bộ đếm ký tự
  const charLength = content.length;
  const isCharWarning = charLength >= 460 && charLength <= 500;
  const isCharOver = charLength > 500;

  return (
    <div
      className="send-dialog-overlay"
      id="send-message-dialog-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && state !== 'submitting') {
          handleDismiss();
        }
      }}
    >
      <div
        ref={modalRef}
        className="send-dialog-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-dialog-title"
        aria-describedby="send-dialog-subtitle"
      >
        {/* Nút đóng X (khóa khi submitting) */}
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-close-btn"
          id="send-dialog-close-btn"
          onClick={handleDismiss}
          disabled={state === 'submitting'}
          aria-label="Đóng biểu mẫu gửi lời chúc"
        >
          <X size={18} />
        </button>

        {/* 1. TRẠNG THÁI IDLE: Form nhập liệu */}
        {state === 'idle' && (
          <div>
            <header className="send-dialog-header">
              <div className="send-dialog-badge">
                <Sparkles size={13} aria-hidden="true" />
                <span>Gửi lời yêu thương</span>
              </div>
              <h2 className="send-dialog-title" id="send-dialog-title">
                Gieo một lời chúc
              </h2>
              <p
                id="send-dialog-subtitle"
                style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}
              >
                Chia sẻ những lời chúc chân thành nhân ngày 20/10.
              </p>
            </header>

            {/* Trường Tên người gửi */}
            <div className="form-group">
              <label htmlFor="input-display-name" className="form-label">
                <span>Tên của bạn</span>
                <span className="form-label-hint">Không bắt buộc</span>
              </label>
              <input
                ref={nameInputRef}
                id="input-display-name"
                type="text"
                className={`form-input ${displayNameError ? 'input-error' : ''}`}
                placeholder="Ví dụ: Nguyễn Văn, Một người em..."
                value={displayName}
                disabled={isAnonymous}
                maxLength={45}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  handleFieldChange(); // Tự động đổi key khi sửa dữ liệu (Fix Bug #2)
                  if (displayNameError) setDisplayNameError(null);
                }}
                aria-invalid={Boolean(displayNameError)}
                aria-describedby={displayNameError ? 'display-name-error' : undefined}
              />
              {displayNameError && (
                <div
                  id="display-name-error"
                  className="field-error-message"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle size={14} />
                  <span>{displayNameError}</span>
                </div>
              )}

              {/* Checkbox Ẩn danh */}
              <label className="checkbox-row" htmlFor="checkbox-is-anonymous">
                <input
                  id="checkbox-is-anonymous"
                  type="checkbox"
                  style={{ display: 'none' }}
                  checked={isAnonymous}
                  onChange={(e) => {
                    setIsAnonymous(e.target.checked);
                    handleFieldChange(); // Tự động đổi key khi sửa dữ liệu (Fix Bug #2)
                    if (e.target.checked) {
                      setDisplayNameError(null);
                    }
                  }}
                />
                <span
                  className={`checkbox-custom ${isAnonymous ? 'checked' : ''}`}
                  aria-hidden="true"
                >
                  {isAnonymous && <CheckCircle2 size={13} />}
                </span>
                <span className="checkbox-label">
                  Gửi lời chúc ẩn danh (Hiển thị là <em>"Một người bạn"</em>)
                </span>
              </label>
            </div>

            {/* Trường Nội dung lời chúc */}
            <div className="form-group">
              <label htmlFor="textarea-content" className="form-label">
                <span>Nội dung lời chúc *</span>
              </label>
              <textarea
                ref={contentInputRef}
                id="textarea-content"
                className={`form-input form-textarea ${contentError ? 'input-error' : ''}`}
                placeholder="Nhắn gửi những điều tốt đẹp, an yên nhất đến những người phụ nữ bạn yêu thương..."
                value={content}
                rows={4}
                onChange={(e) => {
                  setContent(e.target.value);
                  handleFieldChange(); // Tự động đổi key khi sửa dữ liệu (Fix Bug #2)
                  if (contentError) setContentError(null);
                }}
                aria-invalid={Boolean(contentError)}
                aria-describedby="content-counter content-guidance"
              />

              <div className="form-footer-meta">
                <span
                  id="content-counter"
                  className={`counter-text ${
                    isCharOver
                      ? 'counter-error'
                      : isCharWarning
                      ? 'counter-warning'
                      : ''
                  }`}
                  aria-live="polite"
                >
                  {charLength}/500 ký tự
                </span>
              </div>

              {contentError && (
                <div
                  id="content-error-msg"
                  className="field-error-message"
                  role="alert"
                  aria-live="polite"
                >
                  <AlertCircle size={14} />
                  <span>{contentError}</span>
                </div>
              )}

              <p className="form-guidance" id="content-guidance">
                <Info size={13} className="guidance-icon" aria-hidden="true" />
                <span>
                  Hãy gửi đi những lời chúc tử tế, ấm áp và không chứa thông tin riêng tư nhé.
                </span>
              </p>
            </div>

            {/* Nút hành động Idle */}
            <div className="dialog-actions">
              <button
                type="button"
                className="btn-secondary"
                id="btn-cancel-idle"
                onClick={handleDismiss}
              >
                Hủy bỏ
              </button>
              <button
                ref={primaryActionRef}
                type="button"
                className="btn-primary"
                id="btn-proceed-preview"
                onClick={handleProceedToPreview}
              >
                <span>Xem trước lời chúc</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* 2. TRẠNG THÁI PREVIEW: Bản xem trước đầy đủ (giữ nguyên \n) */}
        {state === 'preview' && (
          <div>
            <header className="send-dialog-header">
              <div className="send-dialog-badge">
                <Sparkles size={13} aria-hidden="true" />
                <span>Xem trước hiển thị</span>
              </div>
              <h2 className="send-dialog-title" id="send-dialog-title">
                Lời chúc của bạn sẽ như thế này
              </h2>
              <p
                id="send-dialog-subtitle"
                style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}
              >
                Kiểm tra kỹ trước khi lời chúc được thả vào khu vườn 20/10.
              </p>
            </header>

            {/* Bản xem trước toàn diện hiển thị trọn vẹn xuống dòng \n (Fix Bug #3) */}
            <div className="preview-full-card">
              <div className="preview-full-header">
                <span className="preview-sender-badge">
                  <span className="preview-sender-dot" aria-hidden="true" />
                  <span>{previewSenderName}</span>
                </span>
                <Feather size={14} className="preview-feather-icon" aria-hidden="true" />
              </div>
              <div className="preview-full-content">
                {content.trim()}
              </div>
            </div>

            <div className="dialog-actions">
              <button
                type="button"
                className="btn-secondary"
                id="btn-edit-from-preview"
                onClick={() => setState('idle')}
              >
                <ArrowLeft size={14} />
                <span>Chỉnh sửa</span>
              </button>
              <button
                ref={primaryActionRef}
                type="button"
                className="btn-primary"
                id="btn-confirm-send"
                onClick={executeSubmit}
              >
                <span>Xác nhận gửi</span>
                <Heart size={14} />
              </button>
            </div>
          </div>
        )}

        {/* 3. TRẠNG THÁI SUBMITTING: Đang gửi */}
        {state === 'submitting' && (
          <div className="submitting-box" role="status" aria-live="polite">
            <div className="submitting-spinner" aria-hidden="true" />
            <h2 className="submitting-title">Đang gửi lời chúc…</h2>
            <p className="submitting-desc">
              Lời chúc của bạn đang được mang tới khu vườn ngập tràn ánh sáng.
            </p>
          </div>
        )}

        {/* 4. TRẠNG THÁI SUCCESS: Thành công */}
        {state === 'success' && createdMessage && (
          <div className="state-box" role="status" aria-live="polite">
            <div className="state-icon-wrap success" aria-hidden="true">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="state-title" id="send-dialog-title">
              Lời chúc đã đến vườn 🌷
            </h2>
            <p className="state-desc" id="send-dialog-subtitle">
              Cảm ơn bạn đã gieo một hạt mầm yêu thương dịu dàng. Lời chúc của bạn đã xuất hiện và trôi nổi trên vườn hoa 20/10.
            </p>

            {/* Thẻ thành công hiển thị trọn vẹn xuống dòng \n (Fix Bug #3) */}
            <div className="preview-full-card" style={{ width: '100%', margin: '0.5rem 0 1.25rem', textAlign: 'left' }}>
              <div className="preview-full-header">
                <span className="preview-sender-badge">
                  <span className="preview-sender-dot" aria-hidden="true" />
                  <span>{previewSenderName}</span>
                </span>
                <Feather size={14} className="preview-feather-icon" aria-hidden="true" />
              </div>
              <div className="preview-full-content">
                {createdMessage.content}
              </div>
            </div>

            <button
              ref={primaryActionRef}
              type="button"
              className="btn-primary"
              id="btn-return-garden"
              onClick={handleFinishSuccess}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <span>Quay lại khu vườn</span>
            </button>
          </div>
        )}

        {/* 5. TRẠNG THÁI ERROR: Lỗi Server */}
        {state === 'error' && (
          <div className="state-box" role="alert" aria-live="assertive">
            <div className="state-icon-wrap error" aria-hidden="true">
              <AlertCircle size={32} />
            </div>
            <h2 className="state-title" id="send-dialog-title">
              Không thể gửi lời chúc
            </h2>
            <p className="state-desc" id="send-dialog-subtitle">
              {serverErrorMsg || 'Đã có lỗi xảy ra từ máy chủ. Bản nháp của bạn vẫn được lưu nguyên vẹn.'}
            </p>

            <div className="dialog-actions" style={{ width: '100%' }}>
              <button
                type="button"
                className="btn-secondary"
                id="btn-edit-from-error"
                onClick={() => setState('idle')}
              >
                <ArrowLeft size={14} />
                <span>Chỉnh sửa</span>
              </button>
              <button
                ref={primaryActionRef}
                type="button"
                className="btn-primary"
                id="btn-retry-error"
                onClick={executeSubmit}
              >
                <RefreshCw size={14} />
                <span>Thử lại</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. TRẠNG THÁI UNCERTAIN: Timeout / Mất kết nối mạng */}
        {state === 'uncertain' && (
          <div className="state-box" role="alert" aria-live="polite">
            <div className="state-icon-wrap uncertain" aria-hidden="true">
              <HelpCircle size={32} />
            </div>
            <h2 className="state-title" id="send-dialog-title">
              Chưa xác nhận được kết quả
            </h2>
            <p className="state-desc" id="send-dialog-subtitle">
              Chưa xác nhận được kết quả gửi do gián đoạn kết nối. Bạn có thể thử xác nhận lại mà không lo lời chúc bị lặp.
            </p>

            <div className="dialog-actions" style={{ width: '100%' }}>
              <button
                type="button"
                className="btn-secondary"
                id="btn-edit-from-uncertain"
                onClick={() => setState('idle')}
              >
                <ArrowLeft size={14} />
                <span>Chỉnh sửa</span>
              </button>
              <button
                ref={primaryActionRef}
                type="button"
                className="btn-primary"
                id="btn-retry-idempotent"
                onClick={executeSubmit}
              >
                <RefreshCw size={14} />
                <span>Gửi lại an toàn</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
