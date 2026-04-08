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

// === FORM STATE ===============================================================
interface FormState {
  nombre: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
}

const EMPTY_FORM: FormState = {
  nombre: "",
  description: "",
  is_active: true,
  is_default: false,
};

// === MAIN PAGE ================================================================
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

  // Upload state
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetId = useRef<number | null>(null);

  // Delete confirm
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Re-upload state
  const [reUploadingId, setReUploadingId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
  const reUploadInputRef = useRef<HTMLInputElement>(null);
  const reUploadTargetId = useRef<number | null>(null);

  // Shared codes modal (view all and view new)
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

  // == Toast helpers =======================================================
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

  // == Load =================================================================
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

  // == Dialog helpers =======================================================
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
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setExcelFile(null);
  };

  // == Save (create / update) ================================================
  const handleSave = async () => {
    if (!form.nombre.trim()) {
      addToast("El nombre es obligatorio.", "error");
      return;
    }
    setSaving(true);
    try {
      let plantilla: MasterTemplate | null = null;
      const shouldCreateAndUpload = editingId === null && !!excelFile;

      if (editingId === null) {
        // CREATE
        const payload: MasterTemplateCreate = {
          nombre: form.nombre.trim(),
          description: form.description.trim() || undefined,
          is_active: form.is_active,
          is_default: form.is_default,
        };
        plantilla = await MainService.createMasterTemplate(
          payload,
          getToken() ?? undefined
        );
        addToast("Plantilla creada exitosamente.", "success");
      } else {
        // UPDATE
        const payload: MasterTemplateUpdate = {
          nombre: form.nombre.trim(),
          description: form.description.trim() || undefined,
          is_active: form.is_active,
          is_default: form.is_default,
        };
        plantilla = await MainService.updateMasterTemplate(
          editingId,
          payload,
          getToken() ?? undefined
        );
        addToast("Plantilla actualizada exitosamente.", "success");
      }

      // Si hay archivo Excel, subirlo
      if (excelFile && plantilla) {
        try {
          if (shouldCreateAndUpload) {
            closeDialog();
            setExtractingAfterCreate(true);
          }

          const token = getToken() ?? undefined;
          await MainService.uploadMasterTemplateFile(
            plantilla.id,
            excelFile,
            token
          );

          // Esperar que endpoints de códigos e imágenes estén listos
          await Promise.all([
            MainService.getMasterTemplateCodes(plantilla.id),
            MainService.getMasterTemplateChartImages(plantilla.id),
          ]);

          // Abrir automáticamente modal de códigos/imágenes
          setCodesModalMode("all");
          setCodesModalTemplateId(plantilla.id);
          setCodesModalTemplateName(plantilla.nombre);
          setCodesModalComparison(null);
          setCodesModalErrors([]);
          setCodesModalOpen(true);

          addToast(
            `Archivo "${excelFile.name}" subido a OneDrive correctamente.`,
            "success"
          );
        } catch (uploadErr: any) {
          console.error("Error subiendo archivo:", uploadErr);
          addToast(
            "Plantilla guardada, pero hubo error al subir el Excel. Intenta nuevamente desde la lista.",
            "warn"
          );
        } finally {
          if (shouldCreateAndUpload) {
            setExtractingAfterCreate(false);
          }
        }
      }

      if (!shouldCreateAndUpload) {
        closeDialog();
      }
      loadTemplates();
    } catch (e: any) {
      addToast(e.message || "Error al guardar.", "error");
    } finally {
      setSaving(false);
    }
  };

  // == Upload file ===========================================================
  const triggerUpload = (id: number) => {
    uploadTargetId.current = id;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadTargetId.current === null) return;

    const id = uploadTargetId.current;
    const templateName =
      templates.find((t) => t.id === id)?.nombre || "Plantilla";
    setUploadingId(id);

    try {
      const token = getToken() ?? undefined;
      await MainService.uploadMasterTemplateFile(id, file, token);

      // Mostrar modal de códigos automáticamente
      setCodesModalMode("all");
      setCodesModalTemplateId(id);
      setCodesModalTemplateName(templateName);
      setCodesModalComparison(null);
      setCodesModalErrors([]);
      setCodesModalOpen(true);

      loadTemplates();
      addToast(
        `Archivo "${file.name}" subido correctamente. Mostrando códigos y gráficos…`,
        "success"
      );
    } catch (e: any) {
      addToast(e.message || "Error al subir el archivo.", "error");
    } finally {
      setUploadingId(null);
      uploadTargetId.current = null;
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        link.download = t.onedrive_filename || `plantilla_${t.id}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      } catch (error: any) {
        addToast(error.message || "Error al descargar archivo.", "error");
      }
    })();
  };

  // == Re-Upload Excel =======================================================
  const triggerReUpload = (templateId: number, templateName: string) => {
    reUploadTargetId.current = templateId;
    setCodesModalTemplateId(templateId);
    setCodesModalTemplateName(templateName);
    reUploadInputRef.current?.click();
  };

  const handleReUploadChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !reUploadTargetId.current) return;

    try {
      setReUploadingId(reUploadTargetId.current);
      setCodesModalErrors([]);

      const token = getToken();
      const data = await MainService.reUploadMasterTemplateFile(
        reUploadTargetId.current,
        file,
        token || undefined
      );

      // Show comparison modal
      setCodesModalMode("new");
      setCodesModalComparison(data.comparison || null);
      setCodesModalErrors(data.errors || []);
      setCodesModalOpen(true);

      // Show toast
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

      // Reload templates
      await loadTemplates();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error desconocido";
      addToast(errorMsg, "error");
    } finally {
      setReUploadingId(null);
      if (reUploadInputRef.current) {
        reUploadInputRef.current.value = "";
      }
    }
  };

  const handleReUpload = (id: number) => {
    const template = templates.find((t) => t.id === id);
    if (!template) return;
    if (!template.onedrive_item_id) {
      addToast("Esta plantilla no tiene archivo actual", "warn");
      return;
    }
    triggerReUpload(id, template.nombre);
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nueva Plantilla
        </button>
      </header>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Feedback */}
        <ToastStack toasts={toasts} onDismiss={dismissToast} />

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <svg
              className="animate-spin h-6 w-6 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
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
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              <tbody className="bg-white divide-y divide-gray-200">
                {templates.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.id}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.is_default ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Predeterminada
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {t.onedrive_filename ? (
                        <span
                          className="text-xs text-blue-600 font-medium truncate max-w-40 block"
                          title={t.onedrive_filename}
                        >
                          📄 {t.onedrive_filename}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Sin archivo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(t.created_at).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSetDefault(t.id)}
                          disabled={t.is_default || settingDefaultId === t.id}
                          title={
                            t.is_default
                              ? "Ya es predeterminada"
                              : "Establecer como predeterminada"
                          }
                          className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-md transition-colors disabled:opacity-50"
                        >
                          {settingDefaultId === t.id ? (
                            <svg
                              className="animate-spin w-4 h-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => openEdit(t)}
                          title="Editar"
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-7-9l7 7"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => triggerUpload(t.id)}
                          disabled={
                            uploadingId === t.id || !!t.onedrive_item_id
                          }
                          title={
                            t.onedrive_item_id
                              ? "Ya tiene archivo subido"
                              : "Subir archivo Excel"
                          }
                          className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 p-1.5 rounded-md transition-colors disabled:opacity-50"
                        >
                          {uploadingId === t.id ? (
                            <svg
                              className="animate-spin w-4 h-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                              />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => handleReUpload(t.id)}
                          disabled={
                            reUploadingId === t.id || !t.onedrive_item_id
                          }
                          title={
                            t.onedrive_item_id
                              ? "Re-subir archivo actualizado"
                              : "Sin archivo actual"
                          }
                          className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 p-1.5 rounded-md transition-colors disabled:opacity-50"
                        >
                          {reUploadingId === t.id ? (
                            <svg
                              className="animate-spin w-4 h-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8H4z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                              />
                            </svg>
                          )}
                        </button>

                        <button
                          onClick={() => handleViewCodes(t.id, t.nombre)}
                          title="Ver códigos extraídos"
                          className="text-orange-600 hover:text-orange-900 bg-orange-50 hover:bg-orange-100 p-1.5 rounded-md transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDownload(t)}
                          title={
                            t.onedrive_item_id
                              ? "Descargar desde OneDrive"
                              : "Sin archivo en OneDrive"
                          }
                          disabled={!t.onedrive_item_id}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded-md transition-colors disabled:opacity-30"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(t.id)}
                          title="Eliminar"
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded-md transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Hidden file input for upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Hidden file input for re-upload */}
        <input
          ref={reUploadInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleReUploadChange}
        />

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
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
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

                {/* Archivo Excel (solo al crear) */}
                {editingId === null && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Excel (opcional)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        ref={excelInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={(e) =>
                          setExcelFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                      <button
                        onClick={() => excelInputRef.current?.click()}
                        className="flex-1 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 px-3 py-2 text-xs text-blue-600 hover:bg-blue-100 transition-colors text-center font-medium"
                      >
                        {excelFile
                          ? `📄 ${excelFile.name}`
                          : "Selecciona archivo Excel"}
                      </button>
                      {excelFile && (
                        <button
                          onClick={() => setExcelFile(null)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Limpiar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Se subirá automáticamente a OneDrive al guardar la
                      plantilla
                    </p>
                  </div>
                )}
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
              <svg
                className="animate-spin h-6 w-6 text-blue-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <p className="text-sm font-medium text-gray-700">
                extrayendo codigos y graficos, espere un momento...
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
