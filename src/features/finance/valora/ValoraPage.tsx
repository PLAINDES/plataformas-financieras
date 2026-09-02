import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FinancePageTemplate } from "../components/MainPage";
import {
  ValoraResults,
  type ValoraResultsSectionKey,
} from "./components/ValoraResults";
import { LoadingOverlay } from "@/shared/components/common/LoadingOverlay";
import { ToastStack } from "@/shared/components/common/ToastStack";
import type {
  FinancialTable,
  ValoraCalculationResults,
} from "@/shared/types/ValoraTypes";
import type { ToastType } from "@/shared/types/toast.types";
import { MainPageFooter } from "../components/MainPageFooter";
import { parseFinancialTablesFromFile } from "./types/valoraFileParsing";
import { NavBar } from "./components/Navbar";
import { NavigationTabs } from "./components/ValoraNavigationTabs";
import { ValoraFormPanel } from "./components/ValoraFormPanel";
import { MainService } from "@/shared/services/main.service";
import { SubsectorModal } from "../kapital/components/SubsectorModal";
import { useKapitalData } from "../kapital/hooks/useKapitalData";
import { ReportSidebar } from "../components/ReportSidebar";
import { ReportViewer } from "../kapital/components/ReportViewer";
import { REPORT_PRODUCTS } from "@/shared/constants/kapital";

import { useValoraForm } from "./hooks/useValoraForm";
import { useValoraCalculation } from "./hooks/useValoraCalculation";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

import {
  INSTRUMENTS,
  BONOS,
  COUNTRIES,
  COUNTRY_LOCAL_CURRENCIES,
  INDUSTRY_TRANSLATIONS,
  BONOS_TRANSLATIONS,
  COUNTRIES_TRANSLATIONS,
} from "@/shared/constants/kapital";

const getValoraCalculationResults = (
  data: unknown,
  key: "resultados" | "sensibilizacion" = "resultados",
  index?: number
): ValoraCalculationResults | undefined => {
  if (!data || typeof data !== "object") return undefined;

  const calculationData = data as Record<
    "resultados" | "sensibilizacion",
    ValoraCalculationResults | ValoraCalculationResults[] | undefined
  > & { sensibilidad?: ValoraCalculationResults | ValoraCalculationResults[] };
  const results = calculationData[key] ?? (
    key === "sensibilizacion" ? calculationData.sensibilidad : undefined
  );

  if (Array.isArray(results)) {
    const idx = index !== undefined && index >= 0 && index < results.length ? index : 0;
    return results[idx];
  }
  return results;
};

export interface ValoraRateAnalysis {
  explanation?: string;
  suggested_range?: { min?: number; max?: number };
  outlier?: boolean;
  outlier_reason?: string;
}

export interface ValoraAiAnalysis {
  model_used?: string;
  analysis?: {
    rates?: Record<string, ValoraRateAnalysis>;
  };
}

const ValoraPage: React.FC = () => {
  const { user, logout } = useAuthContext();
  const {
    formData,
    setFormData,
    handleInputChange,
    dynamicSectors,
    dynamicDates,
  } = useValoraForm();

  const [fileUploaded, setFileUploaded] = useState(false);
  const [isDesktopFormOpen, setIsDesktopFormOpen] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: ToastType; message: string }>
  >([]);
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [resultsSection, setResultsSection] = useState<ValoraResultsSectionKey>(
    "resultados"
  );
  const [_isResultsSidebarOpen, setIsResultsSidebarOpen] = useState(false);
  const [balanceTable, setBalanceTable] = useState<FinancialTable | null>(null);
  const [resultsTable, setResultsTable] = useState<FinancialTable | null>(null);
  const subsectorTickersRef = useRef<Record<string, string[]>>({});
  const subsectorSensibilizacionTickersRef = useRef<Record<string, string[]>>({});
   const [subsectorModalOpen, setSubsectorModalOpen] = useState(false);
   const [subsectorDetail, setSubsectorDetail] = useState<any>(null);
   const [detailTickers, setDetailTickers] = useState<string[]>([]);
   const [inactiveTickers, setInactiveTickers] = useState<string[]>([]);
   const [isReportSidebarOpen, setIsReportSidebarOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [selectedReportProductId, setSelectedReportProductId] = useState("");
  const [valoraCoverUrl, setValoraCoverUrl] = useState<string>();

  const subsectorData = useKapitalData(
    formData.sector,
    subsectorTickersRef,
    subsectorSensibilizacionTickersRef
  );

  useEffect(() => {
    MainService.getCovers().then((covers) => {
      const cover = covers.find((item) => /valora|especializado/i.test(item.nombre) && item.portada?.url)
        ?? covers.find((item) => item.portada?.url);
      setValoraCoverUrl(cover?.portada?.url);
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    subsectorData.syncTickersFromUrl(
      "tickers_subsector",
      "subsector",
      formData.tickers_subsector || "",
      formData.subsector
    );
  }, [formData.tickers_subsector, formData.subsector]);

  const openSubsectorModal = () => {
    setSubsectorModalOpen(true);
    setSubsectorDetail(null);
  };

  const closeSubsectorModal = () => {
    setSubsectorModalOpen(false);
    setSubsectorDetail(null);
  };

  const openSubsectorDetail = (
    subsector: any,
    allTickers: string[],
    savedTickers?: string[]
  ) => {
    setSubsectorDetail(subsector);
    setDetailTickers(allTickers);
    if (savedTickers) {
      const savedSet = new Set(savedTickers);
      setInactiveTickers(allTickers.filter((ticker) => !savedSet.has(ticker)));
    }
    // Si no hay savedTickers, no reiniciamos inactiveTickers para preservar la selección previa
  };

  const toggleSubsectorTicker = (ticker: string) => {
    setInactiveTickers((current) =>
      current.includes(ticker)
        ? current.filter((item) => item !== ticker)
        : [...current, ticker]
    );
  };

  const detailBoa = useMemo(() => {
    if (!subsectorDetail) return null;
    const activeTickers = detailTickers.filter(
      (ticker) => !inactiveTickers.includes(ticker)
    );
    if (activeTickers.length === 0) return null;

    const getAsset = (emp: string) => {
      const v = subsectorDetail.ticker_info?.[emp]?.activo_mercado;
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : 0;
    };
    const tickersValidos = activeTickers.filter((emp: string) => {
      const boa = subsectorDetail.empresas_boa?.[emp];
      const boaOk = boa !== null && boa !== undefined && String(boa) !== "" && Number.isFinite(Number(boa));
      const activoOk = getAsset(emp) > 0;
      return boaOk && activoOk;
    });
    const activosTotal = tickersValidos.reduce((sum, emp) => sum + getAsset(emp), 0);
    if (activosTotal === 0) return null;

    let boaPonderado = 0;
    for (const emp of tickersValidos) {
      const boa = Number(subsectorDetail.empresas_boa?.[emp]) || 0;
      const activos = getAsset(emp);
      const wi = activos / activosTotal;
      boaPonderado += wi * boa;
    }
    return boaPonderado;
  }, [detailTickers, inactiveTickers, subsectorDetail]);

  const applySubsectorBeta = () => {
    if (!subsectorDetail || detailBoa === null) return;
    const activeTickers = detailTickers.filter(
      (ticker) => !inactiveTickers.includes(ticker)
    );
    const beta = detailBoa.toFixed(2);
    const subsector = String(subsectorDetail.subsector || "");
    const comparables = activeTickers.map((ticker) => ({
      ticker,
      ...(subsectorDetail.ticker_info?.[ticker] || {}),
      boa: Number(subsectorDetail.empresas_boa?.[ticker]) || 0,
    }));

    // Reutiliza lógica Kapital: guarda en ref de sensibilización y en campos dedicados
    subsectorSensibilizacionTickersRef.current[subsector] = activeTickers;
    setFormData((current) => ({
      ...current,
      subsector_sensibilizacion: subsector,
      tickers_subsector_sensibilizacion: JSON.stringify(activeTickers),
      beta_subsector: beta,
      beta_unlevered_sensitivity: beta,
      comparables_subsector: JSON.stringify({ subsector, companies: comparables }),
    }));
    closeSubsectorModal();
    addToast(
      "success",
      `Subsector ${subsector} seleccionado con BOA ${beta}.`
    );
  };

  const handleReportSidebarOpen = useCallback(() => {
    setIsReportSidebarOpen(true);
  }, []);

  const handleReportViewerOpen = useCallback(() => {
    if (!selectedReportProductId) return;
    setIsReportViewerOpen(true);
    setIsReportSidebarOpen(false);
  }, [selectedReportProductId]);

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<ValoraAiAnalysis | null>(null);
  const [rateSources, setRateSources] = useState<Record<string, string>>({});
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfStage, setPdfStage] = useState("");
  const pdfControllerRef = useRef<AbortController | null>(null);
  const pdfTimeoutRef = useRef<number | null>(null);
  const pdfIntervalRef = useRef<number | null>(null);


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

   const valoraCalc = useValoraCalculation({
     formData,
     setFormData,
     balanceTable,
     setBalanceTable,
     resultsTable,
     setResultsTable,
     fileUploaded,
     setFileUploaded,
     addToast,
     userId: user?.id,
     ui: {
       setShowResults,
       setIsDesktopFormOpen,
       setResultsSection: (section) => setResultsSection(section),
     },
   });

  const handleOpenFormPanel = () => {
    const willOpen = !isDesktopFormOpen;
    setIsDesktopFormOpen((prev) => !prev);
    if (willOpen) {
      const rawData = valoraCalc.currentCalculation?.data as any;
      let resultados: any = null;
      if (Array.isArray(rawData?.resultados)) {
        resultados = rawData.resultados[0];
      } else if (rawData?.resultados) {
        resultados = rawData.resultados;
      } else if (rawData && typeof rawData === "object") {
        resultados = rawData;
      }
      if (resultados) {
        const parseRate = (val: any): string | null => {
          if (val == null || val === "") return null;
          const str = String(val).trim().replace("%", "").replace(",", ".");
          const num = Number(str);
          if (!Number.isFinite(num)) return null;
          const pct = Math.abs(num) < 1 && num !== 0 ? Math.round(num * 10000) / 100 : num;
          return String(pct);
        };
        const ing =
          resultados?.conceptos?.tasa_forecast ??
          resultados?.forecast_ingresos ??
          resultados?.tasa_forecast ??
          (rawData as any)?.inputs?.[0]?.revenue_forecast_rate;
        const fde =
          resultados?.integrado?.tasa_forecast ??
          resultados?.forecast_fde ??
          resultados?.tasa_fde ??
          (rawData as any)?.inputs?.[0]?.fdc_forecast_rate;
        const perp =
          resultados?.conceptos?.tasa_perpetua ??
          resultados?.integrado?.tasa_perpetua ??
          resultados?.crecimiento_perpetuo ??
          resultados?.tasa_perpetua ??
          resultados?.perpetual_growth_rate ??
          (rawData as any)?.inputs?.[0]?.perpetual_growth_rate;
        setFormData((prev) => {
          const updates: Partial<typeof prev> = {};
          if (!prev.revenue_forecast_rate && ing != null && String(ing).trim() !== "") {
            const v = parseRate(ing);
            if (v) updates.revenue_forecast_rate = v;
          }
          if (!prev.fdc_forecast_rate && fde != null && String(fde).trim() !== "") {
            const v = parseRate(fde);
            if (v) updates.fdc_forecast_rate = v;
          }
          if (!prev.perpetual_growth_rate && perp != null && String(perp).trim() !== "") {
            const v = parseRate(perp);
            if (v) updates.perpetual_growth_rate = v;
          }
          return Object.keys(updates).length ? { ...prev, ...updates } : prev;
        });
      }
    }
  };

  useEffect(() => {
    valoraCalc.loadFromUrl();
  }, []);

  const handleResultsSectionChange = (nextSection: ValoraResultsSectionKey) => {
    setResultsSection(nextSection);
  };

  const downloadTemplate = async () => {
    try {
      const res = await MainService.getValoraTemplate();
      const templates = res.templates || [];
      const current = templates.find((t) => t.is_current) || templates[0];
      if (current) {
        const link = document.createElement("a");
        link.href = current.url;
        link.download = current.original_name || "PlantillaUsuarioValora.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        addToast("warn", "No hay plantilla configurada. Contacta al administrador.");
      }
    } catch {
      addToast("error", "No se pudo obtener la plantilla.");
    }
  };

  const handleUploadTemplate = (file: File) => {
    setUploadedFileUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return URL.createObjectURL(file);
    });
    setFormData((prev) => ({ ...prev, fileUsername: file.name }));
    setFileUploaded(true);
    addToast("success", "Plantilla cargada en el formulario.");
    parseFinancialTables(file);
  };

  const cancelPdfExtraction = () => {
    try { pdfControllerRef.current?.abort(new DOMException("cancelled by user", "AbortError")); } catch { pdfControllerRef.current?.abort(); }
    if (pdfIntervalRef.current) window.clearInterval(pdfIntervalRef.current);
    if (pdfTimeoutRef.current) window.clearTimeout(pdfTimeoutRef.current);
    setIsPdfLoading(false);
    addToast("info", "Extracción cancelada");
  };

  const handleUploadPdf = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      addToast("warn", "Solo se permiten archivos PDF");
      return;
    }
    // Cancela extracción previa si existe (fix: evita que quede colgada rompiendo sistema)
    if (isPdfLoading) {
      pdfControllerRef.current?.abort();
      if (pdfIntervalRef.current) window.clearInterval(pdfIntervalRef.current);
      if (pdfTimeoutRef.current) window.clearTimeout(pdfTimeoutRef.current);
    }
    console.log("[VALORA PDF] handleUploadPdf iniciado", file.name, file.size);
    setIsPdfLoading(true);
    setPdfProgress(10);
    setPdfStage("Subiendo PDF...");
    const controller = new AbortController();
    pdfControllerRef.current = controller;
    const timeoutId = window.setTimeout(() => {
      console.log("[VALORA PDF] timeout 600s abort");
      try { controller.abort(new DOMException("timeout 600s", "AbortError")); } catch { controller.abort(); }
    }, 600_000);
    pdfTimeoutRef.current = timeoutId;
    const progressInterval = window.setInterval(() => {
      setPdfProgress((prev) => (prev < 87 ? prev + 2 : prev));
    }, 900);
    pdfIntervalRef.current = progressInterval;
    try {
      const tick = (p: number, s: string) => {
        setPdfProgress(p);
        setPdfStage(s);
      };
      tick(20, "Extrayendo texto del PDF...");
      tick(30, "Clasificando cuentas con IA...");
      console.log("[VALORA PDF] POST /main/valora/pdf-to-template ->", file.name);

       const result = await MainService.uploadValoraPdf(file, controller.signal);
      console.log("[VALORA PDF] result status", result.status);

      tick(85, "Rellenando Excel ya subido con datos del PDF...");
      // Merge IA -> tablas existentes (respeta años 2021-2025 del Excel ya subido)
      const mergeTables = (existing: FinancialTable | null, incoming: FinancialTable | null): FinancialTable | null => {
        if (!incoming) return existing;
        if (!existing) return incoming;
        // Mapa incoming: label -> periodo -> valor
        const incomingMap = new Map<string, Map<string, any>>();
        incoming.rows.forEach((r) => {
          const m = new Map<string, any>();
          incoming.years.forEach((y, i) => m.set(String(y), r.values[i]));
          incomingMap.set(r.label, m);
        });
        const mergedRows = existing.rows.map((r) => {
          const inc = incomingMap.get(r.label);
          if (!inc) return r;
          const newValues = existing.years.map((y) => {
            const v = inc.get(String(y));
            return v !== undefined && v !== null && v !== "" ? v : (r.values[existing.years.indexOf(y)] as any);
          });
          return { ...r, values: newValues };
        });
        return { ...existing, rows: mergedRows };
      };

      const mergedBal = mergeTables(balanceTable, result.balance_table || null);
      const mergedRes = mergeTables(resultsTable, result.results_table || null);
      if (mergedBal) setBalanceTable(mergedBal);
      else if (result.balance_table) setBalanceTable(result.balance_table);
      if (mergedRes) setResultsTable(mergedRes);
      else if (result.results_table) setResultsTable(result.results_table);

      // Usa exclusivamente la copia de la plantilla maestra rellenada por el backend.
      try {
        if (!result.xlsx_base64) {
          throw new Error("El backend no devolvió la plantilla Valora rellenada");
        }
        const xlsxBlob = new Blob([Uint8Array.from(atob(result.xlsx_base64), (char) => char.charCodeAt(0))], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const xlsxUrl = URL.createObjectURL(xlsxBlob);
        setUploadedFileUrl((prevUrl) => {
          if (prevUrl) URL.revokeObjectURL(prevUrl);
          return xlsxUrl;
        });
        (window as any).__lastValoraXlsxBlob = xlsxBlob;
      } catch (e) {
        console.warn("[VALORA PDF] No se pudo generar Excel rellenado", e);
        if (!balanceTable && !resultsTable) {
          setUploadedFileUrl((prevUrl) => {
            if (prevUrl) URL.revokeObjectURL(prevUrl);
            return URL.createObjectURL(file);
          });
        }
      }

      setFormData((prev) => {
        const updates: any = { ...prev };
        // Mantiene nombre del Excel ya subido (no cambia a .pdf)
        if (!prev.fileUsername || prev.fileUsername.toLowerCase().endsWith(".pdf")) {
          // Si antes no había Excel, usa nombre Excel generado
          updates.fileUsername = result.filename || `${empresa.replace(/\s+/g, "_")}_${(result.metadata?.periodos || []).join("-") || "2021-2025"}_rellenado.xlsx`;
        }
        if (result.metadata?.moneda) updates.currency = result.metadata.moneda;
        const sharesVal = result.number_of_shares?.value ?? result.number_of_shares;
        if (sharesVal !== null && sharesVal !== undefined && String(sharesVal).trim() !== "") updates.shares = String(sharesVal);
        return updates;
      });
      setFileUploaded(true);
      tick(100, "¡Excel rellenado!");

      const status = result.status;
      if (status === "OK") {
        addToast("success", `EEFF PDF procesado con IA (${result.model_used || "Gemini"}). Plantilla auto-completada.`);
      } else if (status === "REQUIERE_REVISION") {
        addToast("warn", `PDF procesado con advertencias: ${result.warnings?.[0] || "Revisar mapping_detail"}`);
      } else if (status === "DOCUMENTO_INCOMPLETO") {
        addToast("warn", `Documento incompleto: ${result.missing_information?.[0] || "Falta info para plantilla"}`);
      } else {
        addToast("success", "PDF procesado. Verifica balances en la plantilla.");
      }

      console.log("[VALORA PDF] mapping_detail:", result.mapping_detail);
      console.log("[VALORA PDF] validation:", result.validation);
      if (result.warnings?.length) console.warn("[VALORA PDF] warnings:", result.warnings);
    } catch (e: any) {
      if (e?.name === "AbortError") {
        addToast("info", "Extracción cancelada o tiempo agotado (600s)");
      } else {
        addToast("error", e?.message || "Error procesando PDF con IA");
      }
      console.log("[VALORA PDF] error", e);
    } finally {
      window.clearInterval(progressInterval);
      window.clearTimeout(timeoutId);
      pdfIntervalRef.current = null;
      pdfTimeoutRef.current = null;
      pdfControllerRef.current = null;
      setTimeout(() => setIsPdfLoading(false), 800);
    }
  };

  const parseFinancialTables = async (file: File) => {
    try {
      const { balanceTable: parsedBalance, resultsTable: parsedResults, customInputs } =
        await parseFinancialTablesFromFile(file);

      setBalanceTable(parsedBalance);
      setResultsTable(parsedResults);

      if (customInputs) {
        setFormData((prev) => {
          const updates = { ...prev };

          // C3 -> Costo de deuda (Section 4)
          if (customInputs.kd !== undefined && customInputs.kd !== null && customInputs.kd !== "") {
            updates.kd = customInputs.kd;
          }

          // C4 -> % de deuda (Section 4) y % de capital automático (100 - debt)
          if (customInputs.debt !== undefined && customInputs.debt !== null && customInputs.debt !== "") {
            updates.debt = customInputs.debt;
            const debtNum = parseFloat(customInputs.debt);
            if (!isNaN(debtNum) && debtNum >= 0 && debtNum <= 100) {
              updates.capital = (100 - debtNum).toString();
            }
          }

          // C5 -> Número de acciones (Section 1), si está rellenado
          if (customInputs.shares !== undefined && customInputs.shares !== null && customInputs.shares !== "") {
            updates.shares = customInputs.shares;
          }

          return updates;
        });
      }

      addToast("success", "Estados financieros parseados correctamente.");
    } catch {
      addToast("error", "No se pudo leer las tablas del archivo.");
    }
  };

   const mainContent = showResults ? (
     <div className="flex flex-col min-h-[calc(100vh-4rem)]">
       {isReportViewerOpen ? (
         <ReportViewer
           isOpen={isReportViewerOpen}
           onClose={() => setIsReportViewerOpen(false)}
           reportProductId={selectedReportProductId}
           calculationId={valoraCalc.currentCalculation?.id}
           isSessionFresh={valoraCalc.isSessionFresh}
           setIsSessionFresh={valoraCalc.setIsSessionFresh}
           prewarmedSessionId={null}
         />
       ) : (
         <ValoraResults
           section={resultsSection}
           balanceTable={balanceTable}
           resultsTable={resultsTable}
           calculationResults={getValoraCalculationResults(
             valoraCalc.currentCalculation?.data
           )}
           sensitizedResults={getValoraCalculationResults(
             valoraCalc.currentCalculation?.data,
             "sensibilizacion",
             valoraCalc.selectedSensIdx
           )}
           formData={formData}
           resultView={valoraCalc.resultView}
           hasSensitized={Boolean(getValoraCalculationResults(
             valoraCalc.currentCalculation?.data,
             "sensibilizacion"
           ))}
           sensibilizaciones={valoraCalc.sensibilizaciones}
           selectedSensIdx={valoraCalc.selectedSensIdx}
           onResultViewChange={valoraCalc.setResultView}
           onSelectedSensIdxChange={valoraCalc.setSelectedSensIdx}
           onSectionChange={handleResultsSectionChange}
           onOpenFormPanel={handleOpenFormPanel}
           onOpenReport={handleReportSidebarOpen}
           coverUrl={valoraCoverUrl}
         />
       )}
       <MainPageFooter brandName={"Valora"} brandHref={"/valora"} />
     </div>
   ) : (
     <FinancePageTemplate
       brandName="Valora"
       brandHref="/valora"
       heroTitle="Bienvenido a Valora"
       btnText="Valora"
       onOpenForm={handleOpenFormPanel}
     />
   );

  const fallbackDates = ["2024-Q1", "2024-Q2", "2024-Q3", "2024-Q4"];
  const fallbackCountries = COUNTRIES;
  const fallbackSectors = [
    "Tecnología",
    "Finanzas",
    "Manufactura",
    "Servicios",
    "Retail",
    "Salud",
    "Energía",
  ];
  const currencies = ["USD", "PEN", "CLP", "BRL", "MXN", "COP", "ARS"];

  const dates = dynamicDates.length > 0 ? dynamicDates : fallbackDates;
  const countries =
    dynamicSectors.length > 0 ? fallbackCountries : fallbackCountries;
  const sectors = dynamicSectors.length > 0 ? dynamicSectors : fallbackSectors;

  useEffect(
    () => () => {
      toastTimeoutsRef.current.forEach((timeoutId) =>
        window.clearTimeout(timeoutId)
      );
      toastTimeoutsRef.current.clear();
    },
    []
  );

  useEffect(
    () => () => {
      if (uploadedFileUrl) {
        URL.revokeObjectURL(uploadedFileUrl);
      }
    },
    [uploadedFileUrl]
  );

   useEffect(() => {
     if (!showResults) {
       setIsResultsSidebarOpen(false);
       setIsReportViewerOpen(false);
     }
   }, [showResults]);

  const getSelectedView = (): ValoraResultsSectionKey | "" => {
    if (!showResults) return "";
    return resultsSection;
  };

  const handleGetAIRecommendations = async () => {
    if (!valoraCalc.currentCalculation?.id) {
      addToast("warn", "Primero guarda el cálculo para obtener recomendaciones.");
      return;
    }

    setIsLoadingAI(true);
    console.info("[VALORA FRONTEND] Solicitando recomendaciones IA...");

    try {
      const recommendations = await MainService.getValoraRecommendations(
        valoraCalc.currentCalculation.id
      );

      const rates = recommendations?.rates;
      if (rates) {
        console.info("[VALORA FRONTEND] Rates recibidos del backend:", JSON.stringify(rates, null, 2));

        setRateSources({
          forecast_ingresos_1er_periodo: rates.forecast_ingresos_1er_periodo?.recommendation_source,
          forecast_fde_1er_periodo: rates.forecast_fde_1er_periodo?.recommendation_source,
          crecimiento_perpetuo: rates.crecimiento_perpetuo?.recommendation_source,
        });

        const ai = recommendations?.ai_analysis as ValoraAiAnalysis | undefined;
        if (ai?.analysis?.rates) {
          setAiAnalysis(ai);
          const withAI = Object.keys(ai.analysis.rates).filter(
            (k) => ai.analysis?.rates?.[k]?.explanation
          ).length;
          console.info("[VALORA FRONTEND] Análisis IA con explicaciones:", withAI);
        } else {
          setAiAnalysis(null);
          console.info("[VALORA FRONTEND] Sin análisis IA en la respuesta (Gemini omitido o falló).");
        }

        setFormData((prev) => {
          const updates = { ...prev };

          const ing = rates.forecast_ingresos_1er_periodo?.recommendation;
          console.info("[VALORA FRONTEND] Ingresos recommendation:", ing, "tipo:", typeof ing);
          if (ing !== undefined && ing !== null && !Number.isNaN(Number(ing))) {
            updates.revenue_forecast_rate = String(Math.round(Number(ing) * 10000) / 100);
            console.info("[VALORA FRONTEND] revenue_forecast_rate actualizado a:", updates.revenue_forecast_rate);
          } else {
            console.warn("[VALORA FRONTEND] Ingresos recommendation inválida o vacía:", ing);
          }

          const fde = rates.forecast_fde_1er_periodo?.recommendation;
          console.info("[VALORA FRONTEND] FDE recommendation:", fde, "tipo:", typeof fde);
          if (fde !== undefined && fde !== null && !Number.isNaN(Number(fde))) {
            updates.fdc_forecast_rate = String(Math.round(Number(fde) * 10000) / 100);
            console.info("[VALORA FRONTEND] fdc_forecast_rate actualizado a:", updates.fdc_forecast_rate);
          } else {
            console.warn("[VALORA FRONTEND] FDE recommendation inválida o vacía:", fde);
          }

          const perp = rates.crecimiento_perpetuo?.recommendation;
          console.info("[VALORA FRONTEND] Perpetuo recommendation:", perp, "tipo:", typeof perp);
          if (perp !== undefined && perp !== null && !Number.isNaN(Number(perp))) {
            updates.perpetual_growth_rate = String(Math.round(Number(perp) * 10000) / 100);
            console.info("[VALORA FRONTEND] perpetual_growth_rate actualizado a:", updates.perpetual_growth_rate);
          } else {
            console.warn("[VALORA FRONTEND] Perpetuo recommendation inválida o vacía:", perp);
          }

          return updates;
        });

        addToast("success", "Recomendaciones IA aplicadas a los inputs de sensibilidad.");
        console.info("[VALORA FRONTEND] Recomendaciones aplicadas:", rates);
      } else {
        addToast("warn", "No se encontraron recomendaciones en la respuesta.");
      }
    } catch (error) {
      console.error("[VALORA FRONTEND] Error obteniendo recomendaciones:", error);
      addToast("error", "No se pudieron obtener las recomendaciones IA. Intenta nuevamente.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleLogout = async () => {
    if (logout) {
      await logout();
      addToast("info", "Has cerrado sesión exitosamente.");
    }
  };

  return (
    <div className="min-h-dvh bg-gray-50">
      <NavBar
        user={user}
        onLogout={handleLogout}
        onToggleForm={() => setIsDesktopFormOpen((prev) => !prev)}
        isFormOpen={isDesktopFormOpen}
        hasResults={showResults}
        logoHref="/valora"
        logoSrc="/images/logo-valora-small.png"
        logoAlt="Valora Logo"
        projectsHref="/usuario/proyectos"
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
      />

      <NavigationTabs
        selected={getSelectedView()}
        onNavigate={handleResultsSectionChange}
        hasResults={showResults}
      />
      <main
        className={`${showResults ? "pt-24 lg:pt-16" : "pt-12 lg:pt-16"} transition-all h-screen duration-300 ${isDesktopFormOpen ? "lg:pl-105" : "lg:pl-0"}`}
      >
        {mainContent}
      </main>
      <aside
        className={`fixed left-0 top-16 z-40 flex h-[calc(100dvh-4rem)] bg-transparent transition-transform duration-200 ${isDesktopFormOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-full w-105 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4 shadow-sm">
          <ValoraFormPanel
            formData={formData}
            dates={dates}
            countries={countries}
            currencies={currencies}
            sectors={sectors}
            fileUploaded={fileUploaded}
            uploadedFileUrl={uploadedFileUrl}
            instruments={INSTRUMENTS}
            bonos={BONOS}
            countryLocalCurrencies={COUNTRY_LOCAL_CURRENCIES}
            industryTranslations={INDUSTRY_TRANSLATIONS}
            bonosTranslations={BONOS_TRANSLATIONS}
            countriesTranslations={COUNTRIES_TRANSLATIONS}
            onInputChange={handleInputChange}
            onSubmit={valoraCalc.handleSubmit}
            onDownloadTemplate={downloadTemplate}
            onUploadTemplate={handleUploadTemplate}
            onUploadPdf={handleUploadPdf}
            onSearchSectorBeta={openSubsectorModal}
            isSearchingBeta={false}
            isPdfLoading={isPdfLoading}
            loading={valoraCalc.isLoading}
            hasCalculated={valoraCalc.hasCalculated}
            currentCalculationId={valoraCalc.currentCalculation?.id ?? null}
isLoadingAI={isLoadingAI}
        onGetAIRecommendations={handleGetAIRecommendations}
        aiAnalysis={aiAnalysis}
        rateSources={rateSources}
      />
        </div>
        {subsectorModalOpen && (
          <div className="hidden lg:flex w-96 xl:w-125 h-[calc(100dvh-16rem)] max-h-[calc(100dvh-16rem)] bg-white border border-gray-200/80 rounded-xl flex-col shrink-0 animate-in slide-in-from-left-8 duration-300 ml-4 overflow-hidden self-start mt-4">
            <SubsectorModal
              subsectorDetail={subsectorDetail}
              detailTickers={detailTickers}
              inactiveTickers={inactiveTickers}
              subsectorModalMode="sensibilizacion"
              isWaccCalculated={false}
              formDataSubsector={formData.subsector ?? ""}
              formDataSubsectorSensibilizacion={formData.subsector_sensibilizacion ?? ""}
              selectedSubsector={formData.subsector_sensibilizacion || null}
              filteredSubsectores={subsectorData.filteredSubsectores}
              subsectoresFecha={subsectorData.subsectoresFecha}
              detailBoa={detailBoa}
              onSetSubsectorDetail={setSubsectorDetail}
              onCloseModal={closeSubsectorModal}
              onOpenDetail={openSubsectorDetail}
              onToggleTicker={toggleSubsectorTicker}
              onCalculateDetail={applySubsectorBeta}
              onSetSubsectorModalMode={() => undefined}
              subsectorTickersRef={subsectorTickersRef}
              subsectorSensibilizacionTickersRef={subsectorSensibilizacionTickersRef}
            />
          </div>
        )}
       </aside>

       {subsectorModalOpen && (
         <div className="fixed inset-0 z-120 flex items-start justify-center overflow-y-auto bg-gray-900/40 p-2 backdrop-blur-sm lg:hidden sm:p-4">
           <div className="flex h-[calc(100dvh-1rem)] w-[96dvw] max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:h-[85dvh]">
             <SubsectorModal
               subsectorDetail={subsectorDetail}
               detailTickers={detailTickers}
               inactiveTickers={inactiveTickers}
               subsectorModalMode="sensibilizacion"
               isWaccCalculated={false}
               formDataSubsector={formData.subsector ?? ""}
               formDataSubsectorSensibilizacion={formData.subsector_sensibilizacion ?? ""}
               selectedSubsector={formData.subsector_sensibilizacion || null}
               filteredSubsectores={subsectorData.filteredSubsectores}
               subsectoresFecha={subsectorData.subsectoresFecha}
               detailBoa={detailBoa}
               onSetSubsectorDetail={setSubsectorDetail}
               onCloseModal={closeSubsectorModal}
               onOpenDetail={openSubsectorDetail}
               onToggleTicker={toggleSubsectorTicker}
               onCalculateDetail={applySubsectorBeta}
               onSetSubsectorModalMode={() => undefined}
               subsectorTickersRef={subsectorTickersRef}
               subsectorSensibilizacionTickersRef={subsectorSensibilizacionTickersRef}
             />
           </div>
         </div>
       )}

       <ReportSidebar
         isOpen={isReportSidebarOpen}
         onClose={() => setIsReportSidebarOpen(false)}
         reportProducts={REPORT_PRODUCTS}
         selectedReportProductId={selectedReportProductId}
         onSelectReportProduct={setSelectedReportProductId}
         onOpenReportViewer={handleReportViewerOpen}
         reportType="valora"
       />

       <ToastStack toasts={toasts} onDismiss={removeToast} />
      {valoraCalc.isLoading && <LoadingOverlay />}
      {isPdfLoading && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-[480px] max-w-[90vw] bg-white rounded-2xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-valora-primary/10 flex items-center justify-center">
                <i className="fa-solid fa-file-pdf text-valora-primary"></i>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">Procesando EEFF PDF con IA</h3>
                <p className="text-xs text-gray-500">{pdfStage}</p>
              </div>
              <button
                type="button"
                onClick={cancelPdfExtraction}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-valora-primary transition-all duration-500" style={{ width: `${pdfProgress}%` }} />
            </div>
            <p className="text-[11px] text-gray-400 text-center">{pdfProgress}% — La IA clasifica semánticamente cuentas, valida y mapea a plantilla</p>
            <p className="text-[10px] text-gray-400 text-center">Si tarda &gt;180s se cancela automáticamente. Abre Consola (F12) y Network para ver POST.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValoraPage;
