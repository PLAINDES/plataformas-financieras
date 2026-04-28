/*

*/

import { utils } from "xlsx";

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
