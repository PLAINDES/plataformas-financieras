import { ValoraGeneralResultsBlock } from "./ValoraGeneralResultsBlock";
import { ValoraBVLBox } from "./ValoraBVLBox";
import type { ValoraCalculationResults } from "@/shared/types/ValoraTypes";

export interface ValoraResultadosSectionProps {
  onOpenSensibilidad?: () => void;
  onOpenFormPanel?: () => void;
  results?: ValoraCalculationResults;
}

export const ValoraResultadosSection: React.FC<ValoraResultadosSectionProps> = ({
  onOpenSensibilidad,
  onOpenFormPanel,
  results,
}) => (
  <div className="flex flex-col gap-6">
    <ValoraGeneralResultsBlock
      onSensibilidadClick={onOpenSensibilidad}
      onOpenFormPanel={onOpenFormPanel}
      results={results}
    />
    <ValoraBVLBox />
  </div>
);
