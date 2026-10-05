import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Layers, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MainService } from "@/shared/services/main.service";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";
import { CardGallerySkeleton } from "../components/Skeleton";

type Product = "kapital" | "valora";
type Cover = {
  id: number;
  nombre: string;
  producto?: Product | null;
  tipo: string;
  portada?: { url?: string } | null;
  imagen_central?: { url?: string } | null;
  primer_imagen_footer?: { url?: string } | null;
  segundo_imagen_footer?: { url?: string } | null;
  logo_superior?: { url?: string } | null;
  logo_inferior?: { url?: string } | null;
  imagen_fondo?: { url?: string } | null;
};
const imageCache = new Map<string, Promise<string>>();
const getCoverImage = (url: string) => {
  const cached = imageCache.get(url);
  if (cached) return cached;
  const request = (async () => {
    const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
    const response = await fetch(
      /^https?:\/\//i.test(url) ? url : `${base}${url}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
        },
      }
    );
    if (!response.ok) throw new Error("No se pudo cargar la portada");
    return URL.createObjectURL(await response.blob());
  })();
  imageCache.set(url, request);
  request.catch(() => imageCache.delete(url));
  return request;
};
const CoverImage = ({ url, alt }: { url?: string; alt: string }) => {
  const [src, setSrc] = useState<string>();
  useEffect(() => {
    let cancelled = false;
    if (!url) return;
    void getCoverImage(url).then((value) => {
      if (!cancelled) setSrc(value);
    });
    return () => {
      cancelled = true;
    };
  }, [url]);
  return src ? (
    <img src={src} alt={alt} className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      Cargando...
    </div>
  );
};
const coverImageUrl = (cover: Cover) =>
  cover.imagen_central?.url ||
  cover.portada?.url ||
  cover.primer_imagen_footer?.url ||
  cover.imagen_fondo?.url;

const coverImages = (cover: Cover) =>
  [
    cover.portada?.url,
    cover.imagen_central?.url,
    cover.primer_imagen_footer?.url,
    cover.segundo_imagen_footer?.url,
    cover.logo_superior?.url,
    cover.logo_inferior?.url,
    cover.imagen_fondo?.url,
  ].filter(Boolean) as string[];

function CoverPreview({
  cover,
  onClose,
}: {
  cover: Cover;
  onClose: () => void;
}) {
  const images = coverImages(cover);
  const [index, setIndex] = useState(0);
  const [sources, setSources] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(images.map((image) => getCoverImage(image))).then((values) => {
      if (!cancelled) setSources(values);
    });
    return () => {
      cancelled = true;
    };
  }, [cover.id]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full flex-col items-center justify-center gap-4"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 z-10 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex min-h-0 max-w-full flex-1 items-center justify-center overflow-hidden">
          {sources[index] && (
            <img
              src={sources[index]}
              alt={cover.nombre}
              className="max-h-[calc(100vh-96px)] max-w-full rounded-xl object-contain"
            />
          )}
        </div>
        {sources.length > 1 && (
          <div className="flex max-w-full items-center gap-3 overflow-x-auto pb-1">
            {sources.map((source, thumbnailIndex) => (
              <button
                key={source}
                type="button"
                onClick={() => setIndex(thumbnailIndex)}
                className={`h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 bg-slate-900 ${thumbnailIndex === index ? "border-white" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <img
                  src={source}
                  alt={`Vista ${thumbnailIndex + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCarousel({
  product,
  covers,
  onEdit,
  onDelete,
  onPreview,
}: {
  product: Product;
  covers: Cover[];
  onEdit: (cover: Cover) => void;
  onDelete: (cover: Cover) => void;
  onPreview: (cover: Cover) => void;
}) {
  const [index, setIndex] = useState(0);
  const current = covers[index];
  const color = product === "kapital" ? "blue" : "violet";
  const productLogo =
    product === "kapital"
      ? "/images/logo-kapital.png"
      : "/images/logo-valora.png";
  if (!current)
    return (
      <section
        className={`rounded-2xl border border-${color}-200 bg-${color}-50/60 p-6`}
      >
        <img
          src={productLogo}
          alt={`Logo ${product}`}
          className="h-14 max-w-[220px] object-contain object-left"
        />
        <div className="mt-5 flex min-h-[390px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/70 text-sm text-slate-500">
          Aún no hay portadas registradas.
        </div>
      </section>
    );
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-${color}-200 bg-gradient-to-br from-${color}-50/70 via-white to-slate-50 p-5 shadow-sm`}
    >
      <div className="mb-5 flex items-center justify-between">
        <img
          src={productLogo}
          alt={`Logo ${product}`}
          className="h-14 max-w-[220px] object-contain object-left"
        />
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
          {index + 1} / {covers.length}
        </span>
      </div>
      <div className="flex min-h-[clamp(560px,62vw,800px)] items-center justify-center">
        <div className="relative h-[clamp(520px,54vw,680px)] w-full">
          <div className="pointer-events-none absolute inset-x-0 top-8 z-20 h-[clamp(470px,49vw,620px)] bg-gradient-to-r from-white via-transparent to-white" />
          {covers
            .slice(index)
            .concat(covers.slice(0, index))
            .slice(0, 3)
            .map((cover, layer) => (
              <div
                key={cover.id}
                className={`absolute left-1/2 top-0 h-[clamp(520px,54vw,680px)] w-[clamp(270px,30vw,390px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl transition-all duration-300 ${layer === 0 ? "z-30" : "z-10 opacity-45 blur-[2px]"}`}
                style={{
                  transform:
                    layer === 0
                      ? "translateX(-50%) scale(1)"
                      : covers.length === 2
                        ? "translateX(-50%) translateY(24px) scale(.86)"
                        : `translateX(calc(-50% + ${layer === 1 ? "-250px" : "250px"})) translateY(24px) scale(.82)`,
                }}
              >
                <div
                  className="h-[clamp(390px,43vw,550px)] cursor-pointer bg-slate-100"
                  onClick={() => onPreview(cover)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) =>
                    event.key === "Enter" && onPreview(cover)
                  }
                >
                  <CoverImage url={coverImageUrl(cover)} alt={cover.nombre} />
                </div>
                <div className="p-4">
                  <h3 className="truncate text-sm font-bold text-slate-900">
                    {cover.nombre}
                  </h3>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {cover.tipo.replace("_", " ")}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onEdit(cover)}
                      className="flex-1 cursor-pointer rounded-lg bg-blue-50 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete(cover)}
                      className="flex-1 cursor-pointer rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      {covers.length > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() =>
              setIndex((value) => (value - 1 + covers.length) % covers.length)
            }
            className="cursor-pointer rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-transform hover:scale-105"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-500">Explora las portadas</span>
          <button
            onClick={() => setIndex((value) => (value + 1) % covers.length)}
            className="cursor-pointer rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-transform hover:scale-105"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}

export default function PortadasPage() {
  const navigate = useNavigate();
  const [covers, setCovers] = useState<Cover[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Cover | null>(null);
  const [previewCover, setPreviewCover] = useState<Cover | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const grouped = useMemo(
    () => ({
      kapital: covers.filter((cover) => cover.producto === "kapital"),
      valora: covers.filter((cover) => cover.producto === "valora"),
    }),
    [covers]
  );
  useEffect(() => {
    MainService.getCovers()
      .then(setCovers)
      .finally(() => setLoading(false));
  }, []);
  const deleteCover = async () => {
    if (!modal || isDeleting) return;
    setIsDeleting(true);
    try {
      const deletedId = modal.id;
      await MainService.deleteCover(deletedId);
      setCovers((items) => items.filter((item) => item.id !== deletedId));
      setModal(null);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <>
      <header className="flex justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-800 sm:text-xs">
            Portadas
          </p>
          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            Administración de portadas
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/portadas/nuevo")}
          className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-700"
        >
          <Plus className="h-4 w-4" />
          Crear
        </button>
      </header>
      <main className="bg-slate-100/80 p-4 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Layers className="h-5 w-5 text-slate-500" />
          <p className="text-sm text-slate-600">
            Selecciona y administra las portadas disponibles para cada producto.
          </p>
        </div>
        {loading ? (
          <CardGallerySkeleton count={2} />
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <ProductCarousel
              product="kapital"
              covers={grouped.kapital}
              onEdit={(cover) => navigate(`/admin/portadas/${cover.id}/editar`)}
              onDelete={setModal}
              onPreview={setPreviewCover}
            />
            <ProductCarousel
              product="valora"
              covers={grouped.valora}
              onEdit={(cover) => navigate(`/admin/portadas/${cover.id}/editar`)}
              onDelete={setModal}
              onPreview={setPreviewCover}
            />
          </div>
        )}
      </main>
      {modal && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModal(null)}
          onConfirm={deleteCover}
          title="¿Eliminar portada?"
          description="Esta acción no se puede deshacer."
          confirmText="Eliminar"
          variant="destructive"
          isLoading={isDeleting}
        />
      )}
      {previewCover && (
        <CoverPreview
          cover={previewCover}
          onClose={() => setPreviewCover(null)}
        />
      )}
    </>
  );
}
