import { useEffect, useState, type ReactNode } from "react";
import { BriefcaseBusiness, GraduationCap } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

const ONBOARDING_COMPLETED_KEY = "finance_occupation_onboarding_completed";
const DEVICE_ID_KEY = "analytics_device_id";

const FINANCIAL_ROLES = [
  "CFO / Director(a) de Finanzas",
  "VP / Head / Gerente de Finanzas",
  "Tesorería",
  "Controller / Contraloría",
  "FP&A / Planeación Financiera",
  "Contabilidad",
  "Analista Financiero",
  "Crédito y Riesgo",
  "Inversiones / Asset Management",
  "Banca / Servicios Financieros",
  "Consultoría Financiera",
  "Otro",
] as const;

type Audience = "specialist" | "student";
type Step = "audience" | "role";

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
  const [step, setStep] = useState<Step>("audience");
  const [audience, setAudience] = useState<Audience | null>(null);
  const [role, setRole] = useState("");
  const [otherRole, setOtherRole] = useState("");

  const showStepBar = audience === "specialist" && step === "role";

  useEffect(() => {
    if (!isCalculationEntry) return;

    const shouldOpen = localStorage.getItem(deviceKey) !== "true";
    if (shouldOpen) {
      setStep("audience");
      setAudience(null);
      setRole("");
      setOtherRole("");
      setIsOpen(true);
    }
  }, [deviceKey, isCalculationEntry, pathname]);

  if (!isCalculationEntry) return null;

  const finish = async () => {
    if (!audience) return;

    await trackEvent("occupation_profile_completed", {
      audience,
      role: audience === "specialist" ? role : null,
    });
    localStorage.setItem(deviceKey, "true");
    setIsOpen(false);
  };

  const continueFromAudience = () => {
    if (audience === "specialist") {
      setStep("role");
      return;
    }
    if (audience === "student") void finish();
  };

  const goBackToAudience = () => {
    setStep("audience");
    setRole("");
    setOtherRole("");
  };

  const canFinishRole = Boolean(role && (role !== "Otro" || otherRole.trim()));
  const stepNumber = step === "audience" ? 1 : 2;

  return (
    <Dialog open={isOpen} onOpenChange={() => undefined}>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className="flex max-h-[90dvh] w-[min(96vw,520px)] max-w-none flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white p-0 font-sans shadow-2xl sm:max-h-[92dvh] sm:w-[min(94vw,520px)]"
      >
        <DialogTitle className="sr-only">Cuéntanos tu ocupación</DialogTitle>
        <DialogDescription className="sr-only">
          Selecciona tu perfil para continuar a la calculadora.
        </DialogDescription>

        <div
          className={`shrink-0 px-4 pt-4 transition-all duration-300 sm:px-8 sm:pt-7 ${
            showStepBar ? "opacity-100 translate-y-0" : "pointer-events-none max-h-0 overflow-hidden py-0 opacity-0 -translate-y-2"
          }`}
        >
          <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.08em] text-gray-600 sm:text-[10px]">
            <span>PASO {stepNumber} DE 2</span>
            <span>Configuración del perfil</span>
          </div>
          <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full bg-blue-600 transition-[width] duration-300 ${
                step === "audience" ? "w-1/2" : "w-full"
              }`}
            />
          </div>
        </div>

        {step === "audience" ? (
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:min-h-[min(72dvh,555px)] sm:px-8 sm:pb-8 sm:pt-8">
            <h2 className="mx-auto max-w-[450px] text-center text-[22px] font-bold leading-[1.08] tracking-[-0.02em] text-gray-950 sm:text-[38px]">
              Para ofrecerte las herramientas financieras adecuadas, cuéntanos tu rol actual.
            </h2>
            <p className="mt-2 text-center text-xs text-gray-600 sm:mt-4 sm:text-base">
              Selecciona la opción que mejor te describa.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:mt-11 sm:grid-cols-2 sm:gap-3">
              <AudienceCard
                selected={audience === "specialist"}
                onClick={() => setAudience("specialist")}
                icon={<BriefcaseBusiness className="size-5" />}
                title="Soy un Especialista Financiero"
                description="Gestión de activos, asesoría o finanzas institucionales"
              />
              <AudienceCard
                selected={audience === "student"}
                onClick={() => setAudience("student")}
                icon={<GraduationCap className="size-5" />}
                title="Soy un Estudiante"
                description="Aprendiendo las bases, investigación académica o interés personal"
              />
            </div>

            <button
              type="button"
              disabled={!audience}
              onClick={continueFromAudience}
              className="mx-auto mt-4 w-full max-w-31 rounded-lg bg-blue-600 px-5 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 sm:mt-auto"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4 sm:px-10 sm:pb-8 sm:pt-6">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBackToAudience}
                className="rounded-md border border-gray-200 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600 transition hover:bg-gray-50"
              >
                Volver
              </button>
              <p className="flex-1 text-center text-sm font-semibold text-gray-800 sm:text-xl">
                Elige la opción más alineada a ti.
              </p>
              <span className="w-[52px]" aria-hidden="true" />
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 sm:mt-5">
              <div className="space-y-1">
                {FINANCIAL_ROLES.map((item) => (
                  <label
                    key={item}
                    className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.25 text-sm text-gray-700 transition hover:bg-blue-50 sm:min-h-10 sm:gap-3 sm:px-2 sm:py-1.5 sm:text-lg"
                  >
                    <input
                      type="radio"
                      name="financial-role"
                      value={item}
                      checked={role === item}
                      onChange={() => {
                        setRole(item);
                      }}
                      className="size-4 shrink-0 accent-blue-600 sm:size-5"
                    />
                    <span>{item}</span>
                    {item === "Otro" && role === "Otro" && (
                      <input
                        autoFocus
                        value={otherRole}
                        onChange={(event) => setOtherRole(event.target.value)}
                        onClick={(event) => event.stopPropagation()}
                        placeholder="Detallar"
                        className="ml-2 min-w-0 flex-1 border-0 border-b border-gray-500 bg-transparent px-1 py-1 italic outline-none focus:border-blue-600"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="button"
              disabled={!canFinishRole}
              onClick={() => void finish()}
              className="mx-auto mt-3 w-full max-w-31 shrink-0 rounded-lg bg-blue-600 px-5 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 sm:mt-5"
            >
              Continuar
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AudienceCard({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`relative min-h-36 rounded-xl border p-3 text-left transition sm:min-h-42 sm:rounded-sm sm:p-4 ${
        selected
          ? "border-blue-600 bg-blue-50/40"
          : "border-gray-300 bg-white hover:border-gray-500"
      }`}
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-gray-100 text-gray-700 sm:size-9 sm:rounded-sm">
        {icon}
      </span>
      <span
        className={`absolute right-3 top-3 size-3.5 rounded-full border sm:right-4 sm:top-4 sm:size-4 ${
          selected ? "border-blue-600 bg-blue-600" : "border-gray-300"
        }`}
      />
      <strong className="mt-2.5 block text-sm leading-tight text-gray-950 sm:mt-3 sm:text-lg">
        {title}
      </strong>
      <span className="mt-1.5 block text-[11px] leading-snug text-gray-600 sm:text-xs">
        {description}
      </span>
    </button>
  );
}
