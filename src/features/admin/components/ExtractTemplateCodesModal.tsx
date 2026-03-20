import { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TemplateCode {
  code: string;
  nombre: string;
  hoja: string;
  type: "valora" | "kapital";
}

interface ChartImage {
  filename: string;
  url: string;
  size: number;
  created_at?: string;
}

interface ExtractedCodesData {
  template_id: number;
  template_name: string;
  template_version?: string;
  codes: {
    valora: TemplateCode[];
    kapital: TemplateCode[];
  };
  statistics: {
    total_codes: number;
    valora_codes: number;
    kapital_codes: number;
    sheets_processed: number;
    sheets: Array<{
      name: string;
      type: "valora" | "kapital";
      codes_count: number;
    }>;
  };
  chart_extraction_stats?: {
    total: number;
    valora: number;
    kapital: number;
  };
  extracted_chart_images?: {
    valora: ChartImage[];
    kapital: ChartImage[];
  };
  success: boolean;
}

interface ExtractTemplateCodesModalProps {
  isOpen: boolean;
  templateId: number;
  templateName: string;
  templateVersion?: string;
  onClose: () => void;
  onSuccess?: (data: ExtractedCodesData) => void;
}

export function ExtractTemplateCodesModal({
  isOpen,
  templateId,
  templateName,
  templateVersion,
  onClose,
  onSuccess,
}: ExtractTemplateCodesModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedCodesData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleExtractCodes = async () => {
    setIsLoading(true);
    setError(null);
    setExtractedData(null);

    try {
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
      setExtractedData(data);
      onSuccess?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Extraer Códigos de Plantilla</span>
            {templateVersion && (
              <Badge variant="outline">{templateVersion}</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {templateName} - Se analizarán las hojas "Plantilla Usuario"
            (VALORA) y "WACC" (KAPITAL)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Estado de carga */}
          {isLoading && !extractedData && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">
                Analizando archivo Excel...
              </p>
              <p className="text-xs text-gray-500">
                Esto puede tomar unos momentos
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Resultados */}
          {extractedData && (
            <div className="space-y-6">
              {/* Estadísticas */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-blue-900">
                    Extracción Completada
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-white rounded p-3 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">
                      {extractedData.statistics.total_codes}
                    </div>
                    <div className="text-xs text-gray-600">Códigos Totales</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">
                      {extractedData.statistics.valora_codes}
                    </div>
                    <div className="text-xs text-gray-600">Códigos VALORA</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-orange-100">
                    <div className="text-2xl font-bold text-orange-600">
                      {extractedData.statistics.kapital_codes}
                    </div>
                    <div className="text-xs text-gray-600">Códigos KAPITAL</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-green-100">
                    <div className="text-2xl font-bold text-green-600">
                      {extractedData.statistics.sheets_processed}
                    </div>
                    <div className="text-xs text-gray-600">
                      Hojas Procesadas
                    </div>
                  </div>
                  {extractedData.chart_extraction_stats && (
                    <div className="bg-white rounded p-3 border border-cyan-100">
                      <div className="text-2xl font-bold text-cyan-600">
                        {extractedData.chart_extraction_stats.total}
                      </div>
                      <div className="text-xs text-gray-600">Gráficos</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hojas procesadas */}
              {extractedData.statistics.sheets.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">
                    Hojas Procesadas:
                  </h4>
                  <div className="space-y-2">
                    {extractedData.statistics.sheets.map((sheet) => (
                      <div
                        key={sheet.name}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                      >
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {sheet.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            {sheet.codes_count} código(s) extraído(s)
                          </p>
                        </div>
                        <Badge
                          variant={
                            sheet.type === "valora" ? "secondary" : "default"
                          }
                        >
                          {sheet.type.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Códigos VALORA */}
              {extractedData.codes.valora.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Badge className="bg-purple-600">VALORA</Badge>
                    Códigos Extraídos ({extractedData.codes.valora.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {extractedData.codes.valora.map((code, idx) => (
                      <div
                        key={`${code.code}-${idx}`}
                        className="p-3 bg-purple-50 border border-purple-200 rounded text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-mono font-bold text-purple-700">
                              {code.code}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {code.nombre}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Hoja: {code.hoja}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            VALORA
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Códigos KAPITAL */}
              {extractedData.codes.kapital.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                    <Badge className="bg-orange-600">KAPITAL</Badge>
                    Códigos Extraídos ({extractedData.codes.kapital.length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {extractedData.codes.kapital.map((code, idx) => (
                      <div
                        key={`${code.code}-${idx}`}
                        className="p-3 bg-orange-50 border border-orange-200 rounded text-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-mono font-bold text-orange-700">
                              {code.code}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {code.nombre}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Hoja: {code.hoja}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            KAPITAL
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gráficos Extraídos */}
              {extractedData.extracted_chart_images &&
                (extractedData.extracted_chart_images.valora.length > 0 ||
                  extractedData.extracted_chart_images.kapital.length > 0) && (
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Gráficos Extraídos (
                      {extractedData.chart_extraction_stats?.total || 0})
                    </h4>

                    {/* Gráficos VALORA */}
                    {extractedData.extracted_chart_images.valora.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          VALORA (
                          {extractedData.extracted_chart_images.valora.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                          {extractedData.extracted_chart_images.valora.map(
                            (chart) => (
                              <a
                                key={chart.filename}
                                href={chart.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative bg-gray-100 rounded border border-gray-300 overflow-hidden hover:border-purple-500 transition-colors"
                              >
                                <img
                                  src={chart.url}
                                  alt={chart.filename}
                                  className="w-full h-20 object-cover group-hover:opacity-75 transition-opacity"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                                <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                  {chart.filename}
                                </p>
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Gráficos KAPITAL */}
                    {extractedData.extracted_chart_images.kapital.length >
                      0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          KAPITAL (
                          {extractedData.extracted_chart_images.kapital.length})
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                          {extractedData.extracted_chart_images.kapital.map(
                            (chart) => (
                              <a
                                key={chart.filename}
                                href={chart.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative bg-gray-100 rounded border border-gray-300 overflow-hidden hover:border-orange-500 transition-colors"
                              >
                                <img
                                  src={chart.url}
                                  alt={chart.filename}
                                  className="w-full h-20 object-cover group-hover:opacity-75 transition-opacity"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                                <p className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                  {chart.filename}
                                </p>
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {/* Sin códigos */}
              {extractedData.codes.valora.length === 0 &&
                extractedData.codes.kapital.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No se encontraron códigos con formato $$XXX$$ en el
                      archivo
                    </AlertDescription>
                  </Alert>
                )}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            {!extractedData && (
              <Button
                onClick={handleExtractCodes}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extrayendo...
                  </>
                ) : (
                  "Extraer Códigos del Excel"
                )}
              </Button>
            )}
            {extractedData && (
              <Button
                variant="outline"
                onClick={() => setExtractedData(null)}
                className="flex-1"
              >
                Extraer de Nuevo
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              {extractedData ? "Cerrar" : "Cancelar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
