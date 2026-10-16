import React, { useState } from 'react';
import { FlowerItem } from '../../../types/journey';
import { Sparkles, Clover, Heart, Sun, Shield, Compass } from 'lucide-react';
import '../JourneyScenes.css';

interface FlowerGardenSceneProps {
  flowers: FlowerItem[];
  easterEgg: FlowerItem;
}

const FLOWER_ART_MAP: Record<string, string> = {
  'flower-1': '/hoa1.jpg',
  'flower-2': '/hoa2.jpg',
  'flower-3': '/hoa3.jpg',
  'flower-4': '/hoa4.jpg',
};

export const FlowerGardenScene: React.FC<FlowerGardenSceneProps> = ({
  flowers,
  easterEgg,
}) => {
  const [activeFlower, setActiveFlower] = useState<FlowerItem | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  const renderFallbackIcon = (iconName: FlowerItem['iconName'], size = 20) => {
    switch (iconName) {
      case 'lotus':
        return <Heart size={size} />;
      case 'sunflower':
        return <Sun size={size} />;
      case 'rose':
        return <Shield size={size} />;
      case 'tulip':
        return <Compass size={size} />;
      case 'clover':
        return <Clover size={size} />;
      default:
        return <Sparkles size={size} />;
    }
  };

  return (
    <div className="scene-container" id="scene-flower-garden">
      <header className="scene-header">
        <span className="scene-tag">
          <Sparkles size={13} aria-hidden="true" />
          <span>Chặng 2 / 5</span>
        </span>
        <h2 className="scene-title">Bốn đóa hoa riêng tặng cậu</h2>
        <p className="scene-subtitle">
          Chạm vào từng bức tranh để ngắm nhìn và lắng nghe những lời nhắn nhỏ được gửi gắm riêng cho cậu nhé.
        </p>
      </header>

      {/* Grid 4 tác phẩm hoa nghệ thuật */}
      <div className="flowers-grid" role="region" aria-label="Bốn tác phẩm hoa nghệ thuật">
        {flowers.map((fl) => {
          const isSelected = activeFlower?.id === fl.id;
          const artSrc = FLOWER_ART_MAP[fl.id];

          return (
            <button
              key={fl.id}
              type="button"
              id={`flower-item-${fl.id}`}
              className={`flower-card-art ${isSelected ? 'active' : ''}`}
              onClick={() => setActiveFlower(isSelected ? null : fl)}
              aria-expanded={isSelected}
              aria-label={`Bông hoa ${fl.title}: ${fl.subtitle}`}
              style={{ '--flower-theme-color': fl.color } as React.CSSProperties}
            >
              <div className="flower-art-preview">
                {artSrc ? (
                  <img
                    src={artSrc}
                    alt={`Tranh hoa ${fl.title}`}
                    className="flower-art-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="flower-icon-fallback" style={{ color: fl.color }}>
                    {renderFallbackIcon(fl.iconName, 26)}
                  </div>
                )}
                <div
                  className="flower-art-ambient-glow"
                  style={{ background: `radial-gradient(circle, ${fl.color}40 0%, transparent 70%)` }}
                  aria-hidden="true"
                />
              </div>

              <div className="flower-card-info">
                <span className="flower-name">{fl.title}</span>
                <span className="flower-sub">{fl.subtitle}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Thẻ chiêm ngưỡng nghệ thuật & thông điệp khi chọn hoa */}
      {activeFlower && (
        <div
          className="flower-art-reveal-card"
          role="region"
          aria-live="polite"
          style={{ '--reveal-accent': activeFlower.color } as React.CSSProperties}
        >
          <div className="flower-reveal-art-showcase">
            {FLOWER_ART_MAP[activeFlower.id] ? (
              <img
                src={FLOWER_ART_MAP[activeFlower.id]}
                alt={`Tranh chi tiết hoa ${activeFlower.title}`}
                className="flower-reveal-full-img"
              />
            ) : null}
            <div
              className="flower-reveal-halo"
              style={{ background: `radial-gradient(circle, ${activeFlower.color}45 0%, transparent 75%)` }}
              aria-hidden="true"
            />
          </div>

          <div className="flower-reveal-content-side">
            <div className="flower-reveal-header">
              <span className="flower-reveal-badge" style={{ backgroundColor: `${activeFlower.color}20`, color: activeFlower.color }}>
                Đóa hoa {activeFlower.title}
              </span>
              <span className="flower-reveal-subtitle">{activeFlower.subtitle}</span>
            </div>

            <p className="flower-reveal-body">
              {activeFlower.message}
            </p>

            <div className="flower-reveal-footer">
              <span className="flower-reveal-sparkle">✦</span>
              <span>Gửi tặng cậu một ngày thật dịu êm</span>
            </div>
          </div>
        </div>
      )}

      {/* Chi tiết ẩn dễ thương (Easter Egg) */}
      <div style={{ marginTop: '0.6rem', textAlign: 'center' }}>
        <button
          type="button"
          className="easter-egg-leaf-btn"
          id="btn-easter-egg-flower"
          onClick={() => setShowSecret((prev) => !prev)}
          aria-label="Một nụ hoa nhỏ ở góc vườn"
        >
          <Clover size={13} aria-hidden="true" />
          <span>Một nụ mầm nhỏ nép bên góc vườn</span>
        </button>

        {showSecret && (
          <div
            className="flower-message-reveal easter-egg-reveal"
            style={{ borderLeftColor: easterEgg.color, marginTop: '0.85rem' }}
            role="status"
            aria-live="polite"
          >
            <div className="flower-reveal-title">
              <span style={{ color: easterEgg.color }}>
                <Clover size={18} />
              </span>
              <span>{easterEgg.title}</span>
            </div>
            <p className="flower-reveal-body">{easterEgg.message}</p>
          </div>
        )}
      </div>
    </div>
  );
};

