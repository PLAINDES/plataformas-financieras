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
  variant?: "default" | "conceptos" | "integrado";
}

const DefaultSensibilidadChart = ({
  activo,
  pasivo,
  patrimonio,
  conceptosPatrimonioSensibilizado,
  integradoPatrimonioSensibilizado,
}: {
  activo: number;
  pasivo: number;
  patrimonio: number;
  conceptosPatrimonioSensibilizado: number;
  integradoPatrimonioSensibilizado: number;
}) => {
  return (
    <div className="p-4 flex flex-col justify-end h-full">
      <div
        className="grid gap-0 flex-1 min-h-0"
        style={{
          gridTemplateColumns: "repeat(18, minmax(0, 1fr))",
          gridTemplateRows: "repeat(9, minmax(0, 1fr))",
        }}
      >
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

        {/* Texto Conceptos Sensibilizado */}
        <div className="col-span-4 row-span-1 col-start-10 row-start-6 flex flex-col items-center justify-end pb-1">
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight">
            Método Por Conceptos Sensibilizado
          </span>
        </div>

        {/* Conexión Patrimonio - Conceptos */}
        <div className="col-span-1 row-span-3 col-start-9 row-start-7 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Valor Financiero Patrimonio - Conceptos Sensibilizado */}
        <div className="col-span-4 row-span-3 col-start-10 row-start-7 border-[3px] border-orange-500 rounded-br-xl relative flex flex-col items-center justify-center p-2">
          <span className="text-lg font-bold text-gray-800">
            {formatNumber(conceptosPatrimonioSensibilizado)}
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

        {/* Texto Integrado Sensibilizado */}
        <div className="col-span-4 row-span-1 col-start-15 row-start-5 flex flex-col items-center justify-end pb-1">
          <span className="text-[11px] font-bold text-center text-gray-800 leading-tight">
            Valor Financiero del Patrimonio
          </span>
          <span className="text-sm font-black text-center text-gray-900 leading-tight">
            Método Integrado Sensibilizado
          </span>
        </div>

        {/* Conexión Conceptos - Integrado */}
        <div className="col-span-1 row-span-3 col-start-14 row-start-7 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Valor Financiero Patrimonio - Integrado Sensibilizado */}
        <div className="col-span-4 row-span-4 col-start-15 row-start-6 border-[3px] border-blue-600 rounded-br-xl relative flex flex-col items-center justify-center p-2">
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
  empresaEsperado,
  empresaSensibilizado,
  patrimonioEsperado,
  patrimonioSensibilizado,
}: {
  activo: number;
  pasivo: number;
  patrimonio: number;
  empresaEsperado: number;
  empresaSensibilizado: number;
  patrimonioEsperado: number;
  patrimonioSensibilizado: number;
}) => {
  const patrimonioSensibilizadoEsMayor =
    patrimonioSensibilizado >= patrimonioEsperado;

  return (
    <div className="p-4 flex flex-col justify-end h-full">
      <div
        className="grid gap-0 flex-1 min-h-0"
        style={{
          gridTemplateColumns: "repeat(28, minmax(0, 1fr))",
          gridTemplateRows: "repeat(12, minmax(0, 1fr))",
        }}
      >
        {/* Valor Sensibilizado - Empresa */}
        <div className="col-span-4 row-span-12 col-start-1 row-start-1 border-[3px] border-green-600 rounded-l-xl rounded-r-xl relative flex flex-col items-center p-3">
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Valor
          </span>
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Sensibilizado
          </span>
          <div className="flex-1 flex items-center justify-center w-full">
            <span className="text-lg font-bold text-gray-800 text-center px-2">
              {formatNumber(empresaSensibilizado)}
            </span>
          </div>
        </div>

        {/* Conexión entre Valores de Empresa */}
        <div className="col-span-1 row-span-12 col-start-5 row-start-1 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Valor Esperado - Empresa */}
        <div className="col-span-4 row-span-11 col-start-6 row-start-2 border-[3px] border-green-400 rounded-l-xl rounded-r-xl relative flex flex-col items-center p-3">
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Valor
          </span>
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Esperado
          </span>
          <div className="flex-1 flex items-center justify-center w-full">
            <span className="text-lg font-bold text-gray-800 text-center px-2">
              {formatNumber(empresaEsperado)}
            </span>
          </div>
        </div>

        {/* Conexión Empresa - Activo */}
        <div className="col-span-1 row-span-11 col-start-10 row-start-2 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Activo */}
        <div className="col-span-4 row-span-10 col-start-11 row-start-3 border-[3px] border-blue-500 rounded-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Activo
          </span>
          <span className="text-lg font-bold text-gray-800 text-center px-2">
            {formatNumber(activo)}
          </span>
        </div>

        {/* Pasivo */}
        <div className="col-span-4 row-span-6 col-start-15 row-start-3 border-[3px] border-blue-500 rounded-tr-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Pasivo
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(pasivo)}
          </span>
        </div>

        {/* Patrimonio */}
        <div className="col-span-4 row-span-4 col-start-15 row-start-9 border-[3px] border-blue-500 rounded-br-xl relative flex flex-col items-center justify-center">
          <span className="absolute top-3 text-sm font-black uppercase tracking-widest text-gray-800">
            Patrimonio
          </span>
          <span className="text-base font-bold text-gray-800 text-center px-2">
            {formatNumber(patrimonio)}
          </span>
        </div>

        {/* Conexión Patrimonio - Valor Esperado Patrimonio */}
        <div className="col-span-1 row-span-4 col-start-19 row-start-9 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Valor Esperado - Patrimonio */}
        <div
          className={`col-span-4 ${
            patrimonioSensibilizadoEsMayor
              ? "row-span-3 row-start-10"
              : "row-span-5 row-start-8"
          } col-start-20 border-[3px] border-purple-400 rounded-t-xl rounded-bl-xl relative flex flex-col items-center justify-center p-2`}
        >
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Valor Esperado
          </span>
          <span className="text-lg font-bold text-gray-800 mt-2">
            {formatNumber(patrimonioEsperado)}
          </span>
        </div>

        {/* Conexión entre Valores de Patrimonio */}
        <div className="col-span-1 row-span-4 col-start-24 row-start-9 flex items-center justify-center">
          <DoubleConnection />
        </div>

        {/* Valor Sensibilizado - Patrimonio */}
        <div
          className={`col-span-4 ${
            patrimonioSensibilizadoEsMayor
              ? "row-span-5 row-start-8"
              : "row-span-3 row-start-10"
          } col-start-25 border-[3px] border-purple-800 rounded-t-xl rounded-r-xl relative flex flex-col items-center justify-center p-2`}
        >
          <span className="text-sm font-bold text-center text-gray-800 leading-tight">
            Valor Sensibilizado
          </span>
          <span className="text-lg font-bold text-gray-800 mt-2">
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
  variant = "default",
}) => {
  return (
    <div className="flex flex-col rounded-lg shadow bg-white overflow-hidden h-full">
      {variant === "default" && (
        <DefaultSensibilidadChart
          activo={activo}
          pasivo={pasivo}
          patrimonio={patrimonio}
          conceptosPatrimonioSensibilizado={conceptosPatrimonioSensibilizado}
          integradoPatrimonioSensibilizado={integradoPatrimonioSensibilizado}
        />
      )}
      {variant === "conceptos" && (
        <MethodSensibilidadChart
          activo={activo}
          pasivo={pasivo}
          patrimonio={patrimonio}
          empresaEsperado={conceptosEmpresaEsperado}
          empresaSensibilizado={conceptosEmpresaSensibilizado}
          patrimonioEsperado={conceptosPatrimonioEsperado}
          patrimonioSensibilizado={conceptosPatrimonioSensibilizado}
        />
      )}
      {variant === "integrado" && (
        <MethodSensibilidadChart
          activo={activo}
          pasivo={pasivo}
          patrimonio={patrimonio}
          empresaEsperado={integradoEmpresaEsperado}
          empresaSensibilizado={integradoEmpresaSensibilizado}
          patrimonioEsperado={integradoPatrimonioEsperado}
          patrimonioSensibilizado={integradoPatrimonioSensibilizado}
        />
      )}
    </div>
  );
};
