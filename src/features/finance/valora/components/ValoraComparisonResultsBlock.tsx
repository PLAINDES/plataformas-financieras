import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BarChart3, CheckCircle2, ChevronRight, PieChart } from "lucide-react";
import { ValoraResultsHeader } from "./ValoraResultsHeader";
import type { ValoraCalculationResults } from "@/shared/types/ValoraTypes";
import { getComparisonPatrimonioRowSpan, getEmpresaRowSpan, DynamicConnector } from "./ValoraChartUtils";

type ComparisonMethodId = "conceptos" | "integrado";
type ComparisonView = ComparisonMethodId | "none";

interface ValoraComparisonResultsBlockProps {
  toolbar?: React.ReactNode;
  baseResults?: ValoraCalculationResults;
  sensitizedResults?: ValoraCalculationResults;
}

interface ComparisonMethodData {
  id: ComparisonMethodId;
  headerText: string;
  patrimonioBase: number | null;
  patrimonioSensibilizado: number | null;
  empresaBase: number | null;
  empresaSensibilizado: number | null;
  accionBase: number | null;
  accionSensibilizado: number | null;
  tasaForecastBase: number | null;
  tasaForecastSensibilizado: number | null;
  tasaForecastLabel: string;
  tasaPerpetuaBase: number | null;
  tasaPerpetuaSensibilizado: number | null;
  waccBase: number | null;
  waccSensibilizado: number | null;
  icon: LucideIcon;
  buttonColor: "orange" | "blue";
}

const parseNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (!value) return null;

  const raw = value.trim().replace(/[^0-9,.-]/g, "");
  if (!/[0-9]/.test(raw)) return null;

  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : ".";
  const normalized = raw.includes(",") && raw.includes(".")
    ? raw.replace(decimalSeparator === "," ? /\./g : /,/g, "").replace(decimalSeparator, ".")
    : raw.includes(",")
      ? raw.split(",").length > 2
        ? raw.replace(/,/g, "")
        : raw.replace(",", ".")
      : raw.includes(".") && raw.split(".").at(-1)!.length === 3
        ? raw.replace(/\./g, "")
        : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const parsePercentage = (value: string | number | null | undefined) => {
  const parsed = parseNumber(value);
  if (parsed === null) return null;
  return typeof value === "string" && value.includes("%")
    ? parsed
    : Math.abs(parsed) <= 1
      ? parsed * 100
      : parsed;
};

const formatNumber = (value: number | null, decimals = 0) => {
  if (value === null) return "-";
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

const formatPercent = (value: number | null) =>
  value === null ? "-" : `${value.toFixed(2)}%`;

const BasicComparisonRows = ({
  method,
}: {
  method: ComparisonMethodData;
}) => (
  <div className="flex flex-col gap-0.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.95fr)] items-center gap-3 border-b border-gray-200/80 py-2">
      <span />
      <span className="text-center text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Base
      </span>
      <span className="text-center text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Sensibilidad
      </span>
    </div>
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.95fr)] items-center gap-3 border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Valor del Patrimonio
      </span>
      <span className="text-right text-sm font-bold text-purple-700">
        {formatNumber(method.patrimonioBase)}
      </span>
      <span className="text-right text-sm font-bold text-purple-700">
        {formatNumber(method.patrimonioSensibilizado)}
      </span>
    </div>
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.95fr)] items-center gap-3 border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Valor de la Empresa
      </span>
      <span className="text-right text-sm font-bold text-emerald-600">
        {formatNumber(method.empresaBase)}
      </span>
      <span className="text-right text-sm font-bold text-emerald-600">
        {formatNumber(method.empresaSensibilizado)}
      </span>
    </div>
    <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,0.95fr)] items-center gap-3 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Precio por Acción
      </span>
      <span className="text-right text-sm font-bold text-blue-600">
        {formatNumber(method.accionBase, 2)}
      </span>
      <span className="text-right text-sm font-bold text-blue-600">
        {formatNumber(method.accionSensibilizado, 2)}
      </span>
    </div>
  </div>
);

const MethodComparisonRows = ({
  method,
}: {
  method: ComparisonMethodData;
}) => (
  <div className="flex flex-col gap-0.5 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
    <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,0.95fr)] items-center gap-3 border-b border-gray-200/80 py-2">
      <span />
      <span className="text-center text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Base
      </span>
      <span className="text-center text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Sensibilidad
      </span>
    </div>

    <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,0.95fr)] items-center gap-3 border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Valor del Patrimonio
      </span>
      <span className="text-right text-sm font-bold text-purple-700">
        {formatNumber(method.patrimonioBase)}
      </span>
      <span className="text-right text-sm font-bold text-purple-700">
        {formatNumber(method.patrimonioSensibilizado)}
      </span>
    </div>

    <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,0.95fr)] items-center gap-3 border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Valor de la Empresa
      </span>
      <span className="text-right text-sm font-bold text-emerald-600">
        {formatNumber(method.empresaBase)}
      </span>
      <span className="text-right text-sm font-bold text-emerald-600">
        {formatNumber(method.empresaSensibilizado)}
      </span>
    </div>

    <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,0.95fr)] items-center gap-3 border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Precio por Acción
      </span>
      <span className="text-right text-sm font-bold text-blue-600">
        {formatNumber(method.accionBase, 2)}
      </span>
      <span className="text-right text-sm font-bold text-blue-600">
        {formatNumber(method.accionSensibilizado, 2)}
      </span>
    </div>

    <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,0.95fr)] items-center gap-3 border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight leading-tight">
        {method.tasaForecastLabel}
      </span>
      <span className="text-right text-sm font-bold text-orange-500">
        {formatPercent(method.tasaForecastBase)}
      </span>
      <span className="text-right text-sm font-bold text-orange-500">
        {formatPercent(method.tasaForecastSensibilizado)}
      </span>
    </div>

    <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,0.95fr)] items-center gap-3 border-b border-gray-200/80 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        Tasa de crecimiento perpetuo
      </span>
      <span className="text-right text-sm font-bold text-green-700">
        {formatPercent(method.tasaPerpetuaBase)}
      </span>
      <span className="text-right text-sm font-bold text-green-700">
        {formatPercent(method.tasaPerpetuaSensibilizado)}
      </span>
    </div>

    <div className="grid grid-cols-[minmax(0,1.8fr)_minmax(0,0.8fr)_minmax(0,0.95fr)] items-center gap-3 py-2">
      <span className="text-xs font-semibold text-gray-700 uppercase tracking-tight">
        WACC
      </span>
      <span className="text-right text-sm font-bold text-sky-500">
        {formatPercent(method.waccBase)}
      </span>
      <span className="text-right text-sm font-bold text-sky-500">
        {formatPercent(method.waccSensibilizado)}
      </span>
    </div>
  </div>
);

const MethodComparisonCard = ({
  method,
  isSelected,
  selectedView,
  onSelect,
}: {
  method: ComparisonMethodData;
  isSelected: boolean;
  selectedView: ComparisonView;
  onSelect: (id: ComparisonMethodId) => void;
}) => {
  const styles =
    method.buttonColor === "orange"
      ? {
          default:
            "border border-orange-300 bg-white text-orange-950 hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-200 shadow-2xs",
          selected:
            "border-2 border-orange-500 bg-orange-50/90 text-orange-950 font-bold shadow-xs transition-all duration-200 ring-2 ring-orange-500/10",
          iconDefault: "bg-orange-100 text-orange-600",
          iconSelected: "bg-orange-500 text-white",
          badge: "bg-orange-100/80 text-orange-800 border-orange-200",
          badgeIcon: "text-orange-600",
        }
      : {
          default:
            "border border-blue-300 bg-white text-blue-950 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 shadow-2xs",
          selected:
            "border-2 border-blue-600 bg-blue-50/90 text-blue-950 font-bold shadow-xs transition-all duration-200 ring-2 ring-blue-600/10",
          iconDefault: "bg-blue-100 text-blue-600",
          iconSelected: "bg-blue-600 text-white",
          badge: "bg-blue-100/80 text-blue-800 border-blue-200",
          badgeIcon: "text-blue-600",
        };

  const Icon = method.icon;
  const isCollapsed = selectedView !== "none" && !isSelected;

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => onSelect(method.id)}
        className={`group w-full rounded-xl py-3 px-4 flex items-center justify-between transition-all duration-200 cursor-pointer active:scale-[0.99] ${
          isSelected ? styles.selected : styles.default
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${
              isSelected ? styles.iconSelected : styles.iconDefault
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
              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${styles.badge}`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${styles.badgeIcon}`} />
              Activo
            </span>
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
          )}
        </div>
      </button>

      {!isCollapsed && !isSelected && <BasicComparisonRows method={method} />}
      {isSelected && <MethodComparisonRows method={method} />}
    </div>
  );
};

const GeneralComparisonChart = ({
  activo,
  pasivo,
  patrimonio,
  conceptosPatrimonioEsperado,
  conceptosPatrimonioSensibilizado,
  integradoPatrimonioEsperado,
  integradoPatrimonioSensibilizado,
  currency,
  availableCurrencies,
  onCurrencyChange,
  companyType,
}: {
  activo: number | null;
  pasivo: number | null;
  patrimonio: number | null;
  conceptosPatrimonioEsperado: number | null;
  conceptosPatrimonioSensibilizado: number | null;
  integradoPatrimonioEsperado: number | null;
  integradoPatrimonioSensibilizado: number | null;
  currency: string;
  availableCurrencies: string[];
  onCurrencyChange: (currency: string) => void;
  companyType: "empresa" | "emergente";
}) => {
  const TOTAL_ROWS = 9;
  const isEmergente = companyType === "emergente";
  // PASIVO/PATRIMONIO proporcionales a ACTIVO - suman TOTAL_ROWS y respeta quién es mayor
  const pasivoRowSpan = (() => {
    if (activo === null || pasivo === null || activo === 0) return 5;
    const ratio = Math.abs(pasivo) / Math.abs(activo);
    return Math.max(2, Math.min(7, Math.round(ratio * TOTAL_ROWS)));
  })();
  const conceptosEspRowSpan = getComparisonPatrimonioRowSpan(conceptosPatrimonioEsperado, patrimonio, isEmergente);
  const conceptosSensRowSpan = getComparisonPatrimonioRowSpan(conceptosPatrimonioSensibilizado, patrimonio, isEmergente);
  const integradoEspRowSpan = getComparisonPatrimonioRowSpan(integradoPatrimonioEsperado, patrimonio, isEmergente);
  const integradoSensRowSpan = getComparisonPatrimonioRowSpan(integradoPatrimonioSensibilizado, patrimonio, isEmergente);

  const gridRef = useRef<HTMLDivElement>(null);
  const patrimonioRef = useRef<HTMLDivElement>(null);
  const conceptosEspRef = useRef<HTMLDivElement>(null);
  const conceptosSensRef = useRef<HTMLDivElement>(null);
  const integradoEspRef = useRef<HTMLDivElement>(null);
  const integradoSensRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex h-[480px] min-h-[480px] flex-col overflow-hidden rounded-lg bg-white pt-10 shadow">
      <select
        value={currency}
        onChange={(event) => onCurrencyChange(event.target.value)}
        className="absolute right-6 top-6 z-10 min-w-24 rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        aria-label="Moneda de resultados"
      >
        {availableCurrencies.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div className="flex min-h-0 flex-1 px-2 py-4">
        <div
          ref={gridRef}
          className="relative grid min-w-0 flex-1 gap-0"
          style={{ gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 0fr) minmax(0, 0fr)", gridTemplateRows: `repeat(${TOTAL_ROWS}, minmax(0, 1fr))` }}
        >
        <DynamicConnector
          containerRef={gridRef}
          lines={[
            { fromRef: patrimonioRef, fromCorner: "top-right" as const, toRef: conceptosEspRef, toCorner: "top-left" as const },
            { fromRef: conceptosEspRef, fromCorner: "top-right" as const, toRef: integradoEspRef, toCorner: "top-left" as const },
            { fromRef: conceptosSensRef, fromCorner: "top-right" as const, toRef: integradoSensRef, toCorner: "top-left" as const },
          ]}
        />
        {/* Bottom dashed line - STATIC - pasa por ACTIVO + PATRIMONIO */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" style={{ overflow: "visible" }}>
          <line x1="0%" y1="99.5%" x2="100%" y2="99.5%" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Activo - REFERENCIA FIJA (MORADO) */}
        <div className="z-10 col-start-1 row-span-9 mr-[3px] border-[3px] border-[#a62cad] bg-white rounded-l-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">Activo</span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">{formatNumber(activo)}</span>
        </div>

        {/* Pasivo - ALTURA DINÁMICA proporcional a ACTIVO */}
        <div
          className="z-10 col-start-2 border-[3px] border-green-500 bg-white rounded-tr-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: 1, gridRowEnd: pasivoRowSpan + 1 }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">Pasivo</span>
          <span className="text-base font-bold text-gray-800 text-center px-2">{formatNumber(pasivo)}</span>
        </div>

        {/* Patrimonio - ALTURA DINÁMICA proporcional a ACTIVO */}
        <div
          ref={patrimonioRef}
          className="z-10 col-start-2 border-[3px] border-blue-500 bg-white rounded-br-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: pasivoRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">Patrimonio</span>
          <span className="text-base font-bold text-gray-800 text-center px-2">{formatNumber(patrimonio)}</span>
        </div>

        {/* Conceptos Patrimonio Esperado - DINÁMICO (NARANJA) */}
        <div
          ref={conceptosEspRef}
          className="z-10 col-start-3 border-[3px] border-orange-400 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 ml-4 gap-1"
          style={{ gridRowStart: TOTAL_ROWS - conceptosEspRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[10px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-[9px] font-black text-center text-gray-900 leading-tight">Método Por Conceptos</span>
          <span className="text-[10px] font-bold text-center text-gray-900 leading-tight">Esperado</span>
          <span className="text-lg font-bold text-gray-800">{formatNumber(conceptosPatrimonioEsperado)}</span>
        </div>

        {/* Integrado Patrimonio Esperado - DINÁMICO (NARANJA) */}
        <div
          ref={integradoEspRef}
          className="z-10 col-start-4 border-[3px] border-orange-400 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 ml-3 gap-1"
          style={{ gridRowStart: TOTAL_ROWS - integradoEspRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[10px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-[9px] font-black text-center text-gray-900 leading-tight">Método Integrado</span>
          <span className="text-[10px] font-bold text-center text-gray-900 leading-tight">Esperado</span>
          <span className="text-lg font-bold text-gray-800">{formatNumber(integradoPatrimonioEsperado)}</span>
        </div>

        {/* Conceptos Patrimonio Sensibilizado - DINÁMICO (AZUL) */}
        <div
          ref={conceptosSensRef}
          className="z-10 col-start-5 border-[3px] border-[#0101ff] bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 ml-4 gap-1"
          style={{ gridRowStart: TOTAL_ROWS - conceptosSensRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[10px] font-bold text-center text-gray-800 leading-tight">
            Valor del Patrimonio
          </span>
          <span className="text-[9px] font-black text-center text-gray-900 leading-tight">Método Por Conceptos</span>
          <span className="text-[10px] font-bold text-center text-gray-900 leading-tight">Sensibilizado</span>
          <span className="text-lg font-bold text-gray-800">{formatNumber(conceptosPatrimonioSensibilizado)}</span>
        </div>

        {/* Integrado Patrimonio Sensibilizado - DINÁMICO (AZUL) */}
        <div
          ref={integradoSensRef}
          className="z-10 col-start-6 border-[3px] border-[#0101ff] bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 ml-3 gap-1"
          style={{ gridRowStart: TOTAL_ROWS - integradoSensRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[10px] font-bold text-center text-gray-800 leading-tight">
            Valor del Patrimonio
          </span>
          <span className="text-[9px] font-black text-center text-gray-900 leading-tight">Método Integrado</span>
          <span className="text-[10px] font-bold text-center text-gray-900 leading-tight">Sensibilizado</span>
          <span className="text-lg font-bold text-gray-800">{formatNumber(integradoPatrimonioSensibilizado)}</span>
        </div>
        </div>
      </div>
    </div>
  );
};

const MethodComparisonChart = ({
  activo,
  pasivo,
  patrimonio,
  empresaEsperado,
  empresaSensibilizado,
  patrimonioEsperado,
  patrimonioSensibilizado,
  currency,
  availableCurrencies,
  onCurrencyChange,
  companyType,
}: {
  activo: number | null;
  pasivo: number | null;
  patrimonio: number | null;
  empresaEsperado: number | null;
  empresaSensibilizado: number | null;
  patrimonioEsperado: number | null;
  patrimonioSensibilizado: number | null;
  currency: string;
  availableCurrencies: string[];
  onCurrencyChange: (currency: string) => void;
  companyType: "empresa" | "emergente";
}) => {
  const TOTAL_ROWS = 9;
  const isEmergente = companyType === "emergente";
  const empresaSensRowSpan = getEmpresaRowSpan(empresaSensibilizado, activo, isEmergente);
  const empresaEspRowSpan = getEmpresaRowSpan(empresaEsperado, activo, isEmergente);
  const patrimonioEspRowSpan = getComparisonPatrimonioRowSpan(patrimonioEsperado, patrimonio, isEmergente);
  const patrimonioSensRowSpan = getComparisonPatrimonioRowSpan(patrimonioSensibilizado, patrimonio, isEmergente);
  const pasivoRowSpan = (() => {
    if (activo === null || pasivo === null || activo === 0) return 5;
    const ratio = Math.abs(pasivo) / Math.abs(activo);
    return Math.max(2, Math.min(7, Math.round(ratio * TOTAL_ROWS)));
  })();

  const gridRef = useRef<HTMLDivElement>(null);
  const empSensRef = useRef<HTMLDivElement>(null);
  const empEspRef = useRef<HTMLDivElement>(null);
  const activoRef = useRef<HTMLDivElement>(null);
  const patrimonioRef = useRef<HTMLDivElement>(null);
  const patEspRef = useRef<HTMLDivElement>(null);
  const patSensRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex h-[480px] min-h-[480px] flex-col overflow-hidden rounded-lg bg-white pt-10 shadow">
      <select
        value={currency}
        onChange={(event) => onCurrencyChange(event.target.value)}
        className="absolute right-6 top-6 z-10 min-w-24 rounded-md border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
        aria-label="Moneda de resultados"
      >
        {availableCurrencies.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <div className="flex min-h-0 flex-1 px-2 py-4">
        <div
          ref={gridRef}
          className="relative grid min-w-0 flex-1 gap-0"
          style={{ gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 1.6fr) minmax(0, 0fr) minmax(0, 0fr)", gridTemplateRows: `repeat(${TOTAL_ROWS}, minmax(0, 1fr))` }}
        >
        <DynamicConnector
          containerRef={gridRef}
          lines={[
            { fromRef: empSensRef, fromCorner: "top-right" as const, toRef: empEspRef, toCorner: "top-left" as const },
            { fromRef: empEspRef, fromCorner: "top-right" as const, toRef: activoRef, toCorner: "top-left" as const },
            { fromRef: patrimonioRef, fromCorner: "top-right" as const, toRef: patEspRef, toCorner: "top-left" as const },
            { fromRef: patEspRef, fromCorner: "top-right" as const, toRef: patSensRef, toCorner: "top-left" as const },
          ]}
        />
        {/* Bottom dashed line - une los 2 morados por abajo y cubre todo */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" style={{ overflow: "visible" }}>
          <line x1="0%" y1="99.5%" x2="100%" y2="99.5%" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* ========== EMPRESA - IZQUIERDA ========== */}

        {/* Empresa Sensibilizado - DINAMICO (MORADO, extremo izquierdo) */}
        <div
          ref={empSensRef}
          className="z-10 col-start-1 border-[3px] border-[#a43598] bg-white rounded-l-xl relative flex flex-col items-center justify-center p-2 gap-1"
          style={{ gridRowStart: TOTAL_ROWS - empresaSensRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero
          </span>
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            de la Empresa
          </span>
          <span className="text-[10px] font-black text-center text-gray-900 leading-tight">
            Sensibilizado
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(empresaSensibilizado)}
          </span>
        </div>

        {/* Empresa Esperado - DINAMICO (MORADO, al lado de referencia) */}
        <div
          ref={empEspRef}
          className="z-10 col-start-2 border-[3px] border-[#a43598] bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 ml-4 gap-1"
          style={{ gridRowStart: TOTAL_ROWS - empresaEspRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero
          </span>
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            de la Empresa
          </span>
          <span className="text-[10px] font-black text-center text-gray-900 leading-tight">
            Esperado
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(empresaEsperado)}
          </span>
        </div>

        {/* ========== REFERENCIAS - CENTRO ========== */}

        {/* Activo - REFERENCIA FIJA (AZUL) */}
        <div ref={activoRef} className="z-10 col-start-3 row-span-9 row-start-1 ml-4 mr-[3px] border-[3px] border-[#28a7fd] bg-white rounded-l-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">Activo</span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">{formatNumber(activo)}</span>
        </div>

        {/* Pasivo - ALTURA DINÁMICA proporcional a ACTIVO */}
        <div
          className="z-10 col-start-4 border-[3px] border-[#28a7fd] bg-white rounded-tr-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: 1, gridRowEnd: pasivoRowSpan + 1 }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">Pasivo</span>
          <span className="text-base font-bold text-gray-800 text-center px-2">{formatNumber(pasivo)}</span>
        </div>

        {/* Patrimonio - ALTURA DINÁMICA proporcional a ACTIVO */}
        <div
          ref={patrimonioRef}
          className="z-10 col-start-4 border-[3px] border-[#28a7fd] bg-white rounded-br-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: pasivoRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">Patrimonio</span>
          <span className="text-base font-bold text-gray-800 text-center px-2">{formatNumber(patrimonio)}</span>
        </div>

        {/* ========== PATRIMONIO - DERECHA ========== */}

        {/* Patrimonio Esperado - DINAMICO (VERDE, al lado de referencia) */}
        <div
          ref={patEspRef}
          className="z-10 col-start-5 border-[3px] border-[#47d358] bg-white rounded-l-xl relative flex flex-col items-center justify-center p-2 ml-4 gap-1"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioEspRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor del patrimonio
          </span>
          <span className="text-[10px] font-black text-center text-gray-900 leading-tight">
            Esperado
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(patrimonioEsperado)}
          </span>
        </div>

        {/* Patrimonio Sensibilizado - DINAMICO (VERDE, extremo derecho) */}
        <div
          ref={patSensRef}
          className="z-10 col-start-6 border-[3px] border-[#47d358] bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 ml-3 gap-1"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioSensRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor del patrimonio
          </span>
          <span className="text-[10px] font-black text-center text-gray-900 leading-tight">
            Sensibilizado
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(patrimonioSensibilizado)}
          </span>
        </div>
        </div>
      </div>
    </div>
  );
};

export const ValoraComparisonResultsBlock: React.FC<
  ValoraComparisonResultsBlockProps
> = ({ toolbar, baseResults, sensitizedResults }) => {
  const [selectedView, setSelectedView] = useState<ComparisonView>("none");
  const [companyType, setCompanyType] = useState<"empresa" | "emergente">("empresa");

  const sourceCurrency = (
    baseResults?.source_currency ??
    baseResults?.inputs?.moneda ??
    "USD"
  ).toUpperCase();
  const [resultCurrency, setResultCurrency] = useState(sourceCurrency);
  const fxToUsd = sourceCurrency === "USD" ? 1 : baseResults?.fx_to_usd;
  const availableCurrencies =
    sourceCurrency === "USD" || !fxToUsd
      ? [sourceCurrency]
      : [sourceCurrency, "USD"];

  useEffect(() => {
    setResultCurrency(sourceCurrency);
  }, [sourceCurrency]);

  const parseMoney = (value: string | number | null | undefined) => {
    const parsed = parseNumber(value);
    if (parsed === null) return null;
    return resultCurrency === "USD" && sourceCurrency !== "USD" && fxToUsd
      ? parsed * fxToUsd
      : parsed;
  };

  const baseConceptos = companyType === "emergente" ? baseResults?.conceptos_emergente : baseResults?.conceptos;
  const baseIntegrado = companyType === "emergente" ? baseResults?.integrado_emergente : baseResults?.integrado;
  const sensConceptos = companyType === "emergente" ? sensitizedResults?.conceptos_emergente : sensitizedResults?.conceptos;
  const sensIntegrado = companyType === "emergente" ? sensitizedResults?.integrado_emergente : sensitizedResults?.integrado;
  const baseWacc = companyType === "emergente" ? baseResults?.wacc_emergente : baseResults?.wacc;
  const sensWacc = companyType === "emergente" ? sensitizedResults?.wacc_emergente : sensitizedResults?.wacc;

  const methods: ComparisonMethodData[] = [
    {
      id: "conceptos",
      headerText: "Método por Conceptos",
      patrimonioBase: parseMoney(baseConceptos?.patrimonio),
      patrimonioSensibilizado: parseMoney(sensConceptos?.patrimonio),
      empresaBase: parseMoney(baseConceptos?.empresa),
      empresaSensibilizado: parseMoney(sensConceptos?.empresa),
      accionBase: parseMoney(baseConceptos?.precio_accion),
      accionSensibilizado: parseMoney(sensConceptos?.precio_accion),
      tasaForecastBase: parsePercentage(baseResults?.conceptos?.tasa_forecast),
      tasaForecastSensibilizado: parsePercentage(sensitizedResults?.conceptos?.tasa_forecast),
      tasaForecastLabel: "Tasa de crecimiento ingresos forecast primer periodo",
      tasaPerpetuaBase: parsePercentage(baseResults?.conceptos?.tasa_perpetua),
      tasaPerpetuaSensibilizado: parsePercentage(sensitizedResults?.conceptos?.tasa_perpetua),
      waccBase: parsePercentage(baseWacc),
      waccSensibilizado: parsePercentage(sensWacc),
      icon: PieChart,
      buttonColor: "orange",
    },
    {
      id: "integrado",
      headerText: "Método Integrado",
      patrimonioBase: parseMoney(baseIntegrado?.patrimonio),
      patrimonioSensibilizado: parseMoney(sensIntegrado?.patrimonio),
      empresaBase: parseMoney(baseIntegrado?.empresa),
      empresaSensibilizado: parseMoney(sensIntegrado?.empresa),
      accionBase: parseMoney(baseIntegrado?.precio_accion),
      accionSensibilizado: parseMoney(sensIntegrado?.precio_accion),
      tasaForecastBase: parsePercentage(baseResults?.integrado?.tasa_forecast),
      tasaForecastSensibilizado: parsePercentage(sensitizedResults?.integrado?.tasa_forecast),
      tasaForecastLabel: "Tasa de crecimiento FCE forecast primer periodo",
      tasaPerpetuaBase: parsePercentage(baseResults?.integrado?.tasa_perpetua),
      tasaPerpetuaSensibilizado: parsePercentage(sensitizedResults?.integrado?.tasa_perpetua),
      waccBase: parsePercentage(baseWacc),
      waccSensibilizado: parsePercentage(sensWacc),
      icon: BarChart3,
      buttonColor: "blue",
    },
  ];

  const selected =
    methods.find((method) => method.id === selectedView) ?? methods[0];
  const orderedMethods =
    selectedView === "none"
      ? methods
      : [selected, ...methods.filter((method) => method.id !== selected.id)];

  return (
    <div className="flex flex-col gap-4">
      <ValoraResultsHeader
        wacc={parsePercentage(baseWacc)}
        title="Resultados generales"
        subtitle="Comparación de resultados"
        companyType={companyType}
        onCompanyTypeChange={setCompanyType}
      />

      {toolbar}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="lg:flex lg:items-center">
          <div className="flex w-full flex-col rounded-2xl shadow-sm border border-gray-100 bg-white overflow-hidden">
            <div className="p-5 flex flex-col gap-3">
              {orderedMethods.map((method) => (
                <MethodComparisonCard
                  key={method.id}
                  method={method}
                  isSelected={method.id === selectedView}
                  selectedView={selectedView}
                  onSelect={(id) =>
                    setSelectedView((current) => (current === id ? "none" : id))
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          {selectedView === "none" ? (
            <GeneralComparisonChart
              activo={
                parseMoney(baseResults?.balance?.activo) ??
                parseMoney(sensitizedResults?.balance?.activo)
              }
              pasivo={
                parseMoney(baseResults?.balance?.pasivo) ??
                parseMoney(sensitizedResults?.balance?.pasivo)
              }
              patrimonio={
                parseMoney(baseResults?.balance?.patrimonio) ??
                parseMoney(sensitizedResults?.balance?.patrimonio)
              }
              conceptosPatrimonioEsperado={methods[0].patrimonioBase}
              conceptosPatrimonioSensibilizado={methods[0].patrimonioSensibilizado}
              integradoPatrimonioEsperado={methods[1].patrimonioBase}
              integradoPatrimonioSensibilizado={methods[1].patrimonioSensibilizado}
              currency={resultCurrency}
              availableCurrencies={availableCurrencies}
              onCurrencyChange={setResultCurrency}
              companyType={companyType}
            />
          ) : (
            <MethodComparisonChart
              activo={
                parseMoney(baseResults?.balance?.activo) ??
                parseMoney(sensitizedResults?.balance?.activo)
              }
              pasivo={
                parseMoney(baseResults?.balance?.pasivo) ??
                parseMoney(sensitizedResults?.balance?.pasivo)
              }
              patrimonio={
                parseMoney(baseResults?.balance?.patrimonio) ??
                parseMoney(sensitizedResults?.balance?.patrimonio)
              }
              empresaEsperado={selected.empresaBase}
              empresaSensibilizado={selected.empresaSensibilizado}
              patrimonioEsperado={selected.patrimonioBase}
              patrimonioSensibilizado={selected.patrimonioSensibilizado}
              currency={resultCurrency}
              availableCurrencies={availableCurrencies}
              onCurrencyChange={setResultCurrency}
              companyType={companyType}
            />
          )}
        </div>
      </div>
    </div>
  );
};
