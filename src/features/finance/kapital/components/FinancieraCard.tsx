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
      className={`${compact ? 'min-w-[300px]' : 'min-w-[340px]'} max-w-[450px] bg-white shadow-md shadow-slate-300 flex flex-col w-full rounded-3xl h-full transition-all duration-300`}
    >
      <main className="flex flex-col gap-y-2 flex-1">
        <div className={`flex flex-col flex-1 ${compact ? 'px-4 py-4 gap-y-2' : 'px-6 md:px-8 py-6 gap-y-4'}`}>
          <header className="flex flex-col gap-y-1 w-full relative">
            <div className="flex flex-row justify-between items-center w-full">
              <h2 className={`font-semibold text-center my-auto text-gray-700 ${compact ? 'text-sm' : 'text-base'}`}>
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
            <div className={`relative w-full ${compact ? 'mt-1' : 'mt-3'} gap-2 flex flex-row items-center justify-between mx-auto`}>
              <div className="flex flex-col items-center">
                <span className={`font-black text-gray-900 ${compact ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
                  {formatterx100p(data.cppc)}
                </span>
                <p className={`${compact ? 'text-[9px]' : 'text-[11px]'} text-gray-500 font-bold uppercase tracking-widest text-center`}>
                  CPPC
                </p>
              </div>
              <div className="flex flex-col items-end justify-center">
                <span className={`font-bold text-gray-900 ${compact ? 'text-xs' : 'text-sm md:text-base'}`}>
                   Kd = {formatterx100p(data.kd)}
                </span>
                <div className={`${compact ? 'h-2' : 'h-4'}`}></div> {/* Spacer to align with CPPC label */}
              </div>
            </div>
          </header>

          <div className="mt-auto">
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
