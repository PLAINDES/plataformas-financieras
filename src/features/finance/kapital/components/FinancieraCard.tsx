// features/finance/kapital/components/FinancieraCard.tsx

import { BalanceSheetBlock } from "./BalanceSheetBlock";

export interface MarketResults {
  cppc: number;
  kd: number;
  ke: number;
  koa: number;
}

interface FinancieraCardProps {
  title: string;
  data: MarketResults;
  isEmpresa?: boolean;
  resultCurrency?: "pen" | "usd";
  onResultCurrencyChange?: (currency: "pen" | "usd") => void;
  compact?: boolean;
}

const formatterx100p = (value: number): string =>
  `${(value * 100).toFixed(2)}%`;

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
      className={`max-w-100 mx-auto bg-white shadow-md shadow-slate-300 flex flex-col ${
        compact ? "rounded-2xl w-70 h-75" : "rounded-4xl h-full w-full"
      } `}
    >
      <main className="flex flex-col gap-y-2 flex-1">
        <div
          className={`flex flex-col flex-1 ${
            compact ? "px-5 py-3 gap-y-1" : "px-8 py-5 gap-y-3"
          }`}
        >
          <header className="flex flex-col gap-y-1 w-full relative">
            {isEmpresa && onResultCurrencyChange && resultCurrency && (
              <div className="absolute -top-2 right-0 z-10">
                <select
                  className="px-2 py-1 text-xs font-medium border border-gray-300 rounded focus:ring-2 focus:ring-valora-primary outline-none cursor-pointer bg-white"
                  value={resultCurrency}
                  onChange={(e) =>
                    onResultCurrencyChange(e.target.value as "pen" | "usd")
                  }
                >
                  <option value="pen">PEN</option>
                  <option value="usd">USD</option>
                </select>
              </div>
            )}

            <h2
              className={`font-semibold text-center text-gray-700 ${isEmpresa ? "mt-4" : ""} ${
                compact ? "text-sm mt-1" : "text-base mt-3"
              }`}
            >
              {title}
            </h2>

            {/* Layout de CPPC centrado y Kd a la derecha */}
            <div className="relative w-full mt-2 flex flex-col items-center">
              <span
                className={`font-black text-gray-900 ${
                  compact ? "text-xl" : "text-3xl"
                }`}
              >
                {formatterx100p(data.cppc)}
              </span>
              <p
                className={`${compact ? "text-[10px]" : "text-base"} text-gray-500 font-bold uppercase tracking-widest`}
              >
                CPPC
              </p>
              <div className="absolute bottom-0 right-0">
                <span
                  className={`font-bold text-gray-900 ${compact ? "text-xs" : "text-sm"}`}
                >
                  Kd={formatterx100p(data.kd)}
                </span>
              </div>
            </div>
          </header>

          <div
            className={`border-t border-gray-100 ${
              compact ? "" : "mt-auto pt-3"
            }`}
          >
            <BalanceSheetBlock
              koa={formatterx100p(data.koa)}
              kd={formatterx100p(data.kd)}
              ke={formatterx100p(data.ke)}
              compact={compact}
            />
          </div>
        </div>
      </main>
    </article>
  );
};
