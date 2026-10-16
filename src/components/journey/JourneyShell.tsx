import React, { useState, useRef, useEffect } from 'react';
import { PrivateJourneyData } from '../../types/journey';
import { WelcomeScene } from './scenes/WelcomeScene';
import { FlowerGardenScene } from './scenes/FlowerGardenScene';
import { JournalScene } from './scenes/JournalScene';
import { AppreciationScene } from './scenes/AppreciationScene';
import { FinalLetterScene } from './scenes/FinalLetterScene';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import './JourneyShell.css';

interface JourneyShellProps {
  data: PrivateJourneyData;
  onExit: () => void;
}

export const JourneyShell: React.FC<JourneyShellProps> = ({ data, onExit }) => {
  const [currentChapter, setCurrentChapter] = useState<number>(1);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Scroll to top on chapter change
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
      {/* Top Bar with Progress & Exit */}
      <header className="journey-shell-topbar">
        <button
          type="button"
          className="journey-top-btn"
          id="btn-journey-top-back"
          onClick={handleBack}
          aria-label={currentChapter === 1 ? 'Về vườn lời chúc' : 'Quay lại chặng trước'}
        >
          <ArrowLeft size={15} />
          <span>{currentChapter === 1 ? 'Về vườn' : 'Quay lại'}</span>
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

        <button
          type="button"
          className="journey-top-btn"
          id="btn-journey-top-exit"
          onClick={onExit}
          aria-label="Quay về vườn lời chúc công khai"
        >
          <Home size={15} />
          <span>Về vườn</span>
        </button>
      </header>

      {/* Main Content Area */}
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

      {/* Bottom Navigation Bar */}
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
          <button
            type="button"
            className="journey-nav-btn secondary"
            id="btn-journey-back-garden"
            onClick={onExit}
          >
            <Home size={15} />
            <span>Về vườn lời chúc</span>
          </button>
        )}

        {/* Nút Tiếp tục luôn luôn sẵn sàng (không bị block bởi easter egg) */}
        {currentChapter < 5 && (
          <button
            type="button"
            className="journey-nav-btn primary"
            id="btn-journey-next"
            onClick={handleNext}
          >
            <span>Tiếp tục</span>
            <ArrowRight size={15} />
          </button>
        )}
      </footer>
    </div>
  );
};
