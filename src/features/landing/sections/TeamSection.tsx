import { useEffect, useState } from "react";
import { EditableText } from "@/shared/components/editable/EditableText";
import {
  EditableCollection,
  AdminControls,
} from "@/shared/components/editable/EditableCollection";
import type {
  EditableContent,
  EditableCollectionData,
  CollectionItem,
} from "@/shared/types/editable.types";
import { useAuthContext } from "../../auth/hooks/useAuthContext";
import { Loader2, UploadCloud } from "lucide-react";

interface TeamMember extends CollectionItem {
  name: string;
  caption?: string;
  description?: string;
  image?: string;
}

interface TeamSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    team?: string;
    authors?: TeamMember[];
    developmentTeam?: TeamMember[];
    collaborators?: TeamMember[];
  };
  onSave: (content: EditableContent) => Promise<void>;
  onSaveCollection?: <T extends CollectionItem>(
    collectionData: EditableCollectionData<T>
  ) => Promise<void>;
  onUploadImage?: (file: File, oldUrl?: string) => Promise<string | undefined>;
}

export default function TeamSection({
  content,
  onSave,
  onSaveCollection,
  onUploadImage,
}: TeamSectionProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    authors: false,
    development: false,
    collaborators: false,
  });
  const { isAdmin: _isAdmin, getToken } = useAuthContext();
  void _isAdmin;

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSaveAuthors = async (
    data: EditableCollectionData<TeamMember>
  ) => {
    if (onSaveCollection) {
      await onSaveCollection({
        ...data,
        id: "team-authors",
        section: "team",
      });
    }
  };

  const handleSaveTitle = async (updatedText: EditableContent) => {
    if (!content) return;

    await onSave({
      ...updatedText,
      data: {
        ...content,
        title: updatedText.value,
      },
    });
  };

  const handleSaveSubtitle = async (updatedText: EditableContent) => {
    if (!content) return;

    await onSave({
      ...updatedText,
      data: {
        ...content,
        subtitle: updatedText.value,
      },
    });
  };

  const handleSaveDevelopmentTeam = async (
    data: EditableCollectionData<TeamMember>
  ) => {
    if (onSaveCollection) {
      await onSaveCollection({
        ...data,
        id: "team-developmentTeam",
        section: "team",
      });
    }
  };

  const handleSaveCollaborators = async (
    data: EditableCollectionData<TeamMember>
  ) => {
    const deletedItems = (content?.collaborators || []).filter(
      (oldItem) => !data.items.find((newItem) => newItem.id === oldItem.id)
    );

    if (onSaveCollection) {
      try {
        await onSaveCollection({
          ...data,
          id: "team-collaborators",
          section: "team",
        });

        // Eliminar imágenes de S3 para los colaboradores borrados
        const token = getToken() || undefined;
        deletedItems.forEach(async (item) => {
          if (item.image && !item.image.includes("via.placeholder.com")) {
            try {
              import("@/shared/services/cms.service").then(({ cmsService }) => {
                cmsService.deleteImage(item.image!, token);
              });
            } catch (err) {
              console.error("Error eliminando imagen de colaborador:", err);
            }
          }
        });
      } catch (error) {
        console.error("Error al guardar colaboradores:", error);
      }
    }
  };

  // Función para crear nuevos items
  const createNewAuthor = (): TeamMember => ({
    id: `author-${Date.now()}`,
    name: "Nuevo Autor",
    caption: "Descripción del autor",
    order: content?.authors ? content.authors.length : 0,
  });

  const createNewDevelopmentMember = (): TeamMember => ({
    id: `dev-${Date.now()}`,
    name: "Nuevo Miembro",
    caption: "",
    order: content?.developmentTeam ? content.developmentTeam.length : 0,
  });

  const createNewCollaborator = (): TeamMember => ({
    id: `collab-${Date.now()}`,
    name: "Nuevo Colaborador",
    caption: "Descripción",
    description: "Área o departamento",
    image: "images/logo.png",
    order: content?.collaborators ? content.collaborators.length : 0,
  });

  const sectionBg = {
    background: "linear-gradient(to bottom right, #f8f9fa, #e9ecef)",
  };

  return (
    <section
      className="py-6 md:py-12 overflow-hidden relative"
      id="equipo"
      style={sectionBg}
    >
      <div className="container mx-auto relative z-10 px-3 md:px-4">
        {/* Header Editable */}
        <div className="text-left mb-6 md:mb-10">
          <EditableText
            content={{
              value: content?.title || "",
              id: "title",
              type: "text",
              section: "team",
            }}
            onSave={handleSaveTitle}
            as="h2"
            className="text-xl md:text-3xl font-semibold text-gray-900 mb-2 md:mb-4"
          />
          <EditableText
            content={{
              value: content?.subtitle || ".",
              id: "subtitle",
              type: "text",
              section: "team",
            }}
            onSave={handleSaveSubtitle}
            as="h3"
            className="text-sm md:text-lg font-normal text-gray-600"
          />
        </div>

        {/* Versión Desktop - Grid Principal */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-6 md:gap-10">
          {/* COLUMNA IZQUIERDA: Autores + Equipo Desarrollo */}
          <div>
            {/* 1. Sección Autores */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <h3 className="text-2xl font-bold m-0">Autores</h3>
              </div>

              <EditableCollection
                data={{
                  id: "team-authors",
                  items: content?.authors || [],
                  section: "team",
                  type: "collection",
                }}
                onSave={handleSaveAuthors}
                createNewItem={createNewAuthor}
                addButtonText="Agregar Autor"
                emptyMessage="No hay autores. Agrega uno para comenzar."
                allowReorder={true}
                className="flex flex-col gap-4"
                renderItem={(author, index, helpers) => (
                  <AuthorCard key={index} author={author} helpers={helpers} />
                )}
              />
            </div>

            {/* 2. Sección Equipo de Desarrollo */}
            <div>
              <div className="flex items-center mb-6">
                <h3 className="text-2xl font-bold m-0">Equipo de Desarrollo</h3>
              </div>

              <div className="bg-white border-0 shadow-sm rounded-lg">
                <div className="p-2 border-l-4 border-blue-500 pl-4">
                  <EditableCollection
                    data={{
                      id: "team-developmentTeam",
                      items: content?.developmentTeam || [],
                      section: "team",
                      type: "collection",
                    }}
                    onSave={handleSaveDevelopmentTeam}
                    createNewItem={createNewDevelopmentMember}
                    addButtonText="Agregar Miembro"
                    emptyMessage="No hay miembros. Agrega uno para comenzar."
                    allowReorder={true}
                    className="divide-y divide-gray-200"
                    renderItem={(member, index, helpers) => (
                      <DevelopmentMemberCard
                        key={index}
                        member={member}
                        helpers={helpers}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Colaboradores */}
          <div>
            <div className="flex items-center mb-6">
              <h3 className="text-2xl font-bold m-0">Colaboradores</h3>
            </div>

            <EditableCollection
              data={{
                id: "team-collaborators",
                items: content?.collaborators || [],
                section: "team",
                type: "collection",
              }}
              onSave={handleSaveCollaborators}
              createNewItem={createNewCollaborator}
              addButtonText="Agregar Colaborador"
              emptyMessage="No hay colaboradores. Agrega uno para comenzar."
              allowReorder={true}
              className="flex flex-col gap-4"
              renderItem={(collaborator, index, helpers) => (
                <CollaboratorCard
                  key={index}
                  collaborator={collaborator}
                  helpers={helpers}
                  onUploadImage={onUploadImage}
                />
              )}
            />
          </div>
        </div>

        {/* Versión Mobile - Acordeón */}
        <div className="lg:hidden">
          {/* Acordeón Autores */}
          <div className="mb-4">
            <button
              className="w-full text-left p-0 border-0 bg-transparent"
              onClick={() => toggleSection("authors")}
            >
              <div className="bg-white border-0 shadow-sm rounded-lg w-full">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold m-0 text-gray-900">
                      Autores
                    </h3>
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="text-gray-500"
                      style={{
                        transform: openSections["authors"]
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <path d="M5 8l5 5 5-5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {openSections["authors"] && (
              <div className="mt-4 animate-fade-in">
                <EditableCollection
                  data={{
                    id: "team-authors",
                    items: content?.authors || [],
                    section: "team",
                    type: "collection",
                  }}
                  onSave={handleSaveAuthors}
                  createNewItem={createNewAuthor}
                  addButtonText="Agregar Autor"
                  emptyMessage="No hay autores."
                  allowReorder={true}
                  className="flex flex-col gap-4"
                  renderItem={(author, index, helpers) => (
                    <AuthorCard key={index} author={author} helpers={helpers} />
                  )}
                />
              </div>
            )}
          </div>

          {/* Acordeón Equipo de Desarrollo */}
          <div className="mb-4">
            <button
              className="w-full text-left p-0 border-0 bg-transparent"
              onClick={() => toggleSection("development")}
            >
              <div className="bg-white border-0 shadow-sm rounded-lg w-full">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold m-0 text-gray-900">
                      Equipo de Desarrollo
                    </h3>
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="text-gray-500"
                      style={{
                        transform: openSections["development"]
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <path d="M5 8l5 5 5-5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {openSections["development"] && (
              <div className="mt-4 animate-fade-in">
                <div className="bg-white border-0 shadow-sm rounded-lg">
                  <div className="p-2">
                    <EditableCollection
                      data={{
                        id: "team-developmentTeam",
                        items: content?.developmentTeam || [],
                        section: "team",
                        type: "collection",
                      }}
                      onSave={handleSaveDevelopmentTeam}
                      createNewItem={createNewDevelopmentMember}
                      addButtonText="Agregar Miembro"
                      emptyMessage="No hay miembros."
                      allowReorder={true}
                      className="divide-y divide-gray-200"
                      renderItem={(member, index, helpers) => (
                        <DevelopmentMemberCard
                          key={index}
                          member={member}
                          helpers={helpers}
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
          <div className="mb-4">
            <button
              className="w-full text-left p-0 border-0 bg-transparent"
              onClick={() => toggleSection("collaborators")}
            >
              <div className="bg-white border-0 shadow-sm rounded-lg w-full">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold m-0 text-gray-900">
                      Colaboradores
                    </h3>
                    <svg
                      width="20"
                      height="20"
                      fill="currentColor"
                      className="text-gray-500"
                      style={{
                        transform: openSections["collaborators"]
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    >
                      <path d="M5 8l5 5 5-5z" />
                    </svg>
                  </div>
                </div>
              </div>
            </button>

            {openSections["collaborators"] && (
              <div className="mt-4 animate-fade-in">
                <EditableCollection
                  data={{
                    id: "team-collaborators",
                    items: content?.collaborators || [],
                    section: "team",
                    type: "collection",
                  }}
                  onSave={handleSaveCollaborators}
                  createNewItem={createNewCollaborator}
                  addButtonText="Agregar Colaborador"
                  emptyMessage="No hay colaboradores."
                  allowReorder={true}
                  className="flex flex-col gap-4"
                  renderItem={(collaborator, index, helpers) => (
                    <CollaboratorCard
                      key={index}
                      collaborator={collaborator}
                      helpers={helpers}
                      onUploadImage={onUploadImage}
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
}

function AuthorCard({ author, helpers }: AuthorCardProps) {
  const [editedAuthor, setEditedAuthor] = useState(author);
  const { isAdmin } = useAuthContext();

  if (helpers.isEditing) {
    return (
      <div className="bg-white border-0 shadow-sm rounded-lg border-l-4 border-[#2FA4FF] pl-4">
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Nombre</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedAuthor.name}
              onChange={(e) =>
                setEditedAuthor({ ...editedAuthor, name: e.target.value })
              }
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">
              Cargo/Descripción
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedAuthor.caption}
              onChange={(e) =>
                setEditedAuthor({ ...editedAuthor, caption: e.target.value })
              }
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
              onClick={helpers.onCancelEdit}
            >
              Cancelar
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
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
    <div className="bg-white border-0 shadow-sm rounded-lg border-l-4 border-blue-500 pl-4 relative">
      {isAdmin && (
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
      <div className="p-6">
        <div className="flex items-center">
          <div className="ml-4">
            <h5 className="text-base font-bold text-gray-900 mb-1">
              {author.name}
            </h5>
            <p className="text-sm text-gray-600 mb-0">{author.caption}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DevelopmentMemberCardProps {
  member: TeamMember;
  helpers: any;
  mobile?: boolean;
}

function DevelopmentMemberCard({
  member,
  helpers,
  mobile = false,
}: DevelopmentMemberCardProps) {
  const [editedMember, setEditedMember] = useState(member);
  const { isAdmin } = useAuthContext();

  if (helpers.isEditing) {
    return (
      <div
        className={`border-0 px-2 py-4 ${mobile ? "border-l-4 border-[#2FA4FF] pl-4" : ""}`}
      >
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Nombre</label>
          <input
            type="text"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editedMember.name}
            onChange={(e) =>
              setEditedMember({ ...editedMember, name: e.target.value })
            }
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-bold mb-1">Rol (opcional)</label>
          <input
            type="text"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={editedMember.caption}
            onChange={(e) =>
              setEditedMember({ ...editedMember, caption: e.target.value })
            }
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            onClick={helpers.onCancelEdit}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
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
      className={`border-0 px-2 py-2 flex items-center hover-bg-light ${mobile ? "border-l-4 border-blue-500 pl-4" : ""} relative`}
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
          buttonsDirection="horizontal"
        />
      )}
      <div className="ml-4 grow">
        <div
          className={
            mobile
              ? "flex flex-col"
              : "flex flex-wrap justify-between items-center"
          }
        >
          <h6
            className="mb-0 text-gray-900 font-bold"
            style={{ fontSize: mobile ? "0.9rem" : "0.95rem" }}
          >
            {member.name}
          </h6>
          {member.caption && (
            <small className="text-gray-600 ml-auto">{member.caption}</small>
          )}
        </div>
      </div>
    </div>
  );
}

interface CollaboratorCardProps {
  collaborator: TeamMember;
  helpers: any;
  onUploadImage?: (file: File, oldUrl?: string) => Promise<string | undefined>;
}

function CollaboratorCard({
  collaborator,
  helpers,
  onUploadImage,
}: CollaboratorCardProps) {
  const { isAdmin } = useAuthContext();

  const [editedCollaborator, setEditedCollaborator] = useState(collaborator);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!helpers.isEditing) setEditedCollaborator(collaborator);
  }, [collaborator, helpers.isEditing]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    setIsUploading(true);
    try {
      const newUrl = await onUploadImage(file, editedCollaborator.image);
      if (newUrl) {
        setEditedCollaborator({ ...editedCollaborator, image: newUrl });
      }
    } catch (error) {
      console.error("Error al subir:", error);
      alert("Error al subir la imagen.");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  if (helpers.isEditing) {
    return (
      <div className="bg-white border-0 shadow rounded-lg border-l-4 border-[#2FA4FF] pl-4">
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Nombre</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedCollaborator.name}
              onChange={(e) =>
                setEditedCollaborator({
                  ...editedCollaborator,
                  name: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">Descripción</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedCollaborator.caption}
              onChange={(e) =>
                setEditedCollaborator({
                  ...editedCollaborator,
                  caption: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-1">
              Área/Departamento (opcional)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editedCollaborator.description || ""}
              onChange={(e) =>
                setEditedCollaborator({
                  ...editedCollaborator,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-2 ml-1">
              Foto / Logo del Colaborador
            </label>

            <div className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors relative">
              {isUploading && (
                <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-lg">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                  <span className="text-xs text-blue-600 font-medium">
                    Subiendo...
                  </span>
                </div>
              )}

              {editedCollaborator.image &&
              !editedCollaborator.image.includes("via.placeholder.com") ? (
                <div className="mb-3 w-full flex justify-center">
                  <img
                    src={editedCollaborator.image}
                    alt="Preview"
                    className="max-h-16 w-auto object-contain filter drop-shadow-sm rounded-md"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/140x40?text=Error";
                    }}
                  />
                </div>
              ) : (
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              )}

              <label className="cursor-pointer">
                <span className="bg-white px-3 py-1.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                  {editedCollaborator.image &&
                  !editedCollaborator.image.includes("via.placeholder.com")
                    ? "Cambiar imagen"
                    : "Subir archivo"}
                </span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
              onClick={helpers.onCancelEdit}
            >
              Cancelar
            </button>
            <button
              className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
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
    <div className="bg-white border-0 shadow rounded-lg h-full border-l-4 border-blue-500 relative">
      {isAdmin && (
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
      <div className="p-6 text-left">
        {collaborator.image && (
          <div className="mb-6 flex justify-start">
            <div className="p-3 border rounded-lg bg-white shadow-sm max-w-37.5">
              <img
                src={collaborator.image}
                alt={collaborator.name}
                className="w-full max-h-20 object-contain"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://media.istockphoto.com/id/1311598658/photo/businessman-trading-online-stock-market-on-teblet-screen-digital-investment-concept.jpg?s=1024x1024&w=is&k=20&c=JZprgGDQ8xqa6iu0fyKJfKOlAvae0w9U-AdHeCT2kg4=";
                }}
              />
            </div>
          </div>
        )}

        <h5 className="text-base font-bold text-gray-900 mb-2">
          {collaborator.name}
        </h5>
        <p className="text-sm text-gray-600 mb-4">{collaborator.caption}</p>

        {collaborator.description && (
          <div className="rounded-lg px-2 py-1 bg-gray-100">
            <small className="font-semibold">{collaborator.description}</small>
          </div>
        )}
      </div>
    </div>
  );
}
