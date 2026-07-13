import { useState, useEffect, useMemo } from "react";
import { MainService } from "@/shared/services/main.service";

export function useKapitalData(
    sector: string,
    subsectorTickersRef: React.RefObject<Record<string, string[]>>,
    subsectorSensibilizacionTickersRef: React.RefObject<Record<string, string[]>>
) {
    const [subsectoresData, setSubsectoresData] = useState<any[]>([]);
    const [subsectoresFecha, setSubsectoresFecha] = useState<string | null>(null);

    // Fetch subsectores
    useEffect(() => {
        const fetchSubsectores = async () => {
            try {
                const data = await MainService.getTemplateComplements("subsectores");
                const match = data.find((c: any) => c.nombre === "subsectores");
                const items = match && Array.isArray(match.data) ? match.data : [];
                setSubsectoresData(items);
                if (match?.fecha) {
                    setSubsectoresFecha(match.fecha);
                }
            } catch (error) {
                console.error("Error fetching subsectores data", error);
            }
        };
        fetchSubsectores();
    }, []);

    const filteredSubsectores = useMemo(() => {
        if (!sector) return [];
        return subsectoresData.filter((d: any) => d.sector === sector);
    }, [subsectoresData, sector]);

    // Sync restored tickers from URL to refs
    const syncTickersFromUrl = (
        field: "tickers_subsector" | "tickers_subsector_sensibilizacion",
        subsectorField: "subsector" | "subsector_sensibilizacion",
        value: string,
        subsectorValue: string | undefined
    ) => {
        if (value && subsectorField && subsectorTickersRef.current && subsectorSensibilizacionTickersRef.current) {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) {
                    if (field === "tickers_subsector") {
                        subsectorTickersRef.current[subsectorValue || ""] = parsed;
                    } else {
                        subsectorSensibilizacionTickersRef.current[subsectorValue || ""] = parsed;
                    }
                }
            } catch { /* ignore invalid parse */ }
        }
    };

    return {
        subsectoresData,
        subsectoresFecha,
        filteredSubsectores,
        syncTickersFromUrl,
    };
}
