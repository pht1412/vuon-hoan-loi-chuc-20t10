import React from 'react';
import { Mail } from 'lucide-react';
import './PrivateEnvelope.css';

interface PrivateEnvelopeProps {
  onClick: (triggerEl: HTMLElement) => void;
}

export const PrivateEnvelope: React.FC<PrivateEnvelopeProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      id="private-envelope-button"
      className="private-envelope-btn"
      onClick={(e) => onClick(e.currentTarget)}
      aria-label="Mở phong bì riêng bí mật"
      aria-haspopup="dialog"
    >
      <span className="private-envelope-icon-wrap" aria-hidden="true">
        <Mail size={14} />
      </span>
      <span>Mở phong bì riêng</span>
      <span className="private-envelope-badge">Riêng tư</span>
    </button>
  );
};
