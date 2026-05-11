const parsePercentageValue = (value: string): number => {
  if (!value) return 0;
  const cleaned = value.replace(",", ".").replace("%", "");
  return parseFloat(cleaned) || 0;
};

export const BalanceSheetBlock: React.FC<{
  koa: string;
  kd_1_minus_t: string;
  ke: string;
  compact: boolean;
  D_empresa: string;
}> = ({ koa, kd_1_minus_t, ke, compact, D_empresa }) => {
  const rawPasivoPerc = parsePercentageValue(D_empresa);
  const rawPatrimonioPerc = 100 - rawPasivoPerc;

  const MIN_VISUAL_PERC = 25;
  let visualPasivoPerc = rawPasivoPerc;
  let visualPatrimonioPerc = rawPatrimonioPerc;

  if (visualPasivoPerc < MIN_VISUAL_PERC) {
    visualPasivoPerc = MIN_VISUAL_PERC;
    visualPatrimonioPerc = 100 - MIN_VISUAL_PERC;
  } else if (visualPatrimonioPerc < MIN_VISUAL_PERC) {
    visualPatrimonioPerc = MIN_VISUAL_PERC;
    visualPasivoPerc = 100 - MIN_VISUAL_PERC;
  }

  return (
    <section
      className={`flex flex-col mx-auto w-full max-w-90 ${compact ? "gap-2" : "gap-3"}`}
    >
      <main className={`w-full flex ${compact ? "h-44" : "h-48 md:h-52"}`}>
        {/* Lado Izquierdo: ACTIVO */}
        <div className="w-1/2 p-0.5">
          <div className="h-full border-[3px] border-[#7b1fa2] rounded-l-xl relative p-1 flex flex-col items-center justify-center shadow-sm">
            <div
              className={`absolute top-1 text-gray-400 text-center w-full uppercase tracking-wider ${compact ? "text-[10px]" : "font-medium text-[11px] block"}`}
            >
              Activo
            </div>
            <div
              className={`text-center font-bold text-sm w-full text-gray-800 ${compact ? " mt-2" : "  mt-4"}`}
            >
              Koa = {koa}
            </div>
          </div>
        </div>

        {/* Lado Derecho: PASIVO Y PATRIMONIO */}
        <div className="w-1/2 flex flex-col p-0.5 gap-1">
          {/* Pasivo (Deuda) */}
          <div
            style={{ height: `calc(${visualPasivoPerc}% - 2px)` }}
            className="border-[3px] border-[#4caf50] rounded-tr-xl relative p-0.5 flex flex-col items-center justify-center shadow-sm transition-all duration-500 overflow-hidden"
          >
            <div
              className={`absolute top-0.5 font-medium text-gray-400 text-center w-full uppercase tracking-wider ${compact ? "text-[10px] mb-" : "text-[10px] block"}`}
            >
              Pasivo
            </div>
            <div
              className={`text-center w-full font-bold text-gray-800 ${compact ? "text-xs mt-2.5" : "text-[11px]"}`}
            >
              Kd(1-T) = {kd_1_minus_t}
            </div>
          </div>

          {/* Patrimonio (Equity) */}
          <div
            style={{ height: `calc(${visualPatrimonioPerc}% - 2px)` }}
            className="border-[3px] border-[#03a9f4] rounded-br-xl relative p-2 flex flex-col items-center justify-center shadow-sm transition-all duration-500 overflow-hidden"
          >
            <div
              className={`absolute top-1 text-gray-400 text-center w-full uppercase tracking-wider ${compact ? "text-[10px]" : "font-medium text-[11px] block"}`}
            >
              Patrimonio
            </div>
            <div
              className={`text-center font-bold w-full text-gray-800 ${compact ? "text-sm mt-2" : " text-sm mt-4"}`}
            >
              Ke = {ke}
            </div>
          </div>
        </div>
      </main>

      {/* Leyenda Footer */}
      <footer className="flex w-full justify-between items-center px-1 pt-1">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-6 bg-[#03a9f4] rounded-sm shadow-sm"></div>
          <span className="text-[11px] font-semibold text-gray-600">Ke</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-6 bg-[#7b1fa2] rounded-sm shadow-sm"></div>
          <span className="text-[11px] font-semibold text-gray-600">Koa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-6 bg-[#4caf50] rounded-sm shadow-sm"></div>
          <span className="text-[11px] font-semibold text-gray-600">
            Kd*(1-T)
          </span>
        </div>
      </footer>
    </section>
  );
};
