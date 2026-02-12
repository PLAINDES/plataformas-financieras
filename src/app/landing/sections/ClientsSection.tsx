// src/app/landing/sections/ClientsSection.tsx

import { useState, useEffect } from 'react';
import { EditableText } from "../../../components/editable/EditableText";
import { EditableCollection } from "../../../components/editable/EditableCollection";
import type { EditableContent, EditableCollectionData, CollectionItem } from '../../../types/editable.types';
import { useAuthContext } from '../../../hooks/useAuthContext';

interface ClientLogoEditable extends CollectionItem {
  name: string;
  imageUrl: string;
  alt?: string;
}

interface ClientsSectionProps {
  content?: {
    title?: string;
    logos?: Array<{
      id: string | number;
      name: string;
      imageUrl: string;
      alt?: string;
    }>;
  };
  onSave?: (content: EditableContent) => Promise<void>;
  onSaveCollection?: <T extends CollectionItem>(data: EditableCollectionData<T>) => Promise<void>;
}

export function ClientsSection({ 
  content = {},
  onSave,
  onSaveCollection,
}: ClientsSectionProps) {
  const { isAdmin } = useAuthContext();
  const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
  
  // 1. ESTADO LOCAL: Inicializamos el estado con los logos de las props
  const [items, setItems] = useState<ClientLogoEditable[]>(() => 
    (content.logos || []).map((logo, index) => ({
      ...logo,
      id: String(logo.id),
      order: index,
    }))
  );

  // 2. SINCRONIZACIÓN: Si las props cambian externamente (ej: recarga de página), actualizamos el estado
  useEffect(() => {
    if (content.logos) {
      setItems(content.logos.map((logo, index) => ({
        ...logo,
        id: String(logo.id),
        order: index,
      })));
    }
  }, [content.logos]);

  // Click fuera para deseleccionar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-client-logo]') && !target.closest('[data-client-controls]')) {
        setSelectedLogoId(null);
      }
    };
    
    if (isAdmin && selectedLogoId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isAdmin, selectedLogoId]);

  const handleSaveClients = async (data: EditableCollectionData<ClientLogoEditable>) => {
    console.log('Saving clients collection:', data);
    
    const previousItems = items; // Backup para rollback
    // 3. ACTUALIZACIÓN OPTIMISTA: Actualizamos la UI inmediatamente
    setItems(data.items);

    if (onSaveCollection) {
      try {
        await onSaveCollection({
          ...data,
          id: 'clients-logos',
        });
      } catch (error) {
        console.error("Error al guardar en servidor:", error);
        setItems(previousItems); // Revertir items si falla
      }
    }
  };

  const createNewClient = (): ClientLogoEditable => ({
    id: `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Nuevo Cliente',
    imageUrl: 'https://via.placeholder.com/140x40?text=Logo',
    alt: 'Logo del cliente',
    order: items.length, // Usar items.length del estado actual
  });

  const titleContent: EditableContent = {
    id: 'clients_title',
    type: 'text',
    value: content.title || 'Ellos confiaron en nosotros',
    section: 'clients',
  };

  // Renderizado común para evitar duplicación de código
  const renderCollection = () => (
    <EditableCollection
      data={{
        id: 'clients-logos',
        section: 'clients',
        items: items, // Usamos el estado local 'items'
        type: 'collection'
      }}
      onSave={handleSaveClients}
      createNewItem={createNewClient}
      addButtonText="Agregar Cliente"
      emptyMessage="No hay clientes. Agrega uno para comenzar."
      allowReorder={true}
      maxItems={20}
      className="flex flex-wrap justify-center items-center gap-5 md:gap-8 px-3 md:px-5"
      renderItem={(client, index, helpers) => (
        <ClientLogoCard 
          client={client} 
          helpers={helpers}
          isSelected={selectedLogoId === client.id}
          onSelect={() => setSelectedLogoId(client.id)}
          onDeselect={() => setSelectedLogoId(null)}
        />
      )}
    />
  );

  if ((!items || items.length === 0) && !isAdmin) return null;

  return (
    <div className="py-10 md:py-16 text-gray-400">
      <div className="container mx-auto px-4">
        {/* Title - Editable */}
        <div className="text-center mb-8 md:mb-12">
          <EditableText
            content={titleContent}
            onSave={onSave || (async () => {})}
            as="h2"
            className="text-gray-400 mb-0 font-normal text-2xl md:text-4xl lg:text-4xl"
          />
        </div>

        {/* Clients Grid - Editable Collection */}
        {renderCollection()}
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE AUXILIAR: Client Logo Card
// ============================================

interface ClientLogoCardProps {
  client: ClientLogoEditable;
  helpers: any;
  isSelected?: boolean;
  onSelect?: () => void;
  onDeselect?: () => void;
}

function ClientLogoCard({ client, helpers, isSelected = false, onSelect, onDeselect }: ClientLogoCardProps) {
  const [editedClient, setEditedClient] = useState<ClientLogoEditable>(client);
  const { isAdmin } = useAuthContext();

  useEffect(() => {
    // Solo actualizamos si no estamos editando activamente para evitar sobrescribir lo que escribe el usuario
    if (!helpers.isEditing) {
      setEditedClient(client);
    }
  }, [client, helpers.isEditing]);

  // Manejador seguro para guardar
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Guardando cliente...", editedClient);
    helpers.onSaveItem(editedClient);
  };

  // Manejador seguro para cancelar
  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedClient(client);
    helpers.onCancelEdit();
  };

  // Click en logo para seleccionar/editar
  const handleLogoClick = (e: React.MouseEvent) => {
    if (!isAdmin) return;
    e.stopPropagation();
    
    if (isSelected) {
      onDeselect?.();
    } else {
      onSelect?.();
    }
  };

  // Modo edición
  if (helpers.isEditing) {
    return (
      <div 
        className="relative min-w-[240px] max-w-[300px] sm:min-w-full sm:max-w-full border-2 border-dashed border-yellow-500 rounded-lg p-3 bg-[rgba(40,40,40,0.95)] z-[100] shadow-lg mb-4 sm:mb-0" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full">
          <div className="mb-2">
            <label className="block text-xs font-bold text-white mb-1">Nombre</label>
            <input
              type="text"
              className="w-full px-2 py-1 text-sm rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedClient.name}
              onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
              placeholder="Ej: Microsoft"
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-bold text-white mb-1">URL Logo</label>
            <input
              type="text"
              className="w-full px-2 py-1 text-sm rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedClient.imageUrl}
              onChange={(e) => setEditedClient({ ...editedClient, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="mb-2">
            <label className="block text-xs font-bold text-white mb-1">Alt Text</label>
            <input
              type="text"
              className="w-full px-2 py-1 text-sm rounded border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedClient.alt || ''}
              onChange={(e) => setEditedClient({ ...editedClient, alt: e.target.value })}
              placeholder="Descripción"
            />
          </div>

          {editedClient.imageUrl && (
            <div className="text-center mb-2">
              <img
                src={editedClient.imageUrl}
                alt="Preview"
                className="max-w-full max-h-[50px] object-contain my-2 bg-white/10 p-1 rounded mx-auto"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/140x40?text=Error';
                }}
              />
            </div>
          )}

          <div className="flex gap-2 justify-end mt-3">
            <button 
              type="button" 
              className="px-3 py-1 text-xs sm:text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              onClick={handleCancelClick}
            >
              Cancelar
            </button>
            <button 
              type="button"
              className="px-3 py-1 text-xs sm:text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={handleSaveClick}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modo visualización
  return (
    <div
      data-client-logo
      className={`
        relative min-w-[70px] max-w-[140px] flex justify-center items-center
        transition-all duration-200
        ${isAdmin ? 'cursor-pointer' : ''}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg p-1' : ''}
      `}
      title={client.name}
      onClick={handleLogoClick}
    >
      <img
        src={client.imageUrl}
        alt={client.alt || client.name}
        className={`
          max-h-[22px] md:max-h-[30px] lg:max-h-[35px] w-auto object-contain 
          grayscale brightness-85 opacity-40 
          transition-all duration-300 
          hover:grayscale-0 hover:brightness-100 hover:opacity-60 hover:scale-110
          ${isSelected ? 'grayscale-0 brightness-100 opacity-80 scale-110' : ''}
        `}
        onError={(e) => {
          e.currentTarget.src = 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg';
        }}
      />
      
      {/* Barra flotante de controles cuando está seleccionado */}
      {isAdmin && isSelected && (
        <div 
          data-client-controls
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-1 flex gap-1 items-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Reordenar arriba */}
          {helpers.canMoveUp && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                helpers.onMoveUp?.();
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Mover arriba"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
          
          {/* Reordenar abajo */}
          {helpers.canMoveDown && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                helpers.onMoveDown?.();
              }}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              title="Mover abajo"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
          
          {/* Separador si hay botones de orden */}
          {(helpers.canMoveUp || helpers.canMoveDown) && (
            <div className="w-px h-6 bg-gray-300" />
          )}
          
          {/* Editar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              helpers.onEdit();
              onDeselect?.();
            }}
            className="p-1.5 hover:bg-blue-50 rounded transition-colors group"
            title="Editar"
          >
            <svg className="w-4 h-4 text-gray-600 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          {/* Eliminar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              helpers.onDelete();
              onDeselect?.();
            }}
            className="p-1.5 hover:bg-red-50 rounded transition-colors group"
            title="Eliminar"
          >
            <svg className="w-4 h-4 text-gray-600 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}