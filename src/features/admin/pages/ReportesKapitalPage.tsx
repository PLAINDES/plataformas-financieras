import React, { useEffect, useState } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useNavigate } from "react-router-dom";
import { MainService } from "@/shared/services/main.service";
import type { Report } from "@/shared/types";



export const ReportesKapitalPage = () => {
  const [data, setData] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    MainService.getReports()
      .then(setData)
      .catch(() => setError("No se pudieron cargar los reportes."))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = () => {
    navigate("/admin/kapital/reportes/nuevo");
  };

  const handleEdit = (item: Report) => {
    navigate(`/admin/kapital/reportes/${item.id}/editar`);
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
    return (
      <div className="p-6 text-sm text-red-500">{error}</div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes Kapital</h1>
        <p className="text-gray-500">
          Administración de reportes financieros para Kapital.
        </p>
      </div>

      <SimpleTable
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
          }
        ]}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
