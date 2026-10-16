import React from 'react';
import { PrivateJourneyData } from '../../../types/journey';
import '../JourneyScenes.css';

interface WelcomeSceneProps {
  data: PrivateJourneyData['welcome'];
}

export const WelcomeScene: React.FC<WelcomeSceneProps> = ({ data }) => {
  return (
    <div className="scene-container welcome-scene-root" id="scene-welcome">
      {/* Background chính của Chặng 1: Bức ảnh /Congchao.jpg hòa trộn mượt mà vào bầu trời */}
      <div className="welcome-hero-backdrop" aria-hidden="true">
        <div className="welcome-hero-image" />
        <div className="welcome-hero-sunlight-vignette" />
        <div className="welcome-hero-sunburst" />
        <span className="welcome-gate-sparkle sp-1">✦</span>
        <span className="welcome-gate-sparkle sp-2">✦</span>
        <span className="welcome-gate-sparkle sp-3">✦</span>
      </div>

      {/* Tiêu đề thanh thoát phía trên vòm cổng hoa (Không có badge Chặng 1/5 bị lặp) */}
      <header className="welcome-scene-header">
        <h2 className="welcome-scene-title">Một cánh cửa nhỏ</h2>
        <p className="welcome-scene-subtitle">{data.subtitle}</p>
      </header>

      {/* Tấm thẻ lời chào kính mờ trong trẻo đặt cân đối trước bậc thang hoa */}
      <div className="welcome-crystal-card">
        <h3 className="welcome-crystal-greeting">{data.greeting}</h3>
        <p className="welcome-crystal-text">{data.message}</p>
        <p className="welcome-crystal-invitation">{data.invitation}</p>
      </div>
    </div>
  );
};
