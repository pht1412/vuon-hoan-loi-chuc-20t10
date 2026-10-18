import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import './MusicChoiceDialog.css';

interface MusicChoiceDialogProps {
  onChoose: (wantMusic: boolean) => void;
}

/**
 * Hộp thoại lựa chọn nhạc nền — hiện khi chưa có preference được lưu.
 * Không đóng được bằng Escape hoặc click ngoài để tránh trạng thái chưa xác định.
 * Gọi audio.play() trực tiếp từ click handler của người dùng để tránh NotAllowedError.
 */
export const MusicChoiceDialog: React.FC<MusicChoiceDialogProps> = ({ onChoose }) => {
  return (
    <div className="music-choice-overlay" role="dialog" aria-modal="true" aria-labelledby="music-choice-title">
      <div className="music-choice-card">
        <div className="music-choice-icon" aria-hidden="true">🌸</div>
        <h2 className="music-choice-title" id="music-choice-title">
          Một chút nhạc cho khu vườn?
        </h2>
        <p className="music-choice-desc">
          Một chút giai điệu dịu dàng có thể khiến hành trình khám phá thêm ấm áp.
        </p>
        <div className="music-choice-actions">
          <button
            type="button"
            className="music-choice-btn primary"
            onClick={() => onChoose(true)}
            aria-label="Bật nhạc nền"
          >
            <Volume2 size={15} />
            <span>Bật nhạc</span>
          </button>
          <button
            type="button"
            className="music-choice-btn secondary"
            onClick={() => onChoose(false)}
            aria-label="Vào vườn không có nhạc"
          >
            <VolumeX size={15} />
            <span>Để yên tĩnh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
