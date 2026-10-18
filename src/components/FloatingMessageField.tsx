import React, { useState, useEffect, useMemo, useRef } from 'react';
import { prioritizeTemporaryMessages, PublicMessage } from '../types/message';
import { MessageCard } from './MessageCard';
import { Sparkles, RefreshCw, Pause, Play } from 'lucide-react';
import './FloatingMessageField.css';

interface FloatingMessageFieldProps {
  messages: PublicMessage[];
  onSelectMessage: (message: PublicMessage, triggerEl: HTMLElement) => void;
  onToggleDevDemo?: () => void;
  isDevDemoActive?: boolean;
  isLoading?: boolean;
  temporarilyHighlightedIds?: string[];
}

const DISPLAY_SLOTS_COUNT = 12;
const ROTATION_INTERVAL_MS = 18000; // 18 giây đổi một nhịp

export const FloatingMessageField: React.FC<FloatingMessageFieldProps> = ({
  messages,
  onSelectMessage,
  onToggleDevDemo,
  isDevDemoActive = false,
  isLoading = false,
  temporarilyHighlightedIds = [],
}) => {
  const [unpinnedOffset, setUnpinnedOffset] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Phân tách lời chúc ghim và lời chúc thường
  const { temporaryMessages, pinnedMessages, unpinnedMessages } = useMemo(() => {
    const temporaryIdSet = new Set(temporarilyHighlightedIds);
    const pinned: PublicMessage[] = [];
    const unpinned: PublicMessage[] = [];
    messages.forEach((msg) => {
      if (temporaryIdSet.has(msg.id)) return;
      if (msg.isPinned) {
        pinned.push(msg);
      } else {
        unpinned.push(msg);
      }
    });
    const temporary = prioritizeTemporaryMessages(messages, temporarilyHighlightedIds);
    return {
      temporaryMessages: temporary.slice(0, temporarilyHighlightedIds.length),
      pinnedMessages: pinned,
      unpinnedMessages: unpinned,
    };
  }, [messages, temporarilyHighlightedIds]);

  // Tính toán 12 thẻ hiển thị trên màn hình
  const displayedMessages = useMemo(() => {
    const priorityMessages = [...temporaryMessages, ...pinnedMessages];
    if (messages.length <= DISPLAY_SLOTS_COUNT) {
      return [...priorityMessages, ...unpinnedMessages].slice(0, DISPLAY_SLOTS_COUNT);
    }

    const priorityCount = Math.min(priorityMessages.length, DISPLAY_SLOTS_COUNT);
    const neededUnpinned = DISPLAY_SLOTS_COUNT - priorityCount;

    if (unpinnedMessages.length === 0) {
      return priorityMessages.slice(0, DISPLAY_SLOTS_COUNT);
    }

    // Lấy tập hợp unpinned theo vòng tròn (circular slice)
    const selectedUnpinned: PublicMessage[] = [];
    for (let i = 0; i < neededUnpinned; i++) {
      const idx = (unpinnedOffset + i) % unpinnedMessages.length;
      selectedUnpinned.push(unpinnedMessages[idx]);
    }

    return [...priorityMessages.slice(0, priorityCount), ...selectedUnpinned];
  }, [messages, pinnedMessages, temporaryMessages, unpinnedMessages, unpinnedOffset]);

  // Bộ hẹn giờ xoay vòng tự động 18s (khi có nhiều hơn 12 lời chúc)
  useEffect(() => {
    if (messages.length <= DISPLAY_SLOTS_COUNT || isPaused || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const priorityCount = Math.min(
      temporaryMessages.length + pinnedMessages.length,
      DISPLAY_SLOTS_COUNT
    );
    const neededUnpinned = DISPLAY_SLOTS_COUNT - priorityCount;
    if (unpinnedMessages.length <= neededUnpinned) return;

    timerRef.current = setInterval(() => {
      setUnpinnedOffset((prev) => (prev + neededUnpinned) % unpinnedMessages.length);
      setFadeKey((prev) => prev + 1);
    }, ROTATION_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    messages.length,
    isPaused,
    isHovered,
    pinnedMessages.length,
    temporaryMessages.length,
    unpinnedMessages.length,
  ]);

  const handleManualNext = () => {
    const priorityCount = Math.min(
      temporaryMessages.length + pinnedMessages.length,
      DISPLAY_SLOTS_COUNT
    );
    const neededUnpinned = DISPLAY_SLOTS_COUNT - priorityCount;
    if (unpinnedMessages.length > neededUnpinned) {
      setUnpinnedOffset((prev) => (prev + neededUnpinned) % unpinnedMessages.length);
      setFadeKey((prev) => prev + 1);
    }
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  if (isLoading) {
    return (
      <section
        className="floating-field-container"
        id="floating-field-container"
        aria-label="Đang nạp lời chúc từ khu vườn"
      >
        <div className="floating-field-loading" role="status">
          <span className="loading-flower-sparkle">🌸</span>
          <span className="loading-flower-text">Đang đón gió vào vườn...</span>
        </div>
      </section>
    );
  }

  if (messages.length === 0) {
    return (
      <section
        className="floating-field-container"
        id="floating-field-container"
        aria-label="Khu vực hiển thị lời chúc"
      >
        <div className="floating-field-empty" role="status">
          <div className="empty-icon-wrap" aria-hidden="true">
            <Sparkles size={24} />
          </div>
          <h2 className="empty-title">Khu vườn đang chờ bạn</h2>
          <p className="empty-text">
            Chưa có lời chúc nào trong vườn. Hãy là người đầu tiên gieo một hạt
            mầm yêu thương và ấm áp cho ngày 20/10 nhé!
          </p>

          {onToggleDevDemo && (
            <button
              type="button"
              onClick={onToggleDevDemo}
              className="empty-dev-demo-btn"
              title="Xem trước 12 vị trí cánh hoa bằng bộ lời chúc thử nghiệm (chỉ hiển thị tạm trên máy)"
            >
              <Sparkles size={13} aria-hidden="true" />
              <span>Xem thử bố cục 12 lời chúc</span>
            </button>
          )}
        </div>
      </section>
    );
  }

  const hasRotation = messages.length > DISPLAY_SLOTS_COUNT;

  return (
    <section
      className="floating-field-container"
      id="floating-field-container"
      aria-label="Vùng những lời chúc trôi nổi"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Chỉ báo đang bật bộ dữ liệu thử nghiệm */}
      {isDevDemoActive && onToggleDevDemo && (
        <div className="demo-mode-indicator" role="status">
          <span>🌿 Bố cục 12 lời chúc thử nghiệm</span>
          <span>·</span>
          <button
            type="button"
            className="demo-mode-exit-btn"
            onClick={onToggleDevDemo}
          >
            Quay lại vườn gốc
          </button>
        </div>
      )}

      <div key={fadeKey} className="floating-canvas card-fade-active">
        {displayedMessages.map((msg, index) => {
          const slotClass = index < DISPLAY_SLOTS_COUNT ? `slot-${index}` : 'slot-desktop-overflow';
          return (
            <div key={msg.id} className={`floating-slot ${slotClass}`}>
              <MessageCard
                message={msg}
                onClick={() => {
                  const el = document.getElementById(`message-card-${msg.id}`);
                  if (el) {
                    onSelectMessage(msg, el);
                  }
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Thanh điều khiển xoay vòng tinh tế khi có nhiều hơn 12 lời chúc */}
      {hasRotation && (
        <div className="rotation-control-bar" aria-label="Điều khiển xoay vòng lời chúc">
          <span className="rotation-indicator-text">
            Đang hiển thị 12 / {messages.length} lời chúc
          </span>
          <div className="rotation-btn-group">
            <button
              type="button"
              className="rotation-btn"
              onClick={togglePause}
              title={isPaused ? 'Tiếp tục tự động đổi lời chúc' : 'Tạm dừng đổi lời chúc'}
              aria-label={isPaused ? 'Tiếp tục tự động đổi' : 'Tạm dừng tự động đổi'}
            >
              {isPaused ? <Play size={12} /> : <Pause size={12} />}
            </button>
            <button
              type="button"
              className="rotation-btn"
              onClick={handleManualNext}
              title="Đổi nhóm lời chúc tiếp theo"
              aria-label="Đổi nhóm lời chúc tiếp theo"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
