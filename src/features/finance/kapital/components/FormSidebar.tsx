import { useState, useRef, useEffect } from "react";
import { FormField } from "../../components/FormField";
import { FormSection } from "../../components/FormSection";
import { Bot } from "lucide-react";

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
  const [collapsed, setCollapsed] = useState({
    step1: false,
    step2: false,
    step3: false,
  });
  const hasAutoCollapsed = useRef(false);
  const toggleCollapse = (step: "step1" | "step2" | "step3") => {
    setCollapsed((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  useEffect(() => {
    if (isWaccCalculated && !hasAutoCollapsed.current) {
      setCollapsed({ step1: true, step2: true, step3: true });

      hasAutoCollapsed.current = true;
    }
  }, [isWaccCalculated]);

  const handleCustomInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onInputChange(e);
  };

  return (
    <form id="wacc-form" onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 min-h-0 bg-white p-2 pb-0 flex flex-col">
        <div className="flex-1 overflow-y-auto flex flex-col gap-2">
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
                layout="horizontal"
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
                disabled={hasSensibilizaciones || isWaccCalculated}
                layout="horizontal"
                required
              />
              <FormField
                label="Beta desapalancado"
                name="beta_unlevered_industry"
                type="number"
                step="any"
                value={formData.beta_unlevered_industry}
                onChange={handleCustomInputChange}
                suffix="coef."
                layout="horizontal"
                showClearButton={false}
                disabled
              />
              <FormField
                label="Tasa libre de riesgo"
                name="instrument"
                type="select"
                value={formData.instrument}
                onChange={handleCustomInputChange}
                options={instruments}
                layout="horizontal"
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
                layout="horizontal"
                showClearButton={false}
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
            <section className="flex gap-2 flex-col">
              <FormField
                label="País"
                name="country"
                type="select"
                value={formData.country}
                onChange={handleCustomInputChange}
                options={countries}
                translations={countriesTranslations}
                layout="horizontal"
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
                layout="horizontal"
                showClearButton={false}
                inputClassName="col-span-4"
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
                layout="horizontal"
                showClearButton={false}
                inputClassName="col-span-4"
                disabled
              />
            </section>
          </FormSection>

          {/* Section 3: Company */}
          <FormSection
            title="Inputs de su empresa"
            step={3}
            isCollapsed={collapsed.step3}
            onToggleCollapse={() => toggleCollapse("step3")}
            toggle={formData.typeId}
            onToggle={() =>
              handleCustomInputChange({
                target: { name: "typeId", value: !formData.typeId },
              } as any)
            }
          >
            <section className="flex gap-2 flex-col">
              {/* Costo de deuda con selector de moneda */}
              <FormField
                label="Costo de deuda"
                name="kd"
                type="number"
                min={0}
                max={200}
                step="any"
                value={formData.kd}
                onChange={handleCustomInputChange}
                placeholder="Ej: 8.5"
                suffix="%"
                layout="horizontal"
                showClearButton={false}
                maxDecimals={2}
                inputClassName=""
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
                layout="horizontal"
                maxDecimals={0}
                inputClassName="col-span-4"
                showClearButton={false}
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
                layout="horizontal"
                inputClassName="col-span-4"
                showClearButton={false}
              />
            </section>
          </FormSection>

          {/* Section 4: Financial Data */}
          {isWaccCalculated && (
            <FormSection
              title="Sensibiliza tu beta"
              step={4}
              tooltip="Use el chatbot de análisis financiero para obtener estos datos automáticamente."
            >
              <div className="flex gap-2 flex-col">
                <FormField
                  label="Beta Desapalancado"
                  name="beta_unlevered"
                  type="number"
                  min={0}
                  max={3}
                  maxDecimals={4}
                  step="any"
                  value={formData.beta_unlevered}
                  onChange={handleCustomInputChange}
                  placeholder="Ej: 0.9"
                  suffix={
                    <>
                      <Bot className="w-4 h-4 text-valora-primary" />
                      <span className="font-bold text-valora-primary">IA</span>
                    </>
                  }
                  layout="horizontal"
                  inputClassName="col-span-6"
                  disabled={!isWaccCalculated}
                  showClearButton={false}
                />
              </div>
            </FormSection>
          )}
        </div>

        {/* Footer - Submit Button */}
        <div
          className={`sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 transition-all duration-300 ${
            isWaccCalculated ? "max-[540px]:w-4/5" : "w-full"
          }`}
        >
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
            ) : isWaccCalculated ? (
              "COMPARAR TU WACC"
            ) : (
              "CALCULA TU WACC"
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
