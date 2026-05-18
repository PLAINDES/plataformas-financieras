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
import Chatbot from "../components/Chatbot/Chatbot";
import type { ToastType } from "@/shared/types/toast.types";
import { MainService } from "@/shared/services/main.service";
import type { Calculation } from "@/shared/types";
import "./KapitalPage.css";
import { useLocation } from "react-router-dom";
import { LoginModal } from "@/features/auth/components/LoginModal";

import {
  INSTRUMENTS,
  BONOS,
  COUNTRIES,
  COUNTRIES_TRANSLATIONS,
  REPORT_PRODUCTS,
  METHODOLOGY_CATEGORIES,
  INDUSTRY_TRANSLATIONS,
  BONOS_TRANSLATIONS,
  EXCLUDED_INDUSTRIES,
  COUNTRY_LOCAL_CURRENCIES,
} from "@/shared/constants/kapital";

import {
  toOptionalNumber,
  computeResultsFromCalculationData,
  extractSensibilizaciones,
  enrichCalculationInputPayload,
  buildCalculationDataPayload,
  generateCalculationCode,
  getYearAndQuarter,
} from "./services/kapital.utils";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

export interface FormData {
  date: string;
  sector: string;
  beta_unlevered_industry: string;
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
  cppc: number | string;
  kd: number | string;
  ke: number | string;
  koa: number | string;
  "kd(1-t)": string | number;
  d_empresa: string | number;
}

export interface Results {
  cppc: number | string;
  kd: number | string;
  ke: number | string;
  koa: number | string;
  boa?: number;
  emergent: MarketResults;
  developed: MarketResults;
  empresa_dolares: MarketResults;
  empresa_soles: MarketResults;
  d_empresa: string | number;
}

export interface SensibilizacionEntry {
  created_at?: string;
  boa?: number;
  mercado_desarrollado?: MarketResults;
  mercado_emergente?: MarketResults;
  empresa_dolares?: MarketResults;
  empresa_soles?: MarketResults;
}

const KapitalPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    date: "",
    sector: "",
    beta_unlevered_industry: "",
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

  const location = useLocation();

  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isWaccCalculated, setIsWaccCalculated] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [resultsSection, setResultsSection] = useState<
    "result" | "sensitivity"
  >("result");

  const [isReportSidebarOpen, setIsReportSidebarOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

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
  //const isViewingMethodology = showResults && resultsSection === "methodology";

  const isProyectosRoute = location.pathname.includes("/proyectos");
  const shouldShowChatbot =
    !isReportViewerOpen && isWaccCalculated && !isProyectosRoute;
  // Estado para controlar el botón de Mostrar comparraciones
  const [showComparison, setShowComparison] = useState(false);

  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());
  const lastEditedFieldRef = useRef<"debt" | "capital" | null>(null);

  const { user, login, logout } = useAuthContext();

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
            .map((s) => s.trim())
            .filter((s) => !EXCLUDED_INDUSTRIES.includes(s));

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
      // Extrae el código de la URL, formato /kapital/{code}
      const pathParts = window.location.pathname.split("/");
      const code = pathParts[pathParts.length - 1];

      if (code && code !== "kapital" && code !== "") {
        try {
          const calculationData = await MainService.getCalculationByCode(code);

          if (calculationData) {
            setCurrentCalculation(calculationData);

            // Reconstruir resultados y sensibilizaciones
            const { results: rebuiltResults, showCompanyCard: hasCompanyData } =
              computeResultsFromCalculationData(calculationData.data);
            const sensibilizacionData = extractSensibilizaciones(
              calculationData.data
            );

            // Reconstruir el formData con el último input guardado
            const dataObj = calculationData.data as { inputs?: any[] };
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

              if (latestInput.moneda === "USD") {
                setResultCurrency("usd");
              } else {
                setResultCurrency("pen");
              }
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
        }
        // Iniciamos el pre-warm en segundo plano
        MainService.prewarmSession()
          .then((data) => {
            if (data && data.session_id) {
              // Si el pre-warm fue exitoso, guardamos el ID para que arranque el Heartbeat
              setPrewarmedSessionId(data.session_id);
            }
          })
          .catch((e) => {
            console.warn("Pre-warm background failed", e);
          });
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

  // Comprobación para calcular automáticamente "Beta Unlevered Industry"
  useEffect(() => {
    const calculateBetaIndustry = async () => {
      // 1. Validar que tengamos fecha y sector
      if (!formData.date || !formData.sector) {
        setFormData((prev) =>
          prev.beta_unlevered_industry !== ""
            ? { ...prev, beta_unlevered_industry: "" }
            : prev
        );
        return;
      }

      const { year } = getYearAndQuarter(formData.date);
      if (!year) return;

      try {
        // 2. Traer los complementos completos
        // (Asumiendo que llamar a getTemplateComplements sin banderas trae el JSON completo)
        const [damodaranResponse, taxResponse] = await Promise.all([
          MainService.getTemplateComplements("damodaran"),
          MainService.getTemplateComplements("tax"),
        ]);

        // Extraer los arrays "data" de las respuestas
        const damodaranData = damodaranResponse?.[0]?.data || [];
        const taxData = taxResponse?.[0]?.data || [];

        // 3. Buscar los registros exactos por Año y Sector
        const damoMatch = damodaranData.find(
          (item: any) =>
            String(item.fecha) === String(year) &&
            item.industria === formData.sector
        );

        const taxMatch = taxData.find(
          (item: any) => String(item.fecha) === String(year)
        );

        // 4. Si encontramos ambos, aplicamos la fórmula
        if (damoMatch && taxMatch) {
          const beta = Number(damoMatch.beta);
          const d_sobre_def = Number(damoMatch.d_sobre_def);
          const e_sobre_de = Number(damoMatch.e_sobre_de);
          const tax_rate = Number(taxMatch.tax_rate);

          // Prevenir divisiones entre cero o valores inválidos
          if (
            !isNaN(beta) &&
            !isNaN(d_sobre_def) &&
            !isNaN(e_sobre_de) &&
            !isNaN(tax_rate) &&
            e_sobre_de !== 0
          ) {
            // Fórmula: beta / (1 + (1-tax_rate) * (d_sobre_def / e_sobre_de))
            const denominator = 1 + (1 - tax_rate) * (d_sobre_def / e_sobre_de);
            const calculatedBeta = beta / denominator;

            setFormData((prev) => ({
              ...prev,
              beta_unlevered_industry: calculatedBeta.toFixed(2),
            }));
          }
        } else {
          // Si no hay datos en la BD para ese año/sector, limpiamos el campo
          setFormData((prev) => ({ ...prev, beta_unlevered_industry: "" }));
        }
      } catch (error) {
        console.error("Error calculando beta unlevered industry:", error);
      }
    };

    calculateBetaIndustry();
  }, [formData.date, formData.sector]);

  useEffect(() => {
    if (!showResults) {
      setIsReportViewerOpen(false);
    }
  }, [showResults]);

  //  Llama al pre-warm en segundo plano
  useEffect(() => {
    const preWarmSession = async () => {
      try {
        const data = await MainService.prewarmSession();

        if (data && data.session_id) {
          setPrewarmedSessionId(data.session_id);
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

  // UseEffect
  useEffect(() => {
    let intervalId: number;
    let attempts = 0;
    const MAX_ATTEMPTS = 10; // 10 intentos * 2 min = 20 minutos máximo de vida

    if (prewarmedSessionId) {
      // 4 minutos = 240,000 ms (justo antes de los 5 min de expiración)
      intervalId = window.setInterval(async () => {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
          clearInterval(intervalId);
          console.log(
            "Se dejó expirar la sesión de Excel para ahorrar recursos."
          );
          return;
        }

        try {
          await MainService.keepAliveSession(prewarmedSessionId);
          console.log(
            `Sesión Excel refrescada (intento ${attempts}/${MAX_ATTEMPTS})`
          );
        } catch (e) {
          console.warn("Fallo el keep-alive, la sesión podría morir.", e);
        }
      }, 240000);
    }

    // Cleanup: Si el usuario cambia de página o cierra el componente, el intervalo se limpia
    // y la sesión en Microsoft morirá a los 5 minutos solita.
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [prewarmedSessionId]);

  // Comprobación de cambios en fecha o país para auto-rellenar complementos de IR y Devaluación
  useEffect(() => {
    const fetchAutoFillData = async () => {
      if (!formData.date || !formData.country) {
        setFormData((prev) => {
          // Solo actualizamos si realmente tienen algo, para evitar re-renderizados innecesarios
          if (prev.tax !== "" || prev.devaluation !== "") {
            return { ...prev, tax: "", devaluation: "" };
          }
          return prev;
        });
        return;
      }

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
          } else {
            updates.tax = "";
          }

          // Actualizamos Devaluación si el backend encontró el valor
          if (devResponse?.valor !== null && devResponse?.valor !== undefined) {
            updates.devaluation = (Number(devResponse.valor) * 100).toFixed(2);
          } else {
            updates.devaluation = "";
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

  // Sincroniza la moneda de los resultados con la moneda guardada en el cálculo oficial
  useEffect(() => {
    const inputs = currentCalculation?.data?.inputs;

    if (Array.isArray(inputs) && inputs.length > 0) {
      // 2. Declaramos que el elemento 0 es un objeto que puede tener cualquier propiedad
      const firstInput = inputs[0] as Record<string, any>;
      const savedCurrency = firstInput.moneda;

      if (savedCurrency === "USD") {
        setResultCurrency("usd");
      } else if (savedCurrency) {
        // "Moneda Local" o cualquier otro valor
        setResultCurrency("pen");
      }
    }
  }, [currentCalculation]);

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

    setFormData((prev) => {
      const updates = { ...prev, [name]: value };

      // REINICIO DE MONEDA
      if (name === "country") {
        const newLocalCode = COUNTRY_LOCAL_CURRENCIES[value];
        if (updates.currency !== "USD" && updates.currency !== newLocalCode) {
          updates.currency = "USD";
        }
      }

      // Track para deuda/capital
      if (name === "debt" || name === "capital") {
        lastEditedFieldRef.current = name as "debt" | "capital";
      }

      return updates;
    });
  };

  const handleSubmit = async (e?: React.FormEvent, explicitBeta?: string) => {
    if (e) e.preventDefault();

    // Si llega beta desde el chabot
    const dataToSubmit = { ...formData };
    if (explicitBeta !== undefined) {
      dataToSubmit.beta_unlevered = explicitBeta;
      setFormData((prev) => ({ ...prev, beta_unlevered: explicitBeta }));
    }

    const missingFields: string[] = [];
    if (!dataToSubmit.date) missingFields.push("Fecha");
    if (!dataToSubmit.sector) missingFields.push("Sector");
    if (!dataToSubmit.country) missingFields.push("País");
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

    setShowResults(false);
    setIsLoading(true);

    const betaUnlevered = toOptionalNumber(dataToSubmit.beta_unlevered);
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
              inputs: [enrichCalculationInputPayload(dataToSubmit)],
              active_session_id: prewarmedSessionId,
            },
          }
        );
        persistedCalculation = await MainService.getCalculation(updated.id);
      } else {
        // CREATE new calculation
        const created = await MainService.createCalculation({
          calculation_file_id: null,
          user_id: currentUserId || null,
          code: generateCalculationCode(),
          type: "kapital",
          data: {
            ...buildCalculationDataPayload(),
            inputs: [enrichCalculationInputPayload(dataToSubmit)],
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

      const newSessionId = persistedCalculation.data?.active_session_id as
        | string
        | undefined;
      if (newSessionId && newSessionId !== prewarmedSessionId) {
        setPrewarmedSessionId(newSessionId);
      }

      const { results: rebuiltResults, showCompanyCard: hasCompanyData } =
        computeResultsFromCalculationData(persistedCalculation.data);
      const sensibilizacionData = extractSensibilizaciones(
        persistedCalculation.data
      );

      setResults(rebuiltResults);
      setShowCompanyCard(hasCompanyData);
      setCurrentCalculation(persistedCalculation);
      setSensibilizaciones(sensibilizacionData);
      setIsWaccCalculated(true);
      setShowResults(true);
      setIsFormOpen(false);

      if (isBetaUpdate) {
        // Navigate a sensitivity cuando se manda el beta desapalancado para sensibilización
        setResultsSection("sensitivity");
        setShowComparison(false);
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

  const dataObj = currentCalculation?.data as { inputs?: any[] } | undefined;
  const savedInputs = dataObj?.inputs?.[0];
  const savedCountry = savedInputs?.pais;

  // La etiqueta de la moneda local siempre depende del país guardado
  const activeSavedCurrency = savedCountry
    ? COUNTRY_LOCAL_CURRENCIES[savedCountry] || "Moneda Local"
    : "Moneda Local";

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
    nextSection: "result" | "sensitivity"
  ) => {
    if (isReportViewerOpen) {
      setIsReportViewerOpen(false);
    }
    if (isReportSidebarOpen) {
      setIsReportSidebarOpen(false);
    }
    setResultsSection(nextSection);
    /*if (nextSection === "methodology" && isFormOpen) {
      setIsFormOpen(false);
    }*/
  };

  const handleReportSidebarOpen = () => {
    setIsReportSidebarOpen(true);
    if (isFormOpen) setIsFormOpen(false);
  };

  const handleOpenSensibilizacion = () => {
    if (isChatbotOpen) {
      setIsChatbotOpen(false);
      //setIsFormOpen(false);
    } else {
      //setIsFormOpen(true);
      setIsChatbotOpen(true);
    }
  };

  const handleReportViewerOpen = () => {
    setIsReportViewerOpen(true);
    setIsReportSidebarOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    addToast("success", "Has cerrado sesión exitosamente.");
  };

  const getSelectedView = (): "result" | "sensitivity" | "" => {
    if (!showResults || isReportViewerOpen) return "";
    return resultsSection;
  };

  useEffect(() => {
    const isMobile = window.innerWidth <= 540;

    if (isFormOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFormOpen]);

  const hasReachedMaxSens = sensibilizaciones.length >= 2;

  const chatbotComponent =
    shouldShowChatbot && !hasReachedMaxSens ? (
      <Chatbot
        formData={formData}
        isWaccCalculated={isWaccCalculated}
        isOpen={isChatbotOpen}
        setIsOpen={setIsChatbotOpen}
        onCalculateWacc={(beta: string) => handleSubmit(undefined, beta)}
      />
    ) : null;

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
          onToggleComparison={setShowComparison}
          sensibilizaciones={sensibilizaciones}
          onOpenReport={handleReportSidebarOpen}
          onSensibilizaClick={handleOpenSensibilizacion}
          localCurrency={activeSavedCurrency}
          chatbotComponent={chatbotComponent}
        />
      )}

      <MainPageFooter brandName="Valora" brandHref="/valora" />
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
        onLoginClick={() => setIsLoginModalOpen(true)}
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
        onOpenReport={handleReportSidebarOpen}
        hasSensibilizaciones={sensibilizaciones.length > 0}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={login}
        onSwitchToRegister={() => {
          setIsLoginModalOpen(false);
        }}
      />

      <NavigationTabs
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
        onOpenReport={handleReportSidebarOpen}
        hasResults={!!results}
      />

      <main
        className={`${showResults ? "pt-24 lg:pt-16" : "pt-12 lg:pt-16"} h-screen transition-all duration-300 ${isFormOpen ? "lg:pl-90" : "lg:pl-0"}`}
      >
        {mainContent}
      </main>

      <aside
        className={`fixed left-0 top-16 max-[540px]:z-70 z-40 h-[calc(100dvh-4rem)] max-[540px]:w-full w-90 border-r border-gray-200 bg-white shadow-sm transition-transform duration-200 ${isFormOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full">
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
            countriesTranslations={COUNTRIES_TRANSLATIONS}
            countryLocalCurrencies={COUNTRY_LOCAL_CURRENCIES}
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

      {/*shouldShowChatbot && (
        <Chatbot
          formData={formData}
          isWaccCalculated={isWaccCalculated}
          isOpen={isChatbotOpen}
          setIsOpen={(val: boolean) => {
            setIsChatbotOpen(val);
            f (val && !isFormOpen) {
              setIsFormOpen(true);
            }
          }}
          onCalculateWacc={(beta: string) => handleSubmit(undefined, beta)}
        />
      )*/}

      <ToastStack toasts={toasts} onDismiss={removeToast} />
      {isLoading && <LoadingOverlay />}
    </div>
  );
};

export default KapitalPage;
