// src/components/editable/EditableCollection.tsx

import React, { useState, useEffect, useRef } from "react";
import type {
  CollectionItem,
  EditableCollectionData,
} from "../../types/editable.types";
import { Ellipsis, Pencil, Trash } from "lucide-react";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

interface EditableCollectionProps<T extends CollectionItem> {
  data: EditableCollectionData<T>;
  onSave: (data: EditableCollectionData<T>) => Promise<void>;
  renderItem: (
    item: T,
    index: number,
    helpers: ItemHelpers<T>
  ) => React.ReactNode;
  createNewItem: () => T;
  addButtonText?: string;
  emptyMessage?: string;
  maxItems?: number;
  allowReorder?: boolean;
  className?: string;
}

interface ItemHelpers<T extends CollectionItem> {
  isEditing: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSaveItem: (updatedItem: Partial<T>) => Promise<void>;
  onCancelEdit: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function EditableCollection<T extends CollectionItem>({
  data,
  onSave,
  renderItem,
  createNewItem,
  addButtonText = "Agregar item",
  emptyMessage = "No hay items. Agrega uno para comenzar.",
  maxItems,
  allowReorder = true,
  className = "",
}: EditableCollectionProps<T>) {
  const [items, setItems] = useState<T[]>(data.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isNewItem, setIsNewItem] = useState(false);

  // --- LÓGICA DE DRAG-TO-SCROLL ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.userSelect = "none"; // Evita seleccionar texto al arrastrar
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.userSelect = "auto";
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = "grab";
      scrollRef.current.style.userSelect = "auto";
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Multiplicador de velocidad de arrastre
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.touches[0].pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  // --------------

  const { isAdmin } = useAuthContext();
  useEffect(() => {
    setItems(data.items);
    setEditingId(null);
    setIsNewItem(false); // Reset cuando cambian los datos externos
  }, [data.items]);

  const handleAdd = () => {
    if (maxItems && items.length >= maxItems) {
      alert(`Máximo ${maxItems} items permitidos`);
      return;
    }

    const newItem = createNewItem();

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    setEditingId(newItem.id);
    setIsNewItem(true); // MARCAR como item nuevo
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este item?")) return;

    const updatedItems = items.filter((item) => item.id !== id);
    setItems(updatedItems);
    await saveCollection(updatedItems);
  };

  const handleSaveItem = async (id: string, updates: Partial<T>) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setItems(updatedItems);
    await saveCollection(updatedItems);
    setEditingId(null);
    setIsNewItem(false); // Ya no es nuevo después de guardar
  };

  // Manejar cancelación
  const handleCancelEdit = (id: string) => {
    if (isNewItem) {
      // Si es un item nuevo que no se guardó, eliminarlo
      const updatedItems = items.filter((item) => item.id !== id);
      setItems(updatedItems);
    }
    // Si es un item existente, solo cerrar el editor (no hacer nada más)

    setEditingId(null);
    setIsNewItem(false);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updatedItems = [...items];
    [updatedItems[index - 1], updatedItems[index]] = [
      updatedItems[index],
      updatedItems[index - 1],
    ];

    // Actualizar order
    updatedItems.forEach((item, idx) => {
      item.order = idx;
    });

    setItems(updatedItems);
    await saveCollection(updatedItems);
  };

  const handleMoveDown = async (index: number) => {
    if (index === items.length - 1) return;
    const updatedItems = [...items];
    [updatedItems[index], updatedItems[index + 1]] = [
      updatedItems[index + 1],
      updatedItems[index],
    ];

    // Actualizar order
    updatedItems.forEach((item, idx) => {
      item.order = idx;
    });

    setItems(updatedItems);
    await saveCollection(updatedItems);
  };

  const saveCollection = async (updatedItems: T[]) => {
    setIsSaving(true);
    try {
      await onSave({ ...data, items: updatedItems });
    } catch (error) {
      console.error("Error saving collection:", error);
      alert("Error al guardar. Intenta nuevamente.");
      setItems(data.items);
    } finally {
      setIsSaving(false);
    }
  };

  // Modo no-admin: solo renderizar items
  if (!isAdmin) {
    return (
      <div
        ref={scrollRef}
        className={`${className} cursor-grab active:cursor-grabbing`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.map((item, index) =>
          renderItem(item, index, {
            isEditing: false,
            onEdit: undefined,
            onDelete: undefined,
            onMoveUp: undefined,
            onMoveDown: undefined,
            onSaveItem: async () => {},
            onCancelEdit: () => {},
            canMoveUp: false,
            canMoveDown: false,
          })
        )}
      </div>
    );
  }

  // Modo admin: renderizar con controles
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      {/* Contenedor deslizante de items */}
      <div
        ref={scrollRef}
        className={`${className} cursor-grab active:cursor-grabbing`}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {items.length === 0 ? (
          <div className="text-center py-12 px-4 border-dashed border-2 rounded-lg text-gray-400">
            <p className="mb-4 text-sm">{emptyMessage}</p>
            <button
              onClick={handleAdd}
              disabled={isSaving}
              className="py-2 px-5 bg-valora-primary hover:bg-valora-secondary text-white rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              + {addButtonText}
            </button>
          </div>
        ) : (
          items.map((item, index) => (
            <React.Fragment key={item.id}>
              {renderItem(item, index, {
                isEditing: editingId === item.id,
                onEdit: () => {
                  setEditingId(item.id);
                  setIsNewItem(false); // Items existentes no son nuevos
                },
                onDelete: () => handleDelete(item.id),
                onSaveItem: (updates) => handleSaveItem(item.id, updates),
                onCancelEdit: () => handleCancelEdit(item.id), // Pasar el ID
                onMoveUp: () => handleMoveUp(index),
                onMoveDown: () => handleMoveDown(index),
                canMoveUp: allowReorder && index > 0,
                canMoveDown: allowReorder && index < items.length - 1,
              })}
            </React.Fragment>
          ))
        )}
      </div>

      {/* Botón Agregar fuera del contenedor de scroll */}
      {items.length > 0 && (!maxItems || items.length < maxItems) && (
        <div className="text-center mt-6">
          <button
            onClick={handleAdd}
            disabled={isSaving}
            className="py-2 px-5 border-dashed border-2 border-valora-primary bg-white text-valora-primary rounded-md text-sm font-medium transition-colors cursor-pointer"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#eff6ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
            }}
          >
            + {addButtonText}
          </button>
        </div>
      )}

      {/* Indicador de guardado */}
      {isSaving && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "12px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            fontSize: "0.875rem",
            fontWeight: "500",
            zIndex: 10001,
          }}
        >
          Guardando cambios...
        </div>
      )}
    </div>
  );
}

interface AdminControlsProps {
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  // Nueva prop para controlar la dirección (Vertical por defecto)
  buttonsDirection?: "horizontal" | "vertical";
}

export function AdminControls({
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  position = "top-right",
  buttonsDirection = "vertical", // Default cambiado a vertical
}: AdminControlsProps) {
  const positions = {
    "top-right": { top: "8px", right: "8px" },
    "top-left": { top: "8px", left: "8px" },
    "bottom-right": { bottom: "8px", right: "8px" },
    "bottom-left": { bottom: "8px", left: "8px" },
  };

  const [isOpen, setIsOpen] = useState(false);
  const isVertical = buttonsDirection === "vertical";

  const buttonBaseClass = `
    flex items-center justify-center 
    w-8 h-8 rounded-full 
    border border-gray-200 bg-white 
    text-gray-600 shadow-sm 
    transition-all duration-300 ease-out
    hover:-translate-y-0.5 hover:shadow-md hover:border-gray-400
    cursor-pointer
  `;

  return (
    <div
      style={{
        position: "absolute",
        ...positions[position],
        zIndex: 100,
      }}
      // CAMBIO 1: Flex dinámico.
      // Usamos 'reverse' para que el botón Trigger sea el punto de anclaje visual
      // y las opciones se expandan "hacia atrás" (arriba o izquierda).
      className={`
        flex gap-2 items-center
        ${isVertical ? "flex-col" : "flex-row-reverse"}
      `}
    >
      {/* --- Botón Principal (Trigger) --- */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
            relative z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white border shadow-sm transition-all duration-200 cursor-pointer
            ${isOpen ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:border-gray-400 hover:shadow-md"}
        `}
      >
        {isOpen ? (
          <span className="text-gray-500 font-bold text-xs">✕</span>
        ) : (
          // Icono de 3 puntos (Menú)
          <Ellipsis className="size-6" />
        )}
      </button>
      {/* --- Menú Desplegado (Las Opciones) --- */}
      <div
        className={`
          flex gap-2 transition-all duration-300
          ${isVertical ? "flex-col" : "flex-row"}
          ${
            isOpen
              ? "opacity-100 scale-100 translate-0"
              : // CAMBIO 2: La animación de ocultar depende de la dirección
                `opacity-0 scale-90 pointer-events-none ${isVertical ? "-translate-y-4" : "translate-x-4"}`
          }
        `}
      >
        {/* Botones de Reordenamiento */}
        {(canMoveUp || canMoveDown) && (
          <>
            {canMoveUp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp?.();
                }}
                className={buttonBaseClass}
                title="Subir"
              >
                <span className="text-xs font-bold">↑</span>
              </button>
            )}

            {canMoveDown && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown?.();
                }}
                className={buttonBaseClass}
                title="Bajar"
              >
                <span className="text-xs font-bold">↓</span>
              </button>
            )}
          </>
        )}

        {/* Botón Editar (Hover Azul) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className={`${buttonBaseClass} hover:text-blue-600 hover:border-blue-400`}
          title="Editar"
        >
          <Pencil className="size-4" />
        </button>

        {/* Botón Eliminar (Hover Rojo) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={`${buttonBaseClass} hover:text-red-600 hover:border-red-400`}
          title="Eliminar"
        >
          <Trash className="size-4" />
        </button>
      </div>
    </div>
  );
}
