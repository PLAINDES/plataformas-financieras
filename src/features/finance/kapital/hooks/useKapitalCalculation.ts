// src/features/kapital/hooks/useKapitalCalculation.ts
import { useState } from "react";
import { MainService } from "@/shared/services/main.service";
import {
  computeResultsFromCalculationData,
  extractSensibilizaciones,
} from "../services/kapital.utils";
import { type Calculation } from "@/shared/types";

import {
  toOptionalNumber,
  enrichCalculationInputPayload,
  buildCalculationDataPayload,
  generateCalculationCode,
} from "../services/kapital.utils";

import {
  type KapitalResults,
  type SensibilizacionEntry,
  type UseKapitalCalculationProps,
} from "@/shared/types";

const ACTIVE_KAPITAL_ATTEMPT_KEY = "analytics_kapital_active_attempt_id";

const asInputString = (value: unknown, fallback = "") =>
  value === null || value === undefined ? fallback : String(value);

export function useKapitalCalculation({
  formData,
  setFormData,
  prewarmedSessionId,
  setPrewarmedSessionId,
  addToast,
  trackEvent,
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
  const [emergentCurrency, setEmergentCurrency] = useState<"pen" | "usd">("usd");

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
    const attemptId = !isBetaUpdate
      ? typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      : null;

    if (attemptId) {
      sessionStorage.setItem(ACTIVE_KAPITAL_ATTEMPT_KEY, attemptId);
      void trackEvent("kapital_calculation_started", {
        product: "kapital",
        calculation_mode: "initial",
        attempt_id: attemptId,
      });
    }

    try {
      let persistedCalculation: Calculation;
      // Si ya hay un cálculo actual, SIEMPRE hacemos PUT
      if (currentCalculation) {
        persistedCalculation = await MainService.updateCalculation(
          currentCalculation!.id,
          {
            data: {
              inputs: [enrichCalculationInputPayload(dataToSubmit)],
              active_session_id: prewarmedSessionId,
            },
          }
        );
      } else {
        // CREATE new calculation
        persistedCalculation = await MainService.createCalculation({
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
        const activeAttemptId = sessionStorage.getItem(
          ACTIVE_KAPITAL_ATTEMPT_KEY
        );
        if (activeAttemptId && sensibilizacionData.length > 0) {
          sessionStorage.removeItem(ACTIVE_KAPITAL_ATTEMPT_KEY);
          void trackEvent("kapital_calculation_completed", {
            product: "kapital",
            calculation_mode: "sensitivity",
            attempt_id: activeAttemptId,
            calculation_code: persistedCalculation.code,
          });
        }

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
              date: asInputString(latestInput.fecha),
              sector: asInputString(latestInput.industria),
              subsector: asInputString(latestInput.subsector),
              instrument: asInputString(latestInput.tasa_libre_riesgo),
              bono: asInputString(latestInput.anio_bono),
              country: asInputString(latestInput.pais),
              currency: asInputString(latestInput.moneda, "USD"),
              tax: asInputString(latestInput.tasa_impositiva),
              kd: asInputString(latestInput.costo_deuda),
              debt: asInputString(latestInput.porcentaje_deuda),
              capital: asInputString(latestInput.porcentaje_capital),
              dc_ratio: asInputString(latestInput.dc_ratio),
              effective_tax_rate: asInputString(
                latestInput.tasa_efectiva_impuesto
              ),
              beta_levered: asInputString(latestInput.beta_apalancado),
              beta_unlevered: asInputString(latestInput.beta_desapalancado),
              beta_subsector: asInputString(
                latestInput.beta_subsector ??
                  latestInput.beta_subsector_custom ??
                  latestInput.beta_unlevered_custom
              ),
              beta_unlevered_industry: asInputString(
                latestInput.beta_unlevered_industry ??
                  latestInput.beta_desapalancado
              ),
              tickers_subsector: asInputString(latestInput.tickers_subsector),
              subsector_sensibilizacion: asInputString(
                latestInput.subsector_sensibilizacion
              ),
              tickers_subsector_sensibilizacion: asInputString(
                latestInput.tickers_subsector_sensibilizacion
              ),
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
    emergentCurrency,
    setEmergentCurrency,
    isSessionFresh,
    setIsSessionFresh,
  };
}
