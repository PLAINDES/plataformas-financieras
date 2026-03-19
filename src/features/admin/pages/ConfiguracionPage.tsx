import React, { useState, useRef, useEffect } from "react";
import { read, utils } from "xlsx";
import { MainService } from "@/shared/services/main.service";
import {
  ToastStack,
  type ToastItem,
} from "@/shared/components/common/ToastStack";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";
import type {
  BaseFinancialItem,
  DamodaranItem,
  RiskFreeRateItem,
  DynamicCountryItem,
} from "@/shared/types"; // Fallback import

import { RfTable } from "./configuracion-tabs/RfTable";
import { EmbiTable } from "./configuracion-tabs/EmbiTable";
import { PrimaTable } from "./configuracion-tabs/PrimaTable";
import { IrTable } from "./configuracion-tabs/IrTable";
import { DamodaranTable } from "./configuracion-tabs/DamodaranTable";
import { DevaluacionTable } from "./configuracion-tabs/DevaluacionTable";

// ─── INITIAL MOCK DATA ────────────────────────────────────────────────────────
// Kept for fallback or reference, but state will initialize empty to prefer API data
const MOCK_RF: BaseFinancialItem[] = []; // Used as fallback generic type
const MOCK_PRIMA: BaseFinancialItem[] = [];
const MOCK_IR: BaseFinancialItem[] = [];
const MOCK_DAMODARAN: DamodaranItem[] = [];
const MOCK_DEVALUACION: BaseFinancialItem[] = [];
const MOCK_EMBI: BaseFinancialItem[] = [];

export const ConfiguracionPage = () => {
  const [activeFrequency, setActiveFrequency] = useState<
    "trimestral" | "anual"
  >("trimestral");
  const [activeTab, setActiveTab] = useState("rf");
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description?: string;
    onConfirm?: () => Promise<void> | void;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
    isLoading?: boolean;
  }>({ isOpen: false, title: "" });

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const addToast = (type: any, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // State for each section
  const [rfData, setRfData] = useState<BaseFinancialItem[]>(MOCK_RF);
  const [primaData, setPrimaData] = useState<BaseFinancialItem[]>(MOCK_PRIMA);
  const [irData, setIrData] = useState<BaseFinancialItem[]>(MOCK_IR);
  const [damodaranData, setDamodaranData] =
    useState<DamodaranItem[]>(MOCK_DAMODARAN);
  const [devaluacionData, setDevaluacionData] =
    useState<BaseFinancialItem[]>(MOCK_DEVALUACION);
  const [embiData, setEmbiData] = useState<BaseFinancialItem[]>(MOCK_EMBI);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Data from API
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const complements = await MainService.getTemplateComplements(activeTab);

      const extractData = (name: string) => {
        const items = complements
          .filter((c) => c.nombre === name)
          .flatMap((c) =>
            (Array.isArray(c.data) ? c.data : []).map((item: any) => ({
              ...item,
              _complementId: c.id, // Track origin for future updates
            }))
          );

        if (name === "ir") {
          const grouped: Record<string, any> = {};
          items.forEach((item: any) => {
            const p = item.pais;
            if (!p) return;
            if (!grouped[p]) {
              grouped[p] = {
                pais: p,
                _complementId: item._complementId,
                id: item.id || p,
              };
            }
            if (item.fecha) {
              grouped[p][item.fecha] = item.valor;
            }
          });
          return Object.values(grouped).sort((a: any, b: any) =>
            String(a.pais).localeCompare(String(b.pais))
          );
        }

        return items.sort((a: any, b: any) => {
          const dateA = new Date(a.fecha).getTime();
          const dateB = new Date(b.fecha).getTime();
          return dateB - dateA;
        });
      };

      setRfData(extractData("rf"));
      setEmbiData(extractData("embi"));
      setPrimaData(extractData("prima"));
      setIrData(extractData("ir"));
      setDamodaranData(extractData("damodaran"));
      setDevaluacionData(extractData("devaluacion"));
    } catch (error) {
      console.error("Failed to load configuration data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generic Handlers (simplified for demo)
  const handleDelete = async (
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    id: number,
    item: any
  ) => {
    setModalState({
      isOpen: true,
      title: "¿Eliminar registro?",
      description: "Esta acción no se puede deshacer.",
      onConfirm: async () => {
        setModalState((prev) => ({ ...prev, isLoading: true }));
        try {
          if (item._complementId) {
            const complement = await MainService.getTemplateComplement(
              item._complementId
            );
            const currentData = Array.isArray(complement.data)
              ? complement.data
              : [];
            const newData = currentData.filter((x: any) => {
              if (activeTab === "ir") {
                return x.pais !== item.pais;
              } else if (activeTab === "damodaran") {
                return x.industria !== item.industria || x.fecha !== item.fecha;
              } else if (activeTab === "devaluacion") {
                return x.periodo !== item.periodo || x.fecha !== item.fecha;
              }
              return x.fecha !== item.fecha;
            });

            await MainService.updateTemplateComplement(item._complementId, {
              data: newData,
            });

            loadData();
          } else {
            // Fallback for local-only items
            setter((prev) =>
              prev.filter((x) => {
                if (activeTab === "ir") return x.pais !== item.pais;
                if (activeTab === "damodaran")
                  return (
                    x.industria !== item.industria || x.fecha !== item.fecha
                  );
                if (activeTab === "devaluacion")
                  return x.periodo !== item.periodo || x.fecha !== item.fecha;
                return x.fecha !== item.fecha;
              })
            );
          }
          addToast("success", "Registro eliminado correctamente");
          closeModal();
        } catch (err: any) {
          console.error("Error updating complement", err);
          addToast("error", "Error al eliminar el registro.");
        } finally {
          setModalState((prev) => ({ ...prev, isLoading: false }));
        }
      },
      confirmText: "Eliminar",
      variant: "destructive",
    });
  };

  // Wrapper for delete to pass the item
  const createDeleteHandler = (setter: any, data: any[]) => (item: any) =>
    handleDelete(setter, item.id, item);

  // EXCEL HANDLING
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const cleanExcelDate = (val: any, fallback: any) => {
    let cleanFecha = val || fallback;
    if (typeof cleanFecha === "number" && cleanFecha > 20000) {
      const dateObj = new Date(Math.round((cleanFecha - 25569) * 86400 * 1000));
      // Adjust for timezone offset to prevent date shifting
      const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);
      cleanFecha = adjustedDate.toLocaleDateString("en-US");
    } else if (cleanFecha instanceof Date) {
      cleanFecha = cleanFecha.toLocaleDateString("en-US");
    }
    return cleanFecha;
  };

  const extractRowDate = (row: any, fallbackDate: string) => {
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

  const checkIsTrimestralFromExcel = (wb: any, sheets: string[]): boolean => {
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

  const mapRow = (row: any, defaultFecha: string) => {
    const baseItem = {
      fecha: cleanExcelDate(row.fecha, defaultFecha),
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

  const parseDevaluacionSheet = (ws: any, sheetName: string) => {
    const rawData = utils.sheet_to_json<any[]>(ws, { header: 1 });
    let headerRowIndex = -1;
    let year = sheetName;

    // Buscar la fila que tiene "Periodo", "Argentina", etc.
    for (let i = 0; i < Math.min(20, rawData.length); i++) {
      const row = rawData[i];
      if (!row || !Array.isArray(row)) continue;

      const rowStr = row.map((c) => String(c).toLowerCase()).join(" ");
      if (
        rowStr.includes("argentina") ||
        rowStr.includes("periodo") ||
        rowStr.includes("brazil")
      ) {
        headerRowIndex = i;
        // Buscar el año en filas anteriores si existe
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

    if (headerRowIndex === -1) {
      // Retornar vacío si no se encuentra en esta hoja
      return [];
    }

    const headers = rawData[headerRowIndex].map((h: any) =>
      String(h || "").trim()
    );
    const dataRows = rawData.slice(headerRowIndex + 1);
    const result = [];

    for (const row of dataRows) {
      if (
        !row ||
        row.length === 0 ||
        row[0] === undefined ||
        row[0] === null ||
        String(row[0]).trim() === ""
      ) {
        continue;
      }

      // Evitar la fila que contiene el índice de los países (1, 2, 3, 4...)
      if (
        String(row[0]).trim() === "1" ||
        String(row[1]).trim() === "1" ||
        String(row[1]).trim() === "2"
      ) {
        continue;
      }

      const periodo = String(row[0]); // Este es el periodo (0.2466, etc)

      // Armamos la fila con la misma estructura que EMBI/Damodaran, con los países como columnas
      const item: any = {
        fecha: year, // El año va aquí como 'fecha' principal
        periodo: periodo, // Renombramos el periodo a 'periodo' para no chocar con 'fecha'
      };

      for (let i = 1; i < headers.length; i++) {
        let country = headers[i];
        if (
          !country ||
          country.startsWith("__EMPTY") ||
          /^\d+$/.test(country)
        ) {
          continue;
        }

        if (country.toLowerCase().includes("united states"))
          country = "United States";
        if (
          country.toLowerCase().includes("mexico") ||
          country.toLowerCase().includes("méxico")
        )
          country = "Mexico";
        if (
          country.toLowerCase().includes("peru") ||
          country.toLowerCase().includes("perú")
        )
          country = "Peru";
        if (
          country.toLowerCase().includes("brazil") ||
          country.toLowerCase().includes("brasil")
        )
          country = "Brazil";

        const val = row[i];
        if (val !== undefined && val !== null && val !== "") {
          const numVal = Number(val);
          if (!isNaN(numVal)) {
            item[country] = numVal;
          } else {
            item[country] = val;
          }
        } else {
          item[country] = "";
        }
      }
      result.push(item);
    }
    return result;
  };

  const processExcel = async (
    e: React.ChangeEvent<HTMLInputElement>,
    activeTab: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = read(bstr, { type: "binary" });
        let parsedData: any[] = [];
        const sheets = wb.SheetNames;

        const isTrimestral = checkIsTrimestralFromExcel(wb, sheets);

        if (activeFrequency === "trimestral" && !isTrimestral) {
          throw new Error(
            "El formato del archivo no coincide con la frecuencia seleccionada. Se esperaba un formato trimestral."
          );
        }

        if (activeFrequency === "anual" && isTrimestral && activeTab !== "ir") {
          throw new Error(
            "El formato del archivo no coincide con la frecuencia seleccionada. Se esperaba un formato anual."
          );
        }

        if (isTrimestral && activeTab !== "ir") {
          // 2a. Trimestral: 1 sola hoja, tabla única con columnas de fecha/trimestre
          const sheetName = sheets[0];
          const ws = wb.Sheets[sheetName];
          const data = utils.sheet_to_json(ws);
          if (data.length === 0) {
            throw new Error("El archivo está vacío o no tiene datos válidos.");
          }
          parsedData = data.map((row: any) => {
            const fechaRow = extractRowDate(row, sheetName);
            const mapped = mapRow(row, fechaRow);

            if (activeTab === "rf") {
              const keys = Object.keys(mapped).filter(
                (k) => k !== "fecha" && k !== "id" && k !== "_complementId"
              );
              // Verificar si existen claves numéricas típicas de RF
              const hasRfKeys = keys.some(
                (k) => !isNaN(Number(k)) && Number(k) > 0
              );
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
              return mapRow(row, fechaRow);
            });
          } else {
            // 2b. Anual: Multiples hojas, el nombre de la hoja es el año
            sheets.forEach((sheetName) => {
              const ws = wb.Sheets[sheetName];
              const data = utils.sheet_to_json(ws);
              console.log(data);
              const mapped = data.map((row: any) => mapRow(row, sheetName));
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
        console.log(parsedData);
        console.log("ES TRIMESTRAL " + isTrimestral);
        parsedData = parsedData.sort((a, b) => {
          a = new Date(a.fecha).getTime();
          b = new Date(b.fecha).getTime();
          return b - a;
        });
        setModalState({
          isOpen: true,
          title: "Confirmar Importación",
          description: `Se han detectado ${parsedData.length} registros para ${activeTab.toUpperCase()}. ¿Desea proceder con la carga?`,
          confirmText: "Importar",
          variant: "default",
          onConfirm: async () => {
            setModalState((prev) => ({ ...prev, isLoading: true }));
            try {
              // SAVE TO API
              await MainService.createTemplateComplement({
                nombre: activeTab,
                fecha: new Date().toISOString(),
                data: parsedData,
              });

              addToast(
                "success",
                `Se importaron ${parsedData.length} registros.`
              );
              loadData();
              closeModal();
            } catch (err: any) {
              console.error("Error saving data", err);
              addToast("error", "Error al guardar los datos.");
            } finally {
              setModalState((prev) => ({ ...prev, isLoading: false }));
            }
          },
        });

        e.target.value = ""; // Reset file input
      } catch (error: any) {
        console.error("Error processing Excel:", error);
        addToast(
          "error",
          error.message || "Error al procesar el archivo Excel."
        );
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  const renderTabButton = (id: string, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
        activeTab === id
          ? "border-blue-500 text-blue-600 bg-blue-50"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-4 py-3 md:px-6 flex justify-between">
        <div>
          <h1 className="text-xs font-bold tracking-widest text-slate-800 uppercase">
            Configuración Financiera
          </h1>
          <h3 className="text-sm font-medium text-gray-500">
            Gestión de indicadores macroeconómicos y parámetros del sistema.
          </h3>
        </div>
      </header>
      <div className="p-6">
        <ConfirmationModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          onConfirm={async () => {
            if (modalState.onConfirm) {
              await modalState.onConfirm();
            }
          }}
          title={modalState.title}
          description={modalState.description}
          isLoading={modalState.isLoading}
          confirmText={modalState.confirmText}
          cancelText={modalState.cancelText}
          variant={modalState.variant}
        />
        <ToastStack toasts={toasts} onDismiss={removeToast} />

        {/* FREQUENCY SELECTOR & ACTIONS */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setActiveFrequency("trimestral");
                setActiveTab("rf");
              }}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeFrequency === "trimestral"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Indicadores Trimestrales
            </button>
            <button
              onClick={() => {
                setActiveFrequency("anual");
                setActiveTab("prima");
              }}
              className={`px-6 py-3 rounded-lg text-sm font-medium transition-all ${
                activeFrequency === "anual"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Indicadores Anuales
            </button>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => processExcel(e, activeTab)}
              className="hidden"
              accept=".xlsx, .xls, .csv"
            />
            <button
              onClick={handleImportClick}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Importar Excel ({activeTab.toUpperCase()})
            </button>
          </div>
        </div>

        {/* TABS HEADER */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
          {activeFrequency === "trimestral" && (
            <>
              {renderTabButton("rf", "Tasa RF")}
              {renderTabButton("embi", "EMBI")}
            </>
          )}

          {activeFrequency === "anual" && (
            <>
              {renderTabButton("prima", "Prima de Mercado")}
              {renderTabButton("ir", "IR (Impuestos/Inflación)")}
              {renderTabButton("damodaran", "Damodaran Industries")}
              {renderTabButton("devaluacion", "Devaluación")}
            </>
          )}
        </div>

        {/* TABS CONTENT */}
        <div>
          {activeTab === "rf" && activeFrequency === "trimestral" && (
            <RfTable
              data={rfData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setRfData, rfData)}
            />
          )}

          {activeTab === "embi" && activeFrequency === "trimestral" && (
            <EmbiTable
              data={embiData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setEmbiData, embiData)}
            />
          )}

          {activeTab === "prima" && activeFrequency === "anual" && (
            <PrimaTable
              data={primaData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setPrimaData, primaData)}
            />
          )}

          {activeTab === "ir" && activeFrequency === "anual" && (
            <IrTable
              data={irData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setIrData, irData)}
            />
          )}

          {activeTab === "damodaran" && activeFrequency === "anual" && (
            <DamodaranTable
              data={damodaranData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setDamodaranData, damodaranData)}
            />
          )}

          {activeTab === "devaluacion" && activeFrequency === "anual" && (
            <DevaluacionTable
              data={devaluacionData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(
                setDevaluacionData,
                devaluacionData
              )}
            />
          )}
        </div>
      </div>
    </>
  );
};
