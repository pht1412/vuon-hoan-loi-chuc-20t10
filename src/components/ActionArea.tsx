import React from 'react';
import { Sparkles, Flower2 } from 'lucide-react';
import { PrivateEnvelope } from './PrivateEnvelope';
import './ActionArea.css';

interface ActionAreaProps {
  onSendWishClick: (triggerEl: HTMLElement) => void;
  onPublicGardenClick: (triggerEl: HTMLElement) => void;
  onPrivateEnvelopeClick: (triggerEl: HTMLElement) => void;
}

export const ActionArea: React.FC<ActionAreaProps> = ({
  onSendWishClick,
  onPublicGardenClick,
  onPrivateEnvelopeClick,
}) => {
  return (
    <footer className="action-area-wrapper" id="action-area-wrapper">
      <nav
        className="action-area-dock"
        aria-label="Thanh điều hướng hành động chính"
      >
        <button
          type="button"
          id="send-wish-main-button"
          className="primary-action-btn"
          onClick={(e) => onSendWishClick(e.currentTarget)}
          aria-haspopup="dialog"
          aria-label="Gửi một lời chúc mới đến vườn"
        >
          <Sparkles className="primary-action-icon" aria-hidden="true" />
          <span>Gửi một lời chúc</span>
        </button>

        <div className="action-divider" aria-hidden="true" />

        <button
          type="button"
          id="public-flower-garden-button"
          className="public-garden-entry-btn"
          onClick={(e) => onPublicGardenClick(e.currentTarget)}
          aria-haspopup="dialog"
          aria-label="Mở khu vườn dành cho bạn: chọn hoa rồi đọc thư"
        >
          <span className="public-garden-entry-icon" aria-hidden="true">
            <Flower2 size={14} />
          </span>
          <span>Khu vườn dành cho bạn</span>
        </button>

        <div className="action-divider" aria-hidden="true" />

        <PrivateEnvelope onClick={onPrivateEnvelopeClick} />
      </nav>
    </footer>
  );
};
