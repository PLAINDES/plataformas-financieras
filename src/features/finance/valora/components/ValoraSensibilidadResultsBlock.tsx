import { useState } from "react";
import { BarChart3, PieChart } from "lucide-react";
import { ValoraResultsHeader } from "./ValoraResultsHeader";
import { ValoraSensibilidadBalanceSheetBlock } from "./ValoraSensibilidadBalanceSheetBlock";
import { ValoraMethodsToggleCard } from "./ValoraMethodsToggleCard";

export interface ValoraSensibilidadResultsBlockProps {
  onOpenFormPanel?: () => void;
  sector?: string;
}

type ChartMode = "default" | "conceptos" | "integrado";

export const ValoraSensibilidadResultsBlock: React.FC<
  ValoraSensibilidadResultsBlockProps
> = ({ onOpenFormPanel: _onOpenFormPanel, sector }) => {
  const [chartMode, setChartMode] = useState<ChartMode>("default");

  const handleMethodClick = (method: "conceptos" | "integrado") => {
    setChartMode((prev) => (prev === method ? "default" : method));
  };

  const methods = [
    {
      id: "conceptos" as const,
      headerText: "Método por Conceptos Sensibilizado",
      empresaValue: 2612926,
      patrimonioValue: 9000000,
      accionValue: 24.6,
      tasaForecast: 10.84,
      tasaForecastLabel: "Tasa de crecimiento ingresos forecast primer periodo",
      tasaPerpetua: 2,
      icon: PieChart,
      buttonColor: "orange" as const,
    },
    {
      id: "integrado" as const,
      headerText: "Método Integrado Sensibilizado",
      empresaValue: 2585958,
      patrimonioValue: 17045999,
      accionValue: 24.86,
      tasaForecast: 19.39,
      tasaForecastLabel: "Tasa de crecimiento FCE forecast primer periodo",
      tasaPerpetua: 2,
      icon: BarChart3,
      buttonColor: "blue" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ValoraResultsHeader
        wacc={14}
        title="Sensibilidad"
        subtitle="Resultados sensibilizados"
        sector={sector}
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
          <ValoraSensibilidadBalanceSheetBlock
            activo={12231540}
            pasivo={9979152}
            patrimonio={2252388}
            conceptosPatrimonioEsperado={14056078}
            conceptosPatrimonioSensibilizado={9056078}
            integradoPatrimonioEsperado={15045999}
            integradoPatrimonioSensibilizado={17045999}
            conceptosEmpresaEsperado={2259768}
            conceptosEmpresaSensibilizado={2612926}
            integradoEmpresaEsperado={2285958}
            integradoEmpresaSensibilizado={2585958}
            variant={chartMode}
          />
        </div>
      </div>
    </div>
  );
};
