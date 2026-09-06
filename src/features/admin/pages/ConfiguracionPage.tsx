import React, { useState, useRef, useEffect, useCallback } from "react";
import { MainService } from "@/shared/services/main.service";
import {
  ToastStack,
  type ToastItem,
} from "@/shared/components/common/ToastStack";
import { ConfirmationModal } from "@/shared/components/common/ConfirmationModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BaseFinancialItem, DamodaranItem } from "@/shared/types"; // Fallback import
import { Upload, RefreshCw } from "lucide-react";

import { RfTable } from "./configuracion-tabs/RfTable";
import { EmbiTable } from "./configuracion-tabs/EmbiTable";
import { PrimaTable } from "./configuracion-tabs/PrimaTable";
import { IrTable } from "./configuracion-tabs/IrTable";
import { DamodaranTable } from "./configuracion-tabs/DamodaranTable";
import { TaxTable } from "./configuracion-tabs/TaxTable";
import { DevaluacionTable } from "./configuracion-tabs/DevaluacionTable";
import { RiesgoTable } from "./configuracion-tabs/RiesgoTable";
import { SubsectoresTable } from "./configuracion-tabs/SubsectoresTable";
import { BvlTable } from "./configuracion-tabs/BvlTable";

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
    "trimestral" | "anual" | "subsectores" | "kapital" | "bvl" | ""
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

        const stopReason = progress.result?.stop_reason || progress.result?.status_reason || null;
        const isDone = progress.status === "completed" || progress.status === "error";
        const fullyProcessed = (progress.processed + progress.failed) >= total;
        const finalLabel =
          isDone && fullyProcessed
            ? "Cálculo finalizado"
            : stopReason === "cancelado"
            ? "Cálculo cancelado"
            : stopReason === "abortado_por_proteccion_interna"
            ? "Cálculo abortado por protección interna"
            : "Cálculo interrumpido";

        setBoaProgressText(
          isDone
            ? `${finalLabel}: ${progress.processed}/${total} empresas procesadas (${progress.failed} errores).`
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
            const tickerInfoMap: Record<string, any> = {};
            progress.result.valid_companies.forEach((c: any) => {
              boaMap[c.ticker] = c.beta_unlevered;
              tickerInfoMap[c.ticker] = {
                name: c.company_name || c.ticker,
                beta_desapalancado: c.beta_unlevered ?? null,
                market_cap: c.market_cap ?? null,
                beta_apalancado: c.beta_levered ?? null,
                total_activos: c.total_assets ?? null,
                fx: c.fx_rate ?? null,
                activo_mercado: c.total_assets ?? null,
                sector: c.sector ?? null,
                subsector: c.subsector ?? null,
                country: c.country ?? null,
                listing_currency: c.listing_currency ?? null,
                reporting_currency: c.reporting_currency ?? null,
                debt_lt: c.debt_lt ?? null,
                debt_st: c.debt_st ?? null,
                debt_value: c.debt_value ?? null,
                equity_value: c.equity_value ?? null,
                dc_ratio: c.dc_ratio ?? null,
                effective_tax_rate: c.effective_tax_rate ?? null,
                pct_debt: c.pct_debt ?? null,
                pct_equity: c.pct_equity ?? null,
              };
            });
            pData.forEach((item: any) => {
              item.empresas_boa = item.empresas_boa || {};
              item.ticker_info = item.ticker_info || {};
              (item.empresas || []).forEach((emp: string) => {
                if (boaMap[emp] !== undefined) {
                  item.empresas_boa[emp] = boaMap[emp];
                }
                if (tickerInfoMap[emp]) {
                  item.ticker_info[emp] = tickerInfoMap[emp];
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
          throw new Error(progress.result?.error || `Error desconocido en el cálculo BOA (${stopReason || "sin razón"})`);
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

  // BVL Cotización
  type BvlCotizacionItem = {
    empresa: string;
    id: string;
    numero_acciones: number | null;
    capitalizacion_bursatil: number | null;
    valor_por_accion: number | null;
  };
  const [bvlData, setBvlData] = useState<BvlCotizacionItem[]>([]);
  const [bvlUploading, setBvlUploading] = useState(false);
  const bvlFileInputRef = useRef<HTMLInputElement>(null);

  // Kapital sensibilizaciones
  const [maxSensibilidad, setMaxSensibilidad] = useState<number>(3);
  const [loadingSens, setLoadingSens] = useState(true);
  const [savingSens, setSavingSens] = useState(false);

  useEffect(() => {
    const fetchKapitalSettings = async () => {
      try {
        const res = await MainService.getKapitalSettings();
        setMaxSensibilidad(res.max_sensibilizaciones ?? 3);
      } catch {
        // Silenciar
      } finally {
        setLoadingSens(false);
      }
    };
    fetchKapitalSettings();
  }, []);

  const handleSaveSens = async () => {
    setSavingSens(true);
    try {
      await MainService.updateKapitalSetting("max_sensibilizaciones", maxSensibilidad);
      addToast("success", "Límite de sensibilizaciones actualizado.");
    } catch {
      addToast("error", "Error al guardar el límite de sensibilizaciones.");
    } finally {
      setSavingSens(false);
    }
  };

  const handleDecrementSens = () => {
    setMaxSensibilidad((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncrementSens = () => {
    setMaxSensibilidad((prev) => (prev < 10 ? prev + 1 : prev));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBvlFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      addToast("error", "Solo se permiten archivos Excel o CSV");
      if (bvlFileInputRef.current) bvlFileInputRef.current.value = "";
      return;
    }

    setModalState({
      isOpen: true,
      title: "¿Importar Cotización BVL?",
      description: `Se importará el archivo "${file.name}". Se sobrescribirá la cotización BVL actual (${bvlData.length} empresas registradas).`,
      confirmText: "Importar",
      cancelText: "Cancelar",
      variant: "default",
      onConfirm: async () => {
        setModalState((prev) => ({ ...prev, isLoading: true }));
        await handleBvlUpload(file);
        setModalState((prev) => ({ ...prev, isLoading: false }));
        closeModal();
      },
    });

    if (bvlFileInputRef.current) bvlFileInputRef.current.value = "";
  };

  const handleBvlUpload = async (file: File) => {
    setBvlUploading(true);
    try {
      const res = await MainService.uploadBvlCotizacion(file);
      setBvlData(res.items || []);
      addToast("success", `Cotización BVL cargada: ${res.items?.length || 0} empresas.`);
    } catch (err: any) {
      addToast("error", err.message || "Error al cargar cotización BVL");
    } finally {
      setBvlUploading(false);
    }
  };

  const loadBvlCotizacion = async () => {
    try {
      const res = await MainService.getBvlCotizacion();
      setBvlData(res.items || []);
    } catch {
      // Silenciar
    }
  };

  // Load Data from API
  useEffect(() => {
    loadData();
  }, [activeTab]);

  useEffect(() => {
    if (activeFrequency === "bvl" && activeTab === "bvl") {
      loadBvlCotizacion();
    }
  }, [activeFrequency, activeTab]);

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
      title: isComplete ? "BOA en proceso" : "BOA en proceso",
      description: undefined,
      confirmText: isComplete ? "Cerrar" : "Cerrar y seguir",
      variant: "default",
      onConfirm: closeModal,
    });
  };



  const doImport = async (parsedData: any[], boaResult: any, tab: string) => {
    try {
      if (tab === "subsectores") {
        await MainService.createTemplateComplement({
          nombre: tab,
          fecha: new Date().toISOString(),
          data: parsedData,
        });
        addToast("success", `Se importaron ${parsedData.length} subsectores.`);
        loadData();
        return;
      }

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

    if (activeTab === "subsectores") {
      try {
        // 1. Parsear el Excel en el navegador (ancho "by subsectores" o largo Sector|Subsector|Empresa).
        const parsedData = await parseFinancialExcel(file, activeTab, activeFrequency);
        parsedDataRef.current = parsedData;
        boaTabRef.current = activeTab;

        // 2. Guardar la estructura AL INSTANTE para que la tabla muestre datos.
        await MainService.createTemplateComplement({
          nombre: activeTab,
          fecha: new Date().toISOString(),
          data: parsedData,
        });
        loadData();

        const allTickers = Array.from(
          new Set(
            parsedData
              .flatMap((item: any) => item.empresas || [])
              .map((t: string) => String(t || "").trim().toUpperCase())
              .filter(Boolean)
          )
        ) as string[];
        const missingBoa = allTickers.filter(
          (t) =>
            !parsedData.some(
              (item: any) =>
                item.empresas_boa?.[t] !== undefined &&
                item.empresas_boa?.[t] !== null &&
                String(item.empresas_boa?.[t]) !== ""
            )
        );

        if (missingBoa.length === 0) {
          addToast(
            "success",
            `Se importaron ${parsedData.length} subsectores (${allTickers.length} empresas con BOA incluido).`
          );
          return;
        }

        // 3. Calcular BOA solo para los tickers sin valor; el polling enriquece
        // parsedDataRef y lo guarda periódicamente (ver startBoaPolling).
        addToast(
          "success",
          `Se importaron ${parsedData.length} subsectores. Calculando BOA para ${missingBoa.length} empresas en segundo plano...`
        );
        try {
          const res = await MainService.startSubsectoresBoa(missingBoa);
          if (res?.message) addToast("info", res.message);
          if (res?.job_id) {
            setActiveBoaJob({
              jobId: res.job_id,
              total: res.total || missingBoa.length,
              processed: 0,
              failed: 0,
            });
            setBoaProgressText(`Iniciando cálculo para ${res.total || missingBoa.length} empresas...`);
            setModalState({
              isOpen: true,
              title: "BOA en proceso",
              description: undefined,
              confirmText: "Cerrar y seguir en segundo plano",
              variant: "default",
              onConfirm: closeModal,
            });
            startBoaPolling(res.job_id, res.total || missingBoa.length)
              .then(() => loadData())
              .catch(() => {});
          }
        } catch (boaErr) {
          console.warn("Estructura guardada, falló el cálculo BOA:", boaErr);
          addToast(
            "error",
            "Subsectores guardados, pero falló el cálculo BOA. Use “Recalcular BOA ponderado”."
          );
        }
      } catch (err: any) {
        console.error("Error processing Excel file", err);
        addToast(
          "error",
          typeof err?.message === "string" && err.message
            ? err.message
            : "Error al procesar el archivo Excel. Asegúrese de que el formato sea correcto."
        );
      } finally {
        e.target.value = "";
      }
      return;
    }

    try {
      const parsedData = await parseFinancialExcel(
        file,
        activeTab,
        activeFrequency
      );

      let boaResult: any = null;

      if (activeTab === "subsectores") {
        try {
          boaResult = await MainService.uploadSubsectoresBoa(file);

          if (boaResult?.message) {
            addToast("info", boaResult.message);
          }

          const debugRows = (boaResult?.valid_companies || []).slice(0, 5);

          const boaMap: Record<string, number> = {};
          const tickerInfoMap: Record<string, any> = {};
          debugRows.forEach((c: any) => {
            boaMap[c.ticker] = c.beta_unlevered;
            tickerInfoMap[c.ticker] = {
              name: c.company_name || c.ticker,
              beta_desapalancado: c.beta_unlevered ?? null,
              market_cap: c.market_cap ?? null,
              beta_apalancado: c.beta_levered ?? null,
              total_activos: c.total_assets ?? null,
              fx: c.fx_rate ?? null,
              activo_mercado: c.total_assets ?? null,
              sector: c.sector ?? null,
              subsector: c.subsector ?? null,
              country: c.country ?? null,
              listing_currency: c.listing_currency ?? null,
              reporting_currency: c.reporting_currency ?? null,
              debt_lt: c.debt_lt ?? null,
              debt_st: c.debt_st ?? null,
              debt_value: c.debt_value ?? null,
              equity_value: c.equity_value ?? null,
              dc_ratio: c.dc_ratio ?? null,
              effective_tax_rate: c.effective_tax_rate ?? null,
              pct_debt: c.pct_debt ?? null,
              pct_equity: c.pct_equity ?? null,
            };
          });

          parsedData.forEach((item: any) => {
            item.empresas_boa = item.empresas_boa || {};
            item.ticker_info = item.ticker_info || {};
            (item.empresas || []).forEach((emp: string) => {
              if (boaMap[emp] !== undefined) {
                item.empresas_boa[emp] = boaMap[emp];
              }
              if (tickerInfoMap[emp]) {
                item.ticker_info[emp] = tickerInfoMap[emp];
              }
            });
          });

          setModalState({
            isOpen: true,
            title: "BOA en proceso",
            description: `Se calcularon ${boaResult?.processed || 0} empresas de prueba.\n\nLos resultados no se guardaron en la base de datos. Solo se muestran en este modal.`,
            confirmText: "Cerrar",
            cancelText: "Cerrar",
            variant: "default",
            onConfirm: closeModal,
          });

          return;
        } catch (err) {
          console.warn("Error obteniendo BOA de depuración, se continuará sin BOA:", err);
          return;
        }

        /*
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

          if (shouldCalcBoa) {
            // Asignar las referencias ANTES de iniciar el job
            parsedDataRef.current = parsedData;
            boaTabRef.current = activeTab;

            const { job_id, message, total } = await MainService.startSubsectoresBoa(tickers);

            // Mostrar el mensaje informativo del backend
            if (message) {
              addToast("info", message);
            }

            if (job_id) {
              setActiveBoaJob({ jobId: job_id, total: total, processed: 0, failed: 0 });
              setBoaProgressText(`Iniciando cálculo para ${total} empresas...`);
              setModalState({
                isOpen: true,
                title: "BOA en proceso",
                description: undefined,
                confirmText: "Cerrar y seguir en segundo plano",
                variant: "default",
                onConfirm: closeModal,
              });

              try {
                boaResult = await startBoaPolling(job_id, total);
                closeModal();
                setActiveBoaJob(null);
                setBoaProgressText(null);

                const boaMap: Record<string, number> = {};
                const tickerInfoMap: Record<string, any> = {};
                (boaResult?.valid_companies || []).forEach((c: any) => {
                  boaMap[c.ticker] = c.beta_unlevered;
                  tickerInfoMap[c.ticker] = {
                    name: c.company_name || c.ticker,
                    beta_desapalancado: c.beta_unlevered ?? null,
                    market_cap: c.market_cap ?? null,
                    beta_apalancado: c.beta_levered ?? null,
                    total_activos: c.total_assets ?? null,
                    fx: c.fx_rate ?? null,
                  };
                });

                parsedData.forEach((item: any) => {
                  item.empresas_boa = item.empresas_boa || {};
                  item.ticker_info = item.ticker_info || {};
                  (item.empresas || []).forEach((emp: string) => {
                    if (boaMap[emp] !== undefined) {
                      item.empresas_boa[emp] = boaMap[emp];
                    }
                    if (tickerInfoMap[emp]) {
                      item.ticker_info[emp] = tickerInfoMap[emp];
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
        } else {
          // Si el usuario omite el cálculo de BOA, importa los datos directamente.
          await doImport(parsedData, null, activeTab);
          return;
        }
        */
      }

      // Importar los datos finales solo si hubo un resultado de BOA
      // o si no se trataba de una importación de subsectores.
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
            <div className="mt-3 space-y-2">
              <button
                onClick={async () => {
                  await MainService.cancelBoaJob(activeBoaJob.jobId);
                  await MainService.deleteBoaJob(activeBoaJob.jobId);
                  setActiveBoaJob(null);
                  setBoaProgressText("Cálculo cancelado.");
                  closeModal();
                }}
                className="w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
              >
                Cancelar cálculo
              </button>
              <button
                onClick={() => {
                  closeModal();
                }}
                className="w-full px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                Correr en segundo plano
              </button>
            </div>
          )}
        </ConfirmationModal>
        <ToastStack toasts={toasts} onDismiss={removeToast} />

        {/* TABS GENERALES */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setActiveFrequency("trimestral");
                setActiveTab("rf");
              }}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
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
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeFrequency === "anual"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Indicadores Anuales
            </button>
            <button
              onClick={() => {
                setActiveFrequency("subsectores");
                setActiveTab("subsectores");
              }}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeFrequency === "subsectores"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Subsectores
            </button>
            <button
              onClick={() => {
                setActiveFrequency("kapital");
                setActiveTab("kapital");
              }}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeFrequency === "kapital"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Límite de sensibilizaciones
            </button>
            <button
              onClick={() => {
                setActiveFrequency("bvl");
                setActiveTab("bvl");
              }}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeFrequency === "bvl"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              Cotización en la BVL
            </button>
          </div>

          {activeFrequency !== "kapital" && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => processExcel(e, activeTab)}
                className="hidden"
                accept=".xlsx, .xls, .csv"
                disabled={false}
              />
              <input
                type="file"
                ref={bvlFileInputRef}
                onChange={handleBvlFileSelect}
                className="hidden"
                accept=".xlsx,.xls,.csv"
              />
              <button
                onClick={() => {
                  if (activeFrequency === "bvl") {
                    bvlFileInputRef.current?.click();
                  } else {
                    handleImportClick();
                  }
                }}
                disabled={false}
                className="inline-flex items-center px-4 py-2 text-xs sm:text-sm border border-gray-300 shadow-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importar Excel ({activeFrequency === "bvl" ? "BVL" : activeTab.toUpperCase()})
              </button>
              {activeFrequency === "subsectores" && (
                <button
                  onClick={async () => {
                    const allTickers = subsectoresData.flatMap((item: any) => item.empresas || []).filter((t: string) => t?.trim());
                    const unique = Array.from(new Set(allTickers.map((t: string) => t.trim().toUpperCase()))).filter(Boolean) as string[];
                    if (unique.length === 0) {
                      addToast("error", "No hay empresas registradas para recalcular.");
                      return;
                    }
                    try {
                      const res = await MainService.startSubsectoresBoa(unique);
                      if (res?.job_id) {
                        setActiveBoaJob({ jobId: res.job_id, total: res.total || unique.length, processed: 0, failed: 0 });
                        startBoaPolling(res.job_id, res.total || unique.length).catch(() => {});
                        addToast("info", `Recalculando BOA ponderado para ${unique.length} empresas seleccionadas — sin re-subir Excel.`);
                      } else if (res?.message) {
                        addToast("info", res.message);
                      }
                    } catch (err: any) {
                      addToast("error", err.message || "Error al recalcular BOA ponderado.");
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 text-xs sm:text-sm border border-blue-200 shadow-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Recalcular BOA ponderado
                </button>
              )}
            </div>
          )}
        </div>

        {/* TABS INFERIORES (solo para trimestral y anual) */}
        {(activeFrequency === "trimestral" || activeFrequency === "anual") && (
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
        )}

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

          {activeTab === "kapital" && (
            <div className="max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="text-[11px] font-bold tracking-widest text-blue-600 uppercase mb-4 border-b border-slate-100">
                Límite de sensibilizaciones
              </h2>
              <div className="flex flex-col gap-4">
                <div>
                  <Label htmlFor="maxSens" className="mb-1.5 block text-xs font-semibold text-slate-600 uppercase">
                    Límite de Sensibilizaciones permitidas
                  </Label>
                  <p className="text-[10px] text-gray-500 mb-2">
                    Define cuántos escenarios de sensibilización puede crear un usuario antes de bloquear el botón.
                  </p>
                  <div className="flex items-center w-fit border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm mt-3">
                    <button type="button" onClick={handleDecrementSens} disabled={maxSensibilidad <= 1 || loadingSens} className="px-4 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors border-r border-slate-200 cursor-pointer disabled:cursor-not-allowed">
                      <i className="fa-solid fa-minus text-xs"></i>
                    </button>
                    <Input id="maxSens" type="number" min={1} max={10} value={maxSensibilidad} disabled={loadingSens} onChange={(e) => { const val = parseInt(e.target.value); if (!isNaN(val)) setMaxSensibilidad(val); }} className="h-9 w-16 border-0 rounded-none text-center focus-visible:ring-0 p-0 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    <button type="button" onClick={handleIncrementSens} disabled={maxSensibilidad >= 10 || loadingSens} className="px-4 py-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 transition-colors border-l border-slate-200 cursor-pointer disabled:cursor-not-allowed">
                      <i className="fa-solid fa-plus text-xs"></i>
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveSens} disabled={savingSens || loadingSens} className="bg-blue-600 text-sm h-9 px-6 text-white hover:bg-blue-700 cursor-pointer">
                    {savingSens ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bvl" && (
            <div className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="text-[11px] font-bold tracking-widest text-blue-600 uppercase mb-4 border-b border-slate-100">
                Cotización en la BVL
              </h2>

              <BvlTable
                data={bvlUploading ? [] : bvlData}
                isLoading={bvlUploading}
                onDelete={(item) =>
                  setModalState({
                    isOpen: true,
                    title: "¿Eliminar empresa?",
                    description: `Se eliminará "${item.empresa}" de la cotización BVL.`,
                    confirmText: "Eliminar",
                    cancelText: "Cancelar",
                    variant: "destructive",
                    onConfirm: async () => {
                      setModalState((prev) => ({ ...prev, isLoading: true }));
                      try {
                        const res = await MainService.deleteBvlEmpresa({
                          empresa: item.empresa,
                          id: item.id,
                        });
                        setBvlData(res.items || []);
                        addToast("success", `Empresa "${item.empresa}" eliminada.`);
                      } catch (err: any) {
                        addToast("error", err.message || "Error al eliminar la empresa.");
                      } finally {
                        setModalState({ isOpen: false, title: "" });
                      }
                    },
                  })
                }
              />
            </div>
          )}
        </div>
      </div>

      {activeBoaJob && (() => {
        const attempted = activeBoaJob.processed + activeBoaJob.failed;
        const pct = activeBoaJob.total > 0
          ? Math.round((attempted / activeBoaJob.total) * 100)
          : 0;
        return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          <div
            className="relative flex items-center rounded-full shadow-lg bg-white/80 backdrop-blur-sm border border-slate-200/80 text-slate-700 font-medium cursor-pointer overflow-hidden"
            onClick={showBoaProgressModal}
            title="Ver progreso del cálculo BOA"
          >
            <div
              className="absolute left-0 top-0 h-full bg-blue-500/20"
              style={{ width: `${pct}%`, transition: 'width 0.3s ease' }}
            />
            <div className="relative flex items-center gap-2 px-4 py-3">
              <svg
                className="animate-spin h-5 w-5 text-blue-600"
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
                Procesando BOA: {attempted}/{activeBoaJob.total}
              </span>
              <span className="text-xs font-bold text-blue-600 ml-1">({pct}%)</span>
            </div>
          </div>
          <button
            onClick={async () => {
              setModalState({
                isOpen: true,
                title: '¿Cancelar cálculo de BOA?',
                description: 'Esta acción detendrá el proceso actual de cálculo de tickers. No se guardará el progreso no finalizado.',
                confirmText: 'Sí, cancelar',
                cancelText: 'No, continuar',
                variant: 'destructive',
                onConfirm: async () => {
                  await MainService.cancelBoaJob(activeBoaJob.jobId);
                  await MainService.deleteBoaJob(activeBoaJob.jobId);
                  setActiveBoaJob(null);
                  setBoaProgressText("Cálculo cancelado por el usuario.");
                  addToast('info', 'El cálculo de BOA ha sido cancelado.');
                  closeModal();
                },
              });
            }}
            className="flex items-center justify-center h-12 w-12 rounded-full shadow-lg bg-white/80 hover:bg-red-500/80 backdrop-blur-sm border border-slate-200/80 text-slate-600 hover:text-white transition-all"
            title="Cancelar cálculo BOA"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        );
      })()}
    </>
  );
};
