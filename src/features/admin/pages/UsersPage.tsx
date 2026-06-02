import { useEffect, useState } from "react";
import { ToastStack } from "@/shared/components/common/ToastStack";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";
import {
  Plus,
  Search,
  Loader2,
  X,
  Pencil,
  Trash2,
  User as UserIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { useUsers } from "../hooks/useUsers";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const UsersPage = () => {
  const {
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
  } = useUsers();

  const [pageInputValue, setPageInputValue] = useState(String(currentPage));
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 flex justify-between">
        <div>
          <h1 className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-800 uppercase">
            Administración
          </h1>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
            Gestión de usuarios y accesos
          </h3>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Usuario
        </button>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        <ToastStack toasts={toasts} onDismiss={dismissToast} />

        <div className="mb-6 relative max-sm:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-500">
            <Loader2 className="animate-spin h-6 w-6 mr-2" />
            Cargando usuarios…
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 px-8 py-16 text-center text-gray-400">
            <p className="text-lg font-medium">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-center text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-center text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-4 py-2 sm:px-6 sm:py-3 text-center text-[11px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                            <UserIcon className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {u.name} {u.lastname || ""}
                            </div>
                            <div className="text-xs text-gray-500">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={
                            togglingRoleId === u.id || u.role === "master"
                          }
                          title={
                            u.role === "master"
                              ? "No modificable"
                              : "Clic para cambiar rol"
                          }
                          className="group inline-flex items-center justify-center transition-all disabled:opacity-100"
                        >
                          {togglingRoleId === u.id ? (
                            <Loader2 className="w-5 h-5 animate-spin text-valora-primary" />
                          ) : (
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border cursor-pointer ${
                                u.role === "master" || u.role === "admin"
                                  ? "bg-indigo-50 text-valora-primary border-indigo-200 hover:bg-indigo-100"
                                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                              }`}
                            >
                              {u.role === "master"
                                ? "Master"
                                : u.role === "admin"
                                  ? "Admin"
                                  : "Usuario"}
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {u.is_active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-center text-xs sm:text-sm text-gray-500">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-2 sm:px-6 sm:py-3 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded-md transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(u.id)}
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

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-600">
              Mostrando{" "}
              <span className="font-semibold text-gray-900">
                {users.length}
              </span>{" "}
              de{" "}
              <span className="font-semibold text-gray-900">{totalItems}</span>
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
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )}

        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  {editingId === null ? "Nuevo Usuario" : "Editar Usuario"}
                </h2>
                <button
                  onClick={closeDialog}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={form.lastname}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, lastname: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingId === null
                      ? "Contraseña"
                      : "Nueva Contraseña (opcional)"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          role: e.target.value as "admin" | "master" | "user",
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">Usuario</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  {editingId !== null && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={form.is_active ? "true" : "false"}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            is_active: e.target.value === "true",
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={closeDialog}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        )}

        <ConfirmationModal
          isOpen={deleteConfirmId !== null}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={handleDelete}
          title="Eliminar Usuario"
          description="¿Está seguro de que desea eliminar a este usuario?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="destructive"
          isLoading={deleting}
        />
      </div>
    </>
  );
};
