import React, { useState } from 'react';
import { JournalItem } from '../../../types/journey';
import { Sparkles, MessageCircle } from 'lucide-react';
import '../JourneyScenes.css';

interface JournalSceneProps {
  journal: JournalItem[];
  psNote: {
    title: string;
    content: string;
  };
}

export const JournalScene: React.FC<JournalSceneProps> = ({ journal, psNote }) => {
  const [showPS, setShowPS] = useState(false);

  return (
    <div className="scene-container" id="scene-journal">
      <header className="scene-header">
        <span className="scene-tag">
          <Sparkles size={13} aria-hidden="true" />
          <span>Chặng 3 / 5</span>
        </span>
        <h2 className="scene-title">Những điều ít khi được nói</h2>
        <p className="scene-subtitle">
          Một khoảng dừng tĩnh lặng như trang sổ tay để đọc và lắng lòng một chút.
        </p>
      </header>

      {/* 4 Thẻ trang sổ */}
      <div className="journal-list">
        {journal.map((item) => (
          <article key={item.id} className="journal-card">
            <span className="journal-card-num">Điều {item.order}</span>
            <h3 className="journal-card-title">{item.title}</h3>
            <p className="journal-card-content">{item.content}</p>
          </article>
        ))}
      </div>

      {/* Chi tiết ẩn tùy chọn: P.S. note */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <button
          type="button"
          className="ps-toggle-btn"
          id="btn-toggle-ps"
          onClick={() => setShowPS((prev) => !prev)}
          aria-expanded={showPS}
        >
          <MessageCircle size={13} />
          <span>{showPS ? 'Đóng ghi chú nhỏ' : 'Một ghi chú nhỏ (P.S.)'}</span>
        </button>

        {showPS && (
          <div className="ps-content-box" role="region" aria-live="polite">
            <p style={{ fontWeight: 600, color: 'var(--color-accent-primary)', marginBottom: '0.25rem' }}>
              {psNote.title}
            </p>
            <p>{psNote.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};
