import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calculator, Building2, Globe, Landmark, ArrowRight, X, Layers, List, ToggleLeft, Scale, CheckCircle2 } from "lucide-react";

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
    description: "Calcula tu costo de capital (WACC) en segundos. Completa los inputs del panel izquierdo y presiona “Calcula tu WACC” para ver tus resultados al instante.",
    target: "[data-tour=\"kapital-welcome\"]",
    placement: "bottom",
    icon: <Calculator className="w-4 h-4" />,
  },
  {
    id: "industria",
    title: "Paso 1 — Inputs de la industria",
    description: "Selecciona fecha, sector, beta desapalancado y tasa libre de riesgo. Estos datos definen el riesgo operativo de tu industria y la tasa base del modelo.",
    target: "[data-tour=\"kapital-step-1\"]",
    placement: "right",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: "sector",
    title: "Paso 2 — Inputs del sector",
    description: "Elige el país. Automáticamente obtendrás la devaluación y la tasa impositiva del Marco Macroeconómico y reportes EY para tu mercado emergente.",
    target: "[data-tour=\"kapital-step-2\"]",
    placement: "right",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    id: "empresa",
    title: "Paso 3 — Inputs de su empresa",
    description: "Personaliza con el costo de deuda y tu estructura financiera (% deuda / % capital). Si los dejas vacíos, calculamos el WACC sectorial puro.",
    target: "[data-tour=\"kapital-step-3\"]",
    placement: "right",
    icon: <Landmark className="w-4 h-4" />,
  },
  {
    id: "calcular",
    title: "Paso 4 — Calcula tu WACC",
    description: "Cuando completes los campos obligatorios, presiona este botón. Generarás tus tres mercados (desarrollado, emergente y tu empresa) y podrás sensibilizar por subsector.",
    target: "[data-tour=\"kapital-calculate\"]",
    placement: "right",
    icon: <ArrowRight className="w-4 h-4" />,
  },
];

const SENSITIVITY_STEPS: TourStep[] = [
  {
    id: "sens-sensibiliza",
    title: "Paso 5 — Sensibiliza tu Beta",
    description: "Su WACC base ya está calculado. Desde aquí puede refinar el análisis ajustando el beta desapalancado o seleccionando un subsector comparable para obtener un beta más preciso. Pulse \"Obtén Tu Beta Por Subsector\" para continuar.",
    target: "[data-tour=\"kapital-beta-sensitivity\"]",
    placement: "right",
    icon: <Calculator className="w-4 h-4" />,
  },
  {
    id: "sens-subsector-list",
    title: "Explore los subsectores disponibles",
    description: "Este panel reúne los subsectores de su industria. Cada tarjeta muestra el número de empresas comparables y su BOA ponderado. Hemos resaltado un subsector aleatoriamente: selecciónelo para examinar su composición.",
    target: "[data-tour=\"kapital-subsector-list\"]",
    placement: "right",
    icon: <Layers className="w-4 h-4" />,
  },
  {
    id: "sens-empresas",
    title: "Empresas del subsector",
    description: "Aquí visualiza la muestra completa del subsector: cada fila corresponde a una empresa cotizada con su activo de mercado y su beta desapalancado individual. La transparencia de la muestra le permite evaluar la representatividad del comparable.",
    target: "[data-tour=\"kapital-subsector-empresas\"]",
    placement: "right",
    icon: <List className="w-4 h-4" />,
  },
  {
    id: "sens-ticker",
    title: "Personalice la muestra",
    description: "Si alguna empresa no resulta comparable para su caso, puede deshabilitarla con el icono de exclusión. Al desactivar un ticker, su activo y su beta se excluyen automáticamente del cálculo posterior.",
    target: "[data-tour=\"kapital-ticker-row\"]",
    placement: "right",
    icon: <ToggleLeft className="w-4 h-4" />,
  },
  {
    id: "sens-boa",
    title: "BOA Ponderado del subsector",
    description: "El BOA ponderado se obtiene como la suma de cada beta desapalancado multiplicado por su peso relativo (activo de mercado de la empresa dividido entre el total de activos de la muestra activa). Representa el riesgo operativo promedio del subsector seleccionado.",
    target: "[data-tour=\"kapital-boa-ponderado\"]",
    placement: "right",
    icon: <Scale className="w-4 h-4" />,
  },
  {
    id: "sens-calcular",
    title: "Aplique la sensibilización",
    description: "Pulse \"Calcular con N empresas — BOA X.XX\" para incorporar este beta ponderado a su sensibilización. El sistema recalculará su WACC utilizando el nuevo beta y registrará el escenario en su análisis.",
    target: "[data-tour=\"kapital-calcular-subsector\"]",
    placement: "right",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
];

interface Rect { top: number; left: number; width: number; height: number; }

interface KapitalOnboardingWalkthroughProps {
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  showResults: boolean;
  startSensitivityTour?: boolean;
  onSensitivityTourEnd?: () => void;
}

export const KapitalOnboardingWalkthrough: React.FC<KapitalOnboardingWalkthroughProps> = ({
  isFormOpen,
  setIsFormOpen,
  showResults,
  startSensitivityTour = false,
  onSensitivityTourEnd,
}) => {
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState(0);
  const [sensitivityMode, setSensitivityMode] = useState(false);
  const [highlightSubsectorIdx, setHighlightSubsectorIdx] = useState<number | null>(null);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const activeSteps = sensitivityMode ? SENSITIVITY_STEPS : STEPS;
  const stepRaw = activeSteps[current] ?? activeSteps[0];
  const stepTarget = (() => {
    if (sensitivityMode && stepRaw.id === "sens-subsector-list" && highlightSubsectorIdx !== null) {
      return `[data-tour="kapital-subsector-item"][data-index="${highlightSubsectorIdx}"]`;
    }
    return stepRaw.target;
  })();
  const stepId = stepRaw.id;
  const stepPlacement = stepRaw.placement;

  const isLast = current === activeSteps.length - 1;

  const finish = useCallback(() => {
    if (!sensitivityMode) localStorage.setItem(getTourKey(), "true");
    else onSensitivityTourEnd?.();
    setActive(false);
    setSensitivityMode(false);
  }, [sensitivityMode, onSensitivityTourEnd]);

  const skip = useCallback(() => {
    if (!sensitivityMode) localStorage.setItem(getTourKey(), "true");
    else onSensitivityTourEnd?.();
    setActive(false);
    setSensitivityMode(false);
  }, [sensitivityMode, onSensitivityTourEnd]);

  const next = useCallback(() => {
    if (!sensitivityMode) {
      if (isLast) finish();
      else setCurrent((c) => c + 1);
      return;
    }
    // sensitivity flow
    if (stepRaw.id === "sens-sensibiliza") {
      const betaButton = (document.querySelector('[data-tour="kapital-beta-sensitivity-btn"]') || document.querySelector('[data-tour="kapital-beta-sensitivity"] button') || document.querySelector('[data-tour="kapital-beta-sensitivity"]')) as HTMLElement | null;
      betaButton?.click();
      // poll ultra-rápido (16ms) para que PASO 2 aparezca en milisegundos
      const start = Date.now();
      const poll = window.setInterval(() => {
        const items = document.querySelectorAll('[data-tour="kapital-subsector-item"]');
        if (items.length > 0) {
          const rnd = Math.floor(Math.random() * items.length);
          setHighlightSubsectorIdx(rnd);
          window.clearInterval(poll);
          setCurrent((c) => c + 1);
        } else if (Date.now() - start > 800) {
          window.clearInterval(poll);
          setCurrent((c) => c + 1);
        }
      }, 16);
      return;
    }
    if (stepRaw.id === "sens-subsector-list") {
      if (highlightSubsectorIdx !== null) {
        const el = document.querySelector(`[data-tour="kapital-subsector-item"][data-index="${highlightSubsectorIdx}"]`) as HTMLElement | null;
        el?.click();
      }
      window.setTimeout(() => setCurrent((c) => c + 1), 30);
      return;
    }
    if (isLast) {
      finish();
    } else {
      setCurrent((c) => c + 1);
    }
  }, [sensitivityMode, isLast, finish, stepRaw, highlightSubsectorIdx]);

  // Decide if tour should start
  useEffect(() => {
    if (startSensitivityTour) {
      setSensitivityMode(true);
      setCurrent(0);
      setHighlightSubsectorIdx(null);
      setIsFormOpen(true);
      const timer = window.setTimeout(() => setActive(true), 30);
      return () => window.clearTimeout(timer);
    }
    if (showResults) return;
    if (localStorage.getItem(getTourKey()) === "true") return;
    const startSoon = () => {
      window.setTimeout(() => {
        if (localStorage.getItem(getTourKey()) !== "true" && window.location.pathname === "/kapital" && !showResults) {
          setSensitivityMode(false);
          setCurrent(0);
          setActive(true);
        }
      }, 80);
    };
    const isOccupationModalOpen = () => !!document.querySelector('[role="dialog"]');
    if (!isOccupationModalOpen()) {
      const t = window.setTimeout(() => {
        if (window.location.pathname === "/kapital" && localStorage.getItem(getTourKey()) !== "true") {
          setSensitivityMode(false);
          setCurrent(0);
          setActive(true);
        }
      }, 80);
      return () => window.clearTimeout(t);
    }
    const onOccupationDone = () => startSoon();
    const onOccupationDismissed = () => startSoon();
    window.addEventListener("kapital:occupationDone", onOccupationDone);
    window.addEventListener("kapital:occupationDismissed", onOccupationDismissed);
    const fallback = window.setInterval(() => {
      if (!isOccupationModalOpen()) {
        window.clearInterval(fallback);
        window.removeEventListener("kapital:occupationDone", onOccupationDone);
        window.removeEventListener("kapital:occupationDismissed", onOccupationDismissed);
        startSoon();
      }
    }, 50);
    const safety = window.setTimeout(() => window.clearInterval(fallback), 15000);
    return () => {
      window.removeEventListener("kapital:occupationDone", onOccupationDone);
      window.removeEventListener("kapital:occupationDismissed", onOccupationDismissed);
      window.clearInterval(fallback);
      window.clearTimeout(safety);
    };
  }, [showResults, startSensitivityTour, setIsFormOpen]);

  const isFormOpenRef = useRef(isFormOpen);
  useEffect(() => { isFormOpenRef.current = isFormOpen; }, [isFormOpen]);
  useEffect(() => {
    if (!active) return;
    const s = stepRaw;
    const isMobile = window.innerWidth <= 640;
    if (isMobile) {
      const shouldOpen = s.id !== "welcome";
      if (isFormOpenRef.current !== shouldOpen) setIsFormOpen(shouldOpen);
    } else if (s.id !== "welcome" && !isFormOpenRef.current) {
      setIsFormOpen(true);
    }
  }, [active, current, stepRaw, setIsFormOpen]);

  // si PASO 2 quedó sin highlight porque datos aún cargaban, asigna al llegar datos
  useEffect(() => {
    if (!active || !sensitivityMode || stepRaw.id !== "sens-subsector-list" || highlightSubsectorIdx !== null) return;
    const id = window.setInterval(() => {
      const items = document.querySelectorAll('[data-tour="kapital-subsector-item"]');
      if (items.length > 0) {
        const rnd = Math.floor(Math.random() * items.length);
        setHighlightSubsectorIdx(rnd);
        window.clearInterval(id);
      }
    }, 100);
    const tout = window.setTimeout(() => window.clearInterval(id), 5000);
    return () => { window.clearInterval(id); window.clearTimeout(tout); };
  }, [active, sensitivityMode, stepRaw.id, highlightSubsectorIdx]);

  const updateRect = useCallback(() => {
    if (!active) return;
    let el = document.querySelector(stepTarget) as HTMLElement | null;
    if (!el && stepId === "sens-sensibiliza") {
      el = (document.querySelector('[data-tour="kapital-beta-sensitivity-btn"]') || document.querySelector('[data-tour="kapital-beta-sensitivity"]')) as HTMLElement | null;
    }
    if (!el && stepId === "sens-ticker") {
      const rows = document.querySelectorAll('[data-tour="kapital-ticker-row"]');
      if (rows.length > 0) {
        const idx = Math.min(1, rows.length - 1);
        el = rows[idx] as HTMLElement;
      }
    }
    let next: Rect | null = null;
    if (!el) {
      if (stepId === "sens-subsector-list") {
        const fallback = document.querySelector('[data-tour="kapital-subsector-list"]') as HTMLElement | null;
        if (fallback) {
          const r = fallback.getBoundingClientRect();
          const pad = 8;
          next = { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
        }
      } else if (["sens-empresas","sens-ticker","sens-boa","sens-calcular"].includes(stepId)) {
        const fb = document.querySelector('[data-tour="kapital-subsector-detail"]') as HTMLElement | null;
        if (fb) {
          const r = fb.getBoundingClientRect();
          const pad = 8;
          next = { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
        }
      }
      setTargetRect((prev) => {
        if (!next && !prev) return prev;
        if (!next || !prev) return next;
        if (Math.abs(prev.top-next.top)<0.5 && Math.abs(prev.left-next.left)<0.5 && Math.abs(prev.width-next.width)<0.5 && Math.abs(prev.height-next.height)<0.5) return prev;
        return next;
      });
      return;
    }
    const r = el.getBoundingClientRect();
    const pad = stepId === "welcome" ? 14 : 8;
    next = { top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 };
    setTargetRect((prev) => {
      if (!prev) return next;
      if (Math.abs(prev.top-next!.top)<0.5 && Math.abs(prev.left-next!.left)<0.5 && Math.abs(prev.width-next!.width)<0.5 && Math.abs(prev.height-next!.height)<0.5) return prev;
      return next;
    });
  }, [active, stepTarget, stepId]);

  // scroll target into view once per step change (evita loop de scroll)
  useEffect(() => {
    if (!active) return;
    const el = document.querySelector(stepTarget) as HTMLElement | null;
    if (el) try { el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" }); } catch {}
    if (!el && stepId === "sens-subsector-list") {
      const fb = document.querySelector('[data-tour="kapital-subsector-list"]') as HTMLElement | null;
      if (fb) try { fb.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" }); } catch {}
    }
  }, [active, stepTarget, stepId]);

  const updateRectRef = useRef(updateRect);
  useEffect(() => { updateRectRef.current = updateRect; }, [updateRect]);
  useLayoutEffect(() => {
    if (!active) return;
    updateRectRef.current();
    const onResize = () => updateRectRef.current();
    window.addEventListener("resize", onResize);
    const id = window.setInterval(() => updateRectRef.current(), 200);
    return () => {
      window.removeEventListener("resize", onResize);
      window.clearInterval(id);
    };
  }, [active]);

  useLayoutEffect(() => {
    if (!active) { setTooltipPos((p) => p===null?null:null); /* keep null without loop */ return; }
    if (!targetRect) {
      const vw = window.innerWidth; const vh = window.innerHeight;
      const next = { top: Math.max(16, vh/2 - 110), left: Math.max(16, vw/2 - 180) };
      setTooltipPos((prev) => prev && Math.abs(prev.top-next.top)<0.5 && Math.abs(prev.left-next.left)<0.5 ? prev : next);
      return;
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const isMobile = vw <= 640;
    const tooltipW = Math.min(360, vw - 16);
    const tooltipH = tooltipRef.current?.offsetHeight || 220;
    const gap = 12;
    // adaptive for subsector/ticker: arriba si target está abajo, abajo si está arriba
    const isAdaptive = stepRaw.id === "sens-subsector-list" || stepRaw.id === "sens-ticker";
    if (isAdaptive) {
      const left = Math.max(8, Math.min(vw - tooltipW - 8, targetRect.left + targetRect.width / 2 - tooltipW / 2));
      const spaceBelow = vh - (targetRect.top + targetRect.height) - gap;
      const spaceAbove = targetRect.top - gap;
      const targetMid = targetRect.top + targetRect.height / 2;
      const preferAbove = targetMid > vh / 2;
      let top: number;
      if (preferAbove) {
        top = spaceAbove >= tooltipH ? targetRect.top - tooltipH - gap : (spaceBelow >= tooltipH ? targetRect.top + targetRect.height + gap : targetRect.top - tooltipH - gap);
      } else {
        top = spaceBelow >= tooltipH ? targetRect.top + targetRect.height + gap : (spaceAbove >= tooltipH ? targetRect.top - tooltipH - gap : targetRect.top + targetRect.height + gap);
      }
      top = Math.max(8, Math.min(top, vh - tooltipH - 8));
      const next = { top, left };
      setTooltipPos((prev) => prev && Math.abs(prev.top-next.top)<0.5 && Math.abs(prev.left-next.left)<0.5 ? prev : next);
      return;
    }
    if (isMobile) {
      let left = Math.max(8, Math.min(vw - tooltipW - 8, targetRect.left + targetRect.width / 2 - tooltipW / 2));
      let top = targetRect.top + targetRect.height + gap;
      if (top + tooltipH > vh - 8) top = targetRect.top - tooltipH - gap;
      if (top < 8) top = Math.max(8, vh - tooltipH - 8);
      if (top < 8) top = 8;
      if (top + tooltipH > vh - 8) top = Math.max(8, vh - tooltipH - 8);
      const next = { top, left };
      setTooltipPos((prev) => prev && Math.abs(prev.top-next.top)<0.5 && Math.abs(prev.left-next.left)<0.5 ? prev : next);
      return;
    }
    let top = 0; let left = 0;
    if (stepPlacement === "center" || (stepId === "welcome" && vw < 1024)) {
      left = Math.max(16, Math.min(vw - tooltipW - 16, targetRect.left + targetRect.width / 2 - tooltipW / 2));
      top = targetRect.top + targetRect.height + gap;
      if (top + tooltipH > vh - 16) top = Math.max(16, targetRect.top - tooltipH - gap);
    } else if (stepPlacement === "bottom") {
      left = Math.max(16, Math.min(vw - tooltipW - 16, targetRect.left + targetRect.width / 2 - tooltipW / 2));
      top = targetRect.top + targetRect.height + gap;
      if (top + tooltipH > vh - 16) top = targetRect.top - tooltipH - gap;
      if (top < 16) top = 16;
    } else if (stepPlacement === "right") {
      left = targetRect.left + targetRect.width + gap;
      top = targetRect.top + targetRect.height / 2 - tooltipH / 2;
      if (left + tooltipW > vw - 16) {
        left = Math.max(16, Math.min(vw - tooltipW - 16, targetRect.left + targetRect.width / 2 - tooltipW / 2));
        top = targetRect.top + targetRect.height + gap;
        if (top + tooltipH > vh - 16) top = vh - tooltipH - 16;
      }
      if (top < 16) top = 16;
      if (top + tooltipH > vh - 16) top = vh - tooltipH - 16;
    }
    const nextPos = { top, left };
    setTooltipPos((prev) => prev && Math.abs(prev.top-nextPos.top)<0.5 && Math.abs(prev.left-nextPos.left)<0.5 ? prev : nextPos);
  }, [active, targetRect, stepPlacement, stepId]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, skip]);

  if (!active) return null;
  if (showResults && !startSensitivityTour) return null;
  // sensitivity tour should show even with results
  if (!sensitivityMode && showResults) return null;

  const visibleStep = stepRaw;
  const totalSteps = activeSteps.length;

  const overlayPieces = targetRect
    ? [
        { top: 0, left: 0, width: "100%", height: targetRect.top },
        { top: targetRect.top + targetRect.height, left: 0, width: "100%", height: `calc(100% - ${targetRect.top + targetRect.height}px)` },
        { top: targetRect.top, left: 0, width: targetRect.left, height: targetRect.height },
        { top: targetRect.top, left: targetRect.left + targetRect.width, width: `calc(100% - ${targetRect.left + targetRect.width}px)`, height: targetRect.height },
      ]
    : [];

  return createPortal(
    <div className="fixed inset-0 z-[130] pointer-events-auto" aria-modal="true" role="dialog">
      {targetRect ? (
        <>
          {overlayPieces.map((p, i) => (
            <div key={i} className="absolute bg-[#0b1a33]/[0.14] backdrop-blur-[1.2px]" style={{ top: typeof p.top === "number" ? p.top : (p.top as string), left: typeof p.left === "number" ? p.left : (p.left as string), width: typeof p.width === "number" ? p.width : (p.width as string), height: typeof p.height === "number" ? p.height : (p.height as string), backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)", backgroundSize: "18px 18px" }} />
          ))}
          <div className="absolute rounded-[14px] border-[2.5px] border-[#2563eb] shadow-[0_0_0_4px_rgba(37,99,235,0.14),0_10px_30px_rgba(2,12,36,0.18)] pointer-events-none transition-all duration-75 ease-out" style={{ top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height, background: "transparent" }} />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#0b1a33]/[0.14] backdrop-blur-[1.2px]" />
      )}
      {tooltipPos && (
        <div ref={tooltipRef} className="fixed w-[360px] max-w-[calc(100vw-16px)] sm:max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.18),0_4px_12px_rgba(15,23,42,0.10)] border border-slate-200/70 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100dvh-24px)] overflow-y-auto" style={{ top: tooltipPos.top, left: tooltipPos.left, width: `min(360px, calc(100vw - 16px))` }}>
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff6ff] border border-[#dbeafe] px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase text-[#2563eb]">
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#2563eb] text-white text-[11px] font-bold">{current + 1}</span>
                Paso {current + 1} de {totalSteps}
              </span>
              <button onClick={skip} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Cerrar tour"><X className="w-4 h-4" /></button>
            </div>
            <h3 className="flex items-center gap-2 text-[15px] font-bold leading-tight tracking-tight text-slate-900">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb] border border-[#dbeafe]">{visibleStep.icon}</span>
              {visibleStep.title}
            </h3>
            <p className="mt-2 text-[13px] leading-[1.55] text-slate-600 font-medium">{visibleStep.description}</p>
          </div>
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-slate-50/70 border-t border-slate-100">
            <button onClick={skip} className="text-[13px] font-semibold text-slate-500 hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-white">Omitir tour</button>
            <div className="flex items-center gap-2">
              <button onClick={next} className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg text-[13px] font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] shadow-[0_4px_12px_rgba(37,99,235,0.30)] active:scale-[0.98] transition-all">
                {isLast ? "Entendido" : "Siguiente"}
                {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 pb-3 bg-slate-50/70">
            {activeSteps.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-[#2563eb]" : i < current ? "w-1.5 bg-[#93c5fd]" : "w-1.5 bg-slate-300"}`} />
            ))}
          </div>
        </div>
      )}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/30">
        <div className="h-full bg-[#2563eb] transition-all duration-300" style={{ width: `${((current + 1) / totalSteps) * 100}%` }} />
      </div>
    </div>,
    document.body
  );
};
