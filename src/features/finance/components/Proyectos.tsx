import React, { useState, useEffect } from "react";
import type { Calculation } from "@/shared/types";
import { Link } from "react-router-dom";
import { Plus, FolderKanban, Trash2, Eye } from "lucide-react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useNavigate } from "react-router-dom";
import { MainService } from "@/shared/services/main.service";
import { formatToPeruTime } from "../kapital/services/kapital.utils";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index?: number) => React.ReactNode;
}

interface ProyectosProps {
  userId?: number;
}

const PAGE_SIZE = 10;

type Tab = "valora" | "kapital";

export const Proyectos: React.FC<ProyectosProps> = ({ userId }) => {
  const navigate = useNavigate();

  // Estados de datos controlados por el Backend
  const [data, setData] = useState<Calculation[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de control de la vista
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const [tab, setTab] = useState<Tab>("valora");
  const [pendingDelete, setPendingDelete] = useState<Calculation | null>(null);

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Resetear a la página 1 al buscar
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const loadCalculations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await MainService.getCalculations({
        userId,
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
        type: tab,
      });

      setData(response.items);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (err) {
      console.error(err);
      setError("Error al cargar los proyectos.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalculations();
  }, [page, debouncedSearch, tab, userId]);

  const hasSensibilizacion = (c: Calculation): boolean => {
    if (!c.data || !c.data.sensibilizacion) return false;
    return (
      Array.isArray(c.data.sensibilizacion) && c.data.sensibilizacion.length > 0
    );
  };

  const accionesCell = (c: Calculation): React.ReactNode => (
    <div className="flex items-center justify-center gap-1">
      <Link
        to={`/${c.type}/${c.code}`}
        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-200 hover:text-blue-700 transition-colors"
        title="Ver proyecto"
      >
        <Eye size={15} strokeWidth={2} />
      </Link>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Evitar navegación al abrir modal de borrar
          setPendingDelete(c);
        }}
        className="cursor-pointer size-8 inline-flex items-center justify-center rounded-lg text-red-400 hover:bg-red-200 hover:text-red-600 transition-colors"
        title="Eliminar proyecto"
      >
        <Trash2 size={15} strokeWidth={2} />
      </button>
    </div>
  );

  const getBaseColumns = (): Column<Calculation>[] => [
    {
      header: "N°",
      cell: (_, index) => (
        <span className="text-gray-400 font-medium tabular-nums">
          {index !== undefined ? (page - 1) * PAGE_SIZE + index + 1 : "-"}
        </span>
      ),
    },
    {
      header: "Proyecto",
      cell: (c) => (
        <span className="font-mono text-gray-800 font-medium tracking-tight text-xs">
          {c.code}
        </span>
      ),
    },
    {
      header: "Fecha de Creación",
      cell: (c) => (
        <span className="text-gray-500 tabular-nums text-sm">
          {formatToPeruTime(c.created_at)}
        </span>
      ),
    },
    { header: "Acciones", cell: accionesCell },
  ];

  // Generamos las columnas dependiendo del tab activo
  const getActiveColumns = (): Column<Calculation>[] => {
    const columns = getBaseColumns();

    if (tab === "kapital") {
      // Insertamos la columna de sensibilización antes de la fecha
      columns.splice(2, 0, {
        header: "Sensibilización (BOA)",
        cell: (c) => {
          const hasSensib = hasSensibilizacion(c);

          let listBoaValue: string[] = [];
          if (hasSensib && c.data?.sensibilizacion) {
            const sensibArray = c.data.sensibilizacion as any[];
            sensibArray.forEach((entry) => {
              if (entry && typeof entry.boa === "number") {
                listBoaValue.push(entry.boa.toFixed(2));
              }
            });
          }

          return (
            <span className="flex justify-center">
              {hasSensib ? (
                <div className="flex flex-col items-center gap-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 border border-green-200">
                    Con BOA
                  </span>
                  {listBoaValue.length > 0 && (
                    <span className="text-[11px] font-mono text-gray-500 font-semibold">
                      {listBoaValue.join(", ")}
                    </span>
                  )}
                </div>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                  Básico
                </span>
              )}
            </span>
          );
        },
      });
    }

    return columns;
  };

  const handleTabChange = (next: Tab): void => {
    setTab(next);
    setPage(1);
    setSearch("");
  };

  const confirmDelete = async (): Promise<void> => {
    if (!pendingDelete) return;
    try {
      await MainService.deleteCalculation(pendingDelete.id);
      setPendingDelete(null);

      loadCalculations();
    } catch (e) {
      alert("Error al eliminar el proyecto");
    }
  };

  return (
    <>
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setPendingDelete(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 p-6 w-full max-w-sm mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-500" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 leading-tight">
                  Eliminar proyecto
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  void confirmDelete();
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm shadow-red-200 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl">
        <div className="flex flex-row max-[540px]:flex-col items-center justify-between mb-7 gap-4">
          <div className="flex items-center gap-3 max-[540px]:justify-center">
            <div className="w-10 h-10 rounded-xl bg-valora-primary flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
              <FolderKanban size={20} color="white" strokeWidth={2} />
            </div>
            <div className="max-[540px]:text-center max-[540px]:w-2/3">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                Mis proyectos
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Listado de todos mis proyectos registrados en la plataforma
              </p>
            </div>
          </div>
          <Link
            to={`/${tab}`}
            type="button"
            className="cursor-pointer inline-flex items-center gap-2 bg-valora-primary hover:bg-valora-secondary active:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all duration-150 hover:-translate-y-px"
          >
            <Plus size={16} strokeWidth={2.5} />
            Nuevo
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-200/60 overflow-hidden">
          <div className="px-6 pt-4 pb-0 border-b border-gray-100">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-end gap-0.5">
                {(["valora", "kapital"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTabChange(t)}
                    className={`cursor-pointer px-5 py-2.5 text-sm font-semibold capitalize rounded-t-xl transition-all duration-150 border-b-2 ${
                      tab === t
                        ? "text-blue-600 border-blue-500 bg-blue-50/60"
                        : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error ? (
            <div className="px-6 py-14 text-center text-sm text-red-400">
              {error}
            </div>
          ) : (
            <SimpleTable<Calculation>
              // Datos del backend
              data={data}
              columns={getActiveColumns()}
              isLoading={isLoading}
              onRowClick={(c) => navigate(`/${c.type}/${c.code}`)}
              totalItems={totalItems}
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
              searchQuery={search}
              onSearchChange={setSearch}
            />
          )}
        </div>
      </div>
    </>
  );
};
