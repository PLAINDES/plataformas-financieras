import { useState, useCallback, useMemo } from "react";

interface UseSubsectorModalProps {
    isWaccCalculated: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    subsectorTickersRef: React.MutableRefObject<Record<string, string[]>>;
    subsectorSensibilizacionTickersRef: React.MutableRefObject<Record<string, string[]>>;
}

export function useSubsectorModal({
    isWaccCalculated,
    handleInputChange,
    subsectorTickersRef,
    subsectorSensibilizacionTickersRef,
}: UseSubsectorModalProps) {
    const [subsectorModalOpen, setSubsectorModalOpen] = useState(false);
    const [subsectorModalMode, setSubsectorModalMode] = useState<"principal" | "sensibilizacion">("principal");
    const [selectedSubsector, setSelectedSubsector] = useState<string | null>(null);
    const [subsectorDetail, setSubsectorDetail] = useState<any>(null);
    const [detailTickers, setDetailTickers] = useState<string[]>([]);
    const [inactiveTickers, setInactiveTickers] = useState<string[]>([]);

    const handleCloseModal = useCallback(() => {
        setSubsectorModalOpen(false);
        setSubsectorDetail(null);
    }, []);

    const handleOpenDetail = useCallback((sub: any, allTickers: string[], savedTickers?: string[]) => {
        setSubsectorDetail(sub);
        setDetailTickers(allTickers);
        if (savedTickers) {
            const savedSet = new Set(savedTickers);
            setInactiveTickers(allTickers.filter((t) => !savedSet.has(t)));
        } else {
            setInactiveTickers([]);
        }
    }, []);

    const handleToggleTicker = useCallback((ticker: string) => {
        setInactiveTickers((prev) =>
            prev.includes(ticker)
                ? prev.filter((t) => t !== ticker)
                : [...prev, ticker]
        );
    }, []);

    const handleCalculateDetail = useCallback(() => {
        if (!subsectorDetail) return;
        const activeTickers = detailTickers.filter((t) => !inactiveTickers.includes(t));

        // BOA Ponderado: Σ(Wi% × beta_unlevered) donde Wi% = total_activos_i / Σtotal_activos
        const activosTotal = activeTickers.reduce((sum, emp) => {
            const activos = Number(subsectorDetail.ticker_info?.[emp]?.total_activos) || 0;
            return sum + activos;
        }, 0);
        if (activosTotal === 0) return;

        let boaPonderado = 0;
        for (const emp of activeTickers) {
            const boa = Number(subsectorDetail.empresas_boa?.[emp]) || 0;
            const activos = Number(subsectorDetail.ticker_info?.[emp]?.total_activos) || 0;
            const wi = activos / activosTotal;
            boaPonderado += wi * boa;
        }
        const betaStr = boaPonderado.toFixed(2);

        const isSens = subsectorModalMode === "sensibilizacion";
        const subsectorKey = isSens ? "subsector_sensibilizacion" : "subsector";
        const tickersKey = isSens ? "tickers_subsector_sensibilizacion" : "tickers_subsector";
        const ref = isSens ? subsectorSensibilizacionTickersRef : subsectorTickersRef;

        ref.current[subsectorDetail.subsector] = activeTickers;

        handleInputChange({
            target: { name: "beta_subsector", value: betaStr },
        } as any);

        if (isSens) {
            handleInputChange({
                target: { name: "beta_unlevered", value: betaStr },
            } as any);
        }

        handleInputChange({
            target: { name: subsectorKey, value: subsectorDetail.subsector || "" },
        } as any);
        handleInputChange({
            target: { name: tickersKey, value: JSON.stringify(activeTickers) },
        } as any);
        setSubsectorDetail(null);
        setSubsectorModalOpen(false);
    }, [subsectorDetail, detailTickers, inactiveTickers, handleInputChange, isWaccCalculated, subsectorModalMode, subsectorTickersRef, subsectorSensibilizacionTickersRef]);

    const detailBoa = useMemo(() => {
        const activeTickers = detailTickers.filter((t) => !inactiveTickers.includes(t));
        if (activeTickers.length === 0 || !subsectorDetail) return null;

        // BOA Ponderado: Σ(Wi% × beta_unlevered)
        const activosTotal = activeTickers.reduce((sum, emp) => {
            const activos = Number(subsectorDetail.ticker_info?.[emp]?.total_activos) || 0;
            return sum + activos;
        }, 0);
        if (activosTotal === 0) return null;

        let boaPonderado = 0;
        for (const emp of activeTickers) {
            const boa = Number(subsectorDetail.empresas_boa?.[emp]) || 0;
            const activos = Number(subsectorDetail.ticker_info?.[emp]?.total_activos) || 0;
            const wi = activos / activosTotal;
            boaPonderado += wi * boa;
        }
        return boaPonderado;
    }, [detailTickers, inactiveTickers, subsectorDetail]);

    const openSubsectorModal = () => {
        if (!isWaccCalculated) return;
        // Si ya se calculó el WACC, cualquier subsector seleccionado posteriormente
        // se destina exclusivamente a la sensibilización, no a resultados generales.
        setSubsectorModalMode(
            isWaccCalculated ? "sensibilizacion" : "principal"
        );
        setSubsectorModalOpen(true);
        setSelectedSubsector(null);
        setSubsectorDetail(null);
    };

    return {
        subsectorModalOpen,
        setSubsectorModalOpen,
        subsectorModalMode,
        setSubsectorModalMode,
        selectedSubsector,
        setSelectedSubsector,
        subsectorDetail,
        setSubsectorDetail,
        detailTickers,
        setDetailTickers,
        inactiveTickers,
        setInactiveTickers,
        handleCloseModal,
        handleOpenDetail,
        handleToggleTicker,
        handleCalculateDetail,
        detailBoa,
        openSubsectorModal,
    };
}
