import { useEffect, useMemo, useRef, useState } from "react";
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
  data: unknown
): ValoraCalculationResults | undefined => {
  if (!data || typeof data !== "object") return undefined;

  const results = (data as {
    resultados?: ValoraCalculationResults | ValoraCalculationResults[];
  }).resultados;

  if (Array.isArray(results)) return results[0];
  return results;
};

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

  const subsectorData = useKapitalData(
    formData.sector,
    subsectorTickersRef,
    subsectorSensibilizacionTickersRef
  );

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
      return;
    }
    setInactiveTickers([]);
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
    const boas = activeTickers
      .map((ticker) => Number(subsectorDetail.empresas_boa?.[ticker]))
      .filter(Number.isFinite);
    if (boas.length === 0) return null;
    return boas.reduce((sum, boa) => sum + boa, 0) / boas.length;
  }, [detailTickers, inactiveTickers, subsectorDetail]);

  const applySubsectorBeta = () => {
    if (!subsectorDetail || detailBoa === null) return;
    const activeTickers = detailTickers.filter(
      (ticker) => !inactiveTickers.includes(ticker)
    );
    const beta = detailBoa.toFixed(2);
    const subsector = String(subsectorDetail.subsector || "");

    subsectorTickersRef.current[subsector] = activeTickers;
    setFormData((current) => ({
      ...current,
      subsector,
      tickers_subsector: JSON.stringify(activeTickers),
      beta_subsector: beta,
      beta_unlevered_sensitivity: beta,
    }));
    closeSubsectorModal();
    addToast(
      "success",
      `Subsector ${subsector} seleccionado con BOA ${beta}.`
    );
  };


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
      <ValoraResults
        section={resultsSection}
        balanceTable={balanceTable}
        resultsTable={resultsTable}
        calculationResults={getValoraCalculationResults(
          valoraCalc.currentCalculation?.data
        )}
        formData={formData}
        onSectionChange={handleResultsSectionChange}
        onOpenFormPanel={() => setIsDesktopFormOpen(true)}
      />
      <MainPageFooter brandName={"Valora"} brandHref={"/valora"} />
    </div>
  ) : (
    <FinancePageTemplate
      brandName="Kapital"
      brandHref="/kapital"
      heroTitle="Bienvenido a Valora"
      btnText="Valora"
      onOpenForm={() => setIsDesktopFormOpen((prev) => !prev)}
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
    }
  }, [showResults]);

  const getSelectedView = (): ValoraResultsSectionKey | "" => {
    if (!showResults) return "";
    return resultsSection;
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
            onSearchSectorBeta={openSubsectorModal}
            isSearchingBeta={false}
            loading={valoraCalc.isLoading}
            hasCalculated={valoraCalc.hasCalculated}
          />
        </div>
        {subsectorModalOpen && (
          <div className="mt-4 ml-4 hidden h-[calc(100dvh-8rem)] max-h-[calc(100dvh-8rem)] w-96 shrink-0 flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-xl lg:flex xl:w-125">
            <SubsectorModal
              subsectorDetail={subsectorDetail}
              detailTickers={detailTickers}
              inactiveTickers={inactiveTickers}
              subsectorModalMode="sensibilizacion"
              isWaccCalculated={false}
              formDataSubsector=""
              formDataSubsectorSensibilizacion={formData.subsector}
              selectedSubsector={formData.subsector || null}
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
              formDataSubsector=""
              formDataSubsectorSensibilizacion={formData.subsector}
              selectedSubsector={formData.subsector || null}
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

      <ToastStack toasts={toasts} onDismiss={removeToast} />
      {valoraCalc.isLoading && <LoadingOverlay />}
    </div>
  );
};

export default ValoraPage;
