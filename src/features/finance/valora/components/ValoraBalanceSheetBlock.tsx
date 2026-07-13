export interface ValoraBalanceSheetBlockProps {
  activo: number;
  pasivo: number;
  patrimonio: number;
  conceptosPatrimonio: number;
  integradoPatrimonio: number;
}

const formatNumber = (value: number) =>
  value.toLocaleString("es-PE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const FinancialValueBox = ({
  label,
  sublabel,
  value,
}: {
  label: string;
  sublabel: string;
  value: number;
}) => (
  <div className="flex-1 border-[3px] border-blue-300 rounded-xl p-3 flex flex-col items-center justify-center bg-blue-50/30">
    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center">
      {label}
    </span>
    <span className="text-[10px] font-semibold text-gray-400 text-center">
      {sublabel}
    </span>
    <span className="text-sm font-bold text-gray-800 mt-1">
      {formatNumber(value)}
    </span>
  </div>
);

export const ValoraBalanceSheetBlock: React.FC<ValoraBalanceSheetBlockProps> = ({
  activo,
  pasivo,
  patrimonio,
  conceptosPatrimonio,
  integradoPatrimonio,
}) => {
  const total = pasivo + patrimonio;
  const MIN_VISUAL = 20;

  let pasivoPct = total > 0 ? (pasivo / total) * 100 : 50;
  let patrimonioPct = total > 0 ? (patrimonio / total) * 100 : 50;

  if (pasivoPct < MIN_VISUAL) {
    pasivoPct = MIN_VISUAL;
    patrimonioPct = 100 - MIN_VISUAL;
  } else if (patrimonioPct < MIN_VISUAL) {
    patrimonioPct = MIN_VISUAL;
    pasivoPct = 100 - MIN_VISUAL;
  }

  return (
    <div className="flex flex-col rounded-lg shadow bg-white overflow-hidden h-full">
      <div className="flex items-center justify-center py-4 px-6 bg-[#f5f8fa]">
        <h2 className="text-sm sm:text-base font-bold text-gray-800 uppercase tracking-tight">
          Balance General Contable
        </h2>
      </div>
      <div className="p-4 flex flex-col gap-4 flex-1">
        <div className="flex h-52 sm:h-60 lg:h-64">
          {/* Activo */}
          <div className="w-1/2 p-0.5">
            <div className="h-full border-[3px] border-purple-800 rounded-l-xl relative flex flex-col items-center justify-center">
              <span className="absolute top-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Activo
              </span>
              <span className="text-sm font-bold text-gray-800 text-center px-2">
                {formatNumber(activo)}
              </span>
            </div>
          </div>

          {/* Pasivo + Patrimonio */}
          <div className="w-1/2 flex flex-col p-0.5 gap-1">
            <div
              style={{ height: `calc(${pasivoPct}% - 2px)` }}
              className="border-[3px] border-green-600 rounded-tr-xl relative flex flex-col items-center justify-center transition-all duration-500"
            >
              <span className="absolute top-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Pasivo
              </span>
              <span className="text-sm font-bold text-gray-800 text-center px-2">
                {formatNumber(pasivo)}
              </span>
            </div>
            <div
              style={{ height: `calc(${patrimonioPct}% - 2px)` }}
              className="border-[3px] border-blue-400 rounded-br-xl relative flex flex-col items-center justify-center transition-all duration-500"
            >
              <span className="absolute top-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Patrimonio
              </span>
              <span className="text-sm font-bold text-gray-800 text-center px-2">
                {formatNumber(patrimonio)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <FinancialValueBox
            label="Valor Financiero del Patrimonio"
            sublabel="Método por Conceptos"
            value={conceptosPatrimonio}
          />
          <FinancialValueBox
            label="Valor Financiero del Patrimonio"
            sublabel="Método Integrado"
            value={integradoPatrimonio}
          />
        </div>
      </div>
    </div>
  );
};
