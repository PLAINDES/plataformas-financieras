import { Sparkles, ArrowRight } from "lucide-react";

export interface ValoraResultsHeaderProps {
  wacc: number | null;
  title: string;
  subtitle: string;
  sector?: string;
  onSensibilidadClick?: () => void;
  hideButton?: boolean;
}

export const ValoraResultsHeader: React.FC<ValoraResultsHeaderProps> = ({
  wacc,
  title,
  subtitle,
  sector,
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
      {sector ? (
        <p className="text-xs font-bold text-gray-700 mt-0.5">{sector}</p>
      ) : (
        <p className="text-xs text-gray-500">{subtitle}</p>
      )}
    </div>

    <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-bold border border-purple-200 whitespace-nowrap">
      WACC {wacc === null ? "-" : `${wacc.toFixed(2)}%`}
    </div>
  </header>
);
