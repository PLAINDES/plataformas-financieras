import React, { useState } from 'react';
import { EditableText } from "../../../components/editable/EditableText";
import { EditableCollection, AdminControls } from "../../../components/editable/EditableCollection";
import type { EditableContent, EditableCollectionData, CollectionItem } from '../../../types/editable.types';
import { useAuthContext } from '../../../hooks/useAuthContext';

interface TeamMember extends CollectionItem {
  name: string;
  caption?: string;
  description?: string;
  image?: string;
}

interface SectionTitle {
  name: string;
  caption: string;
}

interface TeamSectionProps {
  title?: SectionTitle;
  authors?: TeamMember[];
  developmentTeam?: TeamMember[];
  collaborators?: TeamMember[];
  onSave: (content: EditableContent) => Promise<void>;
}

export default function TeamSection({ title, authors, developmentTeam, collaborators, onSave }: TeamSectionProps) {
  
  const [openSection, setOpenSection] = useState<string | null>(null);
  const { isAdmin } = useAuthContext();

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Handlers para guardar
  const handleSaveTitle = async (content: EditableContent) => {
    await onSave({
      section: 'team',
      field: id,
      value: value,
    });
  };

  const handleSaveAuthors = async (data: EditableCollectionData<TeamMember>) => {
    await onSave({
      section: 'team',
      field: 'authors',
      items: data.items,
    });
  };

  const handleSaveDevelopmentTeam = async (data: EditableCollectionData<TeamMember>) => {
    await onSave({
      section: 'team',
      field: 'developmentTeam',
      items: data.items,
    });
  };

  const handleSaveCollaborators = async (data: EditableCollectionData<TeamMember>) => {
    await onSave({
      section: 'team',
      field: 'collaborators',
      items: data.items,
    });
  };

  // Función para crear nuevos items
  const createNewAuthor = (): TeamMember => ({
    id: `author-${Date.now()}`,
    name: 'Nuevo Autor',
    caption: 'Descripción del autor',
    order: authors ? authors.length : 0,
  });

  const createNewDevelopmentMember = (): TeamMember => ({
    id: `dev-${Date.now()}`,
    name: 'Nuevo Miembro',
    caption: '',
    order: developmentTeam ? developmentTeam.length : 0,
  });

  const createNewCollaborator = (): TeamMember => ({
    id: `collab-${Date.now()}`,
    name: 'Nuevo Colaborador',
    caption: 'Descripción',
    description: 'Área o departamento',
    image: 'images/logo.png',
    order: collaborators ? collaborators.length : 0,
  });

  const sectionBg = { background: 'linear-gradient(to bottom right, #f8f9fa, #e9ecef)' };

  return (
    <section className="py-4 py-md-5 overflow-hidden position-relative" id="equipo" style={sectionBg}>
      
      <div className="container position-relative z-index-1 px-3 px-md-4">
        
        {/* Header Editable */}
        <div className="text-start mb-4 mb-md-5">
          <EditableText 
            content={{ value: title?.name || '', id: 'title', type: 'text', section: 'team' }}
            onSave={onSave} 
            as="h2" 
            className="fs-5 fs-md-4 fw-semibold text-dark mb-2 mb-md-3" 
          />
          <EditableText 
            content={{ value: title?.caption || '', id: 'caption', type: 'text', section: 'team' }}
            onSave={onSave} 
            as="p" 
            className="fs-6 fs-md-5 text-muted fw-bold mb-0" 
          />
        </div>

        {/* Versión Desktop - Grid Principal */}
        <div className="row g-4 g-md-5 d-none d-lg-flex">
          
          {/* COLUMNA IZQUIERDA: Autores + Equipo Desarrollo */}
          <div className="col-lg-6">
            
            {/* 1. Sección Autores */}
            <div className="mb-5">
              <div className="d-flex align-items-center mb-4">
                <h3 className="h3 fw-bold m-0">Autores</h3>
              </div>
              
              <EditableCollection
                data={{ id: 'authors', items: authors || [], section: 'team', type: 'collection' }}
                onSave={handleSaveAuthors}
                createNewItem={createNewAuthor}
                addButtonText="Agregar Autor"
                emptyMessage="No hay autores. Agrega uno para comenzar."
                allowReorder={true}
                className="d-flex flex-column gap-3"
                renderItem={(author, index, helpers) => (
                  <AuthorCard 
                    author={author} 
                    helpers={helpers}
                    onSave={handleSaveAuthors}
                  />
                )}
              />
            </div>

            {/* 2. Sección Equipo de Desarrollo */}
            <div>
              <div className="d-flex align-items-center mb-4">
                <h3 className="h3 fw-bold m-0">Equipo de Desarrollo</h3>
              </div>

              <div className="card border-0 shadow-sm rounded-3 bg-white">
                <div className="p-2 border-start border-3 border-primary ps-3">
                  <EditableCollection
                    data={{ id: 'developmentTeam', items: developmentTeam || [], section: 'team', type: 'collection' }}
                    onSave={handleSaveDevelopmentTeam}
                    createNewItem={createNewDevelopmentMember}
                    addButtonText="Agregar Miembro"
                    emptyMessage="No hay miembros. Agrega uno para comenzar."
                    allowReorder={true}
                    className="list-group list-group-flush"
                    renderItem={(member, index, helpers) => (
                      <DevelopmentMemberCard 
                        member={member} 
                        helpers={helpers}
                        onSave={handleSaveDevelopmentTeam}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA: Colaboradores */}
          <div className="col-lg-6">
            <div className="d-flex align-items-center mb-4">
              <h3 className="h3 fw-bold m-0">Colaboradores</h3>
            </div>

            <EditableCollection
              data={{ id: 'collaborators', items: collaborators || [], section: 'team', type: 'collection' }}
              onSave={handleSaveCollaborators}
              createNewItem={createNewCollaborator}
              addButtonText="Agregar Colaborador"
              emptyMessage="No hay colaboradores. Agrega uno para comenzar."
              allowReorder={true}
              className="d-flex flex-column gap-3"
              renderItem={(collaborator, index, helpers) => (
                <CollaboratorCard 
                  collaborator={collaborator} 
                  helpers={helpers}
                  onSave={handleSaveCollaborators}
                />
              )}
            />
          </div>

        </div>

        {/* Versión Mobile - Acordeón */}
        <div className="d-lg-none">
          
          {/* Acordeón Autores */}
          <div className="mb-3">
            <button
              className="btn btn-link w-100 text-start text-decoration-none p-0 border-0"
              onClick={() => toggleSection('authors')}
            >
              <div className="card border-0 shadow-sm rounded-3 w-100">
                <div className="p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <h3 className="h5 fw-bold m-0 text-dark">Autores</h3>
                    <svg 
                      width="20" 
                      height="20" 
                      fill="currentColor" 
                      className="text-muted"
                      style={{ 
                        transform: openSection === 'authors' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <path d="M5 8l5 5 5-5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
            
            {openSection === 'authors' && (
              <div className="mt-3 animate-fade-in">
                <EditableCollection
                  data={{ id: 'authors', items: authors || [], section: 'team', type: 'collection' }}
                  onSave={handleSaveAuthors}
                  createNewItem={createNewAuthor}
                  addButtonText="Agregar Autor"
                  emptyMessage="No hay autores."
                  allowReorder={true}
                  className="d-flex flex-column gap-3"
                  renderItem={(author, index, helpers) => (
                    <AuthorCard 
                      author={author} 
                      helpers={helpers}
                      onSave={handleSaveAuthors}
                    />
                  )}
                />
              </div>
            )}
          </div>

          {/* Acordeón Equipo de Desarrollo */}
          <div className="mb-3">
            <button
              className="btn btn-link w-100 text-start text-decoration-none p-0 border-0"
              onClick={() => toggleSection('development')}
            >
              <div className="card border-0 shadow-sm rounded-3 w-100">
                <div className="p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <h3 className="h5 fw-bold m-0 text-dark">Equipo de Desarrollo</h3>
                    <svg 
                      width="20" 
                      height="20" 
                      fill="currentColor" 
                      className="text-muted"
                      style={{ 
                        transform: openSection === 'development' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <path d="M5 8l5 5 5-5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
            
            {openSection === 'development' && (
              <div className="mt-3 animate-fade-in">
                <div className="card border-0 shadow-sm rounded-3 bg-white">
                  <div className="p-2">
                    <EditableCollection
                      data={{ id: 'developmentTeam', items: developmentTeam || [], section: 'team', type: 'collection' }}
                      onSave={handleSaveDevelopmentTeam}
                      createNewItem={createNewDevelopmentMember}
                      addButtonText="Agregar Miembro"
                      emptyMessage="No hay miembros."
                      allowReorder={true}
                      className="list-group list-group-flush"
                      renderItem={(member, index, helpers) => (
                        <DevelopmentMemberCard 
                          member={member} 
                          helpers={helpers}
                          onSave={handleSaveDevelopmentTeam}
                          mobile={true}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Acordeón Colaboradores */}
          <div className="mb-3">
            <button
              className="btn btn-link w-100 text-start text-decoration-none p-0 border-0"
              onClick={() => toggleSection('collaborators')}
            >
              <div className="card border-0 shadow-sm rounded-3 w-100">
                <div className="p-3">
                  <div className="d-flex align-items-center justify-content-between">
                    <h3 className="h5 fw-bold m-0 text-dark">Colaboradores</h3>
                    <svg 
                      width="20" 
                      height="20" 
                      fill="currentColor" 
                      className="text-muted"
                      style={{ 
                        transform: openSection === 'collaborators' ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                      }}
                    >
                      <path d="M5 8l5 5 5-5z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </button>
            
            {openSection === 'collaborators' && (
              <div className="mt-3 animate-fade-in">
                <EditableCollection
                  data={{ id: 'collaborators', items: collaborators || [], section: 'team', type: 'collection' }}
                  onSave={handleSaveCollaborators}
                  createNewItem={createNewCollaborator}
                  addButtonText="Agregar Colaborador"
                  emptyMessage="No hay colaboradores."
                  allowReorder={true}
                  className="d-flex flex-column gap-3"
                  renderItem={(collaborator, index, helpers) => (
                    <CollaboratorCard 
                      collaborator={collaborator} 
                      helpers={helpers}
                      onSave={handleSaveCollaborators}
                    />
                  )}
                />
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Estilos adicionales */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .hover-bg-light:hover {
          background-color: #f8f9fa;
        }
        
        @media (max-width: 991.98px) {
          .h5 {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  );
}

// ============================================
// COMPONENTES AUXILIARES PARA CADA TIPO DE CARD
// ============================================

interface AuthorCardProps {
  author: TeamMember;
  helpers: any;
  onSave: (data: EditableCollectionData<TeamMember>) => Promise<void>;
}

function AuthorCard({ author, helpers, onSave }: AuthorCardProps) {
  const [editedAuthor, setEditedAuthor] = useState(author);
  const { isAdmin } = useAuthContext();

  if (helpers.isEditing) {
    return (
      <div className="card border-0 shadow-sm rounded-3 border-start border-3 border-warning ps-3">
        <div className="p-4">
          <div className="mb-3">
            <label className="form-label small fw-bold">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={editedAuthor.name}
              onChange={(e) => setEditedAuthor({ ...editedAuthor, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Cargo/Descripción</label>
            <input
              type="text"
              className="form-control"
              value={editedAuthor.caption}
              onChange={(e) => setEditedAuthor({ ...editedAuthor, caption: e.target.value })}
            />
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={helpers.onCancelEdit}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => helpers.onSaveItem(editedAuthor)}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-3 border-start border-3 border-primary ps-3" style={{ position: 'relative' }}>
      {isAdmin && (
        <AdminControls
          onEdit={helpers.onEdit}
          onDelete={helpers.onDelete}
          onMoveUp={helpers.onMoveUp}
          onMoveDown={helpers.onMoveDown}
          canMoveUp={helpers.canMoveUp}
          canMoveDown={helpers.canMoveDown}
          position="top-right"
        />
      )}
      <div className="p-4">
        <div className="d-flex align-items-center">
          <div className="ms-3">
            <h5 className="h6 fw-bold text-dark mb-1">{author.name}</h5>
            <p className="small text-muted mb-0">{author.caption}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DevelopmentMemberCardProps {
  member: TeamMember;
  helpers: any;
  onSave: (data: EditableCollectionData<TeamMember>) => Promise<void>;
  mobile?: boolean;
}

function DevelopmentMemberCard({ member, helpers, onSave, mobile = false }: DevelopmentMemberCardProps) {
  const [editedMember, setEditedMember] = useState(member);
  const { isAdmin } = useAuthContext();

  if (helpers.isEditing) {
    return (
      <div className={`list-group-item border-0 px-2 py-3 ${mobile ? 'border-start border-3 border-warning ps-3' : ''}`}>
        <div className="mb-2">
          <label className="form-label small fw-bold">Nombre</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editedMember.name}
            onChange={(e) => setEditedMember({ ...editedMember, name: e.target.value })}
          />
        </div>
        <div className="mb-2">
          <label className="form-label small fw-bold">Rol (opcional)</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={editedMember.caption}
            onChange={(e) => setEditedMember({ ...editedMember, caption: e.target.value })}
          />
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <button 
            className="btn btn-sm btn-secondary"
            onClick={helpers.onCancelEdit}
          >
            Cancelar
          </button>
          <button 
            className="btn btn-sm btn-primary"
            onClick={() => helpers.onSaveItem(editedMember)}
          >
            Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`list-group-item border-0 px-2 py-2 d-flex align-items-center hover-bg-light ${mobile ? 'border-start border-3 border-primary ps-3' : ''}`}
      style={{ position: 'relative' }}
    >
      {isAdmin && (
        <AdminControls
          onEdit={helpers.onEdit}
          onDelete={helpers.onDelete}
          onMoveUp={helpers.onMoveUp}
          onMoveDown={helpers.onMoveDown}
          canMoveUp={helpers.canMoveUp}
          canMoveDown={helpers.canMoveDown}
          position="top-right"
        />
      )}
      <div className="ms-3 flex-grow-1">
        <div className={mobile ? "d-flex flex-column" : "d-flex flex-wrap justify-content-between align-items-center"}>
          <h6 className="mb-0 text-dark fw-bold" style={{ fontSize: mobile ? '0.9rem' : '0.95rem' }}>
            {member.name}
          </h6>
          {member.caption && (
            <small className="text-muted ms-auto">{member.caption}</small>
          )}
        </div>
      </div>
    </div>
  );
}

interface CollaboratorCardProps {
  collaborator: TeamMember;
  helpers: any;
  onSave: (data: EditableCollectionData<TeamMember>) => Promise<void>;
}

function CollaboratorCard({ collaborator, helpers, onSave }: CollaboratorCardProps) {
  const [editedCollaborator, setEditedCollaborator] = useState(collaborator);
  const { isAdmin } = useAuthContext();

  if (helpers.isEditing) {
    return (
      <div className="card border-0 shadow rounded-3 border-start border-3 border-warning ps-3">
        <div className="p-4">
          <div className="mb-3">
            <label className="form-label small fw-bold">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={editedCollaborator.name}
              onChange={(e) => setEditedCollaborator({ ...editedCollaborator, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Descripción</label>
            <input
              type="text"
              className="form-control"
              value={editedCollaborator.caption}
              onChange={(e) => setEditedCollaborator({ ...editedCollaborator, caption: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">Área/Departamento (opcional)</label>
            <input
              type="text"
              className="form-control"
              value={editedCollaborator.description || ''}
              onChange={(e) => setEditedCollaborator({ ...editedCollaborator, description: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold">URL de Imagen</label>
            <input
              type="text"
              className="form-control"
              value={editedCollaborator.image || ''}
              onChange={(e) => setEditedCollaborator({ ...editedCollaborator, image: e.target.value })}
            />
            {editedCollaborator.image && (
              <div className="mt-2">
                <img 
                  src={editedCollaborator.image} 
                  alt="Preview" 
                  style={{ maxWidth: '100px', maxHeight: '60px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/100x60?text=Error';
                  }}
                />
              </div>
            )}
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button 
              className="btn btn-sm btn-secondary"
              onClick={helpers.onCancelEdit}
            >
              Cancelar
            </button>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => helpers.onSaveItem(editedCollaborator)}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card border-0 shadow rounded-3 h-100 border-start border-3 border-primary" style={{ position: 'relative' }}>
      {isAdmin && (
        <AdminControls
          onEdit={helpers.onEdit}
          onDelete={helpers.onDelete}
          onMoveUp={helpers.onMoveUp}
          onMoveDown={helpers.onMoveDown}
          canMoveUp={helpers.canMoveUp}
          canMoveDown={helpers.canMoveDown}
          position="top-right"
        />
      )}
      <div className="p-4 text-start">
        {collaborator.image && (
          <div className="mb-4 d-flex justify-content-start">
            <div className="p-3 border rounded-3 bg-white shadow-sm" style={{ maxWidth: '150px' }}>
              <img
                src={collaborator.image}
                alt={collaborator.name}
                className="img-fluid"
                style={{ maxHeight: '80px', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://media.istockphoto.com/id/1311598658/photo/businessman-trading-online-stock-market-on-teblet-screen-digital-investment-concept.jpg?s=1024x1024&w=is&k=20&c=JZprgGDQ8xqa6iu0fyKJfKOlAvae0w9U-AdHeCT2kg4=';
                }}
              />
            </div>
          </div>
        )}

        <h5 className="h6 fw-bold text-dark mb-2">{collaborator.name}</h5>
        <p className="display-10 text-secondary mb-3">{collaborator.caption}</p>

        {collaborator.description && (
          <div className="rounded-3 px-2 py-1 bg-light">
            <small className="fw-semibold">{collaborator.description}</small>
          </div>
        )}
      </div>
    </div>
  );
}