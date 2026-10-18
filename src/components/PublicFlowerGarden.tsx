import React, { useEffect, useRef, useState } from 'react';
import { X, Flower2, ArrowLeft } from 'lucide-react';
import { publicGardenFlowers, PublicGardenFlower } from '../data/publicFlowerGarden';
import './PublicFlowerGarden.css';

interface PublicFlowerGardenProps {
  isOpen: boolean;
  onClose: () => void;
  triggerElement: HTMLElement | null;
}

function PublicFlowerIcon({ size = 26 }: { size?: number }) {
  return <Flower2 size={size} aria-hidden="true" />;
}

export const PublicFlowerGarden: React.FC<PublicFlowerGardenProps> = ({
  isOpen,
  onClose,
  triggerElement,
}) => {
  const [selectedFlower, setSelectedFlower] = useState<PublicGardenFlower | null>(null);
  const [openingFlower, setOpeningFlower] = useState<PublicGardenFlower | null>(null);
  const selectedFlowerRef = useRef<PublicGardenFlower | null>(null);
  const openingFlowerRef = useRef(false);
  const openingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const returnFocusFlowerIdRef = useRef<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const letterCloseRef = useRef<HTMLButtonElement | null>(null);

  selectedFlowerRef.current = selectedFlower;

  const cancelOpening = () => {
    if (openingTimerRef.current) {
      clearTimeout(openingTimerRef.current);
      openingTimerRef.current = null;
    }
    openingFlowerRef.current = false;
    setOpeningFlower(null);
  };

  const handleSelectFlower = (flower: PublicGardenFlower) => {
    if (openingFlowerRef.current || selectedFlowerRef.current) return;

    openingFlowerRef.current = true;
    setOpeningFlower(flower);
    openingTimerRef.current = setTimeout(() => {
      openingTimerRef.current = null;
      openingFlowerRef.current = false;
      selectedFlowerRef.current = flower;
      setOpeningFlower(null);
      setSelectedFlower(flower);
    }, 360);
  };

  const closeLetter = () => {
    if (selectedFlowerRef.current) {
      returnFocusFlowerIdRef.current = `public-flower-${selectedFlowerRef.current.id}`;
    }
    selectedFlowerRef.current = null;
    setSelectedFlower(null);
  };

  const closeExperience = () => {
    cancelOpening();
    selectedFlowerRef.current = null;
    setSelectedFlower(null);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      cancelOpening();
      selectedFlowerRef.current = null;
      setSelectedFlower(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('body-locked');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (selectedFlowerRef.current) {
          closeLetter();
        } else if (openingFlowerRef.current) {
          cancelOpening();
        } else {
          onClose();
        }
        return;
      }

      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.classList.remove('body-locked');
      window.removeEventListener('keydown', handleKeyDown);
      if (triggerElement) {
        setTimeout(() => {
          triggerElement.focus();
        }, 10);
      }
    };
  }, [isOpen, onClose, triggerElement]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      if (selectedFlower) {
        letterCloseRef.current?.focus();
      } else if (returnFocusFlowerIdRef.current) {
        document.getElementById(returnFocusFlowerIdRef.current)?.focus();
        returnFocusFlowerIdRef.current = null;
      } else {
        closeButtonRef.current?.focus();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen, selectedFlower]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="public-garden-overlay"
      id="public-flower-garden-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (selectedFlower) {
            closeLetter();
          } else {
            closeExperience();
          }
        }
      }}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="public-garden-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="public-garden-title"
        aria-describedby={selectedFlower ? 'public-garden-letter-body' : 'public-garden-intro'}
      >
        <header className="public-garden-header">
          <div className="public-garden-header-text">
            <span className="public-garden-tag">
              <Flower2 size={12} aria-hidden="true" />
              <span>Khu vườn dành cho bạn</span>
            </span>
            <h2 className="public-garden-title" id="public-garden-title">
              {selectedFlower ? selectedFlower.name : 'Chọn một đóa hoa'}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="modal-close-btn"
            id="public-garden-close-experience"
            onClick={closeExperience}
            aria-label="Đóng trải nghiệm và trở về Public Garden"
          >
            <X size={18} />
          </button>
        </header>

        <div className="public-garden-body">
          {!selectedFlower && (
            <>
              <p className="public-garden-intro" id="public-garden-intro">
                Chọn bất kỳ đóa hoa nào, theo thứ tự bạn muốn. Mỗi đóa mở một lá thư nhỏ.
              </p>
              <ul className="public-garden-flower-list" aria-label="Sáu đóa hoa có thể chọn">
                {publicGardenFlowers.map((flower) => (
                  <li key={flower.id}>
                    <button
                      type="button"
                      className={`public-garden-flower-btn ${
                        openingFlower?.id === flower.id ? 'is-opening' : ''
                      }`}
                      id={`public-flower-${flower.id}`}
                      onClick={() => handleSelectFlower(flower)}
                      aria-label={`Chọn hoa ${flower.name}: ${flower.meaning}`}
                      aria-disabled={Boolean(openingFlower)}
                      style={{ '--flower-accent': flower.accent } as React.CSSProperties}
                    >
                      <span className="public-garden-flower-art" aria-hidden="true">
                        <span className="public-garden-flower-icon">
                          <PublicFlowerIcon />
                        </span>
                      </span>
                      <span className="public-garden-flower-copy">
                        <span className="public-garden-flower-name">{flower.name}</span>
                        <span className="public-garden-flower-meaning">{flower.meaning}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {selectedFlower && (
            <article
              className="public-garden-letter"
              aria-live="polite"
              style={{ '--flower-accent': selectedFlower.accent } as React.CSSProperties}
            >
              <p className="public-garden-letter-meaning">{selectedFlower.meaning}</p>
              <div className="public-garden-letter-body" id="public-garden-letter-body">
                {selectedFlower.letter}
              </div>
            </article>
          )}
        </div>

        <footer className="public-garden-footer">
          {selectedFlower ? (
            <button
              ref={letterCloseRef}
              type="button"
              className="modal-action-close"
              id="public-garden-close-letter"
              onClick={closeLetter}
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Đóng thư
            </button>
          ) : (
            <span className="public-garden-footer-hint">Sáu đóa hoa · mở theo cách của bạn</span>
          )}
          <button
            type="button"
            className="public-garden-exit-btn"
            id="public-garden-back-to-garden"
            onClick={closeExperience}
          >
            Về Public Garden
          </button>
        </footer>
      </div>
    </div>
  );
};
