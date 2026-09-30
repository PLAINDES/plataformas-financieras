import { useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, GraduationCap, Factory } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

// v3: se agrega paso de especialidad para estudiantes + cierre con
// loading y confirmación ("¡Gracias!"). Los dispositivos que completaron
// el formulario anterior (v2) ven la encuesta una vez más para que sus
// datos nuevos alimenten las métricas.
const ONBOARDING_COMPLETED_KEY = "finance_occupation_onboarding_completed_v3";
const DEVICE_ID_KEY = "analytics_device_id";

type Motivo = "estudiante" | "trabajo";

const MOTIVOS: {
  value: Motivo;
  title: string;
  description: string;
  icon: typeof BriefcaseBusiness;
}[] = [
  {
    value: "trabajo",
    title: "Para el trabajo",
    description:
      "Uso herramientas financieras en mi trabajo o en una organización.",
    icon: BriefcaseBusiness,
  },
  {
    value: "estudiante",
    title: "Para estudiar",
    description:
      "Aprendo finanzas, investigo o utilizo las herramientas con fines académicos.",
    icon: GraduationCap,
  },
];

const SECTORES = [
  "Banca y servicios financieros",
  "Consultoría",
  "Contabilidad y auditoría",
  "Finanzas corporativas",
  "Inversiones / banca de inversión",
  "Seguros",
  "Minería",
  "Energía",
  "Industria / manufactura",
  "Retail / consumo",
  "Construcción e inmobiliario",
  "Telecomunicaciones",
  "Tecnología",
] as const;

const CARGOS = [
  "CFO / Director financiero",
  "Gerente de Finanzas",
  "Gerente de Tesorería",
  "Gerente de Planeamiento Financiero",
  "Gerente de Contabilidad",
  "Analista financiero",
  "Analista de inversiones",
  "Analista de riesgos",
  "Consultor financiero",
  "Contador",
  "Tesorero",
  "Economista",
] as const;

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

export function OccupationOnboardingModal() {
  const { pathname } = useLocation();
  const { trackEvent } = useAnalytics();
  const isCalculationEntry = pathname === "/kapital";
  const deviceKey = `${ONBOARDING_COMPLETED_KEY}:${getOrCreateDeviceId()}`;
  const [isOpen, setIsOpen] = useState(() => {
    if (!isCalculationEntry) return false;
    return localStorage.getItem(deviceKey) !== "true";
  });
  const [step, setStep] = useState<
    "motivo" | "detalle" | "especialidad" | "loading" | "gracias"
  >("motivo");
  const [stepTransition, setStepTransition] = useState<
    "idle" | "exit" | "enter"
  >("idle");
  const [motivo, setMotivo] = useState<Motivo | null>(null);
  const [sectorInput, setSectorInput] = useState("");
  const [cargoInput, setCargoInput] = useState("");
  const [especialidadInput, setEspecialidadInput] = useState("");
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showCargoDropdown, setShowCargoDropdown] = useState(false);
  const [sectorActivated, setSectorActivated] = useState(false);
  const [cargoActivated, setCargoActivated] = useState(false);
  const sectorInputRef = useRef<HTMLInputElement>(null);
  const cargoInputRef = useRef<HTMLInputElement>(null);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);
  const cargoDropdownRef = useRef<HTMLDivElement>(null);
  // Payload pendiente de confirmación y timer del loading (2 s).
  const pendingPayloadRef = useRef<Record<string, string | null> | null>(null);
  const loadingTimerRef = useRef<number | null>(null);

  // Los inputs son editables: el usuario puede escribir libremente o
  // elegir una sugerencia. El dropdown filtra por lo escrito.
  const normalize = (value: string) =>
    value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filteredSectors = sectorInput.trim().length === 0
    ? [...SECTORES]
    : [...SECTORES].filter((item) => normalize(item).includes(normalize(sectorInput)));
  const filteredCargos = cargoInput.trim().length === 0
    ? [...CARGOS]
    : [...CARGOS].filter((item) => normalize(item).includes(normalize(cargoInput)));

  const resetState = () => {
    setStep("motivo");
    setMotivo(null);
    setSectorInput("");
    setCargoInput("");
    setEspecialidadInput("");
    pendingPayloadRef.current = null;
    if (loadingTimerRef.current !== null) {
      window.clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setShowSectorDropdown(false);
    setShowCargoDropdown(false);
    setSectorActivated(false);
    setCargoActivated(false);
  };

  // Texto libre: lo que se registra en métricas es lo escrito/seleccionado.
  const sectorEffective = sectorInput.trim();
  const cargoEffective = cargoInput.trim();

  useEffect(() => {
    if (!isCalculationEntry) return;

    const shouldOpen = localStorage.getItem(deviceKey) !== "true";
    if (shouldOpen) {
      resetState();
      setIsOpen(true);
    }
  }, [deviceKey, isCalculationEntry, pathname]);

  useEffect(() => {
    if (stepTransition !== "enter") return;
    const timeout = window.setTimeout(() => setStepTransition("idle"), 260);
    return () => window.clearTimeout(timeout);
  }, [stepTransition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sectorDropdownRef.current &&
        !sectorDropdownRef.current.contains(event.target as Node) &&
        sectorInputRef.current &&
        !sectorInputRef.current.contains(event.target as Node)
      ) {
        setShowSectorDropdown(false);
      }
      if (
        cargoDropdownRef.current &&
        !cargoDropdownRef.current.contains(event.target as Node) &&
        cargoInputRef.current &&
        !cargoInputRef.current.contains(event.target as Node)
      ) {
        setShowCargoDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Limpia el timer del loading si el modal se desmonta.
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current !== null) {
        window.clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
  }, []);

  if (!isCalculationEntry) return null;

  const goToStep = (
    next: "motivo" | "detalle" | "especialidad" | "loading" | "gracias",
  ) => {
    setStepTransition("exit");
    window.setTimeout(() => {
      setStep(next);
      setStepTransition("enter");
    }, 220);
  };

  // Guarda el evento y muestra el loading (~2 s); luego la confirmación.
  // El modal recién se marca como completado al pulsar "Comenzar".
  const startLoading = (payload: Record<string, string | null>) => {
    pendingPayloadRef.current = payload;
    void trackEvent("occupation_profile_completed", payload);
    setStepTransition("exit");
    window.setTimeout(() => {
      setStep("loading");
      setStepTransition("idle");
      if (loadingTimerRef.current !== null) {
        window.clearTimeout(loadingTimerRef.current);
      }
      loadingTimerRef.current = window.setTimeout(() => {
        loadingTimerRef.current = null;
        setStep("gracias");
        setStepTransition("enter");
      }, 2000);
    }, 220);
  };

  const handleComenzar = () => {
    localStorage.setItem(deviceKey, "true");
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("kapital:occupationDone"));
  };

  const buildTrabajoPayload = (): Record<string, string | null> => ({
    audience: "trabajo",
    motivo: "Trabajo",
    sector: sectorEffective,
    cargo: cargoEffective,
    // Compatibilidad con el backend actual, que agrega
    // specialist_roles desde `role` y company_names desde `company`.
    role: cargoEffective,
    company: sectorEffective,
  });

  const buildEstudiantePayload = (): Record<string, string | null> => ({
    audience: "estudiante",
    motivo: "Estudiante",
    especialidad: especialidadInput.trim(),
    role: null,
    company: null,
    sector: null,
    cargo: null,
  });

  const handleContinue = () => {
    if (motivo === "estudiante") {
      goToStep("especialidad");
    } else if (motivo === "trabajo") {
      goToStep("detalle");
    }
  };

  const handleContinueDetalle = () => {
    if (!canSubmitDetalle) return;
    startLoading(buildTrabajoPayload());
  };

  const handleContinueEspecialidad = () => {
    if (especialidadInput.trim().length === 0) return;
    startLoading(buildEstudiantePayload());
  };

  const handleBack = () => {
    goToStep("motivo");
  };

  const canSubmitDetalle =
    sectorEffective.length > 0 && cargoEffective.length > 0;

  const inputClassName =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 sm:py-3.5 sm:text-base";
  const dropdownClassName =
    "absolute left-0 top-full z-[99999] mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  const optionClassName =
    "flex w-full cursor-pointer items-center px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700 sm:text-base";

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(false);
          window.dispatchEvent(new CustomEvent("kapital:occupationDismissed"));
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => event.preventDefault()}
        onCloseAutoFocus={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className="flex max-h-[90dvh] w-[min(96vw,520px)] max-w-none flex-col overflow-visible rounded-2xl border border-gray-300 bg-white p-0 font-sans shadow-2xl sm:max-h-[92dvh] sm:w-[min(94vw,520px)]"
      >
        <DialogTitle className="sr-only">Cuéntanos tu ocupación</DialogTitle>
        <DialogDescription className="sr-only">
          Ingresa tu perfil para continuar a la calculadora.
        </DialogDescription>
        <style>{`
          @keyframes occupation-spin { to { transform: rotate(360deg); } }
          @keyframes occupation-spinner-tint {
            from { border-top-color: #2563eb; border-right-color: #e5e7eb; border-bottom-color: #e5e7eb; border-left-color: #e5e7eb; }
            to { border-top-color: #0ea968; border-right-color: #c9ecd9; border-bottom-color: #c9ecd9; border-left-color: #c9ecd9; }
          }
          .occupation-spinner {
            border: 6px solid #e5e7eb;
            border-top-color: #2563eb;
            animation: occupation-spin 0.9s linear infinite, occupation-spinner-tint 2s ease-out forwards;
          }
          @keyframes occupation-ring-draw { to { stroke-dashoffset: 0; } }
          @keyframes occupation-ring-fade { to { stroke-opacity: 0; } }
          .occupation-ring-draw {
            stroke-dasharray: 315;
            stroke-dashoffset: 315;
            animation: occupation-ring-draw 0.6s ease-out forwards, occupation-ring-fade 0.4s ease-out 0.7s forwards;
          }
          @keyframes occupation-fill-in { to { fill-opacity: 1; } }
          .occupation-fill-in { fill-opacity: 0; animation: occupation-fill-in 0.5s ease-out 0.45s forwards; }
          @keyframes occupation-draw-check {
            from { stroke-dashoffset: 60; }
            to { stroke-dashoffset: 0; }
          }
          .occupation-draw-check {
            stroke-dasharray: 60;
            stroke-dashoffset: 60;
            animation: occupation-draw-check 0.45s ease-out 0.65s forwards;
          }
          @keyframes occupation-ray-out {
            from { transform: rotate(var(--occupation-ray-angle, 0deg)) translateX(50px) scale(0.3); opacity: 0; }
            to { transform: rotate(var(--occupation-ray-angle, 0deg)) translateX(70px) scale(1); opacity: 1; }
          }
          .occupation-ray {
            opacity: 0;
            animation: occupation-ray-out 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          @keyframes occupation-fade-up {
            from { transform: translateY(14px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .occupation-fade-up { opacity: 0; animation: occupation-fade-up 0.5s ease-out forwards; }
        `}</style>

        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:min-h-[min(72dvh,555px)] sm:px-8 sm:pb-8 sm:pt-8">
          <div
            key={step}
            className={`flex min-h-0 flex-1 flex-col ${
              stepTransition === "exit"
                ? "animate-out fade-out slide-out-to-left-8 duration-220 ease-out"
                : stepTransition === "enter"
                  ? "animate-in fade-in slide-in-from-right-8 duration-260 ease-out"
                  : ""
            }`}
          >
            {step === "motivo" ? (
              <>
                <h2 className="mx-auto w-full max-w-[440px] text-center text-[30px] font-bold leading-[1.08] tracking-[-0.02em] text-gray-950 sm:text-[38px]">
                  <span className="block text-blue-600">Para conocerte mejor</span>
                  <span className="mt-1 block">Indícanos el motivo de uso</span>
                </h2>
                <p className="mx-auto mt-3 max-w-[400px] text-center text-sm leading-relaxed text-gray-600 sm:mt-4 sm:text-base">
                  Selecciona la opción que describa mejor el uso que le darás a
                  nuestras herramientas financieras.
                </p>

                <div className="mx-auto flex min-h-0 w-full max-w-[440px] flex-1 items-center py-6">
                  <div className="grid w-full grid-cols-2 gap-3 sm:gap-4">
                    {MOTIVOS.map((item) => {
                      const selected = motivo === item.value;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setMotivo(item.value)}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            event.currentTarget.blur();
                          }}
                          aria-pressed={selected}
                          className={`relative flex cursor-pointer flex-col items-center rounded-xl border-2 p-3 text-center transition outline-none sm:p-4 focus-visible:ring-2 focus-visible:ring-blue-600/30 ${
                            selected
                              ? "border-blue-600 ring-2 ring-blue-600/20"
                              : "border-gray-200 hover:border-gray-300 focus:border-gray-200 focus:ring-0 focus-visible:ring-0"
                          }`}
                        >
                          <span
                            className={`absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border-2 transition ${
                              selected
                                ? "border-blue-600 bg-white"
                                : "border-gray-300 bg-white"
                            }`}
                          >
                            {selected && (
                              <span className="size-2.5 rounded-full bg-blue-600" />
                            )}
                          </span>
                          <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-gray-100 sm:size-10">
                            <Icon className="size-5 text-gray-600" />
                          </span>
                          <span className="block text-sm font-bold text-gray-950 sm:text-base">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-[11px] leading-snug text-gray-500 sm:text-xs">
                            {item.description}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={motivo === null}
                    onClick={handleContinue}
                    className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 sm:py-3.5 sm:text-sm"
                  >
                    Continuar
                  </button>
                </div>
              </>
            ) : step === "detalle" ? (
              <>
                <h2 className="mx-auto max-w-[450px] text-center text-[22px] font-bold leading-[1.08] tracking-[-0.02em] text-gray-950 sm:text-[38px]">
                  Para ofrecerle una experiencia más personalizada, cuéntenos
                  a qué se dedica.
                </h2>
                <p className="mt-2 text-center text-xs text-gray-600 sm:mt-4 sm:text-base">
                  Escriba su sector y su cargo.
                </p>

                <div className="mt-4 sm:mt-6">
                  <label
                    htmlFor="sector-input"
                    className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800 sm:text-[15px]"
                  >
                    <Factory className="size-4 shrink-0 text-gray-500" />
                    Sector
                  </label>
                  <div className="relative">
                    <input
                      ref={sectorInputRef}
                      id="sector-input"
                      type="text"
                      value={sectorInput}
                      onChange={(event) => {
                        setSectorInput(event.target.value);
                        setSectorActivated(true);
                        setShowSectorDropdown(true);
                      }}
                      onClick={() => {
                        setSectorActivated(true);
                        setShowSectorDropdown(true);
                      }}
                      onFocus={() => {
                        setSectorActivated(true);
                        setShowSectorDropdown(true);
                      }}
                      placeholder="Ej.: banca, consultoría, educación"
                      autoComplete="off"
                      className={inputClassName}
                    />
                    {sectorActivated &&
                      showSectorDropdown &&
                      filteredSectors.length > 0 && (
                        <div
                          ref={sectorDropdownRef}
                          className={dropdownClassName}
                        >
                          {filteredSectors.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                setSectorInput(item);
                                setShowSectorDropdown(false);
                              }}
                              className={optionClassName}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                  {sectorInput.trim().length > 0 && (
                    <div className="mt-4">
                      <label
                        htmlFor="cargo-input"
                        className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800 sm:text-[15px]"
                      >
                        <BriefcaseBusiness className="size-4 shrink-0 text-gray-500" />
                        Cargo
                      </label>
                      <div className="relative">
                        <input
                          ref={cargoInputRef}
                          id="cargo-input"
                          type="text"
                          value={cargoInput}
                          onChange={(event) => {
                            setCargoInput(event.target.value);
                            setCargoActivated(true);
                            setShowCargoDropdown(true);
                          }}
                          onClick={() => {
                            setCargoActivated(true);
                            setShowCargoDropdown(true);
                          }}
                          onFocus={() => {
                            setCargoActivated(true);
                            setShowCargoDropdown(true);
                          }}
                          placeholder="Ej.: analista financiero, gerente, estudiante"
                          autoComplete="off"
                          className={inputClassName}
                        />
                        {cargoActivated &&
                          showCargoDropdown &&
                          filteredCargos.length > 0 && (
                            <div
                              ref={cargoDropdownRef}
                              className={dropdownClassName}
                            >
                              {filteredCargos.map((item) => (
                                <button
                                  key={item}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCargoInput(item);
                                    setShowCargoDropdown(false);
                                  }}
                                  className={optionClassName}
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="cursor-pointer rounded-lg px-4 py-3 font-mono text-xs font-semibold text-gray-500 transition hover:text-gray-800 sm:py-3.5 sm:text-sm"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    disabled={!canSubmitDetalle}
                    onClick={handleContinueDetalle}
                    className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 sm:py-3.5 sm:text-sm"
                  >
                    Continuar
                  </button>
                </div>
              </>
            ) : step === "especialidad" ? (
              <>
                <h2 className="mx-auto max-w-[450px] text-center text-[22px] font-bold leading-[1.08] tracking-[-0.02em] text-gray-950 sm:text-[38px]">
                  Para ofrecerte las herramientas financieras más útiles,
                  cuéntanos tu especialidad.
                </h2>
                <p className="mt-2 text-center text-xs text-gray-600 sm:mt-4 sm:text-base">
                  Esto nos ayudará a recomendar contenido y funcionalidades
                  relevantes para ti.
                </p>

                <div className="mt-4 sm:mt-6">
                  <label
                    htmlFor="especialidad-input"
                    className="mb-1.5 block text-sm font-semibold text-gray-800 sm:text-[15px]"
                  >
                    Especialidad
                  </label>
                  <input
                    id="especialidad-input"
                    type="text"
                    value={especialidadInput}
                    onChange={(event) => setEspecialidadInput(event.target.value)}
                    placeholder="Escribe tu especialidad..."
                    autoComplete="off"
                    className={inputClassName}
                  />
                </div>

                <div className="mt-auto pt-4 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="cursor-pointer rounded-lg px-4 py-3 font-mono text-xs font-semibold text-gray-500 transition hover:text-gray-800 sm:py-3.5 sm:text-sm"
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    disabled={especialidadInput.trim().length === 0}
                    onClick={handleContinueEspecialidad}
                    className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 sm:py-3.5 sm:text-sm"
                  >
                    Continuar
                  </button>
                </div>
              </>
            ) : step === "loading" ? (
              <div
                className="flex min-h-[320px] flex-1 flex-col items-center justify-center sm:min-h-[380px]"
                role="status"
                aria-label="Guardando tu información"
              >
                {/* Spinner algo más pequeño que el círculo final; su color
                    migra poco a poco del azul al verde de la confirmación. */}
                <div className="occupation-spinner size-20 rounded-full" />
              </div>
            ) : (
              <>
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-6">
                  <div className="relative size-28">
                    <svg
                      viewBox="0 0 112 112"
                      className="absolute inset-0 size-full"
                      fill="none"
                      aria-hidden="true"
                    >
                      {/* Relleno suave que aparece con fade */}
                      <circle cx="56" cy="56" r="50" fill="#e7f8ef" stroke="none" className="occupation-fill-in" />
                      {/* Anillo que se dibuja y luego se disipa, dejando el círculo limpio */}
                      <circle
                        cx="56"
                        cy="56"
                        r="50"
                        stroke="#0ea968"
                        strokeWidth="6"
                        strokeLinecap="round"
                        fill="none"
                        transform="rotate(-90 56 56)"
                        className="occupation-ring-draw"
                      />
                      {/* Check que se dibuja tras el círculo */}
                      <path
                        d="M38 57.5 50.5 70 75 43"
                        stroke="#0ea968"
                        strokeWidth="9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="occupation-draw-check"
                      />
                    </svg>
                    {/* Destellos que nacen cerca del borde y salen hacia afuera,
                        orientados en dirección radial */}
                    {[
                      { pos: "left-1/2 top-1/2 -ml-2.5 -mt-[3px]", angle: "-35deg", delay: "0.85s" },
                      { pos: "left-1/2 top-1/2 -ml-2.5 -mt-[3px]", angle: "0deg", delay: "0.91s" },
                      { pos: "left-1/2 top-1/2 -ml-2.5 -mt-[3px]", angle: "35deg", delay: "0.97s" },
                      { pos: "left-1/2 top-1/2 -ml-2.5 -mt-[3px]", angle: "145deg", delay: "0.85s" },
                      { pos: "left-1/2 top-1/2 -ml-2.5 -mt-[3px]", angle: "180deg", delay: "0.91s" },
                      { pos: "left-1/2 top-1/2 -ml-2.5 -mt-[3px]", angle: "215deg", delay: "0.97s" },
                    ].map(({ pos, angle, delay }) => (
                      <span
                        key={angle}
                        style={{
                          ["--occupation-ray-angle" as string]: angle,
                          animationDelay: delay,
                        }}
                        className={`occupation-ray absolute h-1.5 w-5 rounded-full bg-[#0ea968] ${pos}`}
                      />
                    ))}
                  </div>
                  <h2
                    className="occupation-fade-up mt-6 text-center text-[34px] font-bold leading-none tracking-[-0.02em] text-gray-950 sm:text-[44px]"
                    style={{ animationDelay: "0.95s" }}
                  >
                    ¡Gracias!
                  </h2>
                  <p
                    className="occupation-fade-up mx-auto mt-4 max-w-[420px] text-center text-sm leading-relaxed text-gray-600 sm:text-base"
                    style={{ animationDelay: "1.1s" }}
                  >
                    Ya tenemos la información que necesitamos para ofrecerte
                    una experiencia más personalizada en nuestras herramientas
                    financieras.
                  </p>
                  <div
                    className="occupation-fade-up mt-8 flex justify-center"
                    style={{ animationDelay: "1.25s" }}
                  >
                    <button
                      type="button"
                      onClick={handleComenzar}
                      className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 sm:py-3.5 sm:text-sm"
                    >
                      Comenzar
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Re-export para mantener compatibilidad con imports existentes.
export const FINANCIAL_ROLES = CARGOS;
export const SECTORES_LABORALES = SECTORES;
