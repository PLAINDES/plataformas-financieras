// src/app/landing/sections/PlatformCardsSection.tsx

import React, { useState, useEffect, useRef } from 'react';
import { EditableCollection, AdminControls } from '../../../components/editable/EditableCollection';
import { useAuthContext } from '../../../hooks/useAuthContext';
import type { EditableContent, EditableCollectionData, CollectionItem } from '../../../types/editable.types';

// Tipo para el card editable
interface PlatformCardItem extends CollectionItem {
  name: string;
  title?: string; // Para compatibilidad interna
  caption: string;
  description?: string;
  imageUrl: string;
  videoUrl: string;
  hoverVideoUrl?: string;
  ctaUrl?: string;
  libraryUrl?: string;
}

interface PlatformCardsSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    items?: Array<{
      id: string;
      name: string;
      caption: string;
      description?: string;
      imageUrl: string;
      videoUrl: string;
      hoverVideoUrl?: string;
      ctaUrl?: string;
      libraryUrl?: string;
    }>;
  };
  onSave?: (content: EditableContent) => Promise<void>;
  onSaveCollection?: (data: EditableCollectionData<PlatformCardItem>) => Promise<void>;
}

export function PlatformCardsSection({
  content = {},
  onSave,
  onSaveCollection,
}: PlatformCardsSectionProps) {
  const { isAdmin } = useAuthContext();
  
  // Convertir content.items a formato editable
  const [cardsData, setCardsData] = useState<EditableCollectionData<PlatformCardItem>>({
    id: 'platform-cards',
    section: 'platforms',
    items: (content.items || []).map((card, index) => ({
      ...card,
      title: card.name, // Mapear name → title para compatibilidad interna
      order: index,
      hoverVideoUrl: card.hoverVideoUrl || card.videoUrl,
    })),
  });

  const isFirstLoad = useRef(true);
  

  // Actualizar cuando cambie el content
  useEffect(() => {
    if (content.items) {
      setCardsData({
        id: 'platform-cards',
        section: 'platforms',
        items: content.items.map((card, index) => ({
          ...card,
          title: card.name,
          order: index,
          hoverVideoUrl: card.hoverVideoUrl || card.videoUrl,
        })),
      });
    }
  }, [content]);

  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(cardsData.items[0]?.videoUrl || '');
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>(cardsData.items[0]?.name || '');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(cardsData.items[0]?.id || null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Actualizar video activo cuando cambien los items
  useEffect(() => {
    if (cardsData.items.length > 0 && !activeVideoUrl) {
      const firstCard = cardsData.items[0];
      setActiveVideoUrl(firstCard.videoUrl);
      setActiveVideoTitle(firstCard.name);
      setHoveredCardId(firstCard.id);
    }
  }, [cardsData.items]);

  const handleCardClick = (card: PlatformCardItem, index: number) => {
    setActiveVideoUrl(card.videoUrl);
    setActiveVideoTitle(card.name);
    setHoveredCardId(card.id);
    
    scrollToCard(index);
    
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play();
    }
  };

  const handleCardHover = (card: PlatformCardItem) => {
    if (window.innerWidth >= 992) {
      const videoUrl = card.hoverVideoUrl || card.videoUrl;
      setActiveVideoUrl(videoUrl);
      setActiveVideoTitle(card.name);
      setHoveredCardId(card.id);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play();
      }
    }
  };

  const scrollToCard = (index: number) => {
    if (!cardsContainerRef.current) return;
    
    const container = cardsContainerRef.current;
    const cardElements = container.querySelectorAll('.video-card-wrapper');
    
    if (cardElements[index]) {
      const card = cardElements[index] as HTMLElement;
      
      const containerWidth = container.offsetWidth;
      const cardWidth = card.offsetWidth;
      const cardLeft = card.offsetLeft;
      
      const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      setCurrentIndex(index);
    }
  };

  const handlePrevCard = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : cardsData.items.length - 1;
    scrollToCard(newIndex);
    handleCardClick(cardsData.items[newIndex], newIndex);
  };

  const handleNextCard = () => {
    const newIndex = currentIndex < cardsData.items.length - 1 ? currentIndex + 1 : 0;
    scrollToCard(newIndex);
    handleCardClick(cardsData.items[newIndex], newIndex);
  };

  useEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    let timeoutId: any;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        const cards = container.querySelectorAll('.video-card-wrapper');
        
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        cards.forEach((card, index) => {
          const cardElement = card as HTMLElement;
          const cardCenter = cardElement.offsetLeft + cardElement.offsetWidth / 2;
          const containerCenter = scrollLeft + containerWidth / 2;
          const distance = Math.abs(cardCenter - containerCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        
        if (closestIndex !== currentIndex) {
          setCurrentIndex(closestIndex);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [currentIndex, cardsData.items.length]);

  const handleSaveCards = async (data: EditableCollectionData<PlatformCardItem>) => {
    console.log('Saving platform cards:', data);
    
    // Actualizar estado local
    setCardsData(data);
    
    // Actualizar video activo si el card actual fue eliminado
    if (!data.items.find(item => item.id === hoveredCardId) && data.items.length > 0) {
      const firstCard = data.items[0];
      setActiveVideoUrl(firstCard.videoUrl);
      setActiveVideoTitle(firstCard.name);
      setHoveredCardId(firstCard.id);
    }
    
    // Llamar al handler del padre si existe
    if (onSaveCollection) {
      await onSaveCollection(data);
    }
  };

  const createNewCard = (): PlatformCardItem => ({
    id: `card_${Date.now()}`,
    order: cardsData.items.length,
    name: 'Nuevo Módulo',
    title: 'Nuevo Módulo',
    caption: 'Sistema de Gestión',
    description: 'Descripción del módulo',
    imageUrl: 'https://via.placeholder.com/300x200/4F46E5/ffffff?text=Nuevo',
    videoUrl: '/video/Modulo-Kapital.mp4',
    hoverVideoUrl: '/video/Modulo-Kapital.mp4',
    ctaUrl: 'https://example.com/curso',
    libraryUrl: 'https://example.com/biblioteca',
  });

  return (
    <>
      <section className="platform-section ">
        <div className="platform-container">
          
   

          {/* Contenedor principal */}
          <div className="platform-content ">
            
            {/* Video Container */}
            <div className="video-container ">
              <div className="video-wrapper">
                <div className="video-responsive">
                  <video
                    ref={videoRef}
                    src={activeVideoUrl}
                    className="rounded-2xl shadow-lg w-full"
                    controls
                    style={{ width: '100%', aspectRatio: '16 / 9', background: '#000' }}
                    muted
                    loop
                    playsInline
                  />
                  <div className="video-title-overlay">
                    <span className="inline-block bg-gray-900/75 text-white px-3 py-2 rounded-md">
                      {activeVideoTitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards Container */}
            <div className="cards-container-wrapper  ">
              <div className="cards-container pt-2" ref={cardsContainerRef}>
                <EditableCollection
                  data={cardsData}
                  onSave={handleSaveCards}
                  createNewItem={createNewCard}
                  addButtonText="Agregar Card"
                  maxItems={10}
                  allowReorder={true}
                  className="cards-flex-wrapper "
                  renderItem={(card, index, helpers) => (
                    <div className="video-card-wrapper" key={card.id}>
                      <PlatformCard
                        card={card}
                        isActive={hoveredCardId === card.id}
                        isEditing={helpers.isEditing}
                        onActivate={() => handleCardClick(card, index)}
                        onHover={() => handleCardHover(card)}
                        helpers={helpers}
                      />
                    </div>
                  )}
                />
              </div>

              {/* Controles de navegación - solo mobile/tablet */}
{cardsData.items.length > 1 && (
  <>
    <button 
      className="absolute top-1/2 -translate-y-1/2 left-2 z-20 
                 w-10 h-10 sm:w-12 sm:h-12
                 flex items-center justify-center
                 bg-white/95 backdrop-blur-sm
                 rounded-full
                 shadow-lg hover:shadow-xl
                 border border-gray-200/50
                 transition-all duration-300 ease-out
                 hover:scale-110 hover:bg-white
                 active:scale-95
                 lg:hidden
                 group"
      onClick={handlePrevCard}
      aria-label="Card anterior"
    >
  
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                     stroke-width="1" stroke-linecap="round" stroke-linejoin="round" 
                     className="lucide lucide-chevron-left-icon lucide-chevron-left 
                           text-lg sm:text-xl text-gray-700 group-hover:text-indigo-600 
                           transition-colors">
                    <path d="m15 18-6-6 6-6"/></svg>
    </button>
    
    <button 
      className="absolute top-1/2 -translate-y-1/2 right-2 z-20
                 w-10 h-10 sm:w-12 sm:h-12
                 flex items-center justify-center
                 bg-white/95 backdrop-blur-sm
                 rounded-full
                 shadow-lg hover:shadow-xl
                 border border-gray-200/50
                 transition-all duration-300 ease-out
                 hover:scale-110 hover:bg-white
                 active:scale-95
                 lg:hidden
                 group"
      onClick={handleNextCard}
      aria-label="Card siguiente"
    >
 
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" 
      stroke-linejoin="round" className="lucide lucide-chevron-right-icon lucide-chevron-right 
      text-lg sm:text-xl text-gray-700 group-hover:text-indigo-600 transition-colors">
      <path d="m9 18 6-6-6-6"/>
      </svg>
    </button>
  </>
)}
            </div>

          </div>
        </div>
      </section>

      {/* Estilos (mantener los mismos) */}
      <style>{`


        .platform-section {
          padding: 3rem;
          display: flex;
          align-items: center;
        }

        .platform-container {
          width: 100%;
          padding-left: 0.75rem;  /* px-3 */
          padding-right: 0.75rem;
          margin-left: auto;
          margin-right: auto;
        }

        .platform-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          width: 100%;
        }

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

        .cards-container-wrapper {
          position: relative;
          width: 100%;
          order: 2;
        }

        .cards-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
        }

        .cards-container::-webkit-scrollbar {
          display: none;
        }

        @media (max-width: 669px) {
          .cards-flex-wrapper {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            padding: 1rem calc(50% - 145px);
            justify-content: flex-start;
            width: max-content;
            align-items: stretch;
          }

          .video-card-wrapper {
            position: relative;
            width: 290px;
            flex: 0 0 auto;
            scroll-snap-align: center;
            scroll-snap-stop: always;
            transition: transform 0.3s ease;
          }
        }

        @media (min-width: 670px) and (max-width: 991px) {
          .cards-flex-wrapper {
            display: flex;
            flex-direction: row;
            gap: 1.5rem;
            padding: 1rem calc(50% - 160px);
            justify-content: flex-start;
            width: max-content;
            align-items: stretch;
          }

          .video-card-wrapper {
            position: relative;
            width: 40vw;
            max-width: 280px;
            min-width: 240px;
            flex: 0 0 auto;
            scroll-snap-align: center;
            transition: transform 0.3s ease;
          }
        }

        .video-card {
          background: white;
          border-radius: 12px;
          cursor: pointer;
          height: 100%;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          border: 2px solid transparent;
          position: relative;
        }

        .video-card.editing {
          border: 2px solid #2FA4FF;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
          height: 100%;
          overflow-y: auto;
        }

        @media (max-width: 991.98px) {
          .video-card.active {
            border: 2px solid #0d6efd;
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
            transform: scale(1.02);
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

        @media (min-width: 768px) {
          .video-wrapper {
            max-width: 90%;
          }
            .platform-container {
    padding-left: 1rem;   /* md:px-4 */
    padding-right: 1rem;
  }
        }

        @media (min-width: 992px) {
          .platform-content {
            flex-direction: row;
            align-items: center;
            gap: 3rem;
          }

          .platform-container {
    padding-left: 1.25rem; /* lg:px-5 */
    padding-right: 1.25rem;
    max-width: 1400px;     /* Para evitar que en pantallas gigantes se pierda el centro */
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

          .cards-container-wrapper {
            flex: 1;
            order: 1;
          }

          .cards-container {
            overflow-x: hidden;
            overflow-y: auto;
            max-height: 80vh;
            padding-right: 0.5rem;
            scrollbar-width: thin;
            scrollbar-color: rgba(0,0,0,0.2) transparent;
            scroll-snap-type: none;
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

          .cards-flex-wrapper {
            display: flex;
            flex-direction: row;
            justify-content: center;
            gap: 1.5rem;
            height: 300px;
            padding: 0;
            width: 100%;
          }

          .video-card-wrapper {
            width: 100%;
            max-width: 200px;
            margin: 0;
            scroll-snap-align: none;
            scroll-snap-stop: normal;
            flex: 0 0 auto;
          }

          .video-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          }

          .video-card.active {
            border: 1px solid #2FA4FF;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
          }

          .video-card.active:hover {
            box-shadow: 0 4px 16px rgba(0,0,0,0.15), 0 0 0 3px rgba(13, 110, 253, 0.15);
          }
        }

        @media (min-width: 1200px) {
          .platform-content {
            gap: 2rem;
          }

        .cards-container-wrapper {
            /* Quitamos comportamientos heredados */
            flex: none !important; 
            width: auto !important;
            max-width: none !important;
            position: relative;
            order: 1;
            
            /* Forzamos que el contenido interno se pegue a la derecha (al video) */
            display: flex;
            justify-content: flex-end; 
          }

          .video-card-wrapper {
            max-width: 250px;
            margin: 0;
          }

          .card-caption {
            font-size: 0.8rem;
          }
          
          .cards-flex-wrapper {
            height: 420px;
            justify-content: end;
          }
          .video-container {
            flex: 1;
            order: 2;
          }
        }
      `}</style>
    </>
  );
}

// ============================================
// CARD COMPONENT
// ============================================

interface PlatformCardProps {
  card: PlatformCardItem;
  isActive: boolean;
  isEditing: boolean;
  onActivate: () => void;
  onHover: () => void;
  helpers: any;
}

function PlatformCard({
  card,
  isActive,
  isEditing,
  onActivate,
  onHover,
  helpers,
}: PlatformCardProps) {
  const handleClick = () => {
    if (!isEditing) {
      onActivate();
    }
  };

  const handleMouseEnter = () => {
    if (!isEditing && window.innerWidth >= 992) {
      onHover();
    }
  };

  if (isEditing) {
    return <CardEditor card={card} onSave={helpers.onSaveItem} onCancel={helpers.onCancelEdit} />;
  }

  return (
    <div
      className={`video-card  ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {helpers.onEdit && (
        <AdminControls
          onEdit={helpers.onEdit}
          onDelete={helpers.onDelete}
          onMoveUp={helpers.onMoveUp}
          onMoveDown={helpers.onMoveDown}
          canMoveUp={helpers.canMoveUp}
          canMoveDown={helpers.canMoveDown}
          position="top-right"
          buttonsDirection='horizontal'
        />
      )}

      <div className="card-image-wrapper ">
        <div className="card-img-container">
          {card.ctaUrl ? (
            <a href={card.ctaUrl} target="_blank" rel="noopener noreferrer">
              <img src={card.imageUrl} alt={card.name} />
            </a>
          ) : (
            <img src={card.imageUrl} alt={card.name} />
          )}
        </div>

      </div>

      <div className="card-content">
        <span className="card-caption">{card.caption}</span>
        {card.description && (
          <ul className="card-description">
            <li>{card.description}</li>
          </ul>
        )}
      </div>

<div className="card-actions">
  {card.ctaUrl ? (
    <>
      {/* 1. Enlace al Curso */}
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

      {/* 2. Enlace a la Biblioteca (si existe) */}
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
            <button className="card-btn">
              <span>Curso de Capacitación</span>
              <i className="bi bi-chevron-right"></i>
            </button>
            <button className="card-btn">
              <span>Biblioteca</span>
              <i className="bi bi-book"></i>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================
// CARD EDITOR
// ============================================

interface CardEditorProps {
  card: PlatformCardItem;
  onSave: (updates: Partial<PlatformCardItem>) => Promise<void>;
  onCancel: () => void;
}

function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const [formData, setFormData] = useState(card);

  const handleSubmit = () => {
    // Asegurar que name y title estén sincronizados
    const dataToSave = {
      ...formData,
      title: formData.name,
    };
    onSave(dataToSave);
  };

  return (
    <div className="video-card editing p-4 min-w-[300px] max-w-[350px]">
      <h6 className="mb-4 text-sm font-semibold">
        Editando Card
      </h6>

      <div className="grid gap-3">
        <div>
          <label className="block text-xs mb-1 font-medium">
            Nombre
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value, title: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-xs mb-1 font-medium">
            Caption
          </label>
          <input
            type="text"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-xs mb-1 font-medium">
            Descripción
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-y"
          />
        </div>

        <div>
          <label className="block text-xs mb-1 font-medium">
            Imagen URL
          </label>
          <input
            type="url"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
          />
        </div>

        <div>
          <label className="block text-xs mb-1 font-medium">
            Video URL
          </label>
          <input
            type="url"
            value={formData.videoUrl}
            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
          />
        </div>

        <div>
          <label className="block text-xs mb-1 font-medium">
            CTA URL (opcional)
          </label>
          <input
            type="url"
            value={formData.ctaUrl || ''}
            onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
          />
        </div>

        <div>
          <label className="block text-xs mb-1 font-medium">
            Library URL (opcional)
          </label>
          <input
            type="url"
            value={formData.libraryUrl || ''}
            onChange={(e) => setFormData({ ...formData, libraryUrl: e.target.value })}
            placeholder="https://..."
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
          />
        </div>

      </div>

      <div className="flex gap-1.5 mt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-3 py-1.5 border border-gray-300 bg-white rounded text-xs cursor-pointer hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-3 py-1.5 border-none bg-[#2FA4FF] text-white rounded text-xs cursor-pointer font-medium hover:bg-[#00FFDD]"
        >
          Guardar
        </button>
      </div>
    </div>
  );
}