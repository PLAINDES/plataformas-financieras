import { useState } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";

interface ReporteValora {
  id: number;
  titulo: string;
  autor: string;
  fecha: string;
  categoria: string;
  visibilidad: "Público" | "Privado";
}

const INITIAL_DATA: ReporteValora[] = [
  {
    id: 201,
    titulo: "Valuación de Activos Inmobiliarios",
    autor: "Ana Gómez",
    fecha: "2023-05-15",
    categoria: "Inmobiliario",
    visibilidad: "Privado",
  },
  {
    id: 202,
    titulo: "Análisis de Mercado Bursátil",
    autor: "Carlos Ruiz",
    fecha: "2023-05-18",
    categoria: "Mercados",
    visibilidad: "Público",
  },
  {
    id: 203,
    titulo: "Due Diligence - Proyecto Solar",
    autor: "Elena T.",
    fecha: "2023-06-01",
    categoria: "Energía",
    visibilidad: "Privado",
  },
];

export const ReportesValoraPage = () => {
  const [data, setData] = useState<ReporteValora[]>(INITIAL_DATA);

  const handleCreate = () => {
    const newReporte: ReporteValora = {
      id: Date.now(),
      titulo: `Nuevo Análisis Valora ${data.length + 1}`,
      autor: "Autor Desconocido",
      fecha: new Date().toISOString().split("T")[0],
      categoria: "General",
      visibilidad: "Privado",
    };
    setData([...data, newReporte]);
  };

  const handleEdit = (item: ReporteValora) => {
    alert(`Editar análisis: ${item.titulo}`);
  };

  const handleDelete = (item: ReporteValora) => {
    if (confirm(`¿Estás seguro de eliminar "${item.titulo}"?`)) {
      setData(data.filter((r) => r.id !== item.id));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reportes Valora</h1>
        <p className="text-gray-500">
          Gestión de análisis y reportes de la división Valora.
        </p>
      </div>

      <SimpleTable
        data={data}
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Título", accessorKey: "titulo" },
          { header: "Autor", accessorKey: "autor" },
          { header: "Fecha", accessorKey: "fecha" },
          { header: "Categoría", accessorKey: "categoria" },
          {
            header: "Visibilidad",
            accessorKey: "visibilidad",
            cell: (item) => (
              <span
                className={`px-2 py-1 text-xs rounded-full font-semibold ${
                  item.visibilidad === "Público"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {item.visibilidad}
              </span>
            ),
          },
        ]}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
