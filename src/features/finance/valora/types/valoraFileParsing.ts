import * as XLSX from "xlsx";

import type { FinancialTable } from "@/shared/types/ValoraTypes";

export type ParsedTablesResult = {
  balanceTable: FinancialTable | null;
  resultsTable: FinancialTable | null;
};

export const parseFinancialTablesFromFile = async (
  file: File,
): Promise<ParsedTablesResult> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  let parsedBalance: FinancialTable | null = null;
  let parsedResults: FinancialTable | null = null;

  for (const name of workbook.SheetNames) {
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json<Array<string | number | null>>(
      sheet,
      {
        header: 1,
        raw: true,
      },
    ) as Array<Array<string | number | null>>;

    if (!parsedBalance) {
      parsedBalance = parseTable(
        data,
        "BALANCE GENERAL",
        "ESTADO DE RESULTADOS",
      );
    }
    if (!parsedResults) {
      parsedResults = parseTable(
        data,
        "ESTADO DE RESULTADOS",
        "BALANCE GENERAL",
      );
    }

    if (parsedBalance && parsedResults) {
      break;
    }
  }

  return {
    balanceTable: parsedBalance,
    resultsTable: parsedResults,
  };
};

const parseTable = (
  data: Array<Array<string | number | null>>,
  title: string,
  stopTitle: string,
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
    row.some((cell) => normalize(cell) === normalizedTitle),
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
  let labelColumnIndex = 0;
  for (let i = titleIndex; i < data.length && i <= titleIndex + 5; i += 1) {
    const row = data[i] ?? [];
    const { indexes, labels } = extractYearIndexes(row);
    if (indexes.length >= 2) {
      yearRowIndex = i;
      yearIndexes.push(...indexes);
      years.push(...labels);

      const nonYearIndex = row.findIndex((cell, index) => {
        if (!String(cell ?? "").trim()) {
          return false;
        }
        return !yearIndexes.includes(index);
      });
      labelColumnIndex = nonYearIndex >= 0 ? nonYearIndex : 0;
      break;
    }
  }

  if (yearIndexes.length === 0) {
    const fallbackRow = data[titleIndex + 1] ?? [];
    const lastFilledIndex = fallbackRow.reduce(
      (last, cell, index) => (String(cell ?? "").trim() ? index : last),
      0,
    );

    for (let i = 1; i <= lastFilledIndex; i += 1) {
      yearIndexes.push(i);
      years.push(String(fallbackRow[i] ?? "").trim() || `Col${i}`);
    }
    yearRowIndex = titleIndex + 1;
  }

  const rows: FinancialTable["rows"] = [];
  let emptyRowStreak = 0;
  for (let i = yearRowIndex + 1; i < data.length; i += 1) {
    const row = data[i] ?? [];
    const label = String(row[labelColumnIndex] ?? "").trim();

    if (row.some((cell) => normalize(cell) === normalizedStopTitle)) {
      break;
    }

    if (!label) {
      emptyRowStreak += 1;
      if (emptyRowStreak >= 3) {
        break;
      }
      continue;
    }

    emptyRowStreak = 0;

    const values = yearIndexes.map((index) => row[index] ?? 0);
    rows.push({ label, values });
  }

  return {
    title,
    years,
    rows,
  };
};
