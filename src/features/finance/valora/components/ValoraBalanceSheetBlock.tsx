import { useRef } from "react";
import { formatNumber, getMaxAbs, getProportionalRowSpan, getBalanceRowSpans, DynamicConnector } from "./ValoraChartUtils";

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

// Umbrales en filas del grid (240 filas, ~1.6px/fila a 480px de alto).
// Estrategia: conservar título y valor DENTRO del bloque siempre que
// sea posible. Solo cuando ni siquiera la versión compacta cabe, se
// dibujan como epígrafe encima (sin inflar la altura, que deformaría
// las proporciones contables).
const MIN_INSIDE_LABEL_ROWS = 52;
const COMPACT_LABEL_ROWS = 28;
const MIN_VALUE_ROWS = 28;
const TINY_VALUE_ROWS = 16;

type LabelMode = "inside" | "compact" | "outside";
type ValueMode = "normal" | "small" | "outside";

const labelMode = (rowSpan: number): LabelMode =>
  rowSpan < COMPACT_LABEL_ROWS
    ? "outside"
    : rowSpan < MIN_INSIDE_LABEL_ROWS
      ? "compact"
      : "inside";

const valueMode = (rowSpan: number): ValueMode =>
  rowSpan < TINY_VALUE_ROWS
    ? "outside"
    : rowSpan < MIN_VALUE_ROWS
      ? "small"
      : "normal";

// Título + valor de un bloque contable. En modo compact se apilan y
// centran juntos dentro del bloque con texto menor; solo en outside
// salen como epígrafe encima.
function BlockLabels({
  title,
  value,
  mode,
  valueClassName = "text-lg",
}: {
  title: string;
  value: string;
  mode: LabelMode;
  valueClassName?: string;
}) {
  if (mode === "outside") {
    return (
      <div className="absolute bottom-full mb-2 left-0 right-0 flex flex-col items-center gap-0.5 px-1">
        <span className="text-sm font-black uppercase tracking-widest text-gray-800 text-center">
          {title}
        </span>
        <span className="text-base font-bold text-gray-800 text-center">
          {value}
        </span>
      </div>
    );
  }
  if (mode === "compact") {
    return (
      <div className="flex flex-col items-center justify-center gap-0.5 px-1 text-center">
        <span className="text-[14px] font-black uppercase tracking-widest text-gray-800 leading-tight">
          {title}
        </span>
        <span className="text-sm font-bold text-gray-800 leading-tight">
          {value}
        </span>
      </div>
    );
  }
  return (
    <>
      <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
        {title}
      </span>
      <span className={`${valueClassName} font-bold text-gray-800 text-center px-2`}>
        {value}
      </span>
    </>
  );
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
  const TOTAL_ROWS = 240;
  const maxVal = getMaxAbs(activo, pasivo, patrimonio, conceptosPatrimonio, integradoPatrimonio);
  const { activoRowSpan, pasivoRowSpan, patrimonioRowSpan: patrimonioContableRowSpan } = getBalanceRowSpans(activo, pasivo, patrimonio, maxVal, TOTAL_ROWS);
  // Mínimo bajo para no deformar proporciones: la legibilidad de los
  // bloques pequeños la resuelve el epígrafe exterior (ver abajo).
  const conceptosPatRowSpan = getProportionalRowSpan(conceptosPatrimonio, maxVal, TOTAL_ROWS, 12);
  const integradoPatRowSpan = getProportionalRowSpan(integradoPatrimonio, maxVal, TOTAL_ROWS, 12);
  const activoMode = labelMode(activoRowSpan);
  const pasivoMode = labelMode(pasivoRowSpan);
  const patrimonioContableMode = labelMode(patrimonioContableRowSpan);
  const conceptosValueMode = valueMode(conceptosPatRowSpan);
  const integradoValueMode = valueMode(integradoPatRowSpan);

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
        {/* Activo - DINÁMICO proporcional al máximo global (ancho intacto: col-span-4) */}
        <div
          className="z-10 col-span-4 mr-[3px] border-[3px] border-[#a62cad] bg-white rounded-l-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - activoRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <BlockLabels title="Activo" value={formatNumber(activo)} mode={activoMode} />
        </div>

        {/* Pasivo - DINÁMICO proporcional al máximo global (ancho intacto) */}
        <div
          className="z-10 col-span-4 col-start-5 border-[3px] border-green-600 bg-white rounded-tr-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioContableRowSpan - pasivoRowSpan, gridRowEnd: TOTAL_ROWS - patrimonioContableRowSpan }}
        >
          <BlockLabels title="Pasivo" value={formatNumber(pasivo)} mode={pasivoMode} valueClassName="text-base" />
        </div>

        {/* Patrimonio - DINÁMICO proporcional al máximo global (ancho intacto) */}
        <div
          ref={patrimonioRef}
          className="z-10 col-span-4 col-start-5 border-[3px] border-blue-400 bg-white rounded-br-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioContableRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <BlockLabels title="Patrimonio" value={formatNumber(patrimonio)} mode={patrimonioContableMode} valueClassName="text-base" />
        </div>

        {/* Conceptos Patrimonio - DINÁMICO (NARANJA, título arriba como en comparación) */}
        <div
          ref={conceptosRef}
          className="z-10 col-span-4 border-[3px] border-orange-500 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-10"
          style={{ gridRowStart: TOTAL_ROWS - conceptosPatRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <div className="absolute bottom-full mb-2 left-0 right-0 flex flex-col items-center gap-0.5 px-1">
            <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
              Valor Financiero del Patrimonio
            </span>
            <span className="text-sm font-black text-center text-gray-900 leading-tight">
              Método Por Conceptos
            </span>
            {conceptosValueMode === "outside" && (
              <span className="text-base font-bold text-center text-gray-800 leading-tight">
                {formatNumber(conceptosPatrimonio)}
              </span>
            )}
          </div>
          {conceptosValueMode !== "outside" && (
            <span className={`font-bold text-gray-800 ${conceptosValueMode === "small" ? "text-sm" : "text-lg"}`}>
              {formatNumber(conceptosPatrimonio)}
            </span>
          )}
        </div>

        {/* Integrado Patrimonio - DINÁMICO (AZUL, título arriba como en comparación) */}
        <div
          ref={integradoRef}
          className="z-10 col-span-4 border-[3px] border-blue-600 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-15"
          style={{ gridRowStart: TOTAL_ROWS - integradoPatRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <div className="absolute bottom-full mb-2 left-0 right-0 flex flex-col items-center gap-0.5 px-1">
            <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
              Valor Financiero del Patrimonio
            </span>
            <span className="text-sm font-black text-center text-gray-900 leading-tight">
              Método Integrado
            </span>
            {integradoValueMode === "outside" && (
              <span className="text-base font-bold text-center text-gray-800 leading-tight">
                {formatNumber(integradoPatrimonio)}
              </span>
            )}
          </div>
          {integradoValueMode !== "outside" && (
            <span className={`font-bold text-gray-800 ${integradoValueMode === "small" ? "text-sm" : "text-lg"}`}>
              {formatNumber(integradoPatrimonio)}
            </span>
          )}
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
  const TOTAL_ROWS = 240;
  const maxVal = getMaxAbs(activo, pasivo, patrimonio, valorFinancieroPatrimonio, valorFinancieroEmpresa);
  const { activoRowSpan, pasivoRowSpan, patrimonioRowSpan: patrimonioContableRowSpan } = getBalanceRowSpans(activo, pasivo, patrimonio, maxVal, TOTAL_ROWS);
  const empresaRowSpan = getProportionalRowSpan(valorFinancieroEmpresa, maxVal, TOTAL_ROWS, 12);
  const patrimonioRowSpan = getProportionalRowSpan(valorFinancieroPatrimonio, maxVal, TOTAL_ROWS, 12);
  const activoMode = labelMode(activoRowSpan);
  const pasivoMode = labelMode(pasivoRowSpan);
  const patrimonioContableMode = labelMode(patrimonioContableRowSpan);
  const empresaValueMode = valueMode(empresaRowSpan);
  const patrimonioValueMode = valueMode(patrimonioRowSpan);

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
        {/* Empresa - DINÁMICO (VERDE, IZQUIERDA, título arriba como en comparación) */}
        <div
          ref={empresaRef}
          className="z-10 col-span-4 border-[3px] border-[#a12d94] bg-white rounded-l-xl relative flex flex-col items-center justify-center p-2 col-start-1"
          style={{ gridRowStart: TOTAL_ROWS - empresaRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <div className="absolute bottom-full mb-2 left-0 right-0 flex flex-col items-center gap-0.5 px-1">
            <span className="text-sm font-bold text-center text-gray-800 leading-tight">
              Valor Financiero de la Empresa
            </span>
            {empresaValueMode === "outside" && (
              <span className="text-base font-bold text-center text-gray-800 leading-tight">
                {formatNumber(valorFinancieroEmpresa)}
              </span>
            )}
          </div>
          {empresaValueMode !== "outside" && (
            <span className={`font-bold text-gray-800 ${empresaValueMode === "small" ? "text-sm" : "text-lg"}`}>
              {formatNumber(valorFinancieroEmpresa)}
            </span>
          )}
        </div>

        {/* Activo - DINÁMICO proporcional al máximo global (ancho intacto: col-span-4 col-start-6) */}
        <div
          ref={activoRef}
          className="z-10 col-span-4 col-start-6 mr-[3px] border-[3px] border-blue-500 bg-white rounded-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - activoRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <BlockLabels title="Activo" value={formatNumber(activo)} mode={activoMode} />
        </div>

        {/* Pasivo - DINÁMICO proporcional al máximo global (ancho intacto) */}
        <div
          className="z-10 col-span-4 col-start-10 border-[3px] border-blue-500 bg-white rounded-t-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioContableRowSpan - pasivoRowSpan, gridRowEnd: TOTAL_ROWS - patrimonioContableRowSpan }}
        >
          <BlockLabels title="Pasivo" value={formatNumber(pasivo)} mode={pasivoMode} valueClassName="text-base" />
        </div>

        {/* Patrimonio - DINÁMICO proporcional al máximo global (ancho intacto) */}
        <div
          ref={patrimonioRef}
          className="z-10 col-span-4 col-start-10 border-[3px] border-blue-500 bg-white rounded-br-xl relative flex flex-col items-center justify-center"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioContableRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <BlockLabels title="Patrimonio" value={formatNumber(patrimonio)} mode={patrimonioContableMode} valueClassName="text-base" />
        </div>

        {/* Patrimonio - DINÁMICO (MORADO, DERECHA, título arriba como en comparación) */}
        <div
          ref={patrimonioDynRef}
          className="z-10 col-span-4 border-[3px] border-[#00b050] bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2 col-start-15"
          style={{ gridRowStart: TOTAL_ROWS - patrimonioRowSpan, gridRowEnd: TOTAL_ROWS }}
        >
          <div className="absolute bottom-full mb-2 left-0 right-0 flex flex-col items-center gap-0.5 px-1">
            <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
              Valor Financiero del Patrimonio
            </span>
            {patrimonioValueMode === "outside" && (
              <span className="text-base font-bold text-center text-gray-800 leading-tight">
                {formatNumber(valorFinancieroPatrimonio)}
              </span>
            )}
          </div>
          {patrimonioValueMode !== "outside" && (
            <span className={`font-bold text-gray-800 ${patrimonioValueMode === "small" ? "text-sm" : "text-lg"}`}>
              {formatNumber(valorFinancieroPatrimonio)}
            </span>
          )}
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
    <div className="relative flex h-[480px] min-h-[480px] flex-col overflow-hidden rounded-lg bg-white pt-16 shadow">
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
