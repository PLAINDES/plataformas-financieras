import { useState } from "react";
import { BarChart3, PieChart } from "lucide-react";
import { ValoraResultsHeader } from "./ValoraResultsHeader";
import { ValoraBalanceSheetBlock } from "./ValoraBalanceSheetBlock";
import { ValoraMethodsToggleCard } from "./ValoraMethodsToggleCard";
import type { ValoraCalculationResults } from "@/shared/types/ValoraTypes";

export interface ValoraGeneralResultsBlockProps {
  onSensibilidadClick?: () => void;
  onOpenFormPanel?: () => void;
  results?: ValoraCalculationResults;
  hideButton?: boolean;
}

type ChartMode = "default" | "conceptos" | "integrado";

export const ValoraGeneralResultsBlock: React.FC<ValoraGeneralResultsBlockProps> = ({
  onSensibilidadClick: _onSensibilidadClick,
  onOpenFormPanel,
  results,
  hideButton = false,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>("default");

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

  const methods = [
    {
      id: "conceptos" as const,
      headerText: "Método por Conceptos",
      activoValue: parseNumber(results?.conceptos?.activo),
      pasivoValue: parseNumber(results?.conceptos?.pasivo),
      empresaValue: parseNumber(results?.conceptos?.empresa),
      patrimonioValue: parseNumber(results?.conceptos?.patrimonio),
      accionValue: parseNumber(results?.conceptos?.precio_accion),
      tasaForecast: parsePercentage(results?.conceptos?.tasa_forecast),
      tasaForecastLabel: "Tasa de crecimiento ingresos forecast primer periodo",
      tasaPerpetua: parsePercentage(results?.conceptos?.tasa_perpetua),
      icon: PieChart,
      buttonColor: "orange" as const,
    },
    {
      id: "integrado" as const,
      headerText: "Método Integrado",
      activoValue: parseNumber(results?.integrado?.activo),
      pasivoValue: parseNumber(results?.integrado?.pasivo),
      empresaValue: parseNumber(results?.integrado?.empresa),
      patrimonioValue: parseNumber(results?.integrado?.patrimonio),
      accionValue: parseNumber(results?.integrado?.precio_accion),
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
        onSensibilidadClick={() => {
          onOpenFormPanel?.();
        }}
        hideButton={hideButton}
      />

      <div className="flex flex-col lg:flex-row gap-4 h-[29rem] lg:h-[29rem]">
        <div className="lg:w-1/3 h-full">
          <ValoraMethodsToggleCard
            methods={methods}
            selectedMethod={chartMode === "default" ? "none" : chartMode}
            onSelectMethod={handleMethodClick}
          />
        </div>

        <div className="lg:w-2/3 h-full">
          <ValoraBalanceSheetBlock
            activo={parseNumber(results?.balance?.activo)}
            pasivo={parseNumber(results?.balance?.pasivo)}
            patrimonio={parseNumber(results?.balance?.patrimonio)}
            conceptosActivo={methods[0].activoValue}
            conceptosPasivo={methods[0].pasivoValue}
            conceptosPatrimonio={methods[0].patrimonioValue}
            integradoActivo={methods[1].activoValue}
            integradoPasivo={methods[1].pasivoValue}
            integradoPatrimonio={methods[1].patrimonioValue}
            conceptosEmpresa={methods[0].empresaValue}
            integradoEmpresa={methods[1].empresaValue}
            variant={chartMode}
          />
        </div>
      </div>
    </div>
  );
};
