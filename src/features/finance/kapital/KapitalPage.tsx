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
import { useKapitalSession } from "./hooks/useKapitalSession";
import { useKapitalData } from "./hooks/useKapitalData";
import { useSubsectorModal } from "./hooks/useSubsectorModal";
import { useToast } from "@/shared/components/common/ToastProvider";
import {
    type YahooFinanceData,
    type CompanyModalActions,
} from "../components/Chatbot/chatbot.interfaces";

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
import { useAnalytics } from "@/features/analytics/hooks/useAnalytics";
import { ReportViewer } from "./components/ReportViewer";
import { SubsectorModal } from "./components/SubsectorModal";
import { OccupationOnboardingModal } from "../components/OccupationOnboardingModal";
import { KapitalOnboardingWalkthrough } from "./components/KapitalOnboardingWalkthrough";

const KAPITAL_STARTED_SESSION_KEY = "analytics_kapital_calculator_started";

const normalizeScope = (value?: string | null) =>
    (value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

const inferRateScope = (instrument?: string | null): "bonos" | "ajustado" => {
    const normalizedInstrument = normalizeScope(instrument);
    return normalizedInstrument.includes("ajust") ? "ajustado" : "bonos";
};

const hasRecognizedSectorScope = (value: string) =>
    ["empresa", "company", "sector", "sectorial"].some((token) => value.includes(token));

const hasRecognizedRateScope = (value: string) =>
    ["bono", "bonos", "eeuu", "ee.uu", "tesoro", "ajust"].some((token) => value.includes(token));

const hasValue = (value: unknown) => String(value ?? "").trim() !== "";

const KapitalPage: React.FC = () => {
    const { user, login, logout } = useAuthContext();
    const { addToast } = useToast();
    const location = useLocation();
    const { trackEvent } = useAnalytics();

    // --- UI State ---
    const [isFormOpen, setIsFormOpen] = useState(true);
    const [startSensitivityTour, setStartSensitivityTour] = useState(false);
    const [resultsSection, setResultsSection] = useState<"result" | "sensitivity">("result");
    const [showResults, setShowResults] = useState(false);
    const [isReportSidebarOpen, setIsReportSidebarOpen] = useState(false);
    const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [selectedReportProductId, setSelectedReportProductId] = useState("");
    const [betaInput, setBetaInput] = useState("");
    const isSearchingBeta = false;
    const [modalData, setModalData] = useState<YahooFinanceData | null>(null);
    const [, setModalActions] = useState<CompanyModalActions | null>(null);
    const [showComparison, setShowComparison] = useState(false);
    const [maxSensibilizaciones, setMaxSensibilizaciones] = useState<number>(3);
    const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string }>>([]);

    const toastTimeoutsRef = useRef<Map<string, number>>(new Map());

    // --- Custom Hooks ---
    const subsectorTickersRef = useRef<Record<string, string[]>>({});
    const subsectorSensibilizacionTickersRef = useRef<Record<string, string[]>>({});

    const form = useKapitalForm();
    const session = useKapitalSession();
    const handleTrackedInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            if (!sessionStorage.getItem(KAPITAL_STARTED_SESSION_KEY)) {
                sessionStorage.setItem(KAPITAL_STARTED_SESSION_KEY, "true");
                void trackEvent("kapital_calculator_started", {
                    product: "kapital",
                });
            }
            form.handleInputChange(e);
        },
        [form.handleInputChange, trackEvent]
    );
    const data = useKapitalData(
        form.formData.sector,
        subsectorTickersRef,
        subsectorSensibilizacionTickersRef
    );

    const calc = useKapitalCalculation({
        formData: form.formData,
        setFormData: form.setFormData,
        prewarmedSessionId: session.prewarmedSessionId,
        setPrewarmedSessionId: session.setPrewarmedSessionId,
        addToast,
        trackEvent,
        userId: user?.id,
        ui: { setShowResults, setIsFormOpen, setResultsSection, setShowComparison },
    });

    const modal = useSubsectorModal({
        isWaccCalculated: calc.isWaccCalculated,
        handleInputChange: form.handleInputChange,
        subsectorTickersRef: subsectorTickersRef,
        subsectorSensibilizacionTickersRef: subsectorSensibilizacionTickersRef,
    });

    // --- Effects ---

    // Cleanup toast timeouts
    useEffect(() => {
        return () => {
            toastTimeoutsRef.current.forEach((id) => window.clearTimeout(id));
            toastTimeoutsRef.current.clear();
        };
    }, []);

    // Close report viewer when results hidden
    useEffect(() => {
        if (!showResults) setIsReportViewerOpen(false);
    }, [showResults]);

    // Body overflow lock on mobile
    useEffect(() => {
        const isMobile = window.innerWidth <= 540;
        document.body.style.overflow = isFormOpen && isMobile ? "hidden" : "unset";
        return () => { document.body.style.overflow = "unset"; };
    }, [isFormOpen]);

    // Pre-warm session
    useEffect(() => {
        if (!calc.currentCalculation) session.prewarmSession();
    }, [calc.currentCalculation]);

    // Load from URL
    useEffect(() => { calc.loadFromUrl(); }, []);

    // Load Kapital settings
    useEffect(() => {
        MainService.getKapitalSettings().then((settings) => {
            if (settings?.max_sensibilizaciones !== undefined) {
                setMaxSensibilizaciones(settings.max_sensibilizaciones);
            }
        });
    }, []);

    // Sync restored tickers from URL to refs
    useEffect(() => {
        data.syncTickersFromUrl("tickers_subsector", "subsector", form.formData.tickers_subsector || "", form.formData.subsector);
    }, [form.formData.tickers_subsector, form.formData.subsector]);

    useEffect(() => {
        data.syncTickersFromUrl("tickers_subsector_sensibilizacion", "subsector_sensibilizacion", form.formData.tickers_subsector_sensibilizacion || "", form.formData.subsector_sensibilizacion);
    }, [form.formData.tickers_subsector_sensibilizacion, form.formData.subsector_sensibilizacion]);

    // --- Handlers ---

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        const timeoutId = toastTimeoutsRef.current.get(id);
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            toastTimeoutsRef.current.delete(id);
        }
    }, []);

    const handleResultsSectionChange = useCallback((nextSection: "result" | "sensitivity") => {
        if (isReportViewerOpen) setIsReportViewerOpen(false);
        if (isReportSidebarOpen) setIsReportSidebarOpen(false);
        setResultsSection(nextSection);
    }, [isReportViewerOpen, isReportSidebarOpen]);

    const handleReportSidebarOpen = useCallback(() => {
        setIsReportSidebarOpen(true);
        if (isFormOpen) setIsFormOpen(false);
    }, [isFormOpen]);

    const handleReportViewerOpen = useCallback(() => {
        if (!selectedReportProductId) return;
        setIsReportViewerOpen(true);
        setIsReportSidebarOpen(false);
    }, [selectedReportProductId]);

    const handleLogout = useCallback(async () => {
        await logout();
        addToast("Has cerrado sesión exitosamente.", "success");
    }, [logout, addToast]);

    const getSelectedView = useCallback((): "result" | "sensitivity" | "" => {
        if (!showResults || isReportViewerOpen) return "";
        return resultsSection;
    }, [showResults, isReportViewerOpen, resultsSection]);

    // --- Derived ---

    const isProyectosRoute = location.pathname.includes("/proyectos");
    const shouldShowChatbot =
        !isReportViewerOpen &&
        calc.isWaccCalculated &&
        !isProyectosRoute &&
        calc.sensibilizaciones.length < maxSensibilizaciones;

    const activeSavedCurrency = form.formData.country
        ? COUNTRY_LOCAL_CURRENCIES[form.formData.country] || "Moneda Local"
        : "Moneda Local";

    const hasCompanyInputs = Boolean(
        hasValue(form.formData.kd) &&
        hasValue(form.formData.debt) &&
        hasValue(form.formData.capital)
    );
    const reportScope: "empresa" | "sectorial" = hasCompanyInputs ? "empresa" : "sectorial";
    const rateScope = inferRateScope(form.formData.instrument);

    useEffect(() => {
        if (!showResults) {
            setSelectedReportProductId("");
            return;
        }

        let ignore = false;
        const loadMatchingReports = async () => {
            try {
                const reports = await MainService.getReports({
                    type: "kapital",
                    activo: true,
                });
                const matching = reports.filter((report) => {
                    const reportSectorScope = normalizeScope(report.sector_empresa);
                    const reportRateScope = normalizeScope(report.bono_ajustado);
                    const sectorOk =
                        !reportSectorScope ||
                        !hasRecognizedSectorScope(reportSectorScope) ||
                        reportSectorScope.includes(reportScope) ||
                        (reportScope === "empresa" && reportSectorScope.includes("company")) ||
                        (reportScope === "sectorial" && reportSectorScope.includes("sector"));
                    const rateOk =
                        !reportRateScope ||
                        !hasRecognizedRateScope(reportRateScope) ||
                        reportRateScope.includes(rateScope) ||
                        (rateScope === "bonos" && reportRateScope.includes("bono")) ||
                        (rateScope === "bonos" && reportRateScope.includes("eeuu")) ||
                        (rateScope === "bonos" && reportRateScope.includes("ee.uu")) ||
                        (rateScope === "bonos" && reportRateScope.includes("tesoro")) ||
                        (rateScope === "ajustado" && reportRateScope.includes("ajust"));
                    return sectorOk && rateOk;
                });

                if (ignore) return;
                setSelectedReportProductId((current) => {
                    if (matching.some((report) => report.id.toString() === current)) {
                        return current;
                    }
                    return matching[0]?.id.toString() || "";
                });
                if (matching.length === 0) {
                    setIsReportSidebarOpen(false);
                    setIsReportViewerOpen(false);
                }
            } catch {
                if (!ignore) {
                    setSelectedReportProductId("");
                }
            }
        };

        loadMatchingReports();
        return () => {
            ignore = true;
        };
    }, [showResults, reportScope, rateScope]);

    const chatbotComponent = shouldShowChatbot ? (
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

    // --- Main Content ---

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
                    prewarmedSessionId={session.prewarmedSessionId}
                />
            ) : (
                <KapitalResults
                    section={resultsSection}
                    results={calc.results}
                    selectedSector={
                        form.formData.sector
                            ? (INDUSTRY_TRANSLATIONS[form.formData.sector] || form.formData.sector)
                            : null
                    }
                    selectedSubsector={modal.selectedSubsector || form.formData.subsector || null}
                    showCompanyCard={calc.showCompanyCard}
                    resultCurrency={calc.resultCurrency}
                    onResultCurrencyChange={calc.setResultCurrency}
                    emergentCurrency={calc.emergentCurrency}
                    onEmergentCurrencyChange={calc.setEmergentCurrency}
                    loading={calc.isLoading}
                    methodologyCategories={METHODOLOGY_CATEGORIES}
                    showComparison={showComparison}
                    onToggleComparison={setShowComparison}
                    sensibilizaciones={calc.sensibilizaciones}
                    onOpenReport={handleReportSidebarOpen}
                    localCurrency={activeSavedCurrency}
                    shouldShowChatbot={shouldShowChatbot}
                    onToggleForm={() => setIsFormOpen((prev) => !prev)}
                    onStartSensitivityTour={() => setStartSensitivityTour(true)}
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
            <OccupationOnboardingModal />
            <KapitalOnboardingWalkthrough
                isFormOpen={isFormOpen}
                setIsFormOpen={setIsFormOpen}
                showResults={showResults}
                startSensitivityTour={startSensitivityTour}
            />
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
                onSwitchToRegister={() => setIsLoginModalOpen(false)}
            />

            <NavigationTabs
                selected={getSelectedView()}
                onNavigate={handleResultsSectionChange}
                onOpenReport={handleReportSidebarOpen}
                hasResults={!!calc.results}
                hasSensibilizaciones={calc.sensibilizaciones.length > 0}
            />

            <main
                className={`${showResults ? "pt-24 lg:pt-16" : "pt-12 lg:pt-16"} h-screen transition-all duration-300 ${isFormOpen ? "lg:pl-90" : "lg:pl-0"}`}
            >
                {mainContent}
            </main>

            <aside
                className={`fixed left-0 top-16 max-[540px]:z-70 z-40 h-[calc(100dvh-4rem)] flex bg-transparent transition-transform duration-200 ${isFormOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <div className="h-full w-full max-[540px]:w-screen sm:w-90 border-r border-gray-200 bg-white shadow-sm shrink-0">
                    <FormSidebar
                        formData={form.formData}
                        onInputChange={handleTrackedInputChange}
                        onSubmit={(e) => calc.handleSubmit(e, form.formData.beta_unlevered)}
                        loading={calc.isLoading}
                        isWaccCalculated={calc.isWaccCalculated}
                        dates={form.dynamicDates.length > 0 ? form.dynamicDates : []}
                        sectors={form.dynamicSectors.length > 0 ? form.dynamicSectors : []}
                        hasSensibilizaciones={calc.sensibilizaciones.length > 0}
                        canSensibilizeBeta={calc.sensibilizaciones.length < maxSensibilizaciones}
                        industryTranslations={INDUSTRY_TRANSLATIONS}
                        instruments={INSTRUMENTS}
                        bonos={BONOS}
                        bonosTranslations={BONOS_TRANSLATIONS}
                        countries={COUNTRIES}
                        countriesTranslations={COUNTRIES_TRANSLATIONS}
                        countryLocalCurrencies={COUNTRY_LOCAL_CURRENCIES}
                        chatbotComponent={chatbotComponent}
                        onSearchSectorBeta={modal.openSubsectorModal}
                        isSearchingBeta={isSearchingBeta}
                    />
                </div>
                {modal.subsectorModalOpen && (
                    <div className="hidden lg:flex w-96 xl:w-125 h-[calc(100dvh-16rem)] max-h-[calc(100dvh-16rem)] bg-white border border-gray-200/80 rounded-xl flex-col shrink-0 animate-in slide-in-from-left-8 duration-300 ml-4 overflow-hidden self-start mt-4">
                        <SubsectorModal
                            subsectorDetail={modal.subsectorDetail}
                            detailTickers={modal.detailTickers}
                            inactiveTickers={modal.inactiveTickers}
                            subsectorModalMode={modal.subsectorModalMode}
                            isWaccCalculated={calc.isWaccCalculated}
                            formDataSubsector={form.formData.subsector}
                            formDataSubsectorSensibilizacion={form.formData.subsector_sensibilizacion}
                            selectedSubsector={modal.selectedSubsector}
                            filteredSubsectores={data.filteredSubsectores}
                            subsectoresFecha={data.subsectoresFecha}
                            detailBoa={modal.detailBoa}
                            onSetSubsectorDetail={modal.setSubsectorDetail}
                            onCloseModal={modal.handleCloseModal}
                            onOpenDetail={modal.handleOpenDetail}
                            onToggleTicker={modal.handleToggleTicker}
                            onCalculateDetail={modal.handleCalculateDetail}
                            onSetSubsectorModalMode={modal.setSubsectorModalMode}
                            subsectorTickersRef={subsectorTickersRef}
                            subsectorSensibilizacionTickersRef={subsectorSensibilizacionTickersRef}
                        />
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
                reportScope={reportScope}
                rateScope={rateScope}
            />

            {/* Mobile/Tablet Modal */}
            {modal.subsectorModalOpen && (
                <div className="fixed inset-0 z-120 flex lg:hidden items-start justify-center overflow-y-auto bg-gray-900/40 backdrop-blur-sm transition-all animate-in fade-in p-2 sm:p-4">
                    <div className={`bg-white rounded-xl shadow-2xl w-[96dvw] max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 justify-between ${modalData ? "h-[calc(100dvh-1rem)] sm:h-[85dvh]" : "h-auto"}`}>
                        <SubsectorModal
                            subsectorDetail={modal.subsectorDetail}
                            detailTickers={modal.detailTickers}
                            inactiveTickers={modal.inactiveTickers}
                            subsectorModalMode={modal.subsectorModalMode}
                            isWaccCalculated={calc.isWaccCalculated}
                            formDataSubsector={form.formData.subsector}
                            formDataSubsectorSensibilizacion={form.formData.subsector_sensibilizacion}
                            selectedSubsector={modal.selectedSubsector}
                            filteredSubsectores={data.filteredSubsectores}
                            subsectoresFecha={data.subsectoresFecha}
                            detailBoa={modal.detailBoa}
                            onSetSubsectorDetail={modal.setSubsectorDetail}
                            onCloseModal={modal.handleCloseModal}
                            onOpenDetail={modal.handleOpenDetail}
                            onToggleTicker={modal.handleToggleTicker}
                            onCalculateDetail={modal.handleCalculateDetail}
                            onSetSubsectorModalMode={modal.setSubsectorModalMode}
                            subsectorTickersRef={subsectorTickersRef}
                            subsectorSensibilizacionTickersRef={subsectorSensibilizacionTickersRef}
                        />
                    </div>
                </div>
            )}

            <ToastStack toasts={toasts} onDismiss={removeToast} />
            {calc.isLoading && <LoadingOverlay />}
        </div>
    );
};

export default KapitalPage;
