import { Sparkles, ArrowRight } from "lucide-react";

export interface ValoraResultsHeaderProps {
  wacc: number;
  title: string;
  subtitle: string;
  onSensibilidadClick?: () => void;
  hideButton?: boolean;
}

export const ValoraResultsHeader: React.FC<ValoraResultsHeaderProps> = ({
  wacc,
  title,
  subtitle,
  onSensibilidadClick,
  hideButton = false,
}) => (
  <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow p-4">
    {hideButton ? (
      <div className="w-full md:w-auto" />
    ) : (
      <button
        type="button"
        onClick={onSensibilidadClick}
        className="flex items-center justify-between gap-3 px-4 py-2.5 bg-valora-primary text-white rounded-xl hover:bg-valora-secondary transition-colors w-full md:w-auto cursor-pointer"
      >
        <span className="flex items-center gap-2 text-xs font-bold">
          <Sparkles className="h-4 w-4 shrink-0" />
          Sensibiliza tus parámetros
        </span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </button>
    )}

    <div className="text-center">
      <h1 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h1>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>

    <div className="px-4 py-2 bg-blue-50 text-valora-primary rounded-full text-sm font-bold border border-valora-primary/20 whitespace-nowrap">
      WACC {wacc}%
    </div>
  </header>
);
