import React, { useState } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useNavigate } from "react-router-dom";

interface Reporte {
  id: number;
  nombre: string;
  cliente: string;
  fecha_generacion: string;
  monto: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
}

const INITIAL_DATA: Reporte[] = [
  {
    id: 101,
    nombre: "Análisis de Inversión Q1",
    cliente: "Tech Solutions Inc.",
    fecha_generacion: "2023-04-01",
    monto: "$50,000",
    estado: "Aprobado",
  },
  {
    id: 102,
    nombre: "Evaluación de Riesgos",
    cliente: "Global Trade Ltd.",
    fecha_generacion: "2023-04-05",
    monto: "$120,000",
    estado: "Pendiente",
  },
  {
    id: 103,
    nombre: "Proyección Financiera 2024",
    cliente: "Retail Corp",
    fecha_generacion: "2023-04-10",
    monto: "$75,500",
    estado: "Rechazado",
  },
];

export const ReportesKapitalPage = () => {
  const [data, setData] = useState<Reporte[]>(INITIAL_DATA);
  const navigate = useNavigate();

  const handleCreate = () => {
    const newReporte: Reporte = {
      id: Date.now(),
      nombre: `Reporte Kapital ${data.length + 1}`,
      cliente: "Nuevo Cliente",
      fecha_generacion: new Date().toISOString().split("T")[0],
      monto: "$0",
      estado: "Pendiente",
    };
    setData([...data, newReporte]);
  };



  const handleEdit = (item: Reporte) => {
    navigate(`/admin/kapital/reportes/${item.id}/editar`);
  };

  const handleDelete = (item: Reporte) => {
    if (confirm(`¿Estás seguro de eliminar el reporte ${item.nombre}?`)) {
      setData(data.filter((r) => r.id !== item.id));
    }
  };

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
          { header: "Nombre del Reporte", accessorKey: "nombre" },
          { header: "Cliente", accessorKey: "cliente" },
          { header: "Fecha", accessorKey: "fecha_generacion" },
          { header: "Monto", accessorKey: "monto" },
          {
            header: "Estado",
            accessorKey: "estado",
            cell: (item) => {
              let color = "bg-gray-100 text-gray-800";
              if (item.estado === "Aprobado")
                color = "bg-green-100 text-green-800";
              if (item.estado === "Rechazado")
                color = "bg-red-100 text-red-800";
              if (item.estado === "Pendiente")
                color = "bg-yellow-100 text-yellow-800";

              return (
                <span
                  className={`px-2 py-1 text-xs rounded-full font-semibold ${color}`}
                >
                  {item.estado}
                </span>
              );
            },
          },
        ]}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
