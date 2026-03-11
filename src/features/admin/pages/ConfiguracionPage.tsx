import React, { useState, useRef, useEffect } from "react";
import { SimpleTable } from "@/shared/components/ui/SimpleTable";
import { read, utils } from "xlsx";
import { MainService } from "@/shared/services/main.service";
import type { BaseComplementItem, DamodaranItem } from "@/shared/types";

// ─── TYPES ────────────────────────────────────────────────────────────────────
// Moved to shared/types/templatecomplement.types.ts

// ─── INITIAL MOCK DATA ────────────────────────────────────────────────────────
// Kept for fallback or reference, but state will initialize empty to prefer API data
const MOCK_RF: BaseComplementItem[] = [];
const MOCK_PRIMA: BaseComplementItem[] = [];
const MOCK_IR: BaseComplementItem[] = [];
const MOCK_DAMODARAN: DamodaranItem[] = [];
const MOCK_DEVALUACION: BaseComplementItem[] = [];
const MOCK_EMBI: BaseComplementItem[] = [];

export const ConfiguracionPage = () => {
  const [activeFrequency, setActiveFrequency] = useState<
    "trimestral" | "anual"
  >("trimestral");
  const [activeTab, setActiveTab] = useState("rf");
  const [isLoading, setIsLoading] = useState(false);

  // State for each section
  const [rfData, setRfData] = useState<BaseComplementItem[]>(MOCK_RF);
  const [primaData, setPrimaData] = useState<BaseComplementItem[]>(MOCK_PRIMA);
  const [irData, setIrData] = useState<BaseComplementItem[]>(MOCK_IR);
  const [damodaranData, setDamodaranData] =
    useState<DamodaranItem[]>(MOCK_DAMODARAN);
  const [devaluacionData, setDevaluacionData] =
    useState<BaseComplementItem[]>(MOCK_DEVALUACION);
  const [embiData, setEmbiData] = useState<BaseComplementItem[]>(MOCK_EMBI);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const complements = await MainService.getTemplateComplements();

      const extractData = (name: string) => {
        return complements
          .filter((c) => c.nombre === name)
          .flatMap((c) =>
            (Array.isArray(c.data) ? c.data : []).map((item: any) => ({
              ...item,
              _complementId: c.id, // Track origin for future updates
            }))
          );
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
    if (!confirm("¿Eliminar registro?")) return;

    // If item belongs to a backend record (JSON data), we would ideally update that JSON.
    // For now, simpler implementation: We just update local state because granular deletion inside a JSON blob
    // via REST API requires specific logic (GET -> Filter -> PUT).
    // If the user wants to delete the whole uploaded file, that's a different UI (List of Complements).

    // Optimized approach: If we want to support row deletion, we perform the full cycle.
    if (item._complementId) {
      try {
        const complement = await MainService.getTemplateComplement(
          item._complementId
        );
        const currentData = Array.isArray(complement.data)
          ? complement.data
          : [];
        const newData = currentData.filter((x: any) => x.id !== id);

        await MainService.updateTemplateComplement(item._complementId, {
          data: newData,
        });

        // Refresh all
        loadData();
        return;
      } catch (err) {
        console.error("Error updating complement", err);
        alert("Error al eliminar el registro del servidor.");
        return;
      }
    }

    // Fallback for local-only items
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  // Wrapper for delete to pass the item
  const createDeleteHandler = (setter: any, data: any[]) => (item: any) =>
    handleDelete(setter, item.id, item);

  const handleCreate = (
    data: any[],
    setter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    // Just mock creation locally for now
    const newItem = {
      ...data[0],
      id: Date.now(),
      descripcion: "Nuevo Registro Local",
    };
    setter([...data, newItem]);
  };

  // EXCEL HANDLING
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const processExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = read(bstr, { type: "binary" });

      let parsedData: any[] = [];
      const sheets = wb.SheetNames;

      sheets.forEach((sheetName) => {
        const ws = wb.Sheets[sheetName];
        const data = utils.sheet_to_json(ws);

        const mappedData = data.map((row: any) => {
          const baseItem = {
            id: Math.floor(Math.random() * 1000000),
            // Default date handling
            fecha:
              row.fecha ||
              row.year ||
              row.Year ||
              (activeFrequency === "anual"
                ? sheetName
                : row.trimestre || row.Quarter || sheetName),
            ...row, // Include all raw data
          };

          // Specific normalization based on Active Tab
          if (activeTab === "damodaran") {
            return {
              ...baseItem,
              industria: row.industria || row.Industry || row.INDUSTRIA,
              num_firmas:
                row.num_firmas || row["Number of Firms"] || row["Num Firms"],
              unlevered_beta:
                row.unlevered_beta ||
                row["Unlevered Beta"] ||
                row["Beta Unlevered"],
              levered_beta:
                row.levered_beta || row["Levered Beta"] || row["Beta Levered"],
              cost_of_equity:
                row.cost_of_equity || row["Cost of Equity"] || row.CoE,
            };
          } else {
            // Standard components (RF, EMBI, Prima, IR, Devaluacion) use 'pais' and 'valor'
            return {
              ...baseItem,
              pais:
                row.pais || row.Pais || row.PAIS || row.Country || row.Region,
              valor:
                row.valor ||
                row.Valor ||
                row.VALOR ||
                row.Value ||
                row.rate ||
                row.Tasa ||
                row.prima,
              fuente: row.fuente || row.Source,
              descripcion: row.descripcion || row.Description || row.detalle,
            };
          }
        });

        parsedData = [...parsedData, ...mappedData];
      });

      if (parsedData.length === 0) {
        alert("No se encontraron datos en el archivo.");
        return;
      }

      try {
        setIsLoading(true);
        // SAVE TO API
        await MainService.createTemplateComplement({
          nombre: activeTab,
          fecha: new Date().toISOString(),
          data: parsedData,
        });

        alert(
          `Se importaron y guardaron ${parsedData.length} registros exitosamente para ${activeTab.toUpperCase()}.`
        );

        // Refresh Data from API
        loadData();
      } catch (error) {
        console.error("Error saving data", error);
        alert("Hubo un error al guardar los datos en el servidor.");
      } finally {
        setIsLoading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Configuración Financiera
        </h1>
        <p className="text-gray-500">
          Gestión de indicadores macroeconómicos y parámetros del sistema.
        </p>
      </div>

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
            onChange={processExcel}
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
          <SimpleTable
            data={rfData}
            columns={[
              { header: "País/Región", accessorKey: "pais" },
              {
                header: "Tasa/Valor",
                accessorKey: "valor",
                cell: (item) => (
                  <span className="font-mono text-blue-700">{item.valor}</span>
                ),
              },
              { header: "Trimestre/Año", accessorKey: "fecha" },
              { header: "Fuente", accessorKey: "fuente" },
            ]}
            onDelete={createDeleteHandler(setRfData, rfData)}
            onEdit={(item) => alert(`Editar RF: ${item.pais}`)}
          />
        )}

        {activeTab === "embi" && activeFrequency === "trimestral" && (
          <SimpleTable
            data={embiData}
            columns={[
              { header: "País", accessorKey: "pais" },
              {
                header: "Puntaje (bps)",
                accessorKey: "valor",
                cell: (item) => (
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-bold">
                    {item.valor}
                  </span>
                ),
              },
              { header: "Trimestre/Año", accessorKey: "fecha" },
              { header: "Índice", accessorKey: "descripcion" },
            ]}
            onDelete={createDeleteHandler(setEmbiData, embiData)}
            onEdit={(item) => alert(`Editar EMBI: ${item.pais}`)}
          />
        )}

        {activeTab === "prima" && activeFrequency === "anual" && (
          <SimpleTable
            data={primaData}
            columns={[
              { header: "País/Mercado", accessorKey: "pais" },
              {
                header: "Prima",
                accessorKey: "valor",
                cell: (item) => <span className="font-bold">{item.valor}</span>,
              },
              { header: "Año", accessorKey: "fecha" },
              { header: "Descripción", accessorKey: "descripcion" },
            ]}
            onDelete={createDeleteHandler(setPrimaData, primaData)}
            onEdit={(item) => alert(`Editar Prima: ${item.pais}`)}
          />
        )}

        {activeTab === "ir" && activeFrequency === "anual" && (
          <SimpleTable
            data={irData}
            columns={[
              { header: "País", accessorKey: "pais" },
              { header: "Tasa", accessorKey: "valor" },
              { header: "Año", accessorKey: "fecha" },
              { header: "Concepto", accessorKey: "descripcion" },
            ]}
            onDelete={createDeleteHandler(setIrData, irData)}
            onEdit={(item) => alert(`Editar IR: ${item.pais}`)}
          />
        )}

        {activeTab === "damodaran" && activeFrequency === "anual" && (
          <SimpleTable
            data={damodaranData}
            columns={[
              {
                header: "Industria",
                accessorKey: "industria",
                cell: (item) => (
                  <span className="font-medium text-gray-900">
                    {item.industria}
                  </span>
                ),
              },
              { header: "Num. Firmas", accessorKey: "num_firmas" },
              { header: "Unlevered Beta", accessorKey: "unlevered_beta" },
              { header: "Levered Beta", accessorKey: "levered_beta" },
              { header: "Cost of Equity", accessorKey: "cost_of_equity" },
            ]}
            onDelete={createDeleteHandler(setDamodaranData, damodaranData)}
            onEdit={(item) => alert(`Editar Industria: ${item.industria}`)}
          />
        )}

        {activeTab === "devaluacion" && activeFrequency === "anual" && (
          <SimpleTable
            data={devaluacionData}
            columns={[
              { header: "País", accessorKey: "pais" },
              {
                header: "Tasa Devaluación",
                accessorKey: "valor",
                cell: (item) => (
                  <span className="text-red-600 font-mono">{item.valor}</span>
                ),
              },
              { header: "Año", accessorKey: "fecha" },
              { header: "Detalle", accessorKey: "descripcion" },
            ]}
            onDelete={createDeleteHandler(setDevaluacionData, devaluacionData)}
            onEdit={(item) => alert(`Editar Devaluación: ${item.pais}`)}
          />
        )}
      </div>
    </div>
  );
};
