import React, { forwardRef } from 'react';
import { PublicMessage, getSenderDisplayName } from '../types/message';
import { Feather, ArrowRight, Pin } from 'lucide-react';
import './MessageCard.css';

interface MessageCardProps {
  message: PublicMessage;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const MessageCard = forwardRef<HTMLButtonElement, MessageCardProps>(
  ({ message, onClick, className = '', style }, ref) => {
    const senderName = getSenderDisplayName(message);
    const pinnedClass = message.isPinned ? 'is-pinned' : '';

    return (
      <button
        ref={ref}
        type="button"
        id={`message-card-${message.id}`}
        className={`message-card ${pinnedClass} ${className}`}
        style={style}
        onClick={onClick}
        aria-haspopup="dialog"
        aria-label={`Lời chúc từ ${senderName}: ${message.content.slice(0, 40)}...`}
      >
        <div className="message-card-header">
          <span className="message-sender-badge">
            <span className="message-sender-dot" aria-hidden="true" />
            <span className="message-sender-name">{senderName}</span>
          </span>
          {message.isPinned ? (
            <span className="message-pinned-tag" title="Lời chúc ghim nổi bật">
              <Pin size={11} aria-hidden="true" />
            </span>
          ) : (
            <Feather className="message-quote-icon" aria-hidden="true" size={13} />
          )}
        </div>

        <p className="message-card-body">{message.content}</p>

        <div className="message-card-footer">
          <span className="message-read-hint">
            <span>Đọc tiếp</span>
            <ArrowRight size={11} aria-hidden="true" />
          </span>
        </div>
      </button>
    );
  }
);

MessageCard.displayName = 'MessageCard';
