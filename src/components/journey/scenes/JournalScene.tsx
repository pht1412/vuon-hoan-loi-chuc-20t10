import React, { useState } from 'react';
import { JournalItem, Stage3Ending } from '../../../types/journey';
import { Paperclip, Sparkles, Heart } from 'lucide-react';
import '../JourneyScenes.css';

interface JournalSceneProps {
  journal: JournalItem[];
  psNote: {
    title: string;
    content: string;
  };
  stage3Ending?: Stage3Ending;
}

export const JournalScene: React.FC<JournalSceneProps> = ({
  journal,
  psNote,
  stage3Ending,
}) => {
  const [showPS, setShowPS] = useState(false);

  return (
    <div className="scene-container" id="scene-journal">
      <header className="scene-header">
        <span className="scene-tag">
          <Sparkles size={12} />
          <span>Điểm dừng thứ 3</span>
        </span>
        <h2 className="scene-title">Những điều nhỏ tớ vẫn nhớ</h2>
        <p className="scene-subtitle">
          Hai điểm dừng nhỏ trong hành trình — những khoảnh khắc bình dị tớ vẫn luôn trân trọng.
        </p>
      </header>

      {/* 2 Mảnh ghép kỷ niệm */}
      <div className="journal-list">
        {journal.map((item) => {
          const formattedOrder = String(item.order).padStart(2, '0');
          const isIcon = item.image?.includes('coimay');
          return (
            <article key={item.id} className="journal-card memory-fragment-card">
              <div className="journal-card-topbar">
                <span className="journal-badge">
                  {item.badge || `Mảnh ghép ${formattedOrder}`}
                </span>
                <span className="journal-card-num">{formattedOrder}</span>
              </div>

              {item.image && (
                <div
                  className={`journal-photo-wrapper ${
                    isIcon ? 'is-token' : 'is-wide'
                  }`}
                >
                  <div className="journal-photo-inner">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="journal-photo-img"
                      loading="lazy"
                    />
                  </div>
                  {isIcon && (
                    <span className="journal-photo-caption">
                      Map Cõi Mây · ZingSpeed
                    </span>
                  )}
                </div>
              )}

              <h3 className="journal-card-title">{item.title}</h3>

              <div className="journal-card-content">
                {item.content.split('\n\n').map((para, idx) => (
                  <p key={idx} className="journal-para">
                    {para}
                  </p>
                ))}
              </div>
            </article>
          );
        })}
      </div>

      {/* Đoạn kết của chặng 3 */}
      {stage3Ending && (
        <section
          className="stage3-closing-card"
          aria-label="Đoạn kết của chặng 3"
        >
          <div className="stage3-closing-icon" aria-hidden="true">
            <Heart size={16} />
          </div>
          <div className="stage3-closing-body">
            {stage3Ending.paragraphs.map((p, idx) => (
              <p key={idx} className="stage3-closing-para">
                {p}
              </p>
            ))}
          </div>
        </section>
      )}

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
            <h4 className="ps-note-title">{psNote.title}</h4>
            <p>{psNote.content}</p>
          </div>
        )}
      </div>
    </div>
  );
};

