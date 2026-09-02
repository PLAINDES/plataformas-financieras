import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { formatToPeruTime } from "../../kapital/services/kapital.utils";
import type { ValoraSensibilidadEntry } from "@/shared/types/ValoraTypes";

interface ValoraScenarioSelectorProps {
  sensibilizaciones: ValoraSensibilidadEntry[];
  selectedIdx: number;
  onSelectIdx: (idx: number) => void;
}

const formatRate = (value?: number | string): string => {
  if (value === undefined || value === null || value === "") return "-";
  const str = String(value).trim().replace("%", "").replace(",", ".");
  const num = Number(str);
  if (!Number.isFinite(num)) return "-";
  const pct = Math.abs(num) < 1 && num !== 0 ? num * 100 : num;
  return `${pct.toFixed(2)}%`;
};

export const ValoraScenarioSelector: React.FC<ValoraScenarioSelectorProps> = ({
  sensibilizaciones,
  selectedIdx,
  onSelectIdx,
}) => {
  const [open, setOpen] = useState(false);

  if (sensibilizaciones.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-valora-primary text-white rounded-full shadow-lg hover:bg-valora-secondary transition-all cursor-pointer"
      >
        <SlidersHorizontal size={18} />
        <span className="text-sm font-bold max-w-[180px] truncate">
          Escenarios de sensibilidad
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/10"
            onClick={() => setOpen(false)}
          />
          <div className="fixed bottom-24 right-6 z-[100] w-[400px] max-w-[calc(100vw-48px)] max-h-[70vh] flex flex-col bg-white rounded-2xl shadow-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-2 text-valora-primary">
                <SlidersHorizontal size={16} />
                <span className="text-sm font-bold text-gray-800">
                  Escenario de sensibilización
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-gray-500 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 -mr-1">
              <div className="flex flex-col gap-2">
                {sensibilizaciones.map((s, idx) => {
                  const isSelected = idx === selectedIdx;
                  // Histórico sin nombre queda "Escenario N" para distinguir; nuevo ya trae subsector
                  const label = s.subsector
                    ? s.subsector
                    : `Escenario ${idx + 1}`;
                  const betaHist = !s.subsector ? (s as any)?.inputs?.beta_subsector ?? (s as any)?.beta_subsector : undefined;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onSelectIdx(idx);
                        setOpen(false);
                      }}
                      className={`text-left px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-valora-primary/10 border border-valora-primary text-valora-primary font-bold"
                          : "bg-slate-50 border border-transparent text-gray-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block leading-snug break-words">
                        {label}
                      </span>
                      <span className="block text-[11px] opacity-80 mt-0.5">
                        WACC = {formatRate(s.wacc)}
                        {betaHist ? ` · Beta ${betaHist}` : ""}
                        {s.created_at
                          ? ` — ${formatToPeruTime(s.created_at)}`
                          : ""}
                      </span>
                      <span className="block text-[10px] opacity-60 mt-0.5 leading-snug">
                        Forecast Ingresos = {formatRate(s.revenue_forecast_rate)}
                        {s.fdc_forecast_rate !== undefined && s.fdc_forecast_rate !== null
                          ? ` | FDC = ${formatRate(s.fdc_forecast_rate)}`
                          : ""}
                        {s.perpetual_growth_rate !== undefined && s.perpetual_growth_rate !== null
                          ? ` | Crec. Perpetuo = ${formatRate(s.perpetual_growth_rate)}`
                          : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[11px] text-gray-500 mt-3 shrink-0">
              Selecciona un escenario para comparar contra el cálculo original.
            </p>
          </div>
        </>
      )}
    </>
  );
};
