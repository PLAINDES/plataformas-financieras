import { useState, useEffect, useRef, useCallback } from "react";
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
import "./KapitalPage.css";
import { useLocation } from "react-router-dom";
import { LoginModal } from "@/features/auth/components/LoginModal";

import { useKapitalCalculation } from "./hooks/useKapitalCalculation";
import { useKapitalForm } from "./hooks/useKapitalForm";
import { useToast } from "@/shared/components/common/ToastProvider";
import {
  type CompanyData,
  type YahooFinanceData,
  type CompanyModalActions,
} from "../components/Chatbot/chatbot.interfaces";
import { Bot, X } from "lucide-react";

import {
  INSTRUMENTS,
  BONOS,
  COUNTRIES,
  COUNTRIES_TRANSLATIONS,
  REPORT_PRODUCTS,
  METHODOLOGY_CATEGORIES,
  INDUSTRY_TRANSLATIONS,
  BONOS_TRANSLATIONS,
  COUNTRY_LOCAL_CURRENCIES,
} from "@/shared/constants/kapital";

import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { ReportViewer } from "./components/ReportViewer";
import { YahooResults } from "../components/Chatbot/ChatbotUI";

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
  const { user, login, logout } = useAuthContext();
  const { addToast } = useToast();
  const location = useLocation();

  const sectorCache = useRef<Record<string, YahooFinanceData>>({});
  const requestTimestamps = useRef<number[]>([]);

  // Estadps de UI
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [resultsSection, setResultsSection] = useState<
    "result" | "sensitivity"
  >("result");
  const [showResults, setShowResults] = useState(false);

  const [isReportSidebarOpen, setIsReportSidebarOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [selectedReportProductId, setSelectedReportProductId] = useState("");
  const [analysisDC, setAnalysisDC] = useState("");
  const [analysisKd, setAnalysisKd] = useState("");
  const [analysisCurrency, setAnalysisCurrency] = useState("Dólares");

  const [betaInput, setBetaInput] = useState("");
  const [isSearchingBeta, setIsSearchingBeta] = useState(false);
  const [modalData, setModalData] = useState<YahooFinanceData | null>(null);

  const [toasts, setToasts] = useState<
    Array<{ id: string; type: ToastType; message: string }>
  >([]);

  const [modalActions, setModalActions] = useState<CompanyModalActions | null>(
    null
  );

  // Guarda el ID de la sesión que el servidor pre-calentó
  const [prewarmedSessionId, setPrewarmedSessionId] = useState<string | null>(
    null
  );

  // Estado para controlar el botón de Mostrar comparaciones
  const [showComparison, setShowComparison] = useState(false);

  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());

  // Maximo de sensibilizaciones permitidas, traído desde la configuración de Kapital en el backend
  const [maxSensibilizaciones, setMaxSensibilizaciones] = useState<number>(3);

  useEffect(
    () => () => {
      toastTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
      toastTimeoutsRef.current.clear();
    },
    []
  );

  useEffect(() => {
    if (!showResults) {
      setIsReportViewerOpen(false);
    }
  }, [showResults]);

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

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timeoutId = toastTimeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(id);
    }
  };

  /*const addToast = (type: ToastType, message: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    const timeoutId = window.setTimeout(() => removeToast(id), 3500);
    toastTimeoutsRef.current.set(id, timeoutId);
  };*/

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

  const handleReportViewerOpen = () => {
    setIsReportViewerOpen(true);
    setIsReportSidebarOpen(false);
  };

  const handleCloseModal = useCallback(() => {
    setModalData(null);
    setModalActions(null);
  }, []);

  const handleRemoveTicker = useCallback(
    (ticker: string) => {
      modalActions?.onRemoveTicker(ticker);
      setModalData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          valid_companies: prev.valid_companies.filter(
            (company) => company.ticker !== ticker
          ),
        };
      });
    },
    [modalActions]
  );

  const handleLogout = async () => {
    await logout();
    addToast("Has cerrado sesión exitosamente.", "success");
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

  // --- INTEGRACIÓN DE HOOKS ---

  const form = useKapitalForm();

  const applyCompanyToForm = useCallback(
    (company: CompanyData) => {
      if (company.beta_unlevered == null) return;

      const formattedBeta = Number(company.beta_unlevered).toFixed(2);
      form.setFormData((prev) => ({
        ...prev,
        beta_unlevered: formattedBeta,
      }));
    },
    [form.setFormData]
  );

  const handleApplyCompany = useCallback(
    (company: CompanyData) => {
      modalActions?.onApplyCompany(company);
      applyCompanyToForm(company);
      handleCloseModal();
    },
    [applyCompanyToForm, handleCloseModal, modalActions]
  );

  const calc = useKapitalCalculation({
    formData: form.formData,
    setFormData: form.setFormData,
    prewarmedSessionId,
    setPrewarmedSessionId,
    addToast,
    userId: user?.id,
    ui: {
      setShowResults,
      setIsFormOpen,
      setResultsSection,
      setShowComparison,
    },
  });

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
    if (!calc.currentCalculation) {
      preWarmSession();
    }
  }, [calc.currentCalculation]);

  // Fetch inicial desde URL
  useEffect(() => {
    calc.loadFromUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar configuración global de Kapital
  useEffect(() => {
    MainService.getKapitalSettings().then((settings) => {
      if (settings && settings.max_sensibilizaciones !== undefined) {
        setMaxSensibilizaciones(settings.max_sensibilizaciones);
      }
    });
  }, []);

  const isProyectosRoute = location.pathname.includes("/proyectos");
  const shouldShowChatbot =
    !isReportViewerOpen &&
    calc.isWaccCalculated &&
    !isProyectosRoute &&
    calc.sensibilizaciones.length < maxSensibilizaciones;

  // La etiqueta de la moneda local siempre depende del país guardado
  const activeSavedCurrency = form.formData.country
    ? COUNTRY_LOCAL_CURRENCIES[form.formData.country] || "Moneda Local"
    : "Moneda Local";

  const handleSearchSectorBeta = async () => {
    const currentSector = form.formData.sector;
    if (!currentSector) return;

    // 1. Verificación de caché
    if (sectorCache.current[currentSector]) {
      setModalData(sectorCache.current[currentSector]);
      setModalActions({
        onApplyCompany: (company: CompanyData) => {
          if (company.beta_unlevered != null) {
            const formattedBeta = Number(company.beta_unlevered).toFixed(2);
            form.handleInputChange({
              target: { name: "beta_unlevered", value: formattedBeta },
            } as any);
            setModalData(null);
          }
        },
        onRemoveTicker: (tickerToRemove: string) => {
          setModalData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              valid_companies: prev.valid_companies.filter(
                (c) => c.ticker !== tickerToRemove
              ),
            };
          });
        },
      });
      return;
    }
    // 2. Control de límite de pedidos de beta por minuto
    const now = Date.now();
    // Filtra las peticiones que tienen más de 60000 ms (1 minuto) de antigüedad
    requestTimestamps.current = requestTimestamps.current.filter(
      (t) => now - t < 60000
    );

    if (requestTimestamps.current.length >= 3) {
      addToast(
        "Límite de 3 consultas por minuto alcanzado. Intente en unos segundos.",
        "warn"
      );
      return;
    }

    setIsSearchingBeta(true);
    try {
      requestTimestamps.current.push(now);

      const payload = {
        message: "Calcula mi beta",
        history: [],
        form_data: form.formData,
      };

      // Envía mensaje oculto al endpoint
      const data = await MainService.sendChatMessage(payload);

      if (data.tickers && data.tickers.length > 0) {
        const res = await MainService.analyzeCompanies(data.tickers);
        if (res.success && res.valid_companies?.length) {
          sectorCache.current[currentSector] = res;

          setModalData(res);
          setModalActions({
            onApplyCompany: (company: CompanyData) => {
              if (company.beta_unlevered != null) {
                const formattedBeta = Number(company.beta_unlevered).toFixed(2);
                form.handleInputChange({
                  target: { name: "beta_unlevered", value: formattedBeta },
                } as any);
                setModalData(null);
              }
            },
            onRemoveTicker: (tickerToRemove: string) => {
              setModalData((prev) => {
                if (!prev) return prev;
                return {
                  ...prev,
                  valid_companies: prev.valid_companies.filter(
                    (c) => c.ticker !== tickerToRemove
                  ),
                };
              });
            },
          });
        }
      }
    } catch (error) {
      console.error("Error al buscar beta:", error);
    } finally {
      setIsSearchingBeta(false);
    }
  };

  /* COMPONENTES REUTILIZABLES */

  const chatbotComponent =
    shouldShowChatbot &&
    calc.sensibilizaciones.length < maxSensibilizaciones ? (
      <Chatbot
        formData={form.formData}
        isWaccCalculated={calc.isWaccCalculated}
        isOpen={true}
        onOpenModal={(data, actions) => {
          setModalData(data);
          setModalActions(actions);
        }}
        betaInput={betaInput}
        setBetaInput={setBetaInput}
      />
    ) : null;

  const yahooPanelContent = modalData ? (
    <>
      <div className="flex justify-between items-center px-4 py-3 sm:px-5 sm:py-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <h3 className="font-bold text-gray-800 text-base sm:text-lg flex items-center gap-2">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-valora-primary" />
          Empresas Comparables
        </h3>
        <button
          type="button"
          onClick={handleCloseModal}
          className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
        <YahooResults
          data={modalData}
          isWaccCalculated={calc.isWaccCalculated || false}
          onApply={handleApplyCompany}
          onRemove={handleRemoveTicker}
        />
      </div>
    </>
  ) : null;

  const mainContent = showResults ? (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {isReportViewerOpen ? (
        <ReportViewer
          isOpen={isReportViewerOpen}
          onClose={() => setIsReportViewerOpen(false)}
          reportProductId={selectedReportProductId}
          calculationId={calc.currentCalculation?.id}
          isSessionFresh={calc.isSessionFresh}
          setIsSessionFresh={calc.setIsSessionFresh}
          prewarmedSessionId={prewarmedSessionId}
        />
      ) : (
        <KapitalResults
          section={resultsSection}
          results={calc.results}
          showCompanyCard={calc.showCompanyCard}
          resultCurrency={calc.resultCurrency}
          onResultCurrencyChange={calc.setResultCurrency}
          analysisDC={analysisDC}
          analysisKd={analysisKd}
          analysisCurrency={analysisCurrency}
          onAnalysisDCChange={setAnalysisDC}
          onAnalysisKdChange={setAnalysisKd}
          onAnalysisCurrencyChange={setAnalysisCurrency}
          onAnalysisSubmit={calc.handleAnalysisSubmit}
          loading={calc.isLoading}
          methodologyCategories={METHODOLOGY_CATEGORIES}
          showComparison={showComparison}
          onToggleComparison={setShowComparison}
          sensibilizaciones={calc.sensibilizaciones}
          onOpenReport={handleReportSidebarOpen}
          localCurrency={activeSavedCurrency}
          shouldShowChatbot={shouldShowChatbot}
          onToggleForm={() => setIsFormOpen((prev) => !prev)}
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
        hasResults={!!calc.results}
        logoHref="/kapital"
        logoSrc="/images/logo-kapital-small.png"
        logoAlt="Kapital Logo"
        projectsHref="/usuario/proyectos"
        onLoginClick={() => setIsLoginModalOpen(true)}
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
        onOpenReport={handleReportSidebarOpen}
        hasSensibilizaciones={calc.sensibilizaciones.length > 0}
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
        hasResults={!!calc.results}
      />

      <main
        className={`${showResults ? "pt-24 lg:pt-16" : "pt-12 lg:pt-16"} h-screen transition-all duration-300 ${isFormOpen ? "lg:pl-90" : "lg:pl-0"}`}
      >
        {mainContent}
      </main>

      <aside
        className={`fixed left-0 top-16 max-[540px]:z-70 z-40 h-[calc(100dvh-4rem)] flex border-r border-gray-200 bg-transparent shadow-sm transition-transform duration-200 ${isFormOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full w-full max-[540px]:w-screen sm:w-90 border-r border-gray-200 bg-white shadow-sm shrink-0">
          <FormSidebar
            formData={form.formData}
            onInputChange={form.handleInputChange}
            onSubmit={(e) => calc.handleSubmit(e, form.formData.beta_unlevered)}
            loading={calc.isLoading}
            isWaccCalculated={calc.isWaccCalculated}
            dates={form.dynamicDates.length > 0 ? form.dynamicDates : []}
            sectors={form.dynamicSectors.length > 0 ? form.dynamicSectors : []}
            hasSensibilizaciones={calc.sensibilizaciones.length > 0}
            canSensibilizeBeta={
              calc.sensibilizaciones.length < maxSensibilizaciones
            }
            industryTranslations={INDUSTRY_TRANSLATIONS}
            instruments={INSTRUMENTS}
            bonos={BONOS}
            bonosTranslations={BONOS_TRANSLATIONS}
            countries={COUNTRIES}
            countriesTranslations={COUNTRIES_TRANSLATIONS}
            countryLocalCurrencies={COUNTRY_LOCAL_CURRENCIES}
            chatbotComponent={chatbotComponent}
            onSearchSectorBeta={handleSearchSectorBeta}
            isSearchingBeta={isSearchingBeta}
          />
        </div>
        {modalData && (
          <div className="hidden lg:flex w-125 xl:w-162.5 h-3/5  bg-white border-r border-gray-200 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.1)] flex-col shrink-0 animate-in slide-in-from-left-8 duration-300">
            {yahooPanelContent}
          </div>
        )}
      </aside>

      <ReportSidebar
        isOpen={isReportSidebarOpen}
        onClose={() => setIsReportSidebarOpen(false)}
        reportProducts={REPORT_PRODUCTS}
        selectedReportProductId={selectedReportProductId}
        onSelectReportProduct={setSelectedReportProductId}
        onOpenReportViewer={handleReportViewerOpen}
      />

      {/* Modal Flotante de Empresas (SOLO MÓVIL/TABLET: < lg) */}
      {modalData && (
        <div className="fixed inset-0 z-120 flex lg:hidden items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-all animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-[90dvw] max-w-2xl h-[80dvh] sm:max-h-[85dvh] overflow-hidden flex flex-col animate-in zoom-in-95 justify-between">
            {yahooPanelContent}
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={removeToast} />
      {calc.isLoading && <LoadingOverlay />}
    </div>
  );
};

export default KapitalPage;
