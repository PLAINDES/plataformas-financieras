import { ValoraGeneralResultsBlock } from "./ValoraGeneralResultsBlock";
import { ValoraBVLBox } from "./ValoraBVLBox";
import type { ValoraCalculationResults } from "@/shared/types/ValoraTypes";

export interface ValoraResultadosSectionProps {
  onOpenFormPanel?: () => void;
  results?: ValoraCalculationResults;
}

export const ValoraResultadosSection: React.FC<ValoraResultadosSectionProps> = ({
  onOpenFormPanel,
  results,
}) => (
  <div className="flex flex-col gap-6">
    <ValoraGeneralResultsBlock
      onOpenFormPanel={onOpenFormPanel}
      results={results}
    />
    <ValoraBVLBox />
  </div>
);
