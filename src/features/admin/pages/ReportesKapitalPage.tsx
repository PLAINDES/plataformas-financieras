import { useEffect, useState } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useNavigate } from "react-router-dom";
import { MainService } from "@/shared/services/main.service";
import type { Report } from "@/shared/types";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-gray-400">
        Cargando reportes...
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">{error}</div>;
  }

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 flex justify-between">
        <div>
          <h1 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
            Reportes
          </h1>
          <h3 className="text-sm font-medium text-gray-500">
            Administración de reportes.
          </h3>
        </div>
      </header>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("kapital")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === "kapital"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              Kapital
            </button>
            <button
              onClick={() => setActiveTab("valora")}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === "valora"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200"
              }`}
            >
              Valora
            </button>
          </div>
        </div>
        <SimpleTable<Report>
          data={data}
          columns={[
            { header: "ID", accessorKey: "id" },
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
          onCreate={handleCreate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  );
};
