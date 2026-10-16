import React from 'react';
import { Sparkles } from 'lucide-react';
import { PrivateEnvelope } from './PrivateEnvelope';
import './ActionArea.css';

interface ActionAreaProps {
  onSendWishClick: (triggerEl: HTMLElement) => void;
  onPrivateEnvelopeClick: (triggerEl: HTMLElement) => void;
}

export const ActionArea: React.FC<ActionAreaProps> = ({
  onSendWishClick,
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

        <PrivateEnvelope onClick={onPrivateEnvelopeClick} />
      </nav>
    </footer>
  );
};
