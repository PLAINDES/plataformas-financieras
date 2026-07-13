import { BarChart3, PieChart } from "lucide-react";
import { ValoraResultsHeader } from "./ValoraResultsHeader";
import { ValoraMethodSummaryCard } from "./ValoraMethodSummaryCard";
import { ValoraBalanceSheetBlock } from "./ValoraBalanceSheetBlock";

export interface ValoraGeneralResultsBlockProps {
  onSensibilidadClick?: () => void;
  wacc?: number;
  hideButton?: boolean;
}

export const ValoraGeneralResultsBlock: React.FC<ValoraGeneralResultsBlockProps> = ({
  onSensibilidadClick,
  wacc = 14,
  hideButton = false,
}) => (
  <div className="flex flex-col gap-6">
    <ValoraResultsHeader
      wacc={wacc}
      title="Resultados generales"
      subtitle="Comparación de resultados"
      onSensibilidadClick={onSensibilidadClick}
      hideButton={hideButton}
    />

    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/3 flex flex-col gap-6">
        <ValoraMethodSummaryCard
          icon={PieChart}
          headerText="Método por Conceptos"
          empresaValue={2259768}
          patrimonioValue={14056078}
          accionValue={22.6}
        />
        <ValoraMethodSummaryCard
          icon={BarChart3}
          headerText="Método Integrado"
          empresaValue={2285958}
          patrimonioValue={15045999}
          accionValue={22.86}
        />
      </div>

      <div className="lg:w-2/3">
        <ValoraBalanceSheetBlock
          activo={12231540}
          pasivo={9979152}
          patrimonio={2252388}
          conceptosPatrimonio={14056078}
          integradoPatrimonio={15045999}
        />
      </div>
    </div>
  </div>
);
