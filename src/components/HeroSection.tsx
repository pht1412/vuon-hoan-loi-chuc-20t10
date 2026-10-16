import React from 'react';
import { Sparkles } from 'lucide-react';
import './HeroSection.css';

export const HeroSection: React.FC = () => {
  return (
    <header className="hero-section" id="hero-section">
      <div className="hero-badge" aria-hidden="true">
        <Sparkles className="hero-badge-icon" />
        <span>Gửi trao yêu thương</span>
      </div>
      <h1 className="hero-title" id="page-main-heading">
        Vườn lời chúc
      </h1>
      <p className="hero-subtitle">Một chút yêu thương cho ngày 20/10</p>
      <p className="hero-description">
        Có những điều nhỏ bé cũng đủ làm một ngày trở nên dịu dàng hơn.
      </p>
    </header>
  );
};
