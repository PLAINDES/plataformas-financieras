import { useState, useCallback, useMemo } from "react";
import type { KapitalFormData } from "@/shared/types";

interface UseSubsectorModalProps {
    formData: KapitalFormData;
    isWaccCalculated: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    subsectorTickersRef: React.MutableRefObject<Record<string, string[]>>;
    subsectorSensibilizacionTickersRef: React.MutableRefObject<Record<string, string[]>>;
}

export function useSubsectorModal({
    formData,
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
        const boas: number[] = activeTickers
            .map((emp) => Number(subsectorDetail.empresas_boa?.[emp]))
            .filter((v) => !isNaN(v));
        if (boas.length === 0) return;
        const avgBoa = boas.reduce((sum, v) => sum + v, 0) / boas.length;
        const betaStr = avgBoa.toFixed(2);

        const isSens = subsectorModalMode === "sensibilizacion";
        const subsectorKey = isSens ? "subsector_sensibilizacion" : "subsector";
        const tickersKey = isSens ? "tickers_subsector_sensibilizacion" : "tickers_subsector";
        const ref = isSens ? subsectorSensibilizacionTickersRef : subsectorTickersRef;

        ref.current[subsectorDetail.subsector] = activeTickers;

        // Siempre actualizamos beta_unlevered_industry y beta_subsector
        // para que se vea reflejado en el Section 1
        handleInputChange({
            target: { name: "beta_subsector", value: betaStr },
        } as any);
        handleInputChange({
            target: { name: "beta_unlevered_industry", value: betaStr },
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
        const boas: number[] = activeTickers
            .map((emp) => Number(subsectorDetail.empresas_boa?.[emp]))
            .filter((v) => !isNaN(v));
        if (boas.length === 0) return null;
        return boas.reduce((sum, v) => sum + v, 0) / boas.length;
    }, [detailTickers, inactiveTickers, subsectorDetail]);

    const openSubsectorModal = () => {
        setSubsectorModalMode(
            (isWaccCalculated && formData.subsector) ? "sensibilizacion" : "principal"
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
