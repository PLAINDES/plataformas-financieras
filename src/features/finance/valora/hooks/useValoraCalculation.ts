import { useRef, useState } from "react";
import { MainService } from "@/shared/services/main.service";
import { generateCalculationCode } from "../../kapital/services/kapital.utils";
import type { Calculation } from "@/shared/types";
import type { FinancialTable, FormData } from "@/shared/types/ValoraTypes";
import type { ToastType } from "@/shared/types/toast.types";

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
  const loadFromUrlCalledRef = useRef(false);

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

      setCurrentCalculation(persistedCalculation);
      setHasCalculated(true);

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
          ui.setShowResults(true);
          ui.setIsDesktopFormOpen(false);
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
    handleSubmit,
    loadFromUrl,
  };
}
