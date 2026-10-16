import React, { useState } from 'react';
import { JournalItem } from '../../../types/journey';
import { Paperclip } from 'lucide-react';
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
        <h2 className="scene-title">Những điều ít khi được nói</h2>
        <p className="scene-subtitle">
          Một khoảng dừng tĩnh lặng như trang sổ tay để đọc và lắng lòng một chút.
        </p>
      </header>

      {/* 4 Thẻ trang sổ giấy màu nước */}
      <div className="journal-list">
        {journal.map((item) => {
          const formattedOrder = String(item.order).padStart(2, '0');
          return (
            <article key={item.id} className="journal-card">
              <span className="journal-card-num">{formattedOrder}</span>
              <h3 className="journal-card-title">{item.title}</h3>
              <p className="journal-card-content">{item.content}</p>
            </article>
          );
        })}
      </div>

      {/* Chi tiết ẩn: Note gài kẹp giấy màu Vàng mơ #F7D8B5 */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <button
          type="button"
          className="ps-toggle-btn"
          id="btn-toggle-ps"
          onClick={() => setShowPS((prev) => !prev)}
          aria-expanded={showPS}
        >
          <Paperclip size={14} className="ps-paperclip-icon" />
          <span>{showPS ? 'Gấp lại ghi chú nhỏ' : 'Một ghi chú nhỏ (P.S.)'}</span>
        </button>

        {showPS && (
          <div className="ps-content-box" role="region" aria-live="polite">
            <h4 className="ps-note-title">
              {psNote.title}
            </h4>
            <p>{psNote.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};
