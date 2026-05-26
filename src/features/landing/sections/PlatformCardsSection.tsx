import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EditableCollection,
  AdminControls,
} from "@/shared/components/editable/EditableCollection";
import { useAuthContext } from "../../auth/hooks/useAuthContext";
import type {
  EditableContent,
  EditableCollectionData,
  CollectionItem,
} from "@/shared/types/editable.types";
import "./PlatformCardsSection.css";

interface PlatformCardItem extends CollectionItem {
  name: string;
  title?: string;
  caption: string;
  description?: string;
  imageUrl: string;
  videoUrl: string;
  hoverVideoUrl?: string;
  ctaUrl?: string;
  libraryUrl?: string;
  isImplemented?: boolean;
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
      isImplemented?: boolean;
    }>;
  };
  onSave?: (content: EditableContent) => Promise<void>;
  onSaveCollection?: (
    data: EditableCollectionData<PlatformCardItem>
  ) => Promise<void>;
}

export function PlatformCardsSection({
  content = {},
  onSave: _onSave,
  onSaveCollection,
}: PlatformCardsSectionProps) {
  void _onSave;
  const { isAdmin: _isAdmin } = useAuthContext();
  void _isAdmin;

  const [cardsData, setCardsData] = useState<
    EditableCollectionData<PlatformCardItem>
  >({
    id: "platform-cards",
    section: "platforms",
    items: (content.items || []).map((card, index) => ({
      ...card,
      title: card.name,
      order: index,
      hoverVideoUrl: card.videoUrl,
    })),
  });

  useEffect(() => {
    if (content.items) {
      setCardsData({
        id: "platform-cards",
        section: "platforms",
        items: content.items.map((card, index) => ({
          ...card,
          title: card.name,
          order: index,
          hoverVideoUrl: card.videoUrl,
        })),
      });
    }
  }, [content]);

  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    cardsData.items[0]?.videoUrl || ""
  );
  const [_activeVideoTitle, setActiveVideoTitle] = useState<string>(
    cardsData.items[0]?.name || ""
  );
  void _activeVideoTitle;
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(
    cardsData.items[0]?.id || null
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

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
      setActiveVideoUrl(card.videoUrl);
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
    const cardElements = container.querySelectorAll(".video-card-wrapper");

    if (cardElements[index]) {
      const card = cardElements[index] as HTMLElement;
      card.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
      setCurrentIndex(index);
    }
  };

  const handlePrevCard = () => {
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : cardsData.items.length - 1;
    scrollToCard(newIndex);
    handleCardClick(cardsData.items[newIndex], newIndex);
  };

  const handleNextCard = () => {
    const newIndex =
      currentIndex < cardsData.items.length - 1 ? currentIndex + 1 : 0;
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
        const cards = container.querySelectorAll(".video-card-wrapper");
        let closestIndex = 0;
        let closestDistance = Infinity;
        cards.forEach((card, index) => {
          const cardElement = card as HTMLElement;
          const cardCenter =
            cardElement.offsetLeft + cardElement.offsetWidth / 2;
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
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [currentIndex, cardsData.items.length]);

  const handleSaveCards = async (
    data: EditableCollectionData<PlatformCardItem>
  ) => {
    setCardsData(data);
    if (
      !data.items.find((item) => item.id === hoveredCardId) &&
      data.items.length > 0
    ) {
      const firstCard = data.items[0];
      setActiveVideoUrl(firstCard.videoUrl);
      setActiveVideoTitle(firstCard.name);
      setHoveredCardId(firstCard.id);
    }
    if (onSaveCollection) {
      await onSaveCollection(data);
    }
  };

  const createNewCard = (): PlatformCardItem => ({
    id: `card_${Date.now()}`,
    order: cardsData.items.length,
    name: "Nuevo Módulo",
    title: "Nuevo Módulo",
    caption: "Sistema de Gestión",
    description: "Descripción del módulo",
    imageUrl: "https://via.placeholder.com/300x200/4F46E5/ffffff?text=Nuevo",
    videoUrl: "",
    hoverVideoUrl: "",
    ctaUrl: "https://example.com/curso",
    libraryUrl: "https://example.com/biblioteca",
  });

  return (
    <section className="platform-section">
      <div className="w-full mx-auto px-3">
        <div className="flex flex-col justify-center items-center gap-8 w-full">
          <div
            className={`cards-container-wrapper ${cardsData.items.length > 2 ? "carrousel-desktop-cards" : ""}`}
          >
            <div className="cards-container p-3" ref={cardsContainerRef}>
              <EditableCollection
                data={cardsData}
                onSave={handleSaveCards}
                createNewItem={createNewCard}
                addButtonText="Agregar Card"
                maxItems={10}
                allowReorder={true}
                className="cards-flex-wrapper "
                renderItem={(card, index, helpers) => (
                  <div
                    className="video-card-wrapper shrink-0 w-[85vw] max-w-[320px] snap-center"
                    key={card.id}
                  >
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

            {cardsData.items.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 -translate-y-1/2 left-2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl border-gray-200/50 hover:scale-110 active:scale-95 lg:hidden group"
                  onClick={handlePrevCard}
                  aria-label="Card anterior"
                >
                  <ChevronLeft
                    className="text-gray-700 group-hover:text-indigo-600 transition-colors"
                    strokeWidth={1}
                  />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-1/2 -translate-y-1/2 right-2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-xl border-gray-200/50 hover:scale-110 active:scale-95 lg:hidden group"
                  onClick={handleNextCard}
                  aria-label="Card siguiente"
                >
                  <ChevronRight
                    className="text-gray-700 group-hover:text-indigo-600 transition-colors"
                    strokeWidth={1}
                  />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

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
    if (!isEditing) onActivate();
  };

  const handleMouseEnter = () => {
    if (!isEditing && window.innerWidth >= 992) onHover();
  };

  if (isEditing) {
    return (
      <CardEditor
        card={card}
        onSave={helpers.onSaveItem}
        onCancel={helpers.onCancelEdit}
      />
    );
  }
  const isAvailable = card.isImplemented ?? true;
  const handleDisabledClick = (e: React.MouseEvent) => {
    if (!isAvailable) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  return (
    <div
      className={`video-card ${isActive ? "active" : ""}`}
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
          buttonsDirection="horizontal"
        />
      )}

      {!isAvailable && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full uppercase">
          Próximamente
        </div>
      )}

      <div className="card-image-wrapper">
        <div className="card-img-container">
          {card.ctaUrl && isAvailable ? (
            <a
              href={card.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
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
            <a
              href={isAvailable ? card.ctaUrl : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="card-btn"
              onClick={handleDisabledClick}
            >
              <span>Curso de Capacitación</span>
              <ChevronRight size={16} />
            </a>
            {card.libraryUrl && (
              <a
                href={isAvailable ? card.libraryUrl : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="card-btn"
                onClick={handleDisabledClick}
              >
                <span>Biblioteca</span>
                <BookOpen size={16} />
              </a>
            )}
          </>
        ) : (
          <>
            <button className="card-btn">
              <span>Curso de Capacitación</span>
              <ChevronRight size={16} />
            </button>
            <button className="card-btn">
              <span>Biblioteca</span>
              <BookOpen size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

interface CardEditorProps {
  card: PlatformCardItem;
  onSave: (updates: Partial<PlatformCardItem>) => Promise<void>;
  onCancel: () => void;
}

function CardEditor({ card, onSave, onCancel }: CardEditorProps) {
  const [formData, setFormData] = useState(card);

  const handleSubmit = () => {
    onSave({ ...formData, title: formData.name });
  };

  return (
    <div className="video-card editing p-4 w-full">
      <h6 className="mb-4 text-sm font-semibold">Editando Card</h6>

      <div className="grid gap-3">
        {[
          {
            label: "Nombre",
            field: "name",
            type: "text",
            extraUpdate: { title: true },
          },
          { label: "Caption", field: "caption", type: "text" },
        ].map(({ label, field, type, extraUpdate }) => (
          <div key={field}>
            <label className="block text-xs mb-1 font-medium">{label}</label>
            <input
              type={type}
              value={(formData as any)[field]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  [field]: e.target.value,
                  ...(extraUpdate ? { title: e.target.value } : {}),
                })
              }
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
          </div>
        ))}
        <div className="flex items-center gap-2 py-2">
          <input
            type="checkbox"
            id="isImplemented"
            checked={!!formData.isImplemented}
            onChange={(e) =>
              setFormData({ ...formData, isImplemented: e.target.checked })
            }
            className="w-4 h-4 text-valora-secondary border-gray-300 rounded focus:ring-valora-primary"
          />
          <label
            htmlFor="isImplemented"
            className="text-sm font-medium text-gray-700"
          >
            Implementado
          </label>
        </div>
        <div>
          <label className="block text-xs mb-1 font-medium">Descripción</label>
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={2}
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-y"
          />
        </div>
        {(["imageUrl", "videoUrl", "ctaUrl", "libraryUrl"] as const).map(
          (field) => (
            <div key={field}>
              <label className="block text-xs mb-1 font-medium">
                {field === "imageUrl"
                  ? "Imagen URL"
                  : field === "videoUrl"
                    ? "Video URL"
                    : field === "ctaUrl"
                      ? "CTA URL (opcional)"
                      : "Library URL (opcional)"}
              </label>
              <input
                type="url"
                value={formData[field] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field]: e.target.value })
                }
                placeholder={field.includes("Url") ? "https://..." : ""}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
              />
            </div>
          )
        )}
      </div>

      <div className="flex gap-1.5 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="flex-1 text-xs"
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          className="flex-1 text-xs bg-valora-primary hover:bg-valora-secondary text-white border-none"
        >
          Guardar
        </Button>
      </div>
    </div>
  );
}
