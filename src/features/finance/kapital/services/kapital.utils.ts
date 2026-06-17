import {
  type MarketResults,
  type Results,
  type SensibilizacionEntry,
  type FormData,
} from "../KapitalPage";

export const formatToPeruTime = (isoString: string | undefined): string => {
  if (!isoString) return "-";

  // 1. Si el string no tiene 'Z' ni offset, le agregamos 'Z'
  const hasOffset = /Z|[+-]\d{2}:?\d{2}$/.test(isoString);
  const dateObj = new Date(hasOffset ? isoString : `${isoString}Z`);

  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(dateObj);
};

export const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const toPossibleNumber = (value: string): string | number => {
  // 1. Si ya es un número (viene del json del backend), lo pasamos directo
  if (typeof value === "number") {
    return value;
  }

  // 2. Para evitar crasheos por si llega un null o undefined accidental, lo forzamos a string
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return "";
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : trimmed;
};

export const pickBlock = (
  resultEntry: Record<string, unknown>,
  keys: string[]
): Record<string, unknown> | null => {
  for (const key of keys) {
    const candidate = resultEntry[key];
    if (candidate && typeof candidate === "object") {
      return candidate as Record<string, unknown>;
    }
  }
  return null;
};

export const generateCalculationCode = () => {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replaceAll("-", "")
      : `${Date.now()}${Math.random().toString(36).slice(2, 18)}`;
  return raw.slice(0, 32);
};

export const hasCompanyInputData = (
  data: Record<string, unknown> | null
): boolean => {
  if (!data) return false;
  const kd = toOptionalNumber(data.costo_deuda ?? data.kd);
  const debt = toOptionalNumber(data.porcentaje_deuda ?? data.debt);
  const capital = toOptionalNumber(data.porcentaje_capital ?? data.capital);

  return kd !== undefined || debt !== undefined || capital !== undefined;
};

export const toMarketResults = (
  source: Record<string, unknown> | null
): MarketResults => {
  return {
    ke: toRate(source?.ke),
    koa: toRate(source?.koa),
    kd: toRate(source?.kd),
    cppc: toRate(source?.cppc),
    "kd(1-t)":
      source?.["kd(1-t)"] !== undefined
        ? toRate(source?.["kd(1-t)"])
        : toRate(source?.["kd(1-T)"]),
    d_empresa: toRate(source?.d_empresa),
  };
};

export const toRate = (value: unknown): number => {
  if (value === null || value === undefined || value === "") return 0;
  // Handle string percentage values like "8,50%" or "10.19%"
  if (typeof value === "string") {
    const cleaned = value.replace("%", "").replace(/\s/g, "").replace(",", ".");
    const parsed = parseFloat(cleaned);
    if (!Number.isFinite(parsed)) return 0;
    // If the value had % sign or is > 1, it's already in percentage form
    if (value.includes("%")) return parsed / 100;
    return parsed > 1 ? parsed / 100 : parsed;
  }
  const raw = toOptionalNumber(value);
  if (raw === undefined) return 0;
  return raw > 1 ? raw / 100 : raw;
};

export const computeResultsFromCalculationData = (
  data: Record<string, unknown> | null
): { results: Results; showCompanyCard: boolean } => {
  const root = data ?? {};
  const inputs = Array.isArray(root.inputs) ? root.inputs : [];
  const latestInput = inputs[inputs.length - 1];
  const source =
    latestInput && typeof latestInput === "object"
      ? (latestInput as Record<string, unknown>)
      : root;

  const resultadosArray = Array.isArray(root.resultados)
    ? root.resultados
    : Array.isArray(root.resutados)
      ? root.resutados
      : [];
  const latestResult =
    resultadosArray.length > 0 && typeof resultadosArray[0] === "object"
      ? (resultadosArray[0] as Record<string, unknown>)
      : null;

  const developedBlock = latestResult
    ? pickBlock(latestResult, ["mercado_desarrollado", "Mercado Desarrollado"])
    : null;
  const emergentBlock = latestResult
    ? pickBlock(latestResult, ["mercado_emergente", "Mercado Emergente"])
    : null;
  const companyUsdBlock = latestResult
    ? pickBlock(latestResult, ["empresa_dolares", "Empresa Dolares"])
    : null;
  const companySolesBlock = latestResult
    ? pickBlock(latestResult, ["empresa_soles", "Empresa Soles"])
    : null;

  const developed = toMarketResults(developedBlock);
  const emergent = toMarketResults(emergentBlock);
  const empresa_dolares = toMarketResults(companyUsdBlock);
  const empresa_soles = toMarketResults(companySolesBlock);

  const showCompanyCard = hasCompanyInputData(source);

  // Choose which data to show in the top-level results (cppc, kd, ke, koa)
  const primary = showCompanyCard ? empresa_dolares : emergent;

  return {
    results: {
      cppc: primary.cppc,
      kd: primary.kd,
      ke: primary.ke,
      koa: primary.koa,
      boa: toOptionalNumber(latestResult?.boa),
      emergent,
      developed,
      empresa_dolares,
      empresa_soles,
      d_empresa: toRate(latestResult?.d_empresa),
    },
    showCompanyCard,
  };
};

export const extractSensibilizaciones = (
  data: Record<string, unknown> | null
): SensibilizacionEntry[] => {
  const root = data ?? {};
  const arr = Array.isArray(root.sensibilizacion) ? root.sensibilizacion : [];
  return arr
    .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
    .map((entry) => ({
      created_at: entry.created_at as string | undefined,
      boa: toOptionalNumber(entry.boa),
      mercado_desarrollado: toMarketResults(
        pickBlock(entry, ["mercado_desarrollado"])
      ),
      mercado_emergente: toMarketResults(
        pickBlock(entry, ["mercado_emergente"])
      ),
      empresa_dolares: toMarketResults(pickBlock(entry, ["empresa_dolares"])),
      empresa_soles: toMarketResults(pickBlock(entry, ["empresa_soles"])),
    }));
};

export const buildCalculationDataPayload = () => {
  return {
    inputs: [],
    resultados: [],
    sensibilizacion: [],
  } as Record<string, unknown>;
};

export const enrichCalculationInputPayload = (formData: FormData) => {
  const payload = {
    fecha: toPossibleNumber(formData.date),
    industria: toPossibleNumber(formData.sector),
    subsector:
      typeof formData.subsector === "string" ? formData.subsector.trim() : "",
    tasa_libre_riesgo: toPossibleNumber(formData.instrument),
    anio_bono: toPossibleNumber(formData.bono),
    pais: toPossibleNumber(formData.country),
    moneda: toPossibleNumber(formData.currency),
  } as Record<string, unknown>;

  const tax = toOptionalNumber(formData.tax);
  const devaluation = toOptionalNumber(formData.devaluation);
  const kd = toOptionalNumber(formData.kd);
  const debt = toOptionalNumber(formData.debt);
  const capital = toOptionalNumber(formData.capital);
  const dcRatio = toOptionalNumber(formData.dc_ratio);
  const effectiveTaxRate = toOptionalNumber(formData.effective_tax_rate);
  const betaLevered = toOptionalNumber(formData.beta_levered);
  const betaUnlevered = toOptionalNumber(formData.beta_unlevered);

  if (tax !== undefined) payload.tasa_impositiva = tax;
  if (devaluation !== undefined) payload.devaluacion = devaluation;
  if (betaUnlevered !== undefined) payload.beta_desapalancado = betaUnlevered;
  if (
    formData.typeId ||
    kd !== undefined ||
    debt !== undefined ||
    capital !== undefined
  ) {
    if (kd !== undefined) payload.costo_deuda = kd;
    if (debt !== undefined) payload.porcentaje_deuda = debt;
    if (capital !== undefined) payload.porcentaje_capital = capital;
    if (dcRatio !== undefined) payload.dc_ratio = dcRatio;
    if (effectiveTaxRate !== undefined) {
      payload.tasa_efectiva_impuesto = effectiveTaxRate;
    }
    if (betaLevered !== undefined) payload.beta_apalancado = betaLevered;
  }

  return payload;
};

export // Función para extraer año y trimestre de la fecha ingresada, con múltiples formatos soportados
const getYearAndQuarter = (dateStr: string) => {
  if (!dateStr) return { year: null, quarter: null };

  const trimmed = dateStr.trim();

  // 1. Si la fecha es simplemente un año (ej. "2025")
  if (/^\d{4}$/.test(trimmed)) {
    return { year: trimmed, quarter: "Q1" };
  }

  // 2. Intentar parsear formato DD/MM/YYYY o DD-MM-YYYY (ej: 30/06/2024)
  const ddMMyyyyMatch = trimmed.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/
  );
  if (ddMMyyyyMatch) {
    const month = parseInt(ddMMyyyyMatch[2], 10);
    const year = ddMMyyyyMatch[3];
    const quarter = `Q${Math.ceil(month / 3)}`;
    return { year, quarter };
  }

  // 3. Intentar parsear formato YYYY-MM-DD o YYYY/MM/DD (ej: 2024-06-30)
  const yyyyMMddMatch = trimmed.match(
    /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/
  );
  if (yyyyMMddMatch) {
    const year = yyyyMMddMatch[1];
    const month = parseInt(yyyyMMddMatch[2], 10);
    const quarter = `Q${Math.ceil(month / 3)}`;
    return { year, quarter };
  }

  // 4. Fallback: Intentar parsear como fecha nativa de JS
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear().toString();
    const month = date.getMonth() + 1; // getMonth es 0 indexado (0 = Enero)
    const quarter = `Q${Math.ceil(month / 3)}`;
    return { year, quarter };
  }

  // 5. Extraer cualquier año de 4 dígitos que encuentre
  const fallbackYearMatch = trimmed.match(/\d{4}/);
  if (fallbackYearMatch) {
    return { year: fallbackYearMatch[0], quarter: "Q1" };
  }

  return { year: null, quarter: null };
};
