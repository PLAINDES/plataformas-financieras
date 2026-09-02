import { useEffect, useState } from "react";
import { BarChart3, PieChart } from "lucide-react";
import { ValoraResultsHeader } from "./ValoraResultsHeader";
import { ValoraSensibilidadBalanceSheetBlock } from "./ValoraSensibilidadBalanceSheetBlock";
import { ValoraMethodsToggleCard } from "./ValoraMethodsToggleCard";
import type { ValoraCalculationResults } from "@/shared/types/ValoraTypes";
import { Book } from "../../kapital/components/Book";

export interface ValoraSensibilidadResultsBlockProps {
  onOpenFormPanel?: () => void;
  onOpenReport?: () => void;
  sector?: string;
  originalResults?: ValoraCalculationResults;
  results?: ValoraCalculationResults;
  toolbar?: React.ReactNode;
  coverUrl?: string;
}

type ChartMode = "default" | "conceptos" | "integrado";

const parseNumber = (value: string | number | null | undefined) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (!value) return null;

  const raw = value.trim().replace(/[^0-9,.-]/g, "");
  if (!/[0-9]/.test(raw)) return null;

  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  const decimalSeparator = lastComma > lastDot ? "," : ".";
  const normalized = raw.includes(",") && raw.includes(".")
    ? raw.replace(decimalSeparator === "," ? /\./g : /,/g, "").replace(decimalSeparator, ".")
    : raw.includes(",")
      ? raw.split(",").length > 2
        ? raw.replace(/,/g, "")
        : raw.replace(",", ".")
      : raw.includes(".") && raw.split(".").at(-1)!.length === 3
        ? raw.replace(/\./g, "")
        : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const toPercentage = (value: string | number | null | undefined) => {
  const parsed = parseNumber(value);
  if (parsed === null) return null;
  return typeof value === "string" && value.includes("%")
    ? parsed
    : Math.abs(parsed) <= 1
      ? parsed * 100
      : parsed;
};

export const ValoraSensibilidadResultsBlock: React.FC<
  ValoraSensibilidadResultsBlockProps
> = ({
   onOpenFormPanel: _onOpenFormPanel,
   onOpenReport,
   sector,
   originalResults,
   results,
    toolbar,
    coverUrl,
 }) => {
  const [chartMode, setChartMode] = useState<ChartMode>("default");
  const [companyType, setCompanyType] = useState<"empresa" | "emergente">("empresa");
  const sourceCurrency = (
    results?.source_currency ??
    originalResults?.source_currency ??
    results?.inputs?.moneda ??
    originalResults?.inputs?.moneda ??
    "USD"
  ).toUpperCase();
  const [resultCurrency, setResultCurrency] = useState(sourceCurrency);
  const fxToUsd =
    sourceCurrency === "USD"
      ? 1
      : results?.fx_to_usd ?? originalResults?.fx_to_usd;
  const availableCurrencies =
    sourceCurrency === "USD" || !fxToUsd
      ? [sourceCurrency]
      : [sourceCurrency, "USD"];

  useEffect(() => {
    setResultCurrency(sourceCurrency);
  }, [sourceCurrency]);

  const parseMoney = (value: string | number | null | undefined) => {
    const parsed = parseNumber(value);
    if (parsed === null) return null;
    return resultCurrency === "USD" && sourceCurrency !== "USD" && fxToUsd
      ? parsed * fxToUsd
      : parsed;
  };

  const handleMethodClick = (method: "conceptos" | "integrado") => {
    setChartMode((prev) => (prev === method ? "default" : method));
  };

  const conceptosSource = companyType === "emergente" ? results?.conceptos_emergente : results?.conceptos;
  const integradoSource = companyType === "emergente" ? results?.integrado_emergente : results?.integrado;
  const currentWacc = companyType === "emergente" ? results?.wacc_emergente : results?.wacc;
  const originalConceptosSource = companyType === "emergente" ? originalResults?.conceptos_emergente : originalResults?.conceptos;
  const originalIntegradoSource = companyType === "emergente" ? originalResults?.integrado_emergente : originalResults?.integrado;

  const methods = [
    {
      id: "conceptos" as const,
      headerText: "Método por Conceptos Sensibilizado",
      empresaValue: parseMoney(conceptosSource?.empresa) ?? 0,
      patrimonioValue: parseMoney(conceptosSource?.patrimonio) ?? 0,
      accionValue: parseMoney(conceptosSource?.precio_accion) ?? 0,
      tasaForecast: toPercentage(conceptosSource?.tasa_forecast),
      tasaForecastLabel: "Tasa de crecimiento ingresos forecast primer periodo",
      tasaPerpetua: toPercentage(conceptosSource?.tasa_perpetua),
      icon: PieChart,
      buttonColor: "orange" as const,
    },
    {
      id: "integrado" as const,
      headerText: "Método Integrado Sensibilizado",
      empresaValue: parseMoney(integradoSource?.empresa) ?? 0,
      patrimonioValue: parseMoney(integradoSource?.patrimonio) ?? 0,
      accionValue: parseMoney(integradoSource?.precio_accion) ?? 0,
      tasaForecast: toPercentage(integradoSource?.tasa_forecast),
      tasaForecastLabel: "Tasa de crecimiento FCE forecast primer periodo",
      tasaPerpetua: toPercentage(integradoSource?.tasa_perpetua),
      icon: BarChart3,
      buttonColor: "blue" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <ValoraResultsHeader
        wacc={toPercentage(currentWacc)}
        title="Sensibilidad"
        subtitle="Resultados sensibilizados"
        sector={sector}
        companyType={companyType}
        onCompanyTypeChange={setCompanyType}
      />

       {toolbar}

        {onOpenReport && (
          <div className="flex w-full justify-center lg:justify-end">
            <section className="flex w-full max-w-105 flex-col items-center justify-center gap-2 sm:w-fit">
              {coverUrl && <div onClick={onOpenReport} className="w-fit cursor-pointer"><Book href={coverUrl} width={95} height={130} interactive /></div>}
              <button type="button" onClick={onOpenReport} className="w-full bg-[#08203e] hover:bg-[#0c2e59] text-white text-[10px] sm:text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-all active:scale-95 uppercase leading-tight tracking-wide cursor-pointer">
                Generar reporte
              </button>
            </section>
          </div>
        )}

       <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="lg:flex lg:items-center">
          <ValoraMethodsToggleCard
            methods={methods}
            selectedMethod={chartMode === "default" ? "none" : chartMode}
            onSelectMethod={handleMethodClick}
          />
        </div>

        <div className="min-w-0 w-full">
          <ValoraSensibilidadBalanceSheetBlock
            activo={
              parseMoney(results?.balance?.activo) ??
              parseMoney(originalResults?.balance?.activo) ??
              0
            }
            pasivo={
              parseMoney(results?.balance?.pasivo) ??
              parseMoney(originalResults?.balance?.pasivo) ??
              0
            }
            patrimonio={
              parseMoney(results?.balance?.patrimonio) ??
              parseMoney(originalResults?.balance?.patrimonio) ??
              0
            }
            conceptosPatrimonioEsperado={
              parseMoney(originalConceptosSource?.patrimonio) ?? 0
            }
            conceptosPatrimonioSensibilizado={
              parseMoney(conceptosSource?.patrimonio) ?? 0
            }
            integradoPatrimonioEsperado={
              parseMoney(originalIntegradoSource?.patrimonio) ?? 0
            }
            integradoPatrimonioSensibilizado={
              parseMoney(integradoSource?.patrimonio) ?? 0
            }
            conceptosEmpresaEsperado={
              parseMoney(originalConceptosSource?.empresa) ?? 0
            }
            conceptosEmpresaSensibilizado={
              parseMoney(conceptosSource?.empresa) ?? 0
            }
            integradoEmpresaEsperado={
              parseMoney(originalIntegradoSource?.empresa) ?? 0
            }
            integradoEmpresaSensibilizado={
              parseMoney(integradoSource?.empresa) ?? 0
            }
            currency={resultCurrency}
            availableCurrencies={availableCurrencies}
            onCurrencyChange={setResultCurrency}
            variant={chartMode}
            companyType={companyType}
          />
        </div>
      </div>
    </div>
  );
};
