import React, { useEffect, useRef, useState } from "react";
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
  Upload,
} from "lucide-react";
import { useTemplates } from "../hooks/useTemplates";
import { MainService } from "@/shared/services/main.service";

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
    addToast,
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

  // === VALORA TEMPLATE STATE & METHODS =====================================
  type ValoraTemplate = {
    url: string;
    filename: string;
    original_name: string;
    last_modified: string;
    object_key: string;
    is_current?: boolean;
  };
  const [valoraTemplates, setValoraTemplates] = useState<ValoraTemplate[]>([]);
  const [loadingValora, setLoadingValora] = useState(true);
  const [uploadingValora, setUploadingValora] = useState(false);
  const [selectedValoraFile, setSelectedValoraFile] = useState<File | null>(null);
  const valoraFileInputRef = useRef<HTMLInputElement>(null);
  const [valoraSetDefaultTarget, setValoraSetDefaultTarget] = useState<ValoraTemplate | null>(null);
  const [settingValoraDefault, setSettingValoraDefault] = useState(false);

  const fetchValoraTemplates = async () => {
    setLoadingValora(true);
    try {
      const res = await MainService.getValoraTemplate();
      setValoraTemplates(res.templates || []);
    } catch {
      // Silenciar
    } finally {
      setLoadingValora(false);
    }
  };

  useEffect(() => {
    fetchValoraTemplates();
  }, []);

  const handleValoraFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!["xlsx", "xls"].includes(ext || "")) {
        addToast("Solo se permiten archivos Excel (.xlsx, .xls)", "error");
        if (valoraFileInputRef.current) valoraFileInputRef.current.value = "";
        return;
      }
      setSelectedValoraFile(file);
    }
  };

  const handleValoraUpload = async () => {
    if (!selectedValoraFile) return;
    setUploadingValora(true);
    try {
      const res = await MainService.uploadValoraTemplate(selectedValoraFile);
      setValoraTemplates(res.templates || []);
      setSelectedValoraFile(null);
      if (valoraFileInputRef.current) valoraFileInputRef.current.value = "";
      addToast("Plantilla de Valora subida correctamente.", "success");
    } catch {
      addToast("Error al subir la plantilla. Intenta nuevamente.", "error");
    } finally {
      setUploadingValora(false);
    }
  };

  const handleDownloadValora = (template: ValoraTemplate) => {
    const link = document.createElement("a");
    link.href = template.url;
    link.download = template.original_name || "PlantillaValora.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmSetDefaultValora = async () => {
    if (!valoraSetDefaultTarget) return;
    setSettingValoraDefault(true);
    try {
      const res = await MainService.setValoraTemplateDefault(valoraSetDefaultTarget.object_key);
      setValoraTemplates(res.templates || []);
      addToast("Plantilla establecida como actual.", "success");
    } catch {
      addToast("Error al establecer la plantilla como actual.", "error");
    } finally {
      setSettingValoraDefault(false);
      setValoraSetDefaultTarget(null);
    }
  };

  // === TABS STATE ==========================================================
  const [activeTab, setActiveTab] = useState<"master" | "valora">("master");

  const renderTabButton = (id: "master" | "valora", label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        activeTab === id
          ? "border-blue-500 text-blue-600 bg-blue-50"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );

  // === RENDER ===============================================================
  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 flex justify-between items-center">
        <div>
          <h1 className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-800 uppercase">
            Configuración Financiera
          </h1>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
            Gestión de plantillas maestras y plantilla de Valora.
          </h3>
        </div>
        {activeTab === "master" && (
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center p-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            title="Nueva Plantilla"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </header>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Feedback */}
        <ToastStack toasts={toasts} onDismiss={dismissToast} />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 mb-6">
          {renderTabButton("master", "Plantillas Maestras")}
          {renderTabButton("valora", "Plantilla Valora")}
        </div>

        {activeTab === "master" && (
          <>
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
                  Haz clic en el botón "+" para crear la primera.
                </p>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="overflow-x-auto w-full">
                  <table className="min-w-[700px] w-full divide-y divide-gray-200">
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
                          Archivo Excel
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
                        <tr
                          key={t.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            {(currentPage - 1) * 10 + index + 1}
                          </td>
                          <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                            <div className="font-medium text-gray-900">
                              {t.nombre}
                            </div>
                            {t.description && (
                              <div className="text-xs text-gray-400 truncate max-w-40">
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
                                    ? "Descargar archivo Excel"
                                    : "Sin archivo Excel"
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
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
                <div className="text-xs text-gray-500">
                  Mostrando página <span className="font-medium">{currentPage}</span> de{" "}
                  <span className="font-medium">{totalPages}</span> ({totalItems} en total)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-500">Ir a:</span>
                    <input
                      type="text"
                      value={pageInputValue}
                      onChange={(e) => setPageInputValue(e.target.value)}
                      onBlur={handlePageJump}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePageJump();
                      }}
                      className="w-12 rounded-md border border-gray-300 px-2 py-1 text-center text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB VALORA */}
        {activeTab === "valora" && (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 p-6">
            <h2 className="text-xs font-bold tracking-wider text-blue-600 uppercase mb-4">
              Plantilla de Estados Financieros — Valora
            </h2>
            {loadingValora ? (
              <div className="flex items-center py-4 text-gray-500">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Cargando plantillas…
              </div>
            ) : (
              <div className="space-y-4">
                {/* Upload section */}
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                  <h3 className="text-[11px] font-bold tracking-wider text-gray-500 uppercase mb-3">Subir Nueva Plantilla</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <button onClick={() => valoraFileInputRef.current?.click()} className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <Upload className="h-4 w-4" />
                      {selectedValoraFile ? selectedValoraFile.name : "Seleccionar Excel"}
                    </button>
                    <input ref={valoraFileInputRef} type="file" accept=".xlsx,.xls" onChange={handleValoraFileSelect} className="hidden" />
                    {selectedValoraFile && (
                      <button onClick={() => { setSelectedValoraFile(null); if (valoraFileInputRef.current) valoraFileInputRef.current.value = ""; }} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={handleValoraUpload} disabled={!selectedValoraFile || uploadingValora} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 disabled:opacity-50">
                      {uploadingValora ? <><Loader2 className="animate-spin w-3.5 h-3.5" /> Subiendo…</> : <><Upload className="w-3.5 h-3.5" /> Guardar Plantilla</>}
                    </button>
                  </div>
                </div>

                {/* History list */}
                {valoraTemplates.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-[11px] font-bold tracking-wider text-gray-500 uppercase">
                      Historial ({valoraTemplates.length}/10)
                    </h3>
                    {valoraTemplates.map((t) => (
                      <div
                        key={t.object_key}
                        className={`flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border px-4 py-3 gap-3 ${t.is_current ? 'border-blue-200 bg-blue-50/40' : 'border-gray-200 bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                          <FileSpreadsheet className={`w-5 h-5 shrink-0 ${t.is_current ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div className="min-w-0 truncate">
                            <p className="text-sm font-medium text-gray-900 truncate" title={t.original_name}>{t.original_name}</p>
                            <p className="text-[10px] text-gray-500">{formatDate(t.last_modified)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                          {t.is_current && <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-2.5 py-1 rounded-full">Actual</span>}
                          {!t.is_current && (
                            <button
                              onClick={() => setValoraSetDefaultTarget(t)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Asignar como actual
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadValora(t)}
                            className="inline-flex items-center justify-center p-1.5 sm:px-2.5 sm:py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline ml-1">Descargar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-200 px-6 py-6 text-center text-gray-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium">No hay plantillas en el historial</p>
                    <p className="text-xs mt-1">Sube una plantilla Excel para comenzar.</p>
                  </div>
                )}
              </div>
            )}

            {/* == Set Default Valora Confirm Dialog ================================ */}
            {valoraSetDefaultTarget && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !settingValoraDefault && setValoraSetDefaultTarget(null)}>
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Asignar como plantilla actual</h3>
                  <p className="text-sm text-slate-500 mb-6">
                    ¿Deseas establecer <strong>"{valoraSetDefaultTarget.original_name}"</strong> como la plantilla actual de Valora? Los usuarios descargarán esta versión por defecto.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setValoraSetDefaultTarget(null)}
                      disabled={settingValoraDefault}
                      className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={confirmSetDefaultValora}
                      disabled={settingValoraDefault}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {settingValoraDefault && <Loader2 className="w-4 h-4 animate-spin" />}
                      {settingValoraDefault ? "Procesando..." : "Sí, asignar como actual"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* == Create / Edit Dialog ============================================ */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h3 className="text-base font-bold text-gray-900">
                  {editingId === null ? "Nueva Plantilla Maestra" : "Editar Plantilla Maestra"}
                </h3>
                <button
                  onClick={closeDialog}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Nombre de la Plantilla *
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    placeholder="Ej. Plantilla WACC corporativo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Breve descripción de la plantilla..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_default}
                      onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Predeterminada</span>
                  </label>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Archivo Excel {editingId !== null && "(Opcional si deseas mantener el actual)"}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
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
                        "Seleccionar archivo Excel"
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
                  <p className="text-xs text-gray-400 mt-1">
                    Se subirá el archivo Excel al guardar la plantilla
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
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
