import { useEffect, useRef, useState } from "react";
import { BriefcaseBusiness, Building2 } from "lucide-react";
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
  const [roleInput, setRoleInput] = useState("");
  const [companyInput, setCompanyInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputActivated, setInputActivated] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredRoles = roleInput.trim()
    ? FINANCIAL_ROLES.filter((r) =>
        r.toLowerCase().includes(roleInput.trim().toLowerCase())
      )
    : [...FINANCIAL_ROLES];

  useEffect(() => {
    if (!isCalculationEntry) return;

    const shouldOpen = localStorage.getItem(deviceKey) !== "true";
    if (shouldOpen) {
      setRoleInput("");
      setCompanyInput("");
      setInputActivated(false);
      setShowDropdown(false);
      setIsOpen(true);
    }
  }, [deviceKey, isCalculationEntry, pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isCalculationEntry) return null;

  const finish = async () => {
    await trackEvent("occupation_profile_completed", {
      audience: "specialist",
      role: roleInput.trim() || null,
      company: companyInput.trim() || null,
    });
    localStorage.setItem(deviceKey, "true");
    setIsOpen(false);
  };

  const canSubmit = roleInput.trim().length > 0 && companyInput.trim().length > 0;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) setIsOpen(false);
      }}
    >
      <DialogContent
        showCloseButton
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
          <h2 className="mx-auto max-w-[450px] text-center text-[22px] font-bold leading-[1.08] tracking-[-0.02em] text-gray-950 sm:text-[38px]">
            Para ofrecerle las herramientas financieras adecuadas, cuéntenos
            su ocupación profesional.
          </h2>
          <p className="mt-2 text-center text-xs text-gray-600 sm:mt-4 sm:text-base">
            Seleccione un rol o escriba el suyo.
          </p>

          <div className="mt-4 sm:mt-6">
            <label
              htmlFor="role-input"
              className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800 sm:text-[15px]"
            >
              <BriefcaseBusiness className="size-4 shrink-0 text-gray-500" />
              Cargo profesional
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="role-input"
                type="text"
                value={roleInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setRoleInput(nextValue);
                  setShowDropdown(inputActivated);
                }}
                onFocus={() => undefined}
                onClick={() => {
                  setInputActivated(true);
                  setShowDropdown(true);
                }}
                placeholder="Ej: Analista Financiero, CFO, Contador..."
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 sm:py-3.5 sm:text-base"
              />
              {inputActivated && showDropdown && filteredRoles.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute left-0 top-full z-[99999] mt-2 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {filteredRoles.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setRoleInput(item);
                        setShowDropdown(false);
                      }}
                      className="flex w-full items-center px-4 py-2.5 text-left text-sm text-gray-700 transition hover:bg-blue-50 hover:text-blue-700 sm:text-base"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {roleInput.trim().length > 0 && (
              <div className="mt-4">
                <label
                  htmlFor="company-input"
                  className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-gray-800 sm:text-[15px]"
                >
                  <Building2 className="size-4 shrink-0 text-gray-500" />
                  Empresa
                </label>
                <input
                  id="company-input"
                  type="text"
                  value={companyInput}
                  onChange={(event) => setCompanyInput(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 sm:py-3.5 sm:text-base"
                />
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 flex justify-center">
            <button
              type="button"
              disabled={!canSubmit}
              onClick={finish}
              className="rounded-lg bg-blue-600 px-8 py-3 font-mono text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200 sm:py-3.5 sm:text-sm"
            >
              Ingresar
            </button>
          </div>
        </div>
      </DialogContent>

    </Dialog>
  );
}
