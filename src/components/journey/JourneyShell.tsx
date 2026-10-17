import React, { useState, useRef, useEffect } from 'react';
import { PrivateJourneyData } from '../../types/journey';
import { WelcomeScene } from './scenes/WelcomeScene';
import { FlowerGardenScene } from './scenes/FlowerGardenScene';
import { JournalScene } from './scenes/JournalScene';
import { AppreciationScene } from './scenes/AppreciationScene';
import { FinalLetterScene } from './scenes/FinalLetterScene';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import './JourneyShell.css';

interface JourneyShellProps {
  data: PrivateJourneyData;
  onExit: () => void;
}

export const JourneyShell: React.FC<JourneyShellProps> = ({ data, onExit }) => {
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Cuộn mượt về đầu trang mỗi khi chuyển chặng
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentChapter]);

  const handleNext = () => {
    if (currentChapter < 5) {
      setCurrentChapter((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentChapter > 1) {
      setCurrentChapter((prev) => prev - 1);
    } else {
      onExit();
    }
  };

  return (
    <div
      className="journey-shell-root"
      id="journey-shell-root"
      role="region"
      aria-label="Hành trình riêng: Một điều nhỏ dành riêng cho cậu"
    >
      {/* 1. Lớp Background Ảnh Gốc cad.jpeg */}
      <div className="journey-bg-cad" aria-hidden="true" />

      {/* 2 & 3. Lớp Kính Mờ Sương Dày (Heavy Frosted Glass) & Màu Dìm Tint Trắng Kem Ấm 85% */}
      <div className="journey-frosted-overlay" aria-hidden="true" />

      {/* Khung cảnh nền: Vệt nắng hoàng hôn, Quầng sáng, Hạt nắng & Vân giấy màu nước */}
      <div className="journey-sky-backdrop" aria-hidden="true">
        {/* Vệt nắng chiều xiên nhẹ (Diagonal Sunbeams) */}
        <div className="journey-sunbeams-layer" />

        {/* Quầng sáng mặt trời đường chân trời */}
        <div className="journey-sunburst-glow" />

        {/* Hạt nắng & Bụi sao hoàng hôn lơ lửng */}
        <div className="journey-particles-container">
          <span className="journey-sunset-particle p-1" />
          <span className="journey-sunset-particle p-2" />
          <span className="journey-sunset-particle p-3" />
          <span className="journey-sunset-particle p-4" />
          <span className="journey-sunset-particle p-5" />
          <span className="journey-sunset-particle p-6" />
          <span className="journey-sunset-particle p-7" />
          <span className="journey-sunset-particle p-8" />
          <span className="journey-sunset-particle p-9" />
          <span className="journey-sunset-particle p-10" />
          <span className="journey-sunset-particle p-11" />
          <span className="journey-sunset-particle p-12" />
        </div>

        {/* Lớp vân giấy màu nước (3.5% noise) */}
        <div className="journey-paper-texture" />
      </div>

      {/* Header gọn gàng: Chỉ có 1 nút Về vườn lời chúc bên trái + Thanh tiến trình ở giữa */}
      <header className="journey-shell-topbar">
        <button
          type="button"
          className="journey-top-btn"
          id="btn-journey-top-back"
          onClick={onExit}
          aria-label="Quay về vườn lời chúc công khai"
        >
          <ArrowLeft size={15} />
          <span>Về vườn lời chúc</span>
        </button>

        <div className="journey-progress-tracker" aria-label={`Tiến trình: Chặng ${currentChapter} trên 5`}>
          {[1, 2, 3, 4, 5].map((idx) => {
            let statusClass = '';
            if (idx === currentChapter) statusClass = 'active';
            else if (idx < currentChapter) statusClass = 'completed';
            return (
              <span
                key={idx}
                className={`progress-dot ${statusClass}`}
                aria-hidden="true"
              />
            );
          })}
          <span className="progress-text">Chặng {currentChapter}/5</span>
        </div>

        {/* Khoảng trống cân đối đối xứng ở góc trên phải */}
        <div className="journey-topbar-spacer" aria-hidden="true" />
      </header>

      {/* Khu vực nội dung từng Chặng */}
      <main ref={contentRef} className="journey-shell-content" id="journey-scene-content">
        <div
          key={currentChapter}
          className={`journey-content-area ${currentChapter === 1 ? 'is-welcome' : ''}`}
        >
          {currentChapter === 1 && <WelcomeScene data={data.welcome} />}
          {currentChapter === 2 && (
            <FlowerGardenScene
              flowers={data.flowers}
              easterEgg={data.easterEggFlower}
            />
          )}
          {currentChapter === 3 && (
            <JournalScene journal={data.journal} psNote={data.psNote} />
          )}
          {currentChapter === 4 && (
            <AppreciationScene appreciations={data.appreciations} />
          )}
          {currentChapter === 5 && (
            <FinalLetterScene
              letter={data.finalLetter}
              onRestart={() => setCurrentChapter(1)}
              onReturnToGarden={onExit}
            />
          )}
        </div>
      </main>

      {/* Footer chuẩn hóa: Chặng 1 không có nút trái để tránh trùng lặp; Nút phải linh hoạt */}
      <footer className="journey-shell-bottombar">
        {currentChapter > 1 ? (
          <button
            type="button"
            className="journey-nav-btn secondary"
            id="btn-journey-prev"
            onClick={handleBack}
          >
            <ArrowLeft size={15} />
            <span>Chặng trước</span>
          </button>
        ) : (
          <div className="journey-bottombar-spacer" aria-hidden="true" />
        )}

        {/* Nút Tiếp tục luôn luôn sẵn sàng, ở Chặng 1 đổi nhãn thành "Bước qua cánh cửa" */}
        {currentChapter < 5 && (
          <button
            type="button"
            className="journey-nav-btn primary"
            id="btn-journey-next"
            onClick={handleNext}
          >
            <span>{currentChapter === 1 ? 'Bước qua cánh cửa' : 'Tiếp tục'}</span>
            <ArrowRight size={15} />
          </button>
        )}
      </footer>
    </div>
  );
};
