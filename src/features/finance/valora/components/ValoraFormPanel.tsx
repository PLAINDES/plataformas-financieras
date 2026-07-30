import React, { useEffect, useMemo, useRef, useState } from "react";

import { IconActionButton } from "../../../../shared/components/ui/IconActionButton";
import { FormField } from "../../components/FormField";
import { FormSection } from "../../components/FormSection";
import { cn } from "@/lib/utils";
import type { FormData } from "@/shared/types/ValoraTypes";

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
  onClearUploadedFile: () => void;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDownloadTemplate: () => void;
  onUploadTemplate: (file: File) => void;
  onSearchSectorBeta?: () => void;
  isSearchingBeta?: boolean;
  loading?: boolean;
  hasCalculated?: boolean;
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
  onClearUploadedFile,
  onInputChange,
  onSubmit,
  onDownloadTemplate,
  onUploadTemplate,
  onSearchSectorBeta,
  isSearchingBeta = false,
  loading = false,
  hasCalculated = false,
}) => {
  const [collapsed, setCollapsed] = useState({
    step1: false,
    step2: true,
    step3: true,
    step4: true,
    step5: true,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadTemplate(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
                      value=""
                      className="hidden"
                      required
                    />
                  )}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
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

              {(fileUploaded || formData.fileUsername || hasCalculated) && (
                <div className="relative rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 to-teal-50/70 p-3 shadow-sm transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
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
                          title="Eliminar plantilla"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-rose-200 text-rose-500 hover:bg-rose-100/60 hover:text-rose-700 transition-colors shadow-2xs cursor-pointer"
                          onClick={onClearUploadedFile}
                        >
                          <i className="fa-solid fa-trash-can text-xs"></i>
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
                label="Moneda"
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
                  disabled
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
                      isSearchingBeta || !formData.sector || isSection2Disabled
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
                label="Año del bono"
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

          {/* Section 5: Sensibilización - visible only after first calculation */}
          {hasCalculated && (
            <FormSection
              step={5}
              title="Sensibilización"
              isCollapsed={collapsed.step5}
              onToggleCollapse={() => toggleCollapse("step5")}
            >
              <div className="flex flex-col gap-2">
                <SensitivityRow
                  label="Tasa Forecast Ingresos"
                  name="revenue_forecast_rate"
                  suffix="%"
                  value={formData.revenue_forecast_rate || ""}
                  onChange={onInputChange}
                />
                <SensitivityRow
                  label="Tasa Forecast FDC"
                  name="fdc_forecast_rate"
                  suffix="%"
                  value={formData.fdc_forecast_rate || ""}
                  onChange={onInputChange}
                />
                <SensitivityRow
                  label="Tasa de Crecimiento Perpetuo"
                  name="perpetual_growth_rate"
                  suffix="%"
                  value={formData.perpetual_growth_rate || ""}
                  onChange={onInputChange}
                />
                <SensitivityRow
                  label="Beta Desapalancado"
                  name="beta_unlevered_sensitivity"
                  suffix="Coef."
                  value={formData.beta_unlevered_sensitivity || ""}
                  onChange={onInputChange}
                />
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
}

const SensitivityRow: React.FC<SensitivityRowProps> = ({
  label,
  name,
  suffix,
  value,
  disabled,
  onChange,
  onSearchRate,
}) => (
  <div className="relative w-full border border-transparent">
    <FormField
      label={label}
      name={name}
      type="number"
      step="any"
      value={value}
      onChange={onChange}
      suffix={suffix}
      layout="horizontal"
      showClearButton={false}
      inputClassName={onSearchRate ? "col-span-9" : "col-span-12"}
      disabled={disabled}
    />
    {onSearchRate && (
      <div className="absolute right-0 top-0 bottom-0 w-[27%] flex items-center justify-end">
        <button
          type="button"
          onClick={() => onSearchRate(name)}
          disabled={disabled}
          className={cn(
            "text-[10px] w-full h-10 py-0.5 px-1 rounded-sm text-wrap font-bold cursor-pointer flex items-center justify-center text-center leading-tight tracking-wider",
            "text-valora-primary bg-white border border-valora-primary focus:outline-none",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          Obtén tu Tasa
        </button>
      </div>
    )}
  </div>
);
