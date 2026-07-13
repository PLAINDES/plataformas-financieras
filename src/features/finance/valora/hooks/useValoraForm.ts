import { useEffect, useRef, useState } from "react";
import { MainService } from "@/shared/services/main.service";
import { getYearAndQuarter } from "@/features/finance/kapital/services/kapital.utils";
import {
  EXCLUDED_INDUSTRIES,
  COUNTRY_LOCAL_CURRENCIES,
} from "@/shared/constants/kapital";
import type { FormData } from "@/shared/types/ValoraTypes";

const INITIAL_FORM_DATA: FormData = {
  date: "",
  country: "",
  currency: "USD",
  sector: "",
  subsector: "",
  tickers_subsector: "",
  fileUsername: "",
  action: "",
  longgrowth: "",
  capitalcost: "",
  revenuegrowth: "",
  beta_unlevered_industry: "",
  beta_subsector: "",
  shares: "",
  instrument: "",
  bono: "",
  devaluation: "",
  tax: "",
  kd: "",
  debt: "",
  capital: "",
  typeId: false,
  useFinancialData: false,
  dc_ratio: "",
  effective_tax_rate: "",
  beta_levered: "",
  beta_unlevered: "",
  revenue_forecast_rate: "",
  fdc_forecast_rate: "",
  perpetual_growth_rate: "",
  beta_unlevered_sensitivity: "",
};

export function useValoraForm() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [dynamicSectors, setDynamicSectors] = useState<string[]>([]);
  const [dynamicDates, setDynamicDates] = useState<string[]>([]);

  const lastEditedFieldRef = useRef<"debt" | "capital" | null>(null);

  // 1. Fetch sectores y fechas dinámicas
  useEffect(() => {
    const fetchComplements = async () => {
      try {
        const [sectorsResponse, datesResponse] = await Promise.all([
          MainService.getTemplateComplements("damodaran", true, false),
          MainService.getTemplateComplements("rf", false, true),
        ]);

        if (Array.isArray(sectorsResponse) && sectorsResponse.length > 0) {
          const cleanSectors = sectorsResponse
            .filter((s) => typeof s === "string" && s.trim() !== "")
            .map((s) => s.trim())
            .filter((s) => !EXCLUDED_INDUSTRIES.includes(s));
          setDynamicSectors(Array.from(new Set(cleanSectors)));
        }

        if (Array.isArray(datesResponse) && datesResponse.length > 0) {
          setDynamicDates(datesResponse);
        }
      } catch (error) {
        console.error("Error al cargar complementos dinámicos:", error);
      }
    };

    fetchComplements();
  }, []);

  // 2. Deuda/Capital mutuamente complementarios
  useEffect(() => {
    if (formData.debt && formData.debt !== "" && lastEditedFieldRef.current === "debt") {
      const debtPercent = parseFloat(formData.debt);
      if (!isNaN(debtPercent) && debtPercent <= 100) {
        setFormData((prev) => ({
          ...prev,
          capital: (100 - debtPercent).toString(),
        }));
      }
    }
  }, [formData.debt]);

  useEffect(() => {
    if (formData.capital && formData.capital !== "" && lastEditedFieldRef.current === "capital") {
      const capitalPercent = parseFloat(formData.capital);
      if (!isNaN(capitalPercent) && capitalPercent <= 100) {
        setFormData((prev) => ({
          ...prev,
          debt: (100 - capitalPercent).toString(),
        }));
      }
    }
  }, [formData.capital]);

  // 3. Calcular beta desapalancado de la industria
  useEffect(() => {
    const calculateBetaIndustry = async () => {
      if (!formData.date || !formData.sector) {
        setFormData((prev) =>
          prev.beta_unlevered_industry !== ""
            ? { ...prev, beta_unlevered_industry: "" }
            : prev
        );
        return;
      }

      // Si hay un subsector restaurado con su propio beta, preservarlo
      if (
        formData.subsector &&
        formData.beta_unlevered_industry &&
        !formData.beta_subsector
      ) {
        return;
      }

      const { year } = getYearAndQuarter(formData.date);
      if (!year) return;

      try {
        const [damodaranResponse, taxResponse] = await Promise.all([
          MainService.getTemplateComplements("damodaran"),
          MainService.getTemplateComplements("tax"),
        ]);

        const damodaranData = damodaranResponse?.[0]?.data || [];
        const taxData = taxResponse?.[0]?.data || [];

        const damoMatch = damodaranData.find(
          (item: any) =>
            String(item.fecha) === String(year) &&
            item.industria === formData.sector
        );

        const taxMatch = taxData.find(
          (item: any) => String(item.fecha) === String(year)
        );

        if (damoMatch && taxMatch) {
          const beta = Number(damoMatch.beta);
          const d_sobre_def = Number(damoMatch.d_sobre_def);
          const e_sobre_de = Number(damoMatch.e_sobre_de);
          const tax_rate = Number(taxMatch.tax_rate);

          if (
            !isNaN(beta) &&
            !isNaN(d_sobre_def) &&
            !isNaN(e_sobre_de) &&
            !isNaN(tax_rate) &&
            e_sobre_de !== 0
          ) {
            const denominator =
              1 + (1 - tax_rate) * (d_sobre_def / e_sobre_de);
            const calculatedBeta = beta / denominator;

            setFormData((prev) => ({
              ...prev,
              beta_unlevered_industry: calculatedBeta.toFixed(2),
            }));
          }
        } else {
          setFormData((prev) => ({ ...prev, beta_unlevered_industry: "" }));
        }
      } catch (error) {
        console.error("Error calculando beta unlevered industry:", error);
      }
    };

    calculateBetaIndustry();
  }, [formData.date, formData.sector]);

  // 4. Autocompletar Devaluación e IR
  useEffect(() => {
    const fetchAutoFillData = async () => {
      if (!formData.date || !formData.country) {
        setFormData((prev) => {
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

          if (irResponse?.valor !== null && irResponse?.valor !== undefined) {
            updates.tax = (Number(irResponse.valor) * 100).toFixed(2);
          } else {
            updates.tax = "";
          }

          if (
            devResponse?.valor !== null &&
            devResponse?.valor !== undefined
          ) {
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

    if (name === "debt" || name === "capital") {
      lastEditedFieldRef.current = name as "debt" | "capital";
    }

    setFormData((prev) => {
      const updates = { ...prev, [name]: value };

      if (name === "sector") {
        updates.subsector = "";
        updates.tickers_subsector = "";
        updates.beta_subsector = "";
        updates.beta_unlevered_industry = "";
      }

      if (name === "country") {
        const newLocalCode = COUNTRY_LOCAL_CURRENCIES[value];
        if (updates.currency !== "USD" && updates.currency !== newLocalCode) {
          updates.currency = "USD";
        }
        updates.devaluation = "";
        updates.tax = "";
      }

      if (name === "date") {
        updates.devaluation = "";
        updates.tax = "";
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
