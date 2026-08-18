import { useEffect, useState } from "react";
import { ArrowRight, BarChart3, PieChart, Sparkles } from "lucide-react";
import { ValoraResultsHeader } from "./ValoraResultsHeader";
import { ValoraBalanceSheetBlock } from "./ValoraBalanceSheetBlock";
import { ValoraMethodsToggleCard } from "./ValoraMethodsToggleCard";
import type { ValoraCalculationResults } from "@/shared/types/ValoraTypes";

export interface ValoraGeneralResultsBlockProps {
  onOpenFormPanel?: () => void;
  results?: ValoraCalculationResults;
}

type ChartMode = "default" | "conceptos" | "integrado";

export const ValoraGeneralResultsBlock: React.FC<ValoraGeneralResultsBlockProps> = ({
  onOpenFormPanel,
  results,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>("default");
  const sourceCurrency = (results?.source_currency ?? results?.inputs?.moneda ?? "USD").toUpperCase();
  const [resultCurrency, setResultCurrency] = useState(sourceCurrency);
  const fxToUsd = sourceCurrency === "USD" ? 1 : results?.fx_to_usd;
  const availableCurrencies = sourceCurrency === "USD" || !fxToUsd
    ? [sourceCurrency]
    : [sourceCurrency, "USD"];

  useEffect(() => {
    setResultCurrency(sourceCurrency);
  }, [sourceCurrency]);

  const handleMethodClick = (method: "conceptos" | "integrado") => {
    setChartMode((prev) => (prev === method ? "default" : method));
  };

  const parseNumber = (value: string | number | null | undefined) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (!value) return null;

    const raw = value.trim().replace(/[^0-9,.-]/g, "");
    if (!/[0-9]/.test(raw)) return null;

    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const normalized = raw.includes(",") && raw.includes(".")
      ? raw.replace(decimalSeparator === "," ? /\./g : /,/g, "").replace(decimalSeparator, ".")
      : raw.includes(",")
        ? raw.split(",").length > 2
          ? raw.replace(/,/g, "")
          : raw.replace(",", ".")
        : raw.includes(".") && raw.split(".").at(-1)!.length === 3
          ? raw.replace(/\./g, "")
          : raw;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parsePercentage = (value: string | number | null | undefined) => {
    const parsed = parseNumber(value);
    if (parsed === null) return null;
    return typeof value === "string" && value.includes("%") ? parsed : Math.abs(parsed) <= 1 ? parsed * 100 : parsed;
  };

  const parseMoney = (value: string | number | null | undefined) => {
    const parsed = parseNumber(value);
    if (parsed === null) return null;
    return resultCurrency === "USD" && sourceCurrency !== "USD" && fxToUsd
      ? parsed * fxToUsd
      : parsed;
  };

  const methods = [
    {
      id: "conceptos" as const,
      headerText: "Método por Conceptos",
      activoValue: parseMoney(results?.conceptos?.activo),
      pasivoValue: parseMoney(results?.conceptos?.pasivo),
      empresaValue: parseMoney(results?.conceptos?.empresa),
      patrimonioValue: parseMoney(results?.conceptos?.patrimonio),
      accionValue: parseMoney(results?.conceptos?.precio_accion),
      tasaForecast: parsePercentage(results?.conceptos?.tasa_forecast),
      tasaForecastLabel: "Tasa de crecimiento ingresos forecast primer periodo",
      tasaPerpetua: parsePercentage(results?.conceptos?.tasa_perpetua),
      icon: PieChart,
      buttonColor: "orange" as const,
    },
    {
      id: "integrado" as const,
      headerText: "Método Integrado",
      activoValue: parseMoney(results?.integrado?.activo),
      pasivoValue: parseMoney(results?.integrado?.pasivo),
      empresaValue: parseMoney(results?.integrado?.empresa),
      patrimonioValue: parseMoney(results?.integrado?.patrimonio),
      accionValue: parseMoney(results?.integrado?.precio_accion),
      tasaForecast: parsePercentage(results?.integrado?.tasa_forecast),
      tasaForecastLabel: "Tasa de crecimiento FCE forecast primer periodo",
      tasaPerpetua: parsePercentage(results?.integrado?.tasa_perpetua),
      icon: BarChart3,
      buttonColor: "blue" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ValoraResultsHeader
        wacc={parsePercentage(results?.wacc)}
        title="Resultados generales"
        subtitle="Comparación de resultados"
      />

      {onOpenFormPanel && (
        <div className="flex justify-center lg:justify-start">
          <button
            type="button"
            onClick={onOpenFormPanel}
            className="px-4 py-2 flex items-center justify-between gap-3 text-left font-semibold transition-all shadow-md w-full sm:w-auto cursor-pointer bg-valora-primary text-white rounded-xl hover:bg-valora-secondary max-w-100"
          >
            <span className="flex items-center gap-3 text-[11px] sm:text-xs font-semibold leading-snug">
              <Sparkles className="h-5 w-5 shrink-0" />
              <span>Sensibiliza tus parámetros</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="lg:w-1/3">
          <ValoraMethodsToggleCard
            methods={methods}
            selectedMethod={chartMode === "default" ? "none" : chartMode}
            onSelectMethod={handleMethodClick}
          />
        </div>

        <div className="lg:w-2/3">
          <ValoraBalanceSheetBlock
            activo={parseMoney(results?.balance?.activo)}
            pasivo={parseMoney(results?.balance?.pasivo)}
            patrimonio={parseMoney(results?.balance?.patrimonio)}
            conceptosActivo={methods[0].activoValue}
            conceptosPasivo={methods[0].pasivoValue}
            conceptosPatrimonio={methods[0].patrimonioValue}
            integradoActivo={methods[1].activoValue}
            integradoPasivo={methods[1].pasivoValue}
            integradoPatrimonio={methods[1].patrimonioValue}
            conceptosEmpresa={methods[0].empresaValue}
            integradoEmpresa={methods[1].empresaValue}
            currency={resultCurrency}
            availableCurrencies={availableCurrencies}
            onCurrencyChange={setResultCurrency}
            variant={chartMode}
          />
        </div>
      </div>
    </div>
  );
};
