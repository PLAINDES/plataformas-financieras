import { read, utils } from "xlsx";
import { type RiskFreeRateItem, type DynamicCountryItem } from "@/shared/types";

export const cleanExcelDate = (val: any, fallback: any) => {
  let raw = val || fallback;
  if (!raw) return "";

  const formatToDDMMYYYY = (d: number, m: number, y: number) => {
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  };

  // 1. Si es un número de serie de Excel (ej: 45838)
  if (typeof raw === "number" && raw > 20000) {
    const dateObj = new Date(Math.round((raw - 25569) * 86400 * 1000));
    const adjustedDate = new Date(
      dateObj.getTime() + dateObj.getTimezoneOffset() * 60000
    );
    return formatToDDMMYYYY(
      adjustedDate.getDate(),
      adjustedDate.getMonth() + 1,
      adjustedDate.getFullYear()
    );
  }

  // 2. Si es un objeto Date nativo
  if (raw instanceof Date) {
    return formatToDDMMYYYY(
      raw.getDate(),
      raw.getMonth() + 1,
      raw.getFullYear()
    );
  }

  // 3. Si es un String (ej: "31/09/2025" o "6/30/2025")
  if (typeof raw === "string") {
    const str = raw.trim();
    // Si es solo año (ej: "2024"), lo respetamos
    if (/^\d{4}$/.test(str)) return str;

    const parts = str.split(/[-/]/);
    if (parts.length === 3) {
      let p1 = parseInt(parts[0], 10);
      let p2 = parseInt(parts[1], 10);
      let p3 = parseInt(parts[2], 10);

      // Descubrir dónde está el año
      let y = p3 > 1000 ? p3 : p1 > 1000 ? p1 : p3;
      if (y < 100) y += 2000;

      let m, d;
      // Si el formato era YYYY-MM-DD
      if (p1 > 1000) {
        m = p2;
        d = p3;
      }
      // Si el primer dígito es mayor a 12, seguro es el día (DD/MM/YYYY)
      else if (p1 > 12) {
        d = p1;
        m = p2;
      }
      // Si el segundo es mayor a 12, seguro es el día (MM/DD/YYYY)
      else if (p2 > 12) {
        m = p1;
        d = p2;
      }
      // Ambigüedad (ej: 06/05/2025) -> Asumimos DD/MM/YYYY por convención
      else {
        d = p1;
        m = p2;
      }

      return formatToDDMMYYYY(d, m, y);
    }
    return str; // Fallback si no machea nada
  }

  return String(raw);
};

export const extractRowDate = (row: any, fallbackDate: string) => {
  let fechaRow =
    row.fecha || row.trimestre || row.Quarter || row.year || fallbackDate;
  // Si no encontramos fecha por nombre explícito, usamos el valor de la primera columna
  if (!row.fecha && !row.trimestre && !row.Quarter && !row.year) {
    const keys = Object.keys(row);
    if (keys.length > 0) {
      fechaRow = row[keys[0]];
    }
  }
  return fechaRow;
};

export const checkIsTrimestralFromExcel = (
  wb: any,
  sheets: string[]
): boolean => {
  if (sheets.length > 1) {
    // With multiple sheets, assume annual as per user description of multi-sheet annual files.
    return false;
  }

  // For a single sheet, check content to decide.
  if (sheets.length === 1) {
    try {
      const firstSheetData = utils.sheet_to_json(wb.Sheets[sheets[0]]);
      if (firstSheetData.length > 0) {
        const firstRow: any = firstSheetData[0];
        const fechaVal = extractRowDate(firstRow, "");
        const cleanStr = String(cleanExcelDate(fechaVal, ""));

        // If it looks like a year, it's annual.
        if (/^\d{4}$/.test(cleanStr.trim())) {
          return false;
        }

        // If it includes separators, it's likely quarterly/monthly dates.
        if (cleanStr.includes("/") || cleanStr.includes("-")) {
          return true;
        }
      }
    } catch (error) {
      console.error("Error checking Excel format:", error);
      // Fallback to default if content check fails
    }
  }

  // Default for single sheet if content is not decisive, or for empty/invalid files.
  return sheets.length === 1;
};

export const parseDevaluacionSheet = (ws: any, sheetName: string) => {
  const rawData = utils.sheet_to_json<any[]>(ws, { header: 1 });
  let headerRowIndex = -1;
  let year = sheetName;

  // 1. Buscar la fila cabecera
  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const row = rawData[i];
    if (!row || !Array.isArray(row)) continue;

    const rowStr = row.map((c) => String(c).toLowerCase()).join(" ");
    if (
      rowStr.includes("argentina") ||
      rowStr.includes("periodo") ||
      rowStr.includes("brazil") ||
      rowStr.includes("brasil") ||
      rowStr.includes("perú") ||
      rowStr.includes("peru")
    ) {
      headerRowIndex = i;
      // Buscar el año en filas anteriores (compatibilidad con el formato viejo)
      for (let j = 0; j < i; j++) {
        const prevRow = rawData[j];
        if (prevRow && prevRow.length > 0) {
          const possibleYear = String(prevRow[0] || prevRow[1] || "").trim();
          if (/^\d{4}$/.test(possibleYear)) {
            year = possibleYear;
          }
        }
      }
      break;
    }
  }

  if (headerRowIndex === -1) return [];

  const headers = rawData[headerRowIndex].map((h: any) =>
    String(h || "").trim()
  );
  const dataRows = rawData.slice(headerRowIndex + 1);
  const result = [];

  for (const row of dataRows) {
    if (
      !row ||
      row.length === 0 ||
      row[0] == null ||
      String(row[0]).trim() === ""
    )
      continue;

    const firstCol = String(row[0]).trim();
    // Evitar la fila de índices numéricos del formato anterior
    if (
      firstCol === "1" ||
      String(row[1]).trim() === "1" ||
      String(row[1]).trim() === "2"
    ) {
      continue;
    }

    let periodo = firstCol;
    let fecha = year;

    // NUEVO FORMATO: Extraer Cuatrimestre y Año de "Q1-2024"
    const qMatch = firstCol.match(/^(Q[1-4])[-/](\d{4})$/i);
    if (qMatch) {
      periodo = qMatch[1].toUpperCase(); // Extrae "Q1"
      fecha = qMatch[2]; // Extrae "2024"
    }

    const item: any = { fecha, periodo };

    for (let i = 1; i < headers.length; i++) {
      let country = headers[i];
      if (
        !country ||
        country.startsWith("__EMPTY") ||
        /^\d+$/.test(country) ||
        country === "-"
      )
        continue;

      // Normalización robusta de países
      country = country.toLowerCase();
      if (
        country.includes("united states") ||
        country.includes("eeuu") ||
        country.includes("ee.uu")
      )
        country = "United States";
      else if (country.includes("mexico") || country.includes("méxico"))
        country = "Mexico";
      else if (country.includes("peru") || country.includes("perú"))
        country = "Peru";
      else if (country.includes("brazil") || country.includes("brasil"))
        country = "Brazil";
      else country = country.charAt(0).toUpperCase() + country.slice(1);

      const val = row[i];
      if (val !== undefined && val !== null && val !== "" && val !== "-") {
        // Convertir porcentajes "-1.32%" a decimal numérico
        if (typeof val === "string" && val.includes("%")) {
          item[country] = Number(val.replace("%", "").trim()) / 100;
        } else {
          const numVal = Number(val);
          item[country] = !isNaN(numVal) ? numVal : val;
        }
      } else {
        item[country] = "";
      }
    }
    result.push(item);
  }
  return result;
};

export const parseDamodaranNuevoFormato = (ws: any) => {
  // Lee la hoja como un arreglo de arreglos (matriz)
  const rawData = utils.sheet_to_json<any[]>(ws, { header: 1 });
  let extractedYear = "";
  let headerRowIndex = -1;

  // 1. Buscar el año y la fila de cabeceras
  for (let i = 0; i < Math.min(30, rawData.length); i++) {
    const row = rawData[i];
    if (!row || !Array.isArray(row)) continue;

    const colA = String(row[0] || "")
      .toLowerCase()
      .trim();

    // Buscar "Date updated:" en A1 (o cercanías)
    if (colA.includes("date updated")) {
      const dateVal = row[1]; // El valor en B1
      if (typeof dateVal === "number") {
        // Si Excel lo lee como número de serie de fecha
        const dateObj = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
        extractedYear = String(dateObj.getFullYear());
      } else if (typeof dateVal === "string") {
        // Si lo lee como texto "5-jan-22"
        const match = dateVal.match(/\d{2,4}$/);
        if (match) {
          extractedYear = match[0].length === 2 ? `20${match[0]}` : match[0];
        }
      }
    }

    // Buscar la fila de cabeceras
    if (colA.includes("industry name")) {
      headerRowIndex = i;
    }

    if (extractedYear && headerRowIndex !== -1) break;
  }

  if (!extractedYear)
    throw new Error(
      "No se pudo encontrar la fecha ('Date updated:') en el Excel."
    );
  if (headerRowIndex === -1)
    throw new Error("No se encontró la cabecera 'Industry Name'.");

  // 2. Extraer los datos fila por fila
  const dataRows = rawData.slice(headerRowIndex + 1);
  const result = [];

  const parseNum = (val: any) => {
    if (val === undefined || val === null || val === "") return undefined;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  };

  for (const row of dataRows) {
    if (!row || !row[0]) continue;

    const industryName = String(row[0]).trim();
    if (industryName === "Total Market") break; // Límite de extracción
    if (industryName === "") continue;

    result.push({
      fecha: extractedYear,
      industria: industryName,
      number_of_firms: parseNum(row[1]),
      beta: parseNum(row[2]),
      cost_of_equity: parseNum(row[3]),
      e_sobre_de: parseNum(row[4]),
      std_dev_stock: parseNum(row[5]),
      cost_of_debt: parseNum(row[6]),
      tax_rate: parseNum(row[7]),
      after_tax_cost_of_debt: parseNum(row[8]),
      d_sobre_def: parseNum(row[9]),
      cost_of_capital: parseNum(row[10]),
      cost_of_capital_local: parseNum(row[11]),
    });
  }

  return result;
};

export const parseRiesgoCrediticio = (ws: any) => {
  const rawData = utils.sheet_to_json<any[]>(ws, { header: 1 });
  let extractedYear = "";
  let headerRowIndex = -1;
  let startColIndex = -1;

  // 1. Buscar el año y las cabeceras de Riesgo
  for (let i = 0; i < Math.min(30, rawData.length); i++) {
    const row = rawData[i];
    if (!row || !Array.isArray(row)) continue;

    // Extraer año
    const colA = String(row[0] || "")
      .toLowerCase()
      .trim();
    if (colA.includes("date updated")) {
      const dateVal = row[1];
      if (typeof dateVal === "number") {
        const dateObj = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
        extractedYear = String(dateObj.getFullYear());
      } else if (typeof dateVal === "string") {
        const match = dateVal.match(/\d{2,4}$/);
        if (match) {
          extractedYear = match[0].length === 2 ? `20${match[0]}` : match[0];
        }
      }
    }

    // Buscar "Standard Deviation" escaneando las columnas de la fila actual
    for (let j = 0; j < row.length; j++) {
      if (
        String(row[j] || "")
          .toLowerCase()
          .trim() === "standard deviation"
      ) {
        headerRowIndex = i;
        startColIndex = j; // Guardamos en qué columna empieza (ej: 6 para la G)
        break;
      }
    }

    if (extractedYear && headerRowIndex !== -1) break;
  }

  if (!extractedYear)
    throw new Error(
      "No se pudo encontrar la fecha ('Date updated:') en el Excel."
    );
  if (headerRowIndex === -1)
    throw new Error("No se encontró la tabla de 'Standard Deviation'.");

  // 2. Extraer los datos de la matriz
  const dataRows = rawData.slice(headerRowIndex + 1);
  const result = [];

  for (const row of dataRows) {
    if (!row) continue;

    // Obtenemos el valor de la primera columna de la tablita basándonos en startColIndex
    const minDeviation = row[startColIndex];

    // Condición de parada: Si la celda está vacía o indefinida, termina la tabla
    if (
      minDeviation === undefined ||
      minDeviation === null ||
      String(minDeviation).trim() === ""
    ) {
      break;
    }

    // Limpiar porcentajes si vienen como string (ej: "0.99%")
    const parseNum = (val: any) => {
      if (typeof val === "string") return Number(val.replace("%", "")) / 100;
      return Number(val);
    };

    result.push({
      fecha: extractedYear,
      min_deviation: Number(minDeviation),
      max_deviation: Number(row[startColIndex + 1] || 0),
      basis_spread: parseNum(row[startColIndex + 2]),
    });
  }

  return result;
};

export const parseTaxSheet = (ws: any) => {
  const rawData = utils.sheet_to_json<any[]>(ws, { header: 1 });
  let extractedYear = "";

  // 1. Buscar el año
  for (let i = 0; i < Math.min(30, rawData.length); i++) {
    const row = rawData[i];
    if (!row || !Array.isArray(row)) continue;

    const colA = String(row[0] || "")
      .toLowerCase()
      .trim();
    if (colA.includes("date updated")) {
      const dateVal = row[1];
      if (typeof dateVal === "number") {
        const dateObj = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
        extractedYear = String(dateObj.getFullYear());
      } else if (typeof dateVal === "string") {
        const match = dateVal.match(/\d{2,4}$/);
        if (match) {
          extractedYear = match[0].length === 2 ? `20${match[0]}` : match[0];
        }
      }
      break;
    }
  }

  if (!extractedYear) {
    throw new Error(
      "No se pudo encontrar la fecha ('Date updated:') en el Excel."
    );
  }

  // 2. Extraer celdas específicas directamente por su ID de celda
  const cellD11 = ws["D11"] ? ws["D11"].v : undefined;
  const cellF13 = ws["F13"] ? ws["F13"].v : undefined;

  const parseNum = (val: any) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === "string") return Number(val.replace("%", "")) / 100;
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  };

  // Devuelve un arreglo con un solo objeto (ya que es un valor por año)
  return [
    {
      fecha: extractedYear,
      global_default_spread: parseNum(cellD11),
      tax_rate: parseNum(cellF13),
    },
  ];
};

export const mapRow = (row: any, defaultFecha: string, activeTab: string) => {
  const baseItem = {
    fecha: cleanExcelDate(row.fecha || row.Fecha, defaultFecha),
  };

  let mappedItem: any = {};

  const { ...restProps } = row;
  if (activeTab === "damodaran") {
    const industryFromEmpty =
      row.__EMPTY ?? row.__EMPTY_1 ?? row["Industry Name"];
    if (!restProps.industria && !restProps.industry && industryFromEmpty) {
      restProps.industria = String(industryFromEmpty).trim();
    }
  }
  mappedItem = { ...baseItem, ...restProps };

  // Clean empty values (undefined, null, or empty string)
  const cleanedItem = Object.fromEntries(
    Object.entries(mappedItem).filter(
      ([k, v]) =>
        v !== undefined && v !== null && v !== "" && !k.startsWith("__EMPTY")
    )
  );

  if (activeTab !== "damodaran") {
    return cleanedItem;
  }

  const normalizeKey = (key: string) =>
    key
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  const toNumberOrUndefined = (val: any) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : undefined;
  };

  const getByAliases = (aliases: string[]) => {
    const normalizedAliases = aliases.map(normalizeKey);
    const foundEntry = Object.entries(cleanedItem).find(([k]) =>
      normalizedAliases.includes(normalizeKey(k))
    );
    return foundEntry?.[1];
  };
  // Si vienen columnas como 2026, 2026_1, 2026_2... respetamos ese orden.
  const orderedYearValues = Object.entries(cleanedItem)
    .filter(([k]) => /^\d{4}(?:_\d+)?$/.test(k))
    .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
    .map(([, v]) => v);
  const dSobreDef = toNumberOrUndefined(
    getByAliases(["d_sobre_def", "d/(d+e)", "debt_to_capital"]) ??
      orderedYearValues[0]
  );
  const eSobreDe = toNumberOrUndefined(
    getByAliases(["e_sobre_de", "e/(d+e)", "equity_to_capital"]) ??
      orderedYearValues[1]
  );
  const taxRate = toNumberOrUndefined(
    getByAliases(["tax_rate", "tax rate", "impuesto"]) ?? orderedYearValues[2]
  );
  const beta = toNumberOrUndefined(
    getByAliases(["beta", "levered_beta"]) ?? orderedYearValues[3]
  );
  const stdDevStock = toNumberOrUndefined(
    getByAliases(["std_dev_stock", "std dev in stock", "std_dev"]) ??
      orderedYearValues[4]
  );
  const spreadDebt = toNumberOrUndefined(
    getByAliases(["spread_debt", "spread debt", "debt_spread"]) ??
      orderedYearValues[5]
  );
  const industria = String(
    getByAliases([
      "industria",
      "industry",
      "sector",
      "industry_name",
      "industry name",
    ]) ?? ""
  ).trim();

  // Devolvemos solo los atributos canónicos de Damodaran (sin claves 2026, 2026_1, ...).
  return {
    fecha: cleanedItem.fecha,
    industria,
    d_sobre_def: dSobreDef,
    e_sobre_de: eSobreDe,
    tax_rate: taxRate,
    beta,
    std_dev_stock: stdDevStock,
    spread_debt: spreadDebt,
  };
};

export const parseSubsectoresSheet = (ws: any) => {
  const rawData = utils.sheet_to_json<any[]>(ws, { header: 1 });
  let headerRowIndex = -1;

  for (let i = 0; i < Math.min(30, rawData.length); i++) {
    const row = rawData[i];
    if (!row || !Array.isArray(row)) continue;
    const rowStr = row
      .map((c: any) => String(c || "").toLowerCase().trim())
      .join(" ");
    if (rowStr.includes("industry name") && rowStr.includes("subsector")) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1)
    throw new Error(
      "No se encontraron las cabeceras 'Industry Name' y 'Subsector'."
    );

  const headers = rawData[headerRowIndex].map((h: any) =>
    String(h || "").trim()
  );
  const dataRows = rawData.slice(headerRowIndex + 1);
  const result: any[] = [];

  let industryNameIdx = -1;
  let subsectoresIdx = -1;
  const empresaIdxs: number[] = [];

  headers.forEach((h: string, i: number) => {
    const lower = h.toLowerCase();
    if (lower.includes("industry name") && industryNameIdx === -1) {
      industryNameIdx = i;
    }
    if (lower.includes("subsector")) {
      subsectoresIdx = i;
    }
    if (/^empresa\s*\d+$/i.test(lower)) {
      empresaIdxs.push(i);
    }
  });

  if (subsectoresIdx === -1)
    throw new Error("No se encontró la columna 'Subsector'.");

  let lastIndustry = "";

  for (const row of dataRows) {
    if (!row || row.length === 0) continue;

    const sectorRaw = row[industryNameIdx];
    const sector =
      sectorRaw !== undefined &&
        sectorRaw !== null &&
        String(sectorRaw).trim()
        ? String(sectorRaw).trim()
        : lastIndustry;

    if (sector) lastIndustry = sector;

    const subsector = String(row[subsectoresIdx] || "").trim();
    if (!subsector) continue;

    const empresas = empresaIdxs
      .map((i) => String(row[i] || "").trim())
      .filter((v) => v !== "");

    result.push({
      sector,
      subsector,
      empresas,
    });
  }

  return result;
};

export const parseSubsectoresLongSheet = (ws: any) => {
  const rawData = utils.sheet_to_json<any[]>(ws, { header: 1 });
  let headerRowIndex = -1;

  for (let i = 0; i < Math.min(30, rawData.length); i++) {
    const row = rawData[i];
    if (!row || !Array.isArray(row)) continue;
    const cells = row.map((c: any) => String(c || "").toLowerCase().trim());
    const hasSector = cells.some((c) => c === "sector" || c === "industry name");
    const hasSubsector = cells.some((c) => c === "subsector");
    const hasEmpresa = cells.some((c) => c === "empresa" || c === "ticker");
    if (hasSector && hasSubsector && hasEmpresa) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) return null;

  const headers = rawData[headerRowIndex].map((h: any) =>
    String(h || "").toLowerCase().trim()
  );
  const sectorIdx = headers.findIndex(
    (h: string) => (h === "sector" || h === "industry name" || h === "industria")
  );
  const subsectorIdx = headers.findIndex((h: string) => h === "subsector");
  const empresaIdx = headers.findIndex(
    (h: string) => h === "empresa" || h === "ticker"
  );
  const boaIdx = headers.findIndex(
    (h: string) => h === "boa" || h.includes("beta")
  );
  if (sectorIdx === -1 || subsectorIdx === -1 || empresaIdx === -1) return null;

  const groups = new Map<string, any>();
  for (const row of rawData.slice(headerRowIndex + 1)) {
    if (!row || row.length === 0) continue;
    const sector = String(row[sectorIdx] ?? "").trim();
    const subsector = String(row[subsectorIdx] ?? "").trim();
    const ticker = String(row[empresaIdx] ?? "").trim().toUpperCase();
    if (!subsector || !ticker) continue;
    const key = `${sector.toLowerCase()}||${subsector.toLowerCase()}`;
    if (!groups.has(key)) {
      groups.set(key, { sector, subsector, empresas: [], empresas_boa: {} });
    }
    const g = groups.get(key);
    if (!g.empresas.includes(ticker)) g.empresas.push(ticker);
    if (boaIdx !== -1) {
      const boa = Number(row[boaIdx]);
      if (Number.isFinite(boa)) g.empresas_boa[ticker] = boa;
    }
  }
  return [...groups.values()].filter((g) => g.empresas.length > 0);
};

export const parseFinancialExcel = (
  file: File,
  activeTab: string,
  activeFrequency: string
): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = read(bstr, { type: "binary" });
        let parsedData: any[] = [];
        const sheets = wb.SheetNames;

        const isTrimestral = checkIsTrimestralFromExcel(wb, sheets);

        if (
          activeFrequency === "trimestral" &&
          !isTrimestral &&
          activeTab !== "devaluacion"
        ) {
          throw new Error(
            "El formato del archivo no coincide con la frecuencia seleccionada. Se esperaba un formato trimestral."
          );
        }

        if (
          activeFrequency === "anual" &&
          isTrimestral &&
          activeTab !== "ir" &&
          activeTab !== "devaluacion"
        ) {
          throw new Error(
            "El formato del archivo no coincide con la frecuencia seleccionada. Se esperaba un formato anual."
          );
        }

        if (activeTab === "subsectores") {
          // Formato ancho clásico: hoja "by subsectores" con columnas Empresa 1..N
          const wideSheetName = sheets.find(
            (s) => s.toLowerCase() === "by subsectores"
          );
          if (wideSheetName) {
            parsedData = parseSubsectoresSheet(wb.Sheets[wideSheetName]);
          } else {
            // Formato largo: cualquier hoja con columnas Sector|Subsector|Empresa(+BOA)
            for (const name of sheets) {
              const longData = parseSubsectoresLongSheet(wb.Sheets[name]);
              if (longData && longData.length > 0) {
                parsedData = longData;
                break;
              }
            }
            if (parsedData.length === 0)
              throw new Error(
                "No se encontró la hoja 'by subsectores' ni columnas Sector/Subsector/Empresa en el archivo."
              );
          }

          if (parsedData.length === 0) {
            throw new Error(
              "El archivo está vacío o no tiene datos válidos de Subsectores."
            );
          }
        } else if (activeTab === "devaluacion") {
          sheets.forEach((sheetName) => {
            const ws = wb.Sheets[sheetName];
            const sheetData = parseDevaluacionSheet(ws, sheetName);
            parsedData = [...parsedData, ...sheetData];
          });

          if (parsedData.length === 0) {
            throw new Error(
              "El archivo está vacío o no tiene datos válidos de Devaluación."
            );
          }
        } else if (isTrimestral && activeTab !== "ir") {
          // 2a. Trimestral: 1 sola hoja, tabla única con columnas de fecha/trimestre
          const sheetName = sheets[0];
          const ws = wb.Sheets[sheetName];
          const data = utils.sheet_to_json(ws);
          if (data.length === 0) {
            throw new Error("El archivo está vacío o no tiene datos válidos.");
          }
          parsedData = data.map((row: any) => {
            const fechaRow = extractRowDate(row, sheetName);
            const mapped = mapRow(row, fechaRow, activeTab);

            if (activeTab === "rf") {
              const keys = Object.keys(mapped).filter(
                (k) => k !== "fecha" && k !== "id" && k !== "_complementId"
              );
              // Verificar si existen claves numéricas típicas de RF
              // O verificar si TIENE columnas que NO son países y SI son números como strings '0.08', '1.00'
              // La estrategia simple: si no tiene ninguna columna tipo "0.08", "1.00", etc, probablemente no es RF
              const knownRfKeys = [
                "0.08",
                "0.17",
                "0.25",
                "0.50",
                "1.00",
                "2.00",
                "3.00",
                "5.00",
                "7.00",
                "10.00",
                "20.00",
                "30.00",
              ];
              const matches = keys.some((k) => knownRfKeys.includes(k));
              if (!matches && keys.length > 0) {
                // Si tiene otras claves pero ninguna coincide con RF
                throw new Error(
                  "El archivo no parece ser una Tasa Libre de Riesgo (faltan columnas de plazos como 0.08, 1.00, etc)."
                );
              }
              return mapped as RiskFreeRateItem;
            }
            if (activeTab === "embi") {
              // Verificar que NO tenga claves de RF
              const keys = Object.keys(mapped).filter(
                (k) => k !== "fecha" && k !== "id" && k !== "_complementId"
              );
              const knownRfKeys = ["0.08", "1.00", "10.00", "30.00"];
              const hasRfKeys = keys.some((k) => knownRfKeys.includes(k));
              if (hasRfKeys) {
                throw new Error(
                  "El archivo parece ser de Tasa RF, no corresponde a EMBI (Países)."
                );
              }
              return mapped as DynamicCountryItem;
            }

            return mapped;
          });
        } else {
          // ANUAL
          if (["rf", "embi"].includes(activeTab) && sheets.length > 1) {
            throw new Error(
              `Para ${activeTab.toUpperCase()}, solo se admite el formato anual de una sola hoja.`
            );
          }

          // For annual format, there are two cases:
          // 1. Special case for IR: One sheet with years as columns.
          // 2. Standard annual: Multiple sheets, where each sheet is a year.
          // 3. Fallback for other tabs: One sheet with a date/year column.

          if (activeTab === "devaluacion") {
            sheets.forEach((sheetName) => {
              const ws = wb.Sheets[sheetName];
              const sheetData = parseDevaluacionSheet(ws, sheetName);
              parsedData = [...parsedData, ...sheetData];
            });

            if (parsedData.length === 0) {
              throw new Error(
                "El archivo está vacío o no tiene datos válidos de Devaluación."
              );
            }
          } else if (activeTab === "riesgo") {
            const sheetName =
              sheets.find((s) =>
                s.toLowerCase().includes("industry averages")
              ) || sheets[0];
            const ws = wb.Sheets[sheetName];
            parsedData = parseRiesgoCrediticio(ws);

            if (parsedData.length === 0) {
              throw new Error(
                "No se encontraron datos válidos en la tabla de Standard Deviation."
              );
            }
          } else if (activeTab === "tax") {
            const sheetName =
              sheets.find((s) =>
                s.toLowerCase().includes("industry averages")
              ) || sheets[0];
            const ws = wb.Sheets[sheetName];
            parsedData = parseTaxSheet(ws);

            if (parsedData.length === 0) {
              throw new Error(
                "No se encontraron datos en las celdas D11 y F13."
              );
            }
          } else if (activeTab === "damodaran") {
            // Buscar la hoja "Industry Averages" o usar la primera por defecto
            const sheetName =
              sheets.find((s) =>
                s.toLowerCase().includes("industry averages")
              ) || sheets[0];
            const ws = wb.Sheets[sheetName];
            parsedData = parseDamodaranNuevoFormato(ws);

            if (parsedData.length === 0) {
              throw new Error(
                "No se encontraron datos válidos o se detuvo la lectura antes de tiempo."
              );
            }
          } else if (activeTab === "ir") {
            // IR's special format is handled here, assuming one sheet
            const sheetName = sheets[0];
            const ws = wb.Sheets[sheetName];
            const data = utils.sheet_to_json(ws);

            if (data.length === 0) {
              throw new Error(
                "El archivo está vacío o no tiene datos válidos."
              );
            }

            data.forEach((row: any) => {
              const keys = Object.keys(row);
              const paisKey =
                keys.find(
                  (k) =>
                    k.toLowerCase().includes("país") ||
                    k.toLowerCase().includes("pais") ||
                    k.toLowerCase().includes("country") ||
                    k.toLowerCase().includes("region")
                ) || keys[0];

              const paisName = row[paisKey];
              if (!paisName) return; // Skip rows without a country identifier

              keys.forEach((k) => {
                const yearStr = String(k).trim();
                if (
                  k !== paisKey &&
                  !isNaN(Number(yearStr)) &&
                  yearStr.length === 4
                ) {
                  parsedData.push({
                    pais: String(paisName),
                    fecha: yearStr,
                    valor: Number(row[k]) || 0,
                  });
                }
              });
            });
          } else if (sheets.length === 1) {
            // Anual con 1 sola hoja: buscar la fecha/año en las columnas (ej. primera columna)
            const sheetName = sheets[0];
            const ws = wb.Sheets[sheetName];
            const data = utils.sheet_to_json(ws);
            parsedData = data.map((row: any) => {
              const fechaRow = extractRowDate(row, sheetName);
              return mapRow(row, fechaRow, activeTab);
            });
          } else {
            // 2b. Anual: Multiples hojas, el nombre de la hoja es el año
            sheets.forEach((sheetName) => {
              const ws = wb.Sheets[sheetName];
              const data = utils.sheet_to_json(ws);
              const mapped = data.map((row: any) =>
                mapRow(row, sheetName, activeTab)
              );
              let normalizedMapped = mapped;
              if (activeTab === "damodaran") {
                normalizedMapped = mapped.filter(
                  (item: any) =>
                    typeof item.d_sobre_def === "number" &&
                    typeof item.e_sobre_de === "number" &&
                    typeof item.tax_rate === "number"
                );
              }
              parsedData = [...parsedData, ...normalizedMapped];
            });
          }
        }
        if (activeTab !== "subsectores") {
          parsedData = parsedData.sort((a, b) => {
            a = new Date(a.fecha).getTime();
            b = new Date(b.fecha).getTime();
            return b - a;
          });
        }

        resolve(parsedData);
      } catch (error: any) {
        reject(error.message || "Error al procesar el archivo Excel.");
      }
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo."));
    reader.readAsBinaryString(file);
  });
};
