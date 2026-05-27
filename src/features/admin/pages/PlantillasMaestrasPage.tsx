import { useEffect, useState } from "react";
import { CodesModal } from "@/shared/components/common/CodesModal";
import { ToastStack } from "@/shared/components/common/ToastStack";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";

import {
  Plus,
  Search,
  Loader2,
  FileSpreadsheet,
  X,
  Pencil,
  Eye,
  Download,
  Trash2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { useTemplates } from "../hooks/useTemplates";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// === MAIN PAGE ===========================
export const PlantillasMaestrasPage = () => {
  const {
    // Variables de estado principal
    templates,
    loading,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    toasts,
    searchTerm,
    setSearchTerm,

    // Estado del diálogo de creación/edición
    dialogOpen,
    editingId,
    form,
    setForm,
    excelFile,
    setExcelFile,
    saving,
    extractingAfterCreate,
    excelInputRef,

    // Estado de eliminación
    deleteConfirmId,
    setDeleteConfirmId,
    deleting,

    // Estado para establecer como predeterminado
    settingDefaultId,

    // Estados del modal de códigos
    codesModalOpen,
    setCodesModalOpen,
    codesModalMode,
    setCodesModalMode,
    codesModalTemplateId,
    setCodesModalTemplateId,
    codesModalTemplateName,
    setCodesModalTemplateName,
    codesModalComparison,
    setCodesModalComparison,
    codesModalErrors,
    setCodesModalErrors,

    // Métodos manejadores
    dismissToast,
    openCreate,
    openEdit,
    closeDialog,
    handleSave,
    handleDownload,
    handleViewCodes,
    handleSetDefault,
    handleDelete,
  } = useTemplates();

  const [pageInputValue, setPageInputValue] = useState(String(currentPage));

  useEffect(() => {
    setPageInputValue(String(currentPage));
  }, [currentPage]);

  const handlePageJump = () => {
    const pageNumber = parseInt(pageInputValue, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    } else {
      setPageInputValue(String(currentPage));
    }
  };

  // === RENDER ===============================================================
  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 flex justify-between">
        <div>
          <h1 className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-800 uppercase">
            Configuración Financiera
          </h1>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
            Gestión de plantillas maestras para análisis financiero
          </h3>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </button>
      </header>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Feedback */}
        <ToastStack toasts={toasts} onDismiss={dismissToast} />

        {/* Search */}
        <div className="mb-6 relative max-sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin h-6 w-6 mr-2" />
            Cargando plantillas…
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 px-8 py-16 text-center text-gray-400">
            <p className="text-lg font-medium">No hay plantillas maestras</p>
            <p className="text-sm mt-1">
              Haz clic en "Nueva Plantilla" para crear la primera.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-x-auto border border-gray-200 w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-center text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predeterminada
                  </th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archivo OneDrive
                  </th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-center text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-4 py-2 sm:px-6 sm:py-3 text-center text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              {/* Lista de Plantillas maestras */}
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((t, index) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      <div className="font-medium text-gray-900">
                        {t.nombre}
                      </div>
                      {t.description && (
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-center">
                      <button
                        onClick={() => handleSetDefault(t.id)}
                        disabled={t.is_default || settingDefaultId === t.id}
                        title={
                          t.is_default
                            ? "Ya es la plantilla predeterminada"
                            : "Hacer predeterminada"
                        }
                        className="group inline-flex items-center justify-center transition-colors disabled:opacity-100"
                      >
                        {settingDefaultId === t.id ? (
                          <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                        ) : t.is_default ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300 group-hover:text-emerald-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {t.onedrive_filename ? (
                        <span
                          className="flex items-center gap-1.5 text-xs text-blue-600 font-medium truncate max-w-48"
                          title={t.onedrive_filename}
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">
                            {t.original_filename || t.onedrive_filename}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Sin archivo
                        </span>
                      )}
                    </td>
                    {/* Creado */}
                    <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {formatDate(t.created_at)}
                    </td>
                    {/* Acciones */}
                    <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewCodes(t.id, t.nombre)}
                          title="Ver códigos y gráficos"
                          className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-1.5 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDownload(t)}
                          title={
                            t.onedrive_item_id
                              ? "Descargar de OneDrive"
                              : "Sin archivo en OneDrive"
                          }
                          disabled={!t.onedrive_item_id}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:hover:bg-indigo-50"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => openEdit(t)}
                          title="Editar plantilla"
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(t.id)}
                          title="Eliminar"
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-semibold text-gray-900">
                {templates.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-gray-900">{totalItems}</span>{" "}
              plantillas
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm text-gray-600">
                  Ir a la página:
                </span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInputValue}
                  onChange={(e) => setPageInputValue(e.target.value)}
                  onBlur={handlePageJump}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handlePageJump();
                    }
                  }}
                  className="w-16 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-center text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  title="Escribe un número de página y presiona Enter"
                />
                <span className="text-xs sm:text-sm text-gray-600">
                  de{" "}
                  <span className="font-semibold text-gray-900">
                    {totalPages}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {/* == Create / Edit Dialog =========================================== */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId === null
                    ? "Nueva Plantilla Maestra"
                    : "Editar Plantilla Maestra"}
                </h2>
                <button
                  onClick={closeDialog}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, nombre: e.target.value }))
                    }
                    placeholder="Ej: WACC v02.02.26"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={2}
                    placeholder="Descripción opcional de la plantilla…"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="default-template"
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, is_default: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="default-template"
                    className="text-sm font-medium text-gray-700"
                  >
                    Marcar como plantilla predeterminada
                  </label>
                </div>

                {/* Archivo Excel */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excel (opcional)
                  </label>
                  <div className="flex items-center gap-2">
                    {form.onedrive_filename && !excelFile && (
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2 truncate">
                          <FileSpreadsheet className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="truncate font-medium text-wrap">
                            {form.original_filename || form.onedrive_filename}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0 ml-2">
                          Archivo actual
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => excelInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-3 py-2.5 text-xs text-blue-600 hover:bg-blue-100 transition-colors font-medium"
                      >
                        {excelFile ? (
                          <>
                            <FileSpreadsheet className="w-4 h-4" />
                            {excelFile.name}
                          </>
                        ) : form.onedrive_filename ? (
                          "Reemplazar archivo Excel"
                        ) : (
                          "Selecciona archivo Excel"
                        )}
                      </button>
                      <input
                        ref={excelInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) =>
                          setExcelFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                      {excelFile && (
                        <button
                          onClick={() => setExcelFile(null)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors border border-transparent hover:border-red-200"
                          title="Deshacer selección"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Se subirá automáticamente a OneDrive al guardar la plantilla
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeDialog}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Procesando…"
                    : editingId === null
                      ? excelFile
                        ? "Crear y Subir Excel"
                        : "Crear"
                      : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* == Delete Confirm Dialog =========================================== */}
        <ConfirmationModal
          isOpen={deleteConfirmId !== null}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={handleDelete}
          title="Eliminar Plantilla"
          description="¿Estás seguro de que deseas eliminar esta plantilla? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="destructive"
          isLoading={deleting}
        />

        {/* == Shared Codes Modal ============================================= */}
        <CodesModal
          isOpen={codesModalOpen}
          mode={codesModalMode}
          templateId={codesModalTemplateId}
          templateName={codesModalTemplateName}
          comparison={codesModalComparison}
          errors={codesModalErrors}
          onClose={() => {
            setCodesModalOpen(false);
            setCodesModalMode("all");
            setCodesModalTemplateId(null);
            setCodesModalTemplateName("");
            setCodesModalComparison(null);
            setCodesModalErrors([]);
          }}
        />

        {extractingAfterCreate && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-xl shadow-2xl px-8 py-6 flex items-center gap-4 max-w-md mx-4">
              <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  Procesando archivo
                </h4>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  Extrayendo códigos y gráficos, espere por favor...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
