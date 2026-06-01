import { useState, useEffect } from "react";
import { MainService } from "@/shared/services/main.service";
import {
  ReportLoader,
  type ReportLoaderState,
} from "@/shared/components/common/Loader";

export type ReportViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  reportProductId: string;
  calculationId?: number | string | null;
  isSessionFresh?: boolean;
  setIsSessionFresh: (val: boolean) => void;
  prewarmedSessionId?: string | null;
};

export const ReportViewer: React.FC<ReportViewerProps> = ({
  isOpen,
  onClose,
  reportProductId,
  calculationId,
  isSessionFresh = false,
  setIsSessionFresh,
  prewarmedSessionId = null,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loaderState, setLoaderState] = useState<ReportLoaderState>("idle");

  useEffect(() => {
    let ignore = false;
    let localGeneratedUrl: string | null = null;

    const loadPdf = async () => {
      try {
        setError(null);

        if (!isSessionFresh) {
          if (!ignore) setLoaderState("refreshing");
          await MainService.refreshCalculation(
            Number(calculationId),
            prewarmedSessionId
          );
          if (!ignore) {
            // Notificamos al padre que la sesión ya está fresca para evitar futuros refreshes
            setIsSessionFresh(true);
          }
        }

        if (!ignore) {
          // Si viene de darle al botón de pagar, mantenemos el loader en "payment" un segundo más
          // Si es flujo normal, pasa a "generating"
          setLoaderState((prev) =>
            prev === "payment" ? "generating" : "generating"
          );
        }

        // Si isPaid es false, pide vista previa (true). Si isPaid es true, pide documento completo (false).
        const isPreviewMode = !isPaid;
        const blob = await MainService.generateReportPdf(
          reportProductId,
          calculationId!,
          isPreviewMode
        );

        if (!ignore) {
          localGeneratedUrl = URL.createObjectURL(blob);

          // Libera la memoria de la URL anterior antes de asignar la nueva
          setPdfUrl((prevUrl) => {
            if (prevUrl) URL.revokeObjectURL(prevUrl);
            return localGeneratedUrl;
          });
          setLoaderState("success");
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo generar el reporte."
          );
          setLoaderState("error");
        }
      }
    };

    if (isOpen && calculationId && reportProductId) {
      // Retraso para simular transición si viene de pago
      if (loaderState === "payment") {
        setTimeout(() => {
          if (!ignore) loadPdf();
        }, 800);
      } else {
        loadPdf();
      }
    } else {
      if (!isOpen) {
        setPdfUrl(null);
        setError(null);
        setIsPaid(false);
        setLoaderState("idle");
      }
    }

    return () => {
      ignore = true;
      if (localGeneratedUrl) {
        URL.revokeObjectURL(localGeneratedUrl);
      }
    };
  }, [isOpen, calculationId, reportProductId, isPaid]);

  const handleIzipayPayment = () => {
    setLoaderState("payment");
    setTimeout(() => setIsPaid(true), 1500);
  };

  if (!isOpen) return null;

  return (
    <section className="flex justify-center w-full px-4 pb-10 sm:px-8 lg:pt-6">
      <div className="w-full max-w-7xl rounded-lg border border-gray-200 bg-white shadow">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 px-4 py-3 gap-4">
          <h4 className="text-sm font-semibold text-gray-800 uppercase">
            {isPaid ? "REPORTE COMPLETO" : "VISTA PREVIA DEL REPORTE"}
          </h4>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>

            {isPaid ? (
              <a
                href={pdfUrl || "#"}
                download={`Reporte-${reportProductId}.pdf`}
                className="rounded bg-green-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-700 flex items-center gap-2 transition-colors"
              >
                <i className="fa-solid fa-download"></i> Descargar Reporte
              </a>
            ) : (
              <button
                onClick={handleIzipayPayment}
                disabled={!pdfUrl}
                className="rounded bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                <i className="fa-solid fa-credit-card"></i> Pagar y Descargar
              </button>
            )}
          </div>
        </div>

        <div className="h-[70vh] w-full bg-gray-100 flex items-center justify-center relative">
          {/*isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600 mb-4"></i>
              <p className="text-sm font-medium text-gray-600">
                {isPaid
                  ? "Desbloqueando documento completo..."
                  : "Generando documento..."}
              </p>
            </div>
          )*/}
          <ReportLoader state={loaderState} isPaid={isPaid} />
          {error && (
            <div className="text-center p-6">
              <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500 mb-2"></i>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          )}

          {pdfUrl && !error && (
            <iframe
              title="Reporte de capital"
              src={pdfUrl}
              className="h-full w-full border-0"
            />
          )}
        </div>
      </div>
    </section>
  );
};
