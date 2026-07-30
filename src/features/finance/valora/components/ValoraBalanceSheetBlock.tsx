export interface ValoraBalanceSheetBlockProps {
  activo: number;
  pasivo: number;
  patrimonio: number;
  conceptosPatrimonio: number;
  integradoPatrimonio: number;
  conceptosEmpresa: number;
  integradoEmpresa: number;
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

const DoubleConnection = () => (
  <div className="relative h-full w-full">
    <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-gray-400"></div>
    <div className="absolute bottom-0 left-0 right-0 border-t-2 border-dashed border-gray-400"></div>
  </div>
);

const DefaultBalanceChart = ({
  activo,
  pasivo,
  patrimonio,
  conceptosPatrimonio,
  integradoPatrimonio,
}: {
  activo: number;
  pasivo: number;
  patrimonio: number;
  conceptosPatrimonio: number;
  integradoPatrimonio: number;
}) => {
  return (
    <div className="p-4 flex flex-col justify-end h-full">
      <div className="grid gap-0 flex-1 min-h-0" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: "repeat(9, minmax(0, 1fr))" }}>
        {/* Activo */}
        <div className="col-span-4 row-span-9 border-[3px] border-purple-800 rounded-l-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo */}
        <div className="col-span-4 row-span-6 col-start-5 border-[3px] border-green-600 rounded-tr-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Texto Conceptos */}
        <div className="col-span-4 row-span-1 col-start-10 row-start-6 flex flex-col items-center justify-end pb-1">
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight">
            Método Por Conceptos
          </span>
        </div>

        {/* Conexión Patrimonio - Conceptos */}
        <div className="col-span-1 row-span-3 col-start-9 row-start-7 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Valor Financiero Patrimonio - Conceptos */}
        <div className="col-span-4 row-span-3 col-start-10 row-start-7 border-[3px] border-orange-500 rounded-br-xl relative flex flex-col items-center justify-center p-2">
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(conceptosPatrimonio)}
          </span>
        </div>

        {/* Patrimonio */}
        <div className="col-span-4 row-span-3 col-start-5 row-start-7 border-[3px] border-blue-400 rounded-br-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Texto Integrado */}
        <div className="col-span-4 row-span-1 col-start-15 row-start-5 flex flex-col items-center justify-end pb-1">
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight">
            Método Integrado
          </span>
        </div>

        {/* Conexión Conceptos - Integrado */}
        <div className="col-span-1 row-span-3 col-start-14 row-start-7 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Valor Financiero Patrimonio - Integrado */}
        <div className="col-span-4 row-span-4 col-start-15 row-start-6 border-[3px] border-blue-600 rounded-br-xl relative flex flex-col items-center justify-center p-2">
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
  activo: number;
  pasivo: number;
  patrimonio: number;
  valorFinancieroPatrimonio: number;
  valorFinancieroEmpresa: number;
}) => {
  return (
    <div className="p-4 flex flex-col justify-end h-full">
      <div className="grid gap-0 flex-1 min-h-0" style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))", gridTemplateRows: "repeat(9, minmax(0, 1fr))" }}>
        {/* Valor Financiero de la Empresa */}
        <div className="col-span-4 row-span-9 border-[3px] border-purple-800 rounded-l-xl relative flex flex-col items-center p-4">
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Valor Financiero de la Empresa
          </span>
          <div className="flex-1 flex items-center justify-center w-full">
            <span className="text-lg font-bold text-gray-800">
              {formatNumber(valorFinancieroEmpresa)}
            </span>
          </div>
        </div>

        {/* Conexión Valor Empresa - Activo */}
        <div className="col-span-1 row-span-8 col-start-5 row-start-2 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Activo */}
        <div className="col-span-4 row-span-8 col-start-6 row-start-2 border-[3px] border-blue-500 rounded-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo */}
        <div className="col-span-4 row-span-5 col-start-10 row-start-2 border-[3px] border-blue-500 rounded-t-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Patrimonio */}
        <div className="col-span-4 row-span-3 col-start-10 row-start-7 border-[3px] border-blue-500 rounded-br-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Conexión Patrimonio - Valor Financiero Patrimonio */}
        <div className="col-span-1 row-span-3 col-start-14 row-start-7 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Label Valor Financiero del Patrimonio */}
        <div className="col-span-4 row-span-1 col-start-15 row-start-6 flex flex-col items-center justify-end pb-1">
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
        </div>

        {/* Valor Financiero del Patrimonio */}
        <div className="col-span-4 row-span-3 col-start-15 row-start-7 border-[3px] border-green-600 rounded-br-xl relative flex flex-col items-center justify-center p-2">
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
  conceptosPatrimonio,
  integradoPatrimonio,
  conceptosEmpresa,
  integradoEmpresa,
  variant = "default",
}) => {
  return (
    <div className="flex flex-col rounded-lg shadow bg-white overflow-hidden h-full">
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
