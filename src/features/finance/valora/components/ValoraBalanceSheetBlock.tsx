import { useRef } from "react";
import { formatNumber, getEmpresaRowSpan, getPatrimonioRowSpan, DynamicConnector } from "./ValoraChartUtils";

export interface ValoraBalanceSheetBlockProps {
  activo: number | null;
  pasivo: number | null;
  patrimonio: number | null;
  conceptosActivo: number | null;
  conceptosPasivo: number | null;
  conceptosPatrimonio: number | null;
  integradoActivo: number | null;
  integradoPasivo: number | null;
  integradoPatrimonio: number | null;
  conceptosEmpresa: number | null;
  integradoEmpresa: number | null;
  currency: string;
  availableCurrencies: string[];
  onCurrencyChange: (currency: string) => void;
  variant?: "default" | "conceptos" | "integrado";
}

const DefaultBalanceChart = ({
  activo,
  pasivo,
  patrimonio,
  conceptosPatrimonio,
  integradoPatrimonio,
}: {
  activo: number | null;
  pasivo: number | null;
  patrimonio: number | null;
  conceptosPatrimonio: number | null;
  integradoPatrimonio: number | null;
}) => {
  const TOTAL_ROWS = 9;
  const conceptosPatRowSpan = getPatrimonioRowSpan(conceptosPatrimonio, patrimonio);
  const integradoPatRowSpan = getPatrimonioRowSpan(integradoPatrimonio, patrimonio);

  const gridRef = useRef<HTMLDivElement>(null);
  const patrimonioRef = useRef<HTMLDivElement>(null);
  const conceptosRef = useRef<HTMLDivElement>(null);
  const integradoRef = useRef<HTMLDivElement>(null);

  return (
    <div className="p-4 flex flex-col justify-end h-full">
      <div ref={gridRef} className="relative grid gap-0 flex-1 min-h-0" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: `repeat(${TOTAL_ROWS}, minmax(0, 1fr))` }}>
        <DynamicConnector
          containerRef={gridRef}
          lines={[
            { fromRef: patrimonioRef, fromCorner: "top-right" as const, toRef: conceptosRef, toCorner: "top-left" as const },
            { fromRef: conceptosRef, fromCorner: "top-right" as const, toRef: integradoRef, toCorner: "top-left" as const },
          ]}
        />
        {/* Bottom straight line - STATIC */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" style={{ overflow: "visible" }}>
          <line x1="22.2%" y1="99.5%" x2="100%" y2="99.5%" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Activo - REFERENCIA FIJA */}
        <div className="z-10 col-span-4 row-span-9 mr-[3px] border-[3px] border-[#a62cad] bg-white rounded-l-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo - REFERENCIA FIJA */}
        <div className="z-10 col-span-4 row-span-6 col-start-5 mb-[3px] border-[3px] border-green-600 bg-white rounded-tr-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Patrimonio - REFERENCIA FIJA */}
        <div ref={patrimonioRef} className="z-10 col-span-4 row-span-3 col-start-5 row-start-7 border-[3px] border-blue-400 bg-white rounded-br-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Conceptos Patrimonio - DINÁMICO (NARANJA) */}
        <div
          ref={conceptosRef}
          className="z-10 col-span-4 border-[3px] border-orange-500 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-10"
          style={{ gridRowStart: TOTAL_ROWS - conceptosPatRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight mb-1">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight mb-1">
            Método Por Conceptos
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(conceptosPatrimonio)}
          </span>
        </div>

        {/* Integrado Patrimonio - DINÁMICO (AZUL) */}
        <div
          ref={integradoRef}
          className="z-10 col-span-4 border-[3px] border-blue-600 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-15"
          style={{ gridRowStart: TOTAL_ROWS - integradoPatRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight mb-1">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight mb-1">
            Método Integrado
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(integradoPatrimonio)}
          </span>
        </div>
      </div>
    </div>
  );
};

const MethodBalanceChart = ({
  activo,
  pasivo,
  patrimonio,
  valorFinancieroPatrimonio,
  valorFinancieroEmpresa,
}: {
  activo: number | null;
  pasivo: number | null;
  patrimonio: number | null;
  valorFinancieroPatrimonio: number | null;
  valorFinancieroEmpresa: number | null;
}) => {
  const TOTAL_ROWS = 9;
  const empresaRowSpan = getEmpresaRowSpan(valorFinancieroEmpresa, activo);
  const patrimonioRowSpan = getPatrimonioRowSpan(valorFinancieroPatrimonio, patrimonio, activo);

  const gridRef = useRef<HTMLDivElement>(null);
  const empresaRef = useRef<HTMLDivElement>(null);
  const activoRef = useRef<HTMLDivElement>(null);
  const patrimonioRef = useRef<HTMLDivElement>(null);
  const patrimonioDynRef = useRef<HTMLDivElement>(null);

  return (
    <div className="p-4 flex flex-col justify-end h-full">
      <div ref={gridRef} className="relative grid gap-0 flex-1 min-h-0" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: `repeat(${TOTAL_ROWS}, minmax(0, 1fr))` }}>
        <DynamicConnector
          containerRef={gridRef}
          lines={[
            { fromRef: empresaRef, fromCorner: "top-right" as const, toRef: activoRef, toCorner: "top-left" as const },
            { fromRef: patrimonioRef, fromCorner: "top-right" as const, toRef: patrimonioDynRef, toCorner: "top-left" as const },
          ]}
        />
        {/* Bottom straight line - STATIC */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" style={{ overflow: "visible" }}>
          <line x1="22.2%" y1="99.5%" x2="100%" y2="99.5%" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Empresa - DINÁMICO (VERDE, IZQUIERDA) */}
        <div
          ref={empresaRef}
          className="z-10 col-span-4 border-[3px] border-[#a12d94] bg-white rounded-l-xl relative flex flex-col items-center justify-center p-2 col-start-1"
          style={{ gridRowStart: TOTAL_ROWS - empresaRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Valor Financiero de la Empresa
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(valorFinancieroEmpresa)}
          </span>
        </div>

        {/* Activo - REFERENCIA FIJA */}
        <div ref={activoRef} className="z-10 col-span-4 row-span-8 col-start-6 row-start-2 mr-[3px] border-[3px] border-blue-500 bg-white rounded-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo - REFERENCIA FIJA */}
        <div className="z-10 col-span-4 row-span-5 col-start-10 row-start-2 mb-[3px] border-[3px] border-blue-500 bg-white rounded-t-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Patrimonio - REFERENCIA FIJA */}
        <div ref={patrimonioRef} className="z-10 col-span-4 row-span-3 col-start-10 row-start-7 border-[3px] border-blue-500 bg-white rounded-br-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Patrimonio - DINÁMICO (MORADO, DERECHA) */}
        <div
          ref={patrimonioDynRef}
          className="z-10 col-span-4 border-[3px] border-[#00b050] bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-15"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight mb-1">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(valorFinancieroPatrimonio)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ValoraBalanceSheetBlock: React.FC<ValoraBalanceSheetBlockProps> = ({
  activo,
  pasivo,
  patrimonio,
  conceptosActivo: _conceptosActivo,
  conceptosPasivo: _conceptosPasivo,
  conceptosPatrimonio,
  integradoActivo: _integradoActivo,
  integradoPasivo: _integradoPasivo,
  integradoPatrimonio,
  conceptosEmpresa,
  integradoEmpresa,
  currency,
  availableCurrencies,
  onCurrencyChange,
  variant = "default",
}) => {
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
      {variant === "default" && (
        <DefaultBalanceChart
          activo={activo}
          pasivo={pasivo}
          patrimonio={patrimonio}
          conceptosPatrimonio={conceptosPatrimonio}
          integradoPatrimonio={integradoPatrimonio}
        />
      )}
      {variant === "conceptos" && (
        <MethodBalanceChart
          activo={activo}
          pasivo={pasivo}
          patrimonio={patrimonio}
          valorFinancieroPatrimonio={conceptosPatrimonio}
          valorFinancieroEmpresa={conceptosEmpresa}
        />
      )}
      {variant === "integrado" && (
        <MethodBalanceChart
          activo={activo}
          pasivo={pasivo}
          patrimonio={patrimonio}
          valorFinancieroPatrimonio={integradoPatrimonio}
          valorFinancieroEmpresa={integradoEmpresa}
        />
      )}
    </div>
  );
};
