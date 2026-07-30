import { ValoraGeneralResultsBlock } from "./ValoraGeneralResultsBlock";
import { ValoraBVLBox } from "./ValoraBVLBox";

export interface ValoraResultadosSectionProps {
  onOpenSensibilidad?: () => void;
  onOpenFormPanel?: () => void;
}

export const ValoraResultadosSection: React.FC<ValoraResultadosSectionProps> = ({
  onOpenSensibilidad,
  onOpenFormPanel,
}) => (
  <div className="flex flex-col gap-6">
    <ValoraGeneralResultsBlock
      onSensibilidadClick={onOpenSensibilidad}
      onOpenFormPanel={onOpenFormPanel}
      wacc={14}
    />
    <ValoraBVLBox />
  </div>
);
