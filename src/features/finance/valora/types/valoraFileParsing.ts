import * as XLSX from "xlsx";

import type { FinancialTable } from "@/shared/types/ValoraTypes";

export type CustomTemplateInputs = {
  kd?: string;     // Celda C3: Costo de deuda (Section 4)
  debt?: string;   // Celda C4: % de deuda (Section 4)
  shares?: string; // Celda C5: Número de acciones (Section 1)
};

export type ParsedTablesResult = {
  balanceTable: FinancialTable | null;
  resultsTable: FinancialTable | null;
  customInputs?: CustomTemplateInputs;
};

const normalizeThousandsSeparators = (
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

const parsePercentageValue = (
  cell: XLSX.CellObject | undefined,
  rawArrayValue: any
): string | null => {
  let val: any = cell?.v ?? rawArrayValue;
  let formatted: string = cell?.w ? String(cell.w).trim() : "";

  if (val === undefined || val === null || val === "") {
    return null;
  }

  if (formatted.includes("%")) {
    const num = parseFloat(formatted.replace("%", "").trim());
    if (!isNaN(num)) {
      return String(num);
    }
  }

  if (typeof val === "number") {
    if (isNaN(val)) return null;
    if (val > 0 && val <= 1) {
      return String(Number((val * 100).toFixed(4)));
    }
    return String(val);
  }

  if (typeof val === "string") {
    const clean = val.replace("%", "").trim();
    const num = parseFloat(clean);
    if (!isNaN(num)) {
      if (num > 0 && num <= 1 && !val.includes("%") && clean.startsWith("0.")) {
        return String(Number((num * 100).toFixed(4)));
      }
      return String(num);
    }
  }

  return null;
};

const parseNumberValue = (
  cell: XLSX.CellObject | undefined,
  rawArrayValue: any
): string | null => {
  let val: any = cell?.v ?? rawArrayValue;

  if (val === undefined || val === null || val === "") {
    return null;
  }

  if (typeof val === "number") {
    if (isNaN(val) || val <= 0) return null;
    return String(Number(val.toFixed(2)));
  }

  if (typeof val === "string") {
    const clean = val.replace(/,/g, "").trim();
    const num = parseFloat(clean);
    if (!isNaN(num) && num > 0) {
      return String(Number(num.toFixed(2)));
    }
  }

  return null;
};

export const parseFinancialTablesFromFile = async (
  file: File
): Promise<ParsedTablesResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  let parsedBalance: FinancialTable | null = null;
  let parsedResults: FinancialTable | null = null;
  let customInputs: CustomTemplateInputs | undefined = undefined;

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;

    const data = XLSX.utils.sheet_to_json<Array<string | number | null>>(
      sheet,
      {
        header: 1,
        raw: true,
      }
    ) as Array<Array<string | number | null>>;

    // Extraer C3, C4, C5 si no han sido extraídos aun
    if (!customInputs) {
      const cellC3 = sheet["C3"];
      const cellC4 = sheet["C4"];
      const cellC5 = sheet["C5"];

      const rawC3 = data[2]?.[2];
      const rawC4 = data[3]?.[2];
      const rawC5 = data[4]?.[2];

      const kd = parsePercentageValue(cellC3, rawC3);
      const debt = parsePercentageValue(cellC4, rawC4);
      const shares = parseNumberValue(cellC5, rawC5);

      if (kd !== null || debt !== null || shares !== null) {
        customInputs = {
          ...(kd !== null ? { kd } : {}),
          ...(debt !== null ? { debt } : {}),
          ...(shares !== null ? { shares } : {}),
        };
      }
    }

    if (!parsedBalance) {
      parsedBalance = parseTable(
        data,
        "BALANCE GENERAL",
        "ESTADO DE RESULTADOS"
      );
    }
    if (!parsedResults) {
      parsedResults = parseTable(
        data,
        "ESTADO DE RESULTADOS",
        "BALANCE GENERAL"
      );
    }

    if (parsedBalance && parsedResults && customInputs) {
      break;
    }
  }

  return {
    balanceTable: normalizeThousandsSeparators(parsedBalance),
    resultsTable: normalizeThousandsSeparators(parsedResults),
    customInputs,
  };
};

const parseTable = (
  data: Array<Array<string | number | null>>,
  title: string,
  stopTitle: string
): FinancialTable | null => {
  const normalize = (value: string | number | null | undefined) =>
    String(value ?? "")
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, " ")
      .trim()
      .toUpperCase();

  const normalizedTitle = normalize(title);
  const normalizedStopTitle = normalize(stopTitle);

  const titleIndex = data.findIndex((row) =>
    row.some((cell) => normalize(cell) === normalizedTitle)
  );
  if (titleIndex < 0) {
    return null;
  }

  const yearIndexes: number[] = [];
  const years: string[] = [];

  const extractYearIndexes = (row: Array<string | number | null>) => {
    const indexes: number[] = [];
    const labels: string[] = [];

    row.forEach((cell, index) => {
      const value = String(cell ?? "").trim();
      if (!value) {
        return;
      }

      const numericYear = Number(value);
      if (
        Number.isFinite(numericYear) &&
        numericYear >= 1900 &&
        numericYear <= 2100
      ) {
        indexes.push(index);
        labels.push(value);
      }
    });

    return { indexes, labels };
  };

  let yearRowIndex = titleIndex;
  for (let i = titleIndex; i < data.length && i <= titleIndex + 5; i += 1) {
    const row = data[i] ?? [];
    const { indexes, labels } = extractYearIndexes(row);
    if (indexes.length >= 2) {
      yearRowIndex = i;
      yearIndexes.push(...indexes);
      years.push(...labels);
      break;
    }
  }

  if (yearIndexes.length === 0) {
    const fallbackRow = data[titleIndex + 1] ?? [];
    const lastFilledIndex = fallbackRow.reduce<number>(
      (last, cell, index) => (String(cell ?? "").trim() ? index : last),
      0
    );

    for (let i = 1; i <= lastFilledIndex; i += 1) {
      yearIndexes.push(i);
      years.push(String(fallbackRow[i] ?? "").trim() || `Col${i}`);
    }
    yearRowIndex = titleIndex + 1;
  }

  const firstYearCol = Math.min(...yearIndexes);

  const rows: FinancialTable["rows"] = [];
  let emptyRowStreak = 0;

  for (let i = yearRowIndex + 1; i < data.length; i += 1) {
    const row = data[i] ?? [];

    if (row.some((cell) => normalize(cell) === normalizedStopTitle)) {
      break;
    }

    let label = "";
    for (let col = 0; col < firstYearCol; col += 1) {
      const cellVal = String(row[col] ?? "").trim();
      if (!cellVal) continue;

      const isPureNumber = !isNaN(Number(cellVal)) && cellVal.length <= 3;
      if (isPureNumber) {
        let textInNextCol = "";
        for (let col2 = col + 1; col2 < firstYearCol; col2 += 1) {
          const nextVal = String(row[col2] ?? "").trim();
          if (nextVal && isNaN(Number(nextVal))) {
            textInNextCol = nextVal;
            break;
          }
        }
        if (textInNextCol) {
          label = textInNextCol;
          break;
        }
      }

      label = cellVal;
      break;
    }

    if (!label) {
      emptyRowStreak += 1;
      if (emptyRowStreak >= 8) {
        break;
      }
      continue;
    }

    emptyRowStreak = 0;

    const values = yearIndexes.map((index) => {
      const raw = row[index];
      if (raw === null || raw === undefined || raw === "") return 0;
      if (typeof raw === "number") return isNaN(raw) ? 0 : raw;
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        const hasParens =
          trimmed.startsWith("(") && trimmed.endsWith(")");

        if (hasParens) {
          const inside = trimmed
            .slice(1, -1)
            .replace(/[$S/,\s]/g, "")
            .trim();
          const num = parseFloat(inside);
          return isNaN(num) ? 0 : -Math.abs(num);
        }

        const clean = raw.replace(/[$S/,\s]/g, "").trim();
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    });

    rows.push({ label, values });
  }

  return {
    title,
    years,
    rows,
  };
};
