import { X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";
import { INDUSTRY_TRANSLATIONS } from "@/shared/constants/kapital";

interface TickerInfoData {
  name: string;
  beta_desapalancado: number | null;
  market_cap: number | null;
  beta_apalancado: number | null;
  total_activos: number | null;
  fx: number | null;
  activo_mercado: number | null;
  sector: string | null;
  subsector: string | null;
  country: string | null;
  listing_currency: string | null;
  reporting_currency: string | null;
  debt_lt: number | null;
  debt_st: number | null;
  debt_value: number | null;
  equity_value: number | null;
  dc_ratio: number | null;
  effective_tax_rate: number | null;
  pct_debt: number | null;
  pct_equity: number | null;
}

interface SubsectorRow {
  sector: string;
  subsector: string;
  empresas?: string[];
  empresas_boa?: Record<string, number | string | null | undefined>;
  ticker_info?: Record<string, TickerInfoData>;
}

interface SubsectoresTableProps {
  data: SubsectorRow[];
  isLoading: boolean;
  onDelete: (item: SubsectorRow) => void;
}

const translateSector = (sector: string): string =>
  INDUSTRY_TRANSLATIONS[sector] || sector;

const formatBoa = (value: unknown): string | null => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numericValue) ? numericValue.toFixed(4) : null;
};

const fmtNum = (v: number | null, decimals = 0): string => {
  if (v === null || v === undefined) return "N/A";
  return decimals > 0 ? v.toFixed(decimals) : v.toLocaleString("en-US");
};

const fmtPct = (v: number | null): string => {
  if (v === null || v === undefined) return "N/A";
  return `${(v * 100).toFixed(2)}%`;
};

export const SubsectoresTable = ({
  data,
  isLoading,
  onDelete,
}: SubsectoresTableProps) => {
  const [tickerInfo, setTickerInfo] = useState<TickerInfoData | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const closePopover = useCallback(() => {
    setTickerInfo(null);
    setPopoverPos(null);
  }, []);

  useEffect(() => {
    if (!tickerInfo) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closePopover();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tickerInfo, closePopover]);

  const { paginatedData, tableProps } = useClientPagination(data);

  return (
    <>
    <SimpleTable
      isLoading={isLoading}
      data={paginatedData}
      {...tableProps}
      columns={[
        {
          header: "Sector",
          accessorKey: "sector",
          cell: (item) => <span>{translateSector(item.sector)}</span>,
        },
        { header: "Subsector", accessorKey: "subsector" },
        {
          header: "Empresas",
          accessorKey: "empresas",
          cell: (item) => {
            if (!Array.isArray(item.empresas) || item.empresas.length === 0) {
              return (
                <span className="text-gray-400">-</span>
              );
            }
            return (
              <div className="flex flex-wrap gap-1">
                {item.empresas.map((emp: string, i: number) => {
                  const boa = item.empresas_boa?.[emp];
                  const formattedBoa = formatBoa(boa);
                  const info = item.ticker_info?.[emp];
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setTickerInfo({
                          name: emp,
                          beta_desapalancado: info?.beta_desapalancado ?? null,
                          market_cap: info?.market_cap ?? null,
                          beta_apalancado: info?.beta_apalancado ?? null,
                          total_activos: info?.total_activos ?? null,
                          fx: info?.fx ?? null,
                          activo_mercado: info?.activo_mercado ?? null,
                          sector: info?.sector ?? null,
                          subsector: info?.subsector ?? null,
                          country: info?.country ?? null,
                          listing_currency: info?.listing_currency ?? null,
                          reporting_currency: info?.reporting_currency ?? null,
                          debt_lt: info?.debt_lt ?? null,
                          debt_st: info?.debt_st ?? null,
                          debt_value: info?.debt_value ?? null,
                          equity_value: info?.equity_value ?? null,
                          dc_ratio: info?.dc_ratio ?? null,
                          effective_tax_rate: info?.effective_tax_rate ?? null,
                          pct_debt: info?.pct_debt ?? null,
                          pct_equity: info?.pct_equity ?? null,
                        });
                        setPopoverPos({
                          top: rect.top + window.scrollY - 8,
                          left: rect.left + window.scrollX + rect.width / 2,
                        });
                      }}
                    >
                      {emp}
                      {formattedBoa !== null && (
                        <span className="text-blue-400 font-mono">
                          {formattedBoa}
                        </span>
                      )}
                      {info && (
                        <span className="text-xs text-gray-500 ml-2">
                          ✓
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            );
          },
        },
      ]}
      onDelete={onDelete}
    />
      {tickerInfo && popoverPos && (
        <div
          ref={popoverRef}
          className="fixed z-[100] w-80 rounded-lg border border-slate-200 bg-white shadow-xl text-[11px] leading-relaxed overflow-hidden"
          style={{
            top: popoverPos.top,
            left: popoverPos.left,
            transform: "translate(-50%, -100%)",
          }}
        >
          <button
            type="button"
            onClick={closePopover}
            className="absolute top-1.5 right-1.5 rounded-full p-0.5 hover:bg-slate-100 transition-colors z-10"
          >
            <X className="w-3 h-3 text-slate-400" />
          </button>

          {/* Header */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200">
            <div className="font-bold text-slate-900 text-xs">{tickerInfo.name}</div>
            {tickerInfo.country && (
              <div className="text-[10px] text-slate-500">{tickerInfo.country} · {tickerInfo.reporting_currency || tickerInfo.listing_currency || "—"}</div>
            )}
          </div>

          {/* Body */}
          <div className="px-3 py-2 space-y-2">
            {/* Betas */}
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Betas</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                <div>Desapalancado: <span className="font-semibold text-blue-600">{fmtNum(tickerInfo.beta_desapalancado, 4)}</span></div>
                <div>Apalancado: <span className="font-semibold">{fmtNum(tickerInfo.beta_apalancado, 4)}</span></div>
              </div>
            </div>

            {/* Mercado */}
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Mercado</div>
              <div className="space-y-0.5">
                <div>Capitalización: <span className="font-semibold">{fmtNum(tickerInfo.market_cap)}</span></div>
                <div>Activo de Mercado: <span className="font-semibold">{fmtNum(tickerInfo.activo_mercado)}</span></div>
                {tickerInfo.fx !== null && tickerInfo.fx !== undefined && (
                  <div>FX (→ USD): <span className="font-semibold">{tickerInfo.fx.toFixed(4)}</span></div>
                )}
              </div>
            </div>

            {/* Estructura Financiera */}
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Estructura Financiera</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                <div>Deuda LT: <span className="font-semibold">{fmtNum(tickerInfo.debt_lt)}</span></div>
                <div>Deuda ST: <span className="font-semibold">{fmtNum(tickerInfo.debt_st)}</span></div>
                <div>Deuda Total: <span className="font-semibold">{fmtNum(tickerInfo.debt_value)}</span></div>
                <div>Equity: <span className="font-semibold">{fmtNum(tickerInfo.equity_value)}</span></div>
                <div>D/E Ratio: <span className="font-semibold">{fmtNum(tickerInfo.dc_ratio, 4)}</span></div>
                <div>Tax Rate: <span className="font-semibold">{fmtPct(tickerInfo.effective_tax_rate)}</span></div>
              </div>
              {(tickerInfo.pct_debt !== null || tickerInfo.pct_equity !== null) && (
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-0.5">
                  <div>% Deuda: <span className="font-semibold">{fmtPct(tickerInfo.pct_debt)}</span></div>
                  <div>% Equity: <span className="font-semibold">{fmtPct(tickerInfo.pct_equity)}</span></div>
                </div>
              )}
            </div>

            {/* Total Activos USD */}
            {tickerInfo.total_activos !== null && tickerInfo.total_activos !== undefined && (
              <div className="pt-1 border-t border-slate-100">
                <div>Total Activos (USD): <span className="font-bold text-blue-600">{fmtNum(tickerInfo.total_activos)}</span></div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
