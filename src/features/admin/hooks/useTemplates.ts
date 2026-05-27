import { useState, useEffect, useRef, useCallback } from "react";
import { MainService } from "@/shared/services/main.service";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import type { ToastItem } from "@/shared/components/common/ToastStack";
import type {
  CodesModalComparison,
  CodesModalMode,
} from "@/shared/components/common/CodesModal";
import type {
  MasterTemplate,
  MasterTemplateCreate,
  MasterTemplateUpdate,
} from "@/shared/types";

// === FORM STATE ===============================================================
export interface FormState {
  nombre: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  onedrive_item_id?: string | null;
  onedrive_filename?: string | null;
  original_filename?: string | null;
}

export const EMPTY_FORM: FormState = {
  nombre: "",
  description: "",
  is_active: true,
  is_default: false,
  onedrive_item_id: null,
  onedrive_filename: null,
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const useTemplates = () => {
  const { getToken } = useAuthContext();

  const [templates, setTemplates] = useState<MasterTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

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
      const offset = (currentPage - 1) * limit;
      const data = await MainService.getMasterTemplates({
        limit,
        offset,
        search: appliedSearch || undefined,
        token: getToken() ?? undefined,
      });
      const items = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.items)
          ? (data as any).items
          : [];
      const total = Array.isArray(data)
        ? data.length
        : Number((data as any)?.total ?? items.length);
      const pages = Array.isArray(data) ? 1 : Number((data as any)?.pages ?? 1);

      setTemplates(items);
      setTotalItems(total);
      setTotalPages(pages || 1);
    } catch (e: any) {
      addToast(e.message || "Error al cargar plantillas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, [currentPage, appliedSearch]);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    const timeoutId = window.setTimeout(() => {
      setCurrentPage(1);
      setAppliedSearch(trimmed);
    }, 300);

    if (!trimmed) {
      setCurrentPage(1);
    }

    return () => window.clearTimeout(timeoutId);
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

  return {
    templates,
    loading,
    totalItems,
    totalPages,
    currentPage,
    setCurrentPage,
    toasts,
    searchTerm,
    setSearchTerm,
    dialogOpen,
    editingId,
    form,
    setForm,
    excelFile,
    setExcelFile,
    saving,
    extractingAfterCreate,
    excelInputRef,
    deleteConfirmId,
    setDeleteConfirmId,
    deleting,
    settingDefaultId,
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
    dismissToast,
    openCreate,
    openEdit,
    closeDialog,
    handleSave,
    handleDownload,
    handleViewCodes,
    handleSetDefault,
    handleDelete,
  };
};
