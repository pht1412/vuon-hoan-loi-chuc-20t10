import React from 'react';
import { PrivateJourneyData } from '../../../types/journey';
import { Sparkles } from 'lucide-react';
import '../JourneyScenes.css';

interface WelcomeSceneProps {
  data: PrivateJourneyData['welcome'];
}

export const WelcomeScene: React.FC<WelcomeSceneProps> = ({ data }) => {
  return (
    <div className="scene-container" id="scene-welcome">
      <header className="scene-header">
        <span className="scene-tag">
          <Sparkles size={13} aria-hidden="true" />
          <span>Chặng 1 / 5</span>
        </span>
        <h2 className="scene-title">Một cánh cửa nhỏ</h2>
        <p className="scene-subtitle">{data.subtitle}</p>
      </header>

      <div className="welcome-card">
        <div className="welcome-icon-glow" aria-hidden="true">
          <Sparkles size={30} />
        </div>
        <p className="welcome-paragraph" style={{ fontWeight: 600, fontSize: '1.15rem' }}>
          {data.greeting}
        </p>
        <p className="welcome-paragraph">{data.message}</p>
        <p className="welcome-invitation">{data.invitation}</p>
      </div>
    </div>
  );
};
