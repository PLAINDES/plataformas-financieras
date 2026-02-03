// src/app/landing/sections/ClientsSection.tsx

import { useState, useEffect } from 'react';
import { EditableText } from "../../../components/editable/EditableText";
import { EditableCollection, AdminControls } from "../../../components/editable/EditableCollection";
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

  const handleSaveClients = async (data: EditableCollectionData<ClientLogoEditable>) => {
    console.log('Saving clients collection:', data);
    
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
        // Opcional: Revertir items si falla
      }
    }
  };

  const createNewClient = (): ClientLogoEditable => ({
    id: `client-${Date.now()}`,
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
      className="d-flex flex-wrap justify-content-center align-items-center gap-5 px-3 px-md-5"
      renderItem={(client, index, helpers) => (
        <ClientLogoCard client={client} helpers={helpers} />
      )}
    />
  );

  if ((!items || items.length === 0) && !isAdmin) return null;

  return (
    <div className="bs-section-2 text-secondary">
      <div className="container">
        {/* Title - Editable */}
        <div className="text-center mb-4 mb-md-5">
          <EditableText
            content={titleContent}
            onSave={onSave || (async () => {})}
            as="h2"
            className="text-secondary mb-0 fw-normal fs-5 fs-md-3 fs-lg-3"
          />
        </div>

        {/* Clients Grid - Editable Collection */}
        {renderCollection()}
      </div>

      {/* Responsive Styles */}
      <style>{`
        .bs-section-2 {
          padding: 40px 0;
          color: #adb5bd;
        }

        .bs-section-2 h2 {
          color: #adb5bd;
        }

        .bs-section-2 .client-logo {
          max-height: 30px;
          width: auto;
          object-fit: contain;
          filter: grayscale(100%) brightness(0.85);
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        @media (hover: hover) {
          .bs-section-2 .client-logo:hover {
            filter: grayscale(0%) brightness(1);
            opacity: 0.6;
            transform: scale(1.08);
          }
        }

        @media (min-width: 768px) {
          .bs-section-2 .client-logo {
            max-height: 35px;
          }
        }

        @media (max-width: 767px) {
          .bs-section-2 {
            padding: 30px 0;
          }
          
          .bs-section-2 .container {
            padding: 0 15px;
          }
          
          .bs-section-2 .client-logo {
            max-height: 25px;
          }
        }

        @media (max-width: 575px) {
          .bs-section-2 {
            padding: 25px 0;
          }
          
          .bs-section-2 h2 {
            font-size: 1.25rem !important;
          }
          
          .bs-section-2 .client-logo {
            max-height: 22px;
          }
          
          .bs-section-2 .d-flex.flex-wrap {
            gap: 1rem !important;
          }

          .client-logo-wrapper.editing {
            min-width: 100%;
            max-width: 100%;
            margin-bottom: 1rem;
          }

          .edit-client-form input {
            font-size: 0.875rem;
          }

          .edit-client-form button {
            font-size: 0.75rem;
            padding: 4px 8px;
          }

          .admin-controls-overlay {
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        }

        .client-logo-wrapper {
          position: relative;
          min-width: 70px;
          max-width: 140px;
        }

        .client-logo-wrapper.editing {
          border: 2px dashed #ffc107;
          border-radius: 8px;
          padding: 12px;
          background: rgba(40, 40, 40, 0.95); /* Fondo más oscuro para legibilidad */
          min-width: 240px;
          max-width: 300px;
          z-index: 100; /* Z-index alto para estar sobre todo */
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .admin-controls-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
          z-index: 2;
        }

        .client-logo-wrapper:hover .admin-controls-overlay {
          opacity: 1;
          pointer-events: auto;
        }

        .edit-client-form {
          width: 100%;
        }

        .edit-client-form input {
          width: 100%;
          margin-bottom: 8px;
        }

        .edit-client-form .preview-image {
          max-width: 100%;
          max-height: 50px;
          object-fit: contain;
          margin: 8px 0;
          background: rgba(255,255,255,0.1);
          padding: 4px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

// ============================================
// COMPONENTE AUXILIAR: Client Logo Card
// ============================================

interface ClientLogoCardProps {
  client: ClientLogoEditable;
  helpers: any;
}

function ClientLogoCard({ client, helpers }: ClientLogoCardProps) {
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
    e.preventDefault(); // Evitar submit de form accidental
    e.stopPropagation(); // Evitar burbujeo
    console.log("Guardando cliente...", editedClient);
    helpers.onSaveItem(editedClient);
  };

  // Manejador seguro para cancelar
  const handleCancelClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedClient(client); // Revertir cambios locales
    helpers.onCancelEdit();
  };

  // Modo edición
  if (helpers.isEditing) {
    return (
      <div className="client-logo-wrapper editing" onClick={(e) => e.stopPropagation()}>
        <div className="edit-client-form">
          <div className="mb-2">
            <label className="form-label small fw-bold text-white mb-1">Nombre</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={editedClient.name}
              onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
              placeholder="Ej: Microsoft"
            />
          </div>

          <div className="mb-2">
            <label className="form-label small fw-bold text-white mb-1">URL Logo</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={editedClient.imageUrl}
              onChange={(e) => setEditedClient({ ...editedClient, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="mb-2">
            <label className="form-label small fw-bold text-white mb-1">Alt Text</label>
            <input
              type="text"
              className="form-control form-control-sm"
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
                className="preview-image"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/140x40?text=Error';
                }}
              />
            </div>
          )}

          <div className="d-flex gap-2 justify-content-end mt-3">
            <button 
              type="button" 
              className="btn btn-sm btn-secondary"
              onClick={handleCancelClick}
            >
              Cancelar
            </button>
            <button 
              type="button"
              className="btn btn-sm btn-primary"
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
      className="client-logo-wrapper d-flex justify-content-center align-items-center"
      title={client.name}
      style={{ position: 'relative' }}
    >
      <img
        src={client.imageUrl}
        alt={client.alt || client.name}
        className="client-logo img-fluid"
        onError={(e) => {
          e.currentTarget.src = 'https://www.svgrepo.com/show/508699/landscape-placeholder.svg';
        }}
      />
      
      {isAdmin && (
        <div className="admin-controls-overlay">
          <AdminControls
            onEdit={(e) => {
                if(e) e.stopPropagation();
                helpers.onEdit();
            }}
            onDelete={(e) => {
                if(e) e.stopPropagation();
                helpers.onDelete();
            }}
            onMoveUp={helpers.onMoveUp}
            onMoveDown={helpers.onMoveDown}
            canMoveUp={helpers.canMoveUp}
            canMoveDown={helpers.canMoveDown}
            position="top-right"
          />
        </div>
      )}
    </div>
  );
}