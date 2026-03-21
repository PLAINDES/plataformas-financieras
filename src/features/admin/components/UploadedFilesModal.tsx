import { useState, useEffect } from "react";
import { MainService } from "@/shared/services/main.service";
import type { MasterTemplate } from "@/shared/types";

interface UploadedFile {
  id: number;
  filename: string;
  template_id: number;
  template_name: string;
  size: number;
  uploaded_at: string;
  onedrive_item_id?: string;
}

interface UploadedFilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadedFilesModal = ({
  isOpen,
  onClose,
}: UploadedFilesModalProps) => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [templates, setTemplates] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    if (isOpen) {
      loadFiles();
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      const token = localStorage.getItem("auth_token") || undefined;
      const data = await MainService.getMasterTemplates({
        limit: 100,
        offset: 0,
        token,
      });
      const map = new Map();
      data.forEach((t: MasterTemplate) => {
        map.set(t.id, t.nombre);
      });
      setTemplates(map);
    } catch (e) {
      console.error("Error loading templates:", e);
    }
  };

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/v1/main/master-templates/uploaded-files`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setFiles(Array.isArray(data) ? data : data.files || []);
      } else {
        // Si no existe el endpoint, mostrar vacío
        setFiles([]);
      }
    } catch (e: any) {
      console.debug("No uploaded files endpoint available");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!confirm("¿Eliminar este archivo?")) return;

    try {
      setDeleting(fileId);
      setError(null);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/v1/main/master-templates/uploaded-files/${fileId}`,
        {
          method: "DELETE",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el archivo");
      }

      setFiles(files.filter((f) => f.id !== fileId));
    } catch (e: any) {
      setError(e.message || "Error al eliminar");
    } finally {
      setDeleting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Archivos Excel Subidos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona los Excel subidos a OneDrive
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
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
            Cargando archivos…
          </div>
        ) : files.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-3 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="font-medium">No hay archivos Excel subidos</p>
            <p className="text-sm mt-1">
              Los archivos aparecerán aquí cuando los subas a una plantilla
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Archivo
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Plantilla
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Tamaño
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">
                    Subido
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-green-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m4-3H8m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="font-medium text-gray-900">
                          {file.filename}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {templates.get(file.template_id) || "Desconocida"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {(file.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(file.uploaded_at).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {file.onedrive_item_id && (
                          <a
                            href={`https://onedrive.live.com/embed?resid=${file.onedrive_item_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Ver en OneDrive"
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
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(file.id)}
                          disabled={deleting === file.id}
                          className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Eliminar"
                        >
                          {deleting === file.id ? (
                            <svg
                              className="animate-spin h-4 w-4"
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
                          ) : (
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
