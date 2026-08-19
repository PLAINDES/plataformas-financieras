import { X } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { useClientPagination } from "@/features/admin/hooks/useClientPagination";
import { INDUSTRY_TRANSLATIONS } from "@/shared/constants/kapital";

interface SubsectorRow {
  sector: string;
  subsector: string;
  empresas?: string[];
  empresas_boa?: Record<string, number | string | null | undefined>;
  ticker_info?: Record<string, {
    name: string;
    beta_desapalancado: number | null;
    market_cap: number | null;
    beta_apalancado: number | null;
    total_activos: number | null;
    fx: number | null;
  }>;
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

export const SubsectoresTable = ({
  data,
  isLoading,
  onDelete,
}: SubsectoresTableProps) => {
  const [tickerInfo, setTickerInfo] = useState<{
    name: string;
    beta_desapalancado: number | null;
    market_cap: number | null;
    beta_apalancado: number | null;
    total_activos: number | null;
    fx: number | null;
  } | null>(null);
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
                  const tickerInfo = item.ticker_info?.[emp];
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setTickerInfo({
                          name: emp,
                          beta_desapalancado: tickerInfo?.beta_desapalancado ?? null,
                          market_cap: tickerInfo?.market_cap ?? null,
                          beta_apalancado: tickerInfo?.beta_apalancado ?? null,
                          total_activos: tickerInfo?.total_activos ?? null,
                          fx: tickerInfo?.fx ?? null,
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
                      {tickerInfo && (
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
          className="fixed z-[100] w-64 rounded-lg border border-slate-200 bg-white shadow-xl p-3 text-[11px] leading-relaxed"
          style={{
            top: popoverPos.top,
            left: popoverPos.left,
            transform: "translate(-50%, -100%)",
          }}
        >
          <button
            type="button"
            onClick={closePopover}
            className="absolute top-1.5 right-1.5 rounded-full p-0.5 hover:bg-slate-100 transition-colors"
          >
            <X className="w-3 h-3 text-slate-400" />
          </button>
          <div className="font-bold text-slate-900 text-xs mb-1.5 pr-4">{tickerInfo.name}</div>
          <div className="space-y-0.5">
            <div>Beta desapalancado: <span className="font-semibold text-blue-600">{tickerInfo.beta_desapalancado !== null ? tickerInfo.beta_desapalancado.toFixed(4) : "N/A"}</span></div>
            <div>Capitalización del Mercado: <span className="font-semibold">{tickerInfo.market_cap !== null ? tickerInfo.market_cap.toLocaleString() : "N/A"}</span></div>
            <div>Beta apalancado: <span className="font-semibold">{tickerInfo.beta_apalancado !== null ? tickerInfo.beta_apalancado.toFixed(4) : "N/A"}</span></div>
            <div>Total Activos (USD): <span className="font-semibold">{tickerInfo.total_activos !== null ? tickerInfo.total_activos.toLocaleString() : "N/A"}</span></div>
            <div>FX (→ USD): <span className="font-semibold">{tickerInfo.fx !== null ? tickerInfo.fx.toFixed(4) : "N/A"}</span></div>
          </div>
        </div>
      )}
    </>
  );
};
