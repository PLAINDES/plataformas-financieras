import React, { useState, useRef, useEffect } from "react";
import { MainService } from "@/shared/services/main.service";
import {
  ToastStack,
  type ToastItem,
} from "@/shared/components/common/ToastStack";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";
import type { BaseFinancialItem, DamodaranItem } from "@/shared/types"; // Fallback import
import { Upload } from "lucide-react";

import { RfTable } from "./configuracion-tabs/RfTable";
import { EmbiTable } from "./configuracion-tabs/EmbiTable";
import { PrimaTable } from "./configuracion-tabs/PrimaTable";
import { IrTable } from "./configuracion-tabs/IrTable";
import { DamodaranTable } from "./configuracion-tabs/DamodaranTable";
import { TaxTable } from "./configuracion-tabs/TaxTable";
import { DevaluacionTable } from "./configuracion-tabs/DevaluacionTable";
import { RiesgoTable } from "./configuracion-tabs/RiesgoTable";

// Metodo para excel
import { parseFinancialExcel } from "../utils/excel-parsers";

// INITIAL MOCK DATA
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
  const [riesgoData, setRiesgoData] = useState<any[]>([]);
  const [taxData, setTaxData] = useState<any[]>([]);

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
          .filter((c: any) => c.nombre === name)
          .flatMap((c: any) =>
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
      setRiesgoData(extractData("riesgo"));
      setTaxData(extractData("tax"));
    } catch (error) {
      console.error("Failed to load configuration data", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generic Handlers (simplified for demo)
  const handleDelete = async (
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    _id: number,
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
  const createDeleteHandler = (setter: any) => (item: any) =>
    handleDelete(setter, item.id, item);

  // EXCEL HANDLING
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const processExcel = async (
    e: React.ChangeEvent<HTMLInputElement>,
    activeTab: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseFinancialExcel(
        file,
        activeTab,
        activeFrequency
      );

      setModalState({
        isOpen: true,
        title: "Confirmar Importación",
        description: `Se han detectado ${parsedData.length} registros para ${activeTab.toUpperCase()}. ¿Desea proceder con la carga?`,
        confirmText: "Importar",
        variant: "default",
        onConfirm: async () => {
          setModalState((prev) => ({ ...prev, isLoading: true }));
          try {
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
    } catch (err: any) {
      console.error("Error processing Excel file", err);
      addToast(
        "error",
        "Error al procesar el archivo Excel. Asegúrese de que el formato sea correcto."
      );
    } finally {
      e.target.value = ""; // Reset file input
    }
  };

  const renderTabButton = (id: string, label: string) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
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
          <h1 className="text-[11px] sm:text-xs font-bold tracking-widest text-slate-800 uppercase">
            Configuración Financiera
          </h1>
          <h3 className="text-xs sm:text-sm font-medium text-gray-500">
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
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-medium ${
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
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-medium ${
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
              className="inline-flex items-center px-4 py-2 text-xs sm:text-sm border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="h-4 w-4 mr-2" />
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
              {renderTabButton("tax", "Tax Rates")}
              {renderTabButton("riesgo", "Riesgo Crediticio")}
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
              onDelete={createDeleteHandler(setRfData)}
            />
          )}

          {activeTab === "embi" && activeFrequency === "trimestral" && (
            <EmbiTable
              data={embiData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setEmbiData)}
            />
          )}

          {activeTab === "prima" && activeFrequency === "anual" && (
            <PrimaTable
              data={primaData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setPrimaData)}
            />
          )}

          {activeTab === "ir" && activeFrequency === "anual" && (
            <IrTable
              data={irData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setIrData)}
            />
          )}

          {activeTab === "damodaran" && activeFrequency === "anual" && (
            <DamodaranTable
              data={damodaranData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setDamodaranData)}
            />
          )}

          {activeTab === "tax" && activeFrequency === "anual" && (
            <TaxTable
              data={taxData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setTaxData)}
            />
          )}

          {activeTab === "riesgo" && activeFrequency === "anual" && (
            <RiesgoTable
              data={riesgoData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setRiesgoData)}
            />
          )}

          {activeTab === "devaluacion" && activeFrequency === "anual" && (
            <DevaluacionTable
              data={devaluacionData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setDevaluacionData)}
            />
          )}
        </div>
      </div>
    </>
  );
};
