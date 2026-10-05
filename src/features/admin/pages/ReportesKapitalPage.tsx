import { useEffect, useState } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useNavigate } from "react-router-dom";
import { MainService } from "@/shared/services/main.service";
import type { Report } from "@/shared/types";
import { TableSkeleton } from "../components/Skeleton";
import { FileText, FlaskConical, Plus, Sparkles } from "lucide-react";

const ReportCoverImage = ({ url, alt }: { url?: string; alt: string }) => {
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
    fetch(/^https?:\/\//i.test(url) ? url : `${base}${url}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token") || ""}`,
      },
    })
      .then((response) => (response.ok ? response.blob() : Promise.reject()))
      .then((blob) => {
        if (!cancelled) setSrc(URL.createObjectURL(blob));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [url]);

  return src ? (
    <img
      src={src}
      alt={alt}
      className="h-14 w-10 rounded object-cover shadow-sm"
    />
  ) : (
    <div className="h-14 w-10 rounded bg-slate-100" aria-label={alt} />
  );
};

export const ReportesKapitalPage = () => {
  const [activeTab, setActiveTab] = useState<"kapital" | "valora">("kapital");
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState<number>(50);
  const [page] = useState<number>(1);
  const [search] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        // Validate params
        const validatedLimit = Number.isFinite(limit)
          ? Math.min(Math.max(limit, 1), 500)
          : 50;
        const validatedPage = Number.isFinite(page) && page > 0 ? page : 1;
        const validatedSearch =
          typeof search === "string" && search.trim() !== ""
            ? search.trim()
            : undefined;
        const validatedType = activeTab === "kapital" ? "kapital" : "valora";

        const params: any = {
          limit: validatedLimit,
          page: validatedPage,
          type: validatedType,
        };

        if (validatedSearch) params.search = validatedSearch;

        const res = await MainService.getReports(params);
        setData(res);
      } catch (err) {
        setError("No se pudieron cargar los reportes.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [activeTab, limit, page, search]);

  const handleCreate = () => {
    navigate("/admin/reportes/nuevo");
  };

  const handleEdit = (item: Report) => {
    navigate(`/admin/reportes/${item.id}/editar`);
  };

  const handleDelete = async (item: Report) => {
    if (!confirm(`¿Estás seguro de eliminar "${item.nombre}"?`)) return;
    try {
      // wire up delete endpoint when available
      setData((prev) => prev.filter((r) => r.id !== item.id));
    } catch {
      alert("Error al eliminar el reporte.");
    }
  };

  const isSensitizedReport = (report: Report) =>
    /sensibilizad/i.test(report.nombre);

  const specializedReports = data.filter(
    (report) => !isSensitizedReport(report)
  );
  const sensitizedReports = data.filter(isSensitizedReport);

  if (loading) {
    return <TableSkeleton rows={4} cols={5} />;
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>;
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-800 sm:text-xs">
              Reportes
            </p>
            <p className="text-xs font-medium text-gray-500 sm:text-sm">
              Administración de reportes
            </p>
          </div>
          <div className="flex gap-2">
            {(["kapital", "valora"] as const).map((product) => (
              <button
                key={product}
                onClick={() => setActiveTab(product)}
                className={`rounded-md border px-4 py-2 text-sm font-medium ${
                  activeTab === product
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-gray-200 bg-white text-gray-700"
                }`}
              >
                {product[0].toUpperCase() + product.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>
      <div className="bg-slate-100/80 p-4 md:p-8">
        <div className="grid items-stretch gap-6 xl:grid-cols-2">
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Reportes especializados
                  </h2>
                </div>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                  Reportes estándar disponibles para publicación y
                  administración financiera de Kapital y Valora.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {specializedReports.length}{" "}
                  {specializedReports.length === 1 ? "reporte" : "reportes"}
                </span>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
                >
                  Crear
                </button>
              </div>
            </div>
            <SimpleTable<Report>
              data={specializedReports}
              className="mx-auto w-fit max-w-full [&_th]:text-center [&_td]:text-center"
              columns={[
                {
                  header: "Portada",
                  cell: (item) => (
                    <div className="flex items-center justify-center gap-2">
                      <ReportCoverImage
                        url={item.portada?.portada?.url}
                        alt={item.portada?.nombre ?? "Portada"}
                      />
                    </div>
                  ),
                },
                { header: "Reporte", accessorKey: "nombre" },
                {
                  header: "Precio",
                  accessorKey: "precio",
                  cell: (item) =>
                    item.precio != null
                      ? `${item.precio.toLocaleString("es-PE", { minimumFractionDigits: 2 })} ${item.moneda}`
                      : "—",
                },
                {
                  header: "Fecha",
                  accessorKey: "created_at",
                  cell: (item) =>
                    new Date(item.created_at).toLocaleDateString("es-PE"),
                },
                {
                  header: "Sector",
                  accessorKey: "sector_empresa",
                  cell: (item) => item.sector_empresa ?? "—",
                },
                {
                  header: "Estado",
                  accessorKey: "activo",
                  cell: (item) => (
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-semibold ${
                        item.activo
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {item.activo ? "Activo" : "Inactivo"}
                    </span>
                  ),
                },
              ]}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </section>

          <section className="relative min-h-[430px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
            <div className="relative mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FlaskConical className="h-4 w-4" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">
                    Reportes sensibilizados
                  </h2>
                </div>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-slate-500">
                  Formatos y registros generados a partir de escenarios de
                  sensibilidad de Kapital y Valora.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {sensitizedReports.length}{" "}
                  {sensitizedReports.length === 1 ? "reporte" : "reportes"}
                </span>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
                >
                  Crear
                </button>
              </div>
            </div>

            {sensitizedReports.length > 0 ? (
              <div className="relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
                <SimpleTable<Report>
                  data={sensitizedReports}
                  className="mx-auto w-fit max-w-full [&_th]:text-center [&_td]:text-center"
                  columns={[
                    {
                      header: "Portada",
                      cell: (item) => (
                        <div className="flex items-center justify-center gap-2">
                          <ReportCoverImage
                            url={item.portada?.portada?.url}
                            alt={item.portada?.nombre ?? "Portada"}
                          />
                        </div>
                      ),
                    },
                    { header: "Reporte", accessorKey: "nombre" },
                    {
                      header: "Precio",
                      accessorKey: "precio",
                      cell: (item) =>
                        item.precio != null
                          ? `${item.precio.toLocaleString("es-PE", { minimumFractionDigits: 2 })} ${item.moneda}`
                          : "—",
                    },
                    {
                      header: "Estado",
                      accessorKey: "activo",
                      cell: (item) => (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                          {item.activo ? "Activo" : "Inactivo"}
                        </span>
                      ),
                    },
                  ]}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </div>
            ) : (
              <div className="relative mt-8 flex min-h-[290px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">
                  Aún no hay formatos sensibilizados
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">
                  Crea una plantilla base para guardar los reportes producidos
                  después de una sensibilidad.
                </p>
                <button
                  type="button"
                  onClick={handleCreate}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Crear formato
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};
