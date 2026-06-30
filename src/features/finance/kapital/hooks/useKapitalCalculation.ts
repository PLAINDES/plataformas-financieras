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
  type KapitalFormData,
  type KapitalResults,
  type SensibilizacionEntry,
  type UseKapitalCalculationProps,
} from "@/shared/types";

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
  const [results, setResults] = useState<KapitalResults | null>(null);
  const [sensibilizaciones, setSensibilizaciones] = useState<
    SensibilizacionEntry[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaccCalculated, setIsWaccCalculated] = useState(false);
  const [isSessionFresh, setIsSessionFresh] = useState(false);

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
      addToast(`Completa los campos: ${missingFields.join(", ")}`, "warn");
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
        addToast(
          `Sensibilización calculada con β=${betaUnlevered}.`,
          "success"
        );
      } else {
        ui.setResultsSection("result");
        addToast("Resultados generados y guardados.", "success");
      }

      setIsSessionFresh(true); // El excel ya se actualizado con los datos del form
    } catch (error) {
      console.error("Error in Kapital calculation", error);
      addToast("No se pudo guardar el cálculo. Intenta nuevamente.", "error");
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
              subsector: (latestInput.subsector as string) || "",
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
              beta_unlevered: (latestInput.beta_desapalancado as string) || "",
              beta_unlevered_custom:
                (latestInput.beta_desapalancado_custom as string) || "",
              beta_unlevered_industry:
                (latestInput.beta_desapalancado as string) || "",
              tickers_subsector:
                (latestInput.tickers_subsector as string) || "",
              subsector_sensibilizacion:
                (latestInput.subsector_sensibilizacion as string) || "",
              tickers_subsector_sensibilizacion:
                (latestInput.tickers_subsector_sensibilizacion as string) || "",
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

          // Asignar subsector/tickers a cada entry de sensibilización
          // Prioridad: 1) valor del backend en entry.subsector 2) último input
          if (sensibilizacionData.length > 0 && latestInput) {
            const latestSubsector = (latestInput as Record<string, unknown>)
              .subsector_sensibilizacion as string | undefined;
            const latestTickers = (latestInput as Record<string, unknown>)
              .tickers_subsector_sensibilizacion as string | undefined;
            if (latestSubsector || latestTickers) {
              const patched = sensibilizacionData.map((entry) => ({
                ...entry,
                subsector: entry.subsector || latestSubsector || undefined,
                tickers: entry.tickers || latestTickers || undefined,
              }));
              setSensibilizaciones(patched);
            } else {
              setSensibilizaciones(sensibilizacionData);
            }
          } else {
            setSensibilizaciones(sensibilizacionData);
          }
          setIsWaccCalculated(true);
          ui.setShowResults(true);
          ui.setIsFormOpen(false);
          setIsSessionFresh(false); // El front tiene datos pero el excel aún no se ha refrescado
        }
      } catch (error) {
        console.error("No se encontró el cálculo en la URL", error);
      }
    }
  };

  const handleAnalysisSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      addToast(
        "La sensibilización ahora se calcula desde Excel. Presiona CALCULA TU WACC para refrescar datos.",
        "info"
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
    isSessionFresh,
    setIsSessionFresh,
  };
}
