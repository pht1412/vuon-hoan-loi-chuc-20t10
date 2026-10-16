import React from 'react';
import './GardenAmbience.css';

interface GardenAmbienceProps {
  isSeedFlaring?: boolean;
}

// 24 hạt rơi lung linh tone Hồng & Vàng với tần suất dày dặn và kích thước rõ nét hơn
const FALLING_ITEMS = [
  { id: 'f-1', type: 'pink-petal', left: '5%', delay: '0s', duration: '11.5s', scale: 1.05 },
  { id: 'f-2', type: 'gold-star', left: '12%', delay: '2.5s', duration: '13s', scale: 1.0 },
  { id: 'f-3', type: 'pink-heart', left: '19%', delay: '5.2s', duration: '12s', scale: 1.05 },
  { id: 'f-4', type: 'yellow-petal', left: '26%', delay: '1.2s', duration: '11s', scale: 1.0 },
  { id: 'f-5', type: 'pink-flower', left: '33%', delay: '7.8s', duration: '13.5s', scale: 1.1 },
  { id: 'f-6', type: 'gold-sparkle', left: '39%', delay: '3.8s', duration: '12.5s', scale: 1.0 },
  { id: 'f-7', type: 'pink-petal', left: '46%', delay: '6.4s', duration: '10.8s', scale: 1.15 },
  { id: 'f-8', type: 'gold-star', left: '53%', delay: '0.8s', duration: '12s', scale: 1.05 },
  { id: 'f-9', type: 'pink-heart', left: '60%', delay: '4.6s', duration: '11.8s', scale: 1.0 },
  { id: 'f-10', type: 'yellow-petal', left: '67%', delay: '8.5s', duration: '12.8s', scale: 1.1 },
  { id: 'f-11', type: 'pink-flower', left: '74%', delay: '2.0s', duration: '13s', scale: 1.0 },
  { id: 'f-12', type: 'gold-sparkle', left: '81%', delay: '5.9s', duration: '11.5s', scale: 1.05 },
  { id: 'f-13', type: 'pink-petal', left: '88%', delay: '1.5s', duration: '12.2s', scale: 1.0 },
  { id: 'f-14', type: 'gold-star', left: '94%', delay: '7.2s', duration: '13.8s', scale: 1.05 },
  // Lớp bổ sung tăng độ dày và đan xen
  { id: 'f-15', type: 'pink-heart', left: '9%', delay: '8.2s', duration: '12.5s', scale: 0.95 },
  { id: 'f-16', type: 'yellow-petal', left: '22%', delay: '9.4s', duration: '11.2s', scale: 1.05 },
  { id: 'f-17', type: 'gold-star', left: '36%', delay: '10.5s', duration: '12.8s', scale: 1.0 },
  { id: 'f-18', type: 'pink-petal', left: '49%', delay: '9.1s', duration: '13.2s', scale: 1.1 },
  { id: 'f-19', type: 'pink-flower', left: '57%', delay: '10.8s', duration: '11.8s', scale: 1.05 },
  { id: 'f-20', type: 'gold-sparkle', left: '71%', delay: '9.9s', duration: '12.6s', scale: 1.1 },
  { id: 'f-21', type: 'pink-petal', left: '84%', delay: '11.2s', duration: '11.4s', scale: 1.0 },
  { id: 'f-22', type: 'yellow-petal', left: '15%', delay: '11.8s', duration: '13.5s', scale: 1.0 },
  { id: 'f-23', type: 'gold-star', left: '64%', delay: '11.5s', duration: '12.4s', scale: 1.1 },
  { id: 'f-24', type: 'pink-heart', left: '91%', delay: '10.1s', duration: '12.1s', scale: 1.0 },
];

export const GardenAmbience: React.FC<GardenAmbienceProps> = ({ isSeedFlaring = false }) => {
  return (
    <div className="garden-ambience-layer" aria-hidden="true">
      {/* 1. Subtle stardust motes floating upwards from near the book spine */}
      <div className="stardust-container">
        <span className="stardust-mote mote-1" />
        <span className="stardust-mote mote-2" />
        <span className="stardust-mote mote-3" />
        <span className="stardust-mote mote-4" />
        <span className="stardust-mote mote-5" />
        <span className="stardust-mote mote-6" />
        <span className="stardust-mote mote-7" />
      </div>

      {/* 2. Cơn mưa dịu dàng & lung linh các cánh hoa hồng, hoa vàng, ngôi sao và trái tim nhỏ */}
      <div className="falling-items-container">
        {FALLING_ITEMS.map((item) => (
          <div
            key={item.id}
            className={`falling-item-wrap ${item.type}`}
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
              transform: `scale(${item.scale})`,
            }}
          >
            {/* Cánh hoa đào hồng phấn (Kích thước lớn và sắc nét hơn) */}
            {item.type === 'pink-petal' && (
              <svg viewBox="0 0 24 24" className="falling-svg" width="26" height="26">
                <defs>
                  <linearGradient id="pinkPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF2F5" />
                    <stop offset="45%" stopColor="#F9ABC0" />
                    <stop offset="100%" stopColor="#E67590" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2 C7.5 2, 3.5 6.5, 3.5 12 C3.5 17.5, 8 21.5, 12 22 C16 21.5, 20.5 17.5, 20.5 12 C20.5 6.5, 16.5 2, 12 2 Z"
                  fill="url(#pinkPetalGrad)"
                  filter="drop-shadow(0 3px 6px rgba(230, 117, 144, 0.4))"
                />
                <path d="M12 4 Q12 12 12 20" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="0.9" />
              </svg>
            )}

            {/* Cánh hoa vàng ấm (Tươi tắn, rạng rỡ) */}
            {item.type === 'yellow-petal' && (
              <svg viewBox="0 0 24 24" className="falling-svg" width="25" height="25">
                <defs>
                  <linearGradient id="yellowPetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFEEB" />
                    <stop offset="40%" stopColor="#FEDD75" />
                    <stop offset="100%" stopColor="#F5B228" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2 C7 3, 3.5 8, 3.5 13 C3.5 18, 8 21.5, 12 22 C16 21.5, 20.5 18, 20.5 13 C20.5 8, 17 3, 12 2 Z"
                  fill="url(#yellowPetalGrad)"
                  filter="drop-shadow(0 3px 6px rgba(245, 178, 40, 0.4))"
                />
                <path d="M12 4 Q12 12 12 20" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.9" />
              </svg>
            )}

            {/* Ngôi sao vàng óng ả (Lấp lánh ánh kim) */}
            {item.type === 'gold-star' && (
              <svg viewBox="0 0 24 24" className="falling-svg" width="24" height="24">
                <defs>
                  <linearGradient id="goldStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="35%" stopColor="#FFE072" />
                    <stop offset="100%" stopColor="#F5A018" />
                  </linearGradient>
                </defs>
                <polygon
                  points="12,2 15.2,8.8 22.5,9.5 17,14.5 18.8,21.8 12,18 5.2,21.8 7,14.5 1.5,9.5 8.8,8.8"
                  fill="url(#goldStarGrad)"
                  filter="drop-shadow(0 0 6px rgba(255, 215, 80, 0.75))"
                />
              </svg>
            )}

            {/* Trái tim hồng pastel ngọt ngào */}
            {item.type === 'pink-heart' && (
              <svg viewBox="0 0 24 24" className="falling-svg" width="22" height="22">
                <defs>
                  <linearGradient id="pinkHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFF0F4" />
                    <stop offset="50%" stopColor="#F89DB2" />
                    <stop offset="100%" stopColor="#DE5C77" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="url(#pinkHeartGrad)"
                  filter="drop-shadow(0 2px 5px rgba(222, 92, 119, 0.4))"
                />
              </svg>
            )}

            {/* Đóa hoa mini 5 cánh hồng nhụy vàng */}
            {item.type === 'pink-flower' && (
              <svg viewBox="0 0 24 24" className="falling-svg" width="23" height="23">
                <defs>
                  <linearGradient id="miniFlowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFE8ED" />
                    <stop offset="60%" stopColor="#F9ADC0" />
                    <stop offset="100%" stopColor="#EA7C94" />
                  </linearGradient>
                </defs>
                <circle cx="12" cy="7" r="4.2" fill="url(#miniFlowerGrad)" />
                <circle cx="16.5" cy="10.5" r="4.2" fill="url(#miniFlowerGrad)" />
                <circle cx="15" cy="16" r="4.2" fill="url(#miniFlowerGrad)" />
                <circle cx="9" cy="16" r="4.2" fill="url(#miniFlowerGrad)" />
                <circle cx="7.5" cy="10.5" r="4.2" fill="url(#miniFlowerGrad)" />
                {/* Nhụy hoa vàng */}
                <circle cx="12" cy="12" r="3.2" fill="#FFD54F" filter="drop-shadow(0 0 2px rgba(255, 213, 79, 0.8))" />
              </svg>
            )}

            {/* Đốm sáng kim cương lấp lánh */}
            {item.type === 'gold-sparkle' && (
              <svg viewBox="0 0 24 24" className="falling-svg" width="21" height="21">
                <defs>
                  <linearGradient id="goldSparkleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor="#FFE082" />
                    <stop offset="100%" stopColor="#FFB300" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2 Q12 12 2 12 Q12 12 12 22 Q12 12 22 12 Q12 12 12 2 Z"
                  fill="url(#goldSparkleGrad)"
                  filter="drop-shadow(0 0 6px rgba(255, 224, 130, 0.85))"
                />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* 3. Subtle warm pulse expanding outward when a wish is planted */}
      {isSeedFlaring && <div className="seed-flare-ring" />}
    </div>
  );
};
