import { useEffect, useMemo, useState } from "react";
import { BarChart3, Image as ImageIcon, TriangleAlert, X } from "lucide-react";
import { MainService } from "@/shared/services/main.service";

type CodeItem = {
  id: number;
  nombre: string;
  code: string;
  hoja: string | null;
};

type ChartImageItem = {
  filename: string;
  url: string;
  size?: number;
};

export type CodesModalMode = "all" | "new";

export interface CodesModalComparison {
  new_codes: {
    valora: Array<string | { code: string }>;
    kapital: Array<string | { code: string }>;
  };
  new_images: {
    valora: string[];
    kapital: string[];
  };
  total_new_codes: number;
  total_new_images: number;
}

interface CodesModalProps {
  isOpen: boolean;
  mode: CodesModalMode;
  templateId: number | null;
  templateName: string;
  comparison?: CodesModalComparison | null;
  errors?: string[];
  onClose: () => void;
}

const normalizeImageName = (image: string) => {
  const cleanName = image.split("?")[0].split("#")[0].split("/").pop() || image;
  return cleanName.replace(/\.(jpg|jpeg|png)$/i, "");
};

const imageUrlFromName = (image: string) => {
  if (!image) return "";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  if (image.startsWith("/api/") || image.startsWith("api/")) {
    return image.startsWith("/") ? image : `/${image}`;
  }

  const filename = normalizeImageName(image);
  return `/api/v1/main/master-templates/chart-file/${encodeURIComponent(filename)}`;
};

export const CodesModal = ({
  isOpen,
  mode,
  templateId,
  templateName,
  comparison,
  errors = [],
  onClose,
}: CodesModalProps) => {
  const [loading, setLoading] = useState(false);
  const [extracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codesData, setCodesData] = useState<{
    valora: CodeItem[];
    kapital: CodeItem[];
  } | null>(null);
  const [chartImages, setChartImages] = useState<{
    valora: ChartImageItem[];
    kapital: ChartImageItem[];
  } | null>(null);
  const [imageBlobUrls, setImageBlobUrls] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (!isOpen) return;
    if (mode !== "all" || !templateId) return;

    const loadAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [codes, images] = await Promise.all([
          MainService.getMasterTemplateCodes(templateId),
          MainService.getMasterTemplateChartImages(templateId),
        ]);

        setCodesData({
          valora: codes.codes.valora || [],
          kapital: codes.codes.kapital || [],
        });
        setChartImages({
          valora: images.valora || [],
          kapital: images.kapital || [],
        });
      } catch (e: any) {
        setError(e?.message || "No se pudieron cargar los codigos asociados");
        setCodesData({ valora: [], kapital: [] });
        setChartImages({ valora: [], kapital: [] });
      } finally {
        setLoading(false);
      }
    };

    void loadAllData();
  }, [isOpen, mode, templateId]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const collectImageBlobUrls = async () => {
      const token = localStorage.getItem("auth_token");
      const nextMap: Record<string, string> = {};

      if (mode === "all" && chartImages) {
        const allImages = [
          ...(chartImages.valora || []),
          ...(chartImages.kapital || []),
        ];

        for (const image of allImages) {
          const key = `${image.filename}::${image.url || ""}`;
          const rawUrl = image.url || "";

          if (!rawUrl) {
            nextMap[key] = "";
            continue;
          }

          if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            nextMap[key] = rawUrl;
            continue;
          }

          const normalizedUrl = rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`;

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
      }

      if (mode === "new" && comparison && templateId) {
        let resolvedUrlsByFilename: Record<string, string> = {};

        try {
          const chartData = await MainService.getMasterTemplateChartImages(
            templateId,
            token ?? undefined
          );

          for (const image of [
            ...(chartData.valora || []),
            ...(chartData.kapital || []),
          ]) {
            const filename =
              typeof image?.filename === "string" ? image.filename : "";
            const url = typeof image?.url === "string" ? image.url : "";
            if (!filename || !url) continue;
            resolvedUrlsByFilename[normalizeImageName(filename)] = url;
          }
        } catch {
          resolvedUrlsByFilename = {};
        }

        const newImages = [
          ...(comparison.new_images.valora || []),
          ...(comparison.new_images.kapital || []),
        ];

        for (const image of newImages) {
          const key = `new::${image}`;
          const rawUrl =
            resolvedUrlsByFilename[normalizeImageName(image)] ||
            imageUrlFromName(image);

          if (!rawUrl) {
            nextMap[key] = "";
            continue;
          }

          if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            nextMap[key] = rawUrl;
            continue;
          }

          try {
            const response = await fetch(rawUrl, {
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
      }

      if (cancelled) return;

      setImageBlobUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        return nextMap;
      });
    };

    void collectImageBlobUrls();

    return () => {
      cancelled = true;
      setImageBlobUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        return {};
      });
    };
  }, [isOpen, mode, chartImages, comparison, templateId]);

  const totalCodes = useMemo(() => {
    if (mode === "new" && comparison) return comparison.total_new_codes;
    return (codesData?.valora.length || 0) + (codesData?.kapital.length || 0);
  }, [mode, comparison, codesData]);

  const totalCharts = useMemo(() => {
    if (mode === "new" && comparison) return comparison.total_new_images;
    return (
      (chartImages?.valora.length || 0) + (chartImages?.kapital.length || 0)
    );
  }, [mode, comparison, chartImages]);

  if (!isOpen) return null;

  const allModeTitle = "Codigos y Graficos Extraidos";
  const newModeTitle = "Resultados de Re-Subida";

  const codeText = (value: string | { code: string }) =>
    typeof value === "string" ? value : value.code;

  const getAllModeImageSrc = (image: ChartImageItem) => {
    const key = `${image.filename}::${image.url || ""}`;
    return imageBlobUrls[key] || image.url;
  };

  const getNewModeImageSrc = (imageName: string) => {
    const key = `new::${imageName}`;
    return imageBlobUrls[key] || imageUrlFromName(imageName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-4 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === "new" ? newModeTitle : allModeTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{templateName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {mode === "new" && errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <TriangleAlert className="h-4 w-4" /> Errores
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((message, idx) => (
                <li key={idx}>- {message}</li>
              ))}
            </ul>
          </div>
        )}

        {loading || extracting ? (
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
              <p className="text-sm text-gray-600">
                {extracting
                  ? "Extrayendo codigos del Excel..."
                  : "Cargando datos..."}
              </p>
            </div>
          </div>
        ) : mode === "new" ? (
          comparison ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <div className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {comparison.total_new_codes}
                  </div>
                  <div className="text-sm text-purple-600">Codigos nuevos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    {comparison.total_new_images}
                  </div>
                  <div className="text-sm text-purple-600">Imagenes nuevas</div>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                  <h3 className="font-semibold text-blue-900">VALORA</h3>
                </div>
                <div className="p-4 space-y-4">
                  {comparison.new_codes.valora.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Codigos nuevos ({comparison.new_codes.valora.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {comparison.new_codes.valora.map((code, idx) => (
                          <span
                            key={`${codeText(code)}-${idx}`}
                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                          >
                            {codeText(code)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {comparison.new_images.valora.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Imagenes nuevas ({comparison.new_images.valora.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {comparison.new_images.valora.map((image, idx) => (
                          <div
                            key={`${image}-${idx}`}
                            className="overflow-hidden rounded-lg border border-blue-100 bg-blue-50"
                            title={image}
                          >
                            <div className="aspect-4/3 bg-white">
                              <img
                                src={getNewModeImageSrc(image)}
                                alt={image}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex items-start gap-2 px-3 py-2">
                              <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                              <span className="truncate text-xs text-blue-700">
                                {image}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {comparison.new_codes.valora.length === 0 &&
                    comparison.new_images.valora.length === 0 && (
                      <div className="text-sm text-gray-500 italic">
                        Sin cambios nuevos
                      </div>
                    )}
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-50 border-b border-green-200 px-4 py-3">
                  <h3 className="font-semibold text-green-900">KAPITAL</h3>
                </div>
                <div className="p-4 space-y-4">
                  {comparison.new_codes.kapital.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Codigos nuevos ({comparison.new_codes.kapital.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {comparison.new_codes.kapital.map((code, idx) => (
                          <span
                            key={`${codeText(code)}-${idx}`}
                            className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
                          >
                            {codeText(code)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {comparison.new_images.kapital.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Imagenes nuevas ({comparison.new_images.kapital.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {comparison.new_images.kapital.map((image, idx) => (
                          <div
                            key={`${image}-${idx}`}
                            className="overflow-hidden rounded-lg border border-green-100 bg-green-50"
                            title={image}
                          >
                            <div className="aspect-4/3 bg-white">
                              <img
                                src={getNewModeImageSrc(image)}
                                alt={image}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex items-start gap-2 px-3 py-2">
                              <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-600" />
                              <span className="truncate text-xs text-green-700">
                                {image}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {comparison.new_codes.kapital.length === 0 &&
                    comparison.new_images.kapital.length === 0 && (
                      <div className="text-sm text-gray-500 italic">
                        Sin cambios nuevos
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-500">
              <p className="font-medium">No hay datos de comparacion</p>
            </div>
          )
        ) : codesData && (totalCodes > 0 || totalCharts > 0) ? (
          <div className="space-y-6">
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

            {codesData.valora.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Valora
                  </span>
                  ({codesData.valora.length} codigos)
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Nombre
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Codigo
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Hoja
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {codesData.valora.map((code) => (
                        <tr key={code.id} className="hover:bg-green-50/50">
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {code.nombre}
                          </td>
                          <td className="px-3 py-2 font-mono text-blue-600">
                            {code.code}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {code.hoja || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {chartImages?.valora && chartImages.valora.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      Graficos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {chartImages.valora.map((image) => (
                        <div
                          key={image.filename}
                          className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={getAllModeImageSrc(image)}
                            alt={image.filename}
                            className="w-full h-32 object-cover cursor-pointer"
                            onClick={() =>
                              window.open(getAllModeImageSrc(image), "_blank")
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

            {codesData.kapital.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                    Kapital
                  </span>
                  ({codesData.kapital.length} codigos)
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs">
                    <thead className="bg-purple-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Nombre
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Codigo
                        </th>
                        <th className="px-3 py-2 text-left font-semibold text-gray-700">
                          Hoja
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {codesData.kapital.map((code) => (
                        <tr key={code.id} className="hover:bg-purple-50/50">
                          <td className="px-3 py-2 font-medium text-gray-900">
                            {code.nombre}
                          </td>
                          <td className="px-3 py-2 font-mono text-blue-600">
                            {code.code}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {code.hoja || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {chartImages?.kapital && chartImages.kapital.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">
                      Graficos
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {chartImages.kapital.map((image) => (
                        <div
                          key={image.filename}
                          className="rounded-lg border border-gray-200 overflow-hidden bg-gray-50 hover:shadow-lg transition-shadow"
                        >
                          <img
                            src={getAllModeImageSrc(image)}
                            alt={image.filename}
                            className="w-full h-32 object-cover cursor-pointer"
                            onClick={() =>
                              window.open(getAllModeImageSrc(image), "_blank")
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
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-500">
            <p className="font-medium">No hay codigos ni graficos asociados</p>
            <p className="text-sm mt-1">
              Esta vista muestra codigos ya vinculados a la plantilla maestra.
            </p>
            <p className="text-sm mt-1 text-green-600">
              Sube el Excel con los codigos para extraerlos y vincularlos a la
              plantilla.
            </p>
          </div>
        )}

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
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
