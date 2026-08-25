import { Bot, X } from "lucide-react";

interface SubsectorModalProps {
    subsectorDetail: any;
    detailTickers: string[];
    inactiveTickers: string[];
    subsectorModalMode: "principal" | "sensibilizacion";
    isWaccCalculated: boolean;
    formDataSubsector: string | undefined;
    formDataSubsectorSensibilizacion: string | undefined;
    selectedSubsector: string | null;
    filteredSubsectores: any[];
    subsectoresFecha: string | null;
    detailBoa: number | null;
    onSetSubsectorDetail: (sub: any) => void;
    onCloseModal: () => void;
    onOpenDetail: (sub: any, allTickers: string[], savedTickers?: string[]) => void;
    onToggleTicker: (ticker: string) => void;
    onCalculateDetail: () => void;
    onSetSubsectorModalMode: (mode: "principal" | "sensibilizacion") => void;
    subsectorTickersRef: React.MutableRefObject<Record<string, string[]>>;
    subsectorSensibilizacionTickersRef: React.MutableRefObject<Record<string, string[]>>;
}

export const SubsectorModal: React.FC<SubsectorModalProps> = ({
    subsectorDetail,
    detailTickers,
    inactiveTickers,
    subsectorModalMode,
    isWaccCalculated,
    formDataSubsector,
    formDataSubsectorSensibilizacion,
    selectedSubsector,
    filteredSubsectores,
    subsectoresFecha,
    detailBoa,
    onSetSubsectorDetail,
    onCloseModal,
    onOpenDetail,
    onToggleTicker,
    onCalculateDetail,
    onSetSubsectorModalMode: _onSetSubsectorModalMode,
    subsectorTickersRef,
    subsectorSensibilizacionTickersRef,
}) => {
    if (subsectorDetail) {
        return (
            <>
                {/* Detail header */}
                <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 border-b border-gray-100 bg-gray-50/60 shrink-0">
                    <button
                        type="button"
                        onClick={() => onSetSubsectorDetail(null)}
                        className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded-full transition-colors cursor-pointer shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 shadow-xs shrink-0">
                            <Bot className="w-3.5 h-3.5 text-valora-primary" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-slate-700 truncate">
                            {subsectorDetail.subsector || "Subsector"}
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onCloseModal}
                        className="ml-auto p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Detail body */}
                <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto min-h-0 bg-slate-50/40">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-0">
                        <div className="shrink-0 px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
                            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
                                Empresas ({detailTickers.length - inactiveTickers.length} activas / {detailTickers.length})
                            </span>
                        </div>
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {/* Table header */}
                            <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                <span>Empresa</span>
                                <span className="text-right min-w-[100px]">Activo de Mercado</span>
                                <span className="text-right min-w-[70px]">BOA</span>
                                <span className="w-8" />
                            </div>
                            <div className="divide-y divide-gray-100">
                                {detailTickers.length > 0 ? (
                                    [...detailTickers].sort().map((emp: string, i: number) => {
                                        const boa = subsectorDetail.empresas_boa[emp];
                                        const info = subsectorDetail.ticker_info?.[emp];
                                        const isInactive = inactiveTickers.includes(emp);
                                        const activoMercado = info?.activo_mercado ?? info?.total_activos ?? null;
                                        return (
                                            <div
                                                key={i}
                                                className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-2.5 transition-colors ${
                                                    isInactive ? "opacity-40 hover:opacity-60" : "hover:bg-gray-50/50"
                                                }`}
                                            >
                                                <span className={`text-xs font-bold truncate ${isInactive ? "text-gray-400 line-through" : "text-blue-600"}`}>
                                                    {emp}
                                                </span>
                                                <span className={`text-xs font-mono text-right min-w-[100px] ${isInactive ? "text-gray-400" : "text-gray-700"}`}>
                                                    {activoMercado != null ? Number(activoMercado).toLocaleString("en-US") : "N/A"}
                                                </span>
                                                <span className={`text-xs font-mono font-bold text-right min-w-[70px] ${isInactive ? "text-gray-400" : "text-gray-800"}`}>
                                                    {boa != null ? Number(boa).toFixed(4) : "N/A"}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => onToggleTicker(emp)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors cursor-pointer ${
                                                        isInactive
                                                            ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                                            : "text-red-400 hover:bg-red-50 hover:text-red-600"
                                                    }`}
                                                    title={isInactive ? "Incluir empresa" : "Excluir empresa"}
                                                >
                                                    {isInactive ? (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="px-4 py-8 text-center">
                                        <span className="text-xs text-gray-400">No hay empresas disponibles</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {detailBoa !== null && (
                            <div className="sticky bottom-0 bg-white z-10 border-t border-valora-primary/10 rounded-b-xl">
                                <div className="flex items-center justify-between px-4 py-2.5 bg-valora-primary/5">
                                    <span className="text-[10px] font-bold text-blue-700 uppercase">BOA Ponderado</span>
                                    <span className="text-lg font-black text-valora-primary leading-none">{detailBoa.toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {detailTickers.length > 0 && detailBoa !== null && (
                        <div className="mt-auto pt-4">
                            <button
                                type="button"
                                onClick={onCalculateDetail}
                                className="w-full py-3 px-6 rounded-lg font-bold text-xs sm:text-sm text-white bg-valora-primary hover:bg-valora-secondary transition-all cursor-pointer shadow-lg hover:shadow-xl active:scale-[0.98]"
                            >
                                Calcular con {detailTickers.length - inactiveTickers.length} empresa{(detailTickers.length - inactiveTickers.length) !== 1 ? "s" : ""} — BOA {detailBoa.toFixed(2)}
                            </button>
                        </div>
                    )}
                </div>
            </>
        );
    }

    // Not in detail view
    const isPrincipalLocked = subsectorModalMode === "principal" && isWaccCalculated && formDataSubsector;

    return (
        <>
            {/* Header with tabs */}
            <div className="flex flex-col shrink-0">
                <div className="flex justify-between items-center px-3 py-2 sm:px-4 sm:py-2.5 border-b border-gray-100 bg-gray-50/60">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 shadow-xs">
                            <Bot className="w-3.5 h-3.5 text-valora-primary" />
                        </div>
                        <span className="text-xs sm:text-[13px] font-semibold tracking-tight text-slate-700">
                            Subsectores
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={onCloseModal}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex border-b border-gray-200 bg-white">
                    {subsectorModalMode === "principal" ? (
                        <div className="flex-1 px-3 py-2 text-xs font-semibold tracking-tight text-center text-valora-primary border-b-2 border-valora-primary bg-valora-primary/5">
                            <div className="flex items-center justify-center gap-1.5">
                                {isWaccCalculated && formDataSubsector && (
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                )}
                                Principal
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 px-3 py-2 text-xs font-semibold tracking-tight text-center text-valora-primary border-b-2 border-valora-primary bg-valora-primary/5">
                            Sensibilización
                        </div>
                    )}
                </div>
            </div>

            {false && isPrincipalLocked ? (
                /* Principal locked after WACC calculated */
                (() => {
                    const sub = filteredSubsectores.find(
                        (s: any) => s.subsector === formDataSubsector
                    );
                    const savedTickers = subsectorTickersRef.current[formDataSubsector || ""] || [];
                    const allTickersConBoa = Array.isArray(sub?.empresas) ? sub.empresas : [];
                    const tickersParaBoa = savedTickers.length > 0 ? savedTickers : allTickersConBoa;
                    const activosTotal = tickersParaBoa.reduce((sum: number, emp: string) => {
                        const activos = Number(sub?.ticker_info?.[emp]?.total_activos) || 0;
                        return sum + activos;
                    }, 0);
                    const avgBoa = activosTotal > 0
                        ? tickersParaBoa.reduce((sum: number, emp: string) => {
                            const boa = Number(sub?.empresas_boa?.[emp]) || 0;
                            const activos = Number(sub?.ticker_info?.[emp]?.total_activos) || 0;
                            return sum + (activos / activosTotal) * boa;
                        }, 0).toFixed(2)
                        : null;

                    return (
                        <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto min-h-0 bg-slate-50/40">
                            <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white rounded-xl border border-gray-100 shadow-sm py-12">
                                <div className="w-12 h-12 rounded-full bg-valora-primary/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-valora-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <div className="text-center px-6">
                                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                                        {formDataSubsector}
                                    </h3>
                                    {tickersParaBoa.length > 0 && (
                                        <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-600">
                                            <span>{tickersParaBoa.length} empresa{tickersParaBoa.length !== 1 ? "s" : ""}</span>
                                            {avgBoa && (
                                                <>
                                                    <span className="text-gray-300">|</span>
                                                     <span className="font-bold text-valora-primary">BOA P. {avgBoa}</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-[11px] text-gray-500 mt-3">
                                        Subsector principal bloqueado. Usa la pestaña "Sensibilización" para probar otros valores.
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })()
            ) : (
                /* Subsector list */
                <>
                    <div className="flex-1 flex flex-col p-4 sm:p-5 overflow-y-auto gap-3 min-h-0 bg-slate-50/40">
                        {filteredSubsectores.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                                <span className="text-xs font-semibold text-gray-500">
                                    No hay subsectores disponibles para esta industria.
                                </span>
                            </div>
                        ) : (
                            filteredSubsectores.map((sub: any, idx: number) => {
                                const isSens = subsectorModalMode === "sensibilizacion";
                                const isPrincipal = isSens && sub.subsector === formDataSubsector;
                                const allTickersConBoa = Array.isArray(sub.empresas) ? sub.empresas : [];
                                const selectedRef = isSens
                                    ? (formDataSubsectorSensibilizacion || "")
                                    : (selectedSubsector || formDataSubsector || "");
                                const isSelected = sub.subsector === selectedRef;
                                const savedTickers = isSens
                                    ? subsectorSensibilizacionTickersRef.current[sub.subsector]
                                    : subsectorTickersRef.current[sub.subsector];
                                const tickersParaBoa = savedTickers || allTickersConBoa;
                                // BOA Ponderado: Σ(Wi% × beta_unlevered) usando total_activos como peso
                                const activosTotal = tickersParaBoa.reduce((sum: number, emp: string) => {
                                    const activos = Number(sub.ticker_info?.[emp]?.total_activos) || 0;
                                    return sum + activos;
                                }, 0);
                                const avgBoa = activosTotal > 0
                                    ? tickersParaBoa.reduce((sum: number, emp: string) => {
                                        const boa = Number(sub.empresas_boa?.[emp]) || 0;
                                        const activos = Number(sub.ticker_info?.[emp]?.total_activos) || 0;
                                        return sum + (activos / activosTotal) * boa;
                                    }, 0)
                                    : null;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => !isPrincipal && onOpenDetail(sub, allTickersConBoa, savedTickers)}
                                        className={`rounded-xl border shadow-sm transition-all px-4 py-3.5 flex items-center justify-between gap-2 ${
                                            isPrincipal
                                                ? "bg-blue-50/60 border-blue-200 cursor-not-allowed opacity-80"
                                                : `group cursor-pointer active:scale-[0.99] ${
                                                    isSelected
                                                        ? "bg-valora-primary/5 border-valora-primary shadow-md"
                                                        : "bg-white border-gray-200 shadow-sm hover:border-valora-primary/40 hover:shadow-md"
                                                }`
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <h3 className={`text-sm font-bold truncate transition-colors ${
                                                isPrincipal ? "text-blue-500" : isSelected ? "text-valora-primary" : "text-gray-800 group-hover:text-valora-primary"
                                            }`}>
                                                {sub.subsector || "Subsector"}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {isPrincipal && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                    </svg>
                                                    Principal
                                                </span>
                                            )}
                                            {isSelected && !isPrincipal && (
                                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                    Usado
                                                </span>
                                            )}
                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                {sub.empresas?.length || 0} emp.
                                            </span>
                                            {avgBoa !== null && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wide hidden sm:inline">
                                                        BOA P.
                                                    </span>
                                                    <span className="text-lg font-black text-valora-primary leading-none">
                                                        {avgBoa.toFixed(2)}
                                                    </span>
                                                </div>
                                            )}
                                            {!isPrincipal && (
                                                <svg className="w-4 h-4 text-gray-300 group-hover:text-valora-primary/40 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {subsectoresFecha && (
                        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/60 shrink-0">
                            <span className="text-[11px] text-gray-400 font-medium">
                                Actualizado{" "}
                                {new Date(subsectoresFecha).toLocaleDateString("es-PE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                })}
                            </span>
                        </div>
                    )}
                </>
            )}
        </>
    );
};
