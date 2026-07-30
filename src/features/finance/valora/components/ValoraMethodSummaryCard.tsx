import type { LucideIcon } from "lucide-react";

export interface ValoraMethodSummaryCardProps {
  headerText: string;
  empresaValue: number;
  patrimonioValue: number;
  accionValue: number;
  icon: LucideIcon;
  selected?: boolean;
  onClick?: () => void;
}

const formatNumber = (value: number, decimals = 0) =>
  value.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const ValoraMethodSummaryCard: React.FC<ValoraMethodSummaryCardProps> = ({
  headerText,
  empresaValue,
  patrimonioValue,
  accionValue,
  icon: Icon,
  selected = false,
  onClick,
}) => {
  const headerClass = selected
    ? "bg-blue-600/10 text-blue-600"
    : "bg-[#f5f8fa] text-gray-800";
  const iconClass = selected ? "text-blue-600" : "text-[#a1a5b7]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col rounded-lg shadow bg-white overflow-hidden text-left transition-all cursor-pointer w-full ${
        selected ? "ring-2 ring-blue-600 shadow-lg" : "hover:shadow-md"
      }`}
    >
      <div className={`flex items-center gap-3 py-4 px-6 ${headerClass}`}>
        <Icon className={`h-6 w-6 shrink-0 ${iconClass}`} />
        <span className="text-sm sm:text-base font-bold uppercase tracking-tight">
          {headerText}
        </span>
      </div>
      <div className="px-6 py-5 flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <span className="text-xs sm:text-sm font-bold text-gray-600">
            VALOR DE LA EMPRESA
          </span>
          <span className="text-base sm:text-lg font-bold text-red-500">
            {formatNumber(empresaValue)}
          </span>
        </div>
        <div className="flex justify-between items-center border-b border-gray-200 pb-3">
          <span className="text-xs sm:text-sm font-bold text-gray-600">
            VALOR DEL PATRIMONIO
          </span>
          <span className="text-base sm:text-lg font-bold text-green-500">
            {formatNumber(patrimonioValue)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm font-bold text-gray-600">
            PRECIO POR ACCIÓN
          </span>
          <span className="text-base sm:text-lg font-bold text-blue-500">
            {formatNumber(accionValue, 2)}
          </span>
        </div>
      </div>
    </button>
  );
};
