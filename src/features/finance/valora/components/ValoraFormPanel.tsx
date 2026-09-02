import React, { useEffect, useMemo, useRef, useState } from "react";

import { IconActionButton } from "../../../../shared/components/ui/IconActionButton";
import { Tooltip } from "@/shared/components/common/Tooltip";
import { FormField } from "../../components/FormField";
import { FormSection } from "../../components/FormSection";
import { cn } from "@/lib/utils";
import type { FormData } from "@/shared/types/ValoraTypes";
import type { ValoraAiAnalysis } from "../ValoraPage";

import "../ValoraPage.css";

export interface ValoraFormPanelProps {
  formData: FormData;
  dates: string[];
  countries: string[];
  currencies: string[];
  sectors: string[];
  fileUploaded: boolean;
  uploadedFileUrl: string | null;
  instruments?: string[];
  bonos?: string[];
  countryLocalCurrencies?: Record<string, string>;
  industryTranslations?: Record<string, string>;
  bonosTranslations?: Record<string, string>;
  countriesTranslations?: Record<string, string>;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDownloadTemplate: () => void;
  onUploadTemplate: (file: File) => void;
  onUploadPdf?: (file: File) => void;
  onSearchSectorBeta?: () => void;
  isSearchingBeta?: boolean;
  isPdfLoading?: boolean;
  loading?: boolean;
  hasCalculated?: boolean;
  currentCalculationId?: number | null;
  isLoadingAI?: boolean;
  onGetAIRecommendations?: () => void;
  aiAnalysis?: ValoraAiAnalysis | null;
  rateSources?: Record<string, string>;
}

export const ValoraFormPanel: React.FC<ValoraFormPanelProps> = ({
  formData,
  dates,
  countries,
  currencies,
  sectors,
  fileUploaded,
  uploadedFileUrl,
  instruments = [],
  bonos = [],
  countryLocalCurrencies = {},
  industryTranslations,
  bonosTranslations,
  countriesTranslations,
  onInputChange,
  onSubmit,
  onDownloadTemplate,
  onUploadTemplate,
  onUploadPdf,
  onSearchSectorBeta,
  isSearchingBeta = false,
  isPdfLoading = false,
  loading = false,
  hasCalculated = false,
  currentCalculationId,
  isLoadingAI = false,
  onGetAIRecommendations,
  aiAnalysis = null,
  rateSources = {},
}) => {
  const [collapsed, setCollapsed] = useState({
    step1: false,
    step2: true,
    step3: true,
    step4: true,
    step5: true,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);

  const isFilePresent = fileUploaded || Boolean(formData.fileUsername) || hasCalculated;

  const isSection2Disabled = !hasCalculated && !isFilePresent;
  const isSection2Complete = Boolean(
    hasCalculated ||
      (formData.date && formData.sector)
  );
  const isSection3Disabled =
    !hasCalculated && !(isFilePresent && isSection2Complete);
  const isSection4Disabled =
    !hasCalculated && !(isFilePresent && isSection2Complete && formData.country);

  const toggleCollapse = (
    step: "step1" | "step2" | "step3" | "step4" | "step5"
  ) => {
    setCollapsed((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  useEffect(() => {
    if (!isSection2Disabled) {
      setCollapsed((prev) => ({ ...prev, step2: false }));
    }
  }, [isSection2Disabled]);

  useEffect(() => {
    if (!isSection3Disabled) {
      setCollapsed((prev) => ({ ...prev, step3: false }));
    }
  }, [isSection3Disabled]);

  useEffect(() => {
    if (!isSection4Disabled) {
      setCollapsed((prev) => ({ ...prev, step4: false }));
    }
  }, [isSection4Disabled]);

  useEffect(() => {
    if (fileUploaded && (formData.kd || formData.debt)) {
      setCollapsed((prev) => ({ ...prev, step4: false }));
    }
  }, [fileUploaded, formData.kd, formData.debt]);

  useEffect(() => {
    if (hasCalculated) {
      setCollapsed({
        step1: false,
        step2: false,
        step3: false,
        step4: false,
        step5: false,
      });
    }
  }, [hasCalculated]);

  const kdCurrencyOptions = useMemo(() => {
    const localCode = formData.country
      ? countryLocalCurrencies[formData.country]
      : null;
    if (localCode && localCode !== "USD") {
      return ["USD", localCode];
    }
    return currencies.length > 0 ? currencies : ["USD"];
  }, [formData.country, countryLocalCurrencies, currencies]);

  const handleSearchSectorBeta = () => {
    if (onSearchSectorBeta && formData.sector) {
      onSearchSectorBeta();
    }
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleOpenPdfPicker = () => {
    pdfInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadTemplate(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePdfChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (onUploadPdf) onUploadPdf(file);
      else onUploadTemplate(file);
    }
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  };

  const submitLabel = hasCalculated ? "SENSIBILIZAR" : "VALORIZAR";

  return (
    <form className="flex h-full flex-col" onSubmit={onSubmit}>
      <div className="flex-1 min-h-0 bg-white p-2 pb-0 flex flex-col">
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
          {/* Section 1: Company info */}
          <FormSection
            step={1}
            title="Ingrese la información de su empresa"
            isCollapsed={collapsed.step1}
            onToggleCollapse={() => toggleCollapse("step1")}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 font-semibold">
                  Descargar Plantilla EEFF
                </span>
                <IconActionButton
                  iconClassName="fa-solid fa-download"
                  ariaLabel="Descargar plantilla"
                  onClick={onDownloadTemplate}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-600 font-semibold flex items-center gap-2">
                  <span>Subir Plantilla EEFF</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                      fileUploaded || formData.fileUsername || hasCalculated
                        ? "bg-emerald-50 text-green-600 border-green-600"
                        : "bg-amber-50 text-amber-500 border-amber-500"
                    }`}
                  >
                    {fileUploaded || formData.fileUsername || hasCalculated ? "Cargado" : "Pendiente"}
                  </span>
                  {!fileUploaded && !formData.fileUsername && !hasCalculated && (
                    <input
                      type="text"
                      name="fileUsername"
                      defaultValue=""
                      className="hidden"
                      required
                    />
                  )}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {!hasCalculated && (
                  <IconActionButton
                    iconClassName="fa-solid fa-file-import"
                    ariaLabel="Subir plantilla"
                    onClick={handleOpenFilePicker}
                  />
                )}
              </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm text-gray-600 font-semibold flex items-center gap-2 min-w-0">
                    <span>Subir EEFF.pdf</span>
                  </label>
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    <button
                      type="button"
                      onClick={handleOpenPdfPicker}
                      disabled={isPdfLoading}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors shrink-0 ${isPdfLoading ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed" : "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"}`}
                      aria-label="Subir EEFF PDF"
                    >
                      <i className={`fa-solid ${isPdfLoading ? "fa-spinner fa-spin" : "fa-file-pdf"} text-sm`}></i>
                    </button>
                    <Tooltip content="El EEFF debe incluir la nota de depreciación acumulada correspondiente a todos los períodos reportados, así como las notas de las cuentas por cobrar corrientes y cuentas por pagar corrientes. La IA identificará y clasificará las cuentas para convertir automáticamente la información al formato de plantilla Excel utilizado por la plataforma.">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-valora-primary/5 text-[11px] font-bold text-valora-primary cursor-pointer select-none shrink-0"
                        aria-label="Ver ayuda de EEFF PDF"
                      >
                        <svg className="h-3 w-3 text-valora-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </span>
                    </Tooltip>
                  </div>
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handlePdfChange}
                  />
                </div>

              {(fileUploaded || formData.fileUsername || hasCalculated) && (
                <div className="relative rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 p-3 shadow-sm transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 self-center">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs self-center">
                        <i className="fa-solid fa-file-excel text-base"></i>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-emerald-800 tracking-wider uppercase">
                            Plantilla cargada
                          </span>
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 truncate max-w-[170px] sm:max-w-[210px]" title={formData.fileUsername}>
                          {formData.fileUsername || "PlantillaEEFF.xlsx"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {uploadedFileUrl && (
                        <a
                          href={uploadedFileUrl}
                          download={formData.fileUsername || undefined}
                          title="Descargar plantilla cargada"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100/60 hover:text-emerald-900 transition-colors shadow-2xs"
                          >
                            <i className="fa-solid fa-download text-xs"></i>
                          </a>
                      )}
                      {!hasCalculated && (
                        <button
                          type="button"
                          title="Importar otro archivo"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
                          onClick={handleOpenFilePicker}
                        >
                          <i className="fa-solid fa-file-arrow-up text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <FormField
                label="Número de Acciones"
                name="shares"
                type="number"
                step="any"
                value={formData.shares || ""}
                onChange={onInputChange}
                tooltip="Si no se cuenta con el número de acciones, se estimará usando el capital social y un valor nominal de 1 por acción"
                layout="horizontal"
                inputClassName="col-span-12"
                maxDecimals={2}
              />

              <FormField
                label="Moneda de EEFF"
                name="currency"
                type="select"
                value={formData.currency}
                options={currencies}
                required
                onChange={onInputChange}
                layout="horizontal"
                inputClassName="col-span-12"
              />
            </div>
          </FormSection>

          {/* Section 2: Industry inputs */}
          <FormSection
            step={2}
            title="Inputs de la industria"
            isCollapsed={collapsed.step2}
            onToggleCollapse={() => toggleCollapse("step2")}
            disabled={isSection2Disabled}
            disabledMessage="Sube y carga la plantilla EEFF primero"
          >
            <div className="flex flex-col gap-1">
              <FormField
                label="Fecha"
                name="date"
                type="select"
                value={formData.date}
                options={dates}
                required
                onChange={onInputChange}
                layout="horizontal"
                inputClassName="col-span-12"
                disabled={isSection2Disabled}
              />
              <FormField
                label="Sector"
                name="sector"
                type="select"
                value={formData.sector}
                options={sectors}
                translations={industryTranslations}
                required
                onChange={onInputChange}
                layout="horizontal"
                inputClassName="col-span-18"
                disabled={isSection2Disabled}
              />

              <div className="relative w-full border border-transparent">
                <FormField
                  label="Beta desapalancado"
                  name="beta_unlevered_industry"
                  type="number"
                  step="any"
                  value={
                    formData.beta_subsector || formData.beta_unlevered_industry || ""
                  }
                  disabled={!hasCalculated}
                  onChange={onInputChange}
                  suffix="coef."
                  layout="horizontal"
                  showClearButton={false}
                  inputClassName="col-span-9"
                />
                <div className="absolute right-0 top-0 bottom-0 w-[27%] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleSearchSectorBeta}
                    disabled={
                      isSearchingBeta || !formData.sector || isSection2Disabled || !hasCalculated
                    }
                    className={cn(
                      "text-[10px] w-full h-10 py-0.5 px-1 rounded-sm text-wrap font-bold cursor-pointer flex items-center justify-center text-center leading-tight tracking-wider",
                      "text-valora-primary bg-white border border-valora-primary focus:outline-none",
                      "disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                  >
                    {isSearchingBeta ? "Buscando..." : "Obtén Tu Beta Por Subsector"}
                  </button>
                </div>
              </div>

              <FormField
                label="Tasa libre de riesgo"
                name="instrument"
                type="select"
                value={formData.instrument || ""}
                options={instruments}
                required
                onChange={onInputChange}
                layout="horizontal"
                inputClassName="col-span-18"
                disabled={isSection2Disabled}
              />
              <FormField
                label="Duración"
                name="bono"
                type="select"
                value={formData.bono || ""}
                options={bonos}
                translations={bonosTranslations}
                required
                onChange={onInputChange}
                layout="horizontal"
                inputClassName="col-span-12"
                showClearButton={false}
                disabled={isSection2Disabled}
              />
            </div>
          </FormSection>

          {/* Section 3: Sector inputs */}
          <FormSection
            step={3}
            title="Inputs del sector"
            isCollapsed={collapsed.step3}
            onToggleCollapse={() => toggleCollapse("step3")}
            disabled={isSection3Disabled}
            disabledMessage="Completa los Inputs del sector primero"
          >
            <div className="flex flex-col gap-1">
              <FormField
                label="País"
                name="country"
                type="select"
                value={formData.country}
                options={countries}
                translations={countriesTranslations}
                required
                onChange={onInputChange}
                layout="horizontal"
                inputClassName="col-span-11"
                disabled={isSection3Disabled}
              />
              <FormField
                label="Devaluación"
                name="devaluation"
                type="number"
                step="any"
                value={formData.devaluation || ""}
                onChange={onInputChange}
                suffix="%"
                tooltip="Obtenido de Marco Macroeconómico Multianual por país"
                layout="horizontal"
                showClearButton={false}
                inputClassName="col-span-8"
                disabled
              />
              <FormField
                label="Tasa impositiva"
                name="tax"
                type="number"
                step="any"
                value={formData.tax || ""}
                onChange={onInputChange}
                suffix="%"
                tooltip="IR declarado por cada país. Reporte EY."
                layout="horizontal"
                showClearButton={false}
                inputClassName="col-span-8"
                disabled
              />
            </div>
          </FormSection>

          {/* Section 4: Company inputs */}
          <FormSection
            step={4}
            title="Inputs de su empresa"
            isCollapsed={collapsed.step4}
            onToggleCollapse={() => toggleCollapse("step4")}
            toggle={formData.typeId}
            onToggle={() =>
              onInputChange({
                target: { name: "typeId", value: !formData.typeId },
              } as any)
            }
            disabled={isSection4Disabled}
            disabledMessage="Completa los Inputs de la industria y del sector primero"
          >
            <div className="flex flex-col gap-1">
              <FormField
                label="Costo de Deuda de la Empresa"
                name="kd"
                type="number"
                step="any"
                min={0}
                max={100}
                value={formData.kd || ""}
                onChange={onInputChange}
                suffix="%"
                tooltip="Calculado a partir de Gasto Financiero/Deuda Financiera"
                layout="horizontal"
                showClearButton={false}
                inputClassName="col-span-12"
                prefixSelect={{
                  name: "currency",
                  value: formData.currency,
                  options: kdCurrencyOptions,
                }}
                maxDecimals={2}
                disabled={isSection4Disabled}
              />
              <FormField
                label="% de Deuda"
                name="debt"
                type="number"
                step="any"
                min={0}
                max={100}
                value={formData.debt || ""}
                onChange={onInputChange}
                suffix="%"
                tooltip="Pasivo Financiero / (Pasivo Financiero/Patrimonio)"
                layout="horizontal"
                showClearButton={false}
                inputClassName="col-span-8"
                maxDecimals={2}
                disabled={isSection4Disabled}
              />
              <FormField
                label="% de Capital"
                name="capital"
                type="number"
                step="any"
                min={0}
                max={100}
                value={formData.capital || ""}
                onChange={onInputChange}
                suffix="%"
                tooltip="Patrimonio / (Pasivo Financiero/Patrimonio)"
                layout="horizontal"
                showClearButton={false}
                inputClassName="col-span-8"
                maxDecimals={2}
                disabled={isSection4Disabled}
              />
            </div>
          </FormSection>

          {/* Section 5: Sensibilización */}
          {hasCalculated && (
            <FormSection
              step={5}
              title="Sensibilización"
              isCollapsed={collapsed.step5}
              onToggleCollapse={() => toggleCollapse("step5")}
            >
              <div className="flex flex-col gap-3">
                {/* Header con descripción y botón IA */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-1">
                  <p className="text-sm text-gray-600 pt-1">
                    Ajusta las tasas para ver el impacto en la valoración
                  </p>

                  {onGetAIRecommendations && (
                    <div className="flex flex-col items-end gap-1.5 relative">
                      <button
                        type="button"
                        onClick={onGetAIRecommendations}
                        disabled={isLoadingAI || !currentCalculationId}
                        className={cn(
                          "btn-ai-mesh px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold text-xs relative z-10",
                          "disabled:cursor-not-allowed"
                        )}
                      >
                        {isLoadingAI ? (
                          <span key="loading" className="ai-fade-up">
                            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Analizando...
                          </span>
                        ) : (
                          <span key="idle" className="ai-fade-up">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10 3L12 8L17 10L12 12L10 17L8 12L3 10L8 8L10 3Z" fill="currentColor"/>
                              <path d="M18 16L19 19L22 20L19 21L18 24L17 21L14 20L17 19L18 16Z" fill="currentColor"/>
                            </svg>
                            Recomendar con IA
                          </span>
                        )}
                      </button>

                      {/* Indicador Thinking */}
                      {isLoadingAI && (
                        <div className="ai-thinking-indicator">
                          <div className="ai-thinking-dot" />
                          <span>Pensando...</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Inputs de sensibilidad */}
                <div className="space-y-4 pt-1">
                  <SensitivityRow
                    label="Tasa Forecast Ingresos"
                    name="revenue_forecast_rate"
                    suffix="%"
                    value={formData.revenue_forecast_rate || ""}
                    onChange={onInputChange}
                    isLoadingAI={isLoadingAI}
                    aiTooltip={buildAiTooltip(
                      aiAnalysis,
                      "forecast_ingresos_1er_periodo",
                      rateSources.forecast_ingresos_1er_periodo
                    )}
                  />
                  <SensitivityRow
                    label="Tasa Forecast FDC"
                    name="fdc_forecast_rate"
                    suffix="%"
                    value={formData.fdc_forecast_rate || ""}
                    onChange={onInputChange}
                    isLoadingAI={isLoadingAI}
                    aiTooltip={buildAiTooltip(
                      aiAnalysis,
                      "forecast_fde_1er_periodo",
                      rateSources.forecast_fde_1er_periodo
                    )}
                  />
                  <SensitivityRow
                    label="Tasa de Crecimiento Perpetuo"
                    name="perpetual_growth_rate"
                    suffix="%"
                    value={formData.perpetual_growth_rate || ""}
                    onChange={onInputChange}
                    isLoadingAI={isLoadingAI}
                    aiTooltip={buildAiTooltip(
                      aiAnalysis,
                      "crecimiento_perpetuo",
                      rateSources.crecimiento_perpetuo
                    )}
                  />
                </div>
              </div>
            </FormSection>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 transition-all duration-300 w-full">
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "cursor-pointer w-full py-3 px-6 rounded-lg font-bold text-xs md:text-sm transition-all duration-200",
            loading
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-valora-primary text-white hover:bg-valora-secondary shadow-lg hover:shadow-xl active:scale-95"
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Calculando...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

const SOURCE_LABELS: Record<string, string> = {
  ai_estimation: "Estimación con IA",
  excel_cache: "Leído de la plantilla Excel",
  financial_data_cagr: "CAGR de tus estados financieros",
  historical_mean: "Media histórica de la plantilla",
  inflation_driver: "Inflación del driver",
  "default_2.5%": "Valor por defecto conservador (2.5%)",
  empty: "Sin dato disponible (revisión manual)",
};

const buildAiTooltip = (
  aiAnalysis: ValoraAiAnalysis | null,
  rateKey: string,
  source?: string | null
): string | null => {
  const rate = aiAnalysis?.analysis?.rates?.[rateKey];
  const sourceLabel = source ? SOURCE_LABELS[source] ?? source : null;

  const parts: string[] = [];

  if (rate?.outlier) {
    parts.push(
      `⚠️ Valor atípico: ${rate.outlier_reason || "revisa este valor manualmente."}`
    );
  }

  if (rate?.explanation) {
    parts.push(rate.explanation);
  } else if (sourceLabel) {
    parts.push(`No hay explicación IA disponible para esta tasa.`);
  }

  if (sourceLabel) {
    parts.push(`Fuente: ${sourceLabel}`);
  }

  const { min, max } = rate?.suggested_range ?? {};
  if (typeof min === "number" && typeof max === "number") {
    const fmt = (n: number) => `${(n * 100).toFixed(1).replace(/\.0$/, "")}%`;
    parts.push(`Rango sugerido: ${fmt(min)} – ${fmt(max)}`);
  }

  return parts.length ? parts.join("\n\n") : null;
};

interface SensitivityRowProps {
  label: string;
  name: keyof FormData;
  suffix: React.ReactNode;
  value: string;
  disabled?: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSearchRate?: (name: keyof FormData) => void;
  isLoadingAI?: boolean;
  aiTooltip?: string | null;
}

const SensitivityRow: React.FC<SensitivityRowProps> = ({
  label,
  name,
  suffix,
  value,
  disabled,
  onChange,
  onSearchRate,
  isLoadingAI = false,
  aiTooltip = null,
}) => {
  // Defensiva: asegurar que value siempre sea string
  const safeValue = typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
  if (typeof value !== "string" && typeof value !== "number") {
    console.warn(`[VALORA FORM] SensitivityRow '${name}' recibió valor no-string:`, value);
  }

  return (
    <div className={cn(
      "relative w-full transition-all duration-300",
      isLoadingAI && "opacity-80"
    )}>
        <FormField
          label={label}
          name={name}
          type="number"
          step="any"
          value={safeValue}
          onChange={onChange}
          suffix={suffix}
          layout="horizontal"
          showClearButton={false}
          tooltip={aiTooltip || undefined}
          inputClassName={cn(
            "sens-input",
            onSearchRate ? "col-span-9" : "col-span-12",
            isLoadingAI && "ai-input-glow"
          )}
          disabled={disabled || isLoadingAI}
        />

      {onSearchRate && (
        <div className="absolute right-0 top-0 bottom-0 w-[27%] flex items-center justify-end pr-1">
          <button
            type="button"
            onClick={() => onSearchRate(name)}
            disabled={disabled || isLoadingAI}
            className={cn(
              "text-[10px] w-full h-9 py-0.5 px-1 rounded-md text-wrap font-bold cursor-pointer flex items-center justify-center text-center leading-tight tracking-wider transition-all",
              "text-valora-primary bg-white/90 border border-valora-primary/80 focus:outline-none",
              "hover:bg-valora-primary/5 hover:border-valora-primary",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            Obtén tu Tasa
          </button>
        </div>
      )}
    </div>
  );
};
