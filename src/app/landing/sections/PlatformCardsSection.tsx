import React, { useState, useEffect, useRef } from 'react';

interface PlatformCard {
  id: string;
  title: string;
  caption: string;
  description?: string;
  imageUrl: string;
  videoUrl: string;
  hoverVideoUrl: string;
  ctaUrl?: string;
  libraryUrl?: string;
  ribbon?: string;
}

interface PlatformCardsSectionProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  cards?: PlatformCard[];
}

export function PlatformCardsSection({
  sectionTitle = '',
  sectionSubtitle = '',
  cards = [
    {
      id: '1',
      title: 'Módulo Kapital',
      caption: 'Sistema de Gestión',
      description: 'Administra tus recursos de manera eficiente',
      imageUrl: 'https://via.placeholder.com/300x200/4F46E5/ffffff?text=Kapital',
      videoUrl: '/video/Modulo%20Kapital%20-%20Kapitals.mp4',
      hoverVideoUrl: '/video/Modulo%20Kapital%20-%20Kapitals.mp4',
      ctaUrl: 'https://example.com/curso1',
      libraryUrl: 'https://example.com/biblioteca1',
      ribbon: 'Nuevo'
    },
    {
      id: '2',
      title: 'Módulo Valora',
      caption: 'Analytics Avanzado',
      description: 'Visualiza datos en tiempo real',
      imageUrl: 'https://via.placeholder.com/300x200/7C3AED/ffffff?text=Valora',
      videoUrl: '/video/Modulo%20Valora%20-%20Valora.mp4',
      hoverVideoUrl: '/video/Modulo%20Valora%20-%20Valora.mp4',
      ctaUrl: 'https://example.com/curso2',
      libraryUrl: 'https://example.com/biblioteca2'
    }
  ]
}: PlatformCardsSectionProps) {
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(cards[0]?.videoUrl || '');
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>(cards[0]?.title || '');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(cards[0]?.id || null);
  const videoRef = useRef<HTMLVideoElement>(null);
  console.log("activeVideo",activeVideoUrl)
  console.log("activeVideoTitle",activeVideoTitle)


  const handleCardClick = (videoUrl: string, title: string, cardId: string) => {
    setActiveVideoUrl(videoUrl);
    setActiveVideoTitle(title);
    setHoveredCardId(cardId);
    // Reproducir el video automáticamente
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  };

  const handleCardHover = (videoUrl: string, title: string, cardId: string) => {
    setActiveVideoUrl(videoUrl);
    setActiveVideoTitle(title);
    setHoveredCardId(cardId);
    // Reproducir el video automáticamente
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  };

  return (
    <>
      <section className="platform-section">
        <div className="container-fluid px-3 px-md-4 px-lg-5">
          
          {/* Títulos opcionales */}
          {(sectionTitle || sectionSubtitle) && (
            <div className="text-center mb-5">
              {sectionTitle && <h2 className="fw-bold">{sectionTitle}</h2>}
              {sectionSubtitle && <p className="text-muted">{sectionSubtitle}</p>}
            </div>
          )}

          {/* Contenedor principal con flex */}
          <div className="platform-content">
            
            {/* Video Container */}
            
            <div className="video-container">
              <div className="video-wrapper">
                <div className="video-responsive">
                  <video
                    ref={videoRef}
                    src={activeVideoUrl}
                    className="rounded-4 shadow-lg w-100"
                    controls
                    style={{ width: '100%', aspectRatio: '16 / 9', background: '#000' }}
                    muted
                    loop
                  >
                  
                  </video>
                  <div className="video-title-overlay">
                    <span className="badge bg-dark bg-opacity-75 px-3 py-2">
                      {activeVideoTitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Container */}
            <div className="cards-container">
              <div className="cards-wrapper">
                {cards.map((card) => (
                  <PlatformCard
                    key={card.id}
                    card={card}
                    onActivate={handleCardClick}
                    onHover={handleCardHover}
                    isActive={hoveredCardId === card.id}
                  />
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      <style>{`
        /* ===================================
           ESTRUCTURA BASE
           =================================== */
        
        .platform-section {
          padding: 3rem;
          display: flex;
          align-items: center;
        }

        /* Contenedor principal - Mobile First */
        .platform-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
        }

        /* ===================================
           VIDEO
           =================================== */
        
        .video-container {
          width: 100%;
          display: flex;
          justify-content: center;
          order: 1;
        }

        .video-wrapper {
          width: 100%;
          max-width: 100%;
        }

        .video-responsive {
          position: relative;
          width: 100%;
          border-radius: 1rem;
          overflow: hidden;
        }

        .video-responsive video {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        .video-title-overlay {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          z-index: 10;
        }

        /* ===================================
           CARDS - MOBILE SWIPE
           =================================== */
        
        .cards-container {
          width: 100%;
          order: 2;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none; /* Firefox - Ocultar scrollbar */
          -ms-overflow-style: none; /* IE y Edge - Ocultar scrollbar */
        }

        /* Ocultar scrollbar en Chrome, Safari y Opera */
        .cards-container::-webkit-scrollbar {
          display: none;
        }

        .cards-wrapper {
          display: flex;
          flex-direction: row;
          gap: 1rem;
          padding: 0.5rem 0;
          justify-content: flex-start;
          /* Permitir scroll horizontal suave */
          scroll-snap-type: x mandatory;
        }

        /* ===================================
           CARD COMPONENT
           =================================== */
        
        .video-card {
          flex: 0 0 auto;
          width: 260px;
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 2px solid transparent;
          scroll-snap-align: start; /* Snap en mobile */
        }

        /* Estado activo en mobile al hacer click */
        @media (max-width: 991.98px) {
          .video-card.active {
            border: 2px solid #0d6efd;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
            transform: scale(1.02);
          }
        }

        /* Efecto hover SOLO para desktop */
        @media (min-width: 992px) {
          .video-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          }

          /* Border persistente cuando está activo */
          .video-card.active {
            border: 2px solid #0d6efd;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
          }

          /* Efecto hover adicional cuando ya está activo */
          .video-card.active:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.15), 0 0 0 3px rgba(13, 110, 253, 0.15);
          }
        }

        .card-image-wrapper {
          position: relative;
          width: 100%;
          padding: 1rem 1rem 0;
        }

        .card-img-container {
          width: 100%;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .card-img-container img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .ribbon-badge {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .card-content {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-caption {
          font-size: 0.75rem;
          color: #6b7280;
          background: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          display: inline-block;
          margin-bottom: 0.5rem;
        }

        .card-description {
          font-size: 0.875rem;
          color: #1a1a1a;
          margin-bottom: 0;
          list-style: none;
          padding-left: 1rem;
        }

        .card-description li::before {
          content: "•";
          color: #4F46E5;
          font-weight: bold;
          display: inline-block;
          width: 1rem;
          margin-left: -1rem;
        }

        .card-actions {
          padding: 0 1rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .card-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.625rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          border: none;
          background: #e4f8ff;
          color: #009ef7;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .card-btn:hover {
          background: #009ef7;
          color: #ffffff;
        }

        /* Indicador de swipe en mobile */
        @media (max-width: 991.98px) {
          .cards-container::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 40px;
            background: linear-gradient(to right, transparent, rgba(248, 249, 250, 0.8));
            pointer-events: none;
          }
        }

        /* ===================================
           TABLET
           ≥ 768px
           =================================== */
        
        @media (min-width: 768px) {
          .video-wrapper {
            max-width: 90%;
          }

          .cards-wrapper {
            justify-content: center;
          }

          .video-card {
            width: 280px;
          }
        }

        /* ===================================
           DESKTOP
           ≥ 992px
           =================================== */
        
        @media (min-width: 992px) {
          .platform-content {
            flex-direction: row;
            align-items: center;
            gap: 3rem;
          }

          .video-container {
            flex: 1;
            order: 2;
            justify-content: flex-start;
            
          }

          .video-wrapper {
            max-width: 100%;
            position: sticky;
            top: 2rem;
          }

          .cards-container {
            flex: 1;
            order: 1;
            overflow-x: hidden;
            max-height: 80vh;
            padding-right: 0.5rem;
            /* Mostrar scrollbar en desktop */
            scrollbar-width: thin;
            scrollbar-color: rgba(0,0,0,0.2) transparent;
          }

          .cards-container::-webkit-scrollbar {
            display: block;
            width: 6px;
          }

          .cards-container::-webkit-scrollbar-track {
            background: transparent;
          }

          .cards-container::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 3px;
          }

          .cards-wrapper {
            flex-direction: row;
            justify-content: center;
            gap: 1.5rem;
            height: 300px;
            scroll-snap-type: none;
          }

          .video-card {
            width: 100%;
            max-width: 200px;
            margin: 0 auto;
            scroll-snap-align: none;
          }

          .cards-container::after {
            display: none;
          }
        }

        /* ===================================
           DESKTOP GRANDE
           ≥ 1200px
           =================================== */
        
        @media (min-width: 1200px) {
          .platform-content {
            gap: 0rem;
          }

          .video-card {
            max-width: 250px;
          }

          .card-caption {
            font-size: 0.8rem;
          }
          
          .cards-wrapper {
            flex-direction: row;
            justify-content: center;
            gap: 1.5rem;
            height: 420px;
          }
        }
      `}</style>
    </>
  );
}

// Card Component
interface PlatformCardProps {
  card: PlatformCard;
  onActivate: (videoUrl: string, title: string, cardId: string) => void;
  onHover: (videoUrl: string, title: string, cardId: string) => void;
  isActive: boolean;
}

function PlatformCard({ card, onActivate, onHover, isActive }: PlatformCardProps) {
  const handleClick = () => {
    // En mobile, siempre usar click
    onActivate(card.videoUrl, card.title, card.id);
  };

  const handleMouseEnter = () => {
    // Solo activar hover en desktop
    if (window.innerWidth >= 992) {
      onHover(card.hoverVideoUrl, card.title, card.id);
    }
  };

  return (
    <div
      className={`video-card ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Imagen */}
      <div className="card-image-wrapper">
        <div className="card-img-container">
          {card.ctaUrl ? (
            <a href={card.ctaUrl} target="_blank" rel="noopener noreferrer">
              <img
                src={card.imageUrl}
                alt={card.title}
              />
            </a>
          ) : (
            <img
              src={card.imageUrl}
              alt={card.title}
            />
          )}
        </div>

        {/* Ribbon */}
        {card.ribbon && (
          <div className="ribbon-badge">
            {card.ribbon}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="card-content">
        <span className="card-caption">{card.caption}</span>
        {card.description && (
          <ul className="card-description">
            <li>{card.description}</li>
          </ul>
        )}
      </div>

      {/* Acciones */}
      <div className="card-actions">
        {card.ctaUrl ? (
          <>
            <a
              href={card.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-btn"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Curso de Capacitación</span>
              <i className="bi bi-chevron-right"></i>
            </a>

            {card.libraryUrl && (
              <a
                href={card.libraryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card-btn"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Biblioteca</span>
                <i className="bi bi-book"></i>
              </a>
            )}
          </>
        ) : (
          <>
            <button className="card-btn btn">
              <span>Curso de Capacitación</span>
              <i className="bi bi-chevron-right"></i>
            </button>
            <button className="card-btn btn">
              <span>Biblioteca</span>
              <i className="bi bi-book"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
}