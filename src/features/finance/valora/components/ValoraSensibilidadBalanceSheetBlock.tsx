import { useRef } from "react";
import { formatNumber, getMaxAbs, getProportionalRowSpan, getBalanceRowSpans, DynamicConnector } from "./ValoraChartUtils";

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
  companyType: _companyType,
}: {
  activo: number;
  pasivo: number;
  patrimonio: number;
  conceptosPatrimonioSensibilizado: number;
  integradoPatrimonioSensibilizado: number;
  companyType: "empresa" | "emergente";
}) => {
  const TOTAL_ROWS = 240;
  // mismo anclaje que GeneralComparison: balance no comprimido por outlier sensibilizado
  const maxBalance = getMaxAbs(activo, pasivo, patrimonio);
  const maxOverall = getMaxAbs(activo, pasivo, patrimonio, conceptosPatrimonioSensibilizado, integradoPatrimonioSensibilizado);
  const { activoRowSpan, pasivoRowSpan, patrimonioRowSpan: patrimonioContableRowSpan } = getBalanceRowSpans(activo, pasivo, patrimonio, maxOverall, TOTAL_ROWS);
  // Altura mínima reforzada: el valor menor debe seguir visible sobre la línea base.
  const conceptosPatRowSpan = getProportionalRowSpan(conceptosPatrimonioSensibilizado, maxBalance, TOTAL_ROWS, 20);
  const integradoPatRowSpan = getProportionalRowSpan(integradoPatrimonioSensibilizado, maxOverall, TOTAL_ROWS, 20);

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

        {/* Activo - DINÁMICO proporcional al máximo global (ancho intacto: col-span-4) */}
        <div
          className="col-span-4 mr-[3px] border-[3px] border-[#a62cad] rounded-l-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - activoRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo - DINÁMICO proporcional al máximo global (ancho intacto) */}
        <div
          className="col-span-4 col-start-5 border-[3px] border-green-600 rounded-tr-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioContableRowSpan - pasivoRowSpan, gridRowEnd: TOTAL_ROWS - patrimonioContableRowSpan }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Patrimonio - DINÁMICO proporcional al máximo global (ancho intacto) */}
        <div
          ref={patrimonioRef}
          className="col-span-4 col-start-5 border-[3px] border-blue-400 rounded-br-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioContableRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Conceptos Sensibilizado - DINÁMICO (NARANJA, título arriba como en comparación) */}
        <div
          ref={conceptosRef}
          className="z-10 col-span-4 border-[3px] border-orange-400 rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-10"
          style={{ gridRowStart: TOTAL_ROWS - conceptosPatRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <div className="absolute bottom-full mb-1 left-0 right-0 flex flex-col items-center gap-0.5 px-1">
            <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
              Valor Financiero del Patrimonio
            </span>
            <span className="text-sm font-black text-center text-gray-900 leading-tight">
              Método Por Conceptos
            </span>
            <span className="text-[11px] font-black text-center text-gray-900 leading-tight">
              Sensibilizado
            </span>
          </div>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(conceptosPatrimonioSensibilizado)}
          </span>
        </div>

        {/* Integrado Sensibilizado - DINÁMICO (AZUL, título arriba como en comparación) */}
        <div
          ref={integradoRef}
          className="z-10 col-span-4 border-[3px] border-[#0101ff] rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-15"
          style={{ gridRowStart: TOTAL_ROWS - integradoPatRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <div className="absolute bottom-full mb-1 left-0 right-0 flex flex-col items-center gap-0.5 px-1">
            <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
              Valor Financiero del Patrimonio
            </span>
            <span className="text-sm font-black text-center text-gray-900 leading-tight">
              Método Integrado
            </span>
            <span className="text-[11px] font-black text-center text-gray-900 leading-tight">
              Sensibilizado
            </span>
          </div>
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
  companyType: _companyType,
}: {
  activo: number;
  pasivo: number;
  patrimonio: number;
  empresaSensibilizado: number;
  patrimonioSensibilizado: number;
  companyType: "empresa" | "emergente";
}) => {
  const TOTAL_ROWS = 240;
  const maxVal = getMaxAbs(activo, pasivo, patrimonio, empresaSensibilizado, patrimonioSensibilizado);
  const { activoRowSpan, pasivoRowSpan, patrimonioRowSpan: patrimonioContableRowSpan } = getBalanceRowSpans(activo, pasivo, patrimonio, maxVal, TOTAL_ROWS);
  const empresaRowSpan = getProportionalRowSpan(empresaSensibilizado, maxVal, TOTAL_ROWS, 20);
  const patrimonioRowSpan = getProportionalRowSpan(patrimonioSensibilizado, maxVal, TOTAL_ROWS, 20);

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

        {/* Valor Sensibilizado - Empresa (VERDE, IZQUIERDA, título arriba como en comparación) */}
        <div
          ref={empresaRef}
          className="z-10 col-span-4 border-[3px] border-[#92d050] bg-white rounded-l-xl relative flex flex-col items-center justify-center p-2 col-start-1"
          style={{ gridRowStart: TOTAL_ROWS - empresaRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <div className="absolute bottom-full mb-1 left-0 right-0 flex flex-col items-center gap-0.5 px-1">
            <span className="text-sm font-bold text-center text-gray-800 leading-tight">
              Valor Sensibilizado
            </span>
          </div>
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(empresaSensibilizado)}
          </span>
        </div>

        {/* Activo - DINÁMICO proporcional al máximo global (ancho intacto: col-span-4 col-start-6) */}
        <div
          ref={activoRef}
          className="z-10 col-span-4 col-start-6 mr-[3px] border-[3px] border-blue-500 bg-white rounded-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - activoRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo - DINÁMICO proporcional al máximo global (ancho intacto) */}
        <div
          className="z-10 col-span-4 col-start-10 border-[3px] border-blue-500 bg-white rounded-t-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioContableRowSpan - pasivoRowSpan, gridRowEnd: TOTAL_ROWS - patrimonioContableRowSpan }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Patrimonio - DINÁMICO proporcional al máximo global (ancho intacto) */}
        <div
          ref={patrimonioRef}
          className="z-10 col-span-4 col-start-10 border-[3px] border-blue-500 bg-white rounded-br-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioContableRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Valor Sensibilizado - Patrimonio (MORADO, DERECHA, título arriba como en comparación) */}
        <div
          ref={patrimonioDynRef}
          className="z-10 col-span-4 border-[3px] border-purple-600 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-15"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <div className="absolute bottom-full mb-1 left-0 right-0 flex flex-col items-center gap-0.5 px-1">
            <span className="text-sm font-bold text-center text-gray-800 leading-tight">
              Valor Sensibilizado
            </span>
          </div>
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
  conceptosPatrimonioSensibilizado,
  integradoPatrimonioSensibilizado,
  conceptosEmpresaSensibilizado,
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
        disabled={availableCurrencies.length <= 1}
        title={availableCurrencies.length <= 1 ? `Moneda de los EEFF: ${currency}` : "Moneda de resultados"}
        className={`absolute right-6 top-6 z-10 min-w-24 rounded-md border border-gray-300 px-3.5 py-1.5 text-sm font-semibold text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 ${availableCurrencies.length <= 1 ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}`}
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
