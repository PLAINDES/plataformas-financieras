import { useRef, useState } from "react";
import { MainService } from "@/shared/services/main.service";
import { generateCalculationCode } from "../../kapital/services/kapital.utils";
import type { Calculation } from "@/shared/types";
import type {
  FinancialTable,
  FormData,
  ValoraSensibilidadEntry,
} from "@/shared/types/ValoraTypes";
import type { ToastType } from "@/shared/types/toast.types";

export type ValoraResultView = "original" | "sensibilidad" | "comparacion";

const normalizeTableThousandsSeparators = (
  table: FinancialTable | null
): FinancialTable | null => {
  if (!table) return table;

  return {
    ...table,
    rows: table.rows.map((row) => ({
      ...row,
      values: row.values.map((rawValue) => {
        const value = Number(rawValue);
        return Number.isFinite(value) &&
          !Number.isInteger(value) &&
          Math.abs(value) < 10_000
          ? Math.round(value * 1_000)
          : value;
      }),
    })),
  };
};

interface UseValoraCalculationProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  balanceTable: FinancialTable | null;
  setBalanceTable: React.Dispatch<React.SetStateAction<FinancialTable | null>>;
  resultsTable: FinancialTable | null;
  setResultsTable: React.Dispatch<React.SetStateAction<FinancialTable | null>>;
  fileUploaded: boolean;
  setFileUploaded?: React.Dispatch<React.SetStateAction<boolean>>;
  addToast: (type: ToastType, message: string) => void;
  userId?: number | string | null;
  ui: {
    setShowResults: (show: boolean) => void;
    setIsDesktopFormOpen: (open: boolean) => void;
    setResultsSection: (section: "resultados" | "estados") => void;
  };
}

export function useValoraCalculation({
  formData,
  setFormData,
  balanceTable,
  setBalanceTable,
  resultsTable,
  setResultsTable,
  fileUploaded,
  setFileUploaded,
  addToast,
  userId,
  ui,
}: UseValoraCalculationProps) {
  const [currentCalculation, setCurrentCalculation] = useState<Calculation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [resultView, setResultView] = useState<ValoraResultView>("original");
  const [sensibilizaciones, setSensibilizaciones] = useState<ValoraSensibilidadEntry[]>([]);
  const [selectedSensIdx, setSelectedSensIdx] = useState(0);
  const [isSessionFresh, setIsSessionFresh] = useState(false);
  const loadFromUrlCalledRef = useRef(false);

  const parseWaccValue = (raw: unknown): number | undefined => {
    if (raw === undefined || raw === null || raw === "") return undefined;
    if (typeof raw === "number") return Number.isFinite(raw) ? raw : undefined;
    const str = String(raw).trim().replace("%", "").replace(",", ".");
    const num = Number(str);
    if (!Number.isFinite(num)) return undefined;
    return Math.abs(num) < 1 && num !== 0 ? num * 100 : num;
  };

  const extractSensibilizaciones = (
    data: unknown
  ): ValoraSensibilidadEntry[] => {
    if (!data || typeof data !== "object") return [];
    const d = data as Record<string, unknown>;
    const raw = d.sensibilizacion ?? d.sensibilidad;
    if (!Array.isArray(raw)) return [];
    return raw.map((entry: any) => {
      const inputs = entry.inputs ?? entry.input ?? {};
      const resultados = entry.resultados ?? entry.resultado ?? {};
      const waccRaw =
        entry.wacc ??
        entry.WACC ??
        resultados.wacc ??
        resultados.WACC ??
        entry.wacc_emergente ??
        inputs.wacc ??
        inputs.WACC;
      const parseNum = (v: unknown) => {
        if (v === undefined || v === null || String(v).trim() === "") return undefined;
        const n = Number(String(v).replace(",", "."));
        return Number.isFinite(n) ? n : undefined;
      };
      return {
        ...entry,
        // Histórico sin subsector queda undefined -> selector mostrará "Escenario N" + Beta en subtítulo
        subsector:
          entry.subsector ??
          entry.sector ??
          inputs.subsector ??
          inputs.subsector_sensibilizacion ??
          inputs.sector ??
          undefined,
        wacc: parseWaccValue(waccRaw),
        revenue_forecast_rate: parseNum(
          entry.revenue_forecast_rate ??
            entry.forecast_ingresos ??
            inputs.revenue_forecast_rate ??
            inputs.forecast_ingresos ??
            inputs.revenue_forecast_rate ??
            entry.tasa_forecast
        ),
        fdc_forecast_rate: parseNum(
          entry.fdc_forecast_rate ??
            entry.forecast_fde ??
            inputs.fdc_forecast_rate ??
            inputs.forecast_fde ??
            entry.tasa_fdc
        ),
        perpetual_growth_rate: parseNum(
          entry.perpetual_growth_rate ??
            entry.crecimiento_perpetuo ??
            inputs.perpetual_growth_rate ??
            inputs.crecimiento_perpetuo ??
            entry.tasa_perpetua
        ),
      } as ValoraSensibilidadEntry;
    });
  };

  const getCodeFromUrl = (): string | null => {
    const pathname = window.location.pathname;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length >= 2 && parts[0] === "valora") {
      return parts[1];
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("calc") || params.get("code");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const missingFields: string[] = [];
    if (!formData.date) missingFields.push("Fecha");
    if (!formData.country) missingFields.push("País");
    if (!formData.currency) missingFields.push("Moneda");
    if (!formData.sector) missingFields.push("Sector");
    if (!fileUploaded && !hasCalculated && !formData.fileUsername) {
      missingFields.push("Plantilla EEFF");
    }

    if (missingFields.length > 0) {
      addToast("warn", `Completa los campos: ${missingFields.join(", ")}`);
      return;
    }

    let currentUserId = userId;
    if (!currentUserId) {
      try {
        const storedUser = localStorage.getItem("user_data");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          currentUserId = parsed.id;
        }
      } catch (err) {
        console.warn("Could not read user from storage", err);
      }
    }

    ui.setShowResults(false);
    setIsLoading(true);

    const normalizedBalanceTable =
      normalizeTableThousandsSeparators(balanceTable);
    const normalizedResultsTable =
      normalizeTableThousandsSeparators(resultsTable);

    if (normalizedBalanceTable !== balanceTable) {
      console.info(
        "[VALORA][UPLOAD] Separadores de miles normalizados en el balance."
      );
    }

    if (normalizedResultsTable !== resultsTable) {
      console.info(
        "[VALORA][UPLOAD] Separadores de miles normalizados en resultados."
      );
    }

    const inputPayload = {
      ...formData,
      balance_table: normalizedBalanceTable,
      results_table: normalizedResultsTable,
    };

    // formData Tasas debug removed

    try {
      let persistedCalculation: Calculation;
      if (currentCalculation) {
        persistedCalculation = await MainService.updateCalculation(
          currentCalculation.id,
          {
            data: {
              inputs: [inputPayload],
            },
          }
        );
      } else {
        persistedCalculation = await MainService.createCalculation({
          calculation_file_id: null,
          user_id: currentUserId ? Number(currentUserId) : null,
          code: generateCalculationCode(),
          type: "valora",
          data: {
            inputs: [inputPayload],
          },
        });

        window.history.pushState(
          {},
          "",
          `/valora/${persistedCalculation.code}`
        );
      }

      // Parche frontend: backend no persiste subsector nombre, inyecta último seleccionado localmente
      const rawSens = extractSensibilizaciones(persistedCalculation.data);
      let patchedSens = rawSens;
      const lastSelectedSubsector = (formData as any).subsector_sensibilizacion || (formData as any).subsector;
      if (lastSelectedSubsector && rawSens.length > 0 && !rawSens[0]?.subsector) {
        patchedSens = rawSens.map((entry, idx) =>
          idx === 0 ? { ...entry, subsector: lastSelectedSubsector } : entry
        );
        // Persiste parche en data para que recarga mantenga nombre sin depender de backend
        (persistedCalculation.data as any).sensibilizacion = patchedSens;
        // Intenta guardar en backend de forma best-effort (no bloquea)
        if (currentCalculation) {
          MainService.updateCalculation(persistedCalculation.id, {
            data: { sensibilizacion: patchedSens } as any,
          }).catch(() => {});
        }
      }

      setCurrentCalculation(persistedCalculation);
      setHasCalculated(true);
      setIsSessionFresh(true);

      const sensibilizacionesData = patchedSens;
      setSensibilizaciones(sensibilizacionesData);
      setSelectedSensIdx(
        sensibilizacionesData.length > 0 ? 0 : 0
      );

      const hasSensitivity = sensibilizacionesData.length > 0;
      setResultView(hasSensitivity ? "sensibilidad" : "original");

      ui.setShowResults(true);
      ui.setIsDesktopFormOpen(false);
      ui.setResultsSection("resultados");

      addToast("success", "Cálculo Valora generado y guardado correctamente.");
    } catch (error) {
      console.error("Error in Valora calculation", error);
      addToast("error", "No se pudo guardar el cálculo. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromUrl = async () => {
    if (loadFromUrlCalledRef.current) return;
    loadFromUrlCalledRef.current = true;
    try {
      const code = getCodeFromUrl();
      if (!code) return;

      const calculationData = await MainService.getCalculationByCode(code);
      if (calculationData && calculationData.type === "valora") {
        setCurrentCalculation(calculationData);

        const dataObj = calculationData.data as { inputs?: any[] };
        const inputs = dataObj?.inputs || [];
        const latestInput = inputs[inputs.length - 1];

        if (latestInput) {
          setFormData((prev) => ({
            ...prev,
            ...latestInput,
          }));

          if (latestInput.balance_table) {
            setBalanceTable(latestInput.balance_table);
          }
          if (latestInput.results_table) {
            setResultsTable(latestInput.results_table);
          }

          if (setFileUploaded && (latestInput.fileUsername || latestInput.balance_table)) {
            setFileUploaded(true);
          }

          setHasCalculated(true);
          let sensibilizacionesData = extractSensibilizaciones(
            calculationData.data
          );
          // Patch Kapital-style: si entry no trae subsector, usa último input sensibilización
          const latestSubsector = (latestInput as any)?.subsector_sensibilizacion;
          const latestTickers = (latestInput as any)?.tickers_subsector_sensibilizacion;
          if ((latestSubsector || latestTickers) && sensibilizacionesData.length > 0) {
            sensibilizacionesData = sensibilizacionesData.map((entry) => ({
              ...entry,
              subsector: (entry as any).subsector || latestSubsector || undefined,
              tickers: (entry as any).tickers || latestTickers || undefined,
            }));
          }
          setSensibilizaciones(sensibilizacionesData);
          setSelectedSensIdx(sensibilizacionesData.length > 0 ? sensibilizacionesData.length - 1 : 0);
          const hasSavedSensitivity = sensibilizacionesData.length > 0;
          setResultView(hasSavedSensitivity ? "sensibilidad" : "original");
           ui.setShowResults(true);
           ui.setIsDesktopFormOpen(false);
           setIsSessionFresh(false);
           addToast("info", `Cálculo Valora (${code}) cargado correctamente.`);
        }
      }
    } catch (error) {
      console.error("Error loading Valora calculation from URL", error);
    }
  };

  return {
    currentCalculation,
    isLoading,
    hasCalculated,
    isSessionFresh,
    setIsSessionFresh,
    resultView,
    setResultView,
    sensibilizaciones,
    selectedSensIdx,
    setSelectedSensIdx,
    handleSubmit,
    loadFromUrl,
  };
}
