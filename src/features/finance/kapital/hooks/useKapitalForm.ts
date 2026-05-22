import { useState, useEffect, useRef } from "react";
import { MainService } from "@/shared/services/main.service";
import { getYearAndQuarter } from "../services/kapital.utils";
import {
  EXCLUDED_INDUSTRIES,
  COUNTRY_LOCAL_CURRENCIES,
} from "@/shared/constants/kapital";
import type { FormData } from "../KapitalPage";

export function useKapitalForm() {
  const [formData, setFormData] = useState<FormData>({
    date: "",
    sector: "",
    beta_unlevered_industry: "",
    instrument: "",
    bono: "",
    country: "",
    devaluation: "",
    tax: "",
    typeId: false,
    currency: "USD",
    kd: "",
    debt: "",
    capital: "",
    dc_ratio: "",
    effective_tax_rate: "",
    beta_levered: "",
    beta_unlevered: "",
  });
  // Estado para guardar la lista dinámica de sectores
  const [dynamicSectors, setDynamicSectors] = useState<string[]>([]);
  const [dynamicDates, setDynamicDates] = useState<string[]>([]);

  const lastEditedFieldRef = useRef<"debt" | "capital" | null>(null);

  // 1. Fetch de sectores dinámicos

  // Fetch de los sectores dinámicos al cargar la página
  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const [sectorsResponse, datesResponse] = await Promise.all([
          MainService.getTemplateComplements("damodaran", true, false), // Solo Nombres
          MainService.getTemplateComplements("rf", false, true), // Solo Fechas
        ]);

        if (Array.isArray(sectorsResponse) && sectorsResponse.length > 0) {
          const cleanSectors = sectorsResponse
            .filter((s) => typeof s === "string" && s.trim() !== "")
            .map((s) => s.trim())
            .filter((s) => !EXCLUDED_INDUSTRIES.includes(s));

          // Eliminamos duplicados finales
          const uniqueSectors = Array.from(new Set(cleanSectors));

          setDynamicSectors(uniqueSectors);
        }
        if (Array.isArray(datesResponse) && datesResponse.length > 0) {
          setDynamicDates(datesResponse);
        }
      } catch (error) {
        console.error("Error al cargar los sectores dinámicos:", error);
      }
    };

    fetchSectors();
  }, []);

  // 2. Deuda/Capital
  useEffect(() => {
    if (formData.debt !== "" && lastEditedFieldRef.current === "debt") {
      const debtPercent = parseFloat(formData.debt);
      if (!isNaN(debtPercent) && debtPercent <= 100) {
        const capitalValue = 100 - debtPercent;
        const capitalStr =
          capitalValue === Math.floor(capitalValue)
            ? capitalValue.toString()
            : capitalValue.toString();
        setFormData((prev) => ({
          ...prev,
          capital: capitalStr,
        }));
      }
    }
  }, [formData.debt]);

  useEffect(() => {
    if (formData.capital !== "" && lastEditedFieldRef.current === "capital") {
      const capitalPercent = parseFloat(formData.capital);
      if (!isNaN(capitalPercent) && capitalPercent <= 100) {
        const debtValue = 100 - capitalPercent;
        const debtStr =
          debtValue === Math.floor(debtValue)
            ? debtValue.toString()
            : debtValue.toString();
        setFormData((prev) => ({
          ...prev,
          debt: debtStr,
        }));
      }
    }
  }, [formData.capital]);

  // 3. Extraer beta de la industria
  useEffect(() => {
    const calculateBetaIndustry = async () => {
      // 1. Validar que tengamos fecha y sector
      if (!formData.date || !formData.sector) {
        setFormData((prev) =>
          prev.beta_unlevered_industry !== ""
            ? { ...prev, beta_unlevered_industry: "" }
            : prev
        );
        return;
      }

      const { year } = getYearAndQuarter(formData.date);
      if (!year) return;

      try {
        // 2. Traer los complementos completos
        const [damodaranResponse, taxResponse] = await Promise.all([
          MainService.getTemplateComplements("damodaran"),
          MainService.getTemplateComplements("tax"),
        ]);

        // Extraer los arrays "data" de las respuestas
        const damodaranData = damodaranResponse?.[0]?.data || [];
        const taxData = taxResponse?.[0]?.data || [];

        // 3. Buscar los registros exactos por Año y Sector
        const damoMatch = damodaranData.find(
          (item: any) =>
            String(item.fecha) === String(year) &&
            item.industria === formData.sector
        );

        const taxMatch = taxData.find(
          (item: any) => String(item.fecha) === String(year)
        );

        // 4. Si encontramos ambos, aplicamos la fórmula
        if (damoMatch && taxMatch) {
          const beta = Number(damoMatch.beta);
          const d_sobre_def = Number(damoMatch.d_sobre_def);
          const e_sobre_de = Number(damoMatch.e_sobre_de);
          const tax_rate = Number(taxMatch.tax_rate);

          // Prevenir divisiones entre cero o valores inválidos
          if (
            !isNaN(beta) &&
            !isNaN(d_sobre_def) &&
            !isNaN(e_sobre_de) &&
            !isNaN(tax_rate) &&
            e_sobre_de !== 0
          ) {
            // Fórmula: beta / (1 + (1-tax_rate) * (d_sobre_def / e_sobre_de))
            const denominator = 1 + (1 - tax_rate) * (d_sobre_def / e_sobre_de);
            const calculatedBeta = beta / denominator;

            setFormData((prev) => ({
              ...prev,
              beta_unlevered_industry: calculatedBeta.toFixed(2),
            }));
          }
        } else {
          // Si no hay datos en la BD para ese año/sector, limpiamos el campo
          setFormData((prev) => ({ ...prev, beta_unlevered_industry: "" }));
        }
      } catch (error) {
        console.error("Error calculando beta unlevered industry:", error);
      }
    };

    calculateBetaIndustry();
  }, [formData.date, formData.sector]);

  // 4. Completar automaticamente Devaluación e IR
  useEffect(() => {
    const fetchAutoFillData = async () => {
      if (!formData.date || !formData.country) {
        setFormData((prev) => {
          // Solo actualizamos si realmente tienen algo, para evitar re-renderizados innecesarios
          if (prev.tax !== "" || prev.devaluation !== "") {
            return { ...prev, tax: "", devaluation: "" };
          }
          return prev;
        });
        return;
      }

      const { year, quarter } = getYearAndQuarter(formData.date);
      if (!year) return;

      try {
        const [irResponse, devResponse] = await Promise.all([
          MainService.getComplementSpecificValue("ir", year, formData.country),
          MainService.getComplementSpecificValue(
            "devaluacion",
            year,
            formData.country,
            quarter || undefined
          ),
        ]);

        setFormData((prev) => {
          const updates = { ...prev };

          // Actualizamos Tasa Impositiva si el backend encontró el valor
          if (irResponse?.valor !== null && irResponse?.valor !== undefined) {
            updates.tax = (Number(irResponse.valor) * 100).toFixed(2);
          } else {
            updates.tax = "";
          }

          // Actualizamos Devaluación si el backend encontró el valor
          if (devResponse?.valor !== null && devResponse?.valor !== undefined) {
            updates.devaluation = (Number(devResponse.valor) * 100).toFixed(2);
          } else {
            updates.devaluation = "";
          }

          return updates;
        });
      } catch (error) {
        console.error(
          "Error auto-rellenando complementos IR y Devaluacion:",
          error
        );
      }
    };

    fetchAutoFillData();
  }, [formData.date, formData.country]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Track which field was last edited for debt/capital auto-calculation
    if (name === "debt" || name === "capital") {
      lastEditedFieldRef.current = name as "debt" | "capital";
    }

    setFormData((prev) => {
      const updates = { ...prev, [name]: value };

      // REINICIO DE MONEDA
      if (name === "country") {
        const newLocalCode = COUNTRY_LOCAL_CURRENCIES[value];
        if (updates.currency !== "USD" && updates.currency !== newLocalCode) {
          updates.currency = "USD";
        }
      }

      // Track para deuda/capital
      if (name === "debt" || name === "capital") {
        lastEditedFieldRef.current = name as "debt" | "capital";
      }

      return updates;
    });
  };

  return {
    formData,
    setFormData,
    handleInputChange,
    dynamicSectors,
    dynamicDates,
  };
}
