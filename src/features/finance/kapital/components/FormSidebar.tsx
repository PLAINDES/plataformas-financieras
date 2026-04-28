import { useState } from "react";
import { FormField } from "../../components/FormField";
import { FormSection } from "../../components/FormSection";

interface FormSidebarProps {
  formData: any;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  isWaccCalculated: boolean;
  hasSensibilizaciones: boolean;
  dates: string[];
  sectors: string[];
  instruments: string[];
  bonos: string[];
  countries: string[];
  currencies: string[];
  industryTranslations: Record<string, string>;
  bonosTranslations: Record<string, string>;
  countriesTranslations: Record<string, string>;
}

export const FormSidebar: React.FC<FormSidebarProps> = ({
  formData,
  onInputChange,
  onSubmit,
  loading,
  isWaccCalculated,
  hasSensibilizaciones,
  dates,
  sectors,
  instruments,
  bonos,
  countries,
  currencies,
  industryTranslations,
  bonosTranslations,
  countriesTranslations,
}) => {
  const [collapsed, setCollapsed] = useState({ step1: false, step2: false });

  const toggleCollapse = (step: "step1" | "step2") => {
    setCollapsed((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  const handleCustomInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onInputChange(e);
  };

  return (
    <form id="wacc-form" onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 bg-white p-2 flex flex-col">
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-2">
          {/* Section 1: Industry */}
          <FormSection
            title="Inputs de la industria"
            step={1}
            isCollapsed={collapsed.step1}
            onToggleCollapse={() => toggleCollapse("step1")}
          >
            <div className="flex gap-2 flex-col">
              <FormField
                label="Fecha"
                name="date"
                type="select"
                value={formData.date}
                onChange={handleCustomInputChange}
                options={dates}
                required
              />
              <FormField
                label="Industria"
                name="sector"
                type="select"
                value={formData.sector}
                onChange={handleCustomInputChange}
                options={sectors}
                translations={industryTranslations}
                disabled={hasSensibilizaciones}
                required
              />
              <FormField
                label="Tasa libre de riesgo"
                name="instrument"
                type="select"
                value={formData.instrument}
                onChange={handleCustomInputChange}
                options={instruments}
                required
              />
              <FormField
                label="Año del bono"
                name="bono"
                type="select"
                value={formData.bono}
                onChange={handleCustomInputChange}
                options={bonos}
                translations={bonosTranslations}
                required
              />
            </div>
          </FormSection>

          {/* Section 2: Sector */}
          <FormSection
            title="Inputs del sector"
            step={2}
            isCollapsed={collapsed.step2}
            onToggleCollapse={() => toggleCollapse("step2")}
          >
            <div className="flex gap-2 flex-col">
              <FormField
                label="País"
                name="country"
                type="select"
                value={formData.country}
                onChange={handleCustomInputChange}
                options={countries}
                translations={countriesTranslations}
                required
              />
              <FormField
                label="Devaluación"
                name="devaluation"
                type="number"
                step="any"
                value={formData.devaluation}
                onChange={handleCustomInputChange}
                suffix="%"
                disabled
              />
              <FormField
                label="Tasa impositiva"
                name="tax"
                type="number"
                min={0}
                max={100}
                step="any"
                value={formData.tax}
                onChange={handleCustomInputChange}
                suffix="%"
                disabled
              />
            </div>
          </FormSection>

          {/* Section 3: Company */}
          <FormSection
            title="Inputs de su empresa"
            step={3}
            toggle={formData.typeId}
            onToggle={() =>
              handleCustomInputChange({
                target: { name: "typeId", value: !formData.typeId },
              } as any)
            }
          >
            <div className="flex gap-2 flex-col">
              {/* Costo de deuda con selector de moneda */}
              <FormField
                label="Costo de deuda"
                name="kd"
                type="number"
                min={0}
                step="any"
                value={formData.kd}
                onChange={handleCustomInputChange}
                placeholder="Ej: 8.5"
                suffix="%"
                prefixSelect={{
                  name: "currency",
                  value: formData.currency,
                  options: currencies,
                }}
              />

              <FormField
                label="% de deuda"
                name="debt"
                type="number"
                min={0}
                max={100}
                step="any"
                value={formData.debt}
                onChange={handleCustomInputChange}
                placeholder="Ej: 40"
                suffix="%"
              />
              <FormField
                label="% de capital"
                name="capital"
                type="number"
                min={0}
                max={100}
                step="any"
                value={formData.capital}
                onChange={handleCustomInputChange}
                placeholder="Ej: 60"
                suffix="%"
              />
            </div>
          </FormSection>

          {/* Section 4: Financial Data */}
          <FormSection
            title="Datos financieros optimizados"
            step={4}
            tooltip="Use el chatbot de análisis
                  financiero para obtener estos datos automáticamente."
          >
            <div className="flex gap-2 flex-col">
              {/* Info Alert */}
              {/*<div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                <svg
                  className="w-4 h-4 text-blue-600 shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Sugerencia:</strong> Use el chatbot de análisis
                  financiero para obtener estos datos automáticamente.
                </p>
              </div>*/}
              <FormField
                label="Beta Desapalancado"
                name="beta_unlevered"
                type="number"
                step="any"
                value={formData.beta_unlevered}
                onChange={handleCustomInputChange}
                placeholder="Ej: 0.9"
                suffix="coef."
                disabled={!isWaccCalculated}
                /*tooltip="Beta del sector sin apalancamiento financiero"*/
              />
            </div>
          </FormSection>
        </div>

        {/* Footer - Submit Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <button
            type="submit"
            form="wacc-form"
            disabled={loading}
            className={`
                cursor-pointer w-full py-3 px-6 rounded-lg font-bold text-sm transition-all duration-200
                ${
                  loading
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-valora-primary text-white hover:bg-valora-secondary shadow-lg hover:shadow-xl active:scale-95"
                }
              `}
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
              "CALCULA TU WACC"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
