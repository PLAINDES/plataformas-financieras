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

// v2: el flujo cambió a motivo → sector → cargo. Los dispositivos que
// completaron el formulario anterior (v1) ven la encuesta una vez más
// para que sus datos nuevos alimenten las métricas.
const ONBOARDING_COMPLETED_KEY = "finance_occupation_onboarding_completed_v2";
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
    title: "Trabajo",
    description:
      "Me desempeño en una empresa u organización y uso herramientas financieras",
    icon: BriefcaseBusiness,
  },
  {
    value: "estudiante",
    title: "Estudiante",
    description:
      "Aprendiendo las bases, investigación académica o interés personal",
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
  "Otros",
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
  "Otro",
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
  const [step, setStep] = useState<"motivo" | "detalle">("motivo");
  const [stepTransition, setStepTransition] = useState<
    "idle" | "exit" | "enter"
  >("idle");
  const [motivo, setMotivo] = useState<Motivo | null>(null);
  const [sectorInput, setSectorInput] = useState("");
  const [cargoInput, setCargoInput] = useState("");
  const [sectorOther, setSectorOther] = useState("");
  const [cargoOther, setCargoOther] = useState("");
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showCargoDropdown, setShowCargoDropdown] = useState(false);
  const [sectorActivated, setSectorActivated] = useState(false);
  const [cargoActivated, setCargoActivated] = useState(false);
  const sectorInputRef = useRef<HTMLInputElement>(null);
  const cargoInputRef = useRef<HTMLInputElement>(null);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);
  const cargoDropdownRef = useRef<HTMLDivElement>(null);

  // Listas completas: los inputs son de solo lectura (no editables),
  // así que el dropdown siempre muestra todas las opciones.
  const filteredSectors = [...SECTORES];
  const filteredCargos = [...CARGOS];

  const resetState = () => {
    setStep("motivo");
    setMotivo(null);
    setSectorInput("");
    setCargoInput("");
    setSectorOther("");
    setCargoOther("");
    setShowSectorDropdown(false);
    setShowCargoDropdown(false);
    setSectorActivated(false);
    setCargoActivated(false);
  };

  const isOtherValue = (value: string) =>
    value.trim().toLowerCase() === "otros" ||
    value.trim().toLowerCase() === "otro";

  // Si el usuario elige "Otros"/"Otro", lo que se registra en métricas
  // es el texto que especifique, no la palabra "Otros".
  const sectorEffective = isOtherValue(sectorInput)
    ? sectorOther.trim()
    : sectorInput.trim();
  const cargoEffective = isOtherValue(cargoInput)
    ? cargoOther.trim()
    : cargoInput.trim();

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

  if (!isCalculationEntry) return null;

  const complete = async (payload: Record<string, string | null>) => {
    await trackEvent("occupation_profile_completed", payload);
    localStorage.setItem(deviceKey, "true");
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent("kapital:occupationDone"));
  };

  const finishEstudiante = () =>
    complete({
      audience: "estudiante",
      motivo: "Estudiante",
      role: null,
      company: null,
      sector: null,
      cargo: null,
    });

  const finishTrabajo = () =>
    complete({
      audience: "trabajo",
      motivo: "Trabajo",
      sector: sectorEffective,
      cargo: cargoEffective,
      // Compatibilidad con el backend actual, que agrega
      // specialist_roles desde `role` y company_names desde `company`.
      role: cargoEffective,
      company: sectorEffective,
    });

  const handleContinue = () => {
    if (motivo === "estudiante") {
      void finishEstudiante();
    } else if (motivo === "trabajo") {
      setStepTransition("exit");
      window.setTimeout(() => {
        setStep("detalle");
        setStepTransition("enter");
      }, 220);
    }
  };

  const handleBack = () => {
    setStepTransition("exit");
    window.setTimeout(() => {
      setStep("motivo");
      setStepTransition("enter");
    }, 220);
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
                  <span className="block text-blue-600">¡Comencemos!</span>
                  <span className="mt-1 block">Indícanos el motivo de uso</span>
                </h2>
                <p className="mx-auto mt-3 max-w-[400px] text-center text-sm leading-relaxed text-gray-600 sm:mt-4 sm:text-base">
                  Selecciona la opción que describa el uso que le darás a
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
                            {item.title === "Trabajo"
                              ? "Trabajador"
                              : "Estudiante"}
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
            ) : (
              <>
                <h2 className="mx-auto max-w-[450px] text-center text-[22px] font-bold leading-[1.08] tracking-[-0.02em] text-gray-950 sm:text-[38px]">
                  Para ofrecerle las herramientas financieras adecuadas,
                  cuéntenos su ocupación profesional.
                </h2>
                <p className="mt-2 text-center text-xs text-gray-600 sm:mt-4 sm:text-base">
                  Seleccione su sector y su cargo.
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
                      readOnly
                      onClick={() => {
                        setSectorActivated(true);
                        setShowSectorDropdown(true);
                      }}
                      onFocus={() => {
                        setSectorActivated(true);
                        setShowSectorDropdown(true);
                      }}
                      placeholder="Selecciona tu sector..."
                      className={`${inputClassName} cursor-pointer caret-transparent`}
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
                                if (!isOtherValue(item)) setSectorOther("");
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
                  {isOtherValue(sectorInput) && (
                    <div className="mt-3">
                      <label
                        htmlFor="sector-other-input"
                        className="mb-1.5 block text-sm font-semibold text-gray-800 sm:text-[15px]"
                      >
                        Especifica tu sector
                      </label>
                      <input
                        id="sector-other-input"
                        type="text"
                        value={sectorOther}
                        onChange={(event) => setSectorOther(event.target.value)}
                        placeholder="Ej: Asesoramiento de Finanzas y Valorización..."
                        className={inputClassName}
                      />
                    </div>
                  )}
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
                          readOnly
                          onClick={() => {
                            setCargoActivated(true);
                            setShowCargoDropdown(true);
                          }}
                          onFocus={() => {
                            setCargoActivated(true);
                            setShowCargoDropdown(true);
                          }}
                          placeholder="Selecciona tu cargo..."
                          className={`${inputClassName} cursor-pointer caret-transparent`}
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
                                    if (!isOtherValue(item)) setCargoOther("");
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
                      {isOtherValue(cargoInput) && (
                        <div className="mt-3">
                          <label
                            htmlFor="cargo-other-input"
                            className="mb-1.5 block text-sm font-semibold text-gray-800 sm:text-[15px]"
                          >
                            Especifica tu cargo
                          </label>
                          <input
                            id="cargo-other-input"
                            type="text"
                            value={cargoOther}
                            onChange={(event) =>
                              setCargoOther(event.target.value)
                            }
                            placeholder="Ej: Asesor de valorización..."
                            className={inputClassName}
                          />
                        </div>
                      )}
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
                    onClick={() => void finishTrabajo()}
                    className="cursor-pointer rounded-lg bg-blue-600 px-8 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 sm:py-3.5 sm:text-sm"
                  >
                    Ingresar
                  </button>
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
