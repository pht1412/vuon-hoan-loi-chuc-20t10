import React from 'react';
import { FinalLetterData } from '../../../types/journey';
import { RotateCcw, Home, Mail } from 'lucide-react';
import '../JourneyScenes.css';

interface FinalLetterSceneProps {
  letter: FinalLetterData;
  onRestart: () => void;
  onReturnToGarden: () => void;
}

export const FinalLetterScene: React.FC<FinalLetterSceneProps> = ({
  letter,
  onRestart,
  onReturnToGarden,
}) => {
  return (
    <div className="scene-container" id="scene-final-letter">
      <header className="scene-header">
        <h2 className="scene-title">Lá thư cuối</h2>
        <p className="scene-subtitle">
          Những dòng chữ mộc mạc gửi đến cậu trước khi khép lại hành trình nhỏ này.
        </p>
      </header>

      {/* Bức thư tay trên nền giấy màu nước kem ấm #FAF7F2 */}
      <article className="letter-parchment" aria-label="Nội dung bức thư tay gửi cậu">
        <h3 className="letter-salutation">{letter.title}</h3>

        {/* 4 đoạn văn xuất hiện tuần tự từ từ (staggered fade-in) */}
        {letter.paragraphs.map((p, idx) => (
          <p key={idx} className={`letter-paragraph letter-p-${idx}`}>
            {p}
          </p>
        ))}

        <footer className="letter-signoff">
          {/* Con dấu sáp nhỏ màu #F5DFD3 / #7E8F9F tách biệt bên trái */}
          <div className="letter-wax-seal-badge" aria-hidden="true">
            <Mail size={20} />
          </div>

          {/* Khối văn bản ngày tháng và chữ ký bên phải */}
          <div className="letter-signoff-text">
            <time className="letter-date">{letter.date}</time>
            <span className="letter-signature">{letter.signature}</span>
          </div>
        </footer>
      </article>

      {/* Thanh điều hướng cuối thư */}
      <div className="letter-actions-group">
        <button
          type="button"
          className="btn-journey-action-secondary"
          id="btn-restart-journey"
          onClick={onRestart}
        >
          <RotateCcw size={15} />
          <span>Đọc lại từ Chặng 1</span>
        </button>

        <button
          type="button"
          className="btn-journey-action-primary"
          id="btn-exit-journey-final"
          onClick={onReturnToGarden}
        >
          <Home size={15} />
          <span>Quay về Vườn lời chúc</span>
        </button>
      </div>
    </div>
  );
};
