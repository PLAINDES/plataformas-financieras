import { ValoraGeneralResultsBlock } from "./ValoraGeneralResultsBlock";
import { ValoraBVLBox } from "./ValoraBVLBox";

export interface ValoraResultadosSectionProps {
  onOpenSensibilidad?: () => void;
}

export const ValoraResultadosSection: React.FC<ValoraResultadosSectionProps> = ({
  onOpenSensibilidad,
}) => (
  <div className="flex flex-col gap-6">
    <ValoraGeneralResultsBlock
      onSensibilidadClick={onOpenSensibilidad}
      wacc={14}
    />
    <ValoraBVLBox />
  </div>
);
