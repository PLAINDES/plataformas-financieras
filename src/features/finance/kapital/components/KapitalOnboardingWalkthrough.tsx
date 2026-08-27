import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calculator, Building2, Globe, Landmark, ArrowRight, X } from "lucide-react";

const STORAGE_KEY_BASE = "kapital_tour_completed_v1";
const DEVICE_ID_KEY = "analytics_device_id";

function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `device-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
const getTourKey = () => `${STORAGE_KEY_BASE}:${getOrCreateDeviceId()}`;

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  placement: "right" | "bottom" | "center";
  icon?: React.ReactNode;
}

const STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Bienvenido a Kapital",
    description:
      "Calcula tu costo de capital (WACC) en segundos. Completa los inputs del panel izquierdo y presiona “Calcula tu WACC” para ver tus resultados al instante.",
    target: "[data-tour=\"kapital-welcome\"]",
    placement: "bottom",
    icon: <Calculator className="w-4 h-4" />,
  },
  {
    id: "industria",
    title: "Paso 1 — Inputs de la industria",
    description:
      "Selecciona fecha, sector, beta desapalancado y tasa libre de riesgo. Estos datos definen el riesgo operativo de tu industria y la tasa base del modelo.",
    target: "[data-tour=\"kapital-step-1\"]",
    placement: "right",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: "sector",
    title: "Paso 2 — Inputs del sector",
    description:
      "Elige el país. Automáticamente obtendrás la devaluación y la tasa impositiva del Marco Macroeconómico y reportes EY para tu mercado emergente.",
    target: "[data-tour=\"kapital-step-2\"]",
    placement: "right",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: "empresa",
    title: "Paso 3 — Inputs de su empresa",
    description:
      "Personaliza con el costo de deuda y tu estructura financiera (% deuda / % capital). Si los dejas vacíos, calculamos el WACC sectorial puro.",
    target: "[data-tour=\"kapital-step-3\"]",
    placement: "right",
    icon: <Landmark className="w-4 h-4" />,
  },
  {
    id: "calcular",
    title: "Paso 4 — Calcula tu WACC",
    description:
      "Cuando completes los campos obligatorios, presiona este botón. Generarás tus tres mercados (desarrollado, emergente y tu empresa) y podrás sensibilizar por subsector.",
    target: "[data-tour=\"kapital-calculate\"]",
    placement: "right",
    icon: <ArrowRight className="w-4 h-4" />,
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface KapitalOnboardingWalkthroughProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  showResults: boolean;
}

export const KapitalOnboardingWalkthrough: React.FC<KapitalOnboardingWalkthroughProps> = ({
  isFormOpen,
  setIsFormOpen,
  showResults,
}) => {
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = STEPS[current];
  const isLast = current === STEPS.length - 1;
  const isFirst = current === 0;

  const finish = useCallback(() => {
    localStorage.setItem(getTourKey(), "true");
    setActive(false);
  }, []);

  const skip = useCallback(() => {
    localStorage.setItem(getTourKey(), "true");
    setActive(false);
  }, []);

  const next = useCallback(() => {
    if (isLast) {
      finish();
    } else {
      setCurrent((c) => c + 1);
    }
  }, [isLast, finish]);

  const prev = useCallback(() => {
    setCurrent((c) => Math.max(0, c - 1));
  }, []);

  // Decide if tour should start — 1 vez por deviceId, aparece aunque occupation se cierre con X
  useEffect(() => {
    if (showResults) return;
    if (localStorage.getItem(getTourKey()) === "true") return;

    const startSoon = () => {
      window.setTimeout(() => {
        if (localStorage.getItem(getTourKey()) !== "true" && window.location.pathname === "/kapital" && !showResults) {
          setActive(true);
        }
      }, 350);
    };

    // Si occupation ya no está visible (completada o cerrada con X), arranca pronto
    const isOccupationModalOpen = () => !!document.querySelector('[role="dialog"]');
    if (!isOccupationModalOpen()) {
      const t = window.setTimeout(() => {
        if (window.location.pathname === "/kapital" && localStorage.getItem(getTourKey()) !== "true") {
          setActive(true);
        }
      }, 600);
      return () => window.clearTimeout(t);
    }

    // Espera a que occupation se cierre por cualquier vía (completar o X)
    const onOccupationDone = () => startSoon();
    const onOccupationDismissed = () => startSoon();
    window.addEventListener("kapital:occupationDone", onOccupationDone);
    window.addEventListener("kapital:occupationDismissed", onOccupationDismissed);

    // Fallback poll: si dialog desaparece, arranca
    const fallback = window.setInterval(() => {
      if (!isOccupationModalOpen()) {
        window.clearInterval(fallback);
        window.removeEventListener("kapital:occupationDone", onOccupationDone);
        window.removeEventListener("kapital:occupationDismissed", onOccupationDismissed);
        startSoon();
      }
    }, 400);

    const safety = window.setTimeout(() => window.clearInterval(fallback), 15000);

    return () => {
      window.removeEventListener("kapital:occupationDone", onOccupationDone);
      window.removeEventListener("kapital:occupationDismissed", onOccupationDismissed);
      window.clearInterval(fallback);
      window.clearTimeout(safety);
    };
  }, [showResults]);

  // Ensure correct sidebar state per step (welcome closed on mobile, sidebar steps open)
  useEffect(() => {
    if (!active) return;
    const s = STEPS[current];
    const isMobile = window.innerWidth <= 640;
    if (s.id === "welcome") {
      if (isMobile && isFormOpen) setIsFormOpen(false);
    } else if (!isFormOpen) {
      setIsFormOpen(true);
    }
  }, [active, current, isFormOpen, setIsFormOpen]);

  // Measure target rect
  const updateRect = useCallback(() => {
    if (!active) return;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    // Add small padding for highlight
    const pad = step.id === "welcome" ? 14 : 8;
    setTargetRect({
      top: r.top - pad,
      left: r.left - pad,
      width: r.width + pad * 2,
      height: r.height + pad * 2,
    });
  }, [active, step]);

  useLayoutEffect(() => {
    if (!active) return;
    updateRect();
    const onResize = () => updateRect();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    const id = window.setInterval(updateRect, 300);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      window.clearInterval(id);
    };
  }, [active, updateRect]);

  // Compute tooltip position
  useLayoutEffect(() => {
    if (!active || !targetRect) {
      setTooltipPos(null);
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tooltipW = 360;
    const tooltipH = tooltipRef.current?.offsetHeight || 220;
    const gap = 16;

    let top = 0;
    let left = 0;

    if (step.placement === "center" || (step.id === "welcome" && vw < 1024)) {
      // Center below welcome
      left = Math.max(16, Math.min(vw - tooltipW - 16, targetRect.left + targetRect.width / 2 - tooltipW / 2));
      top = targetRect.top + targetRect.height + gap;
      if (top + tooltipH > vh - 16) {
        top = Math.max(16, targetRect.top - tooltipH - gap);
      }
    } else if (step.placement === "bottom") {
      left = Math.max(16, Math.min(vw - tooltipW - 16, targetRect.left + targetRect.width / 2 - tooltipW / 2));
      top = targetRect.top + targetRect.height + gap;
      if (top + tooltipH > vh - 16) {
        // flip to top
        top = targetRect.top - tooltipH - gap;
      }
      if (top < 16) top = 16;
    } else if (step.placement === "right") {
      left = targetRect.left + targetRect.width + gap;
      top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
      // Clamp
      if (left + tooltipW > vw - 16) {
        // not enough space on right, place bottom
        left = Math.max(16, Math.min(vw - tooltipW - 16, targetRect.left + targetRect.width / 2 - tooltipW / 2));
        top = targetRect.top + targetRect.height + gap;
        if (top + tooltipH > vh - 16) top = vh - tooltipH - 16;
      }
      if (top < 16) top = 16;
      if (top + tooltipH > vh - 16) top = vh - tooltipH - 16;
    }

    setTooltipPos({ top, left });
  }, [active, targetRect, step]);

  // Keyboard
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, prev, skip]);

  if (!active) return null;
  if (showResults) return null;

  const overlayPieces = targetRect
    ? [
        // top
        { top: 0, left: 0, width: "100%", height: targetRect.top },
        // bottom
        { top: targetRect.top + targetRect.height, left: 0, width: "100%", height: `calc(100% - ${targetRect.top + targetRect.height}px)` },
        // left
        { top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height },
        // right
        { top: targetRect.top, left: targetRect.left + targetRect.width, width: `calc(100% - ${targetRect.left + targetRect.width}px)`, height: targetRect.height },
      ]
    : [];

  return createPortal(
    <div className="fixed inset-0 z-[85] pointer-events-auto" aria-modal="true" role="dialog">
      {/* Overlay pieces with extremely low blur */}
      {targetRect ? (
        <>
          {overlayPieces.map((p, i) => (
            <div
              key={i}
              className="absolute bg-[#0b1a33]/[0.14] backdrop-blur-[1.2px]"
              style={{
                top: typeof p.top === "number" ? p.top : (p.top as string),
                left: typeof p.left === "number" ? p.left : (p.left as string),
                width: typeof p.width === "number" ? p.width : (p.width as string),
                height: typeof p.height === "number" ? p.height : (p.height as string),
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)",
                backgroundSize: "18px 18px",
              }}
            />
          ))}
          {/* Highlight border */}
          <div
            className="absolute rounded-[14px] border-[2.5px] border-[#2563eb] shadow-[0_0_0_4px_rgba(37,99,235,0.14),0_10px_30px_rgba(2,12,36,0.18)] pointer-events-none transition-all duration-300 ease-out"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              background: "transparent",
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#0b1a33]/[0.14] backdrop-blur-[1.2px]" />
      )}

      {/* Tooltip */}
      {tooltipPos && (
        <div
          ref={tooltipRef}
          className="fixed w-[360px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.18),0_4px_12px_rgba(15,23,42,0.10)] border border-slate-200/70 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          {/* Header with form-like typography */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] border border-[#dbeafe] px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-[#2563eb]">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#2563eb] text-white text-[11px] font-bold">
                  {current + 1}
                </span>
                Paso {current + 1} de {STEPS.length}
              </span>
              <button
                onClick={skip}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Cerrar tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="flex items-center gap-2 text-[15px] font-bold leading-tight tracking-tight text-slate-900">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">
                {step.icon}
              </span>
              {step.title}
            </h3>
            <p className="mt-2 text-[13px] leading-[1.55] text-slate-600 font-medium">
              {step.description}
            </p>
          </div>

          {/* Footer actions - same style as form */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/70 border-t border-slate-100">
            <button
              onClick={skip}
              className="text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-white"
            >
              Omitir tour
            </button>

            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={prev}
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all"
                >
                  Atrás
                </button>
              )}
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-[0_4px_12px_rgba(37,99,235,0.30)] active:scale-[0.98] transition-all"
              >
                {isLast ? "Entendido" : "Siguiente"}
                {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-1.5 pb-3 bg-slate-50/70">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-6 bg-[#2563eb]" : i < current ? "w-1.5 bg-[#93c5fd]" : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile progress bar top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30">
        <div
          className="h-full bg-[#2563eb] transition-all duration-300"
          style={{ width: `${((current + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>,
    document.body
  );
};
