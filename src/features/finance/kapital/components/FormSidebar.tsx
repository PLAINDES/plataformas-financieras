import { useState, useRef, useEffect } from "react";
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
  canSensibilizeBeta: boolean;
  dates: string[];
  sectors: string[];
  instruments: string[];
  bonos: string[];
  countries: string[];
  industryTranslations: Record<string, string>;
  bonosTranslations: Record<string, string>;
  countriesTranslations: Record<string, string>;
  countryLocalCurrencies: Record<string, string>;
  chatbotComponent?: React.ReactNode;
  onSearchSectorBeta: () => void;
  isSearchingBeta: boolean;
}

export const FormSidebar: React.FC<FormSidebarProps> = ({
  formData,
  onInputChange,
  onSubmit,
  loading,
  isWaccCalculated,
  canSensibilizeBeta,
  dates,
  sectors,
  instruments,
  bonos,
  countries,
  industryTranslations,
  bonosTranslations,
  countriesTranslations,
  countryLocalCurrencies,
  onSearchSectorBeta,
  isSearchingBeta,
}) => {
  const [collapsed, setCollapsed] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
  });
  const hasAutoCollapsed = useRef(false);
  const toggleCollapse = (step: "step1" | "step2" | "step3" | "step4") => {
    setCollapsed((prev) => ({ ...prev, [step]: !prev[step] }));
  };

  useEffect(() => {
    if (isWaccCalculated && !hasAutoCollapsed.current) {
      setCollapsed({ step1: false, step2: false, step3: false, step4: false });

      hasAutoCollapsed.current = true;
    }
  }, [isWaccCalculated]);

  const handleCustomInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onInputChange(e);
  };

  const dynamicCurrenciesList = (() => {
    const localCode = formData.country
      ? countryLocalCurrencies[formData.country]
      : null;
    if (!localCode || localCode === "USD") {
      return ["USD"];
    }
    return ["USD", localCode];
  })();

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
            <div className="flex gap-1 flex-col">
              <FormField
                label="Fecha"
                name="date"
                type="select"
                value={formData.date}
                onChange={handleCustomInputChange}
                options={dates}
                layout="horizontal"
                inputClassName="col-span-12"
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
                //disabled={hasSensibilizaciones || isWaccCalculated}
                layout="horizontal"
                inputClassName="col-span-18"
                required
              />
              <div className="relative w-full">
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
                  inputClassName="col-span-9"
                />
                {isWaccCalculated && canSensibilizeBeta && (
                  <div className="absolute right-0 top-0 bottom-0 w-[27%] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={onSearchSectorBeta}
                      disabled={isSearchingBeta || !formData.sector}
                      className="text-[11px] w-25 h-10 py-0.5 px-1 rounded-sm text-wrap font-bold text-white bg-valora-primary hover:bg-valora-secondary disabled:text-gray-100 transition-colors cursor-pointer"
                    >
                      {isSearchingBeta
                        ? "Buscando..."
                        : "Busca tu beta específico"}
                    </button>
                  </div>
                )}
              </div>
              <FormField
                label="Tasa libre de riesgo"
                name="instrument"
                type="select"
                value={formData.instrument}
                onChange={handleCustomInputChange}
                options={instruments}
                layout="horizontal"
                inputClassName="col-span-18"
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
                inputClassName="col-span-12"
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
            <section className="flex gap-1 flex-col">
              <FormField
                label="País"
                name="country"
                type="select"
                value={formData.country}
                onChange={handleCustomInputChange}
                options={countries}
                translations={countriesTranslations}
                layout="horizontal"
                inputClassName="col-span-11"
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
                inputClassName="col-span-8"
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
                inputClassName="col-span-8"
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
            <section className="flex gap-1 flex-col">
              {/* Costo de deuda con selector de moneda */}
              <FormField
                label="Costo de deuda | Empresa"
                name="kd"
                type="number"
                min={0}
                max={100}
                step="any"
                value={formData.kd}
                onChange={handleCustomInputChange}
                placeholder=""
                suffix="%"
                layout="horizontal"
                showClearButton={false}
                maxDecimals={2}
                inputClassName="col-span-12"
                prefixSelect={{
                  name: "currency",
                  value: formData.currency,
                  options: dynamicCurrenciesList,
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
                suffix="%"
                layout="horizontal"
                maxDecimals={0}
                inputClassName="col-span-6"
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
                suffix="%"
                layout="horizontal"
                inputClassName="col-span-6"
                showClearButton={false}
              />
            </section>
          </FormSection>
          {/* Section 4: Sensibilizaciones */}
          {isWaccCalculated && canSensibilizeBeta && (
            <FormSection
              title="Sensibiliza tu Beta"
              step={4}
              isCollapsed={collapsed.step4}
              onToggleCollapse={() => toggleCollapse("step4")}
              toggle={formData.typeId}
              onToggle={() => toggleCollapse("step1")}
            >
              <section className="flex gap-1 flex-col">
                <FormField
                  label="Beta desapalancado"
                  name="beta_unlevered"
                  type="number"
                  step="any"
                  value={formData.beta_unlevered || ""}
                  onChange={handleCustomInputChange}
                  layout="horizontal"
                  inputClassName="col-span-6"
                  showClearButton={true}
                  maxDecimals={2}
                />
              </section>
            </FormSection>
          )}
          {/* {chatbotComponent} */}
        </div>

        {/* Footer - Submit Button */}
        <div
          className={`sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 transition-all duration-300 w-full`}
        >
          <button
            type="submit"
            form="wacc-form"
            disabled={loading}
            className={`
                cursor-pointer w-full py-3 px-6 rounded-lg font-bold text-xs md:text-sm transition-all duration-200 
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
