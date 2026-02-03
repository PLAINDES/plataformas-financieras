// src/app/landing/sections/ClientsSection.tsx

import { useState } from 'react';
import type { ClientLogo } from "../../../types/landing.types";
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
  content: string;
  clients: ClientLogoEditable[];
  onSave: (content: EditableContent) => Promise<void>;
}
export function ClientsSection({ 
  content, 
  clients, 
  onSave 
}: ClientsSectionProps) {
  const { isAdmin } = useAuthContext();
  console.log('Rendering ClientsSection with clients:', content);
  if (!clients || clients.length === 0) {
    if (!isAdmin) return null;
    
    // Modo admin con lista vacía
    return (
      <div className="bs-section-2 text-secondary">
        <div className="container">
          <div className="text-center mb-4 mb-md-5">
            <EditableText
              content={{ 
                value: content, 
                id: 'text', 
                type: 'text', 
                section: 'clients' 
              }}
              onSave={onSave}
              as="h2"
              className="text-secondary mb-0 fw-normal fs-5 fs-md-3 fs-lg-3"
            />
          </div>

          <EditableCollection
            data={{ id: 'clients', items: [], section: 'clients', type: 'collection' }}
            onSave={handleSaveClients}
            createNewItem={createNewClient}
            addButtonText="Agregar Cliente"
            emptyMessage="No hay clientes. Agrega uno para comenzar."
            allowReorder={true}
            className="d-flex flex-wrap justify-content-center align-items-center gap-5 px-3 px-md-5"
            renderItem={(client, index, helpers) => (
              <ClientLogoCard client={client} helpers={helpers} />
            )}
          />
        </div>
      </div>
    );
  }

  const handleSaveClients = async (data: EditableCollectionData<ClientLogoEditable>) => {
    await onSave({
      section: 'clients',
      field: 'clients',
      items: data.items,
    });
  };

  const createNewClient = (): ClientLogoEditable => ({
    id: `client-${Date.now()}`,
    name: 'Nuevo Cliente',
    imageUrl: 'https://via.placeholder.com/140x40?text=Logo',
    alt: 'Logo del cliente',
    order: clients.length,
  });

  return (
    <div className="bs-section-2 text-secondary">
      <div className="container">
        {/* Title - Editable */}
        <div className="text-center mb-4 mb-md-5">
          <EditableText
            content={{ 
              value: content, 
              id: 'text', 
              type: 'text', 
              section: 'clients' 
            }}
            onSave={onSave}
            as="h2"
            className="text-secondary mb-0 fw-normal fs-5 fs-md-3 fs-lg-3"
          />
        </div>

        {/* Clients Grid - Editable Collection */}
        <EditableCollection
          data={{ id: 'clients', items: clients, section: 'clients', type: 'collection' }}
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
      </div>

      {/* Responsive Styles */}
      <style>{`
        .bs-section-2 {
          padding: 40px 0;
          color: #adb5bd;
        }

        /* Texto */
        .bs-section-2 h2 {
          color: #adb5bd;
        }

        /* Logos */
        .bs-section-2 .client-logo {
          max-height: 30px;
          width: auto;
          object-fit: contain;
          filter: grayscale(100%) brightness(0.85);
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        /* Hover solo en desktop */
        @media (hover: hover) {
          .bs-section-2 .client-logo:hover {
            filter: grayscale(0%) brightness(1);
            opacity: 0.6;
            transform: scale(1.08);
          }
        }

        /* Tablet */
        @media (min-width: 768px) {
          .bs-section-2 .client-logo {
            max-height: 35px;
          }
        }

        /* Mobile */
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

          /* En móvil, mostrar controles siempre (sin hover) */
          .admin-controls-overlay {
            opacity: 1;
            pointer-events: auto;
          }
        }

        /* Estilos para modo edición */
        .client-logo-wrapper {
          position: relative;
          min-width: 70px;
          max-width: 140px;
        }

        .client-logo-wrapper.editing {
          border: 2px dashed #ffc107;
          border-radius: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          min-width: 200px;
          max-width: 300px;
        }

        /* Controles de admin - overlay con hover */
        .admin-controls-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .client-logo-wrapper:hover .admin-controls-overlay {
          opacity: 1;
          pointer-events: auto;
        }

        /* Fondo semi-transparente al hacer hover (opcional) */
        .client-logo-wrapper:hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 4px;
          z-index: 1;
        }

        .client-logo-wrapper:not(.editing):hover .client-logo {
          filter: grayscale(0%) brightness(1);
          opacity: 0.6;
          transform: scale(1.08);
        }

        /* Formulario de edición responsive */
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
  const [editedClient, setEditedClient] = useState(client);
  const { isAdmin } = useAuthContext();

  // Modo edición
  if (helpers.isEditing) {
    return (
      <div className="client-logo-wrapper editing">
        <div className="edit-client-form">
          <div className="mb-2">
            <label className="form-label small fw-bold text-white">Nombre del Cliente</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={editedClient.name}
              onChange={(e) => setEditedClient({ ...editedClient, name: e.target.value })}
              placeholder="Ej: Microsoft"
            />
          </div>

          <div className="mb-2">
            <label className="form-label small fw-bold text-white">URL de la Imagen</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={editedClient.imageUrl}
              onChange={(e) => setEditedClient({ ...editedClient, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="mb-2">
            <label className="form-label small fw-bold text-white">Texto Alt (opcional)</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={editedClient.alt || ''}
              onChange={(e) => setEditedClient({ ...editedClient, alt: e.target.value })}
              placeholder="Logo de la empresa"
            />
          </div>

          {/* Preview de la imagen */}
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

          {/* Botones de acción */}
          <div className="d-flex gap-2 justify-content-end mt-3">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={helpers.onCancelEdit}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => helpers.onSaveItem(editedClient)}
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
          e.currentTarget.src = 'https://via.placeholder.com/140x40?text=Logo';
        }}
      />
      
      {/* Controles de admin - aparecen al hacer hover */}
      {isAdmin && (
        <div className="admin-controls-overlay">
          <AdminControls
            onEdit={helpers.onEdit}
            onDelete={helpers.onDelete}
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