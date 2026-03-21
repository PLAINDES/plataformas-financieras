import { useEffect, useState } from "react";
import { BarChart3, Image as ImageIcon, TriangleAlert, X } from "lucide-react";

interface ReUploadComparisonModalProps {
  isOpen: boolean;
  templateName: string;
  comparison: {
    new_codes: {
      valora: string[];
      kapital: string[];
    };
    new_images: {
      valora: string[];
      kapital: string[];
    };
    total_new_codes: number;
    total_new_images: number;
  } | null;
  errors: string[];
  onClose: () => void;
}

export const ReUploadComparisonModal = ({
  isOpen,
  templateName,
  comparison,
  errors,
  onClose,
}: ReUploadComparisonModalProps) => {
  const [imageBlobUrls, setImageBlobUrls] = useState<Record<string, string>>(
    {}
  );

  const normalizeImageName = (image: string) => {
    const cleanName =
      image.split("?")[0].split("#")[0].split("/").pop() || image;
    return cleanName.replace(/\.(jpg|jpeg|png)$/i, "");
  };

  const imageKey = (image: string) => image;

  const imageUrl = (image: string) => {
    if (!image) return "";

    if (image.startsWith("http://") || image.startsWith("https://")) {
      return image;
    }

    if (image.startsWith("/api/") || image.startsWith("api/")) {
      return image.startsWith("/") ? image : `/${image}`;
    }

    const filename = normalizeImageName(image);
    return `/api/v1/main/master-templates/chart-file/${encodeURIComponent(
      filename
    )}`;
  };

  useEffect(() => {
    if (!isOpen || !comparison) return;

    let cancelled = false;

    const collectImages = async () => {
      const token = localStorage.getItem("auth_token");
      const nextMap: Record<string, string> = {};

      const allImages = [
        ...(comparison.new_images.valora || []),
        ...(comparison.new_images.kapital || []),
      ];

      for (const image of allImages) {
        const key = imageKey(image);
        const rawUrl = imageUrl(image);

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

      if (cancelled) return;

      setImageBlobUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        return nextMap;
      });
    };

    collectImages();

    return () => {
      cancelled = true;
      setImageBlobUrls((prev) => {
        Object.values(prev).forEach((url) => {
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
        return {};
      });
    };
  }, [comparison, isOpen]);

  const renderedImageSrc = (image: string) =>
    imageBlobUrls[imageKey(image)] || imageUrl(image);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5 sticky top-0 bg-white pb-4 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Resultados de Re-Subida
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

        <div className="space-y-6">
          {errors && errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                <TriangleAlert className="h-4 w-4" /> Errores
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {comparison && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <div className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {comparison.total_new_codes}
                  </div>
                  <div className="text-sm text-purple-600">Códigos nuevos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-700 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    {comparison.total_new_images}
                  </div>
                  <div className="text-sm text-purple-600">Imágenes nuevas</div>
                </div>
              </div>

              {/* VALORA Section */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                  <h3 className="font-semibold text-blue-900">VALORA</h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* New Codes */}
                  {comparison.new_codes.valora.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Códigos nuevos ({comparison.new_codes.valora.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {comparison.new_codes.valora.map(
                          (codeItem: any, idx) => {
                            const codeStr =
                              typeof codeItem === "string"
                                ? codeItem
                                : codeItem.code;
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                              >
                                {codeStr}
                              </span>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  {comparison.new_images.valora.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Imágenes nuevas ({comparison.new_images.valora.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {comparison.new_images.valora.map((image, idx) => (
                          <div
                            key={idx}
                            className="overflow-hidden rounded-lg border border-blue-100 bg-blue-50"
                            title={image}
                          >
                            <div className="aspect-4/3 bg-white">
                              <img
                                src={renderedImageSrc(image)}
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

              {/* KAPITAL Section */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-50 border-b border-green-200 px-4 py-3">
                  <h3 className="font-semibold text-green-900">KAPITAL</h3>
                </div>
                <div className="p-4 space-y-4">
                  {/* New Codes */}
                  {comparison.new_codes.kapital.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Códigos nuevos ({comparison.new_codes.kapital.length})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {comparison.new_codes.kapital.map(
                          (codeItem: any, idx) => {
                            const codeStr =
                              typeof codeItem === "string"
                                ? codeItem
                                : codeItem.code;
                            return (
                              <span
                                key={idx}
                                className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800"
                              >
                                {codeStr}
                              </span>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* New Images */}
                  {comparison.new_images.kapital.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Imágenes nuevas ({comparison.new_images.kapital.length})
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {comparison.new_images.kapital.map((image, idx) => (
                          <div
                            key={idx}
                            className="overflow-hidden rounded-lg border border-green-100 bg-green-50"
                            title={image}
                          >
                            <div className="aspect-4/3 bg-white">
                              <img
                                src={renderedImageSrc(image)}
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
          )}
        </div>

        <div className="flex justify-end mt-4">
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
