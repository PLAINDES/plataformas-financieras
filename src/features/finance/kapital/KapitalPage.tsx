import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

export interface FormData {
    date: string;
    sector: string;
    subsector?: string;
    tickers_subsector?: string;
    subsector_sensibilizacion?: string;
    tickers_subsector_sensibilizacion?: string;
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
    beta_unlevered_custom?: string;
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
    boa_custom?: number;
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
    subsector?: string;
    tickers?: string;
}

const KapitalPage: React.FC = () => {
    const { user, login, logout } = useAuthContext();
    const { addToast } = useToast();
    const location = useLocation();

    const [subsectoresData, setSubsectoresData] = useState<any[]>([]);
    const [subsectoresFecha, setSubsectoresFecha] = useState<string | null>(null);

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
    const isSearchingBeta = false;
    const [modalData, setModalData] = useState<YahooFinanceData | null>(null);
    const [subsectorModalOpen, setSubsectorModalOpen] = useState(false);
    const [subsectorModalMode, setSubsectorModalMode] = useState<"principal" | "sensibilizacion">("principal");
    const [selectedSubsector, setSelectedSubsector] = useState<string | null>(
        null
    );
    const [subsectorDetail, setSubsectorDetail] = useState<any>(null);
    const [detailTickers, setDetailTickers] = useState<string[]>([]);
    const [inactiveTickers, setInactiveTickers] = useState<string[]>([]);
    const subsectorTickersRef = useRef<Record<string, string[]>>({});
    const subsectorSensibilizacionTickersRef = useRef<Record<string, string[]>>({});

    const [toasts, setToasts] = useState<
        Array<{ id: string; type: ToastType; message: string }>
    >([]);

    const [, setModalActions] = useState<CompanyModalActions | null>(
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
        setSubsectorModalOpen(false);
        setSubsectorDetail(null);
    }, []);

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

    // Cargar subsectores
    useEffect(() => {
        const fetchSubsectores = async () => {
            try {
                const data = await MainService.getTemplateComplements("subsectores");
                const match = data.find((c: any) => c.nombre === "subsectores");
                const items = match && Array.isArray(match.data) ? match.data : [];
                setSubsectoresData(items);
                if (match?.fecha) {
                    setSubsectoresFecha(match.fecha);
                }
            } catch (error) {
                console.error("Error fetching subsectores data", error);
            }
        };
        fetchSubsectores();
    }, []);

    // Sincronizar tickers_subsector restaurados desde URL al ref del modal
    useEffect(() => {
        if (form.formData.tickers_subsector && form.formData.subsector) {
            try {
                const parsed = JSON.parse(form.formData.tickers_subsector);
                if (Array.isArray(parsed)) {
                    subsectorTickersRef.current[form.formData.subsector] = parsed;
                }
            } catch { /* ignora parseo inválido */ }
        }
    }, [form.formData.tickers_subsector, form.formData.subsector]);

    useEffect(() => {
        if (form.formData.tickers_subsector_sensibilizacion && form.formData.subsector_sensibilizacion) {
            try {
                const parsed = JSON.parse(form.formData.tickers_subsector_sensibilizacion);
                if (Array.isArray(parsed)) {
                    subsectorSensibilizacionTickersRef.current[form.formData.subsector_sensibilizacion] = parsed;
                }
            } catch { /* ignora parseo inválido */ }
        }
    }, [form.formData.tickers_subsector_sensibilizacion, form.formData.subsector_sensibilizacion]);

    const filteredSubsectores = useMemo(() => {
        if (!form.formData.sector) return [];
        return subsectoresData.filter((d: any) => d.sector === form.formData.sector);
    }, [subsectoresData, form.formData.sector]);

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

    const handleSearchSectorBeta = () => {
        if (!form.formData.sector) return;
        setSubsectorModalMode(
            calc.isWaccCalculated ? "sensibilizacion" : "principal"
        );
        setSubsectorModalOpen(true);
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

    const handleOpenDetail = useCallback((sub: any, allTickers: string[], savedTickers?: string[]) => {
        setSubsectorDetail(sub);
        setDetailTickers(allTickers);
        if (savedTickers) {
            const savedSet = new Set(savedTickers);
            setInactiveTickers(allTickers.filter((t) => !savedSet.has(t)));
        } else {
            setInactiveTickers([]);
        }
    }, []);

    const handleToggleTicker = useCallback((ticker: string) => {
        setInactiveTickers((prev) =>
            prev.includes(ticker)
                ? prev.filter((t) => t !== ticker)
                : [...prev, ticker]
        );
    }, []);

    const handleCalculateDetail = useCallback(() => {
        if (!subsectorDetail) return;
        const activeTickers = detailTickers.filter((t) => !inactiveTickers.includes(t));
        const boas: number[] = activeTickers.map(
            (emp) => Number(subsectorDetail.empresas_boa[emp])
        );
        if (boas.length === 0) return;
        const avgBoa = boas.reduce((sum, v) => sum + v, 0) / boas.length;
        const betaStr = avgBoa.toFixed(2);

        const isSens = subsectorModalMode === "sensibilizacion";
        const subsectorKey = isSens ? "subsector_sensibilizacion" : "subsector";
        const tickersKey = isSens ? "tickers_subsector_sensibilizacion" : "tickers_subsector";
        const ref = isSens ? subsectorSensibilizacionTickersRef : subsectorTickersRef;

        ref.current[subsectorDetail.subsector] = activeTickers;
        if (!isSens) {
            setSelectedSubsector(subsectorDetail.subsector || null);
        }

        if (isSens) {
            form.handleInputChange({
                target: { name: "beta_unlevered", value: betaStr },
            } as any);
        } else {
            form.handleInputChange({
                target: { name: "beta_unlevered_custom", value: betaStr },
            } as any);
            if (!calc.isWaccCalculated) {
                form.handleInputChange({
                    target: { name: "beta_unlevered_industry", value: betaStr },
                } as any);
            }
        }
        form.handleInputChange({
            target: { name: subsectorKey, value: subsectorDetail.subsector || "" },
        } as any);
        form.handleInputChange({
            target: { name: tickersKey, value: JSON.stringify(activeTickers) },
        } as any);
        setSubsectorDetail(null);
        setSubsectorModalOpen(false);
    }, [subsectorDetail, detailTickers, inactiveTickers, form, calc.isWaccCalculated, subsectorModalMode]);

    const detailBoa = useMemo(() => {
        const activeTickers = detailTickers.filter((t) => !inactiveTickers.includes(t));
        if (activeTickers.length === 0 || !subsectorDetail) return null;
        const boas: number[] = activeTickers.map(
            (emp) => Number(subsectorDetail.empresas_boa[emp])
        );
        return boas.reduce((sum, v) => sum + v, 0) / boas.length;
    }, [detailTickers, inactiveTickers, subsectorDetail]);

    const yahooPanelContent = subsectorModalOpen ? (
        <>
            {subsectorDetail ? (
                <>
                    {/* Header del detalle */}
                    <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 border-b border-gray-100 bg-gray-50/60 shrink-0">
                        <button
                            type="button"
                            onClick={() => setSubsectorDetail(null)}
                            className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-full transition-colors cursor-pointer shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 shadow-xs shrink-0">
                                <Bot className="w-3.5 h-3.5 text-valora-primary" />
                            </div>
                            <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-slate-700 truncate">
                                {subsectorDetail.subsector || "Subsector"}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="ml-auto p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Cuerpo del detalle */}
                    <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto min-h-0 bg-slate-50/40">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                    Empresas ({detailTickers.length - inactiveTickers.length} activas / {detailTickers.length})
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {detailTickers.length > 0 ? (
                                    [...detailTickers].sort().map((emp: string, i: number) => {
                                        const boa = subsectorDetail.empresas_boa[emp];
                                        const isInactive = inactiveTickers.includes(emp);
                                        return (
                                            <div key={i} className={`flex items-center justify-between px-4 py-2.5 transition-colors ${isInactive ? "opacity-40 hover:opacity-60" : "hover:bg-gray-50/50"}`}>
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className={`text-xs font-bold min-w-[60px] ${isInactive ? "text-gray-400 line-through" : "text-blue-600"}`}>{emp}</span>
                                                    <span className={`text-xs font-mono font-bold ${isInactive ? "text-gray-400" : "text-gray-800"}`}>
                                                        {boa !== undefined ? boa.toFixed(4) : "N/A"}
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleTicker(emp)}
                                                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                                        isInactive
                                                            ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                                            : "text-red-400 hover:bg-red-50 hover:text-red-600"
                                                    }`}
                                                    title={isInactive ? "Incluir empresa" : "Excluir empresa"}
                                                >
                                                    {isInactive ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-8 text-center">
                                        <span className="text-xs text-gray-400">No hay empresas disponibles</span>
                                    </div>
                                )}
                                {detailBoa !== null && (
                                    <div className="flex items-center justify-between px-4 py-2.5 bg-valora-primary/5 border-t border-valora-primary/10">
                                        <span className="text-[10px] font-bold text-blue-700 uppercase">BOA Promedio</span>
                                        <span className="text-lg font-black text-valora-primary leading-none">{detailBoa.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {detailTickers.length > 0 && detailBoa !== null && (
                            <div className="mt-auto pt-4">
                                <button
                                    type="button"
                                    onClick={handleCalculateDetail}
                                    className="w-full py-3 px-6 rounded-lg font-bold text-xs sm:text-sm text-white bg-valora-primary hover:bg-valora-secondary transition-all cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.98]"
                                >
                                    Calcular con {detailTickers.length - inactiveTickers.length} empresa{(detailTickers.length - inactiveTickers.length) !== 1 ? "s" : ""} — BOA {detailBoa.toFixed(2)}
                                </button>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Header con tabs */}
                    <div className="flex flex-col shrink-0">
                        <div className="flex justify-between items-center px-3 py-2 sm:px-4 sm:py-2.5 border-b border-gray-100 bg-gray-50/60">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 shadow-xs">
                                    <Bot className="w-3.5 h-3.5 text-valora-primary" />
                                </div>
                                <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-slate-700">
                                    Subsectores
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex border-b border-gray-200 bg-white">
                            {(!calc.isWaccCalculated || form.formData.subsector) && (
                                <button
                                    type="button"
                                    onClick={() => setSubsectorModalMode("principal")}
                                    className={`flex-1 px-3 py-2 text-xs font-semibold tracking-tight text-center transition-colors cursor-pointer ${
                                        subsectorModalMode === "principal"
                                            ? "text-valora-primary border-b-2 border-valora-primary"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-1.5">
                                        {calc.isWaccCalculated && form.formData.subsector && (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        )}
                                        Principal
                                    </div>
                                </button>
                            )}
                            {calc.isWaccCalculated && (
                                <button
                                    type="button"
                                    onClick={() => setSubsectorModalMode("sensibilizacion")}
                                    className={`flex-1 px-3 py-2 text-xs font-semibold tracking-tight text-center transition-colors cursor-pointer ${
                                        subsectorModalMode === "sensibilizacion"
                                            ? "text-valora-primary border-b-2 border-valora-primary"
                                            : "text-gray-500 hover:text-gray-700"
                                    }`}
                                >
                                    Sensibilización
                                </button>
                            )}
                        </div>
                    </div>
                    {subsectorModalMode === "principal" && calc.isWaccCalculated && form.formData.subsector ? (
                        /* Principal bloqueado: mostrar info del subsector seleccionado */
                        (() => {
                            const sub = filteredSubsectores.find(
                                (s: any) => s.subsector === form.formData.subsector
                            );
                            const savedTickers = subsectorTickersRef.current[form.formData.subsector] || [];
                            const boas: number[] = savedTickers
                                .map((emp: string) => Number(sub?.empresas_boa?.[emp]))
                                .filter((v: number) => !isNaN(v));
                            const avgBoa = boas.length > 0
                                ? (boas.reduce((sum: number, v: number) => sum + v, 0) / boas.length).toFixed(2)
                                : null;

                            return (
                                <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto min-h-0 bg-slate-50/40">
                                    <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm py-12">
                                        <div className="w-12 h-12 rounded-full bg-valora-primary/10 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-valora-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <div className="text-center px-6">
                                            <h3 className="text-sm font-bold text-gray-900 mb-1">
                                                {form.formData.subsector}
                                            </h3>
                                            {savedTickers.length > 0 && (
                                                <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-600">
                                                    <span>{savedTickers.length} empresa{savedTickers.length !== 1 ? "s" : ""}</span>
                                                    {avgBoa && (
                                                        <>
                                                            <span className="text-gray-300">|</span>
                                                            <span className="font-bold text-valora-primary">BOA {avgBoa}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                            <p className="text-[11px] text-gray-500 mt-3">
                                                Subsector principal bloqueado. Usa la pestaña "Sensibilización" para probar otros valores.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()
                    ) : (
                        <>
                            <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto gap-3 min-h-0 bg-slate-50/40">
                                {filteredSubsectores.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-gray-500">
                                        No hay subsectores disponibles para esta industria.
                                    </span>
                                </div>
                            ) : (
                                filteredSubsectores.map((sub: any, idx: number) => {
                                    const isPrincipal = subsectorModalMode === "sensibilizacion" && sub.subsector === form.formData.subsector;
                                    const allTickersConBoa = Array.isArray(sub.empresas)
                                        ? sub.empresas.filter((emp: string) => sub.empresas_boa?.[emp] !== undefined)
                                        : [];
                                    const isSens = subsectorModalMode === "sensibilizacion";
                                    const selectedRef = isSens
                                        ? (form.formData.subsector_sensibilizacion || "")
                                        : (selectedSubsector || form.formData.subsector || "");
                                    const isSelected = sub.subsector === selectedRef;
                                    const savedTickers = isSens
                                        ? subsectorSensibilizacionTickersRef.current[sub.subsector]
                                        : subsectorTickersRef.current[sub.subsector];
                                    const tickersParaBoa = savedTickers || allTickersConBoa;
                                    const boas: number[] = tickersParaBoa.map(
                                        (emp: string) => Number(sub.empresas_boa[emp])
                                    );
                                    const avgBoa = boas.length > 0
                                        ? boas.reduce((sum, v) => sum + v, 0) / boas.length
                                        : null;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => !isPrincipal && handleOpenDetail(sub, allTickersConBoa, savedTickers)}
                                        className={`rounded-xl border shadow-sm transition-all px-4 py-3.5 flex items-center justify-between gap-2 ${
                                            isPrincipal
                                                ? "bg-blue-50/60 border-blue-200 cursor-not-allowed opacity-80"
                                                : `group cursor-pointer active:scale-[0.99] ${
                                                    isSelected
                                                        ? "bg-valora-primary/5 border-valora-primary shadow-md"
                                                        : "bg-white border-gray-200 shadow-sm hover:border-valora-primary/40 hover:shadow-md"
                                                }`
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <h3 className={`text-sm font-bold truncate transition-colors ${
                                                isPrincipal ? "text-blue-500" : isSelected ? "text-valora-primary" : "text-gray-800 group-hover:text-valora-primary"
                                            }`}>
                                                {sub.subsector || "Subsector"}
                                            </h3>
                                            {isSelected && savedTickers && !isPrincipal && (
                                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                    ({savedTickers.length} emp.)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {isPrincipal && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                    </svg>
                                                    Principal
                                                </span>
                                            )}
                                            {isSelected && !isPrincipal && (
                                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                    Usado
                                                </span>
                                            )}
                                            {avgBoa !== null && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide hidden sm:inline">
                                                        BOA
                                                    </span>
                                                    <span className="text-lg font-black text-valora-primary leading-none">
                                                        {avgBoa.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                            {!isPrincipal && (
                                                <svg className="w-4 h-4 text-gray-300 group-hover:text-valora-primary/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {subsectoresFecha && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/60 shrink-0">
                            <span className="text-[11px] text-gray-400 font-medium">
                                Actualizado{" "}
                                {new Date(subsectoresFecha).toLocaleDateString("es-PE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    )}
                    </>
                    )}
                </>
            )}
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
                    selectedSector={
                        form.formData.sector
                            ? (INDUSTRY_TRANSLATIONS[form.formData.sector] || form.formData.sector)
                            : null
                    }
                    selectedSubsector={
                        selectedSubsector || form.formData.subsector || null
                    }
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
                hasSensibilizaciones={calc.sensibilizaciones.length > 0}
            />

            <main
                className={`${showResults ? "pt-24 lg:pt-16" : "pt-12 lg:pt-16"} h-screen transition-all duration-300 ${isFormOpen ? "lg:pl-90" : "lg:pl-0"}`}
            >
                {mainContent}
            </main>

            <aside
                className={`fixed left-0 top-16 max-[540px]:z-70 z-40 h-[calc(100dvh-4rem)] flex  bg-transparent transition-transform duration-200 ${isFormOpen ? "translate-x-0" : "-translate-x-full"}`}
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
                {subsectorModalOpen && (
                    <div className="hidden lg:flex w-96 xl:w-125 h-[calc(100dvh-16rem)] max-h-[calc(100dvh-16rem)] bg-white border border-gray-200/80 rounded-xl flex-col shrink-0 animate-in slide-in-from-left-8 duration-300 ml-4 overflow-hidden self-start mt-4 ">
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
            {subsectorModalOpen && (
                <div className="fixed inset-0 z-120 flex lg:hidden items-start justify-center overflow-y-auto bg-gray-900/40 backdrop-blur-sm transition-all animate-in fade-in p-2 sm:p-4">
                    <div className={`bg-white rounded-xl shadow-2xl w-[96dvw] max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 justify-between ${modalData ? "h-[calc(100dvh-1rem)] sm:h-[85dvh]" : "h-auto"}`}>
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
