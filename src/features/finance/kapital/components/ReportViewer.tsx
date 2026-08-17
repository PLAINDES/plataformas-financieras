import { useEffect, useRef, useState } from "react";
import { PaymentService } from "@/features/payments/api/payment.service";
import type { PaymentDiagnosticState } from "@/features/payments/types/payment.types";
import {
  ReportLoader,
  type ReportLoaderState,
} from "@/shared/components/common/Loader";
import { MainService } from "@/shared/services/main.service";

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
  const [paymentState, setPaymentState] =
    useState<PaymentDiagnosticState>("idle");
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [loaderState, setLoaderState] = useState<ReportLoaderState>("idle");
  const paymentWindowRef = useRef<Window | null>(null);
  const paymentWindowTimerRef = useRef<number | null>(null);

  const stopPaymentWindowWatch = () => {
    if (paymentWindowTimerRef.current !== null) {
      window.clearInterval(paymentWindowTimerRef.current);
      paymentWindowTimerRef.current = null;
    }
  };

  useEffect(
    () => () => {
      stopPaymentWindowWatch();
      paymentWindowRef.current?.close();
    },
    []
  );

  useEffect(() => {
    let ignore = false;
    let localGeneratedUrl: string | null = null;

    const loadPdf = async () => {
      try {
        setError(null);
        setPaymentState("idle");
        setPaymentMessage(null);

        if (!isSessionFresh) {
          if (!ignore) setLoaderState("refreshing");
          await MainService.refreshCalculation(
            Number(calculationId),
            prewarmedSessionId
          );
          if (!ignore) setIsSessionFresh(true);
        }

        if (!ignore) setLoaderState("generating");
        const blob = await MainService.generateReportPdf(
          reportProductId,
          calculationId!,
          true
        );

        if (!ignore) {
          localGeneratedUrl = URL.createObjectURL(blob);
          setPdfUrl((previousUrl) => {
            if (previousUrl) URL.revokeObjectURL(previousUrl);
            return localGeneratedUrl;
          });
          setLoaderState("success");
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo generar el reporte."
          );
          setLoaderState("error");
        }
      }
    };

    if (isOpen && calculationId && reportProductId) loadPdf();

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

  const handleCulqiPayment = async () => {
    const reportId = Number(reportProductId);
    const currentCalculationId = Number(calculationId);
    if (!Number.isFinite(reportId) || !Number.isFinite(currentCalculationId)) {
      setPaymentState("error");
      setPaymentMessage("No se pudo identificar el reporte o el calculo.");
      return;
    }

    const popupWidth = 760;
    const popupHeight = 720;
    const popupLeft = Math.max(
      0,
      window.screenX + (window.outerWidth - popupWidth) / 2
    );
    const popupTop = Math.max(
      0,
      window.screenY + (window.outerHeight - popupHeight) / 2
    );
    const paymentWindow = window.open(
      "about:blank",
      "certprox-payment",
      `popup=yes,width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop}`
    );
    if (!paymentWindow) {
      setPaymentState("error");
      setPaymentMessage(
        "El navegador bloqueo la ventana de pago. Habilita las ventanas emergentes e intenta nuevamente."
      );
      return;
    }

    paymentWindow.document.title = "Preparando pago...";
    paymentWindow.document.body.innerHTML =
      "<p style='font-family:sans-serif;text-align:center;margin-top:48px'>Preparando pago seguro...</p>";
    paymentWindowRef.current = paymentWindow;
    setPaymentState("validating");
    setPaymentMessage("Creando la sesion segura de pago...");

    try {
      const session = await PaymentService.createSession({
        report_id: reportId,
        calculation_id: currentCalculationId,
      });
      paymentWindow.location.replace(session.checkout_url);
      setPaymentState("waiting");
      setPaymentMessage("Procediendo con el pago...");
      stopPaymentWindowWatch();
      paymentWindowTimerRef.current = window.setInterval(() => {
        if (!paymentWindow.closed) return;
        stopPaymentWindowWatch();
        paymentWindowRef.current = null;
        setPaymentState("cancelled");
        setPaymentMessage(
          "La ventana de pago fue cerrada. El pago no fue confirmado."
        );
      }, 500);
    } catch (paymentError) {
      paymentWindow.close();
      paymentWindowRef.current = null;
      setPaymentState("error");
      setPaymentMessage(
        paymentError instanceof Error
          ? paymentError.message
          : "No se pudo crear la sesion de pago."
      );
    }
  };

  if (!isOpen) return null;
  const paymentInProgress =
    paymentState === "validating" || paymentState === "waiting";

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
              onClick={handleCulqiPayment}
              disabled={!pdfUrl || paymentInProgress}
              className="rounded bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              <i className="fa-solid fa-credit-card" />
              {paymentInProgress ? "Pago en proceso..." : "Pagar y Descargar"}
            </button>
          </div>
        </div>

        {paymentMessage && (
          <div
            aria-live="polite"
            className={`border-b px-4 py-2 text-xs font-medium ${
              paymentState === "error"
                ? "border-red-100 bg-red-50 text-red-700"
                : paymentState === "cancelled"
                  ? "border-amber-100 bg-amber-50 text-amber-700"
                  : "border-blue-100 bg-blue-50 text-blue-700"
            }`}
          >
            {paymentMessage}
          </div>
        )}

        <div className="h-[70vh] w-full bg-gray-100 flex items-center justify-center relative">
          <ReportLoader state={loaderState} isPaid={false} />
          {error && (
            <div className="text-center p-6">
              <i className="fa-solid fa-triangle-exclamation text-3xl text-red-500 mb-2" />
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

      {paymentInProgress && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-label="Pago en proceso"
        >
          <div className="flex min-w-64 flex-col items-center rounded-2xl bg-white px-10 py-9 shadow-2xl">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
            <p className="mt-5 text-sm font-semibold text-slate-800">
              Procediendo con el pago...
            </p>
            <p className="mt-2 max-w-72 text-center text-xs text-slate-500">
              Completa el proceso en la ventana segura de Platinumarket.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
