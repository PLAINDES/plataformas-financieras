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

const formatNumber = (value: number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }
  return value.toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const ConnectorLine = ({
  x1,
  y1,
  x2,
  y2,
}: {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
}) => (
  <line
    x1={x1}
    y1={y1}
    x2={x2}
    y2={y2}
    stroke="#9ca3af"
    strokeWidth="1.5"
    strokeDasharray="5 4"
    vectorEffect="non-scaling-stroke"
  />
);

const DefaultConnections = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
    preserveAspectRatio="none"
  >
    <ConnectorLine x1="44.4%" y1="77%" x2="50%" y2="66.7%" />
    <ConnectorLine x1="44.4%" y1="99.5%" x2="100%" y2="99.5%" />
    <ConnectorLine x1="72.2%" y1="68%" x2="77.8%" y2="55.6%" />
  </svg>
);

const MethodConnections = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full"
    preserveAspectRatio="none"
  >
    <ConnectorLine x1="22.2%" y1="0.5%" x2="27.8%" y2="11.1%" />
    <ConnectorLine x1="22.2%" y1="99.5%" x2="100%" y2="99.5%" />
    <ConnectorLine x1="72.2%" y1="76%" x2="77.8%" y2="66.7%" />
  </svg>
);

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
  return (
    <div className="p-4 flex flex-col justify-end h-full">
      <div className="relative grid gap-0 flex-1 min-h-0" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: "repeat(9, minmax(0, 1fr))" }}>
        <DefaultConnections />
        {/* Activo */}
        <div className="z-10 col-span-4 row-span-9 mr-[3px] border-[3px] border-[#a62cad] bg-white rounded-l-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo */}
        <div className="z-10 col-span-4 row-span-6 col-start-5 mb-[3px] border-[3px] border-green-600 bg-white rounded-tr-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Texto Conceptos */}
        <div className="z-10 col-span-4 row-span-1 col-start-10 row-start-6 flex flex-col items-center justify-end bg-white pb-1">
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight">
            Método Por Conceptos
          </span>
        </div>

        {/* Valor Financiero Patrimonio - Conceptos */}
        <div className="z-10 col-span-4 row-span-3 col-start-10 row-start-7 border-[3px] border-orange-500 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2">
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(conceptosPatrimonio)}
          </span>
        </div>

        {/* Patrimonio */}
        <div className="z-10 col-span-4 row-span-3 col-start-5 row-start-7 border-[3px] border-blue-400 bg-white rounded-br-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Texto Integrado */}
        <div className="z-10 col-span-4 row-span-1 col-start-15 row-start-5 flex flex-col items-center justify-end bg-white pb-1">
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight">
            Método Integrado
          </span>
        </div>

        {/* Valor Financiero Patrimonio - Integrado */}
        <div className="z-10 col-span-4 row-span-4 col-start-15 row-start-6 border-[3px] border-blue-600 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2">
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
  return (
    <div className="p-4 flex flex-col justify-end h-full">
      <div className="relative grid gap-0 flex-1 min-h-0" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: "repeat(9, minmax(0, 1fr))" }}>
        <MethodConnections />
        {/* Valor Financiero de la Empresa */}
        <div className="z-10 col-span-4 row-span-9 border-[3px] border-[#a62cad] bg-white rounded-l-xl relative flex flex-col items-center p-4">
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Valor Financiero de la Empresa
          </span>
          <div className="flex-1 flex items-center justify-center w-full">
            <span className="text-lg font-bold text-gray-800">
              {formatNumber(valorFinancieroEmpresa)}
            </span>
          </div>
        </div>

        {/* Activo */}
        <div className="z-10 col-span-4 row-span-8 col-start-6 row-start-2 mr-[3px] border-[3px] border-blue-500 bg-white rounded-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo */}
        <div className="z-10 col-span-4 row-span-5 col-start-10 row-start-2 mb-[3px] border-[3px] border-blue-500 bg-white rounded-t-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Patrimonio */}
        <div className="z-10 col-span-4 row-span-3 col-start-10 row-start-7 border-[3px] border-blue-500 bg-white rounded-br-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Label Valor Financiero del Patrimonio */}
        <div className="z-10 col-span-4 row-span-1 col-start-15 row-start-6 flex flex-col items-center justify-end bg-white pb-1">
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
        </div>

        {/* Valor Financiero del Patrimonio */}
        <div className="z-10 col-span-4 row-span-3 col-start-15 row-start-7 border-[3px] border-green-600 bg-white rounded-br-xl relative flex flex-col items-center justify-center p-2">
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
  // El Activo, Pasivo y Patrimonio del cuadro general deben mostrarse también
  // en las variantes de conceptos e integrado para mantener consistencia visual.
  return (
    <div className="relative flex h-[420px] min-h-[420px] flex-col overflow-hidden rounded-lg bg-white pt-10 shadow">
      <select
        value={currency}
        onChange={(event) => onCurrencyChange(event.target.value)}
        className="absolute right-4 top-3 z-10 min-w-20 rounded-md border border-gray-300 bg-white px-3 py-1 text-xs font-semibold text-gray-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
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
