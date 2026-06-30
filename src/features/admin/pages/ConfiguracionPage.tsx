import React, { useState, useRef, useEffect, useCallback } from "react";
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
import { SubsectoresTable } from "./configuracion-tabs/SubsectoresTable";

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
    "trimestral" | "anual" | ""
  >("trimestral");
  const [activeTab, setActiveTab] = useState("rf");
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [boaProgressText, setBoaProgressText] = useState<string | null>(null);
  const resolveBoaRef = useRef<((v: boolean) => void) | null>(null);
  const boaPollingRef = useRef(false);
  const parsedDataRef = useRef<any[] | null>(null);
  const boaTabRef = useRef<string | null>(null);
  const activeTabRef = useRef("rf");

  type BoaJob = { jobId: string; total: number; processed: number; failed: number };
  const [activeBoaJob, setActiveBoaJob] = useState<BoaJob | null>(null);

  const loadDataRef = useRef<() => Promise<void>>(null as any);

  const startBoaPolling = useCallback(async (jobId: string, total: number) => {
    if (boaPollingRef.current) return;
    boaPollingRef.current = true;
    let lastSavedCompanies = 0;
    try {
      while (true) {
        let progress;
        try {
          progress = await MainService.getBoaProgress(jobId);
        } catch (err) {
          console.warn("startBoaPolling: error polling, retrying in 5s:", err);
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue;
        }

        setBoaProgressText(
          progress.status === "completed"
            ? `Cálculo finalizado: ${progress.processed}/${total} empresas procesadas (${progress.failed} errores).`
            : progress.status === "error"
            ? `Error: ${progress.result?.error || "desconocido"}`
            : `Procesando ${progress.processed + progress.failed}/${total} empresas\n• Correctos: ${progress.processed}\n• Errores: ${progress.failed}\n\nPuede continuar navegando, la operación sigue en segundo plano.`
        );
        setActiveBoaJob((prev) => {
          if (!prev) return prev;
          return { ...prev, processed: progress.processed, failed: progress.failed };
        });

        // Save intermediate results when new batch data is available
        const currentCompanies = progress.result?.valid_companies?.length || 0;
        const tab = boaTabRef.current;
        const pData = parsedDataRef.current;
        if (currentCompanies > lastSavedCompanies && tab === "subsectores" && pData) {
          lastSavedCompanies = currentCompanies;
          try {
            const boaMap: Record<string, number> = {};
            progress.result.valid_companies.forEach((c: any) => {
              boaMap[c.ticker] = c.beta_unlevered;
            });
            pData.forEach((item: any) => {
              item.empresas_boa = item.empresas_boa || {};
              (item.empresas || []).forEach((emp: string) => {
                if (boaMap[emp] !== undefined) {
                  item.empresas_boa[emp] = boaMap[emp];
                }
              });
            });
            await MainService.createTemplateComplement({
              nombre: tab,
              fecha: new Date().toISOString(),
              data: [...pData],
            });
            // Refrescar la tabla para reflejar el progreso intermedio
            loadDataRef.current();
          } catch (e) {
            console.warn("Error saving intermediate BOA results", e);
          }
        } else if (progress.status === "running") {
          console.log(
            `BOA polling: skip save (saved: ${lastSavedCompanies}, current: ${currentCompanies}, tab: "${tab}", pData: ${!!pData}, liveTab: "${activeTabRef.current}")`
          );
        }

        if (progress.status === "completed") {
          setActiveBoaJob(null);
          return progress.result;
        }
        if (progress.status === "error") {
          setActiveBoaJob(null);
          throw new Error(
            progress.result?.error || "Error desconocido en el cálculo BOA"
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    } finally {
      boaPollingRef.current = false;
    }
  }, []);

  // Consultar jobs activos al montar el componente
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [jobs, complements] = await Promise.all([
          MainService.getActiveBoaJobs(),
          MainService.getTemplateComplements("subsectores"),
        ]);
        if (cancelled || !jobs?.length) return;
        const job = jobs[0];
        if (complements?.length) {
          const latest = complements.reduce((a: any, b: any) =>
            new Date(a.fecha || a.created_at) > new Date(b.fecha || b.created_at) ? a : b
          );
          parsedDataRef.current = Array.isArray(latest.data) ? latest.data : [];
        }
        boaTabRef.current = "subsectores";
        setActiveBoaJob({ jobId: job.id, total: job.total, processed: job.processed, failed: job.failed });
        startBoaPolling(job.id, job.total).catch(() => {});
      } catch {
        // Backend no disponible o no hay subsectores previos
      }
    })();
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

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
    if (resolveBoaRef.current) {
      resolveBoaRef.current(false);
      resolveBoaRef.current = null;
    }
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
  const [subsectoresData, setSubsectoresData] = useState<any[]>([]);

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
      setSubsectoresData(extractData("subsectores"));
    } catch (error) {
      console.error("Failed to load configuration data", error);
    } finally {
      setIsLoading(false);
    }
  };
  loadDataRef.current = loadData;

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

  const showBoaProgressModal = async () => {
    if (!activeBoaJob) return;
    let progress;
    try {
      progress = await MainService.getBoaProgress(activeBoaJob.jobId);
    } catch {
      return;
    }
    const isComplete = progress.status === "completed" || progress.status === "error";

    setBoaProgressText(
      isComplete
        ? progress.status === "completed"
          ? `Cálculo finalizado: ${progress.processed}/${activeBoaJob.total} empresas procesadas (${progress.failed} errores).`
          : `Error: ${progress.result?.error || "desconocido"}`
        : `Procesando ${progress.processed + progress.failed}/${activeBoaJob.total} empresas\n• Correctos: ${progress.processed}\n• Errores: ${progress.failed}\n\nPuede continuar navegando, la operación sigue en segundo plano.`
    );

    if (!isComplete) {
      startBoaPolling(activeBoaJob.jobId, activeBoaJob.total).catch(() => {});
    }

    setModalState({
      isOpen: true,
      title: isComplete ? "BOA Completado" : "Calculando BOA...",
      description: undefined,
      confirmText: isComplete ? "Cerrar" : "Cerrar y seguir",
      variant: "default",
      onConfirm: closeModal,
    });
  };



  const doImport = async (parsedData: any[], boaResult: any, tab: string) => {
    try {
      await MainService.createTemplateComplement({
        nombre: tab,
        fecha: new Date().toISOString(),
        data: parsedData,
      });

      const boaSummary = boaResult
        ? ` (BOA: ${boaResult.processed}/${boaResult.total})`
        : "";
      addToast("success", `Se importaron ${parsedData.length} registros.${boaSummary}`);
      loadData();
    } catch (err: any) {
      console.error("Error saving data", err);
      addToast("error", "Error al guardar los datos.");
    }
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

      let boaResult: any = null;

      if (activeTab === "subsectores") {
        const tickers = Array.from(
          new Set(
            parsedData.flatMap(
              (item: any) =>
                item.empresas?.filter((t: string) => t?.trim()) || []
            )
          )
        );

        if (tickers.length > 0) {
          // Preguntar al usuario si desea calcular BOA
          const shouldCalcBoa = await new Promise<boolean>((resolve) => {
            resolveBoaRef.current = resolve;
            setModalState({
              isOpen: true,
              title: "¿Calcular BOA?",
              description: `Se encontraron ${tickers.length} empresa(s) en el Excel.\n\n¿Desea calcular el Beta Unlevered (BOA) de cada una mediante Yahoo Finance?\n\nEsto puede tomar varios segundos. Puede cerrar esta ventana mientras se procesa y reabrir el progreso desde el indicador flotante.`,
              confirmText: "Calcular BOA",
              cancelText: "Omitir BOA",
              variant: "default",
              onConfirm: () => {
                resolveBoaRef.current?.(true);
                resolveBoaRef.current = null;
                closeModal();
              },
            });
          });

          if (!shouldCalcBoa) {
            await doImport(parsedData, null, activeTab);
            return;
          }

          parsedDataRef.current = parsedData;
          activeTabRef.current = activeTab;
          boaTabRef.current = activeTab;

          const { job_id } = await MainService.startSubsectoresBoa(tickers);
          setActiveBoaJob({ jobId: job_id, total: tickers.length, processed: 0, failed: 0 });
          setBoaProgressText(
            `Iniciando cálculo para ${tickers.length} empresas...`
          );
          setModalState({
            isOpen: true,
            title: "Calculando BOA...",
            description: undefined,
            confirmText: "Cerrar",
            variant: "default",
            onConfirm: closeModal,
          });

          try {
            boaResult = await startBoaPolling(job_id, tickers.length);
            closeModal();
            setActiveBoaJob(null);
            setBoaProgressText(null);

            const boaMap: Record<string, number> = {};
            (boaResult?.valid_companies || []).forEach((c: any) => {
              boaMap[c.ticker] = c.beta_unlevered;
            });

            parsedData.forEach((item: any) => {
              item.empresas_boa = item.empresas_boa || {};
              (item.empresas || []).forEach((emp: string) => {
                if (boaMap[emp] !== undefined) {
                  item.empresas_boa[emp] = boaMap[emp];
                }
              });
            });
          } catch (err) {
            closeModal();
            setActiveBoaJob(null);
            setBoaProgressText(null);
            console.warn("Error obteniendo BOA, se continuará sin BOA:", err);
          }
        }
      }

      await doImport(parsedData, boaResult, activeTab);
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
        >
          {boaProgressText && (
            <div key={boaProgressText} className="text-sm text-gray-500 whitespace-pre-wrap">
              {boaProgressText}
            </div>
          )}
          {activeBoaJob && !modalState.title.includes("Completado") && !modalState.title.includes("Error") && (
            <button
              onClick={async () => {
                await MainService.cancelBoaJob(activeBoaJob.jobId);
                await MainService.deleteBoaJob(activeBoaJob.jobId);
                setActiveBoaJob(null);
                setBoaProgressText("Cálculo cancelado.");
                closeModal();
              }}
              className="mt-3 w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              Cancelar cálculo
            </button>
          )}
        </ConfirmationModal>
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
            <button
              onClick={() => {
                setActiveFrequency("");
                setActiveTab("subsectores");
              }}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-medium ${
                activeTab === "subsectores"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Subsectores
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

          {activeTab === "subsectores" && (
            <SubsectoresTable
              data={subsectoresData}
              isLoading={isLoading}
              onDelete={createDeleteHandler(setSubsectoresData)}
            />
          )}
        </div>
      </div>

      {activeBoaJob && (() => {
        const attempted = activeBoaJob.processed + activeBoaJob.failed;
        const pct = activeBoaJob.total > 0
          ? Math.round((attempted / activeBoaJob.total) * 100)
          : 0;
        return (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
            <button
              onClick={async () => {
                await MainService.cancelBoaJob(activeBoaJob.jobId);
                await MainService.deleteBoaJob(activeBoaJob.jobId);
                setActiveBoaJob(null);
                setBoaProgressText("Cálculo cancelado.");
              }}
              className="flex items-center gap-1 px-3 py-3 rounded-full shadow-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              title="Cancelar cálculo BOA"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={showBoaProgressModal}
              className="flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all text-white font-medium"
              title="Ver progreso del cálculo BOA"
              style={{
                background: `linear-gradient(to right, #2563eb ${pct}%, rgba(37,99,235,0.3) ${pct}%)`,
              }}
            >
              <svg
                className="animate-spin h-4 w-4 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="text-sm">
                BOA {attempted}/{activeBoaJob.total}
              </span>
            </button>
          </div>
        );
      })()}
    </>
  );
};
