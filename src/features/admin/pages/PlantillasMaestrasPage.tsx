import { useState, useEffect, useRef, useCallback } from "react";
import { MainService } from "@/shared/services/main.service";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import {
  CodesModal,
  type CodesModalComparison,
  type CodesModalMode,
} from "@/shared/components/common/CodesModal";
import {
  ToastStack,
  type ToastItem,
} from "@/shared/components/common/ToastStack";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";
import type {
  MasterTemplate,
  MasterTemplateCreate,
  MasterTemplateUpdate,
} from "@/shared/types";

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

// === FORM STATE ===============================================================
interface FormState {
  nombre: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  onedrive_item_id?: string | null;
  onedrive_filename?: string | null;
  original_filename?: string | null;
}

const EMPTY_FORM: FormState = {
  nombre: "",
  description: "",
  is_active: true,
  is_default: false,
  onedrive_item_id: null,
  onedrive_filename: null,
};

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
  const { getToken } = useAuthContext();

  const [templates, setTemplates] = useState<MasterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [extractingAfterCreate, setExtractingAfterCreate] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

  const [codesModalOpen, setCodesModalOpen] = useState(false);
  const [codesModalMode, setCodesModalMode] = useState<CodesModalMode>("all");
  const [codesModalTemplateId, setCodesModalTemplateId] = useState<
    number | null
  >(null);
  const [codesModalTemplateName, setCodesModalTemplateName] =
    useState<string>("");
  const [codesModalComparison, setCodesModalComparison] =
    useState<CodesModalComparison | null>(null);
  const [codesModalErrors, setCodesModalErrors] = useState<string[]>([]);

  // == Toast helpers ==================
  const addToast = useCallback(
    (message: string, type: "success" | "error" | "info" | "warn" = "info") => {
      const id = Date.now().toString();
      const toast: ToastItem = { id, message, type };
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => dismissToast(id), 3500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // == Load ====================
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await MainService.getMasterTemplates({
        limit: 10,
        offset: 0,
        search: searchTerm || undefined,
        token: getToken() ?? undefined,
      });
      setTemplates(data);
    } catch (e: any) {
      addToast(e.message || "Error al cargar plantillas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [searchTerm]);

  // == Dialog helpers ==================
  const openCreate = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, is_default: templates.length === 0 });
    setDialogOpen(true);
  };

  const openEdit = (t: MasterTemplate) => {
    setEditingId(t.id);
    setForm({
      nombre: t.nombre,
      description: t.description ?? "",
      is_active: t.is_active,
      is_default: t.is_default,
      onedrive_item_id: t.onedrive_item_id,
      onedrive_filename: t.onedrive_filename,
    });
    setExcelFile(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setExcelFile(null);
  };

  // == Save (create / update) ===================
  const handleSave = async () => {
    if (!form.nombre.trim()) {
      addToast("El nombre es obligatorio.", "error");
      return;
    }
    setSaving(true);
    try {
      let templateId = editingId;
      const token = getToken() ?? undefined;

      if (editingId === null) {
        const payload: MasterTemplateCreate = {
          nombre: form.nombre.trim(),
          description: form.description.trim() || undefined,
          is_active: form.is_active,
          is_default: form.is_default,
        };
        const plantilla = await MainService.createMasterTemplate(
          payload,
          token
        );
        templateId = plantilla.id;
        addToast("Plantilla creada exitosamente.", "success");
      } else {
        const payload: MasterTemplateUpdate = {
          nombre: form.nombre.trim(),
          description: form.description.trim() || undefined,
          is_active: form.is_active,
          is_default: form.is_default,
        };
        await MainService.updateMasterTemplate(editingId, payload, token);
        addToast("Plantilla actualizada exitosamente.", "success");
      }

      // Si hay archivo Excel, subirlo
      if (excelFile && templateId) {
        setExtractingAfterCreate(true);
        closeDialog();

        try {
          if (editingId !== null && form.onedrive_item_id) {
            const data = await MainService.reUploadMasterTemplateFile(
              templateId,
              excelFile,
              token
            );
            setCodesModalMode("new");
            setCodesModalComparison(data.comparison || null);
            setCodesModalErrors(data.errors || []);
            setCodesModalTemplateId(templateId);
            setCodesModalTemplateName(form.nombre.trim());
            setCodesModalOpen(true);

            if (
              data.comparison.total_new_codes > 0 ||
              data.comparison.total_new_images > 0
            ) {
              addToast(
                `${data.comparison.total_new_codes} nuevos códigos y ${data.comparison.total_new_images} nuevas imágenes encontrados`,
                "success"
              );
            } else {
              addToast("No se encontraron cambios nuevos", "info");
            }
          } else {
            await MainService.uploadMasterTemplateFile(
              templateId,
              excelFile,
              token
            );
            await Promise.all([
              MainService.getMasterTemplateCodes(templateId),
              MainService.getMasterTemplateChartImages(templateId),
            ]);

            setCodesModalMode("all");
            setCodesModalTemplateId(templateId);
            setCodesModalTemplateName(form.nombre.trim());
            setCodesModalComparison(null);
            setCodesModalErrors([]);
            setCodesModalOpen(true);

            addToast(
              `Archivo "${excelFile.name}" subido a OneDrive correctamente.`,
              "success"
            );
          }
        } catch (uploadErr: any) {
          console.error("Error subiendo archivo:", uploadErr);
          addToast(
            "Plantilla guardada, pero hubo error al subir el Excel.",
            "error"
          );
        } finally {
          setExtractingAfterCreate(false);
        }
      } else {
        closeDialog();
      }
      loadTemplates();
    } catch (e: any) {
      addToast(e.message || "Error al guardar.", "error");
    } finally {
      setSaving(false);
    }
  };

  // == Download =============================================================
  const handleDownload = (t: MasterTemplate) => {
    if (!t.onedrive_item_id) {
      addToast("Esta plantilla no tiene archivo subido en OneDrive.", "warn");
      return;
    }
    const token = getToken();
    if (!token) {
      addToast("Sesión expirada. Inicia sesión nuevamente.", "error");
      return;
    }

    (async () => {
      try {
        const url = MainService.downloadMasterTemplateUrl(t.id);
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudo descargar el archivo");
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = t.original_filename || `plantilla_${t.id}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } catch (error: any) {
        addToast(error.message || "Error al descargar archivo.", "error");
      }
    })();
  };

  // == View Codes =============================================================
  const handleViewCodes = (templateId: number, templateName: string) => {
    setCodesModalMode("all");
    setCodesModalTemplateId(templateId);
    setCodesModalTemplateName(templateName);
    setCodesModalComparison(null);
    setCodesModalErrors([]);
    setCodesModalOpen(true);
  };

  const handleSetDefault = async (templateId: number) => {
    try {
      setSettingDefaultId(templateId);
      await MainService.setDefaultMasterTemplate(
        templateId,
        getToken() ?? undefined
      );
      addToast("Plantilla establecida como predeterminada.", "success");
      await loadTemplates();
    } catch (e: any) {
      addToast(
        e.message || "No se pudo establecer como predeterminada",
        "error"
      );
    } finally {
      setSettingDefaultId(null);
    }
  };

  // == Delete ================================================================
  const handleDelete = async () => {
    if (deleteConfirmId === null) return;
    setDeleting(true);
    try {
      await MainService.deleteMasterTemplate(
        deleteConfirmId,
        getToken() ?? undefined
      );
      addToast("Plantilla eliminada.", "success");
      setDeleteConfirmId(null);
      loadTemplates();
    } catch (e: any) {
      addToast(e.message || "Error al eliminar.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // === RENDER ===============================================================
  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 flex justify-between">
        <div>
          <h1 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
            Configuración Financiera
          </h1>
          <h3 className="text-sm font-medium text-gray-500">
            Gestión de indicadores macroeconómicos y parámetros del sistema.
          </h3>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Plantilla
        </button>
      </header>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Feedback */}
        <ToastStack toasts={toasts} onDismiss={dismissToast} />

        {/* Search */}
        <div className="mb-6 relative">
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
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Predeterminada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Archivo OneDrive
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              {/* Lista de Plantillas maestras */}
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((t, index) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium text-gray-900">
                        {t.nombre}
                      </div>
                      {t.description && (
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(t.created_at)}
                    </td>
                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                          <span className="truncate font-medium">
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
