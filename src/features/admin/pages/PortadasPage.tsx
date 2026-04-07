import { MainService } from "@/shared/services/main.service";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";

type Cover = {
  id: number;
  nombre: string;
  tipo: string;
  portada?: { id: number; url?: string; filename?: string } | null;
  primer_imagen_footer?: { id: number; url?: string } | null;
  segundo_imagen_footer?: { id: number; url?: string } | null;
  logo_superior?: { id: number; url?: string } | null;
  imagen_central?: { id: number; url?: string } | null;
  logo_inferior?: { id: number; url?: string } | null;
  imagen_fondo?: { id: number; url?: string } | null;
};

const CoverImage: React.FC<{ url: string; alt: string }> = ({ url, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="text-gray-400 text-sm">Error al cargar la imagen</div>
    );
  }

  return (
    <img
      src={url}
      alt={alt}
      className="object-cover h-full w-full"
      onError={() => setHasError(true)}
    />
  );
};

const PortadasPage: React.FC = () => {
  const [covers, setCovers] = useState<Cover[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    onConfirm?: () => Promise<void> | void;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    isLoading?: boolean;
  }>({ isOpen: false, title: "" });

  const closeModal = () =>
    setModalState((prev) => ({ ...prev, isOpen: false }));
  // Gallery state for carousel
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);

  const openGallery = (images: string[], start = 0) => {
    if (!images || images.length === 0) return;
    setGalleryImages(images);
    setGalleryIndex(start);
    setGalleryOpen(true);
  };

  const closeGallery = () => setGalleryOpen(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // la API expone /main/covers
        const data = await MainService.getCovers();
        setCovers(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const navigate = useNavigate();

  const handleDelete = (id: number) => {
    setModalState({
      isOpen: true,
      title: "¿Eliminar portada?",
      description: "Esta acción no se puede deshacer.",
      onConfirm: async () => {
        setModalState((prev) => ({ ...prev, isLoading: true }));
        setDeletingIds((s) => [...s, id]);
        try {
          await MainService.deleteCover(id);
          setCovers((prev) => prev.filter((c) => c.id !== id));
        } catch (e) {
          console.error("Error eliminando portada:", e);
          alert(
            "No se pudo eliminar la portada. Revisa la consola para más detalles."
          );
        } finally {
          setDeletingIds((s) => s.filter((x) => x !== id));
          setModalState((prev) => ({ ...prev, isLoading: false }));
          closeModal();
        }
      },
      confirmText: "Eliminar",
      variant: "destructive",
    });
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 flex justify-between">
        <div>
          <h1 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
            Portadas
          </h1>
          <h3 className="text-sm font-medium text-gray-500">
            Administración de portadas
          </h3>
        </div>
        <button
          onClick={() => navigate("/admin/portadas/nuevo")}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          Crear
        </button>
      </header>
      <div className="p-6 pb-0">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">
              Galería de Portadas
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400">
              Cargando portadas...
            </div>
          ) : covers.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              No hay portadas
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 bg-gray-50/50">
              {covers.map((c) => (
                <div
                  key={c.id}
                  className="relative rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col"
                >
                  <div
                    className="w-full aspect-[1/1.414] bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
                    onClick={() => {
                      // Collect all image urls for the carousel in a consistent order
                      const imgs = [
                        c.portada?.url,
                        c.imagen_central?.url,
                        c.primer_imagen_footer?.url,
                        c.segundo_imagen_footer?.url,
                        c.logo_superior?.url,
                        c.logo_inferior?.url,
                        c.imagen_fondo?.url,
                      ].filter(Boolean) as string[];
                      openGallery(imgs, 0);
                    }}
                  >
                    {c.portada && c.portada.url ? (
                      <CoverImage url={c.portada.url} alt={c.nombre} />
                    ) : c.imagen_central && c.imagen_central.url ? (
                      <CoverImage url={c.imagen_central.url} alt={c.nombre} />
                    ) : (
                      <div className="text-gray-400 text-sm">Sin imagen</div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100 flex flex-col justify-between gap-3 flex-grow">
                    <div>
                      <div
                        className="text-sm font-bold text-gray-900 line-clamp-1"
                        title={c.nombre}
                      >
                        {c.nombre}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {c.tipo.replace("_", " ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/portadas/${c.id}/editar`)
                        }
                        className="text-xs font-medium px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors w-full"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingIds.includes(c.id)}
                        className="text-xs font-medium px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors w-full"
                      >
                        {deletingIds.includes(c.id)
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </div>
                  </div>
                  {modalState.isOpen && (
                    <ConfirmationModal
                      isOpen={modalState.isOpen}
                      onClose={closeModal}
                      onConfirm={async () => {
                        if (modalState.onConfirm) {
                          setModalState((prev) => ({
                            ...prev,
                            isLoading: true,
                          }));
                          try {
                            await modalState.onConfirm();
                          } finally {
                            setModalState((prev) => ({
                              ...prev,
                              isLoading: false,
                            }));
                          }
                        }
                      }}
                      title={modalState.title}
                      description={modalState.description}
                      confirmText={modalState.confirmText}
                      variant={modalState.variant}
                      isLoading={modalState.isLoading}
                    />
                  )}
                  {galleryOpen && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                      onClick={closeGallery}
                    >
                      <div className="relative max-h-[90vh] max-w-[90vw] flex items-center">
                        <img
                          src={galleryImages[galleryIndex]}
                          alt={`Imagen ${galleryIndex + 1}`}
                          className="rounded-xl object-contain max-h-[90vh] max-w-[80vw]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      {/* Thumbnails */}
                      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 ">
                        {galleryImages.map((src, i) => (
                          <button
                            key={src}
                            onClick={(e) => {
                              e.stopPropagation();
                              setGalleryIndex(i);
                            }}
                            className={`rounded-md overflow-hidden border-2 p-1 ${
                              i === galleryIndex
                                ? "border-white"
                                : "border-transparent hover:border-gray-300"
                            }`}
                          >
                            <img
                              src={src}
                              className="h-12 w-20 object-cover rounded"
                              alt={`thumb-${i}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PortadasPage;
