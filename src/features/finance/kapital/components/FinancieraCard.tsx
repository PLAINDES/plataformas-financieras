// features/finance/kapital/components/FinancieraCard.tsx

import { BalanceSheetBlock } from "./BalanceSheetBlock";
import type { KapitalMarketResults } from "@/shared/types";
import { formatterx100p, formatSmartPercentage } from "../services/kapital.utils";

type MarketResults = KapitalMarketResults;

interface FinancieraCardProps {
  title: string;
  data: MarketResults;
  isEmpresa?: boolean;
  resultCurrency?: "pen" | "usd";
  onResultCurrencyChange?: (currency: "pen" | "usd") => void;
  compact?: boolean;
  localCurrency?: string;
}

export const FinancieraCard: React.FC<FinancieraCardProps> = ({
  title,
  data,
  isEmpresa = false,
  resultCurrency,
  onResultCurrencyChange,
  compact = false,
  localCurrency,
}) => {
  return (
    <article
      className={`min-w-75 max-w-90 mx-auto bg-white shadow-md shadow-slate-300 flex flex-col w-full ${
        compact ? "rounded-2xl h-full" : "rounded-4xl h-full"
      } `}
    >
      <main className="flex flex-col gap-y-2 flex-1">
        <div
          className={`flex flex-col flex-1 ${
            compact ? "px-5 py-3 gap-y-1" : "px-4 md:px-8 py-5 gap-y-3"
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
                  className={`px-2 py-1 w-1/4 h-fit text-xs font-medium border border-gray-300 rounded focus:ring-2 focus:ring-valora-primary outline-none my-auto transition-colors ${
                    localCurrency === "USD"
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-white cursor-pointer"
                  }`}
                  value={resultCurrency}
                  onChange={(e) =>
                    onResultCurrencyChange(e.target.value as "pen" | "usd")
                  }
                  disabled={localCurrency === "USD"}
                >
                  {/* Solo muestra la moneda local si no es USD */}
                  {localCurrency !== "USD" && (
                    <option value="pen">{localCurrency}</option>
                  )}
                  <option value="usd">USD</option>
                </select>
              )}
            </div>

            {/* Layout de CPPC centrado y Kd a la derecha */}
            <div className="relative w-2/3 mt-2 gap-1 flex flex-row items-center justify-between mx-auto">
              <div className="px-4 text-center">
                <span
                  className={`font-black text-gray-900 ${
                    compact ? "text-xl" : "text-2xl md:text-3xl"
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
                className={`font-bold text-gray-900 ${compact ? "text-xs" : "text-base"}`}
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
              d_empresa={formatSmartPercentage(data.d_empresa)}
            />
          </div>
        </div>
      </main>
    </article>
  );
};
