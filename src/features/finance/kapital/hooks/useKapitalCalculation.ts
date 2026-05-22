// src/features/kapital/hooks/useKapitalCalculation.ts
import { useState } from "react";
import { MainService } from "@/shared/services/main.service";
import {
  computeResultsFromCalculationData,
  extractSensibilizaciones,
} from "../services/kapital.utils";
import { type Calculation } from "@/shared/types";
import { type ToastType } from "@/shared/types/toast.types";
import {
  toOptionalNumber,
  enrichCalculationInputPayload,
  buildCalculationDataPayload,
  generateCalculationCode,
} from "../services/kapital.utils";

import {
  type FormData,
  type Results,
  type SensibilizacionEntry,
} from "../KapitalPage";

export interface UseKapitalCalculationProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  prewarmedSessionId: string | null;
  setPrewarmedSessionId: React.Dispatch<React.SetStateAction<string | null>>;
  addToast: (type: ToastType, message: string) => void;
  userId?: number | string; // Lo pasamos desde el componente principal
  ui: {
    setShowResults: (val: boolean) => void;
    setIsFormOpen: (val: boolean) => void;
    setResultsSection: (val: "result" | "sensitivity") => void;
    setShowComparison: (val: boolean) => void;
    setIsChatbotOpen: (val: boolean) => void;
  };
}

export function useKapitalCalculation({
  formData,
  setFormData,
  prewarmedSessionId,
  setPrewarmedSessionId,
  addToast,
  userId,
  ui,
}: UseKapitalCalculationProps) {
  const [currentCalculation, setCurrentCalculation] =
    useState<Calculation | null>(null);
  const [results, setResults] = useState<Results | null>(null);
  const [sensibilizaciones, setSensibilizaciones] = useState<
    SensibilizacionEntry[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaccCalculated, setIsWaccCalculated] = useState(false);

  const [showCompanyCard, setShowCompanyCard] = useState<boolean>(false);
  const [resultCurrency, setResultCurrency] = useState<"pen" | "usd">("pen");

  const handleSubmit = async (e?: React.FormEvent, explicitBeta?: string) => {
    if (e) e.preventDefault();

    // Si llega beta desde el chabot
    const dataToSubmit = { ...formData };
    if (explicitBeta !== undefined) {
      dataToSubmit.beta_unlevered = explicitBeta;
      setFormData((prev) => ({ ...prev, beta_unlevered: explicitBeta }));
    }

    const missingFields: string[] = [];
    if (!dataToSubmit.date) missingFields.push("Fecha");
    if (!dataToSubmit.sector) missingFields.push("Sector");
    if (!dataToSubmit.country) missingFields.push("País");
    if (missingFields.length > 0) {
      addToast("warn", `Completa los campos: ${missingFields.join(", ")}`);
      return;
    }

    // --- CORRECCIÓN DE AUTENTICACIÓN ---
    let currentUserId = userId;
    if (!currentUserId) {
      try {
        // Leemos la llave que usa useAuth
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

    const betaUnlevered = toOptionalNumber(dataToSubmit.beta_unlevered);
    const isBetaUpdate =
      isWaccCalculated && currentCalculation && betaUnlevered !== undefined;

    try {
      let persistedCalculation: Calculation;
      // Si ya hay un cálculo actual, SIEMPRE hacemos PUT
      if (currentCalculation) {
        const updated = await MainService.updateCalculation(
          currentCalculation!.id,
          {
            data: {
              inputs: [enrichCalculationInputPayload(dataToSubmit)],
              active_session_id: prewarmedSessionId,
            },
          }
        );
        persistedCalculation = await MainService.getCalculation(updated.id);
      } else {
        // CREATE new calculation
        const created = await MainService.createCalculation({
          calculation_file_id: null,
          user_id: currentUserId ? Number(currentUserId) : null,
          code: generateCalculationCode(),
          type: "kapital",
          data: {
            ...buildCalculationDataPayload(),
            inputs: [enrichCalculationInputPayload(dataToSubmit)],
            prewarmed_session_id: prewarmedSessionId,
          },
        });
        persistedCalculation = await MainService.getCalculation(created.id);

        window.history.pushState(
          {},
          "",
          `/kapital/${persistedCalculation.code}`
        );
      }

      const newSessionId = persistedCalculation.data?.active_session_id as
        | string
        | undefined;
      if (newSessionId && newSessionId !== prewarmedSessionId) {
        setPrewarmedSessionId(newSessionId);
      }

      const { results: rebuiltResults, showCompanyCard: hasCompanyData } =
        computeResultsFromCalculationData(persistedCalculation.data);
      const sensibilizacionData = extractSensibilizaciones(
        persistedCalculation.data
      );

      setResults(rebuiltResults);
      setShowCompanyCard(hasCompanyData);
      setCurrentCalculation(persistedCalculation);
      setSensibilizaciones(sensibilizacionData);
      setIsWaccCalculated(true);

      ui.setShowResults(true);
      ui.setIsFormOpen(false);

      if (isBetaUpdate) {
        // Navigate a sensitivity cuando se manda el beta desapalancado para sensibilización
        ui.setResultsSection("sensitivity");
        ui.setShowComparison(false);
        ui.setIsChatbotOpen(false);
        addToast(
          "success",
          `Sensibilización calculada con β=${betaUnlevered} (cálculo #${persistedCalculation.id}).`
        );
      } else {
        ui.setResultsSection("result");
        addToast(
          "success",
          `Resultados generados y guardados (cálculo #${persistedCalculation.id}).`
        );
      }
    } catch (error) {
      console.error("Error in Kapital calculation", error);
      addToast("error", "No se pudo guardar el cálculo. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromUrl = async () => {
    // Extrae el código de la URL, formato /kapital/{code}
    const pathParts = window.location.pathname.split("/");
    const code = pathParts[pathParts.length - 1];

    if (code && code !== "kapital" && code !== "") {
      try {
        const calculationData = await MainService.getCalculationByCode(code);

        if (calculationData) {
          setCurrentCalculation(calculationData);

          // Reconstruir resultados y sensibilizaciones
          const { results: rebuiltResults, showCompanyCard: hasCompanyData } =
            computeResultsFromCalculationData(calculationData.data);
          const sensibilizacionData = extractSensibilizaciones(
            calculationData.data
          );

          // Reconstruir el formData con el último input guardado
          const dataObj = calculationData.data as { inputs?: any[] };
          const latestInput = Array.isArray(dataObj.inputs)
            ? dataObj.inputs[0]
            : undefined;

          if (latestInput) {
            setFormData((prev) => ({
              ...prev,
              date: (latestInput.fecha as string) || "",
              sector: (latestInput.industria as string) || "",
              instrument: (latestInput.tasa_libre_riesgo as string) || "",
              bono: (latestInput.anio_bono as string) || "",
              country: (latestInput.pais as string) || "",
              currency: (latestInput.moneda as string) || "USD",
              tax: (latestInput.tasa_impositiva as string) || "",
              kd: (latestInput.costo_deuda as string) || "",
              debt: (latestInput.porcentaje_deuda as string) || "",
              capital: (latestInput.porcentaje_capital as string) || "",
              dc_ratio: (latestInput.dc_ratio as string) || "",
              effective_tax_rate:
                (latestInput.tasa_efectiva_impuesto as string) || "",
              beta_levered: (latestInput.beta_apalancado as string) || "",
              typeId: !!(
                latestInput.costo_deuda || latestInput.porcentaje_deuda
              ),
            }));

            if (latestInput.moneda === "USD") {
              setResultCurrency("usd");
            } else {
              setResultCurrency("pen");
            }
          }

          setResults(rebuiltResults);
          setShowCompanyCard(hasCompanyData);
          setSensibilizaciones(sensibilizacionData);
          setIsWaccCalculated(true);
          ui.setShowResults(true);
          ui.setIsFormOpen(false);
        }
      } catch (error) {
        console.error("No se encontró el cálculo en la URL", error);
      }
      // Iniciamos el pre-warm en segundo plano
      MainService.prewarmSession()
        .then((data) => {
          if (data && data.session_id) {
            // Si el pre-warm fue exitoso, guardamos el ID para que arranque el Heartbeat
            setPrewarmedSessionId(data.session_id);
          }
        })
        .catch((e) => {
          console.warn("Pre-warm background failed", e);
        });
    }
  };

  const handleAnalysisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      addToast(
        "info",
        "La sensibilización ahora se calcula desde Excel. Presiona CALCULA TU WACC para refrescar datos."
      );
    }, 800);
  };

  return {
    handleSubmit,
    loadFromUrl,
    handleAnalysisSubmit,
    currentCalculation,
    results,
    sensibilizaciones,
    isLoading,
    isWaccCalculated,
    showCompanyCard,
    resultCurrency,
    setResultCurrency,
  };
}
