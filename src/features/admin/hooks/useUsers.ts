import { useState, useEffect, useCallback } from "react";
import { MainService } from "@/shared/services/main.service";
import type { UserAdminUpdate, UserResponse } from "@/shared/types";

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface UserFormState {
  name: string;
  lastname: string;
  phone_number: string;
  email: string;
  password?: string;
  role: "admin" | "master" | "user";
  is_active: boolean;
}

const defaultForm: UserFormState = {
  name: "",
  lastname: "",
  phone_number: "",
  email: "",
  password: "",
  role: "user",
  is_active: true,
};

export const useUsers = () => {
  // Estado principal
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Feedback (Toasts)
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Modales y Formularios
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<UserFormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [togglingRoleId, setTogglingRoleId] = useState<number | null>(null);

  // Eliminación
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "info") => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const handleToggleRole = async (user: UserResponse) => {
    // Evitar cambiar el rol del master por seguridad
    if (user.role === "master") return;

    setTogglingRoleId(user.id);
    try {
      const newRole = user.role === "admin" ? "user" : "admin";
      await MainService.updateUser(user.id, { role: newRole });
      addToast(`Rol actualizado correctamente`, "success");
      fetchUsers(); // Recargar la lista para reflejar el cambio
    } catch (error: any) {
      addToast(error.message || "Error al actualizar el rol", "error");
    } finally {
      setTogglingRoleId(null);
    }
  };

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Debounce para la búsqueda
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reiniciar a la página 1 al buscar
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const response = await MainService.getUsers({
        limit,
        offset,
        search: debouncedSearch || undefined,
      });

      const formattedUsers = response.items.map((user: any) => ({
        ...user,
        lastname: user.lastname || "",
      }));

      setUsers(formattedUsers);
      setTotalItems(response.total);
      setTotalPages(response.pages);
    } catch (error: any) {
      addToast(error.message || "Error al cargar los usuarios", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (user: UserResponse) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      lastname: user.lastname || "",
      phone_number: user.phone_number || "",
      email: user.email,
      password: "", // Vacío intencionalmente por seguridad
      role: user.role,
      is_active: user.is_active,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.email) {
      addToast("El nombre y correo son obligatorios", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId === null) {
        if (form.phone_number.trim().length < 7) {
          addToast("El teléfono debe tener al menos 7 caracteres", "error");
          setSaving(false);
          return;
        }
        if (!form.password || form.password.length < 6) {
          addToast("La contraseña debe tener al menos 6 caracteres", "error");
          setSaving(false);
          return;
        }
        await MainService.createUser({
          name: form.name,
          lastname: form.lastname,
          phone_number: form.phone_number.trim(),
          email: form.email,
          password: form.password,
          role: form.role,
        });
        addToast("Usuario creado correctamente", "success");
      } else {
        const payload: UserAdminUpdate = {
          name: form.name,
          lastname: form.lastname,
          phone_number: form.phone_number.trim() || null,
          email: form.email,
          role: form.role,
          is_active: form.is_active,
        };

        // Solo enviar la contraseña si se envió una nueva
        if (form.password && form.password.trim() !== "") {
          if (form.password.length < 6) {
            addToast(
              "La nueva contraseña debe tener al menos 6 caracteres",
              "error"
            );
            setSaving(false);
            return;
          }
          payload.password = form.password;
        }

        await MainService.updateUser(editingId, payload);
        addToast("Usuario actualizado correctamente", "success");
      }
      closeDialog();
      fetchUsers();
    } catch (error: any) {
      addToast(error.message || "Error al guardar el usuario", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmId === null) return;

    setDeleting(true);
    try {
      await MainService.deleteUser(deleteConfirmId);
      addToast("Usuario desactivado correctamente", "success");
      setDeleteConfirmId(null);

      // Si se elimina el último elemento de una página, retroceder una página
      if (users.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchUsers();
      }
    } catch (error: any) {
      addToast(error.message || "Error al desactivar el usuario", "error");
    } finally {
      setDeleting(false);
    }
  };

  return {
    users,
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
    saving,
    deleteConfirmId,
    setDeleteConfirmId,
    deleting,
    dismissToast,
    openCreate,
    openEdit,
    closeDialog,
    handleSave,
    handleDelete,
    handleToggleRole,
    togglingRoleId,
  };
};
