import React, { useState } from "react";
import { useCalculations } from "../hooks/useCalculations";
import type { Calculation } from "@/shared/types";
import {
  Search,
  Plus,
  FolderKanban,
  Trash2,
  Eye,
} from "lucide-react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface ProyectosProps {
  userId?: number;
}


const PAGE_SIZE = 10;

type Tab = "valora" | "kapital";

export const Proyectos: React.FC<ProyectosProps> = ({ userId }) => {
  const { calculations, error, remove } = useCalculations(userId);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [tab, setTab] = useState<Tab>("valora");
  const [pendingDelete, setPendingDelete] = useState<Calculation | null>(null);

  const accionesCell = (c: Calculation): React.ReactNode => (
    <div className="flex items-center justify-center gap-1">
      <a
        href={`/${c.type}/${c.code}/resultados`}
        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
        title="Ver proyecto"
      >
        <Eye size={15} strokeWidth={2} />
      </a>
      <button
        type="button"
        onClick={() => setPendingDelete(c)}
        className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors"
        title="Eliminar proyecto"
      >
        <Trash2 size={15} strokeWidth={2} />
      </button>
    </div>
  );

  const baseColumns: Column<Calculation>[] = [
    {
      header: "N°",
      cell: (c) => (
        <span className="text-gray-400 font-medium tabular-nums">{c.id}</span>
      ),
    },
    {
      header: "Proyecto",
      cell: (c) => (
        <span className="font-mono text-gray-800 font-medium tracking-tight text-xs">
          {(c.code)}
        </span>
      ),
    },
    {
      header: "Fecha de Creación",
      cell: (c) => (
        <span className="text-gray-500 tabular-nums text-sm">
          {new Date(c.created_at).toLocaleString("es-PE")}
        </span>
      ),
    },
    { header: "Acciones", cell: accionesCell },
  ];

  const kapitalColumns: Column<Calculation>[] = [
    {
      header: "N°",
      cell: (c) => (
        <span className="text-gray-400 font-medium tabular-nums">{c.id}</span>
      ),
    },
    {
      header: "Proyecto",
      cell: (c) => (
        <span className="font-mono text-gray-800 font-medium tracking-tight text-xs">
          {(c.code)}
        </span>
      ),
    },
    {
      header: "Fecha de Creación",
      cell: (c) => (
        <span className="text-gray-500 tabular-nums text-sm">
          {new Date(c.created_at).toLocaleString("es-PE")}
        </span>
      ),
    },
    { header: "Acciones", cell: accionesCell },
  ];

  const activeColumns = tab === "valora" ? baseColumns : kapitalColumns;

  const filtered = calculations.filter((c) => {
    const q = search.toLowerCase();
    const matchesTab = c.type === tab;
    const matchesSearch =
      c.type.includes(q) ||
      String(c.id).includes(q) ||
      JSON.stringify(c.data ?? {}).toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (next: Tab): void => {
    setTab(next);
    setPage(1);
    setSearch("");
  };

  const confirmDelete = async (): Promise<void> => {
    if (!pendingDelete) return;
    await remove(pendingDelete.id);
    setPendingDelete(null);
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
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
              <FolderKanban size={20} color="white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">
                Mis proyectos
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                Listado de todos mis proyectos registrados en la plataforma
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-200 transition-all duration-150 hover:-translate-y-px"
          >
            <Plus size={16} strokeWidth={2.5} />
            Nuevo
          </button>
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
                    className={`px-5 py-2.5 text-sm font-semibold capitalize rounded-t-xl transition-all duration-150 border-b-2 ${
                      tab === t
                        ? "text-blue-600 border-blue-500 bg-blue-50/60"
                        : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="relative max-w-xs w-full mb-3">
                <Search
                  size={15}
                  strokeWidth={2}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Buscar proyecto"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 transition-all duration-150"
                />
              </div>
            </div>
          </div>

          {error ? (
            <div className="px-6 py-14 text-center text-sm text-red-400">
              {error}
            </div>
          ) : (
            <SimpleTable<Calculation>
              data={paginated}
              columns={activeColumns}
            />
          )}

          <div className="px-6 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {filtered.length} proyecto{filtered.length !== 1 ? "s" : ""}{" "}
              encontrado{filtered.length !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    n === page
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};