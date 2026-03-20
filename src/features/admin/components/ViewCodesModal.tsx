import { useState, useEffect } from "react";
import { MainService } from "@/shared/services/main.service";

interface ViewCodesModalProps {
  isOpen: boolean;
  templateId: number;
  templateName: string;
  onClose: () => void;
}

interface TemplateCodeItem {
  id: number;
  type: "valora" | "kapital";
  hoja: string | null;
  nombre: string;
  code: string;
}

interface ChartImage {
  code: string; // Ahora incluye $$ envuelto: $$CODIGO$$
  filename: string;
  original_name: string;
  url: string;
  size?: number;
  created_at?: string;
  meta?: Record<string, any>;
}

export const ViewCodesModal = ({
  isOpen,
  templateId,
  templateName,
  onClose,
}: ViewCodesModalProps) => {
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [loadingGraphics, setLoadingGraphics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codesData, setCodesData] = useState<{
    valora: TemplateCodeItem[];
    kapital: TemplateCodeItem[];
  } | null>(null);
  const [chartImages, setChartImages] = useState<{
    valora: ChartImage[];
    kapital: ChartImage[];
  } | null>(null);
  const [imageBlobUrls, setImageBlobUrls] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (isOpen && templateId) {
      loadCodes();
    }
  }, [isOpen, templateId]);

  useEffect(() => {
    if (!isOpen || !chartImages) return;

    const isHttp = (value: string) =>
      value.startsWith("http://") || value.startsWith("https://");
    const isProtectedApiPath = (value: string) =>
      value.startsWith("/api/") || value.startsWith("api/");

    const sourceKey = (image: ChartImage) =>
      `${image.filename}::${image.url || ""}`;

    const collect = async () => {
      const token = localStorage.getItem("auth_token");
      const nextMap: Record<string, string> = {};

      const allImages = [
        ...(chartImages.valora || []),
        ...(chartImages.kapital || []),
      ];

      for (const image of allImages) {
        const rawUrl = image.url || "";
        const key = sourceKey(image);

        if (!rawUrl) {
          nextMap[key] = "";
          continue;
        }

        const normalizedUrl = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;

        if (!isProtectedApiPath(normalizedUrl) && isHttp(rawUrl)) {
          nextMap[key] = rawUrl;
          continue;
        }

        try {
          const response = await fetch(normalizedUrl, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (!response.ok) {
            nextMap[key] = rawUrl;
            continue;
          }

          const blob = await response.blob();
          nextMap[key] = URL.createObjectURL(blob);
        } catch {
          nextMap[key] = rawUrl;
        }
      }

      setImageBlobUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        return nextMap;
      });
    };

    collect();

    return () => {
      setImageBlobUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        return {};
      });
    };
  }, [isOpen, chartImages]);

  // Vincula imágenes con códigos basado en el patrón de nombres

  const extractCodes = async () => {
    try {
      setExtracting(true);
      setError(null);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/v1/main/master-templates/${templateId}/extract-codes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.detail || "Error al extraer códigos del Excel"
        );
      }

      const data = await response.json();
      setCodesData({
        valora: data.codes?.valora || [],
        kapital: data.codes?.kapital || [],
      });

      if (data.extracted_chart_images) {
        setChartImages({
          valora: data.extracted_chart_images.valora || [],
          kapital: data.extracted_chart_images.kapital || [],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setExtracting(false);
    }
  };

  const loadCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MainService.getMasterTemplateCodes(templateId);
      setCodesData({
        valora: data.codes.valora || [],
        kapital: data.codes.kapital || [],
      });

      // IMPORTANTE: SIEMPRE cargar gráficos desde /chart-images
      // Los gráficos se almacenan en un endpoint separado, no en /codes
      await loadGraphics();

      // Si no hay códigos, intentar extraerlos automáticamente
      const totalCodes =
        (data.codes.valora?.length || 0) + (data.codes.kapital?.length || 0);
      if (totalCodes === 0) {
        await extractCodes();
      }
    } catch (e: any) {
      // Si hay error al cargar, intentar extraer
      console.error("Error loading codes:", e);
      setError(null);
      setCodesData({
        valora: [],
        kapital: [],
      });
      // Siempre intentar cargar gráficos aunque falle la carga de códigos
      await loadGraphics();
      await extractCodes();
    } finally {
      setLoading(false);
    }
  };

  const loadGraphics = async () => {
    try {
      setLoadingGraphics(true);
      const token = localStorage.getItem("auth_token");
      const response = await fetch(
        `/api/v1/main/master-templates/${templateId}/chart-images`,
        {
          method: "GET",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChartImages({
          valora: data.valora || [],
          kapital: data.kapital || [],
        });
      }
    } catch (err) {
      // Silently fail, no es crítico si no hay imágenes
      console.debug("Error loading chart images:", err);
    } finally {
      setLoadingGraphics(false);
    }
  };

  if (!isOpen) return null;

  const imageSrc = (image: ChartImage) => {
    const key = `${image.filename}::${image.url || ""}`;
    return imageBlobUrls[key] || image.url;
  };

  const totalCodes =
    (codesData?.valora.length || 0) + (codesData?.kapital.length || 0);
  const totalCharts =
    (chartImages?.valora.length || 0) + (chartImages?.kapital.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Códigos y Gráficos Extraídos
            </h2>
            <p className="text-sm text-gray-500 mt-1">{templateName}</p>
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

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Combined Loading state - Cargando códigos y gráficos */}
        {loading || extracting || loadingGraphics ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-6">
            <svg
              className="animate-spin h-12 w-12 text-blue-600"
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
            <div className="text-center">
              {loading && (
                <p className="text-sm text-gray-600">
                  Cargando códigos existentes…
                </p>
              )}
              {extracting && (
                <p className="text-sm text-gray-600">
                  Extrayendo códigos del Excel…
                </p>
              )}
              {loadingGraphics && (
                <p className="text-sm text-gray-600">Cargando gráficos…</p>
              )}
            </div>
          </div>
        ) : codesData && (totalCodes > 0 || totalCharts > 0) ? (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Total</div>
                <div className="text-2xl font-bold text-blue-900">
                  {totalCodes}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Valora</div>
                <div className="text-2xl font-bold text-green-900">
                  {codesData.valora.length}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">
                  Kapital
                </div>
                <div className="text-2xl font-bold text-purple-900">
                  {codesData.kapital.length}
                </div>
              </div>
            </div>

            {/* Valora Codes */}
            {codesData.valora.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Valora
                  </span>
                  ({codesData.valora.length} códigos)
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Nombre
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Código
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Hoja
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {codesData.valora.map((code) => {
                        return (
                          <tr key={code.id} className="hover:bg-green-50/50">
                            <td className="px-3 py-2 font-medium text-gray-900">
                              {code.nombre}
                            </td>
                            <td className="px-3 py-2 font-mono text-blue-600">
                              {code.code}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {code.hoja || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Valora Graphics */}
                {chartImages?.valora && chartImages.valora.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      Gráficos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {chartImages.valora.map((image) => (
                        <div
                          key={image.filename}
                          className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={imageSrc(image)}
                            alt={image.filename}
                            className="w-full h-32 object-cover cursor-pointer"
                            onClick={() =>
                              window.open(imageSrc(image), "_blank")
                            }
                            title="Click para ver en grande"
                          />
                          <div className="p-2">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {image.filename}
                            </p>
                            {image.size && (
                              <p className="text-xs text-gray-500">
                                {(image.size / 1024).toFixed(0)} KB
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Kapital Codes */}
            {codesData.kapital.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    Kapital
                  </span>
                  ({codesData.kapital.length} códigos)
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-purple-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Nombre
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Código
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Hoja
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {codesData.kapital.map((code) => {
                        return (
                          <tr key={code.id} className="hover:bg-purple-50/50">
                            <td className="px-3 py-2 font-medium text-gray-900">
                              {code.nombre}
                            </td>
                            <td className="px-3 py-2 font-mono text-blue-600">
                              {code.code}
                            </td>
                            <td className="px-3 py-2 text-gray-600">
                              {code.hoja || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Kapital Graphics */}
                {chartImages?.kapital && chartImages.kapital.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      Gráficos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {chartImages.kapital.map((image) => (
                        <div
                          key={image.filename}
                          className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={imageSrc(image)}
                            alt={image.filename}
                            className="w-full h-32 object-cover cursor-pointer"
                            onClick={() =>
                              window.open(imageSrc(image), "_blank")
                            }
                            title="Click para ver en grande"
                          />
                          <div className="p-2">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {image.filename}
                            </p>
                            {image.size && (
                              <p className="text-xs text-gray-500">
                                {(image.size / 1024).toFixed(0)} KB
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
        ) : (
          <div className="rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-500">
            <p className="font-medium">No hay códigos ni gráficos asociados</p>
            <p className="text-sm mt-1">
              Carga un archivo Excel en la plantilla para procesar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
