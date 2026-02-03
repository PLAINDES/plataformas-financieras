//Prueba
import React, { useState, useEffect, useRef } from 'react';
import { EditableCollection, AdminControls } from '../../../components/editable/EditableCollection';
import { useAuthContext } from '../../../hooks/useAuthContext';
import type { EditableCollectionData, CollectionItem } from '../../../types/editable.types';

// ============================================
// TYPES
// ============================================
interface PlatformCardItem extends CollectionItem {
  title: string;
  caption: string;
  description?: string;
  imageUrl: string;
  videoUrl: string;
  hoverVideoUrl?: string;
  ctaUrl?: string;
  libraryUrl?: string;
  ribbon?: string;
}

interface PlatformCardsSectionProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  cards?: PlatformCardItem[];
}

// ============================================
// MAIN COMPONENT
// ============================================
export function PlatformCardsSection({
  sectionTitle = '',
  sectionSubtitle = '',
  cards = [],
}: PlatformCardsSectionProps) {
  const { isAdmin } = useAuthContext();
  
  const [cardsData, setCardsData] = useState<EditableCollectionData<PlatformCardItem>>({
    id: 'platform-cards',
    section: 'platform',
    items: cards.map((card, index) => ({
      ...card,
      order: card.order ?? index,
      hoverVideoUrl: card.hoverVideoUrl || card.videoUrl,
    })),
  });

  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(cardsData.items[0]?.videoUrl || '');
  const [activeVideoTitle, setActiveVideoTitle] = useState<string>(cardsData.items[0]?.title || '');
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(cardsData.items[0]?.id || null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // --- LÓGICA DE CENTRADO Y SELECCIÓN ---

  const scrollToCard = (index: number) => {
    if (!cardsContainerRef.current) return;
    
    const container = cardsContainerRef.current;
    // Buscamos todos los elementos que sean cards reales (ignorando wrappers si los hubiera)
    const cardElements = container.querySelectorAll('.video-card-wrapper');
    
    if (cardElements[index]) {
      const card = cardElements[index] as HTMLElement;
      
      // Cálculo para centrar exactamente el elemento
      const containerWidth = container.offsetWidth;
      const cardWidth = card.offsetWidth;
      const cardLeft = card.offsetLeft;
      
      // La posición de scroll es: (Posición izq del card) - (Mitad del contenedor) + (Mitad del card)
      const scrollPosition = cardLeft - (containerWidth / 2) + (cardWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
      
      setCurrentIndex(index);
    }
  };

  const handleCardClick = (card: PlatformCardItem, index: number) => {
    setActiveVideoUrl(card.videoUrl);
    setActiveVideoTitle(card.title);
    setHoveredCardId(card.id);
    
    // Centramos el card al hacer click
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
      setActiveVideoTitle(card.title);
      setHoveredCardId(card.id);
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play();
      }
    }
  };

  const handlePrevCard = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : cardsData.items.length - 1;
    handleCardClick(cardsData.items[newIndex], newIndex);
  };

  const handleNextCard = () => {
    const newIndex = currentIndex < cardsData.items.length - 1 ? currentIndex + 1 : 0;
    handleCardClick(cardsData.items[newIndex], newIndex);
  };

  // Detectar scroll manual para actualizar el índice actual
  useEffect(() => {
    const container = cardsContainerRef.current;
    if (!container) return;

    let timeoutId: any;

    const handleScroll = () => {
      // Usamos debounce para no calcular en cada pixel de scroll
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        const cards = container.querySelectorAll('.video-card-wrapper');
        
        let closestIndex = 0;
        let closestDistance = Infinity;
        
        cards.forEach((card, index) => {
          const cardElement = card as HTMLElement;
          // Centro del card
          const cardCenter = cardElement.offsetLeft + cardElement.offsetWidth / 2;
          // Centro visible del contenedor
          const containerCenter = scrollLeft + containerWidth / 2;
          
          const distance = Math.abs(cardCenter - containerCenter);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        
        if (closestIndex !== currentIndex) {
          setCurrentIndex(closestIndex);
          // Opcional: Activar video al hacer scroll manual (comentado para evitar cambios bruscos)
          // handleCardClick(cardsData.items[closestIndex], closestIndex);
        }
      }, 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [currentIndex, cardsData.items]);

  const handleSaveCards = async (data: EditableCollectionData<PlatformCardItem>) => {
    setCardsData(data);
    if (!data.items.find(item => item.id === hoveredCardId) && data.items.length > 0) {
      handleCardClick(data.items[0], 0);
    }
  };

  const createNewCard = (): PlatformCardItem => ({
    id: `card_${Date.now()}`,
    order: cardsData.items.length,
    title: 'Nuevo Módulo',
    caption: 'Sistema',
    description: 'Descripción breve',
    imageUrl: 'https://via.placeholder.com/300x200/4F46E5/ffffff?text=Nuevo',
    videoUrl: '',
    hoverVideoUrl: '',
  });

  return (
    <>
      <section className="platform-section">
        <div className="container-fluid px-3 px-md-4 px-lg-5">
          
          {(sectionTitle || sectionSubtitle) && (
            <div className="text-center mb-5">
              {sectionTitle && <h2 className="fw-bold">{sectionTitle}</h2>}
              {sectionSubtitle && <p className="text-muted">{sectionSubtitle}</p>}
            </div>
          )}

          <div className="platform-content">
            
            {/* Video Player */}
            <div className="video-container">
              <div className="video-wrapper">
                <div className="video-responsive">
                  <video
                    ref={videoRef}
                    src={activeVideoUrl}
                    className="rounded-4 shadow-lg w-100"
                    controls
                    muted
                    loop
                    playsInline
                  />
                  <div className="video-title-overlay">
                    <span className="badge bg-dark bg-opacity-75 px-3 py-2">
                      {activeVideoTitle}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Carrusel de Cards */}
            <div className="cards-container-wrapper">
              <div className="cards-container" ref={cardsContainerRef}>
                <EditableCollection
                  data={cardsData}
                  onSave={handleSaveCards}
                  createNewItem={createNewCard}
                  addButtonText="Agregar Card"
                  maxItems={10}
                  allowReorder={true}
                  className="cards-flex-wrapper" // Clase interna para el flex container
                  renderItem={(card, index, helpers) => (
                    // Envolvemos en un div para manejar el layout flex independientemente del componente Card
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

              {/* Botones Flotantes (Mobile/Tablet) */}
              {cardsData.items.length > 1 && (
                <>
                  <button 
                    className="carousel-nav-btn carousel-nav-prev"
                    onClick={handlePrevCard}
                    aria-label="Anterior"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  <button 
                    className="carousel-nav-btn carousel-nav-next"
                    onClick={handleNextCard}
                    aria-label="Siguiente"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      <style>{`
        .platform-section {
          padding: 2rem 0;
          overflow: hidden; /* Evita scroll horizontal en la página entera */
        }

        .platform-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
        }

        /* --- VIDEO PLAYER --- */
        .video-container {
          width: 100%;
          order: 1;
        }

        .video-responsive {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }

        .video-responsive video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-title-overlay {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          z-index: 10;
        }

        /* --- CONTENEDOR DE CARDS --- */
        .cards-container-wrapper {
          position: relative;
          width: 100%;
          order: 2;
        }

        /* El contenedor con scroll */
        .cards-container {
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          /* Ocultar scrollbar */
          scrollbar-width: none; 
          -ms-overflow-style: none;
          /* Scroll Snap para sensación magnética */
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          /* Padding lateral para que el primer/último card puedan centrarse */
          padding: 1rem calc(50% - 140px); 
        }

        .cards-container::-webkit-scrollbar {
          display: none;
        }

        /* El flex interno generado por EditableCollection */
        .cards-flex-wrapper {
          display: flex;
          flex-direction: row;
          gap: 1rem;
          width: max-content; /* Asegura que no se colapse */
          align-items: stretch;
        }

        /* --- WRAPPER INDIVIDUAL (Controla el ancho adaptable) --- */
        .video-card-wrapper {
          position: relative;
          /* MOBILE: Ancho adaptable, pero siempre deja ver un poco de los lados */
          width: 80vw; 
          max-width: 320px; /* No dejar que se haga gigante en móviles grandes */
          min-width: 240px; /* Evitar que se aplaste demasiado en móviles micro */
          
          flex: 0 0 auto; /* No encoger ni estirar más allá de width */
          scroll-snap-align: center; /* Siempre centrarse al soltar */
          transition: transform 0.3s ease;
        }

        /* --- ESTILOS DEL CARD --- */
        .video-card {
          background: white;
          border-radius: 12px;
          cursor: pointer;
          height: 100%; /* Llenar altura del wrapper */
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border: 2px solid transparent;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        /* Estado Activo en Mobile */
        .video-card.active {
          border-color: #3b82f6;
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.15);
        }

        .video-card:hover {
          transform: translateY(-2px);
        }

        /* Imagen del Card */
        .card-image-wrapper {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* Aspect Ratio 16:9 fijo */
          background: #f3f4f6;
        }

        .card-img-container {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-img-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        /* Contenido y Textos */
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
          padding: 2px 8px;
          border-radius: 4px;
          align-self: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .card-title-text {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .card-description {
          font-size: 0.85rem;
          color: #374151;
          margin: 0;
          padding-left: 0;
          list-style: none;
        }

        /* Acciones / Botones dentro del card */
        .card-actions {
          padding: 0 1rem 1rem;
        }

        .card-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          background: #eff6ff;
          color: #2563eb;
          border: none;
          text-decoration: none;
          margin-top: 0.5rem;
        }

        .card-btn:hover {
          background: #2563eb;
          color: white;
        }

        /* --- BOTONES DE NAVEGACIÓN --- */
        .carousel-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(0,0,0,0.1);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          color: #111;
        }
        .carousel-nav-prev { left: 0; }
        .carousel-nav-next { right: 0; }

        /* --- MEDIA QUERIES --- */

        /* Tablet (>= 768px): Mostrar más cards */
        @media (min-width: 768px) {
          .video-card-wrapper {
            width: 40vw; /* 2 cards y medio visibles */
            max-width: 280px;
            min-width: 0;
          }
          .cards-container {
             /* Recalcular padding para centrar */
             padding: 1rem calc(50% - 140px);
          }
        }

        /* Desktop (>= 992px): Layout Vertical al lado del video */
        @media (min-width: 992px) {
          .platform-content {
            flex-direction: row;
            align-items: flex-start;
            gap: 2rem;
          }
          
          .video-container {
            flex: 1.5;
            position: sticky;
            top: 2rem;
            order: 2; /* Video a la derecha */
          }
          
          .cards-container-wrapper {
            flex: 1;
            order: 1; /* Cards a la izquierda */
          }

          .cards-container {
            overflow-y: auto;
            overflow-x: hidden;
            max-height: 80vh;
            padding: 0.5rem;
            display: block;
            scroll-snap-type: none; /* En desktop scroll normal */
          }
          
          .cards-flex-wrapper {
            flex-direction: column; /* Vertical */
            width: 100%;
          }

          .video-card-wrapper {
            width: 100%;
            max-width: 100%;
            margin-bottom: 0;
          }

          .carousel-nav-btn {
            display: none;
          }
          
          .card-image-wrapper {
            padding-top: 40%; /* Imagen más apaisada en lista vertical */
          }
        }
      `}</style>
    </>
  );
}

// ============================================
// COMPONENTES AUXILIARES
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
  
  if (isEditing) {
    return <CardEditor card={card} onSave={helpers.onSaveItem} onCancel={helpers.onCancelEdit} />;
  }

  return (
    <div
      className={`video-card ${isActive ? 'active' : ''}`}
      onClick={onActivate}
      onMouseEnter={() => window.innerWidth >= 992 && onHover()}
    >
      {/* Controles de Admin */}
      {helpers.onEdit && (
        <AdminControls
          onEdit={helpers.onEdit}
          onDelete={helpers.onDelete}
          onMoveUp={helpers.onMoveUp}
          onMoveDown={helpers.onMoveDown}
          canMoveUp={helpers.canMoveUp}
          canMoveDown={helpers.canMoveDown}
        />
      )}

      {/* Imagen */}
      <div className="card-image-wrapper">
        <div className="card-img-container">
          <img src={card.imageUrl} alt={card.title} />
        </div>
        {card.ribbon && (
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', fontSize: '0.65rem', padding: '2px 8px',
            borderRadius: '10px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {card.ribbon}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="card-content">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="card-caption">{card.caption}</span>
        </div>
        <h3 className="card-title-text">{card.title}</h3>
        
        {card.description && (
          <div className="card-description">
             {card.description}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="card-actions">
        {card.ctaUrl ? (
          <a href={card.ctaUrl} target="_blank" rel="noopener noreferrer" className="card-btn" onClick={(e) => e.stopPropagation()}>
            <span>Ver Curso</span>
            <i className="bi bi-chevron-right"></i>
          </a>
        ) : (
          <button className="card-btn">
            <span>Ver Curso</span>
            <i className="bi bi-chevron-right"></i>
          </button>
        )}
        
        {card.libraryUrl && (
          <a href={card.libraryUrl} target="_blank" rel="noopener noreferrer" className="card-btn" style={{background: '#f3f4f6', color: '#4b5563'}} onClick={(e) => e.stopPropagation()}>
            <span>Biblioteca</span>
            <i className="bi bi-book"></i>
          </a>
        )}
      </div>
    </div>
  );
}

// ... CardEditor se mantiene igual (lo omito para brevedad, pero debe estar aquí)
function CardEditor({ card, onSave, onCancel }: any) {
    const [formData, setFormData] = useState(card);
    // ... lógica del editor igual al anterior
    return (
        <div style={{ padding: '1rem', background: 'white', border: '2px dashed #f59e0b', borderRadius: '12px' }}>
            <p className="fw-bold mb-2">Editar Card</p>
            <input 
                className="form-control mb-2 form-control-sm" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="Título"
            />
             <input 
                className="form-control mb-2 form-control-sm" 
                value={formData.caption} 
                onChange={e => setFormData({...formData, caption: e.target.value})} 
                placeholder="Caption"
            />
            <div className="d-flex gap-2">
                <button className="btn btn-sm btn-primary w-50" onClick={() => onSave(formData)}>Guardar</button>
                <button className="btn btn-sm btn-outline-secondary w-50" onClick={onCancel}>Cancelar</button>
            </div>
        </div>
    )
}