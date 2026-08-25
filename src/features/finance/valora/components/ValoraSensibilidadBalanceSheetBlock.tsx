import { useRef } from "react";
import { formatNumber, getSensibilidadEmpresaRowSpan, getSensibilidadPatrimonioRowSpan, DynamicConnector } from "./ValoraChartUtils";

export interface ValoraSensibilidadBalanceSheetBlockProps {
  activo: number;
  pasivo: number;
  patrimonio: number;
  conceptosPatrimonioEsperado: number;
  conceptosPatrimonioSensibilizado: number;
  integradoPatrimonioEsperado: number;
  integradoPatrimonioSensibilizado: number;
  conceptosEmpresaEsperado: number;
  conceptosEmpresaSensibilizado: number;
  integradoEmpresaEsperado: number;
  integradoEmpresaSensibilizado: number;
  currency: string;
  availableCurrencies: string[];
  onCurrencyChange: (currency: string) => void;
  variant?: "default" | "conceptos" | "integrado";
  companyType?: "empresa" | "emergente";
}

const DefaultSensibilidadChart = ({
  activo,
  pasivo,
  patrimonio,
  conceptosPatrimonioSensibilizado,
  integradoPatrimonioSensibilizado,
  companyType,
}: {
  activo: number;
  pasivo: number;
  patrimonio: number;
  conceptosPatrimonioSensibilizado: number;
  integradoPatrimonioSensibilizado: number;
  companyType: "empresa" | "emergente";
}) => {
  const TOTAL_ROWS = 9;
  const isEmergente = companyType === "emergente";
  const conceptosPatRowSpan = getSensibilidadPatrimonioRowSpan(conceptosPatrimonioSensibilizado, patrimonio, isEmergente);
  const integradoPatRowSpan = getSensibilidadPatrimonioRowSpan(integradoPatrimonioSensibilizado, patrimonio, isEmergente);

  const gridRef = useRef<HTMLDivElement>(null);
  const patrimonioRef = useRef<HTMLDivElement>(null);
  const conceptosRef = useRef<HTMLDivElement>(null);
  const integradoRef = useRef<HTMLDivElement>(null);

  return (
    <div className="p-4 flex flex-col justify-end h-full">
      <div
        ref={gridRef}
        className="relative grid gap-0 flex-1 min-h-0"
        style={{
          gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
          gridTemplateRows: `repeat(${TOTAL_ROWS}, minmax(0, 1fr))`,
        }}
      >
        <DynamicConnector
          containerRef={gridRef}
          lines={[
            { fromRef: patrimonioRef, fromCorner: "top-right", toRef: conceptosRef, toCorner: "top-left" },
            { fromRef: conceptosRef, fromCorner: "top-right", toRef: integradoRef, toCorner: "top-left" },
          ]}
        />
        {/* Bottom dashed line - STATIC */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" style={{ overflow: "visible" }}>
          <line x1="22.2%" y1="99.5%" x2="100%" y2="99.5%" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Activo - REFERENCIA FIJA */}
        <div className="col-span-4 row-span-9 row-start-1 mr-[3px] border-[3px] border-[#a62cad] rounded-l-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo - REFERENCIA FIJA */}
        <div className="col-span-4 row-span-6 col-start-5 row-start-1 mb-[3px] border-[3px] border-green-600 rounded-tr-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Patrimonio - REFERENCIA FIJA */}
        <div ref={patrimonioRef} className="col-span-4 row-span-3 col-start-5 row-start-7 border-[3px] border-blue-400 rounded-br-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Conceptos Sensibilizado - DINÁMICO (NARANJA) */}
        <div
          ref={conceptosRef}
          className="z-10 col-span-4 border-[3px] border-orange-400 rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-10"
          style={{ gridRowStart: TOTAL_ROWS - conceptosPatRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight mb-1">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight mb-1">
            Método Por Conceptos
          </span>
          <span className="text-[11px] font-black text-center text-gray-900 leading-tight mb-1">
            Sensibilizado
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(conceptosPatrimonioSensibilizado)}
          </span>
        </div>

        {/* Integrado Sensibilizado - DINÁMICO (AZUL) */}
        <div
          ref={integradoRef}
          className="z-10 col-span-4 border-[3px] border-[#0101ff] rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-15"
          style={{ gridRowStart: TOTAL_ROWS - integradoPatRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight mb-1">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight mb-1">
            Método Integrado
          </span>
          <span className="text-[11px] font-black text-center text-gray-900 leading-tight mb-1">
            Sensibilizado
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(integradoPatrimonioSensibilizado)}
          </span>
        </div>
      </div>
    </div>
  );
};

const MethodSensibilidadChart = ({
  activo,
  pasivo,
  patrimonio,
  empresaSensibilizado,
  patrimonioSensibilizado,
  companyType,
}: {
  activo: number;
  pasivo: number;
  patrimonio: number;
  empresaSensibilizado: number;
  patrimonioSensibilizado: number;
  companyType: "empresa" | "emergente";
}) => {
  const TOTAL_ROWS = 9;
  const isEmergente = companyType === "emergente";
  const empresaRowSpan = getSensibilidadEmpresaRowSpan(empresaSensibilizado, activo, isEmergente);
  const patrimonioRowSpan = getSensibilidadPatrimonioRowSpan(patrimonioSensibilizado, patrimonio, isEmergente);

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
        {/* Bottom dashed line - STATIC */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" style={{ overflow: "visible" }}>
          <line x1="22.2%" y1="99.5%" x2="100%" y2="99.5%" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* Valor Sensibilizado - Empresa (VERDE, IZQUIERDA, bottom-aligned) */}
        <div
          ref={empresaRef}
          className="z-10 col-span-4 border-[3px] border-[#92d050] bg-white rounded-l-xl relative flex flex-col items-center justify-center p-2 col-start-1"
          style={{ gridRowStart: TOTAL_ROWS - empresaRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Valor Sensibilizado
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(empresaSensibilizado)}
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

        {/* Valor Sensibilizado - Patrimonio (MORADO, DERECHA, bottom-aligned) */}
        <div
          ref={patrimonioDynRef}
          className="z-10 col-span-4 border-[3px] border-purple-600 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-15"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioRowSpan + 1, gridRowEnd: TOTAL_ROWS + 1 }}
        >
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Valor Sensibilizado
          </span>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(patrimonioSensibilizado)}
          </span>
        </div>
      </div>
    </div>
  );
};

export const ValoraSensibilidadBalanceSheetBlock: React.FC<
  ValoraSensibilidadBalanceSheetBlockProps
> = ({
  activo,
  pasivo,
  patrimonio,
  conceptosPatrimonioEsperado,
  conceptosPatrimonioSensibilizado,
  integradoPatrimonioEsperado,
  integradoPatrimonioSensibilizado,
  conceptosEmpresaEsperado,
  conceptosEmpresaSensibilizado,
  integradoEmpresaEsperado,
  integradoEmpresaSensibilizado,
  currency,
  availableCurrencies,
  onCurrencyChange,
  variant = "default",
  companyType = "empresa",
}) => {
  return (
    <div className="relative flex h-[480px] min-h-[480px] flex-col rounded-lg bg-white pt-10 shadow overflow-hidden">
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
        <DefaultSensibilidadChart
          activo={activo}
          pasivo={pasivo}
          patrimonio={patrimonio}
          conceptosPatrimonioSensibilizado={conceptosPatrimonioSensibilizado}
          integradoPatrimonioSensibilizado={integradoPatrimonioSensibilizado}
          companyType={companyType}
        />
      )}
      {variant === "conceptos" && (
        <MethodSensibilidadChart
          activo={activo}
          pasivo={pasivo}
          patrimonio={patrimonio}
          empresaSensibilizado={conceptosEmpresaSensibilizado}
          patrimonioSensibilizado={conceptosPatrimonioSensibilizado}
          companyType={companyType}
        />
      )}
      {variant === "integrado" && (
        <MethodSensibilidadChart
          activo={activo}
          pasivo={pasivo}
          patrimonio={patrimonio}
          empresaSensibilizado={integradoEmpresaSensibilizado}
          patrimonioSensibilizado={integradoPatrimonioSensibilizado}
          companyType={companyType}
        />
      )}
    </div>
  );
};
