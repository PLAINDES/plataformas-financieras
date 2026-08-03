import { useState } from "react";
import { BarChart3, PieChart } from "lucide-react";
import { ValoraResultsHeader } from "./ValoraResultsHeader";
import { ValoraBalanceSheetBlock } from "./ValoraBalanceSheetBlock";
import { ValoraMethodsToggleCard } from "./ValoraMethodsToggleCard";

export interface ValoraGeneralResultsBlockProps {
  onSensibilidadClick?: () => void;
  onOpenFormPanel?: () => void;
  wacc?: number;
  hideButton?: boolean;
}

type ChartMode = "default" | "conceptos" | "integrado";

export const ValoraGeneralResultsBlock: React.FC<ValoraGeneralResultsBlockProps> = ({
  onSensibilidadClick: _onSensibilidadClick,
  onOpenFormPanel,
  wacc = 14,
  hideButton = false,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>("default");

  const handleMethodClick = (method: "conceptos" | "integrado") => {
    setChartMode((prev) => (prev === method ? "default" : method));
  };

  const methods = [
    {
      id: "conceptos" as const,
      headerText: "Método por Conceptos",
      empresaValue: 2259768,
      patrimonioValue: 14056078,
      accionValue: 22.6,
      tasaForecast: 10.84,
      tasaForecastLabel: "Tasa de crecimiento ingresos forecast primer periodo",
      tasaPerpetua: 2,
      icon: PieChart,
      buttonColor: "orange" as const,
    },
    {
      id: "integrado" as const,
      headerText: "Método Integrado",
      empresaValue: 2285958,
      patrimonioValue: 15045999,
      accionValue: 22.86,
      tasaForecast: 19.39,
      tasaForecastLabel: "Tasa de crecimiento FCE forecast primer periodo",
      tasaPerpetua: 2,
      icon: BarChart3,
      buttonColor: "blue" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ValoraResultsHeader
        wacc={wacc}
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
            activo={12231540}
            pasivo={9979152}
            patrimonio={2252388}
            conceptosPatrimonio={14056078}
            integradoPatrimonio={15045999}
            conceptosEmpresa={2259768}
            integradoEmpresa={2285958}
            variant={chartMode}
          />
        </div>
      </div>
    </div>
  );
};
