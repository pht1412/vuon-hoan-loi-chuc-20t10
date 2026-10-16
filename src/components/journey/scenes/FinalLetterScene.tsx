import React from 'react';
import { FinalLetterData } from '../../../types/journey';
import { Sparkles, RotateCcw, Home } from 'lucide-react';
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
        <span className="scene-tag">
          <Sparkles size={13} aria-hidden="true" />
          <span>Chặng 5 / 5</span>
        </span>
        <h2 className="scene-title">Lá thư cuối</h2>
        <p className="scene-subtitle">
          Những dòng chữ mộc mạc gửi đến cậu trước khi khép lại hành trình nhỏ này.
        </p>
      </header>

      {/* Bức thư tay trên nền giấy kem ấm */}
      <article className="letter-parchment" aria-label="Nội dung bức thư tay gửi cậu">
        <h3 className="letter-salutation">{letter.title}</h3>

        {letter.paragraphs.map((p, idx) => (
          <p key={idx} className="letter-paragraph">
            {p}
          </p>
        ))}

        <footer className="letter-signoff">
          <time className="letter-date">{letter.date}</time>
          <span className="letter-signature">{letter.signature}</span>
        </footer>
      </article>

      {/* Nút hành động cuối chặng 5 */}
      <div
        style={{
          display: 'flex',
          gap: '0.85rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginTop: '1.8rem',
          width: '100%',
        }}
      >
        <button
          type="button"
          className="btn-secondary"
          id="btn-restart-journey"
          onClick={onRestart}
        >
          <RotateCcw size={14} />
          <span>Xem lại từ Chặng 1</span>
        </button>

        <button
          type="button"
          className="btn-primary"
          id="btn-exit-journey-final"
          onClick={onReturnToGarden}
        >
          <Home size={14} />
          <span>Quay về Vườn lời chúc</span>
        </button>
      </div>
    </div>
  );
};
