import { useEffect, useRef, useState } from "react";
import { FinancePageTemplate } from "../components/MainPage";
import { UploadTemplateModal } from "./components/UploadTemplateModal";
import {
  ValoraResults,
  type ValoraResultsSectionKey,
} from "./components/ValoraResults";
import { LoadingOverlay } from "@/shared/components/common/LoadingOverlay";
import { ToastStack } from "@/shared/components/common/ToastStack";
import type { FinancialTable } from "@/shared/types/ValoraTypes";
import type { ToastType } from "@/shared/types/toast.types";
import { MainPageFooter } from "../components/MainPageFooter";
import { parseFinancialTablesFromFile } from "./types/valoraFileParsing";
import { NavBar } from "./components/Navbar";
import { NavigationTabs } from "./components/ValoraNavigationTabs";
import { ValoraFormPanel } from "./components/ValoraFormPanel";
import { BetitoRateModal, type RateField } from "./components/BetitoRateModal";
import { useValoraForm } from "./hooks/useValoraForm";

import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  INSTRUMENTS,
  BONOS,
  COUNTRIES,
  COUNTRY_LOCAL_CURRENCIES,
  INDUSTRY_TRANSLATIONS,
  BONOS_TRANSLATIONS,
  COUNTRIES_TRANSLATIONS,
} from "@/shared/constants/kapital";

const ValoraPage: React.FC = () => {
  const {
    formData,
    setFormData,
    handleInputChange,
    dynamicSectors,
    dynamicDates,
  } = useValoraForm();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [isDesktopFormOpen, setIsDesktopFormOpen] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toasts, setToasts] = useState<
    Array<{ id: string; type: ToastType; message: string }>
  >([]);
  const toastTimeoutsRef = useRef<Map<string, number>>(new Map());
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadResetKey, setUploadResetKey] = useState(0);
  const [resultsSection, setResultsSection] = useState<ValoraResultsSectionKey>(
    "resultados"
  );
  const [_isResultsSidebarOpen, setIsResultsSidebarOpen] = useState(false);
  const [balanceTable, setBalanceTable] = useState<FinancialTable | null>(null);
  const [resultsTable, setResultsTable] = useState<FinancialTable | null>(null);
  const [betitoOpen, setBetitoOpen] = useState(false);
  const [betitoField, setBetitoField] = useState<RateField | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const handleResultsSectionChange = (nextSection: ValoraResultsSectionKey) => {
    setResultsSection(nextSection);
  };

  const mainContent = showResults ? (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <ValoraResults
        section={resultsSection}
        balanceTable={balanceTable}
        resultsTable={resultsTable}
        formData={formData}
        onSectionChange={handleResultsSectionChange}
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

  // Sample data with dynamic fallback
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

  /*const toggleResultsSidebar = () => {
    setIsResultsSidebarOpen((prev) => !prev);
  };*/

  const handleOpenBetito = (name: RateField) => {
    setBetitoField(name);
    setBetitoOpen(true);
  };

  const handleInsertBetitoRate = (value: string) => {
    if (betitoField) {
      setFormData((prev) => ({ ...prev, [betitoField]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const missingFields: string[] = [];

    if (!formData.date) missingFields.push("Fecha");
    if (!formData.country) missingFields.push("País");
    if (!formData.currency) missingFields.push("Moneda");
    if (!formData.sector) missingFields.push("Sector");
    if (!fileUploaded) missingFields.push("Plantilla EEFF");

    if (missingFields.length > 0) {
      addToast("warn", `Completa los campos: ${missingFields.join(", ")}`);
      return;
    }

    const isSensitivityRun =
      hasCalculated &&
      (formData.revenue_forecast_rate ||
        formData.fdc_forecast_rate ||
        formData.perpetual_growth_rate ||
        formData.beta_unlevered_sensitivity);

    setShowResults(false);
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
      setIsResultsSidebarOpen(true);
      setIsDesktopFormOpen(false);

      if (isSensitivityRun) {
        setResultsSection("sensibilidad");
        addToast("success", "Sensibilización calculada correctamente.");
      } else {
        setHasCalculated(true);
        setResultsSection("resultados");
        addToast("success", "Resultados generados correctamente.");
      }
    }, 1000);
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/files/PlantillaUsuarioValora.xlsx";
    link.download = "PlantillaUsuarioValora.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openUploadTemplateModal = () => {
    setIsUploadModalOpen(true);
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

  const handleUploadTemplate = (file: File) => {
    setUploadedFileUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return URL.createObjectURL(file);
    });
    setFormData((prev) => ({ ...prev, fileUsername: file.name }));
    setFileUploaded(true);
    setIsUploadModalOpen(false);
    addToast("success", "Plantilla cargada en el formulario.");
    parseFinancialTables(file);
  };

  const handleClearUploadedFile = () => {
    setUploadedFileUrl((prevUrl) => {
      if (prevUrl) {
        URL.revokeObjectURL(prevUrl);
      }
      return null;
    });
    setFormData((prev) => ({ ...prev, fileUsername: "" }));
    setFileUploaded(false);
    setUploadResetKey((prev) => prev + 1);
    setBalanceTable(null);
    setResultsTable(null);
    addToast("info", "Archivo eliminado del formulario.");
  };

  const parseFinancialTables = async (file: File) => {
    try {
      const { balanceTable: parsedBalance, resultsTable: parsedResults } =
        await parseFinancialTablesFromFile(file);

      setBalanceTable(parsedBalance);
      setResultsTable(parsedResults);

      if (!parsedBalance && !parsedResults) {
        addToast("warn", "No se encontraron las tablas en el archivo.");
      } else if (!parsedBalance) {
        addToast("warn", "Falta la tabla: Balance General.");
      } else if (!parsedResults) {
        addToast("warn", "Falta la tabla: Estado de Resultados.");
      }
    } catch (error) {
      console.error("Error parsing Excel:", error);
      addToast("error", "No se pudo leer el archivo Excel.");
    }
  };

  const getSelectedView = (): ValoraResultsSectionKey | "" => {
    if (!showResults) return "";
    return resultsSection;
  };

  const { user } = useAuth();

  const handleLogout = () => {
    // TODO: Implement logout functionality
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
        className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-105 border-r border-gray-200 bg-white shadow-sm transition-transform duration-200 ${isDesktopFormOpen ? "translate-x-0" : "-translate-x-105"}`}
      >
        <div className="h-full overflow-y-auto p-4">
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
            onClearUploadedFile={handleClearUploadedFile}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onDownloadTemplate={downloadTemplate}
            onUploadTemplate={openUploadTemplateModal}
            onSearchSectorBeta={() => addToast("info", "Buscando beta por subsector...")}
            isSearchingBeta={false}
            onSearchRate={(name) => handleOpenBetito(name as RateField)}
            loading={isLoading}
            hasCalculated={hasCalculated}
          />
        </div>
      </aside>

      <UploadTemplateModal
        key={uploadResetKey}
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDownloadTemplate={downloadTemplate}
        onUploadTemplate={handleUploadTemplate}
        onToast={addToast}
      />
      <BetitoRateModal
        isOpen={betitoOpen}
        field={betitoField}
        currentValue={betitoField ? formData[betitoField] : ""}
        onClose={() => {
          setBetitoOpen(false);
          setBetitoField(null);
        }}
        onInsert={handleInsertBetitoRate}
      />
      <ToastStack toasts={toasts} onDismiss={removeToast} />
      {isLoading && <LoadingOverlay />}
    </div>
  );
};

export default ValoraPage;
