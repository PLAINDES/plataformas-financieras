import type { LucideIcon } from "lucide-react";
import { CheckCircle2, ChevronRight } from "lucide-react";

export interface ValoraMethodData {
  id: "conceptos" | "integrado";
  headerText: string;
  empresaValue: number | null;
  patrimonioValue: number | null;
  accionValue: number | null;
  tasaForecast: number | null;
  tasaForecastLabel: string;
  tasaPerpetua: number | null;
  icon: LucideIcon;
  buttonColor: "orange" | "blue";
}

export interface ValoraMethodsToggleCardProps {
  methods: ValoraMethodData[];
  selectedMethod: "conceptos" | "integrado" | "none";
  onSelectMethod: (method: "conceptos" | "integrado") => void;
}

const formatNumber = (value: number | null, decimals = 0) => {
  if (value === null) return "-";
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const BasicDataRows = ({
  method,
}: {
  method: ValoraMethodData;
}) => (
  <div className="flex flex-col gap-0.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
    <div className="flex justify-between items-center border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Valor del Patrimonio
      </span>
      <span className="text-sm font-bold text-purple-700">
        {formatNumber(method.patrimonioValue)}
      </span>
    </div>
    <div className="flex justify-between items-center border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Valor de la Empresa
      </span>
      <span className="text-sm font-bold text-emerald-600">
        {formatNumber(method.empresaValue)}
      </span>
    </div>
    <div className="flex justify-between items-center py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Precio por Acción
      </span>
      <span className="text-sm font-bold text-blue-600">
        {formatNumber(method.accionValue, 2)}
      </span>
    </div>
  </div>
);

const ExpandedDataRows = ({
  method,
}: {
  method: ValoraMethodData;
}) => (
  <div className="flex flex-col gap-0.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
    <div className="flex justify-between items-center border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Valor del Patrimonio
      </span>
      <span className="text-sm font-bold text-purple-700">
        {formatNumber(method.patrimonioValue)}
      </span>
    </div>
    <div className="flex justify-between items-center border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Valor de la Empresa
      </span>
      <span className="text-sm font-bold text-emerald-600">
        {formatNumber(method.empresaValue)}
      </span>
    </div>
    <div className="flex justify-between items-center border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Precio por Acción
      </span>
      <span className="text-sm font-bold text-blue-600">
        {formatNumber(method.accionValue, 2)}
      </span>
    </div>
    <div className="flex justify-between items-center border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight leading-tight max-w-[70%]">
        {method.tasaForecastLabel}
      </span>
      <span className="text-sm font-bold text-blue-600">
        {method.tasaForecast === null ? "-" : `${method.tasaForecast.toFixed(2)}%`}
      </span>
    </div>
    <div className="flex justify-between items-center py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight leading-tight max-w-[70%]">
        Tasa de crecimiento perpetuo
      </span>
      <span className="text-sm font-bold text-red-500">
        {method.tasaPerpetua === null ? "-" : `${method.tasaPerpetua.toFixed(2)}%`}
      </span>
    </div>
  </div>
);

export const ValoraMethodsToggleCard: React.FC<ValoraMethodsToggleCardProps> = ({
  methods,
  selectedMethod,
  onSelectMethod,
}) => {
  const orderedMethods =
    selectedMethod === "integrado"
      ? [
          methods.find((m) => m.id === "integrado")!,
          methods.find((m) => m.id === "conceptos")!,
        ]
      : [
          methods.find((m) => m.id === "conceptos")!,
          methods.find((m) => m.id === "integrado")!,
        ];

  const buttonStyles = {
    orange: {
      default:
        "border border-orange-300 bg-white text-orange-950 hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-200 shadow-2xs",
      selected:
        "border-2 border-orange-500 bg-orange-50/90 text-orange-950 font-bold shadow-xs transition-all duration-200 ring-2 ring-orange-500/10",
    },
    blue: {
      default:
        "border border-blue-300 bg-white text-blue-950 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 shadow-2xs",
      selected:
        "border-2 border-blue-600 bg-blue-50/90 text-blue-950 font-bold shadow-xs transition-all duration-200 ring-2 ring-blue-600/10",
    },
  };

  return (
    <div className="flex flex-col rounded-2xl shadow-sm border border-gray-100 bg-white overflow-hidden h-full">
      <div className="p-5 flex flex-col gap-3 h-full">
        {orderedMethods.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isCollapsed = selectedMethod !== "none" && !isSelected;
          const styles = buttonStyles[method.buttonColor];
          const Icon = method.icon;

          return (
            <div key={method.id} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onSelectMethod(method.id)}
                className={`group w-full rounded-xl py-3 px-4 flex items-center justify-between transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                  isSelected ? styles.selected : styles.default
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
                      isSelected
                        ? method.buttonColor === "orange"
                          ? "bg-orange-500 text-white"
                          : "bg-blue-600 text-white"
                        : method.buttonColor === "orange"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wide">
                    {method.headerText}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {isSelected ? (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        method.buttonColor === "orange"
                          ? "bg-orange-100/80 text-orange-800 border-orange-200"
                          : "bg-blue-100/80 text-blue-800 border-blue-200"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${
                          method.buttonColor === "orange"
                            ? "text-orange-600"
                            : "text-blue-600"
                        }`}
                      />
                      Activo
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </button>

              {!isCollapsed && !isSelected && <BasicDataRows method={method} />}
              {isSelected && <ExpandedDataRows method={method} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};
