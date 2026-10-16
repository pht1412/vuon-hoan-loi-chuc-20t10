import React from 'react';
import { AppreciationItem } from '../../../types/journey';
import '../JourneyScenes.css';

interface AppreciationSceneProps {
  appreciations: AppreciationItem[];
}

export const AppreciationScene: React.FC<AppreciationSceneProps> = ({
  appreciations,
}) => {
  return (
    <div className="scene-container" id="scene-appreciation">
      <header className="scene-header">
        <h2 className="scene-title">Điều tớ trân trọng ở cậu</h2>
        <p className="scene-subtitle">
          Những điều đáng mến được gom nhặt từ những khoảnh khắc cậu chia sẻ công khai.
        </p>
      </header>

      {/* 4 Thẻ quan sát trân trọng */}
      <div className="apprec-grid" role="region" aria-label="Những điều trân trọng ở cậu">
        {appreciations.map((item) => (
          <article key={item.id} className="apprec-card">
            <span className="apprec-tag">{item.tag}</span>
            <h3 className="apprec-title">{item.title}</h3>
            <p className="apprec-desc">{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
};
