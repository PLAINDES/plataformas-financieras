import { useState } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";

interface Plantilla {
  id: number;
  nombre: string;
  tipo: string;
  estado: "Activo" | "Inactivo";
  fecha_creacion: string;
}

const INITIAL_DATA: Plantilla[] = [
  {
    id: 1,
    nombre: "Plantilla Balance General",
    tipo: "Financiero",
    estado: "Activo",
    fecha_creacion: "2023-01-15",
  },
  {
    id: 2,
    nombre: "Plantilla Estado de Resultados",
    tipo: "Financiero",
    estado: "Activo",
    fecha_creacion: "2023-02-20",
  },
  {
    id: 3,
    nombre: "Plantilla Flujo de Caja",
    tipo: "Tesorería",
    estado: "Inactivo",
    fecha_creacion: "2023-03-10",
  },
];

export const PlantillasMaestrasPage = () => {
  const [data, setData] = useState<Plantilla[]>(INITIAL_DATA);

  const handleCreate = () => {
    const newPlantilla: Plantilla = {
      id: Date.now(),
      nombre: `Nueva Plantilla ${data.length + 1}`,
      tipo: "General",
      estado: "Activo",
      fecha_creacion: new Date().toISOString().split("T")[0],
    };
    setData([...data, newPlantilla]);
  };

  const handleEdit = (item: Plantilla) => {
    alert(`Editar plantilla: ${item.nombre}`);
    // Lógica para abrir modal de edición
  };

  const handleDelete = (item: Plantilla) => {
    if (confirm(`¿Estás seguro de eliminar la plantilla ${item.nombre}?`)) {
      setData(data.filter((p) => p.id !== item.id));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Plantillas Maestras
        </h1>
        <p className="text-gray-500">
          Gestión de plantillas base para reportes y documentos.
        </p>
      </div>

      <SimpleTable
        data={data}
        columns={[
          { header: "ID", accessorKey: "id" },
          { header: "Nombre", accessorKey: "nombre" },
          { header: "Tipo", accessorKey: "tipo" },
          {
            header: "Estado",
            accessorKey: "estado",
            cell: (item) => (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  item.estado === "Activo"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {item.estado}
              </span>
            ),
          },
          { header: "Fecha Creación", accessorKey: "fecha_creacion" },
        ]}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
