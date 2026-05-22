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
import "./KapitalPage.css";
import { useLocation } from "react-router-dom";
import { LoginModal } from "@/features/auth/components/LoginModal";

import { useKapitalCalculation } from "./hooks/useKapitalCalculation";
import { useKapitalForm } from "./hooks/useKapitalForm";

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
  const location = useLocation();

  // Estadps de UI
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

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
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: ToastType; message: string }>
  >([]);

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

  const addToast = (type: ToastType, message: string) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    const timeoutId = window.setTimeout(() => removeToast(id), 3500);
    toastTimeoutsRef.current.set(id, timeoutId);
  };

  useEffect(() => {
    setIsChatbotOpen(false);
  }, [resultsSection]);

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

  // --- INTEGRACIÓN DE HOOKS ---

  const form = useKapitalForm();

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
      setIsChatbotOpen,
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
    !isReportViewerOpen && calc.isWaccCalculated && !isProyectosRoute;

  // La etiqueta de la moneda local siempre depende del país guardado
  const activeSavedCurrency = form.formData.country
    ? COUNTRY_LOCAL_CURRENCIES[form.formData.country] || "Moneda Local"
    : "Moneda Local";

  const chatbotComponent =
    shouldShowChatbot &&
    calc.sensibilizaciones.length < maxSensibilizaciones ? (
      <Chatbot
        formData={form.formData}
        isWaccCalculated={calc.isWaccCalculated}
        isOpen={isChatbotOpen}
        setIsOpen={setIsChatbotOpen}
        onCalculateWacc={(beta: string) => calc.handleSubmit(undefined, beta)}
      />
    ) : null;

  const mainContent = showResults ? (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {isReportViewerOpen ? (
        <ReportViewer
          isOpen={isReportViewerOpen}
          onClose={() => setIsReportViewerOpen(false)}
          reportProductId={selectedReportProductId}
          calculationId={calc.currentCalculation?.id}
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
        className={`fixed left-0 top-16 max-[540px]:z-70 z-40 h-[calc(100dvh-4rem)] max-[540px]:w-full w-90 border-r border-gray-200 bg-white shadow-sm transition-transform duration-200 ${isFormOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full">
          <FormSidebar
            formData={form.formData}
            onInputChange={form.handleInputChange}
            onSubmit={calc.handleSubmit}
            loading={calc.isLoading}
            isWaccCalculated={calc.isWaccCalculated}
            dates={form.dynamicDates.length > 0 ? form.dynamicDates : []}
            sectors={form.dynamicSectors.length > 0 ? form.dynamicSectors : []}
            hasSensibilizaciones={calc.sensibilizaciones.length > 0}
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
            if (val && !isFormOpen) {
              setIsFormOpen(true);
            }
          }}
          onCalculateWacc={(beta: string) => handleSubmit(undefined, beta)}
        />
      )*/}

      <ToastStack toasts={toasts} onDismiss={removeToast} />
      {calc.isLoading && <LoadingOverlay />}
    </div>
  );
};

export default KapitalPage;
