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
    });
    const { isAdmin: _isAdmin } = useAuthContext();
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

    const sectionBg = {
        background: "linear-gradient(to bottom right, #f8f9fa, #e9ecef)",
    };

    return (
        <section
            className="min-h-[80vh] flex flex-col justify-start py-10 md:py-16 overflow-hidden relative"
            id="equipo"
            style={sectionBg}
        >
            <div className="container mx-auto relative z-10 px-3 md:px-4">
                {/* Header Editable */}
                <div className="text-left mb-8 md:mb-12">
                    <EditableText
                        content={{
                            value: content?.title || "",
                            id: "title",
                            type: "text",
                            section: "team",
                        }}
                        onSave={handleSaveTitle}
                        as="h2"
                        className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-4"
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
                        className="text-sm md:text-lg font-normal text-gray-600 max-w-2xl"
                    />
                </div>

                {/* Versión Desktop - Grid Principal */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-12 items-start">
                    {/* COLUMNA IZQUIERDA: Autores */}
                    <div>
                        <div className="flex items-center mb-8">
                            <h3 className="text-2xl font-bold m-0 border-b-2 border-blue-500 pb-2">Autores</h3>
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
                            className="flex flex-col gap-6"
                            renderItem={(author, index, helpers) => (
                                <AuthorCard key={index} author={author} helpers={helpers} />
                            )}
                        />
                    </div>

                    {/* COLUMNA DERECHA: Equipo de Desarrollo */}
                    <div>
                        <div className="flex items-center mb-8">
                            <h3 className="text-2xl font-bold m-0 border-b-2 border-blue-500 pb-2">Equipo de Desarrollo</h3>
                        </div>

                        <div className="bg-white border-0 shadow-md rounded-xl overflow-hidden">
                            <div className="p-4 md:p-6">
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
                                    className="divide-y divide-gray-100"
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

                {/* Versión Mobile - Acordeón */}
                <div className="lg:hidden">
                    {/* Acordeón Autores */}
                    <div className="mb-6">
                        <button
                            className="w-full text-left p-0 border-0 bg-transparent"
                            onClick={() => toggleSection("authors")}
                        >
                            <div className="bg-white border-0 shadow-md rounded-xl w-full">
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold m-0 text-gray-900">
                                            Autores
                                        </h3>
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-blue-500"
                                            style={{
                                                transform: openSections["authors"]
                                                    ? "rotate(180deg)"
                                                    : "rotate(0deg)",
                                                transition: "transform 0.3s ease",
                                            }}
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {openSections["authors"] && (
                            <div className="mt-4 animate-fade-in space-y-4">
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
                    <div className="mb-6">
                        <button
                            className="w-full text-left p-0 border-0 bg-transparent"
                            onClick={() => toggleSection("development")}
                        >
                            <div className="bg-white border-0 shadow-md rounded-xl w-full">
                                <div className="p-5">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-bold m-0 text-gray-900">
                                            Equipo de Desarrollo
                                        </h3>
                                        <svg
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="text-blue-500"
                                            style={{
                                                transform: openSections["development"]
                                                    ? "rotate(180deg)"
                                                    : "rotate(0deg)",
                                                transition: "transform 0.3s ease",
                                            }}
                                        >
                                            <polyline points="6 9 12 15 18 9"></polyline>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </button>

                        {openSections["development"] && (
                            <div className="mt-4 animate-fade-in">
                                <div className="bg-white border-0 shadow-md rounded-xl overflow-hidden">
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
                                            className="divide-y divide-gray-100"
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

