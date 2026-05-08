// features/finance/kapital/components/FinancieraCard.tsx

import { BalanceSheetBlock } from "./BalanceSheetBlock";

export interface MarketResults {
  cppc: number | string;
  kd: number | string;
  ke: number | string;
  koa: number | string;
  "kd(1-t)": string | number;
  D_empresa: string | number;
}

interface FinancieraCardProps {
  title: string;
  data: MarketResults;
  isEmpresa?: boolean;
  resultCurrency?: "pen" | "usd";
  onResultCurrencyChange?: (currency: "pen" | "usd") => void;
  compact?: boolean;
}

const formatterx100p = (value: number | string): string => {
  if (typeof value === "string") return value;
  return `${(value * 100).toFixed(2)}%`;
};

const formatSmartPercentage = (value?: string | number): string => {
  if (value === undefined || value === null || value === "") {
    return "0,00%";
  }

  // Si ya es un texto del backend (ej: "8,32%"), lo devolvemos tal cual
  if (typeof value === "string") {
    return value;
  }

  // Si es un número decimal puro (ej: 0.0832), lo formateamos a texto
  if (typeof value === "number" && !isNaN(value)) {
    return `${(value * 100).toFixed(2).replace(".", ",")}%`;
  }

  return "0,00%";
};

export const FinancieraCard: React.FC<FinancieraCardProps> = ({
  title,
  data,
  isEmpresa = false,
  resultCurrency,
  onResultCurrencyChange,
  compact = false,
}) => {
  return (
    <article
      className={`max-w-100 mx-auto bg-white shadow-md shadow-slate-300 flex flex-col w-full ${
        compact ? "rounded-2xl h-full" : "rounded-4xl h-full"
      } `}
    >
      <main className="flex flex-col gap-y-2 flex-1">
        <div
          className={`flex flex-col flex-1 ${
            compact ? "px-5 py-3 gap-y-1" : "px-8 py-5 gap-y-3"
          }`}
        >
          <header className="flex flex-col gap-y-1 w-full relative">
            <div className="flex flex-row justify-between items-center w-full">
              <h2
                className={`font-semibold text-center my-auto text-gray-700 ${
                  compact ? "text-sm " : "text-base"
                }`}
              >
                {title}
              </h2>

              {isEmpresa && onResultCurrencyChange && resultCurrency && (
                <select
                  className="px-2 py-1 w-1/4 h-fit text-xs font-medium border border-gray-300 rounded focus:ring-2 focus:ring-valora-primary outline-none cursor-pointer bg-white my-auto"
                  value={resultCurrency}
                  onChange={(e) =>
                    onResultCurrencyChange(e.target.value as "pen" | "usd")
                  }
                >
                  <option value="pen">Moneda Local</option>
                  <option value="usd">USD</option>
                </select>
              )}
            </div>

            {/* Layout de CPPC centrado y Kd a la derecha */}
            <div className="relative w-2/3 mt-2 flex flex-row items-center justify-between mx-auto">
              <div className="px-4 text-center">
                <span
                  className={`font-black text-gray-900 ${
                    compact ? "text-xl" : "text-3xl"
                  }`}
                >
                  {formatterx100p(data.cppc)}
                </span>
                <p
                  className={`${compact ? "text-[10px]" : "text-base"} text-gray-500 font-bold uppercase tracking-widest text-center`}
                >
                  CPPC
                </p>
              </div>
              <span
                className={`font-bold text-gray-900 ${compact ? "text-xs" : "text-sm"}`}
              >
                Kd={formatterx100p(data.kd)}
              </span>
            </div>
          </header>

          <div className={` ${compact ? "" : "mt-auto"}`}>
            <BalanceSheetBlock
              koa={formatterx100p(data.koa)}
              kd_1_minus_t={formatSmartPercentage(data["kd(1-t)"])}
              ke={formatterx100p(data.ke)}
              compact={compact}
              D_empresa={formatSmartPercentage(data.D_empresa)}
            />
          </div>
        </div>
      </main>
    </article>
  );
};
