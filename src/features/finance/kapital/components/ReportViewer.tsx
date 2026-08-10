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
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
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
          if (!ignore) setIsSessionFresh(true);
        }

        if (!ignore) setLoaderState("generating");

        const [report, blob] = await Promise.all([
          MainService.getReport(Number(reportProductId)),
          MainService.generateReportPdf(reportProductId, calculationId!, true),
        ]);

        if (!ignore) {
          setPaymentLink(report.link_pago || null);
          localGeneratedUrl = URL.createObjectURL(blob);
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
      loadPdf();
    } else if (!isOpen) {
      setPdfUrl(null);
      setError(null);
      setPaymentLink(null);
      setLoaderState("idle");
    }

    return () => {
      ignore = true;
      if (localGeneratedUrl) URL.revokeObjectURL(localGeneratedUrl);
    };
  }, [
    isOpen,
    calculationId,
    reportProductId,
    isSessionFresh,
    prewarmedSessionId,
    setIsSessionFresh,
  ]);

  const handleIzipayPayment = () => {
    if (!paymentLink) {
      setError("Este reporte aun no tiene link de pago configurado.");
      return;
    }
    window.open(paymentLink, "_blank", "noopener,noreferrer");
  };

  if (!isOpen) return null;

  return (
    <section className="flex justify-center w-full px-4 pb-10 sm:px-8 lg:pt-6">
      <div className="w-full max-w-7xl rounded-lg border border-gray-200 bg-white shadow">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-200 px-4 py-3 gap-4">
          <h4 className="text-sm font-semibold text-gray-800 uppercase">
            VISTA PREVIA DEL REPORTE
          </h4>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cerrar
            </button>

            <button
              onClick={handleIzipayPayment}
              disabled={!pdfUrl}
              className="rounded bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <i className="fa-solid fa-credit-card"></i> Pagar y Descargar
            </button>
          </div>
        </div>

        <div className="h-[70vh] w-full bg-gray-100 flex items-center justify-center relative">
          <ReportLoader state={loaderState} isPaid={false} />
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
