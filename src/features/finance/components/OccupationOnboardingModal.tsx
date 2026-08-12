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

const ONBOARDING_TEST_MODE = true;
const ONBOARDING_COMPLETED_KEY = "finance_occupation_onboarding_completed";

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

export function OccupationOnboardingModal() {
  const { pathname } = useLocation();
  const { trackEvent } = useAnalytics();
  const isCalculationEntry = pathname === "/kapital";
  const [isOpen, setIsOpen] = useState(() => {
    if (!isCalculationEntry) return false;
    return (
      ONBOARDING_TEST_MODE ||
      localStorage.getItem(ONBOARDING_COMPLETED_KEY) !== "true"
    );
  });
  const [step, setStep] = useState<Step>("audience");
  const [audience, setAudience] = useState<Audience | null>(null);
  const [role, setRole] = useState("");
  const [otherRole, setOtherRole] = useState("");

  useEffect(() => {
    if (!isCalculationEntry) return;

    const shouldOpen =
      ONBOARDING_TEST_MODE ||
      localStorage.getItem(ONBOARDING_COMPLETED_KEY) !== "true";
    if (shouldOpen) {
      setStep("audience");
      setAudience(null);
      setRole("");
      setOtherRole("");
      setIsOpen(true);
    }
  }, [isCalculationEntry, pathname]);

  if (!isCalculationEntry) return null;

  const finish = async () => {
    if (!audience) return;

    await trackEvent("occupation_profile_completed", {
      audience,
      role: audience === "specialist" ? role : null,
    });
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
    setIsOpen(false);
  };

  const continueFromAudience = () => {
    if (audience === "specialist") {
      setStep("role");
      return;
    }
    if (audience === "student") void finish();
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
        className="flex max-h-[92dvh] w-[min(94vw,520px)] max-w-none flex-col overflow-hidden rounded-lg border border-gray-300 bg-white p-0 font-sans shadow-2xl"
      >
        <DialogTitle className="sr-only">Cuéntanos tu ocupación</DialogTitle>
        <DialogDescription className="sr-only">
          Selecciona tu perfil para continuar a la calculadora.
        </DialogDescription>

        <div className="shrink-0 px-6 pt-7 sm:px-8">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.08em] text-gray-600">
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
          <div className="flex min-h-[min(72dvh,555px)] flex-col px-6 pb-7 pt-8 sm:px-8 sm:pb-8">
            <h2 className="mx-auto max-w-[450px] text-center text-3xl font-bold leading-[1.12] tracking-[-0.015em] text-gray-950 sm:text-[38px]">
              Para ofrecerte las herramientas financieras adecuadas, cuéntanos tu rol actual.
            </h2>
            <p className="mt-4 text-center text-sm text-gray-600 sm:text-base">
              Selecciona la opción que mejor te describa.
            </p>

            <div className="mt-11 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              className="mx-auto mt-auto w-full max-w-31 rounded-lg bg-blue-600 px-5 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col px-7 pb-7 pt-6 sm:px-10 sm:pb-8">
            <p className="shrink-0 text-center text-lg font-semibold text-gray-800 sm:text-xl">
              Elige la opción más alineada a ti.
            </p>

            <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
              <div className="space-y-1">
                {FINANCIAL_ROLES.map((item) => (
                  <label
                    key={item}
                    className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 text-base text-gray-700 transition hover:bg-blue-50 sm:text-lg"
                  >
                    <input
                      type="radio"
                      name="financial-role"
                      value={item}
                      checked={role === item}
                      onChange={() => setRole(item)}
                      className="size-5 shrink-0 accent-blue-600"
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
              className="mx-auto mt-5 w-full max-w-31 shrink-0 rounded-lg bg-blue-600 px-5 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200"
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
      className={`relative min-h-42 rounded-sm border p-4 text-left transition ${
        selected
          ? "border-blue-600 bg-blue-50/40"
          : "border-gray-300 bg-white hover:border-gray-500"
      }`}
    >
      <span className="flex size-9 items-center justify-center rounded-sm bg-gray-100 text-gray-700">
        {icon}
      </span>
      <span
        className={`absolute right-4 top-4 size-4 rounded-full border ${
          selected ? "border-blue-600 bg-blue-600" : "border-gray-300"
        }`}
      />
      <strong className="mt-3 block text-lg leading-tight text-gray-950">
        {title}
      </strong>
      <span className="mt-1.5 block text-xs leading-snug text-gray-600">
        {description}
      </span>
    </button>
  );
}
