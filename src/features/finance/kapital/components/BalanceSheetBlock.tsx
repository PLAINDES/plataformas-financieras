export const BalanceSheetBlock: React.FC<{
  koa: string;
  kd: string;
  ke: string;
  compact: boolean;
}> = ({ koa, kd, ke, compact }) => (
  <section
    className={`flex flex-col p-2 mx-auto w-full max-w-[320px] ${compact ? "gap-2" : "gap-3"}`}
  >
    <main
      className={`w-full flex ${compact ? "h-32 md:h-36" : "h-48 md:h-52"}`}
    >
      {/* Lado Izquierdo: ACTIVO */}
      <div className="w-1/2 p-0.5">
        <div className="h-full border-[3px] border-[#7b1fa2] rounded-l-xl relative p-2 flex flex-col items-center justify-center shadow-sm">
          <div
            className={`absolute top-2 text-gray-400 text-center w-full uppercase tracking-wider ${compact ? "text-[9px]" : "font-medium text-[11px] block"}`}
          >
            Activo
          </div>
          <div
            className={`text-center w-full text-gray-800 ${compact ? "text-xs mt-2" : "font-bold text-sm mt-4"}`}
          >
            Koa = {koa}
          </div>
        </div>
      </div>

      {/* Lado Derecho: PASIVO Y PATRIMONIO */}
      <div className="w-1/2 flex flex-col p-0.5 gap-1">
        {/* Pasivo (1/3 de la altura) */}
        <div className="h-1/3 border-[3px] border-[#4caf50] rounded-tr-xl relative p-2 flex flex-col items-center justify-center shadow-sm">
          <div
            className={`absolute top-1 font-medium text-gray-400 text-center w-full uppercase tracking-wider ${compact ? "text-[8px] mb-2" : "text-[10px] block"}`}
          >
            Pasivo{" "}
            {/* Ocultamos la etiqueta en modo compacto si no entra, o puedes dejarla */}
          </div>
          <div
            className={`text-center w-full text-gray-800 ${compact ? "text-[10px] mt-2.5" : "mt-auto mb-auto font-medium text-[11px]"}`}
          >
            Kd(1-T) = {kd}
          </div>
        </div>

        {/* Patrimonio (2/3 de la altura) */}
        <div className="h-2/3 border-[3px] border-[#03a9f4] rounded-br-xl relative p-2 flex flex-col items-center justify-center shadow-sm">
          <div
            className={`absolute top-2 text-gray-400 text-center w-full uppercase tracking-wider ${compact ? "text-[9px]" : "font-medium text-[11px] block"}`}
          >
            Patrimonio
          </div>
          <div
            className={`text-center w-full text-gray-800 ${compact ? "text-xs mt-2" : "font-bold text-sm mt-4"}`}
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
