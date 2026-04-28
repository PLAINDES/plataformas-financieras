import { useState, useEffect, useRef } from "react";
import { NavBar } from "./components/NavBar";
import { NavigationTabs } from "./components/NavigationTabs";
import { FormSidebar } from "./components/FormSidebar";
import { FinancePageTemplate } from "../components/MainPage";
import { KapitalResults } from "./components/KapitalResults";
import { ReportSidebar } from "../components/ReportSidebar";
import { LoadingOverlay } from "@/shared/components/common/LoadingOverlay";
import { ToastStack } from "@/shared/components/common/ToastStack";
import { MainPageFooter } from "../components/MainPageFooter";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Chatbot from "../components/Chatbot";
import type { ToastType } from "@/shared/types/toast.types";
import { MainService } from "@/shared/services/main.service";
import type { Calculation } from "@/shared/types";
import "./KapitalPage.css";

import {
  INSTRUMENTS,
  BONOS,
  COUNTRIES,
  CURRENCIES,
  REPORT_PRODUCTS,
  METHODOLOGY_CATEGORIES,
  INDUSTRY_TRANSLATIONS,
  BONOS_TRANSLATIONS,
} from "@/shared/constants/kapital";

interface FormData {
  date: string;
  sector: string;
  instrument: string;
  bono: string;
  country: string;
  devaluation: string;
  tax: string;
  typeId: boolean;
  currency: string;
  kd: string;
  debt: string;
  capital: string;
  dc_ratio: string;
  effective_tax_rate: string;
  beta_levered: string;
  beta_unlevered: string;
}

export interface MarketResults {
  cppc: number;
  kd: number;
  ke: number;
  koa: number;
}

export interface Results {
  cppc: number;
  kd: number;
  ke: number;
  koa: number;
  boa?: number;
  emergent: MarketResults;
  developed: MarketResults;
  empresa_dolares: MarketResults;
  empresa_soles: MarketResults;
}

export interface SensibilizacionEntry {
  created_at?: string;
  boa?: number;
  mercado_desarrollado?: MarketResults;
  mercado_emergente?: MarketResults;
  empresa_dolares?: MarketResults;
  empresa_soles?: MarketResults;
}

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const toPossibleNumber = (value: string): string | number => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : trimmed;
};

const generateCalculationCode = () => {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replaceAll("-", "")
      : `${Date.now()}${Math.random().toString(36).slice(2, 18)}`;
  return raw.slice(0, 32);
};

const hasCompanyInputData = (data: Record<string, unknown> | null): boolean => {
  if (!data) return false;
  const kd = toOptionalNumber(data.costo_deuda ?? data.kd);
  const debt = toOptionalNumber(data.porcentaje_deuda ?? data.debt);
  const capital = toOptionalNumber(data.porcentaje_capital ?? data.capital);

  return kd !== undefined || debt !== undefined || capital !== undefined;
};

const toRate = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0;
  // Handle string percentage values like "8,50%" or "10.19%"
  if (typeof value === "string") {
    const cleaned = value.replace("%", "").replace(/\s/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    if (!Number.isFinite(parsed)) return 0;
    // If the value had % sign or is > 1, it's already in percentage form
    if (value.includes("%")) return parsed / 100;
    return parsed > 1 ? parsed / 100 : parsed;
  }
  const raw = toOptionalNumber(value);
  if (raw === undefined) return 0;
  return raw > 1 ? raw / 100 : raw;
};

const getYearAndQuarter = (dateStr: string) => {
  if (!dateStr) return { year: null, quarter: null };

  // Si la fecha es simplemente un año (ej. "2025")
  if (/^\d{4}$/.test(dateStr.trim())) {
    return { year: dateStr.trim(), quarter: "Q1" };
  }

  // Intentar parsear como fecha estándar ISO
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear().toString();
    const month = date.getMonth() + 1; // getMonth es 0 indexado
    const quarter = `Q${Math.ceil(month / 3)}`; // 1-3 -> Q1, 4-6 -> Q2, etc.
    return { year, quarter };
  }

  // Fallback por si llega en formato raro (DD/MM/YYYY)
  const yearMatch = dateStr.match(/\d{4}/);
  if (yearMatch) {
    return { year: yearMatch[0], quarter: "Q1" };
  }

  return { year: null, quarter: null };
};

const toMarketResults = (
  source: Record<string, unknown> | null
): MarketResults => {
  return {
    ke: toRate(source?.ke),
    koa: toRate(source?.koa),
    kd: toRate(source?.kd),
    cppc: toRate(source?.cppc),
  };
};

const pickBlock = (
  resultEntry: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> | null => {
  for (const key of keys) {
    const candidate = resultEntry[key];
    if (candidate && typeof candidate === "object") {
      return candidate as Record<string, unknown>;
    }
  }
  return null;
};

const computeResultsFromCalculationData = (
  data: Record<string, unknown> | null
): { results: Results; showCompanyCard: boolean } => {
  const root = data ?? {};
  const inputs = Array.isArray(root.inputs) ? root.inputs : [];
  const latestInput = inputs[inputs.length - 1];
  const source =
    latestInput && typeof latestInput === "object"
      ? (latestInput as Record<string, unknown>)
      : root;

  const resultadosArray = Array.isArray(root.resultados)
    ? root.resultados
    : Array.isArray(root.resutados)
      ? root.resutados
      : [];
  const latestResult =
    resultadosArray.length > 0 && typeof resultadosArray[0] === "object"
      ? (resultadosArray[0] as Record<string, unknown>)
      : null;

  const developedBlock = latestResult
    ? pickBlock(latestResult, ["mercado_desarrollado", "Mercado Desarrollado"])
    : null;
  const emergentBlock = latestResult
    ? pickBlock(latestResult, ["mercado_emergente", "Mercado Emergente"])
    : null;
  const companyUsdBlock = latestResult
    ? pickBlock(latestResult, ["empresa_dolares", "Empresa Dolares"])
    : null;
  const companySolesBlock = latestResult
    ? pickBlock(latestResult, ["empresa_soles", "Empresa Soles"])
    : null;

  const developed = toMarketResults(developedBlock);
  const emergent = toMarketResults(emergentBlock);
  const empresa_dolares = toMarketResults(companyUsdBlock);
  const empresa_soles = toMarketResults(companySolesBlock);

  const showCompanyCard = hasCompanyInputData(source);

  // Choose which data to show in the top-level results (cppc, kd, ke, koa)
  const primary = showCompanyCard ? empresa_dolares : emergent;

  return {
    results: {
      cppc: primary.cppc,
      kd: primary.kd,
      ke: primary.ke,
      koa: primary.koa,
      boa: toOptionalNumber(latestResult?.boa),
      emergent,
      developed,
      empresa_dolares,
      empresa_soles,
    },
    showCompanyCard,
  };
};

const extractSensibilizaciones = (
  data: Record<string, unknown> | null
): SensibilizacionEntry[] => {
  const root = data ?? {};
  const arr = Array.isArray(root.sensibilizacion) ? root.sensibilizacion : [];
  return arr
    .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
    .map((entry) => ({
      created_at: entry.created_at as string | undefined,
      boa: toOptionalNumber(entry.boa),
      mercado_desarrollado: toMarketResults(
        pickBlock(entry, ["mercado_desarrollado"])
      ),
      mercado_emergente: toMarketResults(
        pickBlock(entry, ["mercado_emergente"])
      ),
      empresa_dolares: toMarketResults(pickBlock(entry, ["empresa_dolares"])),
      empresa_soles: toMarketResults(pickBlock(entry, ["empresa_soles"])),
    }));
};

const buildCalculationDataPayload = () => {
  return {
    inputs: [],
    resultados: [],
    sensibilizacion: [],
  } as Record<string, unknown>;
};

const enrichCalculationInputPayload = (formData: FormData) => {
  const payload = {
    fecha: toPossibleNumber(formData.date),
    industria: toPossibleNumber(formData.sector),
    tasa_libre_riesgo: toPossibleNumber(formData.instrument),
    anio_bono: toPossibleNumber(formData.bono),
    pais: toPossibleNumber(formData.country),
    moneda: toPossibleNumber(formData.currency),
  } as Record<string, unknown>;

  const tax = toOptionalNumber(formData.tax);
  const devaluation = toOptionalNumber(formData.devaluation);
  const kd = toOptionalNumber(formData.kd);
  const debt = toOptionalNumber(formData.debt);
  const capital = toOptionalNumber(formData.capital);
  const dcRatio = toOptionalNumber(formData.dc_ratio);
  const effectiveTaxRate = toOptionalNumber(formData.effective_tax_rate);
  const betaLevered = toOptionalNumber(formData.beta_levered);
  const betaUnlevered = toOptionalNumber(formData.beta_unlevered);

  if (tax !== undefined) payload.tasa_impositiva = tax;
  if (devaluation !== undefined) payload.devaluacion = devaluation;
  if (betaUnlevered !== undefined) payload.beta_desapalancado = betaUnlevered;
  if (
    formData.typeId ||
    kd !== undefined ||
    debt !== undefined ||
    capital !== undefined
  ) {
    if (kd !== undefined) payload.costo_deuda = kd;
    if (debt !== undefined) payload.porcentaje_deuda = debt;
    if (capital !== undefined) payload.porcentaje_capital = capital;
    if (dcRatio !== undefined) payload.dc_ratio = dcRatio;
    if (effectiveTaxRate !== undefined) {
      payload.tasa_efectiva_impuesto = effectiveTaxRate;
    }
    if (betaLevered !== undefined) payload.beta_apalancado = betaLevered;
  }

  return payload;
};

const KapitalPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: "",
    sector: "",
    instrument: "",
    bono: "",
    country: "",
    devaluation: "",
    tax: "",
    typeId: false,
    currency: "USD",
    kd: "",
    debt: "",
    capital: "",
    dc_ratio: "",
    effective_tax_rate: "",
    beta_levered: "",
    beta_unlevered: "",
  });

  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaccCalculated, setIsWaccCalculated] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsSection, setResultsSection] = useState<
    "result" | "analysis" | "methodology"
  >("result");
  const [isReportSidebarOpen, setIsReportSidebarOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [selectedReportProductId, setSelectedReportProductId] = useState("1");
  const [results, setResults] = useState<Results | null>(null);
  const [showCompanyCard, setShowCompanyCard] = useState(false);
  const [resultCurrency, setResultCurrency] = useState<"pen" | "usd">("pen");
  const [analysisDC, setAnalysisDC] = useState("");
  const [analysisKd, setAnalysisKd] = useState("");
  const [analysisCurrency, setAnalysisCurrency] = useState("Dólares");
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: ToastType; message: string }>
  >([]);

  // Store the full persisted calculation for update and sensibilization access
  const [currentCalculation, setCurrentCalculation] =
    useState<Calculation | null>(null);
  const [sensibilizaciones, setSensibilizaciones] = useState<
    SensibilizacionEntry[]
  >([]);

  // Guarda el ID de la sesión que el servidor pre-calentó
  const [prewarmedSessionId, setPrewarmedSessionId] = useState<string | null>(
    null
  );

  // Estado para guardar la lista dinámica de sectores
  const [dynamicSectors, setDynamicSectors] = useState<string[]>([]);
  const [dynamicDates, setDynamicDates] = useState<string[]>([]);

  // Booleans para controlar donde debe aparecer el boton de IA
  const isViewingMethodology = showResults && resultsSection === "methodology";
  const shouldShowChatbot = !isReportViewerOpen && !isViewingMethodology;

  // Estado para controlar el botón de Mostrar comparraciones
  const [showComparison, setShowComparison] = useState(false);

  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());
  const lastEditedFieldRef = useRef<"debt" | "capital" | null>(null);

  const { user } = useAuth();

  useEffect(
    () => () => {
      toastTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
      toastTimeoutsRef.current.clear();
    },
    []
  );

  // Fetch de los sectores dinámicos al cargar la página
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const [sectorsResponse, datesResponse] = await Promise.all([
          MainService.getTemplateComplements("damodaran", true, false), // Solo Nombres
          MainService.getTemplateComplements("rf", false, true), // Solo Fechas
        ]);

        if (Array.isArray(sectorsResponse) && sectorsResponse.length > 0) {
          const cleanSectors = sectorsResponse
            .filter((s) => typeof s === "string" && s.trim() !== "")
            .map((s) => s.trim());

          // Eliminamos duplicados finales
          const uniqueSectors = Array.from(new Set(cleanSectors));

          setDynamicSectors(uniqueSectors);
        }
        if (Array.isArray(datesResponse) && datesResponse.length > 0) {
          setDynamicDates(datesResponse);
        }
      } catch (error) {
        console.error("Error al cargar los sectores dinámicos:", error);
      }
    };

    fetchSectors();
  }, []);

  // Fetch del cálculo si la URL tiene un código (UUID)
  useEffect(() => {
    const loadFromUrl = async () => {
      // Extrae el código de la URL, asumiendo formato /kapital/{code}
      const pathParts = window.location.pathname.split("/");
      const code = pathParts[pathParts.length - 1];

      if (code && code !== "kapital" && code !== "") {
        try {
          setIsLoading(true);
          const calc = await MainService.getCalculationByCode(code);

          if (calc) {
            setCurrentCalculation(calc);

            // Reconstruir resultados y sensibilizaciones
            const { results: rebuiltResults, showCompanyCard: hasCompanyData } =
              computeResultsFromCalculationData(calc.data);
            const sensibilizacionData = extractSensibilizaciones(calc.data);

            // Reconstruir el formData con el último input guardado
            const dataObj = calc.data as { inputs?: any[] };
            const latestInput = Array.isArray(dataObj.inputs)
              ? dataObj.inputs[0]
              : undefined;
            if (latestInput) {
              setFormData((prev) => ({
                ...prev,
                date: (latestInput.fecha as string) || "",
                sector: (latestInput.industria as string) || "",
                instrument: (latestInput.tasa_libre_riesgo as string) || "",
                bono: (latestInput.anio_bono as string) || "",
                country: (latestInput.pais as string) || "",
                currency: (latestInput.moneda as string) || "USD",
                tax: (latestInput.tasa_impositiva as string) || "",
                kd: (latestInput.costo_deuda as string) || "",
                debt: (latestInput.porcentaje_deuda as string) || "",
                capital: (latestInput.porcentaje_capital as string) || "",
                dc_ratio: (latestInput.dc_ratio as string) || "",
                effective_tax_rate:
                  (latestInput.tasa_efectiva_impuesto as string) || "",
                beta_levered: (latestInput.beta_apalancado as string) || "",
                typeId: !!(
                  latestInput.costo_deuda || latestInput.porcentaje_deuda
                ),
              }));
            }

            setResults(rebuiltResults);
            setShowCompanyCard(hasCompanyData);
            setSensibilizaciones(sensibilizacionData);
            setIsWaccCalculated(true);
            setShowResults(true);
            setIsFormOpen(false);
          }
        } catch (error) {
          console.error("No se encontró el cálculo en la URL", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadFromUrl();
  }, []);

  useEffect(() => {
    if (formData.debt !== "" && lastEditedFieldRef.current === "debt") {
      const debtPercent = parseFloat(formData.debt);
      if (!isNaN(debtPercent) && debtPercent <= 100) {
        const capitalValue = 100 - debtPercent;
        const capitalStr =
          capitalValue === Math.floor(capitalValue)
            ? capitalValue.toString()
            : capitalValue.toString();
        setFormData((prev) => ({
          ...prev,
          capital: capitalStr,
        }));
      }
    }
  }, [formData.debt]);

  useEffect(() => {
    if (formData.capital !== "" && lastEditedFieldRef.current === "capital") {
      const capitalPercent = parseFloat(formData.capital);
      if (!isNaN(capitalPercent) && capitalPercent <= 100) {
        const debtValue = 100 - capitalPercent;
        const debtStr =
          debtValue === Math.floor(debtValue)
            ? debtValue.toString()
            : debtValue.toString();
        setFormData((prev) => ({
          ...prev,
          debt: debtStr,
        }));
      }
    }
  }, [formData.capital]);

  useEffect(() => {
    if (!showResults) {
      setIsReportViewerOpen(false);
    }
  }, [showResults]);

  //  Llama al pre-warm en segundo plano
  useEffect(() => {
    const preWarmSession = async () => {
      try {
        const response = await fetch("/api/v1/main/calculations/prewarm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.session_id) {
            setPrewarmedSessionId(data.session_id);
          }
        }
      } catch (e) {
        console.error("Fallo pre-warm. Se creará la sesión al dar clic.", e);
      }
    };

    // Solo hacemos pre-warm si no hay un cálculo activo
    if (!currentCalculation) {
      preWarmSession();
    }
  }, [currentCalculation]);

  // Función para extraer año y trimestre de la fecha ingresada, con múltiples formatos soportados
  const getYearAndQuarter = (dateStr: string) => {
    if (!dateStr) return { year: null, quarter: null };

    const trimmed = dateStr.trim();

    // 1. Si la fecha es simplemente un año (ej. "2025")
    if (/^\d{4}$/.test(trimmed)) {
      return { year: trimmed, quarter: "Q1" };
    }

    // 2. Intentar parsear formato DD/MM/YYYY o DD-MM-YYYY (ej: 30/06/2024)
    const ddMMyyyyMatch = trimmed.match(
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
    );
    if (ddMMyyyyMatch) {
      const month = parseInt(ddMMyyyyMatch[2], 10);
      const year = ddMMyyyyMatch[3];
      const quarter = `Q${Math.ceil(month / 3)}`;
      return { year, quarter };
    }

    // 3. Intentar parsear formato YYYY-MM-DD o YYYY/MM/DD (ej: 2024-06-30)
    const yyyyMMddMatch = trimmed.match(
      /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/
    );
    if (yyyyMMddMatch) {
      const year = yyyyMMddMatch[1];
      const month = parseInt(yyyyMMddMatch[2], 10);
      const quarter = `Q${Math.ceil(month / 3)}`;
      return { year, quarter };
    }

    // 4. Fallback: Intentar parsear como fecha nativa de JS
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear().toString();
      const month = date.getMonth() + 1; // getMonth es 0 indexado (0 = Enero)
      const quarter = `Q${Math.ceil(month / 3)}`;
      return { year, quarter };
    }

    // 5. Extraer cualquier año de 4 dígitos que encuentre
    const fallbackYearMatch = trimmed.match(/\d{4}/);
    if (fallbackYearMatch) {
      return { year: fallbackYearMatch[0], quarter: "Q1" };
    }

    return { year: null, quarter: null };
  };

  // Comprobación de cambios en fecha o país para auto-rellenar complementos de IR y Devaluación
  useEffect(() => {
    const fetchAutoFillData = async () => {
      if (!formData.date || !formData.country) return;

      const { year, quarter } = getYearAndQuarter(formData.date);
      if (!year) return;

      try {
        const [irResponse, devResponse] = await Promise.all([
          MainService.getComplementSpecificValue("ir", year, formData.country),
          MainService.getComplementSpecificValue(
            "devaluacion",
            year,
            formData.country,
            quarter || undefined
          ),
        ]);

        setFormData((prev) => {
          const updates = { ...prev };

          // Actualizamos Tasa Impositiva si el backend encontró el valor
          if (irResponse?.valor !== null && irResponse?.valor !== undefined) {
            updates.tax = (Number(irResponse.valor) * 100).toFixed(2);
          }

          // Actualizamos Devaluación si el backend encontró el valor
          if (devResponse?.valor !== null && devResponse?.valor !== undefined) {
            updates.devaluation = (Number(devResponse.valor) * 100).toFixed(2);
          }

          return updates;
        });
      } catch (error) {
        console.error(
          "Error auto-rellenando complementos IR y Devaluacion:",
          error
        );
      }
    };

    fetchAutoFillData();
  }, [formData.date, formData.country]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeoutId = toastTimeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(id);
    }
  };

  const addToast = (type: ToastType, message: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    const timeoutId = window.setTimeout(() => removeToast(id), 3500);
    toastTimeoutsRef.current.set(id, timeoutId);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Track which field was last edited for debt/capital auto-calculation
    if (name === "debt" || name === "capital") {
      lastEditedFieldRef.current = name as "debt" | "capital";
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields: string[] = [];
    if (!formData.date) missingFields.push("Fecha");
    if (!formData.sector) missingFields.push("Sector");
    if (!formData.country) missingFields.push("País");
    if (missingFields.length > 0) {
      addToast("warn", `Completa los campos: ${missingFields.join(", ")}`);
      return;
    }

    // --- CORRECCIÓN DE AUTENTICACIÓN ---
    let currentUserId = user?.id;
    if (!currentUserId) {
      try {
        // Leemos la llave que usa useAuth
        const storedUser = localStorage.getItem("user_data");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          currentUserId = parsed.id;
        }
      } catch (err) {
        console.warn("Could not read user from storage", err);
      }
    }

    if (!currentUserId) {
      addToast(
        "error",
        "No se pudo identificar al usuario para guardar el cálculo."
      );
      return;
    }

    setShowResults(false);
    setIsLoading(true);

    const betaUnlevered = toOptionalNumber(formData.beta_unlevered);
    const isBetaUpdate =
      isWaccCalculated && currentCalculation && betaUnlevered !== undefined;

    try {
      let persistedCalculation: Calculation;
      // Si ya hay un cálculo actual, SIEMPRE hacemos PUT
      if (currentCalculation) {
        const updated = await MainService.updateCalculation(
          currentCalculation!.id,
          {
            data: {
              inputs: [enrichCalculationInputPayload(formData)],
            },
          }
        );
        persistedCalculation = await MainService.getCalculation(updated.id);
      } else {
        // CREATE new calculation
        const created = await MainService.createCalculation({
          calculation_file_id: null,
          user_id: currentUserId,
          code: generateCalculationCode(),
          type: "kapital",
          data: {
            ...buildCalculationDataPayload(),
            inputs: [enrichCalculationInputPayload(formData)],
            prewarmed_session_id: prewarmedSessionId,
          },
        });
        persistedCalculation = await MainService.getCalculation(created.id);

        window.history.pushState(
          {},
          "",
          `/kapital/${persistedCalculation.code}`
        );
      }

      const { results: rebuiltResults, showCompanyCard: hasCompanyData } =
        computeResultsFromCalculationData(persistedCalculation.data);
      const sensibilizacionData = extractSensibilizaciones(
        persistedCalculation.data
      );

      // Autorellenar el input de devaluación con la respuesta de Excel
      /*if (rebuiltResults.expected_devaluation !== undefined) {
        let devVal = rebuiltResults.expected_devaluation;
        if (devVal > 0 && devVal < 1) {
          devVal = devVal * 100;
        }

        // Actualizamos el form para que aparezca en el FormField deshabilitado
        setFormData((prev) => ({
          ...prev,
          devaluation: devVal.toFixed(2),
        }));
      }*/

      setResults(rebuiltResults);
      setShowCompanyCard(hasCompanyData);
      setCurrentCalculation(persistedCalculation);
      setSensibilizaciones(sensibilizacionData);
      setIsWaccCalculated(true);
      setShowResults(true);
      setIsFormOpen(false);

      if (isBetaUpdate) {
        // Navigate a analysis cuando se manda el beta desapalancado para sensibilización
        setResultsSection("analysis");
        addToast(
          "success",
          `Sensibilización calculada con β=${betaUnlevered} (cálculo #${persistedCalculation.id}).`
        );
      } else {
        setResultsSection("result");
        addToast(
          "success",
          `Resultados generados y guardados (cálculo #${persistedCalculation.id}).`
        );
      }
    } catch (error) {
      console.error("Error in Kapital calculation", error);
      addToast("error", "No se pudo guardar el cálculo. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      addToast(
        "info",
        "La sensibilización ahora se calcula desde Excel. Presiona CALCULA TU WACC para refrescar datos."
      );
    }, 800);
  };

  const handleResultsSectionChange = (
    nextSection: "result" | "analysis" | "methodology"
  ) => {
    if (isReportViewerOpen) {
      setIsReportViewerOpen(false);
    }
    if (isReportSidebarOpen) {
      setIsReportSidebarOpen(false);
    }
    setResultsSection(nextSection);
    if (nextSection === "methodology" && isFormOpen) {
      setIsFormOpen(false);
    }
  };

  const handleReportSidebarOpen = () => {
    setIsReportSidebarOpen(true);
    if (isFormOpen) setIsFormOpen(false);
  };

  const handleReportViewerOpen = () => {
    setIsReportViewerOpen(true);
    setIsReportSidebarOpen(false);
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
  };

  const getSelectedView = (): "result" | "analysis" | "methodology" | "" => {
    if (!showResults || isReportViewerOpen) return "";
    return resultsSection;
  };

  const mainContent = showResults ? (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {isReportViewerOpen ? (
        <section className="flex justify-center w-full px-4 pb-10 sm:px-8 lg:pt-6">
          <div className="w-full max-w-7xl rounded-lg border border-gray-200 bg-white shadow">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h4 className="text-sm font-semibold text-gray-800">
                {selectedReportProductId === "1"
                  ? "REPORTE BÁSICO"
                  : selectedReportProductId === "2"
                    ? "REPORTE DETALLADO"
                    : "REPORTE COMPLETO"}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReportViewerOpen(false)}
                  className="rounded border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600"
                >
                  Salir
                </button>
                <a
                  href="/files/Reporte-Detallado.pdf"
                  download
                  className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Descargar
                </a>
              </div>
            </div>
            <div className="h-[70vh] w-full">
              <iframe
                title="Reporte de capital"
                src="/files/Reporte-Detallado.pdf"
                className="h-full w-full"
              />
            </div>
          </div>
        </section>
      ) : (
        <KapitalResults
          section={resultsSection}
          results={results}
          showCompanyCard={showCompanyCard}
          resultCurrency={resultCurrency}
          onResultCurrencyChange={setResultCurrency}
          analysisDC={analysisDC}
          analysisKd={analysisKd}
          analysisCurrency={analysisCurrency}
          onAnalysisDCChange={setAnalysisDC}
          onAnalysisKdChange={setAnalysisKd}
          onAnalysisCurrencyChange={setAnalysisCurrency}
          onAnalysisSubmit={handleAnalysisSubmit}
          loading={isLoading}
          methodologyCategories={METHODOLOGY_CATEGORIES}
          showComparison={showComparison}
          onToggleComparison={() => setShowComparison(true)}
          sensibilizaciones={sensibilizaciones}
          onOpenReport={handleReportSidebarOpen}
        />
      )}

      {!showComparison && (
        <MainPageFooter brandName="Valora" brandHref="/valora" />
      )}
    </div>
  ) : (
    <FinancePageTemplate
      brandName="Valora"
      brandHref="/valora"
      heroTitle="Bienvenido a Kapital"
      btnText="Kapital"
      onOpenForm={() => setIsFormOpen((prev) => !prev)}
    />
  );

  return (
    <div className="min-h-dvh bg-gray-50">
      <NavBar
        user={user}
        onLogout={handleLogout}
        onToggleForm={() => setIsFormOpen((prev) => !prev)}
        isFormOpen={isFormOpen}
        hasResults={!!results}
        logoHref="/kapital"
        logoSrc="/images/logo-kapital-small.png"
        logoAlt="Kapital Logo"
        projectsHref="/usuario/proyectos"
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
        onOpenReport={handleReportSidebarOpen}
      />

      <NavigationTabs
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
        onOpenReport={handleReportSidebarOpen}
        hasResults={!!results}
      />

      <main
        className={`${showResults ? "pt-24 lg:pt-16" : "pt-12 lg:pt-16"} h-screen transition-all duration-300 ${isFormOpen ? "lg:pl-105" : "lg:pl-0"}`}
      >
        {mainContent}
      </main>

      <aside
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-105 border-r border-gray-200 bg-white shadow-sm transition-transform duration-200 ${isFormOpen ? "translate-x-0" : "-translate-x-105"}`}
      >
        <div className="h-full overflow-hidden">
          <FormSidebar
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            loading={isLoading}
            isWaccCalculated={isWaccCalculated}
            dates={dynamicDates.length > 0 ? dynamicDates : []}
            sectors={dynamicSectors.length > 0 ? dynamicSectors : []}
            hasSensibilizaciones={sensibilizaciones.length > 0}
            industryTranslations={INDUSTRY_TRANSLATIONS}
            instruments={INSTRUMENTS}
            bonos={BONOS}
            bonosTranslations={BONOS_TRANSLATIONS}
            countries={COUNTRIES}
            currencies={CURRENCIES}
          />
        </div>
      </aside>

      <ReportSidebar
        isOpen={isReportSidebarOpen}
        onClose={() => setIsReportSidebarOpen(false)}
        reportProducts={REPORT_PRODUCTS}
        selectedReportProductId={selectedReportProductId}
        onSelectReportProduct={setSelectedReportProductId}
        onOpenReportViewer={handleReportViewerOpen}
      />

      {shouldShowChatbot && <Chatbot geminiApiKey="" />}

      <ToastStack toasts={toasts} onDismiss={removeToast} />
      {isLoading && <LoadingOverlay />}
    </div>
  );
};

export default KapitalPage;
