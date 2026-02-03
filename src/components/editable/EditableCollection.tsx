// src/components/editable/EditableCollection.tsx

import { useState, useEffect } from 'react';
import type { CollectionItem, EditableCollectionData } from '../../types/editable.types';
import { useAuthContext } from '../../hooks/useAuthContext';




interface EditableCollectionProps<T extends CollectionItem> {
  data: EditableCollectionData<T>;
  onSave: (data: EditableCollectionData<T>) => Promise<void>;
  renderItem: (item: T, index: number, helpers: ItemHelpers<T>) => React.ReactNode;
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
  addButtonText = 'Agregar item',
  emptyMessage = 'No hay items. Agrega uno para comenzar.',
  maxItems,
  allowReorder = true,
  className = '',
}: EditableCollectionProps<T>) {
  const [items, setItems] = useState<T[]>(data.items);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  
  const { isAdmin } = useAuthContext();
  useEffect(() => {
      setItems(data.items);
      setEditingId(null);
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
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return;

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
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updatedItems = [...items];
    [updatedItems[index - 1], updatedItems[index]] = [updatedItems[index], updatedItems[index - 1]];
    
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
    [updatedItems[index], updatedItems[index + 1]] = [updatedItems[index + 1], updatedItems[index]];
    
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
      console.error('Error saving collection:', error);
      alert('Error al guardar. Intenta nuevamente.');
      setItems(data.items);
    } finally {
      setIsSaving(false);
    }
  };

  // Modo no-admin: solo renderizar items
  if (!isAdmin) {
    return (
      <div className={className}>
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
    <div className={className} style={{ position: 'relative' }}>
      {/* Items */}
      {items.length === 0 ? (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
            color: '#9ca3af',
            border: '2px dashed #d1d5db',
            borderRadius: '12px',
            backgroundColor: '#f9fafb',
          }}
        >
          <p style={{ margin: '0 0 1rem', fontSize: '0.875rem' }}>{emptyMessage}</p>
          <button
            onClick={handleAdd}
            disabled={isSaving}
            style={{
              padding: '8px 20px',
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            + {addButtonText}
          </button>
        </div>
      ) : (
        <>
          {items.map((item, index) => (
            <>
              {renderItem(item, index, {
                isEditing: editingId === item.id,
                onEdit: () => setEditingId(item.id),
                onDelete: () => handleDelete(item.id),
                onSaveItem: (updates) => handleSaveItem(item.id, updates),
                onCancelEdit: () => setEditingId(null),
                onMoveUp: () => handleMoveUp(index),
                onMoveDown: () => handleMoveDown(index),
                canMoveUp: allowReorder && index > 0,
                canMoveDown: allowReorder && index < items.length - 1,
              })}
              </>
          ))}

          {/* Botón Agregar */}
          {(!maxItems || items.length < maxItems) && (
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <button
                onClick={handleAdd}
                disabled={isSaving}
                style={{
                  padding: '8px 20px',
                  border: '2px dashed #3b82f6',
                  background: 'white',
                  color: '#3b82f6',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                + {addButtonText}
              </button>
            </div>
          )}
        </>
      )}

      {/* Indicador de guardado */}
      {isSaving && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '0.875rem',
            fontWeight: '500',
            zIndex: 10001,
          }}
        >
          Guardando cambios...
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENTE AUXILIAR: Admin Controls
// ============================================

interface AdminControlsProps {
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export function AdminControls({
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp = false,
  canMoveDown = false,
  position = 'top-right',
}: AdminControlsProps) {
  const positions = {
    'top-right': { top: '8px', right: '8px' },
    'top-left': { top: '8px', left: '8px' },
    'bottom-right': { bottom: '8px', right: '8px' },
    'bottom-left': { bottom: '8px', left: '8px' },
  };

  return (
    <div
      style={{
        position: 'absolute',
        ...positions[position],
        display: 'flex',
        gap: '4px',
        zIndex: 100,
      }}
    >
      {/* Reorder buttons */}
      {(canMoveUp || canMoveDown) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {canMoveUp && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp?.();
              }}
              style={{
                padding: '4px 6px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              title="Mover arriba"
            >
              ↑
            </button>
          )}
          {canMoveDown && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown?.();
              }}
              style={{
                padding: '4px 6px',
                border: 'none',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              title="Mover abajo"
            >
              ↓
            </button>
          )}
        </div>
      )}

  
            {/* Edit button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              style={{
                padding: '6px 10px',
                border: 'none',
                background: 'rgba(59, 130, 246, 0.95)',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              title="Editar"
            >
              ✏️
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{
                padding: '6px 10px',
                border: 'none',
                background: 'rgba(239, 68, 68, 0.95)',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              title="Eliminar"
            >
        🗑️
      </button>


      
    </div>
  );
}