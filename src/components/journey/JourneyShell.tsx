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
      {/* Khung cảnh nền: Biển mây bồng bềnh SVG, Vệt nắng hoàng hôn, Hạt sáng & Vân giấy */}
      <div className="journey-sky-backdrop" aria-hidden="true">
        {/* Vệt nắng chiều xiên nhẹ (Diagonal Sunbeams) */}
        <div className="journey-sunbeams-layer" />

        {/* Quầng sáng mặt trời đường chân trời */}
        <div className="journey-sunburst-glow" />

        {/* Biển mây bồng bềnh Pure SVG (3 tầng sóng mây mềm mại không viền lặp) */}
        <div className="journey-cloud-sea">
          {/* Tầng mây 1 (Hậu cảnh): Xanh khói & Cam đào phấn mờ ảo */}
          <svg className="cloud-wave-svg wave-back" viewBox="0 0 1440 280" fill="none" preserveAspectRatio="none">
            <path
              d="M0,170 C140,120 260,190 400,140 C540,90 640,170 780,120 C920,70 1020,160 1160,110 C1280,70 1380,130 1440,105 L1440,280 L0,280 Z"
              fill="url(#cloudGradBack)"
            />
            <defs>
              <linearGradient id="cloudGradBack" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F5DFD3" stopOpacity="0.6" />
                <stop offset="45%" stopColor="#F7D8B5" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#B6C2D4" stopOpacity="0.35" />
              </linearGradient>
            </defs>
          </svg>

          {/* Tầng mây 2 (Trung cảnh): Vàng kem & Hồng đào */}
          <svg className="cloud-wave-svg wave-mid" viewBox="0 0 1440 240" fill="none" preserveAspectRatio="none">
            <path
              d="M0,120 C100,70 200,120 320,80 C440,40 540,110 660,70 C780,30 900,100 1020,60 C1140,20 1260,80 1380,50 C1410,40 1430,45 1440,55 L1440,240 L0,240 Z"
              fill="url(#cloudGradMid)"
            />
            <defs>
              <linearGradient id="cloudGradMid" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF6E0" stopOpacity="0.7" />
                <stop offset="40%" stopColor="#F5DFD3" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#C7BEAC" stopOpacity="0.45" />
              </linearGradient>
            </defs>
          </svg>

          {/* Tầng mây 3 (Tiền cảnh): Trắng kem ấm bồng bềnh */}
          <svg className="cloud-wave-svg wave-front" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
            <path
              d="M0,80 C120,30 240,75 360,40 C480,5 600,60 720,25 C840,-5 960,50 1080,20 C1200,-10 1320,40 1440,15 L1440,200 L0,200 Z"
              fill="url(#cloudGradFront)"
            />
            <defs>
              <linearGradient id="cloudGradFront" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#FFF6E0" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#F7D8B5" stopOpacity="0.6" />
              </linearGradient>
            </defs>
          </svg>
        </div>

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
